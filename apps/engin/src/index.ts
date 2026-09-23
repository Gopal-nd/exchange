import { createClient } from "redis";
import { Orderbook, Side } from "./matchingEngin";

const book = new Orderbook("TATA-INR");
const redis = createClient();
await redis.connect();
console.log("engine connected to redis");

while (true) {
  const  res = await redis.brPop("order", 0);
  if (!res) continue;


  const { clientId, type, data } = JSON.parse(res.element);

  let result: unknown;
  let broadcast = false;

  if (type === "CREATE_ORDER") {
    result = book.addOrder(data.side as Side, data.price, data.quantity);
    broadcast = true;
  } else if (type === "CANCEL_ORDER") {
    result = { success: book.cancleOrder(data.orderId) };
    broadcast = true;
  } else if (type === "GET_DEPTH") {
    result = book.depth();
  } else {
    result = { error: "unknown type" };
  }

  // send response to backend
  await redis.lPush(`response:${clientId}`, JSON.stringify(result));

  // send this event fro every one via WebSocket
  if (broadcast) {
    await redis.publish("ws", JSON.stringify({
      symbol: "TATA-INR",
      depth: book.depth(),
      trades: type === "CREATE_ORDER" ? (result as { trades: unknown[] }).trades : [],
    }));
  }
  
}

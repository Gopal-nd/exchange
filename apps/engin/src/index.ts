import { createClient } from "redis";
import { Orderbook, Side } from "./matchingEngin";
import { loadSnapshot, saveSnapshot } from "./persist";

const book = new Orderbook("TATA-INR");

// Step 1: restore if we have a snapshot
const snap = loadSnapshot();
if (snap) {
  book.loadSnapshot(snap);
  console.log("restored from snapshot");
}

// save every 3s + on Ctrl+C
setInterval(() => saveSnapshot(book.getSnapshot()), 3000);
process.on("SIGINT", () => {
  saveSnapshot(book.getSnapshot());
  console.log("saved snapshot");
  process.exit(0);
});

const redis = createClient();
await redis.connect();
console.log("engine connected to redis");

while (true) {
  const res = await redis.brPop("order", 0);
  if (!res) continue;

  let clientId = "";
  try {
    const msg = JSON.parse(res.element);
    clientId = msg.clientId;
    const { type, data } = msg;

    let result: unknown;
    let broadcast = false;

    if (type === "CREATE_ORDER") {
      result = book.addOrder(data.side as Side, data.price, data.quantity, data.userId);
      broadcast = true;
    } else if (type === "CANCEL_ORDER") {
      result = { success: book.cancleOrder(data.orderId) };
      broadcast = true;
    } else if (type === "GET_DEPTH") {
      result = book.depth();
    } else if (type === "GET_BALANCE") {
      result = book.balances.get(data.userId);
    } else {
      result = { error: "unknown type" };
    }

    await redis.lPush(`response:${clientId}`, JSON.stringify(result));

    if (broadcast) {
      await redis.publish(
        "ws",
        JSON.stringify({
          symbol: "TATA-INR",
          depth: book.depth(),
          trades: type === "CREATE_ORDER" ? (result as { trades: unknown[] }).trades : [],
        })
      );
    }
  } catch (e) {
    console.error("engine error", e);
    if (clientId) {
      await redis.lPush(`response:${clientId}`, JSON.stringify({ error: String(e) }));
    }
  }
}

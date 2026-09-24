import { createClient } from "redis";
import { Orderbook, Side } from "./matchingEngin";
import {
  appendEvent,
  clearEvents,
  loadEvents,
  loadSnapshot,
  saveSnapshot,
} from "./persist";

const book = new Orderbook("TATA-INR");

function apply(type: string, data: any) {
  if (type === "CREATE_ORDER") {
    return book.addOrder(data.side as Side, data.price, data.quantity, data.userId, data.orderId);
  }
  if (type === "CANCEL_ORDER") {
    return { success: book.cancleOrder(data.orderId) };
  }
  if (type === "GET_DEPTH") return book.depth();
  if (type === "GET_BALANCE") return book.balances.get(data.userId);
  return { error: "unknown type" };
}

function flush() {
  saveSnapshot(book.getSnapshot());
  clearEvents(); // snapshot has everything up to now
}

// --- boot: snapshot, then replay events since last snapshot ---
const snap = loadSnapshot();
if (snap) {
  book.loadSnapshot(snap);
  console.log("restored from snapshot");
}
const events = loadEvents();
for (const ev of events) apply(ev.type, ev.data);
if (events.length) console.log(`replayed ${events.length} events`);

setInterval(flush, 3000);
process.on("SIGINT", () => {
  flush();
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
      data.orderId = crypto.randomUUID(); // stable id for replay
      result = apply(type, data);
      appendEvent({ type, data }); // log after success
      broadcast = true;
    } else if (type === "CANCEL_ORDER") {
      result = apply(type, data);
      appendEvent({ type, data });
      broadcast = true;
    } else {
      result = apply(type, data);
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

import { createClient } from "redis";
import { Balances } from "./balances";
import { Orderbook, Side } from "./matchingEngin";
import {
  appendEvent,
  clearEvents,
  loadEvents,
  loadSnapshot,
  saveSnapshot,
} from "./persist";

const MARKETS = ["TATA-INR", "ICICI-INR"];
const balances = new Balances();
const books: Record<string, Orderbook> = {};
for (const m of MARKETS) books[m] = new Orderbook(m, balances);

function book(symbol: string) {
  const b = books[symbol];
  if (!b) throw new Error(`unknown market: ${symbol}`);
  return b;
}

function apply(type: string, data: any) {
  if (type === "CREATE_ORDER") {
    return book(data.symbol).addOrder(
      data.side as Side,
      data.price,
      data.quantity,
      data.userId,
      data.orderId
    );
  }
  if (type === "CANCEL_ORDER") {
    return { success: book(data.symbol).cancleOrder(data.orderId) };
  }
  if (type === "GET_DEPTH") return book(data.symbol).depth();
  if (type === "GET_BALANCE") return balances.get(data.userId);
  if (type === "GET_MARKETS") return MARKETS;
  return { error: "unknown type" };
}

function getEngineSnapshot() {
  return {
    balances: balances.toJSON(),
    books: Object.fromEntries(
      Object.entries(books).map(([k, b]) => [k, b.getSnapshot()])
    ),
  };
}

function loadEngineSnapshot(snap: any) {
  if (snap?.balances) balances.load(snap.balances);
  if (snap?.books) {
    for (const [sym, s] of Object.entries(snap.books) as [string, any][]) {
      if (books[sym]) books[sym].loadSnapshot(s);
    }
  } else if (snap?.symbol && books[snap.symbol]) {
    // old single-book snapshot
    books[snap.symbol].loadSnapshot(snap);
    if (snap.balances) balances.load(snap.balances);
  }
}

function flush() {
  saveSnapshot(getEngineSnapshot());
  clearEvents();
}

const snap = loadSnapshot();
if (snap) {
  loadEngineSnapshot(snap);
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
      data.orderId = crypto.randomUUID();
      result = apply(type, data);
      appendEvent({ type, data });
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
          symbol: data.symbol,
          depth: book(data.symbol).depth(),
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

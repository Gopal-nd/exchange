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
  if (type === "INIT_USER") {
    balances.initUser(data.userId);
    return { ok: true };
  }
  if (type === "ON_RAMP") {
    balances.credit(data.userId, data.asset, data.amount);
    return { ok: true, balances: balances.get(data.userId) };
  }
  if (type === "OFF_RAMP") {
    balances.debit(data.userId, data.asset, data.amount);
    return { ok: true, balances: balances.get(data.userId) };
  }
  if (type === "CREATE_ORDER") {
    return book(data.symbol).addOrder(
      data.side as Side,
      data.price ?? 0,
      data.quantity,
      data.userId,
      data.orderId,
      data.orderType === "MARKET" ? "MARKET" : "LIMIT"
    );
  }
  if (type === "CANCEL_ORDER") {
    return { success: book(data.symbol).cancleOrder(data.orderId) };
  }
  if (type === "GET_DEPTH") return book(data.symbol).depth();
  if (type === "GET_TRADES") return book(data.symbol).getTrades().slice(-30).reverse();
  if (type === "GET_OPEN_ORDERS") {
    return Object.values(books).flatMap((b) => b.openOrders(data.userId));
  }
  if (type === "GET_MY_FILLS") {
    return Object.values(books)
      .flatMap((b) => b.tradesFor(data.userId))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 50);
  }
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

const MUTATE = new Set([
  "CREATE_ORDER",
  "CANCEL_ORDER",
  "ON_RAMP",
  "OFF_RAMP",
  "INIT_USER",
]);

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
    } else if (MUTATE.has(type)) {
      result = apply(type, data);
      appendEvent({ type, data });
      if (type === "CANCEL_ORDER") broadcast = true;
    } else {
      result = apply(type, data);
    }

    await redis.lPush(`response:${clientId}`, JSON.stringify(result));

    if (broadcast && data.symbol) {
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

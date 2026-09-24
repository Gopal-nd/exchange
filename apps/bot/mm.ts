/**
 * Market-making bot — 5 makers + 5 takers, fast book churn.
 *
 *   bun run apps/bot/mm.ts
 *
 * Accounts (password = userId + "-pass"):
 *   mm-maker-1 … mm-maker-5
 *   mm-taker-1 … mm-taker-5
 */
const API = process.env.API_URL ?? "http://localhost:3000";
const MARKETS = ["TATA-INR", "ICICI-INR"];
const TICK_MS = Number(process.env.MM_TICK_MS ?? 10);
const N = 5;

type Account = { userId: string; password: string };
type Depth = { bids: [number, number][]; asks: [number, number][] };

const makers: Account[] = Array.from({ length: N }, (_, i) => ({
  userId: `mm-maker-${i + 1}`,
  password: `mm-maker-${i + 1}-pass`,
}));
const takers: Account[] = Array.from({ length: N }, (_, i) => ({
  userId: `mm-taker-${i + 1}`,
  password: `mm-taker-${i + 1}-pass`,
}));
const all = [...makers, ...takers];

async function req<T = any>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json() as Promise<T>;
}

async function ensureUser({ userId, password }: Account) {
  const login = await req<{ userId?: string; error?: string }>("POST", "/auth/login", {
    userId,
    password,
  });
  if (login.userId) return;
  const reg = await req<{ userId?: string; error?: string }>("POST", "/auth/register", {
    userId,
    password,
  });
  if (reg.error && !String(reg.error).includes("already")) {
    throw new Error(`register ${userId}: ${reg.error}`);
  }
}

async function topUp(userId: string) {
  const bal = await req<Record<string, { available: number }>>("GET", `/balance?userId=${userId}`);
  const need: Record<string, number> = { INR: 10_000_000, TATA: 200_000, ICICI: 200_000 };
  await Promise.all(
    Object.entries(need).map(async ([asset, min]) => {
      const avail = bal[asset]?.available ?? 0;
      if (avail < min) {
        await req("POST", "/deposit", { userId, asset, amount: min });
      }
    })
  );
}

async function place(
  userId: string,
  symbol: string,
  side: "BUY" | "SELL",
  price: number,
  quantity: number,
  orderType: "LIMIT" | "MARKET" = "LIMIT"
) {
  return req("POST", "/order", {
    userId,
    symbol,
    side,
    price: orderType === "LIMIT" ? price : undefined,
    quantity,
    orderType,
  });
}

async function cancelOpen(userId: string) {
  const open = await req<{ orderId: string; symbol: string }[]>(
    "GET",
    `/orders/open?userId=${userId}`
  );
  await Promise.all(
    (open ?? []).map((o) => req("DELETE", "/order", { orderId: o.orderId, symbol: o.symbol }))
  );
}

async function mid(symbol: string, fallback: number) {
  const d = await req<Depth>("GET", `/depth?symbol=${symbol}`);
  const bid = d.bids?.[0]?.[0];
  const ask = d.asks?.[0]?.[0];
  if (bid && ask) return (bid + ask) / 2;
  if (bid) return bid;
  if (ask) return ask;
  return fallback;
}

function jitter(n: number, pct = 0.012) {
  return n * (1 + (Math.random() * 2 - 1) * pct);
}

function round(p: number) {
  return Math.max(1, Math.round(p * 100) / 100);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

const mids: Record<string, number> = {
  "TATA-INR": 100,
  "ICICI-INR": 200,
};

console.log(`mm bot → ${API}  tick=${TICK_MS}ms  makers=${N} takers=${N}`);
for (const a of all) {
  await ensureUser(a);
  await topUp(a.userId);
  console.log(`  ${a.userId} / ${a.password}`);
}
console.log("accounts ready");

let tick = 0;
while (true) {
  tick++;
  try {
    for (const sym of MARKETS) {
      mids[sym] = round(jitter(await mid(sym, mids[sym]), 0.01));
    }

    // cancel a rotating subset so book stays fresh without blocking every tick
    if (tick % 3 === 0) {
      const who = pick(makers);
      await cancelOpen(who.userId);
    }

    const jobs: Promise<unknown>[] = [];

    for (const sym of MARKETS) {
      const m = mids[sym];
      const baseSpread = Math.max(0.4, m * 0.003);

      // every maker posts slightly different levels → denser book
      for (let i = 0; i < makers.length; i++) {
        const maker = makers[i]!;
        const skew = (i - 2) * 0.15; // spread makers across price ladder
        const spread = baseSpread * (1 + i * 0.25);
        const bid = round(m - spread + skew);
        const ask = round(m + spread + skew);
        const qty = 1 + Math.floor(Math.random() * 4);
        jobs.push(place(maker.userId, sym, "BUY", bid, qty));
        jobs.push(place(maker.userId, sym, "SELL", ask, qty));
        jobs.push(place(maker.userId, sym, "BUY", round(bid - spread), qty + 2));
        jobs.push(place(maker.userId, sym, "SELL", round(ask + spread), qty + 2));
      }

      // all takers aggressively cross — high trade rate
      for (const taker of takers) {
        if (Math.random() < 0.7) {
          const buy = Math.random() < 0.5;
          const takeQty = 1 + Math.floor(Math.random() * 3);
          const px = buy ? round(m + baseSpread) : round(m - baseSpread);
          jobs.push(place(taker.userId, sym, buy ? "BUY" : "SELL", px, takeQty));
        }
        if (Math.random() < 0.25) {
          const buy = Math.random() < 0.5;
          jobs.push(place(taker.userId, sym, buy ? "BUY" : "SELL", 0, 1, "MARKET"));
        }
      }
    }

    await Promise.all(jobs);

    if (tick % 20 === 0) {
      console.log(`#${tick}`, MARKETS.map((s) => `${s}=${mids[s]}`).join("  "));
      await Promise.all(all.map((a) => topUp(a.userId)));
    }
  } catch (e) {
    console.error("tick error", e);
  }

  await Bun.sleep(TICK_MS);
}

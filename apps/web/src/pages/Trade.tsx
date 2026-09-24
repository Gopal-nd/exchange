import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  keys,
  useBalance,
  useDepth,
  useMarkets,
  usePlaceOrder,
  useTrades,
  type Trade,
} from "../api";

const WS = "ws://localhost:3002";
const field =
  "mt-1 w-full rounded-md border border-line bg-panel px-2.5 py-2 text-sm outline-none focus:border-ink";
const label = "flex flex-col text-[11px] font-medium uppercase tracking-wide text-muted";
const panel = "rounded-xl border border-line bg-panel p-4";
const h2 = "mb-3 text-xs font-semibold uppercase tracking-wider text-muted";

export default function TradePage() {
  const userId = localStorage.getItem("userId") || "";
  const qc = useQueryClient();
  const [symbol, setSymbol] = useState("TATA-INR");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [orderType, setOrderType] = useState<"LIMIT" | "MARKET">("LIMIT");
  const [price, setPrice] = useState("100");
  const [qty, setQty] = useState("1");
  const [msg, setMsg] = useState("");
  const [wsOk, setWsOk] = useState(false);

  const marketsQ = useMarkets();
  const depthQ = useDepth(symbol);
  const tradesQ = useTrades(symbol);
  const balanceQ = useBalance(userId);
  const place = usePlaceOrder();

  const markets = marketsQ.data ?? [];
  const depth = depthQ.data ?? { bids: [], asks: [] };
  const trades = tradesQ.data ?? [];
  const balances = balanceQ.data ?? {};

  useEffect(() => {
    if (markets[0] && !markets.includes(symbol)) setSymbol(markets[0]);
  }, [markets, symbol]);

  useEffect(() => {
    if (!userId) return;
    const ws = new WebSocket(WS);
    ws.onopen = () => setWsOk(true);
    ws.onclose = () => setWsOk(false);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "connected") return;
      // Market data comes over WS — update cache only, no HTTP
      if (data.symbol !== symbol) return;
      if (data.depth) qc.setQueryData(keys.depth(symbol), data.depth);
      if (data.trades?.length) {
        qc.setQueryData(keys.trades(symbol), (prev: Trade[] | undefined) =>
          [...data.trades].reverse().concat(prev ?? []).slice(0, 30)
        );
      }
    };
    return () => ws.close();
  }, [symbol, userId, qc]);

  if (!userId) return <Navigate to="/login" replace />;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    place.mutate(
      {
        symbol,
        side,
        quantity: Number(qty),
        userId,
        orderType,
        ...(orderType === "LIMIT" ? { price: Number(price) } : {}),
      },
      {
        onSuccess: (res) => {
          if (res.error) {
            setMsg(String(res.error));
            return;
          }
          setMsg(
            res.trades?.length
              ? `${orderType} filled ${res.trades.length} trade(s)`
              : `Resting limit ${res.orderId?.slice(0, 8)}…`
          );
        },
        onError: (err: any) =>
          setMsg(err?.response?.data?.error ?? err.message ?? "Order failed"),
      }
    );
  }

  function refresh() {
    qc.invalidateQueries({ queryKey: keys.depth(symbol) });
    qc.invalidateQueries({ queryKey: keys.trades(symbol) });
    qc.invalidateQueries({ queryKey: keys.balance(userId) });
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <nav className="mb-5 flex flex-wrap items-center gap-4 text-sm">
        <span className="font-medium">Trade</span>
        <Link to="/wallet" className="text-muted hover:text-ink">
          Wallet
        </Link>
        <Link to="/orders" className="text-muted hover:text-ink">
          Orders
        </Link>
        <span
          title="WebSocket"
          className={`size-2 rounded-full ${wsOk ? "bg-buy shadow-[0_0_0_3px_var(--color-buy-soft)]" : "bg-line"}`}
        />
        <button
          type="button"
          className="ml-auto text-muted underline"
          onClick={() => {
            localStorage.removeItem("userId");
            location.href = "/login";
          }}
        >
          Logout ({userId})
        </button>
      </nav>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className={label}>
          Market
          <select className={field} value={symbol} onChange={(e) => setSymbol(e.target.value)}>
            {markets.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={refresh}
          className="rounded-md border border-line bg-panel px-3 py-2 text-sm hover:border-ink"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <section className={panel}>
          <h2 className={h2}>Order book</h2>
          <div className="grid grid-cols-2 gap-3 font-mono text-sm tabular-nums">
            <div>
              <div className="mb-1 text-[11px] uppercase text-muted">Ask</div>
              {[...depth.asks].reverse().map(([p, q], i) => (
                <div
                  key={`a${i}`}
                  className="mb-0.5 flex justify-between rounded bg-sell-soft px-2 py-0.5 text-sell"
                >
                  <span>{p}</span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="mb-1 text-[11px] uppercase text-muted">Bid</div>
              {depth.bids.map(([p, q], i) => (
                <div
                  key={`b${i}`}
                  className="mb-0.5 flex justify-between rounded bg-buy-soft px-2 py-0.5 text-buy"
                >
                  <span>{p}</span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={panel}>
          <h2 className={h2}>Trades</h2>
          <div className="max-h-64 space-y-0.5 overflow-y-auto font-mono text-sm tabular-nums">
            {trades.length === 0 && <p className="text-sm text-muted">No trades yet</p>}
            {trades.map((t, i) => (
              <div key={`${t.timestamp}-${i}`} className="flex justify-between rounded bg-paper px-2 py-1">
                <span>{t.price}</span>
                <span className="text-muted">{t.quantity}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={panel}>
          <h2 className={h2}>Place order</h2>
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrderType("LIMIT")}
                className={`rounded-md border px-2 py-1.5 text-xs ${
                  orderType === "LIMIT" ? "border-ink bg-ink text-white" : "border-line"
                }`}
              >
                Limit
              </button>
              <button
                type="button"
                onClick={() => setOrderType("MARKET")}
                className={`rounded-md border px-2 py-1.5 text-xs ${
                  orderType === "MARKET" ? "border-ink bg-ink text-white" : "border-line"
                }`}
              >
                Market
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSide("BUY")}
                className={`rounded-md border px-3 py-2 text-sm ${
                  side === "BUY" ? "border-buy bg-buy text-white" : "border-line"
                }`}
              >
                Buy
              </button>
              <button
                type="button"
                onClick={() => setSide("SELL")}
                className={`rounded-md border px-3 py-2 text-sm ${
                  side === "SELL" ? "border-sell bg-sell text-white" : "border-line"
                }`}
              >
                Sell
              </button>
            </div>
            {orderType === "LIMIT" && (
              <label className={label}>
                Price
                <input className={field} value={price} onChange={(e) => setPrice(e.target.value)} />
              </label>
            )}
            <label className={label}>
              Qty
              <input className={field} value={qty} onChange={(e) => setQty(e.target.value)} />
            </label>
            <button
              type="submit"
              disabled={place.isPending}
              className={`rounded-md border px-3 py-2 text-sm text-white disabled:opacity-60 ${
                side === "BUY" ? "border-buy bg-buy" : "border-sell bg-sell"
              }`}
            >
              {orderType} {side}
            </button>
          </form>
          {msg && <p className="mt-3 text-sm text-muted">{msg}</p>}
        </section>

        <section className={panel}>
          <h2 className={h2}>Balances</h2>
          <table className="w-full text-sm tabular-nums">
            <thead>
              <tr className="border-b border-line text-left text-[11px] uppercase text-muted">
                <th className="pb-2 font-medium">Asset</th>
                <th className="pb-2 font-medium">Avail</th>
                <th className="pb-2 font-medium">Locked</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(balances).map(([asset, w]) => (
                <tr key={asset} className="border-b border-line">
                  <td className="py-2">{asset}</td>
                  <td className="py-2">{w.available}</td>
                  <td className="py-2">{w.locked}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link to="/wallet" className="mt-3 inline-block text-xs text-muted underline">
            Deposit / Withdraw →
          </Link>
        </section>
      </div>
    </div>
  );
}

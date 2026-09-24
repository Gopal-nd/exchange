import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useCancelOrder, useMyFills, useOpenOrders, type OpenOrder } from "../api";

export default function OrdersPage() {
  const userId = localStorage.getItem("userId") || "";
  const { data: open = [] } = useOpenOrders(userId);
  const { data: fills = [] } = useMyFills(userId);
  const cancel = useCancelOrder();
  const [msg, setMsg] = useState("");

  if (!userId) return <Navigate to="/login" replace />;

  function onCancel(o: OpenOrder) {
    cancel.mutate(
      { orderId: o.orderId, symbol: o.symbol },
      {
        onSuccess: (res) =>
          setMsg(res.success ? `Cancelled ${o.orderId.slice(0, 8)}…` : "Cancel failed"),
      }
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      <nav className="mb-6 flex gap-4 text-sm">
        <Link to="/trade" className="text-muted hover:text-ink">
          Trade
        </Link>
        <Link to="/wallet" className="text-muted hover:text-ink">
          Wallet
        </Link>
        <span className="font-medium">Orders</span>
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

      <h1 className="mb-4 text-2xl font-semibold">Your orders</h1>
      {msg && <p className="mb-3 text-sm text-muted">{msg}</p>}

      <section className="mb-6 rounded-xl border border-line bg-panel p-4">
        <h2 className="mb-3 text-xs font-semibold uppercase text-muted">Open</h2>
        {open.length === 0 && <p className="text-sm text-muted">No open orders</p>}
        <div className="space-y-2">
          {open.map((o) => (
            <div
              key={o.orderId}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line px-3 py-2 text-sm"
            >
              <span className="font-medium">{o.symbol}</span>
              <span className={o.side === "BUY" ? "text-buy" : "text-sell"}>{o.side}</span>
              <span className="tabular-nums">
                {o.remaining}/{o.quantity} @ {o.price}
              </span>
              <button
                type="button"
                onClick={() => onCancel(o)}
                disabled={cancel.isPending}
                className="rounded border border-line px-2 py-1 text-xs hover:border-ink disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-line bg-panel p-4">
        <h2 className="mb-3 text-xs font-semibold uppercase text-muted">Filled</h2>
        {fills.length === 0 && <p className="text-sm text-muted">No fills yet</p>}
        <div className="max-h-80 space-y-1 overflow-y-auto font-mono text-sm tabular-nums">
          {fills.map((t, i) => (
            <div key={i} className="flex justify-between gap-3 rounded bg-paper px-2 py-1.5">
              <span>{t.symbol}</span>
              <span className={t.side === "BUY" ? "text-buy" : "text-sell"}>{t.side}</span>
              <span>{t.price}</span>
              <span className="text-muted">{t.quantity}</span>
              <span className="text-[11px] text-muted">
                {new Date(t.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

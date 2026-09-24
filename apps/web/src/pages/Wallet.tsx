import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useBalance, useDeposit, useWithdraw } from "../api";

const field =
  "mt-1 w-full rounded-md border border-line bg-panel px-3 py-2 text-sm outline-none focus:border-ink";
const ASSETS = ["INR", "TATA", "ICICI"];

export default function WalletPage() {
  const userId = localStorage.getItem("userId") || "";
  const { data: balances = {} } = useBalance(userId);
  const deposit = useDeposit();
  const withdraw = useWithdraw();
  const [asset, setAsset] = useState("INR");
  const [amount, setAmount] = useState("1000");
  const [msg, setMsg] = useState("");

  if (!userId) return <Navigate to="/login" replace />;

  function ramp(kind: "in" | "out") {
    setMsg("");
    const mutation = kind === "in" ? deposit : withdraw;
    mutation.mutate(
      { userId, asset, amount: Number(amount) },
      {
        onSuccess: () => setMsg(kind === "in" ? "Deposit ok" : "Withdraw ok"),
        onError: (e: any) => setMsg(e?.response?.data?.error ?? e.message),
      }
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-6">
      <nav className="mb-6 flex gap-4 text-sm">
        <Link to="/trade" className="text-muted hover:text-ink">
          Trade
        </Link>
        <span className="font-medium">Wallet</span>
        <Link to="/orders" className="text-muted hover:text-ink">
          Orders
        </Link>
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

      <h1 className="mb-4 text-2xl font-semibold">Wallet</h1>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-line bg-panel p-4">
          <h2 className="mb-3 text-xs font-semibold uppercase text-muted">Balances</h2>
          <table className="w-full text-sm tabular-nums">
            <thead>
              <tr className="border-b border-line text-left text-[11px] uppercase text-muted">
                <th className="pb-2">Asset</th>
                <th className="pb-2">Available</th>
                <th className="pb-2">Locked</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(balances).map(([a, w]) => (
                <tr key={a} className="border-b border-line">
                  <td className="py-2">{a}</td>
                  <td className="py-2">{w.available}</td>
                  <td className="py-2">{w.locked}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="rounded-xl border border-line bg-panel p-4">
          <h2 className="mb-3 text-xs font-semibold uppercase text-muted">On-ramp / Off-ramp</h2>
          <label className="mb-3 block text-xs uppercase text-muted">
            Asset
            <select className={field} value={asset} onChange={(e) => setAsset(e.target.value)}>
              {ASSETS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </label>
          <label className="mb-3 block text-xs uppercase text-muted">
            Amount
            <input className={field} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => ramp("in")}
              disabled={deposit.isPending}
              className="rounded-md bg-buy py-2 text-sm text-white disabled:opacity-60"
            >
              Deposit
            </button>
            <button
              type="button"
              onClick={() => ramp("out")}
              disabled={withdraw.isPending}
              className="rounded-md bg-sell py-2 text-sm text-white disabled:opacity-60"
            >
              Withdraw
            </button>
          </div>
          {msg && <p className="mt-3 text-sm text-muted">{msg}</p>}
        </section>
      </div>
    </div>
  );
}

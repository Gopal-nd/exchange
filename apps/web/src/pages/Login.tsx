import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLogin, useRegister } from "../api";

const field =
  "mt-1 w-full rounded-md border border-line bg-panel px-3 py-2 text-sm outline-none focus:border-ink";

export default function LoginPage() {
  const nav = useNavigate();
  const login = useLogin();
  const register = useRegister();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");

  const mutation = mode === "login" ? login : register;
  const err =
    mutation.error &&
    ((mutation.error as any)?.response?.data?.error ?? (mutation.error as Error).message);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate(
      { userId, password },
      {
        onSuccess: (res) => {
          if (res.error) return;
          localStorage.setItem("userId", res.userId);
          nav("/trade");
        },
      }
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="mb-1 text-3xl font-semibold tracking-tight">Exchange</h1>
      <p className="mb-6 text-sm text-muted">
        {mode === "login" ? "Sign in to trade" : "Create an account"}
      </p>
      <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-line bg-panel p-5">
        <label className="block text-xs uppercase text-muted">
          User ID
          <input className={field} value={userId} onChange={(e) => setUserId(e.target.value)} required />
        </label>
        <label className="block text-xs uppercase text-muted">
          Password
          <input
            type="password"
            className={field}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {err && <p className="text-sm text-sell">{String(err)}</p>}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full rounded-md bg-ink py-2.5 text-sm text-white disabled:opacity-60"
        >
          {mutation.isPending ? "…" : mode === "login" ? "Login" : "Register"}
        </button>
      </form>
      <button
        type="button"
        className="mt-4 text-sm text-muted underline"
        onClick={() => {
          mutation.reset();
          setMode(mode === "login" ? "register" : "login");
        }}
      >
        {mode === "login" ? "Need an account? Register" : "Have an account? Login"}
      </button>
      <Link to="/trade" className="mt-2 text-center text-xs text-muted">
        Continue as guest (set user manually)
      </Link>
    </div>
  );
}

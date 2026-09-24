import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:3000" });

/* ── types ─────────────────────────────────────────── */

export type Depth = { bids: [number, number][]; asks: [number, number][] };
export type Balances = Record<string, { available: number; locked: number }>;

export type Trade = {
  price: number;
  quantity: number;
  timestamp: number;
  symbol?: string;
  side?: string;
  status?: string;
};

export type OpenOrder = {
  orderId: string;
  symbol: string;
  side: string;
  price: number;
  quantity: number;
  remaining: number;
  filled: number;
  status: string;
  timestamp: number;
};

export type PlaceOrderInput = {
  symbol: string;
  side: "BUY" | "SELL";
  price?: number;
  quantity: number;
  userId: string;
  orderType: "LIMIT" | "MARKET";
};

export type RampInput = { userId: string; asset: string; amount: number };
export type AuthInput = { userId: string; password: string };

/* ── query keys ────────────────────────────────────── */

export const keys = {
  markets: ["markets"] as const,
  depth: (symbol: string) => ["depth", symbol] as const,
  trades: (symbol: string) => ["trades", symbol] as const,
  balance: (userId: string) => ["balance", userId] as const,
  openOrders: (userId: string) => ["orders", "open", userId] as const,
  fills: (userId: string) => ["orders", "fills", userId] as const,
};

/* ── fetchers ──────────────────────────────────────── */

const fetchers = {
  markets: () => api.get<string[]>("/markets").then((r) => r.data),
  depth: (symbol: string) =>
    api.get<Depth>("/depth", { params: { symbol } }).then((r) => r.data),
  trades: (symbol: string) =>
    api.get<Trade[]>("/trades", { params: { symbol } }).then((r) => r.data),
  balance: (userId: string) =>
    api.get<Balances>("/balance", { params: { userId } }).then((r) => r.data),
  openOrders: (userId: string) =>
    api.get<OpenOrder[]>("/orders/open", { params: { userId } }).then((r) => r.data),
  fills: (userId: string) =>
    api.get<Trade[]>("/orders/fills", { params: { userId } }).then((r) => r.data),
};

/* ── query hooks ───────────────────────────────────── */

export function useMarkets() {
  return useQuery({
    queryKey: keys.markets,
    queryFn: fetchers.markets,
    staleTime: Infinity,
  });
}

/** Initial HTTP fetch; live updates come from WS via setQueryData */
export function useDepth(symbol: string) {
  return useQuery({
    queryKey: keys.depth(symbol),
    queryFn: () => fetchers.depth(symbol),
    enabled: !!symbol,
    staleTime: Infinity,
  });
}

export function useTrades(symbol: string) {
  return useQuery({
    queryKey: keys.trades(symbol),
    queryFn: () => fetchers.trades(symbol),
    enabled: !!symbol,
    staleTime: Infinity,
  });
}

export function useBalance(userId: string) {
  return useQuery({
    queryKey: keys.balance(userId),
    queryFn: () => fetchers.balance(userId),
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export function useOpenOrders(userId: string) {
  return useQuery({
    queryKey: keys.openOrders(userId),
    queryFn: () => fetchers.openOrders(userId),
    enabled: !!userId,
  });
}

export function useMyFills(userId: string) {
  return useQuery({
    queryKey: keys.fills(userId),
    queryFn: () => fetchers.fills(userId),
    enabled: !!userId,
  });
}

/* ── mutation hooks ────────────────────────────────── */

export function useLogin() {
  return useMutation({
    mutationFn: ({ userId, password }: AuthInput) =>
      api.post("/auth/login", { userId, password }).then((r) => r.data),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: ({ userId, password }: AuthInput) =>
      api.post("/auth/register", { userId, password }).then((r) => r.data),
  });
}

export function useDeposit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RampInput) => api.post("/deposit", body).then((r) => r.data),
    onSuccess: (data, { userId }) => {
      if (data.balances) qc.setQueryData(keys.balance(userId), data.balances);
      else qc.invalidateQueries({ queryKey: keys.balance(userId) });
    },
  });
}

export function useWithdraw() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RampInput) => api.post("/withdraw", body).then((r) => r.data),
    onSuccess: (data, { userId }) => {
      if (data.balances) qc.setQueryData(keys.balance(userId), data.balances);
      else qc.invalidateQueries({ queryKey: keys.balance(userId) });
    },
  });
}

export function usePlaceOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PlaceOrderInput) => api.post("/order", body).then((r) => r.data),
    onSuccess: (_data, { userId }) => {
      // depth/trades arrive via WS; only refresh user-scoped data
      qc.invalidateQueries({ queryKey: keys.balance(userId) });
      qc.invalidateQueries({ queryKey: keys.openOrders(userId) });
      qc.invalidateQueries({ queryKey: keys.fills(userId) });
    },
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, symbol }: { orderId: string; symbol: string }) =>
      api.delete("/order", { data: { orderId, symbol } }).then((r) => r.data),
    onSuccess: (_data, _vars, _ctx) => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

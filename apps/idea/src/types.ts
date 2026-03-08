// ── Constants ──────────────────────────────────────────────────────────────

const PRECISION   = 1e8; // 8 decimal places — all internal math in integers

// ── Precision helpers ──────────────────────────────────────────────────────
export function toInt(value: number): number {
  return Math.round(value * PRECISION);
}
export function toDecimal(value: number): number {
  return parseFloat((value / PRECISION).toFixed(2));
}

// ── Types ──────────────────────────────────────────────────────────────────
export type BookSide   = "bid" | "ask";
export type OrderSide  = "buy" | "sell";
export type OrderKind  = "ioc";
export type OrdereType  = "limit" | "market";
export type OrderStatus = "accepted" | "rejected";

export interface Order {
  orderId:  string;
  price:    number; // integer (scaled)
  quantity: number; // integer (scaled)
  side:     BookSide;
}

export interface Orderbook {
  bids: Order[];
  asks: Order[];
}

export interface BookWithQuantity {
  bids: Record<number, number>;
  asks: Record<number, number>;
}

export interface Fill {
  price:   number; // integer (scaled)
  qty:     number; // integer (scaled)
  tradeId: number;
}

export interface OrderResult {
  status:      OrderStatus;
  executedQty: number;
  fills:       Fill[];
}
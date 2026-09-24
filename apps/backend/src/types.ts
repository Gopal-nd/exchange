import { z } from "zod";

export enum Side {
  BUY = "BUY",
  SELL = "SELL",
}

export const OrderSchema = z.object({
  symbol: z.string(),
  side: z.enum([Side.BUY, Side.SELL]),
  price: z.coerce.number().optional(),
  quantity: z.coerce.number(),
  userId: z.string(),
  orderType: z.enum(["LIMIT", "MARKET"]).default("LIMIT"),
}).superRefine((v, ctx) => {
  if (v.orderType === "LIMIT" && (v.price === undefined || Number.isNaN(v.price))) {
    ctx.addIssue({ code: "custom", message: "price required for LIMIT", path: ["price"] });
  }
});

export type Order = z.infer<typeof OrderSchema>;

export const CancelOrderSchema = z.object({
  orderId: z.string(),
  symbol: z.string(),
});

export const AuthSchema = z.object({
  userId: z.string().min(1),
  password: z.string().min(1),
});

export const RampSchema = z.object({
  userId: z.string(),
  asset: z.string(),
  amount: z.coerce.number().positive(),
});

import {z} from "zod";

export enum Side {
  BUY = "BUY",
  SELL = "SELL",
}   

export const OrderSchema = z.object({
  symbol: z.string(),
  side: z.enum([Side.BUY, Side.SELL]),
  price: z.coerce.number(),
  quantity: z.coerce.number(),
  userId: z.string(),
})

export type Order = z.infer<typeof OrderSchema>;

export const CancelOrderSchema = z.object({
  orderId: z.string(),
})



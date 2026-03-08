import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { OrderInputSchema } from "./orderBook";
import { toDecimal, toInt, type BookWithQuantity, type Fill, type Orderbook, type OrderKind, type OrderResult, type OrderSide } from "./types";

const BASE_ASSET  = 'BTC';
const QUOTE_ASSET = 'USD';

// ── In-memory orderbook ────────────────────────────────────────────────────
const orderbook: Orderbook = { bids: [], asks: [] };
const bookWithQuantity: BookWithQuantity = { bids: {}, asks: {} };

// ── Swagger ────────────────────────────────────────────────────────────────
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title:       "BTC/USD Matching Engine",
      version:     "1.0.0",
      description: "A simple limit order book matching engine for BTC/USD",
    },
    servers: [{ url: "http://localhost:3000" }],
  },
  apis: [__filename],
});

// ── App ────────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

let GLOBAL_TRADE_ID = 0;

// ── Routes ─────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /order:
 *   get:
 *     summary: Get the current order book
 *     tags: [Orderbook]
 *     responses:
 *       200:
 *         description: Current state of the order book
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderbook:
 *                   type: object
 *                   properties:
 *                     bids:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *                     asks:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *                 bookWithQuantity:
 *                   type: object
 *                   properties:
 *                     bids:
 *                       type: object
 *                       additionalProperties:
 *                         type: number
 *                     asks:
 *                       type: object
 *                       additionalProperties:
 *                         type: number
 */
app.get("/order", (_req, res) => {
  res.json({
    orderbook: {
      bids: orderbook.bids.map(o => ({ ...o, price: toDecimal(o.price), quantity: toDecimal(o.quantity) })),
      asks: orderbook.asks.map(o => ({ ...o, price: toDecimal(o.price), quantity: toDecimal(o.quantity) })),
    },
    bookWithQuantity: {
      bids: Object.fromEntries(Object.entries(bookWithQuantity.bids).map(([p, q]) => [toDecimal(Number(p)), toDecimal(q)])),
      asks: Object.fromEntries(Object.entries(bookWithQuantity.asks).map(([p, q]) => [toDecimal(Number(p)), toDecimal(q)])),
    },
  });
});

/**
 * @openapi
 * /api/v1/order:
 *   post:
 *     summary: Place a buy or sell order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderInput'
 *     responses:
 *       200:
 *         description: Order result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *       400:
 *         description: Invalid request
 */
app.post('/api/v1/order', (req, res) => {
  const parsed = OrderInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).send(parsed.error.message);
    return;
  }

  const { baseAsset, quoteAsset, price, quantity, side, kind } = parsed.data;

  if (baseAsset !== BASE_ASSET || quoteAsset !== QUOTE_ASSET) {
    res.status(400).send('Invalid base or quote asset');
    return;
  }

  const orderId     = getOrderId();
  const intPrice    = toInt(price);
  const intQuantity = toInt(quantity);

  const { executedQty, fills } = fillOrder(orderId, intPrice, intQuantity, side, kind);

  res.send({
    orderId,
    executedQty: toDecimal(executedQty),
    fills: fills.map(f => ({
      price:   toDecimal(f.price),
      qty:     toDecimal(f.qty),
      tradeId: f.tradeId,
    })),
  });
});

/**
 * @openapi
 * components:
 *   schemas:
 *     OrderInput:
 *       type: object
 *       required: [baseAsset, quoteAsset, price, quantity, side, type]
 *       properties:
 *         baseAsset:
 *           type: string
 *           example: BTC
 *         quoteAsset:
 *           type: string
 *           example: USD
 *         price:
 *           type: number
 *           example: 50000
 *         quantity:
 *           type: number
 *           example: 0.5
 *         side:
 *           type: string
 *           enum: [buy, sell]
 *           example: buy
 *         type:
 *           type: string
 *           enum: [limit, market]
 *           example: limit
 *         kind:
 *           type: string
 *           enum: [ioc]
 *     OrderResponse:
 *       type: object
 *       properties:
 *         orderId:
 *           type: string
 *         executedQty:
 *           type: number
 *         fills:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Fill'
 *     Fill:
 *       type: object
 *       properties:
 *         price:
 *           type: number
 *         qty:
 *           type: number
 *         tradeId:
 *           type: number
 *     Order:
 *       type: object
 *       properties:
 *         orderId:
 *           type: string
 *         price:
 *           type: number
 *         quantity:
 *           type: number
 *         side:
 *           type: string
 *           enum: [bid, ask]
 */

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
  console.log('Swagger UI  → http://localhost:3000/docs');
});

// ── Matching engine ────────────────────────────────────────────────────────

function fillOrder(
  orderId:  string,
  price:    number,
  quantity: number,
  side:     OrderSide,
  kind?:    OrderKind
): OrderResult {
  const fills: Fill[] = [];
  let remainingQty = quantity;
  let executedQty  = 0;

  // Sort: asks ascending (best ask first), bids descending (best bid first)
  orderbook.asks.sort((a, b) => a.price - b.price);  // sellers assesnding 
  orderbook.bids.sort((a, b) => b.price - a.price);

  if (side === 'buy') {
    for (let i = 0; i < orderbook.asks.length && remainingQty > 0; i++) {
      const o = orderbook.asks[i]!
   
      if (o.price > price) break;

      const filledQty = Math.min(remainingQty, o.quantity);
      o.quantity -= filledQty;
      bookWithQuantity.asks[o.price] = (bookWithQuantity.asks[o.price] || 0) - filledQty;

      fills.push({ price: o.price, qty: filledQty, tradeId: GLOBAL_TRADE_ID++ });
      executedQty  += filledQty;
      remainingQty -= filledQty;

      if (o.quantity === 0) {
        orderbook.asks.splice(i--, 1);
        if (bookWithQuantity.asks[o.price] === 0) delete bookWithQuantity.asks[o.price];
      }
    }

    // this is wrong ,but ok for now 
    if (kind === 'ioc' && remainingQty > 0) return { status: 'rejected', executedQty, fills };

    if (remainingQty > 0) {
      orderbook.bids.push({ orderId, price, quantity: remainingQty, side: 'bid' });
      bookWithQuantity.bids[price] = (bookWithQuantity.bids[price] || 0) + remainingQty;
    }

  } else {
    for (let i = 0; i < orderbook.bids.length && remainingQty > 0; i++) {
      const o = orderbook.bids[i]!
      if (o.price < price) break;

      const filledQty = Math.min(remainingQty, o.quantity);
      o.quantity -= filledQty;
      bookWithQuantity.bids[o.price] = (bookWithQuantity.bids[o.price] || 0) - filledQty;

      fills.push({ price: o.price, qty: filledQty, tradeId: GLOBAL_TRADE_ID++ });
      executedQty  += filledQty;
      remainingQty -= filledQty;

      if (o.quantity === 0) {
        orderbook.bids.splice(i--, 1);
        if (bookWithQuantity.bids[o.price] === 0) delete bookWithQuantity.bids[o.price];
      }
    }

    if (kind === 'ioc' && remainingQty > 0) return { status: 'rejected', executedQty, fills };

    if (remainingQty > 0) {
      orderbook.asks.push({ orderId, price, quantity: remainingQty, side: 'ask' });
      bookWithQuantity.asks[price] = (bookWithQuantity.asks[price] || 0) + remainingQty;
    }
  }

  return { status: 'accepted', executedQty, fills };
}

function getOrderId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
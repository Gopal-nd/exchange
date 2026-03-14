
export const CREATE_ORDER = "CREATE_ORDER"; // create a order
export const CANCEL_ORDER = "CANCEL_ORDER";  // cancel a order
export const ON_RAMP = "ON_RAMP"; // on ramp 
export const GET_OPEN_ORDERS = "GET_OPEN_ORDERS";  // get all open orders

export const GET_DEPTH = "GET_DEPTH";  // get depth

export type MessageFromOrderbook = {
    type: "DEPTH",
    payload: {
        market: string, //BTC_USDC
        bids: [string, string][],
        asks: [string, string][],
    }
} | {
    type: "ORDER_PLACED",
    payload: {
        orderId: string, // order id
        executedQty: number,
        fills: [
            {
                price: string,
                qty: number,
                tradeId: number
            }
        ]
    }
} | {
    type: "ORDER_CANCELLED",
    payload: {
        orderId: string,
        executedQty: number,
        remainingQty: number
    }
} | {
    type: "OPEN_ORDERS",
    payload: {
        orderId: string,
        executedQty: number,
        price: string,
        quantity: string,
        side: "buy" | "sell",
        userId: string
    }[]
}
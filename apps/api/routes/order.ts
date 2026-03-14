import express from 'express'
import { RedisManager } from '../RedisManager';

export const orderRouter = express.Router()

orderRouter.post('/',async (req, res) => {
    
    const { market, price, quantity, side, userId } = req.body;
    console.log({ market, price, quantity, side, userId })

    const response = await RedisManager.getInstance().sendAndAwait({
        type:"CREATE_ORDER",
        data:{
            market,
            price,
            quantity,
            side,
            userId
        }
    })
    res.json(response.payload)
})



orderRouter.delete("/", async (req, res) => {
    const { orderId, market } = req.body;
    const response = await RedisManager.getInstance().sendAndAwait({
        type: 'CANCEL_ORDER',
        data: {
            orderId,
            market
        }
    });
    res.json(response.payload);
});

orderRouter.get("/open", async (req, res) => {
    const { userId, market } = req.query;
    const response = await RedisManager.getInstance().sendAndAwait({
        type: 'GET_OPEN_ORDERS',
        data: {
            userId: userId as string,
            market: market as string
        }
    });
    res.json(response.payload);
});
import express from 'express'
import { orderBook, orderBookWithQuantity } from './orderBook'
import { orderInputSchema } from './type'
const app = express()
const port = 3000
const BASE_ASSET = 'TATA'
const QUOTE_ASSET = 'INR'
let GLOBAL_TRADE_ID = 0

app.post('/api/v1/order',(req,res)=>{

    const order = orderInputSchema.safeParse(req.body)

    if(!order.success){
        return res.send(order.error)
    }

    const {baseAsset, quoteAsset, quantity, price, type, side, kind} = order.data

    console.log(req.body)

    if (baseAsset != BASE_ASSET && quoteAsset !=QUOTE_ASSET){
        return res.send('invalid assest')
    }
    const orderId = getOrderId()
    const {executedQty,fills,status} = fillOrderBook(orderId,quantity,price,side,kind)
    res.send({
        orderId,
        status,
        executedQty,
        fills
    })
})


interface Fills {
    'price':number,
    'qty':number,
    'tradeId':number
}
function fillOrderBook(orderId:string,q:number,price:number,side:'buy'|'sell',kind?:'ioc'){

    const fills:Fills[]=[]
    const maxFillQuantity = getFillAmount(price,q,side)
    let executedQty = 0

    if(kind == 'ioc' && maxFillQuantity <q){
        return {status:"rejected",executedQty :maxFillQuantity,fills:[]}
    }

    if(side == 'buy'){
     orderBook.asks.forEach(o=>{
        if(o.price <= price && q >0){
            const filledQuantity = Math.min(q,o.quantity)
            o.quantity -= filledQuantity;

            orderBookWithQuantity.asks[o.price] = (orderBookWithQuantity.asks[o.price]||0) - filledQuantity
            fills.push({
                price:o.price,
                qty:filledQuantity,
                tradeId:GLOBAL_TRADE_ID++
            })

            executedQty += filledQuantity;
            q -= filledQuantity
            if(o.quantity == 0){
                orderBook.asks.splice(orderBook.asks.indexOf(o),1)
            }
            if(orderBookWithQuantity.asks[price]===0){
                delete orderBookWithQuantity.asks[price]
            }
        }
     })
     if(q!=0){
        orderBook.bids.push({
            price,
            quantity:q-executedQty,
            side:'bid',
            orderId
        })
        orderBookWithQuantity.bids[price] = (orderBookWithQuantity.bids[price]||0)+(q)
     }
    }else{
        orderBook.bids.forEach(o =>{
            if(o.price >=price && q > 0){
                const filledQuantity = Math.min(q,o.quantity)
                o.quantity -= filledQuantity
                orderBookWithQuantity.bids[price] = (orderBookWithQuantity.bids[price]||0) - filledQuantity
                fills.push({
                    price:o.price,
                    qty:o.quantity,
                    tradeId:GLOBAL_TRADE_ID++
                })
                executedQty += filledQuantity
                q -= filledQuantity;

            if(o.quantity === 0)
                orderBook.bids.splice(orderBook.bids.indexOf(o),1)

            }
            if(orderBookWithQuantity.bids[price]==0){
                delete orderBookWithQuantity.bids[price]
            }
        })
        if(q!=0){
            orderBook.asks.push({
                price,
                quantity:q,
                side:'ask',
                orderId
            })
            orderBookWithQuantity.asks[price] = (orderBookWithQuantity.asks[price]||0) + q
        }
    }

     return {
        status: 'accepted',
        executedQty,
        fills
    }
}

function getFillAmount(price:number,quantity:number,side:'buy'|'sell'):number{
    let filled = 0
    if(side == 'buy'){
        orderBook.asks.forEach(o=>{
            if(o.price<=price){
                filled+=Math.min(quantity,o.quantity)
            }
        })
    }else{
        orderBook.bids.forEach(b=>{
            if(b.price >price){
                filled += Math.min(quantity,b.quantity)
            }
        })
    }
    return filled

}


function getOrderId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

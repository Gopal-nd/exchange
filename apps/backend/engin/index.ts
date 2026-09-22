import { bracketPairRange, retrieveRootparameters } from "elysia/dist/sucrose";

const pair = "TATA-INR"


enum Side {
    BUY = "BUY",
    SELL = "SELL"
}

interface Order {
    orderId:string;
    side:Side;
    price:number;
    quantity:number;
    remaining:number;
    timestamp:number;
}

interface Trade {
    price:number;
    quantity:number;
    timestamp:number;
    buyOrderId:string;
    sellOrderId:string;
}



class Orderbook {
    private symbol:string;
    private bids: Order[] = []; // highest price first
    private asks: Order[] = []; // lowest price first
    private trades: Trade[] = [];
    private orders: Map<string, Order> = new Map();

    constructor(symbol:string = "TATA-INR") {
        this.symbol = symbol;
    }

    addOrder(side:Side, price:number, quantity:number): Trade[] {
        const orderId = crypto.randomUUID();
        const order: Order = {
            orderId,
            side,
            price,
            quantity,
            remaining: quantity,
            timestamp: Date.now(),
        }
        
            let trades: Trade[] = [];

        // match logic here
        if(side === Side.BUY){
            trades = this.matchBuy(order);
            if(order.remaining > 0){
                this.orders.set(orderId, order);
                this.insertBid(order);
            }
        } else {
            trades = this.matchSell(order);
            if(order.remaining > 0){
                this.orders.set(orderId, order);
                this.insertAsk(order);
            }
        }
        
            this.trades.push(...trades);
            return trades;
    }

    private matchBuy(buy:Order):Trade[]{
        const trades:Trade[] = [];

        while(buy.remaining > 0 && this.asks.length > 0){
            const bestAsk = this.asks[0];

            if(buy.price < bestAsk.price) break;

            const qty = Math.min(buy.remaining,bestAsk.remaining);

            trades.push({
                price: bestAsk.price,
                quantity: qty,
                timestamp: Date.now(),
                buyOrderId: buy.orderId,
                sellOrderId: bestAsk.orderId,
            });

            buy.remaining -= qty;
            bestAsk.remaining -= qty;

            if(bestAsk.remaining === 0){
                this.asks.shift();
                this.orders.delete(bestAsk.orderId);
            }
        }

        return trades;
    }

    private matchSell(sell:Order):Trade[]{
        const trades:Trade[] = [];

        while(sell.remaining > 0 && this.bids.length > 0){
            const bestBid = this.bids[0];

            if(sell.price > bestBid.price) break;

            const qty = Math.min(sell.remaining,bestBid.remaining)
            trades.push({
                price: bestBid.price,
                quantity: qty,
                timestamp: Date.now(),
                buyOrderId: bestBid.orderId,
                sellOrderId: sell.orderId,
            });

            sell.remaining -= qty;
            bestBid.remaining -= qty;

            if(bestBid.remaining === 0){
                this.bids.shift();
                this.orders.delete(bestBid.orderId);
            }
        }

        return trades;
    }

    private insertBid(order:Order){
        let index = 0;
        while(index < this.bids.length ){
            const current = this.bids[index];
            if(order.price > current.price || (order.price === current.price && order.timestamp  < current.timestamp)){
                break;
            }
            index++;
        }
        this.bids.splice(index,0,order);
        return index;
    }

    private insertAsk(order:Order){
        let index = 0
        while(index < this.asks.length){
            const current = this.asks[index];
            if(order.price < current.price || (order.price === current.price && order.timestamp < current.timestamp)){
                break;
            }
            index++;
        }
        this.asks.splice(index,0,order)
        return index
    }

    cancleOrder(orderId:string){
        const order = this.orders.get(orderId)
        if(!order || order.remaining === 0) return false;

        const book = order.side == Side.BUY ? this.bids : this.asks;
        const index = book.findIndex((o)=>o.orderId === orderId)

        if(index !== -1){
            book.splice(index,1)
            this.orders.delete(orderId)
            return true
        }
        return false
    }

    bestBid():number | null {
        return this.bids.length > 0 ? this.bids[0].price : null
    }
    bestAsk():number | null {
        return this.asks.length > 0 ? this.asks[0].price : null
    }

    spread():number| null {
        const bid = this.bestBid();
        const ask = this.bestAsk();
        if(bid === null || ask === null) return null;
        return ask - bid;
    }

    midprice():number| null {
        const bid = this.bestBid();
        const ask = this.bestAsk();
        if(bid === null || ask === null) return null;
        return (bid + ask) / 2;
    }
    depth(level:number = 5){
        return {
            bids: this.bids.slice(0,level).map((o)=>[o.price, o.remaining]),
            asks: this.asks.slice(0,level).map((o)=>[o.price, o.remaining]),
        }
    }

    printOrderbook(level:number = 5){
        console.log("==== orderbook of ", this.symbol," ====");
        console.log(`${"Best (buy)".padEnd(25)} | Ask (sell)` );
        console.log("-".repeat(50));
        const bids = this.bids.slice(0,level);
        const asks = this.asks.slice(0,level);
        const maxlength = Math.max(bids.length,asks.length);

        for(let i = 0; i < maxlength; i++){
            const bidStr = i < bids.length ?  `${bids[i].remaining.toFixed(2).padEnd(5)} @ ${bids[i].price.toFixed(2)}` : "".padEnd(5);
            const askStr = i < asks.length ?  `${asks[i].remaining.toFixed(2).padEnd(5)} @ ${asks[i].price.toFixed(2)}` : "".padEnd(5);
            console.log(`${bidStr} | ${askStr}`);
        }
        console.log("-".repeat(50));
        console.log("Best Bid: ", this.bestBid());
        console.log("Best Ask: ", this.bestAsk());
        console.log("Spread: ", this.spread());
        console.log("Midprice: ", this.midprice());
        console.log("open orders size: ", this.orders.size);
        console.log("trades size: ", this.trades.length);
    }

    getTrades():Trade[]{
        return [...this.trades];
    }
}




const book = new Orderbook("OPENAI-INR");
book.addOrder(Side.BUY, 100, 10);
book.addOrder(Side.SELL, 100, 10);
book.addOrder(Side.BUY, 90, 10);
book.addOrder(Side.SELL, 110, 10);
book.addOrder(Side.BUY, 80, 10);
book.addOrder(Side.SELL, 120, 10);
book.addOrder(Side.BUY, 70, 10);
book.addOrder(Side.SELL, 130, 10);
book.addOrder(Side.BUY, 60, 10);
book.addOrder(Side.SELL, 140, 10);
book.addOrder(Side.BUY, 50, 10);
book.addOrder(Side.SELL, 150, 10);


book.printOrderbook();


console.log(">>> Aggressive BUY ");
const trades1 = book.addOrder(Side.BUY, 151.5, 150);
console.log("Trades:", trades1);
book.printOrderbook();

console.log(">>> Aggressive SELL...");
const trades2 = book.addOrder(Side.SELL, 149.0, 180);
console.log("Trades:", trades2);
book.printOrderbook();

console.log(">>> Cancel best bid...");
const bestBidOrder = book["bids"][0]; // for demo
if (bestBidOrder) {
  console.log(`Cancelling ${bestBidOrder.orderId}`);
  book.cancleOrder(bestBidOrder.orderId);
  book.printOrderbook();
}
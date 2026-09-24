import { Balances } from "./balances";

export enum Side {
    BUY = "BUY",
    SELL = "SELL"
}

interface Order {
    orderId:string;
    userId:string;
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
    buyerId:string;
    sellerId:string;
}

export class Orderbook {
    private symbol:string;
    private bids: Order[] = []; // highest price first
    private asks: Order[] = []; // lowest price first
    private trades: Trade[] = [];
    private orders: Map<string, Order> = new Map();
    readonly balances = new Balances();

    constructor(symbol:string = "TATA-INR") {
        this.symbol = symbol;
    }

    addOrder(side:Side, price:number, quantity:number, userId:string, orderId = crypto.randomUUID()): {orderId:string, trades:Trade[]} {
        // lock funds before matching
        if (side === Side.BUY) this.balances.lock(userId, "INR", price * quantity);
        else this.balances.lock(userId, "TATA", quantity);

        const order: Order = {
            orderId,
            userId,
            side,
            price,
            quantity,
            remaining: quantity,
            timestamp: Date.now(),
        }
        
            let trades: Trade[] = [];

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
            return {orderId, trades};
    }

    private settle(buyerId:string, sellerId:string, price:number, qty:number, buyLimit:number) {
        // buyer reserved buyLimit*qty; actual cost price*qty
        this.balances.spendLocked(buyerId, "INR", price * qty);
        this.balances.unlock(buyerId, "INR", (buyLimit - price) * qty);
        this.balances.credit(buyerId, "TATA", qty);

        this.balances.spendLocked(sellerId, "TATA", qty);
        this.balances.credit(sellerId, "INR", price * qty);
    }

    private matchBuy(buy:Order):Trade[]{
        const trades:Trade[] = [];

        while(buy.remaining > 0 && this.asks.length > 0){
            const bestAsk = this.asks[0];

            if(buy.price < bestAsk.price) break;

            const qty = Math.min(buy.remaining,bestAsk.remaining);

            this.settle(buy.userId, bestAsk.userId, bestAsk.price, qty, buy.price);

            trades.push({
                price: bestAsk.price,
                quantity: qty,
                timestamp: Date.now(),
                buyOrderId: buy.orderId,
                sellOrderId: bestAsk.orderId,
                buyerId: buy.userId,
                sellerId: bestAsk.userId,
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

            this.settle(bestBid.userId, sell.userId, bestBid.price, qty, bestBid.price);

            trades.push({
                price: bestBid.price,
                quantity: qty,
                timestamp: Date.now(),
                buyOrderId: bestBid.orderId,
                sellOrderId: sell.orderId,
                buyerId: bestBid.userId,
                sellerId: sell.userId,
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
            if (order.side === Side.BUY) this.balances.unlock(order.userId, "INR", order.price * order.remaining);
            else this.balances.unlock(order.userId, "TATA", order.remaining);
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

    getTrades():Trade[]{
        return [...this.trades];
    }

    getSnapshot() {
        return {
            symbol: this.symbol,
            bids: this.bids,
            asks: this.asks,
            trades: this.trades,
            orders: Array.from(this.orders.entries()),
            balances: this.balances.toJSON(),
        };
    }

    loadSnapshot(snap: any) {
        const s = snap.book ?? snap; // for multiple books
        this.symbol = s.symbol ?? this.symbol;
        this.bids = s.bids ?? [];
        this.asks = s.asks ?? [];
        this.trades = s.trades ?? [];
        this.orders = new Map(s.orders ?? []);
        if (s.balances) this.balances.load(s.balances);
    }
}

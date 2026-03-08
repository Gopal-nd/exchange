
interface Order {
    orderId: string,
    quantity: number,
    price: number
}
interface Bid extends Order {
    side: 'bid'
}
interface Ask extends Order {
    side: 'ask'
}
interface orderBook {
    bids: Bid[],
    asks: Ask[]
}
export const orderBook: orderBook = {
    bids: [],
    asks: []
}

export const orderBookWithQuantity: { bids: { [price: number]: number }, asks: { [price: number]: number } } = {
    bids: {},
    asks: {}
}
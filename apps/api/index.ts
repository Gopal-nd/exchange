import express from 'express'
import cors from 'cors'
import {orderRouter} from './routes/order'
import {klineRouter} from './routes/kline'
import {depthRouter} from './routes/depth'
import {tradesRouter} from './routes/trades'
import {tickersRouter} from './routes/ticker'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.use(cors({
    origin: '*'
}))

app.use('/api/v1/order', orderRouter)
app.use('/api/v1/depth', depthRouter)
app.use('/api/v1/trades', tradesRouter)
app.use('/api/v1/tickers', tickersRouter)
app.use('/api/v1/klines', klineRouter)

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})


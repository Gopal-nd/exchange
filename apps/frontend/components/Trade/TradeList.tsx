import { TradeWSMessage } from "@/types"
import { useEffect, useState } from "react"

export default function TradesList({trade}:{trade:TradeWSMessage}) {
    const [trades, setTrades] = useState<TradeWSMessage[]>()
    useEffect(()=>{
        if(!trade) return
        
      setTrades(prev => {
        if(!prev) return [{...trade,T:Date.now()}]
      const next = [{...trade,T : Date.now()}, ...prev]
      return next.slice(0, 100) 
    })
  }, [trade])
//   console.log(trade)
function formate24hours(date:Date){
const h = date.getHours()
const m = date.getMinutes()
const s = date.getSeconds()
const pad = (x:number)=>x.toString().padStart(2,'0')
return `${pad(h)}:${pad(m)}:${pad(s)}`
}
  return (
    <div className="flex flex-col h-full w-full px-3 pb-3">

      <div className="flex w-2/3 justify-between">
        <p className="px-1 text-xs font-semibold text-med-emphasis">
          Price (USD)
        </p>
        <button className="text-xs font-semibold text-med-emphasis hover:opacity-90">
          Qty (SOL)
        </button>
      </div>

      {/* LIST */}
      <div className=" flex-1 overflow-y-auto no-scrollbar">
        <div
          className="flex flex-1 flex-col gap-1"
        //   style={{ height: trades.length * ROW_HEIGHT }}
        >
          {trades && trades.map((trade, i) => (
            <div
              key={i}
              className=" flex w-full items-center hover:bg-white/5"
            //   style={{
            //     height: ROW_HEIGHT,
            //     transform: `translateY(${i * ROW_HEIGHT}px)`
            //   }}
            >
              {/* PRICE */}
              <div className="w-1/3 px-1 text-left text-xs tabular-nums">
                <span
                  className={
                    trade.m == true
                      ? "text-red-500"
                      : "text-green-500"
                  }
                >
                  {trade.p}
                </span>
              </div>

              {/* QTY */}
              <div className="w-1/3 text-right text-xs text-high-emphasis/90 tabular-nums">
                {trade.q}
              </div>

              {/* TIME */}
              <div className="w-1/3 text-right text-xs text-med-emphasis tabular-nums">
                {formate24hours(new Date(trade.T))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

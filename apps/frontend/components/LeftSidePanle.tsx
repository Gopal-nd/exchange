'use client'

import { useEffect, useState } from "react"
import Chart from "./Trade/Chart"
import Overview from "./Trade/Overview"
import { SignalingManager } from "@/utils/SignalingManager"
import { TradeWSMessage } from "@/types"
import Depth from "./Depth/Depth"
import TradesList from "./Trade/TradeList"

const LeftSidePanle = ({id,isPerp}:{id:string,isPerp:boolean}) => {
       const [trade, setTrade] = useState<TradeWSMessage>()
       const [state,setState] = useState<'book'|'trade'>('book')
    useEffect(() => {
        const ws = SignalingManager.getInstance()
        ws.registerCallback('trade', (data: TradeWSMessage) => {
            setTrade(data)
        }, `trade-${id}`)

        ws.sendMessage({ method: "SUBSCRIBE", params: [`trade.${id}`] })
        return () => {
            ws.sendMessage({ method: "UNSUBSCRIBE", params: [`trade.${id}`] })
            ws.deRegisterCallback('trade', `trade.${id}`)
        }
    }, [])
  return (
        <div className="flex flex-1 flex-col gap-2">

                    <Overview token={id} isPerp={isPerp} trade={trade}/>

                    {/* CHART + ORDER BOOK */}
                    <div className="flex gap-2 h-[500px]">

                        {/* CHART */}
                        <div className="flex flex-1 flex-col rounded-lg bg-base-background-l1 overflow-hidden">
                            <div className="flex items-center justify-between p-3">
                                <div className="flex gap-2">
                                    <div className="flex h-8 cursor-pointer items-center justify-center whitespace-nowrap rounded-lg bg-base-background-l2 px-3 text-[13px] font-semibold text-high-emphasis hover:opacity-90">
                                        Chart
                                    </div>
                                    {["Depth", "Margin", "Market Info"].map(t => (
                                        <div key={t} className="flex h-8 cursor-pointer items-center justify-center whitespace-nowrap rounded-lg  px-3 text-[13px] font-semibold text-high-emphasis hover:opacity-90">
                                            {t}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-1 overflow-hidden">
                                <Chart token={id} isPerp={isPerp} />
                            </div>
                        </div>

                        {/* ORDER BOOK */}
                        <div className="flex w-[300px] min-w-[260px] flex-col rounded-lg bg-base-background-l1 overflow-hidden">

                            {/* Tabs */}
                            <div className="p-3 flex gap-2">
                                <div onClick={()=>setState('book')} className={`flex h-8 cursor-pointer items-center justify-center whitespace-nowrap rounded-lg ${ state == 'book' && 'bg-base-background-l2'} px-3 text-[13px] font-semibold text-high-emphasis hover:opacity-90`}>
                                    Book
                                </div>
                                <div onClick={()=>setState('trade')} className={`flex h-8 cursor-pointer items-center justify-center whitespace-nowrap rounded-lg ${ state == 'trade' && 'bg-base-background-l2'} px-3 text-[13px] font-semibold text-high-emphasis hover:opacity-90`}>
                                    Trades
                                </div>
                            </div>

                         { state == 'book' ? (   <>
                            <div className="flex px-3 py-2 text-xs">
                                <div className="w-1/3">Price (USD)</div>
                                 <div className="w-1/3 text-center text-med-emphasis">Total (QTY)</div>
                                <div className="w-1/3 text-right text-med-emphasis">Total ({trade?.s.split('_')[0].toUpperCase()})</div>
                            </div>

                            <Depth market={`${id}`} price={trade?.p} />
                            </>)
                            :(
                               trade && <TradesList trade={trade} />
                            )}




                        </div>
                    </div>
                </div>
  )
}

export default LeftSidePanle
'use client'
import { getDepth } from '@/utils/http';
import { SignalingManager } from '@/utils/SignalingManager';
import { useEffect, useState } from 'react'
import Asks from './Asks';
import Bids from './Bids';

const Depth = ({ market, ticker, price }: { market: string, ticker?: string, price?: string }) => {
    const [bids, setBids] = useState<[string, string][]>();
    const [asks, setAsks] = useState<[string, string][]>();

    useEffect(() => {
        SignalingManager.getInstance().registerCallback("depth", (data: any) => {
            // console.log(data)
            setBids((originalBids) => {
                const bidsAfterUpdate = [...(originalBids || [])];

                for (let i = 0; i < bidsAfterUpdate.length; i++) {
                    for (let j = 0; j < data.bids.length; j++) {
                        if (bidsAfterUpdate[i][0] === data.bids[j][0]) {
                            bidsAfterUpdate[i][1] = data.bids[j][1];
                            break;
                        }
                    }
                }
                return bidsAfterUpdate;
            });

            setAsks((originalAsks) => {
                const asksAfterUpdate = [...(originalAsks || [])];

                for (let i = 0; i < asksAfterUpdate.length; i++) {
                    for (let j = 0; j < data.asks.length; j++) {
                        if (asksAfterUpdate[i][0] === data.asks[j][0]) {
                            asksAfterUpdate[i][1] = data.asks[j][1];
                            break;
                        }
                    }
                }
                return asksAfterUpdate;
            });
        }, `DEPTH-${market}`);

        SignalingManager.getInstance().sendMessage({ "method": "SUBSCRIBE", "params": [`depth.${market}`] });

        getDepth(market).then(d => {
            // console.log(d)
            setBids(d.bids.reverse());
            setAsks(d.asks);
        });


        // getTicker(market).then(t => setPrice(t.lastPrice));
        // getTrades(market).then(t => setPrice(t[0].price));
        // getKlines(market, "1h", 1640099200, 1640100800).then(t => setPrice(t[0].close));
        return () => {
            SignalingManager.getInstance().sendMessage({ "method": "UNSUBSCRIBE", "params": [`depth.200ms.${market}`] });
            SignalingManager.getInstance().deRegisterCallback("depth", `DEPTH-${market}`);
        }
    }, [])


    return (
        <div className=' overflow-y-scroll'>
            {asks && <Asks asks={asks} />}
            {asks && <div className='text-xs pl-2 flex justify-between items-center'>
                <span>
                    {price ? price : asks[0]?.[0]}
                </span>
                <span className='text-xs text-blue-700'>
                    Fair Price</span></div>}
            {bids && <Bids bids={bids} />}
        </div>
    )
}

export default Depth
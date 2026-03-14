



import Overview from '@/components/Trade/Overview'
import React from 'react'
import { Minus, Plus, AlignLeft, AlignRight, AlignJustify } from "lucide-react";
import Chart from '@/components/Trade/Chart';
import Depth from '@/components/Depth/Depth';
import LeftSidePanle from '@/components/LeftSidePanle';
import BuySellBar from '@/components/BuySellBar';

const Trade = async ({ params }: { params: Promise<{ id: string }> }) => {
    let { id } = await params
    const isPerp = id?.includes('PERP')
    if(isPerp){
        id = id.split('_')[0] +'_'+ id.split('_')[1]+'C_'+id.split('_')[2]
    }else{
         id = id.split('_')[0] +'_'+ id.split('_')[1]+'C'
    }

    return (
        <div className="flex flex-1 flex-col bg-base-background-l0 text-high-emphasis overflow-auto">

            {/* MAIN GRID */}
            <div className="flex flex-1 gap-2 px-4">

                {/* LEFT SIDE */}
            <LeftSidePanle id={id} isPerp={isPerp} />

                {/* RIGHT SIDEBAR */}
                <BuySellBar token={id}/>

            </div>
        </div>
    )
}

export default Trade

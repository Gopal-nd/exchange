'use client'
import { Market, TradeWSMessage } from '@/types'
import { staticTokenData } from '@/types/token'
import { getCurrentTokenData, getTicker24h } from '@/utils/http'
import { SignalingManager } from '@/utils/SignalingManager'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import DataNotFound from '../DataNotFound'

const Overview = ({ token, isPerp,trade }: { token: string, isPerp: boolean,trade?:TradeWSMessage }) => {

    const { data, isLoading, error, isError } = useQuery({ queryKey: [`token`,token], queryFn: () => getTicker24h(token),staleTime:10 })
    // console.log(data)
    const staticToken = staticTokenData.filter((f)=>f.symbol == token.split('_')[0].toLocaleLowerCase())
    if (isLoading) {
        <div>Loading..</div>
    }
    if (isError) {
        <div className="">{JSON.stringify(error)}</div>
    }
    if(!data)return  <div></div>

    if (data?.length==0) {
       return  <DataNotFound token={token}/>
    }


    return (
        <div className="flex items-center flex-row bg-base-background-l1 relative h-[66px] w-full rounded-lg py-3">
            <div className="flex items-center flex-row no-scrollbar mr-4 ml-4 w-full overflow-auto">
                <div className="flex justify-between flex-row w-full gap-4">
                    <div className="flex flex-row shrink-0 gap-6">
                        <button className='flex gap-2 items-center'>
                            <Image src={data && staticToken[0].image || ''} alt='image' width={1000} height={1000} className='h-5 w-5' />
                            <div className='flex'>
                                {data && data[0].symbol.split('_')[0].toUpperCase()}/<span className='text-med-emphasis'>USD</span>
                            </div>

                        </button>
                        <div className="flex flex-wrap items-center gap-x-6 text-med-emphasis">
                            {/* Price */}
                            <div className="flex h-full flex-col justify-center gap-0.5 shrink-0">
                                <button
                                    type="button"
                                    className="cursor-help"
                                    aria-label="Current price"
                                >
                                    <p className={`text-base font-medium tabular-nums ${trade?.m  ? 'text-red-500' : 'text-green-500'} `}>
                                        {trade?.p ?? data[0]?.firstPrice}
                                    </p>
                                
                                </button>
                            </div>

                            {/* 24H Change */}
                            <div className="relative flex flex-col justify-center gap-1">
                                <p className="text-xs font-light text-med-emphasis">
                                    24H Change
                                </p>
                                <span className={`text-sm font-light tabular-nums ${Number(data[0].priceChange) >= 0 ? 'text-green-500' : 'text-red-500'} `}>
                                    {Number(data[0].priceChange) >= 0 ? "" : ""}{Number(data[0].priceChange).toLocaleString()} {Number(data[0].priceChangePercent) >= 0 ? "" : ""}{(Number(data[0].priceChangePercent )*100).toFixed(2)}%
                                </span>
                            </div>

                            {/* 24H High */}
                            <div className="relative flex flex-col justify-center gap-1">
                                <p className="text-xs font-light text-med-emphasis">
                                    24H High
                                </p>
                                <span className="text-xs font-normal leading-4 tabular-nums text-high-emphasis">
                                    {data[0].high}
                                </span>
                            </div>

                            {/* 24H Low */}
                            <div className="relative flex flex-col justify-center gap-1">
                                <p className="text-xs font-light text-med-emphasis">
                                    24H Low
                                </p>
                                <span className="text-xs font-normal leading-4 tabular-nums text-high-emphasis">
                                    {data[0].low}
                                </span>
                            </div>

                            {/* 24H Volume */}
                            <button
                                type="button"
                                className="text-left text-base font-medium text-accent-blue transition-opacity hover:opacity-80"
                                aria-label="24 hour volume"
                            >
                                <div className="relative flex flex-col justify-center gap-1">
                                    <p className="text-xs font-light text-med-emphasis">
                                        24H Volume (USD)
                                    </p>
                                    <span className="text-xs font-normal leading-4 tabular-nums text-high-emphasis">
                                        {Intl.NumberFormat("en-US").format(Number(data[0].quoteVolume))}

                                    </span>
                                </div>
                            </button>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Overview
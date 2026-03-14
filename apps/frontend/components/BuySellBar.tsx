'use client'
import { getTokenImage } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import React, { useState } from 'react'

const BuySellBar = ({ token }: { token: string }) => {
    const [side, setSide] = useState<'buy' | 'sell'>('buy')
    const [price, setPrice] = useState(111)
    const [quantity, setQuantity] = useState(2)
    return (
        <div className="w-[344px] shrink-0 overflow-y-auto">
            <div className="flex flex-col relative h-full w-full">
                <div className="flex flex-col absolute inset-0 overflow-x-hidden overflow-y-auto">
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-col bg-base-background-l1 gap-4 rounded-lg p-3">

                            <div className="flex flex-col gap-4">
                                <div className="flex h-[44px] w-full overflow-hidden rounded-xl bg-base-background-l1v2">
                                    {/* Buy (active) */}
                                    <button
                                        onClick={() => setSide('buy')}
                                        type="button"
                                        className={`w-full rounded-xl ${side == 'buy' ? 'bg-green-background-solid text-green-text' : ''} text-sm font-semibold hover:text-green-text`}
                                    >
                                        Buy
                                    </button>

                                    {/* Sell */}
                                    <button
                                        onClick={() => setSide('sell')}
                                        type="button"
                                        className={`w-full rounded-xl text-sm font-semibold ${side == 'sell' ? 'bg-red-background-solid text-red-text' : ''} text-low-emphasis hover:text-red-text`}
                                    >
                                        Sell
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    {/* Limit / Market */}
                                    <div className="flex items-center">
                                        {/* Active */}
                                        <div className="flex h-8 cursor-pointer items-center justify-center whitespace-nowrap rounded-lg bg-base-background-l2 px-3 text-[13px] font-semibold text-high-emphasis hover:opacity-90">
                                            Limit
                                        </div>

                                        {/* Inactive */}
                                        <div className="flex h-8 cursor-pointer items-center justify-center whitespace-nowrap rounded-lg px-3 text-[13px] font-semibold text-med-emphasis hover:opacity-90">
                                            Market
                                        </div>
                                    </div>

                                    {/* Conditional dropdown */}
                                    <div className="group flex items-center">
                                        <button
                                            type="button"
                                            className="h-8 rounded-l-lg px-3 pr-1 text-[13px] font-semibold text-med-emphasis group-hover:opacity-90"
                                        >
                                            Conditional
                                        </button>

                                        <button
                                            type="button"
                                            className="flex h-8 items-center rounded-r-lg px-2 text-xs font-medium text-med-emphasis group-hover:opacity-90"
                                            aria-expanded="false"
                                            aria-label="Toggle conditional options"
                                        >
                                            <ChevronDown />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-col">

                                    <div className="flex flex-1 flex-col gap-3 text-high-emphasis">
                                        {/* Balance */}
                                        <div className="flex justify-between px-[2px]">
                                            <button type="button" className="cursor-help">
                                                <p className="relative text-xs font-normal text-med-emphasis">
                                                    Balance
                                                    <span className="absolute bottom-0 left-0 w-full translate-y-full" />
                                                </p>
                                            </button>
                                            <p className="text-xs font-medium text-high-emphasis">-</p>
                                        </div>

                                        {/* Price */}
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-normal text-med-emphasis">Price</p>
                                                <div className="flex items-center text-xs">
                                                    <button className="font-medium text-accent-blue hover:opacity-80">
                                                        Mid
                                                    </button>
                                                    <div className="mx-2 h-4 w-px bg-base-border-med" />
                                                    <button className="font-medium text-accent-blue hover:opacity-80">
                                                        BBO
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    inputMode="numeric"
                                                    value={price}
                                                    onChange={(e: any) => setPrice(e.target.value)}
                                                    placeholder="0"
                                                    className="w-full rounded-lg  p-2 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none  bg-base-background-l2 pr-10 text-lg placeholder-med-emphasis transition   outline-0 all-[unset] appearance-none box-border focus:ring-0"
                                                />
                                                <div className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 p-2">
                                                    <img
                                                        src="https://backpack.exchange/coins/usd.svg"
                                                        alt="USD"
                                                        width={24}
                                                        height={24}
                                                        className="rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quantity */}
                                        <div className="flex flex-col gap-1">
                                            <p className="text-xs font-normal text-med-emphasis">Quantity</p>

                                            <div className="relative">
                                                <input
                                                    type='number'
                                                    value={quantity}
                                                    onChange={(e: any) => setQuantity(e.target.value)}
                                                    inputMode="numeric"
                                                    placeholder="0"
                                                    className="w-full rounded-lg p-2 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none  bg-base-background-l2 pr-10 text-lg placeholder-med-emphasis transition   outline-0 all-[unset] appearance-none box-border focus:ring-0"
                                                />
                                                <div className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 p-2">
                                                    <img
                                                        src={getTokenImage(token)}
                                                        alt="SOL"
                                                        width={24}
                                                        height={24}
                                                        className="rounded-full"
                                                    />
                                                </div>
                                            </div>

                                            {/* Slider */}
                                            <div className="mt-2">
                                                <div className="relative mx-2 h-1 cursor-pointer rounded-full bg-base-background-l3">
                                                    <div className="h-full w-0 rounded-full bg-accent-blue" />
                                                    <div
                                                        className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-accent-blue"
                                                        style={{ left: "0%" }}
                                                    />
                                                </div>

                                                <div className="mt-2 flex justify-between text-xs text-med-emphasis">
                                                    <span>0</span>
                                                    <span>100%</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Value */}
                                        <div className="flex flex-col gap-1">
                                            <p className="text-xs font-normal text-med-emphasis">Order Value</p>

                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    placeholder='0'
                                                    value={Number(price) * Number(quantity)}
                                                    className="w-full rounded-lg p-2 bg-base-background-l2 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none  pr-10 text-lg placeholder-med-emphasis transition outline-0 all-[unset] appearance-none box-border focus:ring-0"
                                                />
                                                <div className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 p-2">
                                                    <img
                                                        src="https://backpack.exchange/coins/usd.svg"
                                                        alt="USD"
                                                        width={24}
                                                        height={24}
                                                        className="rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <a
                                                href="/signup"
                                                className="inline-flex h-10 items-center justify-center rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold hover:opacity-90"
                                            >
                                                Sign up to trade
                                            </a>

                                            <a
                                                href="/login"
                                                className="inline-flex h-10 items-center justify-center rounded-xl bg-base-background-l2 text-white px-4 py-2 text-sm font-semibold  hover:opacity-90"
                                            >
                                                Log in to trade
                                            </a>
                                        </div>

                                        {/* Options */}
                                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-3">
                                            {[
                                                { id: "postOnly", label: "Post Only" },
                                                { id: "ioc", label: "IOC" },
                                            ].map(({ id, label }) => (
                                                <label key={id} className="flex items-center gap-2 text-xs font-medium text-med-emphasis">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 cursor-pointer rounded-sm border border-base-border-med bg-base-950 checked:border-high-emphasis checked:bg-high-emphasis focus:ring-0"
                                                    />
                                                    <span className="border-b border-dashed border-base-border-med cursor-help">
                                                        {label}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>


                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default BuySellBar
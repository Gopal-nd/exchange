
import Link from "next/link";
import axios from "axios";
import Image from "next/image";
import { Market } from "@/types";
import MarketCard from "./MarketCard";



export default async function HighLightCards({data}:{data:Market[]}) {

      const movers = [...data]
      .filter((a) => a.market_cap != null && a.current_price != null && a.price_change_24h != null && a.symbol !== 'usdt' && a.symbol !== 'usdc')
      .sort((a, b) => Math.abs(b.price_change_percentage_24h) - Math.abs(a.price_change_percentage_24h))

      const popular = [...data]
      .filter((a) => a.market_cap != null && a.current_price != null && a.symbol !== 'usdt' && a.symbol !== 'usdc')
      .sort((a, b) => b.market_cap - a.market_cap)

  return (
    <div className="w-full grid md:grid-cols-3 gap-3 ">
      <MarketCard title="New" items={data.slice(0,5)} />
      <MarketCard title="Top Movers" items={movers.slice(0,5)} />
      <MarketCard title="Popular" items={popular.slice(0,5)} />

    </div>
  );
}


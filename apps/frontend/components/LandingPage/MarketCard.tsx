import { Market } from "@/types";
import Image from "next/image";
import Link from "next/link";


export default function MarketCard({
  title,
  items,
}: {
  title: string;
  items: Market[];
}) {
  return (
    <div className="rounded-xl bg-base-background-l1 py-4">

      <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-400 ">
        <span className="font-medium text-white text-lg">{title}</span>
        <span>24h Change</span>
      </div>


      <div className="">
        {items.map((item) => (
          <Link
            href={`/trade/${item.symbol.toUpperCase()}_USD_PERP`}
            key={item.id}
            className="flex items-center justify-between text-sm hover:bg-base-background-l2 px-4 py-2"
          >
            <div className=" flex items-center gap-2 uppercase">

              <Image src={item.image} alt="image" width={100} height={100} className="h-5 w-5 rounded-full" />
              <span className="text-gray-200">{item.symbol}-<span className="text-med-emphasis">PERP</span>
              </span>
            </div>
            <span className="text-gray-300 text-end">${item.current_price.toLocaleString('en-US')}</span>
            <span
              className={
                item.price_change_24h >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }
            >
              {item.price_change_percentage_24h > 0 ? "+" : ""}
              {item.price_change_percentage_24h.toFixed(2)}%
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

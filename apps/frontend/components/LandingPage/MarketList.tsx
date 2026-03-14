'use client'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import { Market } from '@/types'
import { ColumnDef } from "@tanstack/react-table";
import Sparkline from "./Sparkline";
import { generateMockSparkline } from "@/lib/utils";
import {useRouter} from 'next/navigation'
const MarketList = ({data}:{data:Market[]}) => {

    const [state,setState] = useState<string>('spot')
const router = useRouter()
const columns: ColumnDef<Market>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell:({row})=>{
        const token = row.original
         return ( state == 'spot'?(
             <div className="flex items-center gap-3">
          <img src={token.image} className="w-8 h-8 rounded-full" />
          <div>
            <div className="font-light">{token.name}</div>
            <div className="text-xs text-gray-400">
              {token.symbol.toUpperCase()}/USD
            </div>
          </div>
        </div>
         ): <div className="flex items-center gap-2">
          <img src={token.image} className="w-8 h-8 rounded-full" />
          <div className="upper">
            <div className="text-xs text-high-emphasis">
              {token.symbol.toUpperCase()}-<span className="text-med-emphasis">PERP</span>
            </div>
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: "current_price",
    header: "Price",
    cell: info =>  info.getValue()!==null?`$${ info.getValue<number>()}`: '--',
    sortingFn:'basic'
  },
  {
    accessorKey: "total_volume",
    header: "24h Volume",
    cell:info =>info.getValue()!==null? `$${Intl.NumberFormat("en-US", {
        notation: "compact",
      }).format(info.getValue<number>())}`: '--',

    sortingFn: "basic",
  },
{
    accessorKey: "market_cap",
    header: "Market Cap",
     cell:info =>info.getValue()!==null? `$${Intl.NumberFormat("en-US", {
        notation: "compact",
      }).format(info.getValue<number>())}`: '--',

    sortingFn: "basic",
  },
 {
    accessorKey: "price_change_percentage_24h",
    header: "24h Change",
    cell: info => {
      const v = info.getValue<number>();
      return (v !== null ?
        <span className={v >= 0 ? "text-green-400" : "text-red-400"}>
          {v}%
        </span>
        :
        '--'
      );
    },
    sortingFn: "basic",
  },
  {
  id: "last7days",
  header: "Last 7 Days",
  enableSorting: false,
  cell: ({ row }) => {
    const coin = row.original;

    const sparkline = generateMockSparkline(
      coin.current_price,
      coin.price_change_percentage_24h
    );

    return (
      <Sparkline
        data={sparkline}
        positive={coin.price_change_percentage_24h >= 0}
      />
    );
  },
}
];
 const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  return (
    <div className='p-4 bg-base-background-l1 space-y-2 overflow-y-auto'>
        <div className='text-sm flex items-center gap-4 text-med-emphasis'>
            <button className={`${state=='spot'?'bg-base-background-l2 p-2 rounded-lg text-high-emphasis':''}`} onClick={()=>setState('spot')}>Spot</button>
            <button className={`${state=='fetures'?'bg-base-background-l2 p-2 rounded-lg text-high-emphasis':''}`} onClick={()=>setState('fetures')}>Fetures</button>
            <button className={`${state=='lend'?'bg-base-background-l2 p-2 rounded-lg text-high-emphasis':''}`} onClick={()=>setState('lend')}>Lend</button>
        </div>
        <div>
                <table className="w-full text-sm ">
      <thead className="text-med-emphasis border-b border-white/5 ">
        {table.getHeaderGroups().map(headerGroup => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <th
                key={header.id}
                className="px-4 py-2 font-light cursor-pointer select-none"
                onClick={header.column.getToggleSortingHandler()}
              >
                <div className="flex items-center gap-1">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  {{
                    asc: "↑",
                    desc: "↓",
                  }[header.column.getIsSorted() as string] ?? ""}
                </div>
              </th>
            ))}
          </tr>
        ))}
      </thead>

      <tbody>
        {table.getRowModel().rows.map(row => (
          <tr
            key={row.id}
            className="border-b  border-white/5 hover:bg-base-background-l2"
          >
            {row.getVisibleCells().map(cell => (
              <td key={cell.id} className="px-4 py-3" onClick={()=>router.push(state == 'spot'?`/trade/${cell.row.original.symbol.split('_')[0].toUpperCase()}_USD`:`/trade/${cell.row.original.symbol.split('_')[0].toUpperCase()}_USD_PERP`)}>
                {flexRender(
                  cell.column.columnDef.cell,
                  cell.getContext()
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>

        </div>
    </div>
  )
}

export default MarketList
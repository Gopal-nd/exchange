

 const Asks = ({ asks }: {asks: [string, string][]}) => {
    let currentTotal = 0; 
    const relevantAsks = asks
    .filter(([, quantity]) => Number(quantity) > 0)
    .slice(0, 15);
    const AsksWithTotal: [string, string, number][] = relevantAsks.map(([price, quantity]) => [price, quantity, currentTotal += Number(quantity)]);
    const maxTotal = relevantAsks.reduce((acc, [_, quantity]) => acc + Number(quantity), 0);
    const maxTotalPrice = relevantAsks.reduce((acc, [_, quantity]) => acc + Number(quantity), 0);

    AsksWithTotal.reverse()
    return <div className="space-y-0.5">
        {AsksWithTotal?.map(([price, quantity, total]) => <Bid maxTotal={maxTotal} total={total} key={price} price={price} quantity={quantity} />)}
    </div>
}

function Bid({ price, quantity, total, maxTotal }: { price: string, quantity: string, total: number, maxTotal: number }) {
      const totalPercent = (total / maxTotal) * 100
  const qtyPercent = (Number(quantity) / maxTotal) * 100

    return (
   <div className="relative w-full h-6 text-xs overflow-hidden">

      <div
        className="absolute inset-y-0 right-0 bg-red-500/20 transition-[width] duration-300 ease-out animate-in delay-75"
        style={{ width: `${totalPercent}%` }}
      />


      <div
        className="absolute inset-y-0 right-0 bg-red-500/50 transition-[width] duration-300 ease-out animate-out opacity-80"
        style={{ width: `${qtyPercent}%` }}
      />

    
      <div className="relative z-10 grid grid-cols-3 px-2 h-full items-center text-gray-200">
        <span className="text-red-400 text-left">
          {price}
        </span>

        <span className="text-right">
          {Number(quantity)}
        </span>

        <span className="text-right text-gray-400">
          {total.toFixed(2)}
        </span>
      </div>
    </div>
    );
}


export default Asks
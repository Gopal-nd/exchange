

 const Bids = ({ bids }: {bids: [string, string][]}) => {
    let currentTotal = 0; 
    const relevantBids = bids
    .filter(([, quantity]) => Number(quantity) > 0)
    .slice(0, 15);
    const bidsWithTotal: [string, string, number][] = relevantBids.map(([price, quantity]) => [price, quantity, currentTotal += Number(quantity)]);
    const maxTotal = relevantBids.reduce((acc, [_, quantity]) => acc + Number(quantity), 0);

    return <div className=" space-y-0.5">
        {bidsWithTotal?.map(([price, quantity, total]) => <Bid maxTotal={maxTotal} total={total} key={price} price={price} quantity={quantity} />)}
    </div>
}

function Bid({ price, quantity, total, maxTotal }: { price: string, quantity: string, total: number, maxTotal: number }) {
      const totalPercent = (total / maxTotal) * 100
  const qtyPercent = (Number(quantity) / maxTotal) * 100

    return (
   <div className="relative w-full h-6 text-xs overflow-hidden">

      <div
        className="absolute inset-y-0 right-0 bg-green-500/20 transition-[width] duration-300 ease-out animate-in delay-75"
        style={{ width: `${totalPercent}%` }}
      />


      <div
        className="absolute inset-y-0 right-0 bg-green-500/50 transition-[width] duration-300 ease-out animate-out opacity-80"
        style={{ width: `${qtyPercent}%` }}
      />

    
      <div className="relative z-10 grid grid-cols-3 px-2 h-full items-center text-gray-200">
        <span className="text-green-400 text-left">
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


export default Bids
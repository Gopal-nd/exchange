'use client'
import { candleBarColors, chartConfig, updateCandle } from '@/lib/utils';
import { ChartManager } from '@/utils/ChartManager';
import { getKLines } from '@/utils/http';
import { SignalingManager } from '@/utils/SignalingManager';
import type { CandlestickData, ISeriesApi, UTCTimestamp } from 'lightweight-charts';
import { act, useEffect, useRef } from 'react';

const Chart = ({ token, isPerp }: { token: string, isPerp: boolean }) => {

  const chartRef = useRef<HTMLDivElement | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'>>(null);

  useEffect(() => {


    if (!chartRef.current) return;

    const chart = new ChartManager(chartRef.current)

    const ws = SignalingManager.getInstance()
    async function main() {
      // ws.registerCallback('',)

      const history = await getKLines(token)

      chart.setData(history)


    }
    let active = true
  const onTrade = (trade: any) => {
  const candle = updateCandle(trade);
    if (!active) return;

  if (!candle) return;

  chart.update(candle);
};

    main().catch(console.error)
    ws.sendMessage({ method: "SUBSCRIBE", params: [`trade.${token}`] })
    ws.registerCallback('trade', (data: any) => {
      onTrade(data)
    }, `trade-${token}`)

    return () => {
      active = false
      chart.destroy()
      ws.sendMessage({ method: "UNSUBSCRIBE", params: [`trade.${token}`] })
      ws.deRegisterCallback('trade', `trade.${token}`)

    }

  }, [])

  return (
    <div id='chart' ref={chartRef} className='w-full h-full' style={{ height: '440px', width: '840px' }}> </div>
  )
}

export default Chart
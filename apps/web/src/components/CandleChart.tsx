import { CandlestickSeries, ColorType, createChart, type IChartApi, type ISeriesApi } from "lightweight-charts";
import { useEffect, useRef } from "react";
import type { Candle } from "../api";

type Props = { candles: Candle[]; height?: number };

export default function CandleChart({ candles, height = 280 }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi | null>(null);
  const series = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!el.current) return;
    const c = createChart(el.current, {
      height,
      layout: {
        background: { type: ColorType.Solid, color: "#fffcf7" },
        textColor: "#6b6560",
      },
      grid: {
        vertLines: { color: "#eee8dc" },
        horzLines: { color: "#eee8dc" },
      },
      rightPriceScale: { borderColor: "#ddd6cb" },
      timeScale: { borderColor: "#ddd6cb", timeVisible: true, secondsVisible: true },
    });
    const s = c.addSeries(CandlestickSeries, {
      upColor: "#0f7a4a",
      downColor: "#b42318",
      borderVisible: false,
      wickUpColor: "#0f7a4a",
      wickDownColor: "#b42318",
    });
    chart.current = c;
    series.current = s;

    const ro = new ResizeObserver(() => {
      if (el.current) c.applyOptions({ width: el.current.clientWidth });
    });
    ro.observe(el.current);

    return () => {
      ro.disconnect();
      c.remove();
      chart.current = null;
      series.current = null;
    };
  }, [height]);

  useEffect(() => {
    if (!series.current) return;
    const data = candles.map((c) => ({
      // lightweight-charts expects unix seconds
      time: Math.floor(c.time / 1000) as any,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
    series.current.setData(data);
    chart.current?.timeScale().scrollToRealTime();
  }, [candles]);

  return <div ref={el} className="w-full" style={{ height }} />;
}

import { candleBarColors, chartConfig } from "@/lib/utils";
import { CandlestickData } from "@/types";
import {
    CandlestickSeries,
    ColorType,
    createChart,
    createChart as createLightWeightChart,
    CrosshairMode,
    IChartApi,
    ISeriesApi,
    UTCTimestamp,
} from "lightweight-charts";
import { RefObject } from "react";



export class ChartManager {
    private chart: IChartApi
    public candleSeries: ISeriesApi<'Candlestick'>
    private lastUpdateTime: number = 0

    constructor(ref: any) {
        const chart = createChart(ref, chartConfig)
        this.chart = chart
        this.candleSeries = chart.addSeries(CandlestickSeries, candleBarColors)      
    }
    public setData(initalData: CandlestickData[]){
          this.candleSeries.setData(
            initalData.map((data: CandlestickData) => ({
                time: (new Date(data.start).getTime() / 1000) as UTCTimestamp,
                close: Number(data.close),
                open: Number(data.open),
                high: Number(data.high),
                low: Number(data.low)
            }))
        )
    }

    public update(updatedData: CandlestickData) {
        // if (!this.lastUpdateTime) {
        //     this.lastUpdateTime = new Date().getTime();
        // }
        this.candleSeries.update({
            time: (new Date(updatedData.start).getTime() / 1000) as UTCTimestamp,
            close: Number(updatedData.close),
            open: Number(updatedData.open),
            high: Number(updatedData.high),
            low: Number(updatedData.low)
        })
        // if (updatedData.newCandleInitiated) {
        //     this.lastUpdateTime = new Date(updatedData.start).getTime()
        // }
    }
    public destroy() {
        this.chart.remove()
    }
}


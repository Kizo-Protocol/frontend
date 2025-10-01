import {
  IChartApi,
  LineData,
  HistogramData,
  UTCTimestamp,
  ColorType,
  LineSeriesOptions,
  HistogramSeriesOptions,
  CrosshairMode,
  LineStyle,
  LineWidth,
  LineSeries,
  HistogramSeries,
} from "lightweight-charts";

import {
  ChartConfig,
  ChartTheme,
  ChartDataPoint,
  VolumeDataPoint,
} from "@/types/components/market-chart.types";

export const defaultChartConfig: ChartConfig = {
  intervals: [
    { value: "1m", label: "1 Minute", seconds: 60 },
    { value: "5m", label: "5 Minutes", seconds: 300 },
    { value: "15m", label: "15 Minutes", seconds: 900 },
    { value: "1h", label: "1 Hour", seconds: 3600 },
    { value: "4h", label: "4 Hours", seconds: 14400 },
    { value: "1d", label: "1 Day", seconds: 86400 },
  ],
  series: [
    {
      name: "probability",
      label: "Probability",
      type: "line",
      description: "Yes/No position probabilities over time",
      enabled: true,
    },
    {
      name: "volume",
      label: "Volume",
      type: "histogram",
      description: "Betting volume for Yes/No positions",
      enabled: true,
    },
    {
      name: "odds",
      label: "Odds",
      type: "line",
      description: "Betting odds for Yes/No positions",
      enabled: false,
    },
    {
      name: "bets",
      label: "Bet Count",
      type: "histogram",
      description: "Number of bets placed over time",
      enabled: false,
    },
  ],
  colors: {
    yes: "#00d4aa",
    no: "#ff6b6b",
    total: "#a78bfa",
    probability: {
      yes: "#4ade80",
      no: "#f472b6",
    },
  },
  defaultTimeframe: "1h",
  maxDataPoints: 1000,
};

export const lightTheme: ChartTheme = {
  background: "#ffffff",
  textColor: "#374151",
  gridColor: "#e5e7eb",
  crosshairColor: "#6b7280",
  borderColor: "#d1d5db",
};

export const darkTheme: ChartTheme = {
  background: "#0a0e27",
  textColor: "#e2e8f0",
  gridColor: "#1e293b33",
  crosshairColor: "#64748b",
  borderColor: "#334155",
};

export function createChartOptions(
  theme: ChartTheme,
  width: number,
  height: number,
) {
  return {
    layout: {
      background: {
        type: ColorType.Solid,
        color: theme.background,
      },
      textColor: theme.textColor,
      fontSize: 12,
      fontFamily:
        'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    grid: {
      vertLines: {
        color: theme.gridColor,
        style: LineStyle.Solid,
        visible: true,
      },
      horzLines: {
        color: theme.gridColor,
        style: LineStyle.Solid,
        visible: true,
      },
    },
    crosshair: {
      mode: CrosshairMode.Normal,
      vertLine: {
        color: theme.crosshairColor,
        width: 1 as LineWidth,
        style: LineStyle.Solid,
        labelBackgroundColor: theme.background,
      },
      horzLine: {
        color: theme.crosshairColor,
        width: 1 as LineWidth,
        style: LineStyle.Solid,
        labelBackgroundColor: theme.background,
      },
    },
    rightPriceScale: {
      borderColor: theme.borderColor,
      textColor: theme.textColor,
      scaleMargins: {
        top: 0.1,
        bottom: 0.1,
      },
    },
    timeScale: {
      borderColor: theme.borderColor,
      textColor: theme.textColor,
      timeVisible: true,
      secondsVisible: false,
      fixLeftEdge: true,
      fixRightEdge: true,
    },
    leftPriceScale: {
      visible: false,
    },
    overlayPriceScales: {
      scaleMargins: {
        top: 0.7,
        bottom: 0.05,
      },
    },
    width,
    height,
    autoSize: false,
  };
}

export function createLineSeriesOptions(
  color: string,
  title: string,
): LineSeriesOptions {
  return {
    color,
    lineWidth: 3,
    lineStyle: 0,
    lineType: 1,
    lineVisible: true,
    pointMarkersVisible: false,
    priceLineVisible: true,
    lastValueVisible: true,
    crosshairMarkerVisible: true,
    crosshairMarkerRadius: 6,
    crosshairMarkerBorderColor: color,
    crosshairMarkerBackgroundColor: "#0a0e27",
    crosshairMarkerBorderWidth: 2,
    lastPriceAnimation: 1,
    priceFormat: {
      type: "custom",
      minMove: 0.01,
      formatter: (price: number) => {
        if (title.toLowerCase().includes("probability")) {
          return `${price.toFixed(1)}%`;
        }
        if (title.toLowerCase().includes("odds")) {
          return `${price.toFixed(2)}x`;
        }

        return price.toFixed(2);
      },
    },
    title,
    visible: true,
    priceLineSource: 0,
    priceLineWidth: 2,
    priceLineColor: color,
    priceLineStyle: 2,
    baseLineVisible: false,
    baseLineColor: "#334155",
    baseLineWidth: 1,
    baseLineStyle: 0,
    autoscaleInfoProvider: () => ({
      priceRange: null,
      margins: {
        above: 10,
        below: 10,
      },
    }),
  };
}

export function createHistogramSeriesOptions(
  color: string,
  title: string,
): HistogramSeriesOptions {
  const transparentColor = color + "80";

  return {
    color: transparentColor,
    base: 0,
    title,
    priceFormat: {
      type: "volume",
      precision: 0,
      minMove: 1,
    },
    lastValueVisible: true,
    visible: true,
    priceLineVisible: false,
    priceLineSource: 0,
    priceLineWidth: 1,
    priceLineColor: color,
    priceLineStyle: 0,
    baseLineVisible: true,
    baseLineColor: "#334155",
    baseLineWidth: 1,
    baseLineStyle: 0,
  };
}

export function transformToLineData(data: ChartDataPoint[]): LineData[] {
  return data.map((point) => ({
    time: point.time,
    value: point.value,
  }));
}

export function transformToHistogramData(
  data: VolumeDataPoint[],
): HistogramData[] {
  return data.map((point) => ({
    time: point.time,
    value: point.value,
    color: point.color,
  }));
}

export function toUTCTimestamp(unixTime: number): UTCTimestamp {
  return Math.floor(unixTime) as UTCTimestamp;
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatPercentage(value: number, precision: number = 1): string {
  return `${value.toFixed(precision)}%`;
}

export function formatOdds(value: number, precision: number = 2): string {
  return `${value.toFixed(precision)}x`;
}

export function formatVolume(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return value.toFixed(2);
}

export function calculatePriceChange(
  current: number,
  previous: number,
): { change: number; changePercent: number; isPositive: boolean } {
  const change = current - previous;
  const changePercent = previous !== 0 ? (change / previous) * 100 : 0;

  return {
    change,
    changePercent,
    isPositive: change >= 0,
  };
}

export function generateTimeRange(
  _interval: string,
  hoursBack: number = 24,
): { from: number; to: number } {
  const now = Math.floor(Date.now() / 1000);
  const secondsBack = hoursBack * 60 * 60;

  return {
    from: now - secondsBack,
    to: now,
  };
}

export function validateChartData(data: any): boolean {
  if (!data || typeof data !== "object") return false;

  const hasValidStructure =
    Array.isArray(data.yesProbability) &&
    Array.isArray(data.noProbability) &&
    Array.isArray(data.yesVolume) &&
    Array.isArray(data.noVolume);

  return hasValidStructure;
}

export class ChartSeriesManager {
  private chart: IChartApi;
  private series: Map<string, any> = new Map();

  constructor(chart: IChartApi) {
    this.chart = chart;
  }

  addLineSeries(name: string, options: LineSeriesOptions) {
    const series = this.chart.addSeries(LineSeries, options);

    this.series.set(name, series);

    return series;
  }

  addHistogramSeries(name: string, options: HistogramSeriesOptions) {
    const series = this.chart.addSeries(HistogramSeries, options);

    this.series.set(name, series);

    return series;
  }

  getSeries(name: string) {
    return this.series.get(name);
  }

  removeSeries(name: string) {
    const series = this.series.get(name);

    if (series) {
      this.chart.removeSeries(series);
      this.series.delete(name);
    }
  }

  removeAllSeries() {
    this.series.forEach((series) => {
      this.chart.removeSeries(series);
    });
    this.series.clear();
  }

  updateSeriesData(name: string, data: LineData[] | HistogramData[]) {
    const series = this.series.get(name);

    if (series) {
      series.setData(data);
    }
  }

  setSeriesVisibility(name: string, visible: boolean) {
    const series = this.series.get(name);

    if (series) {
      series.applyOptions({
        visible,
      });
    }
  }
}

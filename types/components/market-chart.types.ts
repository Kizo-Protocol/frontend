import { UTCTimestamp } from "lightweight-charts";

export interface ChartDataPoint {
  time: UTCTimestamp;
  value: number;
}

export interface VolumeDataPoint {
  time: UTCTimestamp;
  value: number;
  color?: string;
}

export interface MarketChartData {
  yesProbability: ChartDataPoint[];

  noProbability: ChartDataPoint[];

  yesVolume: VolumeDataPoint[];

  noVolume: VolumeDataPoint[];

  totalVolume: VolumeDataPoint[];

  yesOdds: ChartDataPoint[];

  noOdds: ChartDataPoint[];

  betCount: ChartDataPoint[];
}

export interface ChartTimeframe {
  interval: "1m" | "5m" | "15m" | "1h" | "4h" | "1d";
  from?: number;
  to?: number;
  label: string;
}

export interface ChartSeriesConfig {
  name: string;
  label: string;
  type: "line" | "histogram";
  description: string;
  enabled: boolean;
  color?: string;
}

export interface MarketChartProps {
  marketId: string;
  className?: string;
  height?: number;
  showControls?: boolean;
  defaultTimeframe?: ChartTimeframe["interval"];
  defaultSeries?: string[];
}

export interface ChartApiResponse {
  meta: {
    symbol: string;
    interval: string;
    from?: number;
    to?: number;
    series: string[];
  };
  data: {
    probability?: {
      yes: ChartDataPoint[];
      no: ChartDataPoint[];
    };
    volume?: {
      yes: VolumeDataPoint[];
      no: VolumeDataPoint[];
      total: VolumeDataPoint[];
    };
    odds?: {
      yes: ChartDataPoint[];
      no: ChartDataPoint[];
    };
    bets?: ChartDataPoint[];
  };
}

export interface ChartConfig {
  intervals: Array<{
    value: ChartTimeframe["interval"];
    label: string;
    seconds: number;
  }>;
  series: ChartSeriesConfig[];
  colors: {
    yes: string;
    no: string;
    total: string;
    probability: {
      yes: string;
      no: string;
    };
  };
  defaultTimeframe: string;
  maxDataPoints: number;
}

export interface ChartState {
  timeframe: ChartTimeframe["interval"];
  selectedSeries: string[];
  isLoading: boolean;
  error: string | null;
  data: MarketChartData | null;
}

export interface ChartActions {
  setTimeframe: (timeframe: ChartTimeframe["interval"]) => void;
  toggleSeries: (seriesName: string) => void;
  setSeries: (series: string[]) => void;
  refetch: () => void;
}

export interface PriceFormat {
  type: "price" | "percentage" | "volume" | "custom";
  precision?: number;
  minMove?: number;
}

export interface ChartTheme {
  background: string;
  textColor: string;
  gridColor: string;
  crosshairColor: string;
  borderColor: string;
}

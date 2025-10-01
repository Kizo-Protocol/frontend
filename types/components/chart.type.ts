import { UTCTimestamp } from "lightweight-charts";

export interface AssetData {
  symbol: string;
  ticker: string;
  assetName: string;
  iconSrc: string;
  tags: Array<{
    categoryLayer: string;
    categorySlug: string;
    categoryLabel: string;
    tagSlug: string;
    tagLabel: string;
  }>;
  createdAt: number;
  primaryMarket: {
    symbol: string;
    price: string;
    priceChange24h: string;
    priceChangePct24h: string;
    priceHistory24h: Array<{
      timestamp: number;
      price: string;
    }>;
    totalHolders: number;
    sharesMultiplier: string;
  };
  underlyingMarket: {
    ticker: string;
    name: string;
    priceHigh52w: string;
    priceLow52w: string;
    volume: string;
    averageVolume: string;
    sharesOutstanding: string;
    marketCap: string;
  };
  timestamp: number;
}

export interface StockChartProps {
  assetData?: AssetData;
  className?: string;
}

export interface ChartDataPoint {
  time: UTCTimestamp;
  value: number;
}

export interface PriceChangeData {
  change: number;
  changePercent: number;
  isPositive: boolean;
}

export interface HistoryDataPoint {
  timestamp: number;
  value: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

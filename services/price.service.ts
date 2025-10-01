import { api } from "@/lib/api";

export interface PriceData {
  price: number;
  symbol: string;
  source: string;
  feed_address: string;
  decimals: number;
  timestamp: number;
  round_id?: number;
}

export interface PriceResponse {
  success: boolean;
  data: PriceData;
  formatted: string;
  message?: string;
}

export const priceService = {
  /**
   * Get current APT/USD price from Chainlink
   * GET /api/prices/apt-usd
   */
  getAptUsdPrice: async (): Promise<PriceResponse> => {
    return api.get<PriceResponse>("/prices/apt-usd");
  },

  /**
   * Force refresh APT/USD price from Chainlink
   * GET /api/prices/apt-usd/refresh
   */
  refreshAptUsdPrice: async (): Promise<PriceResponse> => {
    return api.get<PriceResponse>("/prices/apt-usd/refresh");
  },

  /**
   * Convert APT amount to USD
   */
  aptToUsd: (aptAmount: number, pricePerApt: number): number => {
    return aptAmount * pricePerApt;
  },

  /**
   * Convert USD amount to APT
   */
  usdToApt: (usdAmount: number, pricePerApt: number): number => {
    if (pricePerApt === 0) return 0;

    return usdAmount / pricePerApt;
  },

  /**
   * Format APT amount with USD value
   */
  formatAptWithUsd: (
    aptAmount: number,
    pricePerApt: number,
    options?: {
      showSymbol?: boolean;
      decimals?: number;
    },
  ): string => {
    const { showSymbol = true, decimals = 2 } = options || {};
    const usdValue = priceService.aptToUsd(aptAmount, pricePerApt);

    const aptFormatted = aptAmount.toFixed(decimals);
    const usdFormatted = usdValue.toFixed(decimals);

    if (showSymbol) {
      return `${aptFormatted} APT ($${usdFormatted})`;
    }

    return `${aptFormatted} ($${usdFormatted})`;
  },

  /**
   * Format USD value
   */
  formatUsd: (amount: number, decimals: number = 2): string => {
    return `$${amount.toFixed(decimals)}`;
  },

  /**
   * Format APT amount
   */
  formatApt: (amount: number, decimals: number = 2): string => {
    return `${amount.toFixed(decimals)} APT`;
  },
};

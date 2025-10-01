import { api } from "@/lib/api";

export interface YieldRecord {
  id: string;
  marketId: string;
  protocolId: string;
  amount: string;
  yieldAmount: string;
  apy: string;
  period: string;
  createdAt: string;
}

export interface Protocol {
  id: string;
  name: string;
  displayName: string;
  baseApy: string;
  description?: string;
  isActive: boolean;
  iconUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProtocolData {
  protocol: string;
  totalAmount: string;
  totalYield: string;
  averageApy: string;
}

export interface YieldTotals {
  totalYield: string;
  totalAmount: string;
  averageApy: string;
  activePoolSize: string;
}

export interface PerformanceData {
  timestamp: string;
  protocol: string;
  apy: number;
  amount: string;
  yield: string;
}

export interface YieldSummaryResponse {
  data: {
    protocolBreakdown: ProtocolData[];
    totals: YieldTotals;
    recentPerformance: PerformanceData[];
  };
}

export interface ApyRate {
  protocol: string;
  apy: number;
}

export interface CurrentApyResponse {
  data: {
    rates: ApyRate[];
    lastUpdated: string;
    source: string;
  };
}

export interface YieldListResponse {
  message: string;
  data: YieldRecord[] | Protocol[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    marketId?: string;
    hasMore: boolean;
  };
}

export interface ProtocolsResponse {
  message: string;
  data: Protocol[];
}

export interface UpdateYieldsResponse {
  message: string;
  data: {
    updated: number;
    errors: string[];
  };
}

export interface ContractTestResponse {
  message: string;
  data: {
    [contractAddress: string]: {
      connected: boolean;
      error?: string;
      blockNumber?: number;
    };
  };
}

export interface ContractApyResponse {
  message: string;
  data: {
    [protocol: string]: {
      apy: string;
      lastUpdated: string;
      contractAddress: string;
    };
  };
}

export const yieldService = {
  /**
   * Get basic yield data or market yield history
   * GET /api/yields
   */
  getYields: async (params?: {
    limit?: number;
    offset?: number;
    marketId?: string;
  }): Promise<YieldListResponse> => {
    const queryParams = new URLSearchParams();

    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());
    if (params?.marketId) queryParams.append("marketId", params.marketId);

    const url = queryParams.toString()
      ? `/yields?${queryParams.toString()}`
      : "/yields";

    return api.get<YieldListResponse>(url);
  },

  /**
   * Get market yield history for a specific market
   * GET /api/yields?marketId={marketId}
   */
  getMarketYieldHistory: async (
    marketId: string,
    limit?: number,
    offset?: number,
  ): Promise<YieldListResponse> => {
    return yieldService.getYields({ marketId, limit, offset });
  },

  /**
   * Get yield summary with protocol breakdown
   * GET /api/yields/summary
   */
  getYieldSummary: async (): Promise<YieldSummaryResponse> => {
    return api.get<YieldSummaryResponse>("/yields/summary");
  },

  /**
   * Get current APY rates from all protocols
   * GET /api/yields/apy/current
   */
  getCurrentApyRates: async (): Promise<CurrentApyResponse> => {
    return api.get<CurrentApyResponse>("/yields/apy/current");
  },

  /**
   * Get all available protocols
   * GET /api/yields/protocols
   */
  getProtocols: async (): Promise<ProtocolsResponse> => {
    return api.get<ProtocolsResponse>("/yields/protocols");
  },

  /**
   * Update yields for all markets based on current pool sizes
   * POST /api/yields/update
   */
  updateYields: async (): Promise<UpdateYieldsResponse> => {
    return api.post<UpdateYieldsResponse>("/yields/update", {});
  },

  /**
   * Test connectivity to deployed contracts
   * GET /api/yields/contract/test
   */
  testContractConnectivity: async (): Promise<ContractTestResponse> => {
    return api.get<ContractTestResponse>("/yields/contract/test");
  },

  /**
   * Get APY data directly from deployed contracts
   * GET /api/yields/contract/apy
   */
  getContractApyData: async (): Promise<ContractApyResponse> => {
    return api.get<ContractApyResponse>("/yields/contract/apy");
  },

  /**
   * Format APY for display
   */
  formatApy: (apy: string | number): string => {
    const num = typeof apy === "string" ? parseFloat(apy) : apy;

    if (isNaN(num)) return "0.00%";

    return `${num.toFixed(2)}%`;
  },

  /**
   * Format yield amount for display
   */
  formatYieldAmount: (amount: string | number): string => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;

    if (isNaN(num)) return "0";

    if (num === 0) return "0";
    if (num < 0.001) return "<0.001";
    if (num < 1) return num.toFixed(3);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;

    return num.toFixed(2);
  },

  /**
   * Get protocol color for UI
   */
  getProtocolColor: (protocol: string): string => {
    switch (protocol.toLowerCase()) {
      case "aave":
        return "#B6509E";
      case "morpho":
        return "#0FA9E6";
      case "compound":
        return "#00D395";
      default:
        return "#6366f1";
    }
  },

  /**
   * Get protocol display name
   */
  getProtocolDisplayName: (protocol: string): string => {
    switch (protocol.toLowerCase()) {
      case "aave":
        return "Aave V3";
      case "morpho":
        return "Morpho";
      case "compound":
        return "Compound V3";
      default:
        return protocol.charAt(0).toUpperCase() + protocol.slice(1);
    }
  },

  /**
   * Sort protocols by APY (descending)
   */
  sortProtocolsByApy: (protocols: ProtocolData[]): ProtocolData[] => {
    return [...protocols].sort((a, b) => {
      const apyA = parseFloat(a.averageApy);
      const apyB = parseFloat(b.averageApy);

      return apyB - apyA;
    });
  },

  /**
   * Sort APY rates by value (descending)
   */
  sortApyRates: (rates: ApyRate[]): ApyRate[] => {
    return [...rates].sort((a, b) => b.apy - a.apy);
  },

  /**
   * Calculate total yield across all protocols
   */
  calculateTotalYield: (protocols: ProtocolData[]): number => {
    return protocols.reduce((total, protocol) => {
      const yieldAmount = parseFloat(protocol.totalYield);

      return total + (isNaN(yieldAmount) ? 0 : yieldAmount);
    }, 0);
  },

  /**
   * Calculate weighted average APY
   */
  calculateWeightedAverageApy: (protocols: ProtocolData[]): number => {
    let totalAmount = 0;
    let weightedSum = 0;

    protocols.forEach((protocol) => {
      const amount = parseFloat(protocol.totalAmount);
      const apy = parseFloat(protocol.averageApy);

      if (!isNaN(amount) && !isNaN(apy)) {
        totalAmount += amount;
        weightedSum += amount * apy;
      }
    });

    return totalAmount > 0 ? weightedSum / totalAmount : 0;
  },

  /**
   * Get best performing protocol
   */
  getBestProtocol: (protocols: ProtocolData[]): ProtocolData | null => {
    if (protocols.length === 0) return null;

    return protocols.reduce((best, current) => {
      const bestApy = parseFloat(best.averageApy);
      const currentApy = parseFloat(current.averageApy);

      if (isNaN(bestApy)) return current;
      if (isNaN(currentApy)) return best;

      return currentApy > bestApy ? current : best;
    });
  },

  /**
   * Format last updated timestamp
   */
  formatLastUpdated: (timestamp: string): string => {
    try {
      const date = new Date(timestamp);

      if (isNaN(date.getTime())) return "Unknown";

      const now = new Date();
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60),
      );

      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

      const diffInHours = Math.floor(diffInMinutes / 60);

      if (diffInHours < 24) return `${diffInHours}h ago`;

      const diffInDays = Math.floor(diffInHours / 24);

      return `${diffInDays}d ago`;
    } catch {
      return "Unknown";
    }
  },

  /**
   * Get yield trend indication
   */
  getYieldTrend: (
    currentApy: number,
    previousApy?: number,
  ): {
    trend: "up" | "down" | "stable";
    change: number;
    changePercent: number;
  } => {
    if (!previousApy) {
      return { trend: "stable", change: 0, changePercent: 0 };
    }

    const change = currentApy - previousApy;
    const changePercent = previousApy !== 0 ? (change / previousApy) * 100 : 0;

    let trend: "up" | "down" | "stable" = "stable";

    if (Math.abs(changePercent) > 0.1) {
      trend = change > 0 ? "up" : "down";
    }

    return { trend, change, changePercent };
  },

  /**
   * Validate protocol name
   */
  isValidProtocol: (protocol: string): boolean => {
    const validProtocols = ["aave", "morpho", "compound"];

    return validProtocols.includes(protocol.toLowerCase());
  },

  /**
   * Get protocol description
   */
  getProtocolDescription: (protocol: string): string => {
    switch (protocol.toLowerCase()) {
      case "aave":
        return "Decentralized lending protocol with variable and stable rates";
      case "morpho":
        return "Peer-to-peer lending protocol optimizing rates on Aave and Compound";
      case "compound":
        return "Algorithmic money market protocol for lending and borrowing";
      default:
        return "DeFi lending protocol";
    }
  },

  /**
   * Calculate estimated daily earnings
   */
  estimateDailyEarnings: (
    amount: string | number,
    apy: string | number,
  ): number => {
    const principal = typeof amount === "string" ? parseFloat(amount) : amount;
    const annualRate = typeof apy === "string" ? parseFloat(apy) : apy;

    if (isNaN(principal) || isNaN(annualRate)) return 0;

    const dailyRate = annualRate / 365 / 100;

    return principal * dailyRate;
  },

  /**
   * Calculate estimated monthly earnings
   */
  estimateMonthlyEarnings: (
    amount: string | number,
    apy: string | number,
  ): number => {
    const principal = typeof amount === "string" ? parseFloat(amount) : amount;
    const annualRate = typeof apy === "string" ? parseFloat(apy) : apy;

    if (isNaN(principal) || isNaN(annualRate)) return 0;

    const monthlyRate = annualRate / 12 / 100;

    return principal * monthlyRate;
  },

  /**
   * Handle yield service errors
   */
  handleYieldError: (error: any): string => {
    if (error?.response?.data?.error?.message) {
      return error.response.data.error.message;
    }

    if (error?.message) {
      return error.message;
    }

    return "Failed to fetch yield data";
  },
};

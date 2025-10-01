import { api } from "@/lib/api";

export interface ChartDataPoint {
  time: number;
  value: number;
}

export interface VolumeDataPoint {
  time: number;
  value: number;
  color?: string;
}

export interface ChartApiResponse {
  success: boolean;
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

export interface ProbabilityResponse {
  success: boolean;
  data: {
    yes: ChartDataPoint[];
    no: ChartDataPoint[];
  };
  meta: {
    symbol: string;
    interval: string;
    data_points: number;
  };
}

export interface VolumeResponse {
  success: boolean;
  data: {
    yes: VolumeDataPoint[];
    no: VolumeDataPoint[];
    total: VolumeDataPoint[];
  };
  meta: {
    symbol: string;
    interval: string;
    data_points: number;
  };
}

export interface ChartConfigResponse {
  intervals: Array<{
    value: string;
    label: string;
    seconds: number;
  }>;
  series: Array<{
    name: string;
    label: string;
    type: string;
    description: string;
  }>;
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

export interface ChartFilters {
  interval?: "1m" | "5m" | "15m" | "1h" | "4h" | "1d";
  from?: number;
  to?: number;
  series?: string[];
}

export const chartService = {
  /**
   * Get chart data for a market
   * GET /api/charts/market/:identifier
   */
  getMarketChart: async (
    marketIdentifier: string,
    filters: ChartFilters = {},
  ): Promise<ChartApiResponse> => {
    const params = new URLSearchParams();

    if (filters.interval) params.append("interval", filters.interval);
    if (filters.from) params.append("from", filters.from.toString());
    if (filters.to) params.append("to", filters.to.toString());
    if (filters.series && filters.series.length > 0) {
      params.append("series", filters.series.join(","));
    }

    const queryString = params.toString();
    const url = `/charts/market/${marketIdentifier}${queryString ? `?${queryString}` : ""}`;

    return api.get<ChartApiResponse>(url);
  },

  /**
   * Get probability history for a market
   * GET /api/charts/market/:identifier/probability
   */
  getMarketProbability: async (
    marketIdentifier: string,
    filters: Omit<ChartFilters, "series"> = {},
  ): Promise<ProbabilityResponse> => {
    const params = new URLSearchParams();

    if (filters.interval) params.append("interval", filters.interval);
    if (filters.from) params.append("from", filters.from.toString());
    if (filters.to) params.append("to", filters.to.toString());

    const queryString = params.toString();
    const url = `/charts/market/${marketIdentifier}/probability${queryString ? `?${queryString}` : ""}`;

    return api.get<ProbabilityResponse>(url);
  },

  /**
   * Get volume history for a market
   * GET /api/charts/market/:identifier/volume
   */
  getMarketVolume: async (
    marketIdentifier: string,
    filters: Omit<ChartFilters, "series"> = {},
  ): Promise<VolumeResponse> => {
    const params = new URLSearchParams();

    if (filters.interval) params.append("interval", filters.interval);
    if (filters.from) params.append("from", filters.from.toString());
    if (filters.to) params.append("to", filters.to.toString());

    const queryString = params.toString();
    const url = `/charts/market/${marketIdentifier}/volume${queryString ? `?${queryString}` : ""}`;

    return api.get<VolumeResponse>(url);
  },

  /**
   * Get chart configuration and available intervals
   * GET /api/charts/config
   */
  getChartConfig: async (): Promise<ChartConfigResponse> => {
    return api.get<ChartConfigResponse>("/charts/config");
  },

  /**
   * Get chart data for specific time range
   */
  getMarketChartTimeRange: async (
    marketIdentifier: string,
    fromTimestamp: number,
    toTimestamp: number,
    interval: ChartFilters["interval"] = "1h",
    series: string[] = ["probability", "volume"],
  ): Promise<ChartApiResponse> => {
    return chartService.getMarketChart(marketIdentifier, {
      interval,
      from: fromTimestamp,
      to: toTimestamp,
      series,
    });
  },

  /**
   * Get recent chart data (last N hours)
   */
  getRecentChartData: async (
    marketIdentifier: string,
    hoursBack: number = 24,
    interval: ChartFilters["interval"] = "1h",
    series: string[] = ["probability", "volume"],
  ): Promise<ChartApiResponse> => {
    const now = Math.floor(Date.now() / 1000);
    const from = now - hoursBack * 60 * 60;

    return chartService.getMarketChart(marketIdentifier, {
      interval,
      from,
      to: now,
      series,
    });
  },

  /**
   * Get chart data for multiple markets (for comparison)
   */
  getMultipleMarketCharts: async (
    marketIdentifiers: string[],
    filters: ChartFilters = {},
  ): Promise<Record<string, ChartApiResponse>> => {
    const promises = marketIdentifiers.map(async (identifier) => {
      try {
        const data = await chartService.getMarketChart(identifier, filters);

        return { identifier, data };
      } catch {
        return { identifier, data: null };
      }
    });

    const results = await Promise.all(promises);

    return results.reduce(
      (acc, result) => {
        if (result.data) {
          acc[result.identifier] = result.data;
        }

        return acc;
      },
      {} as Record<string, ChartApiResponse>,
    );
  },

  /**
   * Format timestamp for chart display
   */
  formatChartTime: (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  /**
   * Format probability value for display
   */
  formatProbability: (value: number): string => {
    return `${value.toFixed(1)}%`;
  },

  /**
   * Format odds value for display
   */
  formatOdds: (value: number): string => {
    return `${value.toFixed(2)}x`;
  },

  /**
   * Format volume value for display
   */
  formatVolume: (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }

    return value.toFixed(2);
  },

  /**
   * Get interval display name
   */
  getIntervalDisplayName: (interval: string): string => {
    const intervalMap: Record<string, string> = {
      "1m": "1 Minute",
      "5m": "5 Minutes",
      "15m": "15 Minutes",
      "1h": "1 Hour",
      "4h": "4 Hours",
      "1d": "1 Day",
    };

    return intervalMap[interval] || interval;
  },

  /**
   * Get interval duration in seconds
   */
  getIntervalSeconds: (interval: string): number => {
    const intervalMap: Record<string, number> = {
      "1m": 60,
      "5m": 5 * 60,
      "15m": 15 * 60,
      "1h": 60 * 60,
      "4h": 4 * 60 * 60,
      "1d": 24 * 60 * 60,
    };

    return intervalMap[interval] || 3600;
  },

  /**
   * Calculate time range for given interval and number of data points
   */
  calculateTimeRange: (
    interval: string,
    dataPoints: number = 100,
  ): {
    from: number;
    to: number;
  } => {
    const now = Math.floor(Date.now() / 1000);
    const intervalSeconds = chartService.getIntervalSeconds(interval);
    const totalSeconds = intervalSeconds * dataPoints;

    return {
      from: now - totalSeconds,
      to: now,
    };
  },

  /**
   * Validate chart filters
   */
  validateFilters: (
    filters: ChartFilters,
  ): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (filters.interval) {
      const validIntervals = ["1m", "5m", "15m", "1h", "4h", "1d"];

      if (!validIntervals.includes(filters.interval)) {
        errors.push(
          "Invalid interval. Must be one of: " + validIntervals.join(", "),
        );
      }
    }

    if (filters.from && filters.from < 0) {
      errors.push("From timestamp must be positive");
    }

    if (filters.to && filters.to < 0) {
      errors.push("To timestamp must be positive");
    }

    if (filters.from && filters.to && filters.from >= filters.to) {
      errors.push("From timestamp must be earlier than to timestamp");
    }

    if (filters.series) {
      const validSeries = ["probability", "volume", "odds", "bets"];
      const invalidSeries = filters.series.filter(
        (s) => !validSeries.includes(s),
      );

      if (invalidSeries.length > 0) {
        errors.push(
          "Invalid series: " +
            invalidSeries.join(", ") +
            ". Valid series: " +
            validSeries.join(", "),
        );
      }
    }

    return { valid: errors.length === 0, errors };
  },

  /**
   * Get default filters for chart requests
   */
  getDefaultFilters: (): ChartFilters => {
    return {
      interval: "1h",
      series: ["probability", "volume"],
    };
  },

  /**
   * Calculate probability change between two data points
   */
  calculateProbabilityChange: (
    current: ChartDataPoint,
    previous: ChartDataPoint,
  ): { change: number; changePercent: number; isPositive: boolean } => {
    const change = current.value - previous.value;
    const changePercent =
      previous.value !== 0 ? (change / previous.value) * 100 : 0;

    return {
      change,
      changePercent,
      isPositive: change >= 0,
    };
  },

  /**
   * Find peak probability in dataset
   */
  findPeakProbability: (data: ChartDataPoint[]): ChartDataPoint | null => {
    if (data.length === 0) return null;

    return data.reduce((peak, current) =>
      current.value > peak.value ? current : peak,
    );
  },

  /**
   * Find minimum probability in dataset
   */
  findMinProbability: (data: ChartDataPoint[]): ChartDataPoint | null => {
    if (data.length === 0) return null;

    return data.reduce((min, current) =>
      current.value < min.value ? current : min,
    );
  },

  /**
   * Calculate average probability over time period
   */
  calculateAverageProbability: (data: ChartDataPoint[]): number => {
    if (data.length === 0) return 0;

    const sum = data.reduce((total, point) => total + point.value, 0);

    return sum / data.length;
  },

  /**
   * Get color for series type
   */
  getSeriesColor: (
    seriesType: string,
    position?: "yes" | "no" | "total",
  ): string => {
    const colors = {
      probability: {
        yes: "#10b981",
        no: "#f59e0b",
      },
      volume: {
        yes: "#22c55e",
        no: "#ef4444",
        total: "#6366f1",
      },
      odds: {
        yes: "#22c55e",
        no: "#ef4444",
      },
      bets: {
        total: "#6366f1",
      },
    };

    if (position && colors[seriesType as keyof typeof colors]) {
      const seriesColors = colors[seriesType as keyof typeof colors];

      return (seriesColors as any)[position] || "#6366f1";
    }

    return "#6366f1";
  },

  /**
   * Handle chart service errors
   */
  handleChartError: (error: any): string => {
    if (error?.response?.data?.error?.message) {
      return error.response.data.error.message;
    }

    if (error?.response?.status === 404) {
      return "Market chart data not found";
    }

    if (error?.message) {
      return error.message;
    }

    return "Failed to fetch chart data";
  },
};

import { api } from "@/lib/api";
import {
  Market,
  CreateMarketRequest,
  PlaceBetRequest,
  PlaceBetResponse,
  MarketListResponse,
} from "@/types/market";

export interface MarketFilters {
  limit?: number;
  offset?: number;
  status?: string;
  platform?: string;
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface BlockchainMarketRequest {
  question: string;
  description: string;
  duration: number;
  imageUrl?: string;
}

export interface BlockchainMarketResponse {
  success: boolean;
  message: string;
  data: {
    databaseId: string;
    adjTicker: string;
    marketId: string;
    blockchainMarketId: number;
    question: string;
    description: string;
    duration: number;
    endTime: number;
    blockchain: {
      txHash: string;
      blockNumber: number;
      chainId: number;
      contracts: {
        kizoMarket: string;
        aaveAdapter: string;
        usdc: string;
      };
    };
    explorer: {
      transaction: string;
      market: string;
    };
  };
}

export interface BlockchainStatusResponse {
  status: string;
  network: {
    chainId: number;
    blockNumber: number;
    gasPrice: string;
    name: string;
  };
  contracts: {
    kizoMarket: string;
    aaveAdapter: string;
    usdc: string;
  };
  market: {
    nextMarketId: number;
  };
  explorer: {
    base: string;
    market: string;
    adapter: string;
    usdc: string;
  };
}

export interface UpdateMarketImageRequest {
  imageUrl?: string | null;
}

export interface UpdateMarketImageResponse {
  message: string;
  data: {
    id: string;
    marketId: string;
    adjTicker: string;
    imageUrl: string | null;
    updatedAt: string;
  };
}

export const marketService = {
  /**
   * Get all markets from database with filtering and pagination
   * GET /api/markets
   */
  getAllMarkets: async (
    filters: MarketFilters = {},
  ): Promise<MarketListResponse> => {
    const params = new URLSearchParams();

    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.offset) params.append("offset", filters.offset.toString());
    if (filters.status) params.append("status", filters.status);
    if (filters.platform) params.append("platform", filters.platform);
    if (filters.search) params.append("search", filters.search);
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortDir) params.append("sortDir", filters.sortDir);

    const queryString = params.toString();
    const url = `/markets${queryString ? `?${queryString}` : ""}`;

    const response = await api.get<{
      data: Market[];
      meta: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
      };
    }>(url);

    return {
      success: true,
      data: response.data,
      meta: response.meta,
    };
  },

  /**
   * Get single market by identifier (ID or adjTicker)
   * GET /api/markets/:identifier
   */
  getMarketByIdentifier: async (identifier: string): Promise<Market | null> => {
    const response = await api.get<{
      data: Market;
    }>(`/markets/${identifier}`);

    return response.data || null;
  },

  /**
   * Get market data directly from blockchain
   * GET /api/markets/blockchain/:marketId
   */
  getBlockchainMarket: async (marketId: number): Promise<Market | null> => {
    const response = await api.get<{
      data: Market;
    }>(`/markets/blockchain/${marketId}`);

    return response.data || null;
  },

  /**
   * Create new market on blockchain
   * POST /api/markets/create-blockchain
   */
  createBlockchainMarket: async (
    marketData: BlockchainMarketRequest,
  ): Promise<BlockchainMarketResponse> => {
    return api.post<BlockchainMarketResponse>(
      "/markets/create-blockchain",
      marketData,
    );
  },

  /**
   * Get blockchain connection status
   * GET /api/markets/blockchain/status
   */
  getBlockchainStatus: async (): Promise<BlockchainStatusResponse> => {
    return api.get<BlockchainStatusResponse>("/markets/blockchain/status");
  },

  /**
   * Update market image URL
   * PUT /api/markets/:identifier/image
   */
  updateMarketImage: async (
    identifier: string,
    imageData: UpdateMarketImageRequest,
  ): Promise<UpdateMarketImageResponse> => {
    return api.put<UpdateMarketImageResponse>(
      `/markets/${identifier}/image`,
      imageData,
    );
  },

  getMarketById: async (marketId: string): Promise<Market | null> => {
    return marketService.getMarketByIdentifier(marketId);
  },

  placeBet: async (betData: PlaceBetRequest): Promise<PlaceBetResponse> => {
    return api.post<PlaceBetResponse>("/markets/bet", betData);
  },

  /**
   * Get active markets
   */
  getActiveMarkets: async (limit: number = 20): Promise<MarketListResponse> => {
    return marketService.getAllMarkets({
      status: "active",
      sortBy: "updatedAt",
      sortDir: "desc",
      limit,
    });
  },

  /**
   * Get trending markets (by activity)
   */
  getTrendingMarkets: async (
    limit: number = 10,
  ): Promise<MarketListResponse> => {
    return marketService.getAllMarkets({
      status: "active",
      sortBy: "activity",
      sortDir: "desc",
      limit,
    });
  },

  /**
   * Search markets by query
   */
  searchMarkets: async (
    query: string,
    limit: number = 20,
  ): Promise<MarketListResponse> => {
    return marketService.getAllMarkets({
      search: query,
      limit,
      sortBy: "updatedAt",
      sortDir: "desc",
    });
  },

  /**
   * Get markets by platform
   */
  getMarketsByPlatform: async (
    platform: string,
    limit: number = 20,
  ): Promise<MarketListResponse> => {
    return marketService.getAllMarkets({
      platform,
      limit,
      sortBy: "updatedAt",
      sortDir: "desc",
    });
  },

  formatEthAmount: (amount: string): string => {
    const num = parseFloat(amount);

    if (num === 0) return "0";
    if (num < 0.001) return "<0.001";
    if (num < 1) return num.toFixed(3);
    if (num < 100) return num.toFixed(2);

    return num.toFixed(1);
  },

  formatTimeRemaining: (endTime: string | Date): string => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;

    return `${minutes}m`;
  },

  formatTimestamp: (timestamp: number): string => {
    const date = new Date(timestamp * 1000);

    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return date.toLocaleString();
  },

  calculateOdds: (
    yesShares: string,
    noShares: string,
  ): { yes: number; no: number } => {
    const yes = parseFloat(yesShares || "0");
    const no = parseFloat(noShares || "0");
    const total = yes + no;

    if (total === 0) return { yes: 50, no: 50 };

    return {
      yes: Math.round((yes / total) * 100),
      no: Math.round((no / total) * 100),
    };
  },

  calculateProbability: (
    yesShares: number,
    noShares: number,
  ): { yes: number; no: number } => {
    const total = yesShares + noShares;

    if (total === 0) return { yes: 50, no: 50 };

    return {
      yes: (yesShares / total) * 100,
      no: (noShares / total) * 100,
    };
  },

  formatVolume: (volume: number): string => {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`;
    }
    if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(1)}K`;
    }

    return `$${volume.toFixed(2)}`;
  },

  formatProbability: (probability: number): string => {
    return `${probability.toFixed(1)}%`;
  },

  validateMarketData: (marketData: CreateMarketRequest): string[] => {
    const errors: string[] = [];

    if (!marketData.question || marketData.question.trim().length < 10) {
      errors.push("Question must be at least 10 characters long");
    }

    if (!marketData.category || marketData.category.trim().length === 0) {
      errors.push("Category is required");
    }

    const endTime = new Date(marketData.endTime);
    const now = new Date();

    if (endTime <= now) {
      errors.push("End time must be in the future");
    }

    const funding = parseFloat(marketData.initialFunding);

    if (isNaN(funding) || funding <= 0) {
      errors.push("Initial funding must be a positive number");
    }

    return errors;
  },

  validateBlockchainMarketData: (
    marketData: BlockchainMarketRequest,
  ): string[] => {
    const errors: string[] = [];

    if (!marketData.question || marketData.question.trim().length < 10) {
      errors.push("Question must be at least 10 characters long");
    }

    if (!marketData.description || marketData.description.trim().length < 20) {
      errors.push("Description must be at least 20 characters long");
    }

    if (!marketData.duration || marketData.duration < 3600) {
      errors.push("Duration must be at least 1 hour (3600 seconds)");
    }

    if (marketData.duration > 31536000) {
      errors.push("Duration cannot exceed 1 year (31536000 seconds)");
    }

    if (marketData.imageUrl && marketData.imageUrl.trim()) {
      const urlPattern = /^https?:\/\/.+/;

      if (!urlPattern.test(marketData.imageUrl)) {
        errors.push("Image URL must be a valid HTTP/HTTPS URL");
      }
    }

    return errors;
  },

  /**
   * Get default market filters
   */
  getDefaultFilters: (): MarketFilters => {
    return {
      limit: 20,
      offset: 0,
      status: "active",
      sortBy: "updatedAt",
      sortDir: "desc",
    };
  },

  /**
   * Handle market service errors
   */
  handleMarketError: (error: any): string => {
    if (error?.response?.data?.error?.message) {
      return error.response.data.error.message;
    }

    if (error?.response?.status === 404) {
      return "Market not found";
    }

    if (error?.response?.status === 400) {
      return "Invalid market request";
    }

    if (error?.message) {
      return error.message;
    }

    return "Failed to fetch market data";
  },

  /**
   * Check if market is expired based on end time
   */
  isMarketExpired: (endTime: string | Date | number): boolean => {
    const end =
      typeof endTime === "number"
        ? new Date(endTime * 1000)
        : new Date(endTime);

    return end.getTime() <= Date.now();
  },

  /**
   * Calculate time until market expiration
   */
  getTimeUntilExpiration: (
    endTime: string | Date | number,
  ): {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
    formatted: string;
  } => {
    const end =
      typeof endTime === "number"
        ? new Date(endTime * 1000)
        : new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
        formatted: "Expired",
      };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    let formatted = "";

    if (days > 0) {
      formatted = `${days}d ${hours}h`;
    } else if (hours > 0) {
      formatted = `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      formatted = `${minutes}m ${seconds}s`;
    } else {
      formatted = `${seconds}s`;
    }

    return {
      days,
      hours,
      minutes,
      seconds,
      isExpired: false,
      formatted,
    };
  },
};

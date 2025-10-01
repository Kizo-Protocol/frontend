import { api } from "@/lib/api";

export interface User {
  id: string;
  address: string;
  username?: string | null;
  avatarUrl?: string | null;
}

export interface Market {
  id: string;
  question: string;
  blockchainMarketId?: number | null;
  endDate: string;
  status: string;
  platform?: string;
}

export interface Bet {
  id: string;
  userId: string;
  marketId: string;
  blockchainBetId?: number | null;
  position: boolean;
  amount: string;
  odds: string;
  payout?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  market?: Market;
}

export interface BetFilters {
  limit?: number;
  offset?: number;
  userAddress?: string;
  marketId?: string;
  status?: string;
  position?: boolean;
}

export interface BetListResponse {
  data: Bet[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface PlaceBetRequest {
  marketIdentifier: string;
  position: boolean;
  amount: string | number;
  userAddress: string;
}

export interface PlaceBetResponse {
  success: boolean;
  message: string;
  data: {
    betId: string;
    blockchainBetId: number;
    marketId: string;
    blockchainMarketId: number;
    position: boolean;
    amount: string;
    txHash: string;
    user: {
      address: string;
    };
    blockchain: {
      txHash: string;
      betId: number;
    };
    explorer: {
      transaction: string;
    };
  };
}

export interface BetStatsResponse {
  data: {
    totalBets: number;
    activeBets: number;
    wonBets: number;
    lostBets: number;
    winRate: number;
    totalAmount: string;
    totalPayout: string;
    profit: string;
  };
}

export interface SingleBetResponse {
  data: Bet;
}

export const betService = {
  /**
   * Get bets with filtering and pagination
   * GET /api/bets
   */
  getBets: async (filters: BetFilters = {}): Promise<BetListResponse> => {
    const params = new URLSearchParams();

    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.offset) params.append("offset", filters.offset.toString());
    if (filters.userAddress) params.append("userAddress", filters.userAddress);
    if (filters.marketId) params.append("marketId", filters.marketId);
    if (filters.status) params.append("status", filters.status);
    if (filters.position !== undefined)
      params.append("position", filters.position.toString());

    const queryString = params.toString();
    const url = `/bets${queryString ? `?${queryString}` : ""}`;

    return api.get<BetListResponse>(url);
  },

  /**
   * Place a bet on a market
   * POST /api/bets
   */
  placeBet: async (request: PlaceBetRequest): Promise<PlaceBetResponse> => {
    return api.post<PlaceBetResponse>("/bets", request);
  },

  /**
   * Get betting statistics summary
   * GET /api/bets/stats/summary
   */
  getBetStats: async (userAddress?: string): Promise<BetStatsResponse> => {
    const params = userAddress ? `?userAddress=${userAddress}` : "";

    return api.get<BetStatsResponse>(`/bets/stats/summary${params}`);
  },

  /**
   * Get a specific bet by ID
   * GET /api/bets/:betId
   */
  getBetById: async (betId: string): Promise<SingleBetResponse> => {
    return api.get<SingleBetResponse>(`/bets/${betId}`);
  },

  /**
   * Get user's bets with filtering
   */
  getUserBets: async (
    userAddress: string,
    filters: Omit<BetFilters, "userAddress"> = {},
  ): Promise<BetListResponse> => {
    return betService.getBets({ ...filters, userAddress });
  },

  /**
   * Get bets for a specific market
   */
  getMarketBets: async (
    marketId: string,
    filters: Omit<BetFilters, "marketId"> = {},
  ): Promise<BetListResponse> => {
    return betService.getBets({ ...filters, marketId });
  },

  /**
   * Get active bets for a user
   */
  getActiveBets: async (
    userAddress: string,
    filters: Omit<BetFilters, "userAddress" | "status"> = {},
  ): Promise<BetListResponse> => {
    return betService.getBets({ ...filters, userAddress, status: "active" });
  },

  /**
   * Get won bets for a user
   */
  getWonBets: async (
    userAddress: string,
    filters: Omit<BetFilters, "userAddress" | "status"> = {},
  ): Promise<BetListResponse> => {
    return betService.getBets({ ...filters, userAddress, status: "won" });
  },

  /**
   * Get lost bets for a user
   */
  getLostBets: async (
    userAddress: string,
    filters: Omit<BetFilters, "userAddress" | "status"> = {},
  ): Promise<BetListResponse> => {
    return betService.getBets({ ...filters, userAddress, status: "lost" });
  },

  /**
   * Validate bet amount
   */
  validateBetAmount: (
    amount: string | number,
  ): { valid: boolean; error?: string } => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

    if (isNaN(numAmount)) {
      return { valid: false, error: "Amount must be a valid number" };
    }

    if (numAmount <= 0) {
      return { valid: false, error: "Amount must be greater than 0" };
    }

    if (numAmount > 1000000) {
      return { valid: false, error: "Amount is too large" };
    }

    return { valid: true };
  },

  /**
   * Format bet amount for display
   */
  formatAmount: (amount: string | number): string => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;

    if (isNaN(num)) return "0";

    if (num === 0) return "0";
    if (num < 0.001) return "<0.001";
    if (num < 1) return num.toFixed(3);
    if (num < 100) return num.toFixed(2);

    return num.toFixed(1);
  },

  /**
   * Format odds for display
   */
  formatOdds: (odds: string | number): string => {
    const num = typeof odds === "string" ? parseFloat(odds) : odds;

    if (isNaN(num)) return "0.00x";

    return `${num.toFixed(2)}x`;
  },

  /**
   * Format profit for display with color indication
   */
  formatProfit: (
    profit: string | number,
  ): {
    formatted: string;
    isPositive: boolean;
    isNegative: boolean;
    isZero: boolean;
  } => {
    const num = typeof profit === "string" ? parseFloat(profit) : profit;

    if (isNaN(num)) {
      return {
        formatted: "0",
        isPositive: false,
        isNegative: false,
        isZero: true,
      };
    }

    const formatted = betService.formatAmount(Math.abs(num));

    return {
      formatted: num >= 0 ? `+${formatted}` : `-${formatted}`,
      isPositive: num > 0,
      isNegative: num < 0,
      isZero: num === 0,
    };
  },

  /**
   * Calculate potential payout
   */
  calculatePayout: (amount: string | number, odds: string | number): number => {
    const betAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    const betOdds = typeof odds === "string" ? parseFloat(odds) : odds;

    if (isNaN(betAmount) || isNaN(betOdds)) return 0;

    return betAmount * betOdds;
  },

  /**
   * Get bet status color for UI
   */
  getBetStatusColor: (status: string): string => {
    switch (status.toLowerCase()) {
      case "active":
        return "blue";
      case "won":
        return "green";
      case "lost":
        return "red";
      case "cancelled":
        return "gray";
      default:
        return "gray";
    }
  },

  /**
   * Get position label
   */
  getPositionLabel: (position: boolean): string => {
    return position ? "Yes" : "No";
  },

  /**
   * Get position color for UI
   */
  getPositionColor: (position: boolean): string => {
    return position ? "green" : "red";
  },

  /**
   * Format bet date for display
   */
  formatBetDate: (dateString: string): string => {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) return "Invalid date";

    const now = new Date();
    const diffInHours =
      Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString(undefined, {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString();
    }
  },

  /**
   * Handle betting errors
   */
  handleBetError: (error: any): string => {
    if (error?.response?.data?.error?.message) {
      return error.response.data.error.message;
    }

    if (error?.response?.data?.error?.type === "blockchain_error") {
      return "Blockchain transaction failed. Please try again.";
    }

    if (error?.message) {
      return error.message;
    }

    return "Failed to process bet";
  },

  /**
   * Check if market is available for betting
   */
  isMarketBettable: (
    market: Market,
  ): { bettable: boolean; reason?: string } => {
    if (market.status !== "active") {
      return { bettable: false, reason: "Market is not active" };
    }

    const endDate = new Date(market.endDate);
    const now = new Date();

    if (endDate <= now) {
      return { bettable: false, reason: "Market has ended" };
    }

    if (!market.blockchainMarketId) {
      return { bettable: false, reason: "Market not available on blockchain" };
    }

    return { bettable: true };
  },
};

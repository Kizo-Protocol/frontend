export interface Market {
  id: string;
  adjTicker: string;
  marketId: string;
  blockchainMarketId: number;
  platform: string;
  question: string;
  description: string;
  rules: string;
  status: "active" | "resolved" | "closed" | string;
  probability: number;
  volume: string;
  openInterest: string;
  endDate: string;
  resolutionDate: string;
  result: string | null;
  link: string;
  imageUrl: string;
  totalPoolSize: string;
  yesPoolSize: string;
  noPoolSize: string;
  countYes: number;
  countNo: number;
  currentYield: string;
  totalYieldEarned: string;
  dailyYield?: number;
  totalYieldUntilEnd?: number;
  daysRemaining?: number;
  bestProtocolApy?: number;
  bestProtocolName?: string;
  createdAt: string;
  updatedAt: string;
  bets: Bet[];
  _count: {
    bets: number;
  };
}

export interface CreateMarketRequest {
  question: string;
  description?: string;
  category: string;
  endTime: string;
  initialFunding: string;
}

export interface CreateMarketResponse {
  success: boolean;
  market?: Market;
  transactionHash?: string;
  blockchainMarketId?: number;
  error?: string;
}

export interface MarketStatusResponse {
  success: boolean;
  contractAddress: string;
  network: string;
  isConnected: boolean;
  blockNumber?: number;
}

export interface PlaceBetRequest {
  marketId: number;
  isYes: boolean;
  amount: string;
}

export interface PlaceBetResponse {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface MarketListResponse {
  success: boolean;
  data: Market[];
  meta?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface SingleMarketResponse extends ApiResponse<Market> {}

export interface ApiWrapperResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

export interface User {
  id: string;
  address: string;
  email?: string;
  username?: string;
  avatarUrl?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface UserProfile {
  id: string;
  address: string;
  username?: string;
  avatarUrl?: string;
}

export interface Bet {
  id: string;
  userId: string;
  marketId: string;
  blockchainBetId?: number;
  position: boolean;
  amount: string;
  odds: string;
  status: "active" | "won" | "lost" | "cancelled";
  payout?: string;
  createdAt: string | Date;
  updatedAt: string | Date;

  user?: UserProfile;
  market?: {
    id: string;
    question: string;
    blockchainMarketId?: number;
    endDate: string | Date;
    status: string;
    platform?: string;
  };
}

export interface PlaceBetRequestNew {
  marketIdentifier: string;
  position: boolean;
  amount: string;
  userAddress: string;
}

export interface PlaceBetResponseNew {
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

export interface BetListResponse extends ApiResponse<Bet[]> {
  meta?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface SingleBetResponse extends ApiResponse<Bet> {}

export interface BetFilters {
  limit?: number;
  offset?: number;
  userAddress?: string;
  marketId?: string;
  status?: "active" | "won" | "lost" | "cancelled";
  position?: boolean;
}

export interface BetStats {
  totalBets: number;
  activeBets: number;
  wonBets: number;
  lostBets: number;
  winRate: number;
  totalAmount: string;
  totalPayout: string;
  profit: string;
}

export interface BetStatsResponse extends ApiResponse<BetStats> {}

export interface BlockchainBetData {
  user: string;
  marketId: number;
  position: boolean;
  amount: string;
  timestamp: number;
  claimed: boolean;
  yieldShare: string;
}

export type BetPosition = "YES" | "NO";

export interface BetFormData {
  amount: number;
  position: boolean;
}

export interface BetValidationError {
  field: string;
  message: string;
}

export interface User {
  id: string;
  address: string;
  username: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Bet {
  id: string;
  marketId: string;
  position: boolean;
  amount: string;
  odds: string;
  payout: string | null;
  status: string;
  createdAt: string;
  market: {
    id: string;
    adjTicker: string;
    question: string;
    status: string;
    imageUrl?: string;
  };
}

export interface UserWithBets extends User {
  bets: Bet[];
  _count: {
    bets: number;
  };
}

export interface WalletConnectRequest {
  address: string;
}

export interface WalletConnectResponse {
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface UpdateProfileRequest {
  username?: string | null;
  avatarUrl?: string | null;
}

export interface UpdateProfileResponse {
  message: string;
  data: {
    user: User;
  };
}

export interface GetCurrentUserResponse {
  data: UserWithBets;
}

export interface RefreshTokenResponse {
  message: string;
  data: {
    token: string;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  connectWallet: (address: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  refreshToken: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  setError: (error: string | null) => void;
}

import { api } from "@/lib/api";

export interface User {
  id: string;
  address: string;
  username?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithBets extends User {
  bets: Array<{
    id: string;
    marketId: string;
    position: boolean;
    amount: string;
    odds: string;
    payout?: string | null;
    status: string;
    createdAt: string;
    market: {
      id: string;
      adjTicker: string;
      question: string;
      status: string;
      imageUrl?: string;
    };
  }>;
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

export interface RefreshTokenResponse {
  message: string;
  data: {
    token: string;
  };
}

export interface UpdateProfileRequest {
  username?: string;
  avatarUrl?: string;
}

export interface UpdateProfileResponse {
  message: string;
  data: {
    user: User;
  };
}

export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    details?: string;
  };
}

export const authService = {
  /**
   * Connect wallet and get/create user
   * POST /api/auth/wallet
   */
  connectWallet: async (
    request: WalletConnectRequest,
  ): Promise<WalletConnectResponse> => {
    const response = await api.post<WalletConnectResponse>(
      "/auth/wallet",
      request,
    );

    if (response.data?.token) {
      localStorage.setItem("auth_token", response.data.token);
    }

    return response;
  },

  /**
   * Get current user info
   * GET /api/auth/me
   */
  getCurrentUser: async (): Promise<UserWithBets> => {
    const response = await api.get<ApiResponse<UserWithBets>>("/auth/me");

    if (!response.data) {
      throw new Error("No user data received");
    }

    return response.data;
  },

  /**
   * Refresh JWT token
   * POST /api/auth/refresh
   */
  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const response = await api.post<RefreshTokenResponse>("/auth/refresh", {});

    if (response.data?.token) {
      localStorage.setItem("auth_token", response.data.token);
    }

    return response;
  },

  /**
   * Update user profile (username and avatar)
   * PUT /api/auth/profile
   */
  updateProfile: async (
    request: UpdateProfileRequest,
  ): Promise<UpdateProfileResponse> => {
    return api.put<UpdateProfileResponse>("/auth/profile", request);
  },

  /**
   * Logout user (clear token and cleanup)
   */
  logout: (): void => {
    localStorage.removeItem("auth_token");

    localStorage.removeItem("user_preferences");
    localStorage.removeItem("wallet_connection");
  },

  /**
   * Check if token exists but wallet is disconnected and clean up if needed
   */
  cleanupOrphanedToken: (isWalletConnected: boolean): boolean => {
    const token = localStorage.getItem("auth_token");

    if (token && !isWalletConnected) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_preferences");
      localStorage.removeItem("wallet_connection");

      return true;
    }

    return false;
  },

  /**
   * Enhanced logout that handles wallet disconnection
   * Always returns true to ensure wallet is disconnected on logout
   */
  logoutWithWallet: async (): Promise<{ shouldDisconnectWallet: boolean }> => {
    try {
      authService.logout();

      return {
        shouldDisconnectWallet: true,
      };
    } catch {
      authService.logout();

      return {
        shouldDisconnectWallet: true,
      };
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem("auth_token");

    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;

      return payload.exp > currentTime;
    } catch {
      return false;
    }
  },

  /**
   * Get stored authentication token
   */
  getToken: (): string | null => {
    return localStorage.getItem("auth_token");
  },

  /**
   * Validate wallet address format (Aptos addresses)
   */
  validateWalletAddress: (address: string): boolean => {
    return /^0x[a-fA-F0-9]{1,64}$/.test(address);
  },

  /**
   * Validate username format
   */
  validateUsername: (username: string): { valid: boolean; error?: string } => {
    if (typeof username !== "string") {
      return { valid: false, error: "Username must be a string" };
    }

    const trimmed = username.trim();

    if (trimmed.length < 3 || trimmed.length > 30) {
      return {
        valid: false,
        error: "Username must be between 3 and 30 characters",
      };
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      return {
        valid: false,
        error:
          "Username can only contain letters, numbers, hyphens, and underscores",
      };
    }

    return { valid: true };
  },

  /**
   * Validate avatar URL format
   */
  validateAvatarUrl: (url: string): { valid: boolean; error?: string } => {
    if (typeof url !== "string") {
      return { valid: false, error: "Avatar URL must be a string" };
    }

    const trimmed = url.trim();

    if (trimmed && !trimmed.match(/^https?:\/\/.+/)) {
      return {
        valid: false,
        error: "Avatar URL must be a valid HTTP/HTTPS URL",
      };
    }

    return { valid: true };
  },

  /**
   * Get user display name (username or shortened address)
   */
  getDisplayName: (user: User): string => {
    if (user.username) {
      return user.username;
    }

    return `${user.address.slice(0, 6)}...${user.address.slice(-4)}`;
  },

  /**
   * Format wallet address for display
   */
  formatAddress: (
    address: string,
    startChars: number = 6,
    endChars: number = 4,
  ): string => {
    if (!address || address.length < startChars + endChars) {
      return address;
    }

    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
  },

  /**
   * Handle authentication errors
   */
  handleAuthError: (error: any): string => {
    if (error?.response?.data?.error?.message) {
      return error.response.data.error.message;
    }

    if (error?.message) {
      return error.message;
    }

    return "Authentication failed";
  },
};

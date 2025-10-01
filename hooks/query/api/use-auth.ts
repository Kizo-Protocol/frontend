"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  authService,
  WalletConnectRequest,
  UpdateProfileRequest,
} from "@/services/auth.service";

export const AUTH_QUERY_KEYS = {
  all: ["auth"] as const,
  user: () => [...AUTH_QUERY_KEYS.all, "user"] as const,
  profile: () => [...AUTH_QUERY_KEYS.user(), "profile"] as const,
};

export function useCurrentUser(enabled = true) {
  const isAuth =
    typeof window !== "undefined" ? authService.isAuthenticated() : false;

  return useQuery({
    queryKey: AUTH_QUERY_KEYS.profile(),
    queryFn: () => authService.getCurrentUser(),
    enabled: enabled && isAuth,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        return false;
      }

      return failureCount < 2;
    },
  });
}

export function useConnectWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: WalletConnectRequest) =>
      authService.connectWallet(request),
    onSuccess: (data) => {
      if (data.data?.user) {
        queryClient.setQueryData(AUTH_QUERY_KEYS.profile(), data.data.user);
      }

      queryClient.invalidateQueries({
        queryKey: AUTH_QUERY_KEYS.user(),
      });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateProfileRequest) =>
      authService.updateProfile(request),
    onSuccess: (data) => {
      if (data.data?.user) {
        queryClient.setQueryData(AUTH_QUERY_KEYS.profile(), data.data.user);
      }

      queryClient.invalidateQueries({
        queryKey: AUTH_QUERY_KEYS.profile(),
      });
    },
  });
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: () => authService.refreshToken(),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await authService.logoutWithWallet();

      return result;
    },
    onSuccess: async (result) => {
      try {
        queryClient.clear();

        if (result.shouldDisconnectWallet && typeof window !== "undefined") {
          window.dispatchEvent(new Event("aptos-wallet-disconnect"));
        }

        await new Promise((resolve) => setTimeout(resolve, 100));

        window.location.href = "/";
      } catch {
        window.location.href = "/";
      }
    },
    onError: async () => {
      queryClient.clear();
      authService.logout();

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("aptos-wallet-disconnect"));
      }

      window.location.href = "/";
    },
  });
}

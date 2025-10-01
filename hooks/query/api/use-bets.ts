"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";

import {
  betService,
  BetFilters,
  PlaceBetRequest,
} from "@/services/bet.service";

export const BET_QUERY_KEYS = {
  all: ["bets"] as const,
  lists: () => [...BET_QUERY_KEYS.all, "list"] as const,
  list: (filters: BetFilters) => [...BET_QUERY_KEYS.lists(), filters] as const,
  stats: () => [...BET_QUERY_KEYS.all, "stats"] as const,
  userStats: (userAddress: string) =>
    [...BET_QUERY_KEYS.stats(), userAddress] as const,
  detail: (betId: string) => [...BET_QUERY_KEYS.all, "detail", betId] as const,
};

export function useBets(filters: BetFilters = {}, enabled = true) {
  return useQuery({
    queryKey: BET_QUERY_KEYS.list(filters),
    queryFn: () => betService.getBets(filters),
    enabled,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

export function useUserBets(
  userAddress: string,
  filters: Omit<BetFilters, "userAddress"> = {},
  enabled = true,
) {
  return useQuery({
    queryKey: BET_QUERY_KEYS.list({ ...filters, userAddress }),
    queryFn: () => betService.getUserBets(userAddress, filters),
    enabled: enabled && !!userAddress,
    staleTime: 1000 * 60 * 1,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

export function useActiveBets(
  userAddress: string,
  filters: Omit<BetFilters, "userAddress" | "status"> = {},
  enabled = true,
) {
  return useQuery({
    queryKey: BET_QUERY_KEYS.list({
      ...filters,
      userAddress,
      status: "active",
    }),
    queryFn: () => betService.getActiveBets(userAddress, filters),
    enabled: enabled && !!userAddress,
    staleTime: 1000 * 60 * 1,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

export function useWonBets(
  userAddress: string,
  filters: Omit<BetFilters, "userAddress" | "status"> = {},
  enabled = true,
) {
  return useQuery({
    queryKey: BET_QUERY_KEYS.list({ ...filters, userAddress, status: "won" }),
    queryFn: () => betService.getWonBets(userAddress, filters),
    enabled: enabled && !!userAddress,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

export function useLostBets(
  userAddress: string,
  filters: Omit<BetFilters, "userAddress" | "status"> = {},
  enabled = true,
) {
  return useQuery({
    queryKey: BET_QUERY_KEYS.list({ ...filters, userAddress, status: "lost" }),
    queryFn: () => betService.getLostBets(userAddress, filters),
    enabled: enabled && !!userAddress,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

export function useBetStats(userAddress?: string, enabled = true) {
  return useQuery({
    queryKey: userAddress
      ? BET_QUERY_KEYS.userStats(userAddress)
      : BET_QUERY_KEYS.stats(),
    queryFn: () => betService.getBetStats(userAddress),
    enabled: enabled && (userAddress ? !!userAddress : true),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

export function useBet(betId: string, enabled = true) {
  return useQuery({
    queryKey: BET_QUERY_KEYS.detail(betId),
    queryFn: () => betService.getBetById(betId),
    enabled: enabled && !!betId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

export function useMarketBets(
  marketId: string,
  filters: Omit<BetFilters, "marketId"> = {},
  enabled = true,
) {
  return useQuery({
    queryKey: BET_QUERY_KEYS.list({ ...filters, marketId }),
    queryFn: () => betService.getMarketBets(marketId, filters),
    enabled: enabled && !!marketId,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

export function usePlaceBet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (betData: PlaceBetRequest) => betService.placeBet(betData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: BET_QUERY_KEYS.lists(),
      });

      if (variables.userAddress) {
        queryClient.invalidateQueries({
          queryKey: BET_QUERY_KEYS.userStats(variables.userAddress),
        });
        queryClient.invalidateQueries({
          queryKey: BET_QUERY_KEYS.list({ userAddress: variables.userAddress }),
        });
      }

      if (data.data?.marketId) {
        queryClient.invalidateQueries({
          queryKey: BET_QUERY_KEYS.list({ marketId: data.data.marketId }),
        });
      }

      queryClient.invalidateQueries({
        queryKey: ["markets"],
      });
    },
  });
}

export function useBetFilters(initialFilters: BetFilters = {}) {
  const [filters, setFilters] = useState<BetFilters>(initialFilters);

  const updateFilter = useCallback(
    (key: keyof BetFilters, value: BetFilters[keyof BetFilters]) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,

        offset: key !== "offset" ? 0 : (value as number),
      }));
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    clearFilters,
  };
}

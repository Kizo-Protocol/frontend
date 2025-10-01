"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { priceService } from "@/services/price.service";

export const PRICE_QUERY_KEYS = {
  all: ["prices"] as const,
  aptUsd: () => [...PRICE_QUERY_KEYS.all, "apt-usd"] as const,
};

/**
 * Hook to fetch APT/USD price from Chainlink
 * Automatically refetches every 5 minutes
 */
export function useAptUsdPrice(options?: { enabled?: boolean }) {
  const { enabled = true } = options || {};

  return useQuery({
    queryKey: PRICE_QUERY_KEYS.aptUsd(),
    queryFn: () => priceService.getAptUsdPrice(),
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchInterval: 1000 * 60 * 5,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook to manually refresh APT/USD price from Chainlink
 */
export function useRefreshAptUsdPrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => priceService.refreshAptUsdPrice(),
    onSuccess: (data) => {
      queryClient.setQueryData(PRICE_QUERY_KEYS.aptUsd(), data);
    },
  });
}

/**
 * Hook to get price with utility functions
 * Returns price data and conversion utilities
 */
export function usePriceUtils() {
  const { data: priceData, isLoading, error } = useAptUsdPrice();
  const price = priceData?.data?.price || 0;

  return {
    price,
    priceData,
    isLoading,
    error,

    aptToUsd: (aptAmount: number) => priceService.aptToUsd(aptAmount, price),
    usdToApt: (usdAmount: number) => priceService.usdToApt(usdAmount, price),
    formatAptWithUsd: (
      aptAmount: number,
      options?: { showSymbol?: boolean; decimals?: number },
    ) => priceService.formatAptWithUsd(aptAmount, price, options),
    formatUsd: (amount: number, decimals?: number) =>
      priceService.formatUsd(amount, decimals),
    formatApt: (amount: number, decimals?: number) =>
      priceService.formatApt(amount, decimals),
  };
}

/**
 * Hook for price display formatting
 * Lightweight hook for just formatting without fetching
 */
export function usePriceFormatter() {
  return {
    formatAptWithUsd: (
      aptAmount: number,
      pricePerApt: number,
      options?: {
        showSymbol?: boolean;
        decimals?: number;
      },
    ) => priceService.formatAptWithUsd(aptAmount, pricePerApt, options),
    formatUsd: (amount: number, decimals: number = 2) =>
      priceService.formatUsd(amount, decimals),
    formatApt: (amount: number, decimals: number = 2) =>
      priceService.formatApt(amount, decimals),
    aptToUsd: (aptAmount: number, pricePerApt: number) =>
      priceService.aptToUsd(aptAmount, pricePerApt),
    usdToApt: (usdAmount: number, pricePerApt: number) =>
      priceService.usdToApt(usdAmount, pricePerApt),
  };
}

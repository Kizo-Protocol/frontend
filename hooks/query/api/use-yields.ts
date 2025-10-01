import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  yieldService,
  type YieldListResponse,
  type YieldSummaryResponse,
  type CurrentApyResponse,
  type ProtocolsResponse,
  type UpdateYieldsResponse,
  type ContractTestResponse,
  type ContractApyResponse,
  type YieldRecord,
  type Protocol,
  type ProtocolData,
  type YieldTotals,
  type PerformanceData,
  type ApyRate,
} from "@/services/yield.service";

export type {
  YieldRecord,
  Protocol,
  ProtocolData,
  YieldTotals,
  PerformanceData,
  ApyRate,
  YieldListResponse,
  YieldSummaryResponse,
  CurrentApyResponse,
  ProtocolsResponse,
  UpdateYieldsResponse,
  ContractTestResponse,
  ContractApyResponse,
};

export const yieldKeys = {
  all: ["yields"] as const,
  lists: () => [...yieldKeys.all, "list"] as const,
  list: (params?: { limit?: number; offset?: number; marketId?: string }) =>
    [...yieldKeys.lists(), params] as const,
  marketHistory: (marketId: string, limit?: number, offset?: number) =>
    [...yieldKeys.all, "market", marketId, { limit, offset }] as const,
  summary: () => [...yieldKeys.all, "summary"] as const,
  apyRates: () => [...yieldKeys.all, "apy", "current"] as const,
  protocols: () => [...yieldKeys.all, "protocols"] as const,
  contractTest: () => [...yieldKeys.all, "contract", "test"] as const,
  contractApy: () => [...yieldKeys.all, "contract", "apy"] as const,
};

/**
 * Hook to fetch yield data with optional filtering
 * @param params - Optional query parameters for pagination and filtering
 * @param options - React Query options
 */
export const useYields = (
  params?: {
    limit?: number;
    offset?: number;
    marketId?: string;
  },
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
    staleTime?: number;
  },
) => {
  return useQuery({
    queryKey: yieldKeys.list(params),
    queryFn: () => yieldService.getYields(params),
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
    staleTime: options?.staleTime ?? 1000 * 60 * 5,
  });
};

/**
 * Hook to fetch market yield history for a specific market
 * @param marketId - The market ID to fetch history for
 * @param limit - Optional limit for pagination
 * @param offset - Optional offset for pagination
 * @param options - React Query options
 */
export const useMarketYieldHistory = (
  marketId: string,
  limit?: number,
  offset?: number,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
    staleTime?: number;
  },
) => {
  return useQuery({
    queryKey: yieldKeys.marketHistory(marketId, limit, offset),
    queryFn: () => yieldService.getMarketYieldHistory(marketId, limit, offset),
    enabled: (options?.enabled ?? true) && !!marketId,
    refetchInterval: options?.refetchInterval,
    staleTime: options?.staleTime ?? 1000 * 60 * 5,
  });
};

/**
 * Hook to fetch yield summary with protocol breakdown
 * @param options - React Query options
 */
export const useYieldSummary = (options?: {
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
}) => {
  return useQuery({
    queryKey: yieldKeys.summary(),
    queryFn: () => yieldService.getYieldSummary(),
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval ?? 1000 * 60 * 2,
    staleTime: options?.staleTime ?? 1000 * 60 * 1,
  });
};

/**
 * Hook to fetch current APY rates from all protocols
 * @param options - React Query options
 */
export const useCurrentApyRates = (options?: {
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
}) => {
  return useQuery({
    queryKey: yieldKeys.apyRates(),
    queryFn: () => yieldService.getCurrentApyRates(),
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval ?? 1000 * 60 * 1,
    staleTime: options?.staleTime ?? 1000 * 30,
  });
};

/**
 * Hook to fetch all available protocols
 * @param options - React Query options
 */
export const useProtocols = (options?: {
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
}) => {
  return useQuery({
    queryKey: yieldKeys.protocols(),
    queryFn: () => yieldService.getProtocols(),
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
    staleTime: options?.staleTime ?? 1000 * 60 * 10,
  });
};

/**
 * Hook to test connectivity to deployed contracts
 * @param options - React Query options
 */
export const useContractConnectivityTest = (options?: {
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
}) => {
  return useQuery({
    queryKey: yieldKeys.contractTest(),
    queryFn: () => yieldService.testContractConnectivity(),
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
    staleTime: options?.staleTime ?? 1000 * 60 * 5,
    retry: 2,
  });
};

/**
 * Hook to get APY data directly from deployed contracts
 * @param options - React Query options
 */
export const useContractApyData = (options?: {
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
}) => {
  return useQuery({
    queryKey: yieldKeys.contractApy(),
    queryFn: () => yieldService.getContractApyData(),
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval ?? 1000 * 60 * 2,
    staleTime: options?.staleTime ?? 1000 * 60 * 1,
    retry: 2,
  });
};

/**
 * Hook to update yields for all markets
 * @param options - React Query mutation options
 */
export const useUpdateYields = (options?: {
  onSuccess?: (data: UpdateYieldsResponse) => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => yieldService.updateYields(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: yieldKeys.all });
      options?.onSuccess?.(data);
    },
  });
};

/**
 * Hook to get sorted protocols by APY
 * @param protocols - Array of protocol data
 */
export const useSortedProtocolsByApy = (protocols?: ProtocolData[]) => {
  return protocols ? yieldService.sortProtocolsByApy(protocols) : [];
};

/**
 * Hook to get sorted APY rates
 * @param rates - Array of APY rates
 */
export const useSortedApyRates = (rates?: ApyRate[]) => {
  return rates ? yieldService.sortApyRates(rates) : [];
};

/**
 * Hook to calculate total yield
 * @param protocols - Array of protocol data
 */
export const useTotalYield = (protocols?: ProtocolData[]) => {
  return protocols ? yieldService.calculateTotalYield(protocols) : 0;
};

/**
 * Hook to calculate weighted average APY
 * @param protocols - Array of protocol data
 */
export const useWeightedAverageApy = (protocols?: ProtocolData[]) => {
  return protocols ? yieldService.calculateWeightedAverageApy(protocols) : 0;
};

/**
 * Hook to get the best performing protocol
 * @param protocols - Array of protocol data
 */
export const useBestProtocol = (protocols?: ProtocolData[]) => {
  return protocols ? yieldService.getBestProtocol(protocols) : null;
};

/**
 * Hook to estimate daily earnings
 * @param amount - Principal amount
 * @param apy - Annual percentage yield
 */
export const useEstimateDailyEarnings = (
  amount: string | number,
  apy: string | number,
) => {
  return yieldService.estimateDailyEarnings(amount, apy);
};

/**
 * Hook to estimate monthly earnings
 * @param amount - Principal amount
 * @param apy - Annual percentage yield
 */
export const useEstimateMonthlyEarnings = (
  amount: string | number,
  apy: string | number,
) => {
  return yieldService.estimateMonthlyEarnings(amount, apy);
};

/**
 * Hook to get yield trend
 * @param currentApy - Current APY value
 * @param previousApy - Previous APY value for comparison
 */
export const useYieldTrend = (currentApy: number, previousApy?: number) => {
  return yieldService.getYieldTrend(currentApy, previousApy);
};

export const {
  formatApy,
  formatYieldAmount,
  formatLastUpdated,
  getProtocolColor,
  getProtocolDisplayName,
  getProtocolDescription,
  isValidProtocol,
  handleYieldError,
} = yieldService;

const yieldHooks = {
  useYields,
  useMarketYieldHistory,
  useYieldSummary,
  useCurrentApyRates,
  useProtocols,
  useContractConnectivityTest,
  useContractApyData,
  useUpdateYields,
  useSortedProtocolsByApy,
  useSortedApyRates,
  useTotalYield,
  useWeightedAverageApy,
  useBestProtocol,
  useEstimateDailyEarnings,
  useEstimateMonthlyEarnings,
  useYieldTrend,
  yieldKeys,
};

export default yieldHooks;

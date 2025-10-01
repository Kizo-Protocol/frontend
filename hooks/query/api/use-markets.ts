"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { useState, useCallback, useMemo } from "react";

import {
  marketService,
  MarketFilters,
  BlockchainMarketRequest,
  UpdateMarketImageRequest,
} from "@/services/market.service";
import { Market, PlaceBetRequest } from "@/types/market";

export const MARKET_QUERY_KEYS = {
  all: ["markets"] as const,
  lists: () => [...MARKET_QUERY_KEYS.all, "list"] as const,
  list: (filters: MarketFilters) =>
    [...MARKET_QUERY_KEYS.lists(), filters] as const,
  details: () => [...MARKET_QUERY_KEYS.all, "detail"] as const,
  detail: (identifier: string) =>
    [...MARKET_QUERY_KEYS.details(), identifier] as const,
  blockchain: () => [...MARKET_QUERY_KEYS.all, "blockchain"] as const,
  blockchainMarket: (marketId: number) =>
    [...MARKET_QUERY_KEYS.blockchain(), "market", marketId] as const,
  blockchainStatus: () =>
    [...MARKET_QUERY_KEYS.blockchain(), "status"] as const,
  active: (limit?: number) =>
    [...MARKET_QUERY_KEYS.lists(), "active", { limit }] as const,
  trending: (limit?: number) =>
    [...MARKET_QUERY_KEYS.lists(), "trending", { limit }] as const,
  search: (query: string, limit?: number) =>
    [...MARKET_QUERY_KEYS.lists(), "search", { query, limit }] as const,
  platform: (platform: string, limit?: number) =>
    [...MARKET_QUERY_KEYS.lists(), "platform", { platform, limit }] as const,
};

export function useMarkets(filters: MarketFilters = {}, enabled = true) {
  return useQuery({
    queryKey: MARKET_QUERY_KEYS.list(filters),
    queryFn: () => marketService.getAllMarkets(filters),
    enabled,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

export function useInfiniteMarkets(
  baseFilters: Omit<MarketFilters, "offset"> = {},
  pageSize = 20,
) {
  return useInfiniteQuery({
    queryKey: [
      ...MARKET_QUERY_KEYS.lists(),
      "infinite",
      { ...baseFilters, limit: pageSize },
    ],
    queryFn: async ({ pageParam = 0 }) => {
      return marketService.getAllMarkets({
        ...baseFilters,
        limit: pageSize,
        offset: pageParam * pageSize,
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.data || lastPage.data.length < pageSize) {
        return undefined;
      }

      return allPages.length;
    },
    initialPageParam: 0,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
}

export function useMarket(identifier: string, enabled = true) {
  return useQuery({
    queryKey: MARKET_QUERY_KEYS.detail(identifier),
    queryFn: () => marketService.getMarketByIdentifier(identifier),
    enabled: enabled && !!identifier,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
    retry: 2,
  });
}

export function useBlockchainMarket(marketId: number, enabled = true) {
  return useQuery({
    queryKey: MARKET_QUERY_KEYS.blockchainMarket(marketId),
    queryFn: () => marketService.getBlockchainMarket(marketId),
    enabled: enabled && !!marketId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

export function useBlockchainStatus(enabled = true) {
  return useQuery({
    queryKey: MARKET_QUERY_KEYS.blockchainStatus(),
    queryFn: marketService.getBlockchainStatus,
    enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

export function useActiveMarkets(limit = 20, enabled = true) {
  return useQuery({
    queryKey: MARKET_QUERY_KEYS.active(limit),
    queryFn: () => marketService.getActiveMarkets(limit),
    enabled,
    staleTime: 1000 * 60 * 1,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

export function useTrendingMarkets(limit = 10, enabled = true) {
  return useQuery({
    queryKey: MARKET_QUERY_KEYS.trending(limit),
    queryFn: () => marketService.getTrendingMarkets(limit),
    enabled,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

export function useSearchMarkets(query: string, limit = 20, enabled = true) {
  return useQuery({
    queryKey: MARKET_QUERY_KEYS.search(query, limit),
    queryFn: () => marketService.searchMarkets(query, limit),
    enabled: enabled && !!query.trim(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

export function useMarketsByPlatform(
  platform: string,
  limit = 20,
  enabled = true,
) {
  return useQuery({
    queryKey: MARKET_QUERY_KEYS.platform(platform, limit),
    queryFn: () => marketService.getMarketsByPlatform(platform, limit),
    enabled: enabled && !!platform,
    staleTime: 1000 * 60 * 3,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

export function useMultipleMarkets(identifiers: string[], enabled = true) {
  return useQuery({
    queryKey: [...MARKET_QUERY_KEYS.details(), "multiple", identifiers],
    queryFn: async () => {
      const promises = identifiers.map((id) =>
        marketService.getMarketByIdentifier(id),
      );
      const results = await Promise.all(promises);

      return identifiers.reduce(
        (acc, identifier, index) => {
          if (results[index]) {
            acc[identifier] = results[index];
          }

          return acc;
        },
        {} as Record<string, Market>,
      );
    },
    enabled: enabled && identifiers.length > 0,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
}

export function useCreateBlockchainMarket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (marketData: BlockchainMarketRequest) =>
      marketService.createBlockchainMarket(marketData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: MARKET_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: MARKET_QUERY_KEYS.blockchainStatus(),
      });

      if (data.data?.databaseId) {
        queryClient.setQueryData(
          MARKET_QUERY_KEYS.detail(data.data.databaseId),

          data.data,
        );
      }
    },
  });
}

export function usePlaceBet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (betData: PlaceBetRequest) => marketService.placeBet(betData),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: MARKET_QUERY_KEYS.detail(variables.marketId.toString()),
      });

      queryClient.invalidateQueries({ queryKey: MARKET_QUERY_KEYS.lists() });

      queryClient.invalidateQueries({
        queryKey: ["charts", "market", variables.marketId],
      });
    },
  });
}

export function useUpdateMarketImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      identifier,
      imageData,
    }: {
      identifier: string;
      imageData: UpdateMarketImageRequest;
    }) => marketService.updateMarketImage(identifier, imageData),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        MARKET_QUERY_KEYS.detail(variables.identifier),
        (oldData: Market | null | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              imageUrl: data.data.imageUrl,
              updatedAt: data.data.updatedAt,
            };
          }

          return oldData;
        },
      );

      queryClient.invalidateQueries({ queryKey: MARKET_QUERY_KEYS.lists() });
    },
  });
}

export function useMarketFilters(initialFilters: MarketFilters = {}) {
  const [filters, setFilters] = useState<MarketFilters>({
    ...marketService.getDefaultFilters(),
    ...initialFilters,
  });

  const updateFilter = useCallback(
    (key: keyof MarketFilters, value: MarketFilters[keyof MarketFilters]) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,

        offset: key !== "offset" ? 0 : (value as number),
      }));
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters({
      ...marketService.getDefaultFilters(),
      ...initialFilters,
    });
  }, [initialFilters]);

  const clearSearch = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      search: undefined,
      offset: 0,
    }));
  }, []);

  return {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    clearSearch,
  };
}

export function usePrefetchMarket() {
  const queryClient = useQueryClient();

  return useCallback(
    (identifier: string) => {
      queryClient.prefetchQuery({
        queryKey: MARKET_QUERY_KEYS.detail(identifier),
        queryFn: () => marketService.getMarketByIdentifier(identifier),
        staleTime: 1000 * 60 * 2,
      });
    },
    [queryClient],
  );
}

export function useMarketAnalytics(market: Market | null) {
  return useMemo(() => {
    if (!market) return null;

    const yesPoolValue = parseFloat(market.yesPoolSize || "0");
    const noPoolValue = parseFloat(market.noPoolSize || "0");
    const totalPoolValue = parseFloat(market.totalPoolSize || "0");
    const volumeValue = parseFloat(market.volume || "0");

    const odds = marketService.calculateOdds(
      market.yesPoolSize || "0",
      market.noPoolSize || "0",
    );

    const probability = marketService.calculateProbability(
      yesPoolValue,
      noPoolValue,
    );

    const timeRemaining = marketService.getTimeUntilExpiration(market.endDate);
    const isExpired = marketService.isMarketExpired(market.endDate);

    const currentProbability = market.probability || probability.yes;

    return {
      odds,
      probability,
      timeRemaining,
      isExpired,

      yesPool: yesPoolValue,
      noPool: noPoolValue,
      totalPool: totalPoolValue,
      volume: volumeValue,
      currentProbability,

      formattedVolume: marketService.formatVolume(volumeValue),
      formattedTotalPool: marketService.formatVolume(totalPoolValue),
      formattedTimeRemaining: marketService.formatTimeRemaining(market.endDate),
      formattedYesProbability: marketService.formatProbability(probability.yes),
      formattedNoProbability: marketService.formatProbability(probability.no),
      formattedCurrentProbability:
        marketService.formatProbability(currentProbability),

      yesPoolRatio: totalPoolValue > 0 ? yesPoolValue / totalPoolValue : 0.5,
      noPoolRatio: totalPoolValue > 0 ? noPoolValue / totalPoolValue : 0.5,

      isActive: market.status === "active",
      isResolved: market.status === "resolved",
      betCount: market._count?.bets || 0,

      liquidity: totalPoolValue,
      openInterest: parseFloat(market.openInterest || "0"),
    };
  }, [market]);
}

export function useMarketPolling(
  identifier: string,
  interval = 30000,
  enabled = true,
) {
  return useQuery({
    queryKey: [...MARKET_QUERY_KEYS.detail(identifier), "polling"],
    queryFn: () => marketService.getMarketByIdentifier(identifier),
    enabled: enabled && !!identifier,
    refetchInterval: interval,
    refetchIntervalInBackground: true,
    staleTime: 1000 * 15,
  });
}

export function useBatchMarketOperations() {
  const queryClient = useQueryClient();

  const prefetchMarkets = useCallback(
    async (identifiers: string[]) => {
      const promises = identifiers.map((identifier) =>
        queryClient.prefetchQuery({
          queryKey: MARKET_QUERY_KEYS.detail(identifier),
          queryFn: () => marketService.getMarketByIdentifier(identifier),
          staleTime: 1000 * 60 * 2,
        }),
      );

      await Promise.all(promises);
    },
    [queryClient],
  );

  const invalidateMarkets = useCallback(
    (identifiers?: string[]) => {
      if (identifiers) {
        identifiers.forEach((identifier) => {
          queryClient.invalidateQueries({
            queryKey: MARKET_QUERY_KEYS.detail(identifier),
          });
        });
      } else {
        queryClient.invalidateQueries({ queryKey: MARKET_QUERY_KEYS.all });
      }
    },
    [queryClient],
  );

  return {
    prefetchMarkets,
    invalidateMarkets,
  };
}

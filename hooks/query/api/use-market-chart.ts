"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useMemo } from "react";

import {
  ChartApiResponse,
  ChartTimeframe,
  MarketChartData,
  ChartState,
  ChartActions,
} from "@/types/components/market-chart.types";
import { api } from "@/lib/api";
import { toUTCTimestamp } from "@/lib/chart-config";

export const CHART_QUERY_KEYS = {
  all: ["charts"] as const,
  market: (marketId: string) =>
    [...CHART_QUERY_KEYS.all, "market", marketId] as const,
  marketChart: (marketId: string, timeframe: string, series: string[]) =>
    [...CHART_QUERY_KEYS.market(marketId), { timeframe, series }] as const,
  config: () => [...CHART_QUERY_KEYS.all, "config"] as const,
};

function transformApiResponse(apiResponse: ChartApiResponse): MarketChartData {
  const transformDataPoints = (
    points: Array<{ time: number; value: number }>,
  ) =>
    points.map((point) => ({
      time: toUTCTimestamp(point.time),
      value: point.value,
    }));

  const transformVolumePoints = (
    points: Array<{ time: number; value: number; color?: string }>,
  ) =>
    points.map((point) => ({
      time: toUTCTimestamp(point.time),
      value: point.value,
      color: point.color,
    }));

  return {
    yesProbability: apiResponse.data.probability?.yes
      ? transformDataPoints(apiResponse.data.probability.yes)
      : [],
    noProbability: apiResponse.data.probability?.no
      ? transformDataPoints(apiResponse.data.probability.no)
      : [],
    yesVolume: apiResponse.data.volume?.yes
      ? transformVolumePoints(apiResponse.data.volume.yes)
      : [],
    noVolume: apiResponse.data.volume?.no
      ? transformVolumePoints(apiResponse.data.volume.no)
      : [],
    totalVolume: apiResponse.data.volume?.total
      ? transformVolumePoints(apiResponse.data.volume.total)
      : [],
    yesOdds: apiResponse.data.odds?.yes
      ? transformDataPoints(apiResponse.data.odds.yes)
      : [],
    noOdds: apiResponse.data.odds?.no
      ? transformDataPoints(apiResponse.data.odds.no)
      : [],
    betCount: apiResponse.data.bets
      ? transformDataPoints(apiResponse.data.bets)
      : [],
  };
}

async function fetchChartData(
  marketId: string,
  timeframe: ChartTimeframe["interval"],
  series: string[],
): Promise<MarketChartData> {
  const seriesParam = series.join(",");
  const response = await api.get<ChartApiResponse>(
    `/charts/market/${marketId}?interval=${timeframe}&series=${seriesParam}`,
  );

  return transformApiResponse(response);
}

async function fetchChartConfig() {
  return api.get<any>("/charts/config");
}

export function useMarketChart(
  marketId: string,
  options: {
    defaultTimeframe?: ChartTimeframe["interval"];
    defaultSeries?: string[];
    enabled?: boolean;
  } = {},
) {
  const [timeframe, setTimeframe] = useState<ChartTimeframe["interval"]>(
    options.defaultTimeframe || "1h",
  );
  const [selectedSeries, setSelectedSeries] = useState<string[]>(
    options.defaultSeries || ["probability", "volume"],
  );

  const {
    data: chartData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: CHART_QUERY_KEYS.marketChart(marketId, timeframe, selectedSeries),
    queryFn: () => fetchChartData(marketId, timeframe, selectedSeries),
    enabled: options.enabled !== false && !!marketId,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const actions: ChartActions = {
    setTimeframe: useCallback((newTimeframe: ChartTimeframe["interval"]) => {
      setTimeframe(newTimeframe);
    }, []),

    toggleSeries: useCallback((seriesName: string) => {
      setSelectedSeries((current) => {
        if (current.includes(seriesName)) {
          return current.filter((s) => s !== seriesName);
        } else {
          return [...current, seriesName];
        }
      });
    }, []),

    setSeries: useCallback((series: string[]) => {
      setSelectedSeries(series);
    }, []),

    refetch: useCallback(() => {
      refetch();
    }, [refetch]),
  };

  const state: ChartState = {
    timeframe,
    selectedSeries,
    isLoading,
    error: error ? (error as Error).message : null,
    data: chartData || null,
  };

  return { state, actions };
}

export function useChartConfig() {
  return useQuery({
    queryKey: CHART_QUERY_KEYS.config(),
    queryFn: fetchChartConfig,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
}

export function useMultipleMarketCharts(
  marketIds: string[],
  timeframe: ChartTimeframe["interval"] = "1h",
  series: string[] = ["probability"],
) {
  const queries = useQuery({
    queryKey: ["multiple-charts", marketIds, timeframe, series],
    queryFn: async () => {
      const promises = marketIds.map((marketId) =>
        fetchChartData(marketId, timeframe, series),
      );
      const results = await Promise.all(promises);

      return marketIds.reduce(
        (acc, marketId, index) => {
          acc[marketId] = results[index];

          return acc;
        },
        {} as Record<string, MarketChartData>,
      );
    },
    enabled: marketIds.length > 0,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });

  return queries;
}

export function useChartPolling(
  marketId: string,
  timeframe: ChartTimeframe["interval"],
  series: string[],
  interval: number = 30000,
) {
  return useQuery({
    queryKey: CHART_QUERY_KEYS.marketChart(marketId, timeframe, series),
    queryFn: () => fetchChartData(marketId, timeframe, series),
    enabled: !!marketId,
    refetchInterval: interval,
    refetchIntervalInBackground: true,
    staleTime: 1000 * 15,
  });
}

export function useMarketChartWithTimeRange(
  marketId: string,
  timeframe: ChartTimeframe["interval"],
  series: string[],
  fromTimestamp?: number,
  toTimestamp?: number,
) {
  return useQuery({
    queryKey: [
      ...CHART_QUERY_KEYS.marketChart(marketId, timeframe, series),
      { from: fromTimestamp, to: toTimestamp },
    ],
    queryFn: async () => {
      const seriesParam = series.join(",");
      let url = `/charts/market/${marketId}?interval=${timeframe}&series=${seriesParam}`;

      if (fromTimestamp) {
        url += `&from=${fromTimestamp}`;
      }
      if (toTimestamp) {
        url += `&to=${toTimestamp}`;
      }

      const response = await api.get<ChartApiResponse>(url);

      return transformApiResponse(response);
    },
    enabled: !!marketId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useChartAnalytics(chartData: MarketChartData | null) {
  return useMemo(() => {
    if (!chartData) return null;

    const { yesProbability, noVolume, yesVolume, totalVolume } = chartData;

    const currentYesProbability =
      yesProbability.length > 0
        ? yesProbability[yesProbability.length - 1].value
        : 50;

    const totalVol = totalVolume.reduce((sum, point) => sum + point.value, 0);

    const yesVol = yesVolume.reduce((sum, point) => sum + point.value, 0);
    const noVol = noVolume.reduce((sum, point) => sum + point.value, 0);

    const probabilityChange =
      yesProbability.length >= 2
        ? yesProbability[yesProbability.length - 1].value -
          yesProbability[0].value
        : 0;

    return {
      currentYesProbability,
      currentNoProbability: 100 - currentYesProbability,
      totalVolume: totalVol,
      yesVolume: yesVol,
      noVolume: noVol,
      volumeRatio: totalVol > 0 ? yesVol / totalVol : 0.5,
      probabilityChange,
      dataPoints: yesProbability.length,
    };
  }, [chartData]);
}

export function usePrefetchChart() {
  const queryClient = useQueryClient();

  return useCallback(
    (
      marketId: string,
      timeframe: ChartTimeframe["interval"] = "1h",
      series: string[] = ["probability", "volume"],
    ) => {
      queryClient.prefetchQuery({
        queryKey: CHART_QUERY_KEYS.marketChart(marketId, timeframe, series),
        queryFn: () => fetchChartData(marketId, timeframe, series),
        staleTime: 1000 * 60 * 2,
      });
    },
    [queryClient],
  );
}

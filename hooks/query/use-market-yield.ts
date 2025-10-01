"use client";

import { useQuery } from "@tanstack/react-query";
import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";

import {
  APTOS_NETWORK,
  KIZO_CONTRACT_ADDRESS,
  MODULE_PATHS,
  COIN_TYPES,
  CONTRACT_CONSTANTS,
} from "@/lib/aptos-contracts";
import { normalize } from "@/lib/helper/bignumber";

const config = new AptosConfig({ network: APTOS_NETWORK });
const aptos = new Aptos(config);

interface MarketYieldData {
  currentYield: string;
  totalBalance: string;
  totalDeposited: string;
  yieldPercentage: number;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 100;

export function useMarketYield(
  marketId: number | undefined,
  totalPoolSize: string | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: ["market-yield", marketId, totalPoolSize],
    queryFn: async (): Promise<MarketYieldData | null> => {
      if (!marketId || !totalPoolSize) {
        return null;
      }

      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime;

      if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        await delay(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
      }
      lastRequestTime = Date.now();

      try {
        const marketResult = await aptos.view({
          payload: {
            function: `${MODULE_PATHS.PREDICTION_MARKET}::get_market`,
            typeArguments: [COIN_TYPES.APT],
            functionArguments: [KIZO_CONTRACT_ADDRESS, marketId.toString()],
          },
        });

        const protocolSelectorAddr = marketResult[11] as string;

        if (!protocolSelectorAddr) {
          return null;
        }

        await delay(50);

        const result = await aptos.view({
          payload: {
            function: `${MODULE_PATHS.PROTOCOL_SELECTOR}::get_total_balance`,
            typeArguments: [COIN_TYPES.APT],
            functionArguments: [protocolSelectorAddr, KIZO_CONTRACT_ADDRESS],
          },
        });

        const totalBalanceOctas = result[0] as number | string;
        const totalDepositedOctas = totalPoolSize;

        const balanceNum =
          typeof totalBalanceOctas === "string"
            ? parseFloat(totalBalanceOctas)
            : totalBalanceOctas;
        const depositedNum = parseFloat(totalDepositedOctas);

        const yieldOctas = Math.max(0, balanceNum - depositedNum);

        const currentYield = normalize(
          yieldOctas.toString(),
          CONTRACT_CONSTANTS.APT_DECIMALS,
        );
        const totalBalance = normalize(
          balanceNum.toString(),
          CONTRACT_CONSTANTS.APT_DECIMALS,
        );
        const totalDeposited = normalize(
          depositedNum.toString(),
          CONTRACT_CONSTANTS.APT_DECIMALS,
        );

        const yieldPercentage =
          depositedNum > 0 ? (yieldOctas / depositedNum) * 100 : 0;

        return {
          currentYield,
          totalBalance,
          totalDeposited,
          yieldPercentage,
        };
      } catch (error: any) {
        if (error?.status === 429 || error?.message?.includes("429")) {
          throw new Error("Rate limited");
        }

        return null;
      }
    },
    enabled: enabled && !!marketId && !!totalPoolSize,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchInterval: 1000 * 60 * 3,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

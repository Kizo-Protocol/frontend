import { useQueryClient } from "@tanstack/react-query";

import {
  PREDICTION_MARKET_FUNCTIONS,
  DEFAULT_COIN_TYPE,
  KIZO_CONTRACT_ADDRESS,
} from "@/lib/aptos-contracts";
import { MARKET_QUERY_KEYS } from "@/hooks/query/api/use-markets";

import {
  ContractStep,
  useMultiStepTransaction,
} from "./use-multi-step-transaction";

export type BetParams = {
  contractAddr?: string;
  marketId: number;
  position: boolean;
  amount: number;
};

export const useBet = () => {
  const queryClient = useQueryClient();

  const result = useMultiStepTransaction<BetParams>({
    steps: [
      {
        id: "place-bet",
        type: "contract",
        name: "Place Bet",
        description: "Place a bet on the prediction market",
        buildTransaction: async (params) => {
          const contractAddr = params.contractAddr || KIZO_CONTRACT_ADDRESS;

          return {
            function: PREDICTION_MARKET_FUNCTIONS.PLACE_BET,
            typeArguments: [DEFAULT_COIN_TYPE],
            functionArguments: [
              contractAddr,
              params.marketId,
              params.position,
              params.amount,
            ],
          };
        },
        onSuccess: async () => {
          await new Promise((resolve) => setTimeout(resolve, 2000));

          queryClient.invalidateQueries({ queryKey: MARKET_QUERY_KEYS.all });
          queryClient.invalidateQueries({ queryKey: ["bets"] });

          for (let i = 0; i < 3; i++) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            queryClient.invalidateQueries({ queryKey: MARKET_QUERY_KEYS.all });
          }
        },
      } as ContractStep,
    ],
    finalizationDelay: 500,
    stopOnError: true,
  });

  return result;
};

/**
 * Example Move module structure for reference:
 *
 * module kizo_market {
 *   use aptos_framework::coin;
 *   use aptos_framework::aptos_coin::AptosCoin;
 *
 *   public entry fun place_bet<CoinType>(
 *     account: &signer,
 *     market_id: u64,
 *     position: bool,
 *     amount: u64
 *   ) {
 *
 *   }
 * }
 */

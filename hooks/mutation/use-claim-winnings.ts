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

export type ClaimWinningsParams = {
  contractAddr?: string;
  marketId: number;
  betIndex: number;
};

export const useClaimWinnings = () => {
  const queryClient = useQueryClient();

  const result = useMultiStepTransaction<ClaimWinningsParams>({
    steps: [
      {
        id: "claim-winnings",
        type: "contract",
        name: "Claim Winnings",
        description: "Claim your winnings from the prediction market",
        buildTransaction: async (params) => {
          const contractAddr = params.contractAddr || KIZO_CONTRACT_ADDRESS;

          return {
            function: PREDICTION_MARKET_FUNCTIONS.CLAIM_WINNINGS,
            typeArguments: [DEFAULT_COIN_TYPE],
            functionArguments: [contractAddr, params.marketId, params.betIndex],
          };
        },
        onSuccess: async () => {
          await new Promise((resolve) => setTimeout(resolve, 2000));

          queryClient.invalidateQueries({ queryKey: MARKET_QUERY_KEYS.all });
          queryClient.invalidateQueries({ queryKey: ["bets"] });
          queryClient.invalidateQueries({ queryKey: ["auth", "me"] });

          for (let i = 0; i < 3; i++) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            queryClient.invalidateQueries({ queryKey: MARKET_QUERY_KEYS.all });
            queryClient.invalidateQueries({ queryKey: ["bets"] });
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
 * module kizo::kizo_prediction_market {
 *   public entry fun claim_winnings<CoinType>(
 *     user: &signer,
 *     contract_addr: address,
 *     market_id: u64,
 *     bet_index: u64
 *   ) acquires PredictionMarketState {
 *
 *   }
 * }
 */

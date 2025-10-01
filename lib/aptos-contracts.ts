/**
 * Aptos Contract Addresses and Configuration
 *
 * This file contains the deployed Move module addresses and function names
 * for interacting with the Kizo Prediction Market on Aptos.
 */

import { Network } from "@aptos-labs/ts-sdk";

import { normalize } from "@/lib/helper/bignumber";

export const KIZO_CONTRACT_ADDRESS =
  "0x66c4ec614f237de2470e107a17329e17d2e9d04bd6f609bdb7f7b52ae24c957c";

export const APTOS_NETWORK = Network.TESTNET;

export const MODULES = {
  PREDICTION_MARKET: "kizo_prediction_market",
  PROTOCOL_SELECTOR: "protocol_selector",
  ACCESS_CONTROL: "access_control",
} as const;

export const MODULE_PATHS = {
  PREDICTION_MARKET: `${KIZO_CONTRACT_ADDRESS}::${MODULES.PREDICTION_MARKET}`,
  PROTOCOL_SELECTOR: `${KIZO_CONTRACT_ADDRESS}::${MODULES.PROTOCOL_SELECTOR}`,
  ACCESS_CONTROL: `${KIZO_CONTRACT_ADDRESS}::${MODULES.ACCESS_CONTROL}`,
} as const;

export const PREDICTION_MARKET_FUNCTIONS = {
  INITIALIZE: `${MODULE_PATHS.PREDICTION_MARKET}::initialize`,
  CREATE_MARKET: `${MODULE_PATHS.PREDICTION_MARKET}::create_market`,
  PLACE_BET: `${MODULE_PATHS.PREDICTION_MARKET}::place_bet`,
  RESOLVE_MARKET: `${MODULE_PATHS.PREDICTION_MARKET}::resolve_market`,
  CLAIM_WINNINGS: `${MODULE_PATHS.PREDICTION_MARKET}::claim_winnings`,
  WITHDRAW_PROTOCOL_FEES: `${MODULE_PATHS.PREDICTION_MARKET}::withdraw_protocol_fees`,
  UPDATE_PROTOCOL_FEE: `${MODULE_PATHS.PREDICTION_MARKET}::update_protocol_fee`,
  UPDATE_FEE_RECIPIENT: `${MODULE_PATHS.PREDICTION_MARKET}::update_fee_recipient`,
  PAUSE: `${MODULE_PATHS.PREDICTION_MARKET}::pause`,
  UNPAUSE: `${MODULE_PATHS.PREDICTION_MARKET}::unpause`,
  DEACTIVATE_MARKET: `${MODULE_PATHS.PREDICTION_MARKET}::deactivate_market`,
  REACTIVATE_MARKET: `${MODULE_PATHS.PREDICTION_MARKET}::reactivate_market`,
} as const;

export const COIN_TYPES = {
  APT: "0x1::aptos_coin::AptosCoin",
} as const;

export const DEFAULT_COIN_TYPE = COIN_TYPES.APT;

export const CONTRACT_CONSTANTS = {
  MAX_PROTOCOL_FEE: 2000,
  BASIS_POINTS: 10000,
  OCTAS_PER_APT: 100_000_000,
  APT_DECIMALS: 8,
} as const;

export const convertAptToOctas = (apt: number): number => {
  if (isNaN(apt) || !isFinite(apt)) {
    throw new Error("Invalid APT amount: must be a valid number");
  }

  return Math.floor(apt * CONTRACT_CONSTANTS.OCTAS_PER_APT);
};

export const convertOctasToApt = (octas: number | string): string => {
  return normalize(octas, CONTRACT_CONSTANTS.APT_DECIMALS);
};

export const formatAptAmount = (
  octas: number | string,
  decimals = 2,
): string => {
  const apt = parseFloat(convertOctasToApt(octas));

  if (isNaN(apt)) return "0";
  if (apt === 0) return "0";
  if (apt < 0.001) return "<0.001";
  if (apt < 1) return apt.toFixed(Math.min(decimals + 1, 8));
  if (apt < 100) return apt.toFixed(decimals);

  return apt.toFixed(Math.max(decimals - 1, 0));
};

export const RESOURCE_TYPES = {
  PREDICTION_MARKET_STATE: `${MODULE_PATHS.PREDICTION_MARKET}::PredictionMarketState`,
} as const;

export const EVENT_TYPES = {
  MARKET_CREATED: "MarketCreatedEvent",
  BET_PLACED: "BetPlacedEvent",
  MARKET_RESOLVED: "MarketResolvedEvent",
  WINNINGS_CLAIMED: "WinningsClaimedEvent",
  YIELD_DEPOSITED: "YieldDepositedEvent",
  PROTOCOL_FEE_COLLECTED: "ProtocolFeeCollectedEvent",
} as const;

export const VIEW_FUNCTIONS = {
  GET_MARKET: `${MODULE_PATHS.PREDICTION_MARKET}::get_market`,
  GET_USER_BETS: `${MODULE_PATHS.PREDICTION_MARKET}::get_user_bets`,
  GET_MARKET_BETS: `${MODULE_PATHS.PREDICTION_MARKET}::get_market_bets`,
} as const;

/**
 * Type definitions for contract interactions
 */
export interface CreateMarketParams {
  contractAddr: string;
  question: string;
  description: string;
  duration: number;
  protocolSelectorAddr: string;
}

export interface PlaceBetParams {
  contractAddr: string;
  marketId: number;
  position: boolean;
  amount: number;
}

export interface ResolveMarketParams {
  contractAddr: string;
  marketId: number;
  outcome: boolean;
}

export interface ClaimWinningsParams {
  contractAddr: string;
  betId: number;
}

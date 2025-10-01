import { normalize } from "./bignumber";

const SECONDS_IN_YEAR = 365 * 24 * 60 * 60;

export const normalizeAPY = (
  apy: number | string,
  decimals: number = 2,
): string => {
  const numApy = Number(apy);

  if (!apy || numApy < 0 || !decimals || decimals <= 0) {
    return "0.00";
  }
  const apyPercent = numApy;

  return normalize(apyPercent, decimals);
};

export const calculateReward = (
  apy: number | string,
  amount: number | string,
  lockPeriod: number | string,
): number => {
  const amt = Number(amount);
  const rate = Number(apy);
  const period = Number(lockPeriod);

  return (amt * rate * period) / (SECONDS_IN_YEAR * 10000);
};

export const calculateEstimatedYield = (
  apy: number | string,
  amount: number | string,
  lockPeriod: number | string,
): number => {
  const amt = Number(amount);
  const reward = calculateReward(apy, amount, lockPeriod);

  return amt + reward;
};

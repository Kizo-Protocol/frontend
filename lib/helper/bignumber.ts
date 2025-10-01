import { BigNumber } from "bignumber.js";

export type BigNumberValue = string | number | BigNumber;

export const MAX_UINT_256 =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";

export const BigNumberZeroDecimal = BigNumber.clone({
  DECIMAL_PLACES: 0,
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
});

export function valueToBigInt(amount: BigNumberValue): bigint {
  return BigInt(valueToBigNumber(amount).toString(10));
}

export function valueToBigNumber(amount: BigNumberValue): BigNumber {
  if (amount instanceof BigNumber) {
    return amount;
  }

  return new BigNumber(amount);
}

export function valueToZDBigNumber(amount: BigNumberValue): BigNumber {
  return new BigNumberZeroDecimal(amount);
}

export function normalize(n: BigNumberValue, decimals: number): string {
  return normalizeBN(n, decimals).toString(10);
}

export function normalizeBN(n: BigNumberValue, decimals: number): BigNumber {
  return valueToBigNumber(n).shiftedBy(decimals * -1);
}

export function denormalize(n: BigNumberValue, decimals: number): string {
  return denormalizeBN(n, decimals).toString(10);
}

export function denormalizeBN(n: BigNumberValue, decimals: number): BigNumber {
  const bn = valueToBigNumber(n);

  return bn.shiftedBy(decimals).dp(0);
}

export const BN_ONE_18_DECIMALS = denormalizeBN(1, 18);

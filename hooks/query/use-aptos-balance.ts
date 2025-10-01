import { useQuery } from "@tanstack/react-query";
import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";

import { APTOS_NETWORK, convertOctasToApt } from "@/lib/aptos-contracts";

const config = new AptosConfig({ network: APTOS_NETWORK });
const aptos = new Aptos(config);

async function fetchAptBalance(address: string): Promise<string> {
  try {
    const resource = await aptos.getAccountCoinAmount({
      accountAddress: address,
      coinType: "0x1::aptos_coin::AptosCoin",
    });

    return convertOctasToApt(resource);
  } catch {
    return "0";
  }
}

export function useAptBalance(address?: string) {
  return useQuery({
    queryKey: ["aptBalance", address],
    queryFn: () => fetchAptBalance(address!),
    enabled: !!address,
    refetchInterval: 10000,
    staleTime: 5000,
  });
}

export function formatAptBalance(
  balance: string | number,
  decimals = 2,
): string {
  const num = typeof balance === "string" ? parseFloat(balance) : balance;

  if (isNaN(num)) return "0.00";
  if (num === 0) return "0.00";
  if (num < 0.01) return "<0.01";
  if (num < 1) return num.toFixed(Math.min(decimals + 1, 4));
  if (num < 1000) return num.toFixed(decimals);

  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";

  return num.toFixed(decimals);
}

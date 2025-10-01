"use client";

import { useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

import { useConnectWallet } from "@/hooks/query/api/use-auth";
import { authService } from "@/services/auth.service";

export function useWalletAuth() {
  const { account, connected } = useWallet();
  const connectWallet = useConnectWallet();
  const address = account?.address?.toString();

  useEffect(() => {
    if (connected && address) {
      const existingToken = localStorage.getItem("auth_token");

      if (!existingToken || !isTokenValid(existingToken)) {
        connectWallet.mutate({ address });
      }
    } else if (!connected) {
      const hasToken = localStorage.getItem("auth_token");

      if (hasToken) {
        authService.logout();
      }
    }
  }, [connected, address]);

  return {
    isConnected: connected,
    address,
    isAuthenticating: connectWallet.isPending,
    authError: connectWallet.error,
    hasValidToken:
      connected && isTokenValid(localStorage.getItem("auth_token") || ""),
  };
}

function isTokenValid(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;

    return payload.exp > currentTime;
  } catch {
    return false;
  }
}

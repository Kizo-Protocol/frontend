"use client";

import { useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useQueryClient } from "@tanstack/react-query";

import { authService } from "@/services/auth.service";
import { AUTH_QUERY_KEYS } from "@/hooks/query/api/use-auth";

interface AuthMiddlewareProps {
  children: React.ReactNode;
}

export function AuthMiddleware({ children }: AuthMiddlewareProps) {
  const { connected } = useWallet();
  const queryClient = useQueryClient();

  useEffect(() => {
    const wasCleanedUp = authService.cleanupOrphanedToken(connected);

    if (wasCleanedUp) {
      queryClient.removeQueries({
        queryKey: AUTH_QUERY_KEYS.all,
      });

      queryClient.invalidateQueries();
    }
  }, [connected, queryClient]);

  return <>{children}</>;
}

export function useAuthMiddleware() {
  const { connected, disconnect } = useWallet();
  const queryClient = useQueryClient();

  const cleanupOrphanedAuth = () => {
    const wasCleanedUp = authService.cleanupOrphanedToken(connected);

    if (wasCleanedUp) {
      queryClient.removeQueries({
        queryKey: AUTH_QUERY_KEYS.all,
      });
      queryClient.invalidateQueries();

      return true;
    }

    return false;
  };

  const forceLogout = async () => {
    try {
      authService.logout();
      queryClient.clear();

      if (connected && typeof window !== "undefined") {
        await disconnect();
      }

      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    } catch {
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    }
  };

  return {
    isConnected: connected,
    cleanupOrphanedAuth,
    forceLogout,
    hasToken: authService.isAuthenticated(),
  };
}

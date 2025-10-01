"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

import { authService } from "@/services/auth.service";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

/**
 * Protected Route Component
 * Wraps components/pages that require authentication
 *
 * Usage:
 * ```tsx
 * <ProtectedRoute>
 *   <YourProtectedComponent />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  redirectTo = "/",
  requireAuth = true,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { connected } = useWallet();

  useEffect(() => {
    if (requireAuth) {
      const isAuthenticated = authService.isAuthenticated();

      if (!isAuthenticated || !connected) {
        router.replace(redirectTo);
      }
    }
  }, [connected, requireAuth, redirectTo, router]);

  if (requireAuth && (!authService.isAuthenticated() || !connected)) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Higher Order Component version
 *
 * Usage:
 * ```tsx
 * export default withProtectedRoute(YourPage);
 * ```
 */
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  redirectTo?: string,
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute redirectTo={redirectTo}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

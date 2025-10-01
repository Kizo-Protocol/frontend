"use client";

import "@/lib/polyfills";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";
import { WalletAuthProvider } from "./wallet-auth-provider";
import { AuthMiddleware } from "./auth-middleware";
import { AptosWalletProvider } from "./wallet/aptos-wallet-provider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      enabled: typeof window !== "undefined",
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      disableTransitionOnChange
      enableSystem
      attribute="class"
      defaultTheme="dark"
    >
      <QueryClientProvider client={queryClient}>
        <AptosWalletProvider>
          <AuthMiddleware>
            <WalletAuthProvider>
              <Toaster />
              {children}
            </WalletAuthProvider>
          </AuthMiddleware>
        </AptosWalletProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

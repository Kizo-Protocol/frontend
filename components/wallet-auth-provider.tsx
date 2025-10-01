"use client";

import React from "react";

import { useWalletAuth } from "@/hooks/use-wallet-auth";

export function WalletAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useWalletAuth();

  return <>{children}</>;
}

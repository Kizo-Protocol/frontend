"use client";

import React, { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export default function WalletWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { connected } = useWallet();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] w-full">
        <h1 className="text-2xl font-bold">Please connect your wallet</h1>
        <p className="mt-4 text-gray-600">
          You need to connect your Aptos wallet to access this page.
        </p>
      </div>
    );
  }

  return <React.Fragment>{children}</React.Fragment>;
}

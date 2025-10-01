"use client";

import {
  AptosWalletAdapterProvider,
  DappConfig,
} from "@aptos-labs/wallet-adapter-react";
import { PropsWithChildren, useEffect, useState } from "react";
import { Network } from "@aptos-labs/ts-sdk";
import { toast } from "sonner";

export const AptosWalletProvider = ({ children }: PropsWithChildren) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dappConfig: DappConfig = {
    network: Network.TESTNET,
    aptosApiKeys: {
      testnet: process.env.NEXT_PUBLIC_APTOS_API_KEY_TESTNET,
      devnet: process.env.NEXT_PUBLIC_APTOS_API_KEY_DEVNET,
    },
    aptosConnect: {
      dappId: process.env.NEXT_PUBLIC_APTOS_DAPP_ID || "your-dapp-id",
    },
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={dappConfig}
      onError={(error) => {
        toast.error(error || "Unknown wallet error");
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};

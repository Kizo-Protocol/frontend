import React, { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

import { AptosWalletSelector } from "@/components/wallet/aptos-wallet-selector";

export default function ButtonConnectWrapper({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const { connected } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return !connected ? (
    <div className={className}>
      <AptosWalletSelector />
    </div>
  ) : (
    <>{children}</>
  );
}

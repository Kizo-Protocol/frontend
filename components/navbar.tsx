"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import React from "react";

import { useCurrentUser } from "@/hooks/query/api/use-auth";
import { AptosWalletSelector } from "@/components/wallet/aptos-wallet-selector";
import { NotificationPopover } from "@/components/navbar/notification-popover";
import { ProfilePopover } from "@/components/navbar/profile-popover";
import {
  useAptBalance,
  formatAptBalance,
} from "@/hooks/query/use-aptos-balance";

import FallbackImage from "./fallback-image";
import { Skeleton } from "./ui/skeleton";

function NavbarSkeleton() {
  return (
    <>
      <Skeleton className="h-10 w-32 rounded-lg" />
    </>
  );
}

export default function Navbar() {
  const { connected, account } = useWallet();
  const { data: user, error: userError } = useCurrentUser();
  const [isMounted, setIsMounted] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const address = account?.address?.toString();
  const isAuthenticated = connected && user;

  const { data: aptBalanceData, isLoading: isBalanceLoading } =
    useAptBalance(address);
  const balance = aptBalanceData ? formatAptBalance(aptBalanceData) : "0.00";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const hasStoredToken =
      typeof window !== "undefined" && !!localStorage.getItem("auth_token");

    if (hasStoredToken) {
      if (user || userError) {
        setShowContent(true);
      }
    } else {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isMounted, user, userError]);

  const shouldShowLoading = !showContent;

  return (
    <div className="w-full mx-auto border-b z-40 sticky top-0 bg-background">
      <div className="px-5 py-3 flex items-center">
        <div className="flex w-full items-center justify-between">
          <Link className="flex items-center gap-3 w-full" href={"/"}>
            <FallbackImage
              alt="Logo"
              className="object-contain w-10 h-10 cursor-pointer"
              height={120}
              src="/logo-white.png"
              width={120}
            />
            <span className="text-2xl font-semibold cursor-pointer hover:text-muted-foreground transition-colors">
              Kizo Protocol
            </span>
          </Link>
          <div className="flex items-center gap-5 w-full justify-end">
            {shouldShowLoading ? (
              <NavbarSkeleton />
            ) : isAuthenticated ? (
              <React.Fragment>
                <div className="border border-border rounded-2xl px-2 py-1 flex items-center gap-1">
                  <FallbackImage
                    alt="APT"
                    className="inline-block w-4 h-4 object-contain"
                    height={16}
                    src="/images/token/apt.png"
                    width={16}
                  />
                  <span className="text-sm font-medium -mt-0.5">
                    {isBalanceLoading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      balance
                    )}
                  </span>
                </div>

                <div className="mt-1">
                  <NotificationPopover />
                </div>

                <ProfilePopover address={address} user={user} />
              </React.Fragment>
            ) : (
              <AptosWalletSelector />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

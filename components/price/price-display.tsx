"use client";

import React from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { usePriceUtils } from "@/hooks/query/api/use-prices";
import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  aptAmount: number;
  className?: string;
  showSymbol?: boolean;
  decimals?: number;
  aptClassName?: string;
  usdClassName?: string;
  layout?: "inline" | "stacked";
}

/**
 * Display APT amount with real-time USD value from Chainlink
 */
export function PriceDisplay({
  aptAmount,
  className,
  showSymbol = true,
  decimals = 2,
  aptClassName,
  usdClassName,
  layout = "inline",
}: PriceDisplayProps) {
  const { isLoading, aptToUsd } = usePriceUtils();

  if (isLoading) {
    return <Skeleton className={cn("h-5 w-24", className)} />;
  }

  const usdValue = aptToUsd(aptAmount);
  const aptFormatted = aptAmount.toFixed(decimals);
  const usdFormatted = usdValue.toFixed(decimals);

  if (layout === "stacked") {
    return (
      <div className={cn("flex flex-col", className)}>
        <span className={cn("font-semibold", aptClassName)}>
          {aptFormatted} {showSymbol && "APT"}
        </span>
        <span className={cn("text-sm text-muted-foreground", usdClassName)}>
          ${usdFormatted}
        </span>
      </div>
    );
  }

  return (
    <span className={cn("whitespace-nowrap", className)}>
      <span className={aptClassName}>
        {aptFormatted} {showSymbol && "APT"}
      </span>{" "}
      <span className={cn("text-muted-foreground", usdClassName)}>
        (${usdFormatted})
      </span>
    </span>
  );
}

interface UsdDisplayProps {
  usdAmount: number;
  className?: string;
  decimals?: number;
}

/**
 * Display USD amount
 */
export function UsdDisplay({
  usdAmount,
  className,
  decimals = 2,
}: UsdDisplayProps) {
  return <span className={className}>${usdAmount.toFixed(decimals)}</span>;
}

interface AptPriceIndicatorProps {
  className?: string;
  showLabel?: boolean;
}

/**
 * Display current APT/USD price
 */
export function AptPriceIndicator({
  className,
  showLabel = true,
}: AptPriceIndicatorProps) {
  const { price, isLoading } = usePriceUtils();

  if (isLoading) {
    return <Skeleton className={cn("h-5 w-20", className)} />;
  }

  return (
    <div className={cn("flex items-center gap-1 text-sm", className)}>
      {showLabel && <span className="text-muted-foreground">APT:</span>}
      <span className="font-medium">${price.toFixed(2)}</span>
    </div>
  );
}

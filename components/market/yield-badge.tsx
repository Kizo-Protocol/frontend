"use client";

import { useState, useEffect } from "react";
import { Loader2, TrendingUp } from "lucide-react";

import { useMarketYield } from "@/hooks/query/use-market-yield";
import { formatNumber } from "@/lib/helper/number";

interface YieldBadgeProps {
  marketId: number | undefined;
  totalPoolSize: string | undefined;
  status: string;
  compact?: boolean;
  lazyLoad?: boolean;
}

export function YieldBadge({
  marketId,
  totalPoolSize,
  status,
  compact = true,
  lazyLoad = true,
}: YieldBadgeProps) {
  const [shouldFetch, setShouldFetch] = useState(!lazyLoad);

  useEffect(() => {
    if (lazyLoad && status === "active") {
      const randomDelay = Math.random() * 2000;
      const timer = setTimeout(() => {
        setShouldFetch(true);
      }, randomDelay);

      return () => clearTimeout(timer);
    }
  }, [lazyLoad, status]);

  const { data: yieldData, isLoading } = useMarketYield(
    marketId,
    totalPoolSize,
    status === "active" && shouldFetch,
  );

  if (status !== "active") {
    return null;
  }

  if (isLoading) {
    return (
      <div className="py-1 px-2 border rounded-2xl flex items-center gap-1 w-fit bg-muted/50">
        <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
        {!compact && (
          <span className="font-medium text-[10px] text-muted-foreground">
            Loading yield...
          </span>
        )}
      </div>
    );
  }

  if (!yieldData || parseFloat(yieldData.currentYield) === 0) {
    return null;
  }

  const yieldValue = parseFloat(yieldData.currentYield);
  const yieldPercentage = yieldData.yieldPercentage;

  return (
    <div className="py-1 px-2 border border-green-500/30 rounded-2xl flex items-center gap-1 w-fit bg-green-500/5">
      <TrendingUp className="w-3 h-3 text-green-500" />
      <span className="font-medium text-[10px] text-green-500">
        {compact ? (
          <>{formatNumber(yieldValue, { decimals: 2, compact: true })} APT</>
        ) : (
          <>
            {formatNumber(yieldValue, { decimals: 2, compact: true })} APT
            {yieldPercentage > 0 && (
              <span className="text-[9px] opacity-80">
                {" "}
                (+{yieldPercentage.toFixed(2)}%)
              </span>
            )}
          </>
        )}
      </span>
    </div>
  );
}

"use client";

import { Gift } from "lucide-react";
import { useState } from "react";

import FallbackImage from "@/components/fallback-image";
import { CONTRACT_CONSTANTS } from "@/lib/aptos-contracts";
import {
  formatApy,
  formatYieldAmount,
  useCurrentApyRates,
  useProtocols,
} from "@/hooks/query/api/use-yields";
import { HoverPopover } from "@/components/ui/hover-popover";
import { Market } from "@/types/market";

export function RewardPopover({ market }: { market: Market }) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: protocols } = useProtocols();
  const { data: apyRates } = useCurrentApyRates();

  const getHighestApyProtocol = () => {
    let highestApy = apyRates?.data?.rates?.[0]?.apy || 5;
    let bestProtocol = apyRates?.data?.rates?.[0]?.protocol || "default";

    if (apyRates?.data?.rates && apyRates.data.rates.length > 0) {
      const sortedRates = [...apyRates.data.rates].sort(
        (a, b) => b.apy - a.apy,
      );

      highestApy = sortedRates[0].apy;
      bestProtocol = sortedRates[0].protocol;
    }

    return { apy: highestApy, protocol: bestProtocol };
  };

  const getYieldData = (market: Market) => {
    const currentDate = new Date();
    const endTime = new Date(market.endDate);
    const daysRemaining = Math.max(
      0,
      Math.ceil(
        (endTime.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );

    const bestProtocol = getHighestApyProtocol();
    const poolAmount =
      parseFloat(market.totalPoolSize || "0") /
      CONTRACT_CONSTANTS.OCTAS_PER_APT;
    const currentYield = parseFloat(market.currentYield) || 0;
    const totalYieldEarned = parseFloat(market.totalYieldEarned) || 0;

    if (poolAmount <= 0 || daysRemaining <= 0) {
      return {
        dailyYield: 0,
        totalYield: 0,
        daysRemaining,
        apy: bestProtocol.apy,
        protocol: bestProtocol.protocol,
        poolAmount,
        currentYield,
        totalYieldEarned,
      };
    }

    const dailyRate = bestProtocol.apy / 365 / 100;
    const dailyYield = poolAmount * dailyRate;
    const totalYield = dailyYield * daysRemaining;

    return {
      dailyYield,
      totalYield,
      daysRemaining,
      apy: bestProtocol.apy,
      protocol: bestProtocol.protocol,
      poolAmount,
      currentYield,
      totalYieldEarned,
    };
  };

  const trigger = (
    <Gift className="w-4 h-4 inline-block cursor-pointer hover:text-green-500 transition-colors -mt-1" />
  );

  const yieldData = getYieldData(market);
  const iconUrl = protocols?.data?.find(
    (p) => parseFloat(p.baseApy) === yieldData.apy,
  )?.iconUrl;

  const content = (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b">
        <Gift className="w-4 h-4 text-green-500" />
        <h3 className="font-semibold text-sm">Reward Calculation</h3>
      </div>

      <div className="space-y-3 text-xs">
        <div className="flex items-center gap-2 bg-gradient-to-r from-green-500/10 to-green-500/5 p-2 rounded-2xl">
          <FallbackImage
            alt={yieldData.protocol || "Protocol"}
            className="w-10 h-10 rounded-full"
            height={80}
            src={iconUrl}
            width={80}
          />
          <div className="flex flex-col">
            <span className="text-[15px] font-medium">
              {yieldData.protocol?.toUpperCase() || "DEFAULT"}
            </span>
            <span>APY {formatApy(yieldData.apy)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-muted-foreground">Current Pool</p>
            <p className="font-medium">
              {formatYieldAmount(yieldData.poolAmount)} APT
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Daily Yield</p>
            <p className="font-medium text-blue-600">
              {formatYieldAmount(yieldData.dailyYield)} APT
            </p>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground">Days Remaining</p>
          <div className="flex items-center gap-2">
            <p className="font-medium">{yieldData.daysRemaining} days</p>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{
                  width: `${Math.min((yieldData.daysRemaining / 365) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-muted-foreground">Total Yield Until End</p>
          <p className="font-bold text-green-600 text-sm">
            {formatYieldAmount(yieldData.totalYield)} APT
          </p>
        </div>

        <div className="pt-2 text-[10px] text-muted-foreground leading-snug">
          <p>* Using highest APY protocol for projections</p>
          <p>* Actual yields may vary</p>
        </div>
      </div>
    </div>
  );

  return (
    <HoverPopover
      align="end"
      autoCloseDelay={1000}
      content={content}
      contentClassName="w-80"
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      trigger={trigger}
    />
  );
}

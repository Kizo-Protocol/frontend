"use client";

import React from "react";
import { DollarSign } from "lucide-react";

import { yieldService } from "@/services/yield.service";
import FallbackImage from "@/components/fallback-image";
import { useProtocols } from "@/hooks/query/api/use-yields";

interface YieldTabProps {
  yieldSummary: any;
  userLoading: boolean;
}

export default function YieldTab({ yieldSummary, userLoading }: YieldTabProps) {
  const { data: protocols } = useProtocols();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between gap-4 lg:gap-6">
        <div className="flex flex-col gap-2 p-4 sm:bg-transparent">
          <span className="text-sm text-muted-foreground">
            Total Yield Earned
          </span>
          <span className="text-3xl sm:text-4xl lg:text-5xl leading-none capitalize">
            {yieldSummary
              ? yieldService.formatYieldAmount(
                  yieldSummary.totals?.totalYield || 0,
                )
              : "0.00"}{" "}
            APT
          </span>
        </div>

        <div className="flex flex-col gap-2 p-4 sm:bg-transparent">
          <span className="text-sm text-muted-foreground">Average APY</span>
          <span className="text-3xl sm:text-4xl lg:text-5xl leading-none">
            {yieldSummary
              ? yieldService.formatApy(yieldSummary.totals?.averageApy || 0)
              : "0.0%"}
          </span>
        </div>

        <div className="flex flex-col gap-2 p-4 sm:bg-transparent">
          <span className="text-sm text-muted-foreground">
            Active Protocols
          </span>
          <span className="text-3xl sm:text-4xl lg:text-5xl leading-none">
            {yieldSummary?.protocolBreakdown?.length || 0}
          </span>
        </div>
      </div>

      <div className="border-[0.5px] border-border rounded-4xl">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-lg font-semibold">Protocol Breakdown</h3>
          <p className="text-sm text-muted-foreground">
            Your yield earnings by protocol
          </p>
        </div>

        <div className="p-5">
          {userLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-muted rounded-2xl" />
                </div>
              ))}
            </div>
          ) : yieldSummary?.protocolBreakdown &&
            yieldSummary.protocolBreakdown.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {yieldSummary.protocolBreakdown.map((protocol: any) => {
                const protocolData = protocols?.data?.find(
                  (p) =>
                    p.name.toLowerCase() === protocol.protocol.toLowerCase(),
                );

                return (
                  <div
                    key={protocol.protocol}
                    className="border-[0.5px] border-border rounded-2xl p-5 hover:bg-foreground/5 transition-colors duration-200"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        {protocolData?.iconUrl && (
                          <FallbackImage
                            alt={protocol.protocol}
                            className="w-10 h-10 rounded-full flex-shrink-0"
                            height={40}
                            src={protocolData.iconUrl}
                            width={40}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-lg capitalize mb-1">
                            {protocol.protocol}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            APY{" "}
                            <span className="font-medium text-foreground">
                              {yieldService.formatApy(protocol.averageApy)}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Total Yield
                        </p>
                        <p className="text-2xl font-semibold">
                          {yieldService.formatYieldAmount(protocol.totalYield)}{" "}
                          <span className="text-base text-muted-foreground">
                            APT
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <DollarSign className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                No yield data available
              </p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Start earning yield by depositing your assets into DeFi
                protocols
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

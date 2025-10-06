"use client";

import React from "react";
import {
  Grid3x3,
  List,
  ChevronLeft,
  ChevronRight,
  Target,
  Coins,
} from "lucide-react";
import { toast } from "sonner";

import FallbackImage from "@/components/fallback-image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { betService } from "@/services/bet.service";
import { PriceDisplay } from "@/components/price/price-display";
import { useClaimWinnings } from "@/hooks/mutation/use-claim-winnings";

interface PositionTabProps {
  activeBets: any[];
  userLoading: boolean;
}

export default function PositionTab({
  activeBets,
  userLoading,
}: PositionTabProps) {
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [positionPage, setPositionPage] = React.useState(1);
  const itemsPerPage = 6;

  const claimWinnings = useClaimWinnings();

  const totalPositionPages = Math.ceil(activeBets.length / itemsPerPage);
  const paginatedActiveBets = activeBets.slice(
    (positionPage - 1) * itemsPerPage,
    positionPage * itemsPerPage,
  );

  const handleClaimWinnings = async (bet: any) => {
    try {
      const claimable = betService.isBetClaimable(bet);

      if (!claimable.claimable) {
        toast.error(claimable.reason || "Cannot claim this bet");

        return;
      }

      if (!bet.market?.blockchainMarketId) {
        toast.error("Market not available on blockchain");

        return;
      }

      const betIndex = betService.getBetIndex(bet);

      await claimWinnings.mutation.mutateAsync({
        marketId: bet.market.blockchainMarketId,
        betIndex: betIndex,
      });

      toast.success("Winnings claimed successfully!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to claim winnings");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Your Positions</CardTitle>
            <CardDescription>
              Your active bets and claimable winnings
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={viewMode === "grid" ? "default" : "outline"}
              onClick={() => setViewMode("grid")}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {userLoading ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-4"
            }
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        ) : paginatedActiveBets.length > 0 ? (
          <>
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  : "space-y-3"
              }
            >
              {paginatedActiveBets.map((bet) => (
                <div
                  key={bet.id}
                  className="p-4 border rounded-lg space-y-3 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {bet.market?.imageUrl && (
                      <FallbackImage
                        alt={bet.market?.question || "Market"}
                        className="w-12 h-12 rounded-lg flex-shrink-0 object-cover"
                        height={48}
                        src={bet.market.imageUrl}
                        width={48}
                      />
                    )}
                    <div className="flex-1 space-y-2 min-w-0">
                      <p className="font-medium text-sm line-clamp-2">
                        {bet.market?.question ||
                          "Market question not available"}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant={bet.position ? "default" : "destructive"}
                        >
                          {betService.getPositionLabel(bet.position)}
                        </Badge>
                        <Badge variant="secondary">
                          {bet.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-sm">
                      <p className="text-muted-foreground text-xs">Amount</p>
                      <PriceDisplay
                        aptAmount={parseFloat(
                          betService.formatAmount(bet.amount),
                        )}
                        aptClassName="font-semibold"
                        className="font-semibold"
                        layout="stacked"
                      />
                    </div>
                    <div className="text-sm text-right">
                      <p className="text-muted-foreground text-xs">Odds</p>
                      <p className="font-semibold">
                        {betService.formatOdds(bet.odds)}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      <p className="text-muted-foreground text-xs">Placed</p>
                      <p className="text-xs">
                        {betService.formatBetDate(bet.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Claim button for won bets */}
                  {bet.status === "won" && (
                    <div className="pt-3 border-t mt-3">
                      {betService.isBetClaimable(bet).claimable ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Winnings:
                            </span>
                            <div className="flex items-center gap-1 font-semibold text-green-600">
                              <Coins className="w-3 h-3" />
                              <span>
                                {betService.calculateWinnings(bet).formatted}{" "}
                                APT
                              </span>
                            </div>
                          </div>
                          <Button
                            className="w-full"
                            disabled={claimWinnings.isPending}
                            size="sm"
                            onClick={() => handleClaimWinnings(bet)}
                          >
                            {claimWinnings.isPending
                              ? "Claiming..."
                              : "Claim Winnings"}
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Button disabled className="w-full" size="sm">
                            {betService.getClaimButtonText(bet)}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {totalPositionPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button
                  className="px-2"
                  disabled={positionPage === 1}
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setPositionPage((prev) => Math.max(1, prev - 1))
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {positionPage} of {totalPositionPages}
                </span>
                <Button
                  className="px-2"
                  disabled={positionPage === totalPositionPages}
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setPositionPage((prev) =>
                      Math.min(totalPositionPages, prev + 1),
                    )
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No active positions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

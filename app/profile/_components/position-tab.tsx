"use client";

import React from "react";
import { Grid3x3, List, ChevronLeft, ChevronRight, Target } from "lucide-react";

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

  const totalPositionPages = Math.ceil(activeBets.length / itemsPerPage);
  const paginatedActiveBets = activeBets.slice(
    (positionPage - 1) * itemsPerPage,
    positionPage * itemsPerPage,
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Active Positions</CardTitle>
            <CardDescription>
              Your current open bets and their status
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

"use client";

import React from "react";
import { Activity, ChevronLeft, ChevronRight } from "lucide-react";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PriceDisplay } from "@/components/price/price-display";

interface ActivityTabProps {
  userBets: any[];
  userLoading: boolean;
}

export default function ActivityTab({
  userBets,
  userLoading,
}: ActivityTabProps) {
  const [activityPage, setActivityPage] = React.useState(1);
  const itemsPerPage = 6;

  const totalActivityPages = Math.ceil(userBets.length / itemsPerPage);
  const paginatedUserBets = userBets.slice(
    (activityPage - 1) * itemsPerPage,
    activityPage * itemsPerPage,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Your complete betting and yield history
        </CardDescription>
      </CardHeader>
      <CardContent>
        {userLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        ) : paginatedUserBets.length > 0 ? (
          <>
            <div className="space-y-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Market</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Odds</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payout</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUserBets.map((bet) => (
                    <TableRow key={bet.id}>
                      <TableCell className="max-w-xs">
                        <div className="flex items-center gap-3">
                          {bet.market?.imageUrl && (
                            <FallbackImage
                              alt={bet.market?.question || "Market"}
                              className="w-10 h-10 rounded-lg flex-shrink-0 object-cover"
                              height={40}
                              src={bet.market.imageUrl}
                              width={40}
                            />
                          )}
                          <div className="truncate">
                            {bet.market?.question || "N/A"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={bet.position ? "default" : "destructive"}
                        >
                          {betService.getPositionLabel(bet.position)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <PriceDisplay
                          aptAmount={parseFloat(
                            betService.formatAmount(bet.amount),
                          )}
                          className="text-sm"
                          layout="stacked"
                        />
                      </TableCell>
                      <TableCell>{betService.formatOdds(bet.odds)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            bet.status === "won"
                              ? "default"
                              : bet.status === "lost"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {bet.status ? bet.status.toUpperCase() : "UNKNOWN"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {bet.payout ? (
                          <PriceDisplay
                            aptAmount={parseFloat(
                              betService.formatAmount(bet.payout),
                            )}
                            aptClassName="text-green-600 font-medium"
                            className="text-sm text-green-600 font-medium"
                            layout="stacked"
                          />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {betService.formatBetDate(bet.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {totalActivityPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button
                  className="px-2"
                  disabled={activityPage === 1}
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setActivityPage((prev) => Math.max(1, prev - 1))
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {activityPage} of {totalActivityPages}
                </span>
                <Button
                  className="px-2"
                  disabled={activityPage === totalActivityPages}
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setActivityPage((prev) =>
                      Math.min(totalActivityPages, prev + 1),
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
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No activity yet</p>
            <p className="text-sm">Start betting to see your activity here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

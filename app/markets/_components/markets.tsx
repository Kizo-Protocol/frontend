"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  useMarkets,
  useSearchMarkets,
  useTrendingMarkets,
} from "@/hooks/query/api/use-markets";
import FallbackImage from "@/components/fallback-image";
import { formatNumber } from "@/lib/helper/number";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { useBet } from "@/hooks/mutation/use-bet";
import { YieldBadge } from "@/components/market/yield-badge";
import { MultiStepTransactionDialog } from "@/components/dialog/multi-step-transaction-dialog";
import { normalize } from "@/lib/helper/bignumber";
import { Market } from "@/types/market";
import {
  KIZO_CONTRACT_ADDRESS,
  convertAptToOctas,
  CONTRACT_CONSTANTS,
} from "@/lib/aptos-contracts";

import { RewardPopover } from "./reward-popover";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

type FilterType = "trending" | "volume" | "latest";

type BettingState = {
  blockchainMarketId: number;
  position: boolean;
  amount: string;
};

export default function Markets() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [bettingState, setBettingState] = useState<BettingState | null>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const itemsPerPage = 30;

  const betTransaction = useBet();

  const hasSearch = debouncedSearchQuery.trim().length >= 2;
  const offset = (currentPage - 1) * itemsPerPage;

  const searchResults = useSearchMarkets(
    debouncedSearchQuery.trim(),
    2000,
    hasSearch,
  );

  const trendingResults = useTrendingMarkets(200, !hasSearch);
  const volumeResults = useMarkets(
    {
      sortBy: "volume",
      sortDir: "desc",
      status: "active",
      limit: 200,
    },
    !hasSearch,
  );
  const latestResults = useMarkets(
    {
      sortBy: "createdAt",
      sortDir: "desc",
      status: "active",
      limit: 200,
    },
    !hasSearch,
  );

  const currentResults = useMemo(() => {
    if (hasSearch) return searchResults;
    if (activeFilter === "trending") return trendingResults;
    if (activeFilter === "volume") return volumeResults;

    return latestResults;
  }, [
    hasSearch,
    activeFilter,
    searchResults,
    trendingResults,
    volumeResults,
    latestResults,
  ]);

  const { data: marketsResponse, isLoading, isError, error } = currentResults;

  const isUserTyping = searchQuery.trim().length > 0 && !hasSearch;
  const isSearching = hasSearch && isLoading;

  const allMarkets = marketsResponse?.data || [];
  const totalItems = allMarkets.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedMarkets = allMarkets.slice(offset, offset + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, debouncedSearchQuery]);

  const handleBetClick = (blockchainMarketId: number, position: boolean) => {
    setBettingState({ blockchainMarketId, position, amount: "" });
  };

  const handleBetCancel = () => {
    setBettingState(null);
  };

  const handleAmountChange = (amount: string) => {
    if (bettingState) {
      setBettingState({ ...bettingState, amount });
    }
  };

  const handlePlaceBet = async (blockchainMarketId: number) => {
    if (!bettingState || bettingState.blockchainMarketId !== blockchainMarketId)
      return;

    const amount = parseFloat(bettingState.amount);

    if (isNaN(amount) || amount <= 0) return;

    try {
      setIsDialogOpen(true);

      const amountInOctas = convertAptToOctas(amount);

      const params = {
        contractAddr: KIZO_CONTRACT_ADDRESS,
        marketId: blockchainMarketId,
        position: bettingState.position,
        amount: amountInOctas,
      };

      await betTransaction.mutation.mutateAsync(params);

      setBettingState(null);
    } catch (error) {
      toast.error("Failed: " + (error as Error).message);
    }
  };

  const handleDialogClose = () => {
    if (!betTransaction.isLoading) {
      setIsDialogOpen(false);
      betTransaction.resetSteps();
    }
  };

  const calculateUpdatedProbability = (
    market: Market,
    betAmount: number,
    position: boolean,
  ) => {
    if (!betAmount || betAmount <= 0) {
      return {
        yes: Number(market.probability) || 0,
        no: Number(100 - market.probability) || 0,
      };
    }

    const currentYes = Number(market.probability) || 0;
    const currentNo = 100 - currentYes;
    const totalVolume = Number(market.volume) || 0;

    if (position) {
      const newYes =
        (currentYes * totalVolume + betAmount * 100) /
        (totalVolume + betAmount);

      return {
        yes: Math.min(95, Math.max(5, newYes)),
        no: Math.min(95, Math.max(5, 100 - newYes)),
      };
    } else {
      const newNo =
        (currentNo * totalVolume + betAmount * 100) / (totalVolume + betAmount);

      return {
        no: Math.min(95, Math.max(5, newNo)),
        yes: Math.min(95, Math.max(5, 100 - newNo)),
      };
    }
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="border-[0.5px] rounded-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="h-9 w-20 bg-muted rounded-2xl animate-pulse" />
              <div className="h-9 w-28 bg-muted rounded-2xl animate-pulse" />
              <div className="h-9 w-16 bg-muted rounded-2xl animate-pulse" />
            </div>
            <div className="h-9 w-[250px] bg-muted rounded-2xl animate-pulse" />
          </div>
          <div className="border-t-[0.5px] p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="border rounded-2xl p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                    </div>
                  </div>
                  <div className="h-10 bg-muted rounded-2xl animate-pulse" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-9 bg-muted rounded-xl animate-pulse" />
                    <div className="h-9 bg-muted rounded-xl animate-pulse" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-6 w-20 bg-muted rounded-2xl animate-pulse" />
                    <div className="h-5 w-5 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <p className="text-red-500">Failed to load markets</p>
          <p className="text-sm text-muted-foreground">
            {error?.message || "Unknown error occurred"}
          </p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!marketsResponse || !marketsResponse.success || !marketsResponse.data) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">No markets found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      </div>
    );
  }

  if (!Array.isArray(allMarkets) || allMarkets.length === 0) {
    return (
      <div className="w-full">
        <div className="border-[0.5px] rounded-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                className={`py-2 px-3 rounded-2xl font-medium text-sm transition-all ${
                  activeFilter === "trending" && !hasSearch
                    ? "bg-foreground/20 text-white"
                    : "border hover:bg-foreground/5"
                }`}
                variant="outline"
                onClick={() => {
                  setActiveFilter("trending");
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
              >
                Trending
              </Button>
              <Button
                className={`py-2 px-3 rounded-2xl text-sm transition-all ${
                  activeFilter === "volume" && !hasSearch
                    ? "bg-foreground/20 text-white"
                    : "border hover:bg-foreground/5"
                }`}
                variant="outline"
                onClick={() => {
                  setActiveFilter("volume");
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
              >
                Highest Volume
              </Button>
              <Button
                className={`py-2 px-3 rounded-2xl text-sm transition-all ${
                  activeFilter === "latest" && !hasSearch
                    ? "bg-foreground/20 text-white"
                    : "border hover:bg-foreground/5"
                }`}
                variant="outline"
                onClick={() => {
                  setActiveFilter("latest");
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
              >
                Latest
              </Button>
            </div>
            <div className="relative max-w-[250px] w-full">
              <Input
                className={`rounded-2xl w-full text-sm pr-10 transition-colors ${
                  isUserTyping ? "border-muted-foreground/50" : ""
                }`}
                placeholder="Search markets... (min 2 chars)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : isUserTyping ? (
                  <div className="w-4 h-4 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-pulse" />
                  </div>
                ) : (
                  <Search className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              {(hasSearch || isUserTyping) && (
                <button
                  aria-label="Clear search"
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
                  onClick={() => setSearchQuery("")}
                >
                  ×
                </button>
              )}
            </div>
          </div>
          <div className="border-t-[0.5px] flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              {hasSearch ? (
                <>
                  <p className="text-muted-foreground">
                    No markets found for &quot;{debouncedSearchQuery}&quot;
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Try searching with different keywords
                  </p>
                  <Button
                    className="mt-2"
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setCurrentPage(1);
                    }}
                  >
                    Clear Search
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground">
                    No {activeFilter} markets available
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Try selecting a different filter or check back later
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <MultiStepTransactionDialog
        currentStep={betTransaction.currentStep}
        description="Processing your betting"
        explorerUrl="https://explorer.aptoslabs.com/txn"
        isError={betTransaction.isError}
        isLoading={betTransaction.isLoading}
        isSuccess={betTransaction.isSuccess}
        open={isDialogOpen}
        showTxHashes={true}
        steps={betTransaction.steps}
        title="Place Bet"
        onClose={handleDialogClose}
        onOpenChange={setIsDialogOpen}
      />
      <div className="border-[0.5px] rounded-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              className={`py-2 px-3 rounded-2xl font-medium text-sm transition-all ${
                activeFilter === "trending" && !hasSearch
                  ? "bg-foreground/20 text-white"
                  : "border hover:bg-foreground/5"
              }`}
              variant="outline"
              onClick={() => {
                setActiveFilter("trending");
                setSearchQuery("");
              }}
            >
              Trending
            </Button>
            <Button
              className={`py-2 px-3 rounded-2xl text-sm transition-all ${
                activeFilter === "volume" && !hasSearch
                  ? "bg-foreground/20 text-white"
                  : "border hover:bg-foreground/5"
              }`}
              variant="outline"
              onClick={() => {
                setActiveFilter("volume");
                setSearchQuery("");
              }}
            >
              Highest Volume
            </Button>
            <Button
              className={`py-2 px-3 rounded-2xl text-sm transition-all ${
                activeFilter === "latest" && !hasSearch
                  ? "bg-foreground/20 text-white"
                  : "border hover:bg-foreground/5"
              }`}
              variant="outline"
              onClick={() => {
                setActiveFilter("latest");
                setSearchQuery("");
              }}
            >
              Latest
            </Button>
          </div>

          <div className="relative max-w-[250px] w-full">
            <Input
              className={`rounded-2xl w-full text-sm pr-10 transition-colors ${
                isUserTyping ? "border-muted-foreground/50" : ""
              }`}
              placeholder="Search markets... (min 2 chars)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : isUserTyping ? (
                <div className="w-4 h-4 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-pulse" />
                </div>
              ) : (
                <Search className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            {(hasSearch || isUserTyping) && (
              <button
                aria-label="Clear search"
                className="absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
                onClick={() => setSearchQuery("")}
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="border-t-[0.5px] rounded-2xl overflow-hidden">
          <div className="max-h-[75vh] overflow-y-auto scrollbar-thin">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedMarkets.map((market) => {
                const isBettingOnThisMarket =
                  bettingState?.blockchainMarketId ===
                  market.blockchainMarketId;
                const betAmount = isBettingOnThisMarket
                  ? parseFloat(bettingState.amount) || 0
                  : 0;

                const probabilities =
                  isBettingOnThisMarket && betAmount > 0
                    ? calculateUpdatedProbability(
                        market,
                        betAmount,
                        bettingState.position,
                      )
                    : {
                        yes: Number(market.probability) || 0,
                        no: Number(100 - market.probability) || 0,
                      };

                const { yes, no } = probabilities;
                const total = yes + no;

                const yesPercent = total > 0 ? (yes / total) * 100 : 50;
                const noPercent = total > 0 ? (no / total) * 100 : 50;

                const minWidth = 15;
                const yesWidth = Math.max(yesPercent, minWidth);
                const noWidth = Math.max(noPercent, minWidth);

                const totalWidth = yesWidth + noWidth;
                const adjustedYesWidth =
                  totalWidth > 100 ? (yesWidth / totalWidth) * 100 : yesWidth;
                const adjustedNoWidth =
                  totalWidth > 100 ? (noWidth / totalWidth) * 100 : noWidth;

                return (
                  <div
                    key={market.id}
                    className="border-[0.5px] p-5 hover:bg-foreground/5 transition-colors duration-200 group bg-background"
                  >
                    <div className="flex flex-col gap-4 h-full">
                      <Link
                        className="flex items-center gap-3 group/link min-h-[53px]"
                        href={`/markets/${market.id}`}
                      >
                        <FallbackImage
                          alt="Market Icon"
                          className="w-13 h-13 rounded-lg flex-shrink-0"
                          height={40}
                          src={market.imageUrl}
                          width={40}
                        />
                        <h2 className="font-medium text-sm leading-tight line-clamp-3 flex-1 group-hover/link:underline">
                          {market.question}
                        </h2>
                      </Link>

                      {isBettingOnThisMarket ? (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Input
                              className="w-full text-sm rounded-2xl px-4 h-10"
                              min="0"
                              placeholder="Enter amount (APT)"
                              step="0.01"
                              type="number"
                              value={bettingState.amount}
                              onChange={(e) =>
                                handleAmountChange(e.target.value)
                              }
                            />
                            {betAmount > 0 && (
                              <div className="text-xs text-muted-foreground">
                                New probability: Yes{" "}
                                {probabilities.yes.toFixed(1)}% / No{" "}
                                {probabilities.no.toFixed(1)}%
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              className="flex-1 rounded-xl"
                              variant="outline"
                              onClick={handleBetCancel}
                            >
                              Back
                            </Button>
                            <Button
                              className={`flex-1 text-white rounded-xl text-sm py-2 ${
                                bettingState.position
                                  ? "bg-green-600 hover:bg-green-500 disabled:bg-green-400"
                                  : "bg-red-600 hover:bg-red-500 disabled:bg-red-400"
                              }`}
                              disabled={
                                !bettingState.amount ||
                                parseFloat(bettingState.amount) <= 0 ||
                                betTransaction.isLoading
                              }
                              onClick={() =>
                                handlePlaceBet(market.blockchainMarketId)
                              }
                            >
                              {betTransaction.isLoading ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  Processing...
                                </div>
                              ) : (
                                `Bet (${bettingState.position ? "Yes" : "No"})${bettingState.amount ? ` - ${bettingState.amount} APT` : ""}`
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="border rounded-2xl flex items-center h-10 overflow-hidden relative group-hover:bg-transparent">
                            <div
                              className="bg-green-500/10 h-full flex items-center justify-center text-green-500 text-xs font-medium relative z-10 hover:bg-green-500/20 transition-colors cursor-pointer"
                              style={{ width: `${adjustedYesWidth}%` }}
                              onMouseEnter={(e) => {
                                const card = e.currentTarget.closest(".group");

                                card?.classList.remove("hover:bg-foreground/5");
                                card?.classList.add("bg-green-500/5");
                              }}
                              onMouseLeave={(e) => {
                                const card = e.currentTarget.closest(".group");

                                card?.classList.remove("bg-green-500/5");
                                card?.classList.add("hover:bg-foreground/5");
                              }}
                            >
                              <span className="drop-shadow-sm">
                                {yesPercent.toFixed(1)}%
                              </span>
                            </div>
                            <div
                              className="bg-red-500/10 h-full flex items-center justify-center text-red-500 text-xs font-medium relative z-10 hover:bg-red-500/20 transition-colors cursor-pointer"
                              style={{ width: `${adjustedNoWidth}%` }}
                              onMouseEnter={(e) => {
                                const card = e.currentTarget.closest(".group");

                                card?.classList.remove("hover:bg-foreground/5");
                                card?.classList.add("bg-red-500/5");
                              }}
                              onMouseLeave={(e) => {
                                const card = e.currentTarget.closest(".group");

                                card?.classList.remove("bg-red-500/5");
                                card?.classList.add("hover:bg-foreground/5");
                              }}
                            >
                              <span className="drop-shadow-sm">
                                {noPercent.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              className="flex-1 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm py-2"
                              onClick={() =>
                                handleBetClick(market.blockchainMarketId, true)
                              }
                              onMouseEnter={(e) => {
                                const card = e.currentTarget.closest(".group");

                                card?.classList.remove("hover:bg-foreground/5");
                                card?.classList.add("bg-green-500/5");
                              }}
                              onMouseLeave={(e) => {
                                const card = e.currentTarget.closest(".group");

                                card?.classList.remove("bg-green-500/5");
                                card?.classList.add("hover:bg-foreground/5");
                              }}
                            >
                              Yes
                            </Button>
                            <Button
                              className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm py-2"
                              onClick={() =>
                                handleBetClick(market.blockchainMarketId, false)
                              }
                              onMouseEnter={(e) => {
                                const card = e.currentTarget.closest(".group");

                                card?.classList.remove("hover:bg-foreground/5");
                                card?.classList.add("bg-red-500/5");
                              }}
                              onMouseLeave={(e) => {
                                const card = e.currentTarget.closest(".group");

                                card?.classList.remove("bg-red-500/5");
                                card?.classList.add("hover:bg-foreground/5");
                              }}
                            >
                              No
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2 mt-auto">
                        <div className="flex items-center gap-2 flex-1">
                          <div className="py-1 px-2 border rounded-2xl flex items-center gap-1 w-fit">
                            <FallbackImage
                              alt="Volume Icon"
                              className="w-4 h-4 inline-block"
                              height={16}
                              src="/images/token/apt.png"
                              width={16}
                            />
                            <span className="font-medium text-[12px] -mt-0.5">
                              {formatNumber(
                                normalize(
                                  market.volume,
                                  CONTRACT_CONSTANTS.APT_DECIMALS,
                                ),
                                {
                                  decimals: 2,
                                  suffix: " Vol",
                                  compact: true,
                                },
                              )}
                            </span>
                          </div>
                          <YieldBadge
                            marketId={market.blockchainMarketId}
                            status={market.status}
                            totalPoolSize={market.totalPoolSize}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <RewardPopover market={market} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="border-t-[0.5px] px-5 py-4 bg-background">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {offset + 1}-
                  {Math.min(offset + itemsPerPage, totalItems)} of {totalItems}{" "}
                  markets
                </div>
                <Pagination
                  className="flex-1 justify-center"
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
                <div className="text-sm text-muted-foreground">
                  {currentPage} of {totalPages}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";
import React, { useState, useMemo } from "react";
import { marked } from "marked";
import { Info } from "lucide-react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { toast } from "sonner";

import { useMarket } from "@/hooks/query/api/use-markets";
import FallbackImage from "@/components/fallback-image";
import MarketChart from "@/components/chart/market-chart";
import { normalize } from "@/lib/helper/bignumber";
import { CONTRACT_CONSTANTS, convertAptToOctas } from "@/lib/aptos-contracts";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatNumber, formatAmountInput } from "@/lib/helper/number";
import { BackButton } from "@/components/back-button";
import { Button } from "@/components/ui/button";
import { useCurrentApyRates, useProtocols } from "@/hooks/query/api/use-yields";
import { Separator } from "@/components/ui/separator";
import { useAptBalance } from "@/hooks/query/use-aptos-balance";
import { useBet } from "@/hooks/mutation/use-bet";
import { PriceDisplay } from "@/components/price/price-display";
import { usePriceUtils } from "@/hooks/query/api/use-prices";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Loading from "@/components/loader/loading";
import { MultiStepTransactionDialog } from "@/components/dialog/multi-step-transaction-dialog";
import { KIZO_CONTRACT_ADDRESS } from "@/lib/aptos-contracts";

export default function MarketId({ id }: { id: string }) {
  const { data: market, isLoading } = useMarket(id);
  const [expanded, setExpanded] = useState(false);
  const [betAmount, setBetAmount] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<boolean | null>(
    null,
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: protocols } = useProtocols();
  const { data: apyRates } = useCurrentApyRates();
  const { account, connected } = useWallet();
  const address = account?.address?.toString();
  const { data: balance, isLoading: balanceLoading } = useAptBalance(address);
  const betTransaction = useBet();
  const { aptToUsd } = usePriceUtils();

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

  const bestProtocol = getHighestApyProtocol();

  const protocol = protocols?.data.find(
    (p) => p.name.toLowerCase() === bestProtocol.protocol.toLowerCase(),
  );

  const calculations = useMemo(() => {
    const amount = parseFloat(betAmount || "0");

    if (!amount || !market || selectedPosition === null) {
      return {
        odds: 1.0,
        probability: 50,
        estimatedPayout: 0,
        estimatedYield: 0,
        totalReturn: 0,
        potentialProfit: 0,
        usdValue: 0,
      };
    }

    const yesPool = parseFloat(market.yesPoolSize || "0");
    const noPool = parseFloat(market.noPoolSize || "0");
    const totalPool = yesPool + noPool;

    let odds = 1.0;
    let probability = 50;
    let estimatedPayout = 0;

    if (amount > 0) {
      if (selectedPosition === true) {
        const newYesPool = yesPool + amount;
        const newTotalPool = totalPool + amount;

        if (newYesPool > 0) {
          odds = newTotalPool / newYesPool;

          odds = Math.min(odds, 100);
        }

        if (totalPool > 0) {
          probability = Math.round((yesPool / totalPool) * 100);
        } else {
          probability = 50;
        }

        estimatedPayout = amount * odds;
      } else if (selectedPosition === false) {
        const newNoPool = noPool + amount;
        const newTotalPool = totalPool + amount;

        if (newNoPool > 0) {
          odds = newTotalPool / newNoPool;

          odds = Math.min(odds, 100);
        }

        if (totalPool > 0) {
          probability = Math.round((noPool / totalPool) * 100);
        } else {
          probability = 50;
        }

        estimatedPayout = amount * odds;
      }
    }

    const apy = bestProtocol.apy / 100;
    const daysUntilEnd = Math.max(
      1,
      Math.floor(
        (new Date(market.endDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      ),
    );
    const estimatedYield = amount * apy * (daysUntilEnd / 365);

    const totalReturn = estimatedPayout + estimatedYield;

    const potentialProfit = totalReturn - amount;

    const usdValue = amount * 12;

    return {
      odds: Math.max(1.0, odds),
      probability,
      estimatedPayout,
      estimatedYield,
      totalReturn,
      potentialProfit,
      usdValue,
    };
  }, [betAmount, market, selectedPosition, bestProtocol]);

  const handleAmountChange = (value: string) => {
    const formatted = formatAmountInput(value, 8);

    setBetAmount(formatted);
  };

  const handleMaxClick = () => {
    if (balance) {
      const maxAmount = Math.max(0, parseFloat(balance) - 0.01);

      setBetAmount(maxAmount.toString());
    }
  };

  const handleDialogClose = () => {
    if (!betTransaction.isLoading) {
      setIsDialogOpen(false);
      betTransaction.resetSteps();
    }
  };

  const handlePlaceBet = async (position: boolean) => {
    if (!connected) {
      toast.error("Please connect your wallet first");

      return;
    }

    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast.error("Please enter a valid bet amount");

      return;
    }

    if (!balance || parseFloat(balance) < parseFloat(betAmount)) {
      toast.error("Insufficient balance");

      return;
    }

    if (!market?.blockchainMarketId) {
      toast.error("Blockchain Market ID not found");

      return;
    }

    setSelectedPosition(position);

    try {
      setIsDialogOpen(true);

      const parsedAmount = parseFloat(betAmount);

      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        toast.error("Invalid bet amount");
        setSelectedPosition(null);

        return;
      }

      const parsedMarketId =
        typeof market.blockchainMarketId === "string"
          ? parseInt(market.blockchainMarketId)
          : market.blockchainMarketId;

      if (
        isNaN(parsedMarketId) ||
        parsedMarketId === null ||
        parsedMarketId === undefined
      ) {
        toast.error("Invalid blockchain market ID");
        setSelectedPosition(null);

        return;
      }

      const amountInOctas = convertAptToOctas(parsedAmount);

      const params = {
        contractAddr: KIZO_CONTRACT_ADDRESS,
        marketId: parsedMarketId,
        position,
        amount: amountInOctas,
      };

      await betTransaction.mutation.mutateAsync(params);

      setBetAmount("");
      setSelectedPosition(null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to place bet");
      setSelectedPosition(null);
    }
  };

  if (isLoading) return <Loading />;
  if (!market) return <p>Market not found.</p>;

  const html = marked(market.description || "");

  const volume = normalize(
    market.volume || "0",
    CONTRACT_CONSTANTS.APT_DECIMALS,
  );
  const endDate = new Date(market.endDate).toLocaleDateString();
  const countYes = market.countYes || "0";
  const countNo = market.countNo || "0";

  return (
    <TooltipProvider>
      <MultiStepTransactionDialog
        currentStep={betTransaction.currentStep}
        description="Processing your betting transaction"
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
      <div className="w-full h-full pb-24 lg:pb-5 min-h-svh">
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <BackButton />
          </div>
          <div className="flex flex-col lg:flex-row items-start gap-5 relative">
            <div className="flex-1 flex flex-col gap-5">
              <div className="flex flex-wrap justify-between gap-4 lg:gap-6">
                <div className="flex flex-col gap-2 p-4 sm:bg-transparent">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">
                      Total Volume
                    </span>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          The total amount of money that has been traded in this
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-3xl sm:text-4xl lg:text-5xl leading-none capitalize">
                      {formatNumber(volume, { compact: true })} APT
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 p-4 sm:bg-transparent">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">
                      End Date
                    </span>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>The date when the market will close</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl sm:text-4xl lg:text-5xl leading-none">
                      {endDate}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 p-4 sm:bg-transparent">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">
                      Total Bet Yes/No
                    </span>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          The total number of bets placed on Yes and No counts
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center gap-2 text-3xl sm:text-4xl lg:text-5xl leading-none">
                    <span className="text-green-500">
                      {formatNumber(countYes, { compact: true })}
                    </span>
                    <span>/</span>
                    <span className="text-red-500">
                      {formatNumber(countNo, { compact: true })}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 p-4 sm:bg-transparent">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">
                      Yield Earned
                    </span>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {market.status === "active"
                            ? "Current yield earned from yield farming protocols (updates in real-time)"
                            : "Total yield earned when the market was resolved"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl sm:text-4xl lg:text-5xl leading-none">
                      {formatNumber(
                        normalize(
                          market.totalYieldUntilEnd || 0,
                          CONTRACT_CONSTANTS.APT_DECIMALS,
                        ),
                        { compact: true },
                      )}{" "}
                      APT
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-[0.5px] border-border rounded-4xl">
                <div>
                  <div
                    className="
                      flex flex-col gap-5 p-5 rounded-4xl
                      sm:flex-row sm:items-center
                    "
                  >
                    <FallbackImage
                      alt={market?.id || "Market Image"}
                      className="w-full h-48 object-cover rounded-4xl
                        sm:w-48 sm:h-48 md:w-24 md:h-24"
                      height={128}
                      src={market?.imageUrl}
                      width={128}
                    />

                    <div className="flex flex-col gap-2 w-full">
                      <h1 className="text-xl sm:text-2xl font-bold">
                        {market?.question}
                      </h1>
                    </div>
                  </div>
                </div>

                <div className="border border-border rounded-4xl p-5">
                  <MarketChart marketId={market.id} />
                </div>
              </div>

              <div>
                <div
                  dangerouslySetInnerHTML={{ __html: html }}
                  className={`prose prose-blue max-w-none text-sm transition-all text-justify ${
                    expanded ? "" : "line-clamp-3"
                  }`}
                />
                <button
                  className="underline text-sm font-medium mt-2 cursor-pointer"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? "Read less" : "Read more"}
                </button>
              </div>
            </div>

            <div className="hidden lg:flex w-96 sticky top-20 max-h-svh overflow-y-auto flex-shrink-0 flex-col gap-3">
              <div className="border-[0.5px] border-border rounded-4xl p-6">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span>Place Bet</span>
                    <FallbackImage
                      alt={market?.id || "Market Image"}
                      className="w-4 h-4 object-cover rounded-full"
                      height={40}
                      src={"/images/token/apt.png"}
                      width={40}
                    />
                  </div>
                  <input
                    className="w-full focus:outline-none focus:ring-0 focus:border-transparent h-12 text-4xl font-medium bg-transparent"
                    disabled={betTransaction.isLoading || !connected}
                    placeholder="0.00"
                    type="text"
                    value={betAmount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {betAmount && !isNaN(parseFloat(betAmount))
                        ? `$${aptToUsd(parseFloat(betAmount)).toFixed(2)}`
                        : "$0.00"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {balanceLoading
                          ? "..."
                          : balance
                            ? `${parseFloat(balance).toFixed(2)} APT`
                            : "0 APT"}
                      </span>
                      <Button
                        className="rounded-full text-xs py-1 h-6 px-3"
                        disabled={!connected || balanceLoading || !balance}
                        variant={"secondary"}
                        onClick={handleMaxClick}
                      >
                        Max
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  className={
                    selectedPosition === true
                      ? "bg-green-600 hover:bg-green-500 flex-1 text-white rounded-3xl h-12 ring-green-400"
                      : "bg-green-600/20 hover:bg-green-600/40 flex-1 text-green-600 rounded-3xl h-12 border border-green-600"
                  }
                  disabled={!connected || betTransaction.isLoading}
                  onClick={() => setSelectedPosition(true)}
                >
                  {selectedPosition === true ? "✓ YES Selected" : "YES"}
                </Button>
                <Button
                  className={
                    selectedPosition === false
                      ? "bg-red-600 hover:bg-red-500 flex-1 text-white rounded-3xl h-12 ring-red-400"
                      : "bg-red-600/20 hover:bg-red-600/40 flex-1 text-red-600 rounded-3xl h-12 border border-red-600"
                  }
                  disabled={!connected || betTransaction.isLoading}
                  onClick={() => setSelectedPosition(false)}
                >
                  {selectedPosition === false ? "✓ NO Selected" : "NO"}
                </Button>
              </div>
              <div className="border-[0.5px] border-border rounded-4xl p-6">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      Odds
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-3 h-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Your payout multiplier if you win</p>
                        </TooltipContent>
                      </Tooltip>
                    </span>
                    <span className="font-medium">
                      {calculations.odds.toFixed(2)}x
                    </span>
                  </div>

                  {selectedPosition !== null &&
                    calculations.probability > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Current Probability
                        </span>
                        <span className="font-medium">
                          {calculations.probability}%
                        </span>
                      </div>
                    )}

                  <div className="flex items-center justify-between text-sm">
                    <span>Best Protocol APY</span>
                    <div className="flex items-center">
                      {protocol ? (
                        <>
                          <Tooltip>
                            <TooltipTrigger>
                              <FallbackImage
                                alt={protocol?.name || "Protocol"}
                                className="w-5 h-5 object-cover rounded-full inline-block mr-2"
                                height={20}
                                src={protocol.iconUrl}
                                width={20}
                              />
                              <span className="font-medium">
                                {formatNumber(protocol?.baseApy, {
                                  decimals: 2,
                                })}
                                %
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="capitalize">
                                {protocol.name} Protocol
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </>
                      ) : (
                        <span className="font-medium">
                          {bestProtocol.apy.toFixed(2)}%
                        </span>
                      )}
                    </div>
                  </div>

                  {selectedPosition !== null &&
                    calculations.estimatedPayout > 0 && (
                      <>
                        <Separator className="bg-neutral-800" />

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Win Payout
                          </span>
                          <div className="text-right">
                            <PriceDisplay
                              aptAmount={calculations.estimatedPayout}
                              aptClassName="font-medium"
                              className="text-sm font-medium"
                              layout="stacked"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            DeFi Yield
                          </span>
                          <div className="text-right">
                            {calculations.estimatedYield > 0 ? (
                              <PriceDisplay
                                aptAmount={calculations.estimatedYield}
                                aptClassName="font-medium"
                                className="text-sm font-medium"
                                layout="stacked"
                              />
                            ) : (
                              <span className="font-medium text-muted-foreground">
                                0 APT
                              </span>
                            )}
                          </div>
                        </div>

                        <Separator className="bg-neutral-800" />

                        <div className="flex items-center justify-between text-md font-semibold">
                          <span>Total Return</span>
                          <div className="text-right">
                            <PriceDisplay
                              aptAmount={calculations.totalReturn}
                              aptClassName="font-semibold"
                              className="font-semibold"
                              layout="stacked"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Potential Profit
                          </span>
                          <span
                            className={
                              calculations.potentialProfit > 0
                                ? "font-medium text-green-600"
                                : "font-medium text-muted-foreground"
                            }
                          >
                            {calculations.potentialProfit > 0
                              ? `+${calculations.potentialProfit.toFixed(4)} APT`
                              : "0 APT"}
                          </span>
                        </div>
                      </>
                    )}

                  {(!selectedPosition === null ||
                    !betAmount ||
                    parseFloat(betAmount) <= 0) && (
                    <div className="text-sm text-center text-muted-foreground py-4">
                      Enter an amount and select YES or NO to see payout details
                    </div>
                  )}
                </div>
              </div>

              {selectedPosition !== null && (
                <Button
                  className={
                    selectedPosition === true
                      ? "bg-green-600 hover:bg-green-700 w-full text-white rounded-3xl h-14 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 w-full text-white rounded-3xl h-14 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  }
                  disabled={
                    !connected ||
                    betTransaction.isLoading ||
                    !betAmount ||
                    isNaN(parseFloat(betAmount)) ||
                    parseFloat(betAmount) <= 0
                  }
                  onClick={() => handlePlaceBet(selectedPosition)}
                >
                  {betTransaction.isLoading
                    ? "Placing Bet..."
                    : `Place ${selectedPosition ? "YES" : "NO"} Bet`}
                </Button>
              )}
              {!connected && (
                <p className="text-sm text-center text-muted-foreground">
                  Connect your wallet to place a bet
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border z-50">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button className="w-full h-14 rounded-3xl font-semibold text-lg bg-primary hover:bg-primary/90">
                Place Bet
              </Button>
            </SheetTrigger>
            <SheetContent
              className="h-[95vh] overflow-y-auto p-0"
              side="bottom"
            >
              <div className="p-6 flex flex-col gap-4">
                <SheetHeader>
                  <SheetTitle className="text-2xl">Place Your Bet</SheetTitle>
                </SheetHeader>

                <div className="border-[0.5px] border-border rounded-4xl p-6">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span>Place Bet</span>
                      <FallbackImage
                        alt={market?.id || "Market Image"}
                        className="w-4 h-4 object-cover rounded-full"
                        height={40}
                        src={"/images/token/apt.png"}
                        width={40}
                      />
                    </div>
                    <input
                      className="w-full focus:outline-none focus:ring-0 focus:border-transparent h-12 text-4xl font-medium bg-transparent"
                      disabled={betTransaction.isLoading || !connected}
                      placeholder="0.00"
                      type="text"
                      value={betAmount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {betAmount && !isNaN(parseFloat(betAmount))
                          ? `$${aptToUsd(parseFloat(betAmount)).toFixed(2)}`
                          : "$0.00"}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {balanceLoading
                            ? "..."
                            : balance
                              ? `${parseFloat(balance).toFixed(2)} APT`
                              : "0 APT"}
                        </span>
                        <Button
                          className="rounded-full text-xs py-1 h-6 px-3"
                          disabled={!connected || balanceLoading || !balance}
                          variant={"secondary"}
                          onClick={handleMaxClick}
                        >
                          Max
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-[0.5px] border-border rounded-4xl p-6">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        Odds
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-3 h-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Your payout multiplier if you win</p>
                          </TooltipContent>
                        </Tooltip>
                      </span>
                      <span className="font-medium">
                        {calculations.odds.toFixed(2)}x
                      </span>
                    </div>

                    {selectedPosition !== null &&
                      calculations.probability > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Current Probability
                          </span>
                          <span className="font-medium">
                            {calculations.probability}%
                          </span>
                        </div>
                      )}

                    <div className="flex items-center justify-between text-sm">
                      <span>Best Protocol APY</span>
                      <div className="flex items-center">
                        {protocol ? (
                          <>
                            <Tooltip>
                              <TooltipTrigger>
                                <FallbackImage
                                  alt={protocol?.name || "Protocol"}
                                  className="w-5 h-5 object-cover rounded-full inline-block mr-2"
                                  height={20}
                                  src={protocol.iconUrl}
                                  width={20}
                                />
                                <span className="font-medium">
                                  {formatNumber(protocol?.baseApy, {
                                    decimals: 2,
                                  })}
                                  %
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="capitalize">
                                  {protocol.name} Protocol
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </>
                        ) : (
                          <span className="font-medium">
                            {bestProtocol.apy.toFixed(2)}%
                          </span>
                        )}
                      </div>
                    </div>

                    {selectedPosition !== null &&
                      calculations.estimatedPayout > 0 && (
                        <>
                          <Separator className="bg-neutral-800" />

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Win Payout
                            </span>
                            <div className="text-right">
                              <PriceDisplay
                                aptAmount={calculations.estimatedPayout}
                                aptClassName="font-medium"
                                className="text-sm font-medium"
                                layout="stacked"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              DeFi Yield
                            </span>
                            <div className="text-right">
                              {calculations.estimatedYield > 0 ? (
                                <PriceDisplay
                                  aptAmount={calculations.estimatedYield}
                                  aptClassName="font-medium"
                                  className="text-sm font-medium"
                                  layout="stacked"
                                />
                              ) : (
                                <span className="font-medium text-muted-foreground">
                                  0 APT
                                </span>
                              )}
                            </div>
                          </div>

                          <Separator className="bg-neutral-800" />

                          <div className="flex items-center justify-between text-md font-semibold">
                            <span>Total Return</span>
                            <div className="text-right">
                              <PriceDisplay
                                aptAmount={calculations.totalReturn}
                                aptClassName="font-semibold"
                                className="font-semibold"
                                layout="stacked"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Potential Profit
                            </span>
                            <span
                              className={
                                calculations.potentialProfit > 0
                                  ? "font-medium text-green-600"
                                  : "font-medium text-muted-foreground"
                              }
                            >
                              {calculations.potentialProfit > 0
                                ? `+${calculations.potentialProfit.toFixed(4)} APT`
                                : "0 APT"}
                            </span>
                          </div>
                        </>
                      )}

                    {(!selectedPosition === null ||
                      !betAmount ||
                      parseFloat(betAmount) <= 0) && (
                      <div className="text-sm text-center text-muted-foreground py-4">
                        Enter an amount and select YES or NO to see payout
                        details
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    className={
                      selectedPosition === true
                        ? "bg-green-600 hover:bg-green-500 flex-1 text-white rounded-3xl h-12 ring-green-400"
                        : "bg-green-600/20 hover:bg-green-600/40 flex-1 text-green-600 rounded-3xl h-12 border border-green-600"
                    }
                    disabled={!connected || betTransaction.isLoading}
                    onClick={() => setSelectedPosition(true)}
                  >
                    {selectedPosition === true ? "✓ YES Selected" : "YES"}
                  </Button>
                  <Button
                    className={
                      selectedPosition === false
                        ? "bg-red-600 hover:bg-red-500 flex-1 text-white rounded-3xl h-12 ring-red-400"
                        : "bg-red-600/20 hover:bg-red-600/40 flex-1 text-red-600 rounded-3xl h-12 border border-red-600"
                    }
                    disabled={!connected || betTransaction.isLoading}
                    onClick={() => setSelectedPosition(false)}
                  >
                    {selectedPosition === false ? "✓ NO Selected" : "NO"}
                  </Button>
                </div>

                {selectedPosition !== null && (
                  <Button
                    className={
                      selectedPosition === true
                        ? "bg-green-600 hover:bg-green-700 w-full text-white rounded-3xl h-14 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700 w-full text-white rounded-3xl h-14 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    }
                    disabled={
                      !connected ||
                      betTransaction.isLoading ||
                      !betAmount ||
                      isNaN(parseFloat(betAmount)) ||
                      parseFloat(betAmount) <= 0
                    }
                    onClick={() => {
                      handlePlaceBet(selectedPosition);
                      setIsSheetOpen(false);
                    }}
                  >
                    {betTransaction.isLoading
                      ? "Placing Bet..."
                      : `Place ${selectedPosition ? "YES" : "NO"} Bet`}
                  </Button>
                )}
                {!connected && (
                  <p className="text-sm text-center text-muted-foreground">
                    Connect your wallet to place a bet
                  </p>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </TooltipProvider>
  );
}

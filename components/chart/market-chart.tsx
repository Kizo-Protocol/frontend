"use client";

import React, { useState, useEffect } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { MultiLineChart } from "./multi-line-chart";

type TimeFrame = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";

interface TimeframeSelectorProps {
  selectedTimeframe: TimeFrame;
  onTimeframeChange: (timeframe: TimeFrame) => void;
  loading?: boolean;
}

function TimeframeSelector({
  selectedTimeframe,
  onTimeframeChange,
  loading,
}: TimeframeSelectorProps) {
  const timeframes: { value: TimeFrame; label: string; description: string }[] =
    [
      { value: "1m", label: "1m", description: "1 minute intervals" },
      { value: "5m", label: "5m", description: "5 minute intervals" },
      { value: "15m", label: "15m", description: "15 minute intervals" },
      { value: "1h", label: "1h", description: "1 hour intervals" },
      { value: "4h", label: "4h", description: "4 hour intervals" },
      { value: "1d", label: "1d", description: "1 day intervals" },
    ];

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-2">
        {timeframes.map((tf) => (
          <Tooltip key={tf.value}>
            <TooltipTrigger asChild>
              <Button
                className={`
                  text-xs transition-all duration-200
                  ${
                    selectedTimeframe === tf.value
                      ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                      : "bg-transparent border-border dark:border-border dark:bg-transparent text-neutral-300 hover:bg-neutral-800 hover:border-border"
                  }
                  ${loading ? "opacity-50 cursor-not-allowed" : ""}
                `}
                disabled={loading}
                size="sm"
                variant={selectedTimeframe === tf.value ? "default" : "outline"}
                onClick={() => onTimeframeChange(tf.value)}
              >
                {tf.label}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-neutral-800 border-border text-neutral-200">
              <p>{tf.description}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

interface MarketChartProps {
  marketId: string;
  className?: string;
  height?: number;
  defaultTimeframe?: TimeFrame;
}

export function MarketChart({
  marketId,
  className,
  height = 400,
  defaultTimeframe = "1m",
}: MarketChartProps) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] =
    useState<TimeFrame>(defaultTimeframe);
  const [visibleSeries, setVisibleSeries] = useState<string[]>([
    "volume-total",
  ]);

  const fetchChartData = async (timeframe: TimeFrame) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/charts/market/${marketId}?series=volume&interval=${timeframe}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const apiResponse = await response.json();

      setChartData(apiResponse.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (marketId) {
      fetchChartData(selectedTimeframe);
    }
  }, [marketId, selectedTimeframe]);

  const handleTimeframeChange = (timeframe: TimeFrame) => {
    setSelectedTimeframe(timeframe);
  };

  const handleSeriesToggle = (seriesId: string, visible: boolean) => {
    setVisibleSeries((prev) => {
      if (visible && !prev.includes(seriesId)) {
        return [...prev, seriesId];
      } else if (!visible && prev.includes(seriesId)) {
        return prev.filter((id) => id !== seriesId);
      }

      return prev;
    });
  };

  if (error) {
    return (
      <div className={className}>
        <Card className="bg-neutral-900 border-red-800">
          <CardContent className="p-6 text-center">
            <div className="text-red-400 text-xl mb-2">Error Loading Chart</div>
            <div className="text-neutral-400 mb-4">{error}</div>
            <Button
              className="border-border text-neutral-300"
              variant="outline"
              onClick={() => fetchChartData(selectedTimeframe)}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`dark ${className || ""}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <TimeframeSelector
                loading={loading}
                selectedTimeframe={selectedTimeframe}
                onTimeframeChange={handleTimeframeChange}
              />
            </div>
          </div>
        </div>
      </div>

      <Card className="p-0 border-0">
        <CardContent className="p-0">
          {chartData ? (
            <MultiLineChart
              data={chartData}
              enablePan={true}
              enableZoom={true}
              height={height}
              showCrosshair={true}
              showLegend={true}
              visibleSeries={visibleSeries}
              onSeriesVisibilityChange={handleSeriesToggle}
            />
          ) : (
            <div
              className="flex items-center justify-center bg-neutral-900 border border-border rounded-lg"
              style={{ height }}
            >
              <div className="text-neutral-400">No chart data available</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default MarketChart;

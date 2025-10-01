import type {
  MultiLineChartData,
  MultiLineSeriesData,
  TimeValueData,
  ChartDataPoint,
  ChartTheme,
} from "./types";

import { LineStyle, LineType } from "lightweight-charts";

import { CONTRACT_CONSTANTS } from "@/lib/aptos-contracts";

export const DEFAULT_COLORS = {
  probability: {
    yes: "#10b981",
    no: "#f59e0b",
  },
  volume: {
    yes: "#22c55e",
    no: "#ef4444",
    total: "#6366f1",
  },
  odds: {
    yes: "#22c55e",
    no: "#ef4444",
  },
  bets: "#8b5cf6",
};

const OCTAS_MULTIPLIER = Math.pow(10, CONTRACT_CONSTANTS.APT_DECIMALS);

export function normalizeVolumeValue(value: number): number {
  return value / OCTAS_MULTIPLIER;
}

export function transformTimeValueData(
  data: TimeValueData[],
  color?: string,
  shouldNormalize: boolean = false,
): ChartDataPoint[] {
  return data.map((point) => ({
    time: point.time,
    value: shouldNormalize ? normalizeVolumeValue(point.value) : point.value,
    ...(color && { color }),
  }));
}

export function getLineStyle(style?: string): LineStyle {
  switch (style) {
    case "dotted":
      return LineStyle.Dotted;
    case "dashed":
      return LineStyle.Dashed;
    default:
      return LineStyle.Solid;
  }
}

export function getLineType(type?: string): LineType {
  switch (type) {
    case "withSteps":
      return LineType.WithSteps;
    case "curved":
      return LineType.Curved;
    default:
      return LineType.Simple;
  }
}

export function transformChartData(
  data: MultiLineChartData,
  colors = DEFAULT_COLORS,
  visibleSeries: string[] = [],
): MultiLineSeriesData[] {
  const series: MultiLineSeriesData[] = [];

  if (data.volume) {
    if (data.volume.yes.length > 0) {
      series.push({
        id: "volume-yes",
        name: "Yes Volume (APT)",
        data: transformTimeValueData(data.volume.yes, colors.volume.yes, true),
        color: colors.volume.yes,
        visible: visibleSeries.includes("volume-yes"),
        lineWidth: 2,
        lineStyle: "dashed",
      });
    }

    if (data.volume.no.length > 0) {
      series.push({
        id: "volume-no",
        name: "No Volume (APT)",
        data: transformTimeValueData(data.volume.no, colors.volume.no, true),
        color: colors.volume.no,
        visible: visibleSeries.includes("volume-no"),
        lineWidth: 2,
        lineStyle: "dashed",
      });
    }

    if (data.volume.total.length > 0) {
      series.push({
        id: "volume-total",
        name: "Total Volume (APT)",
        data: transformTimeValueData(
          data.volume.total,
          colors.volume.total,
          true,
        ),
        color: colors.volume.total,
        visible: visibleSeries.includes("volume-total"),
        lineWidth: 3,
        lineStyle: "dashed",
      });
    }
  }

  return series;
}

export const lightChartTheme: ChartTheme = {
  layout: {
    background: {
      color: "#ffffff",
    },
    textColor: "#191919",
  },
  grid: {
    vertLines: {
      color: "#f0f3fa",
    },
    horzLines: {
      color: "#f0f3fa",
    },
  },
  crosshair: {
    mode: 1,
    vertLine: {
      color: "#9598a1",
      labelBackgroundColor: "#9598a1",
    },
    horzLine: {
      color: "#9598a1",
      labelBackgroundColor: "#9598a1",
    },
  },
  timeScale: {
    borderColor: "#d1d4dc",
    timeVisible: true,
    secondsVisible: false,
  },
  watermark: {
    visible: false,
    fontSize: 24,
    horzAlign: "center",
    vertAlign: "center",
    color: "rgba(171, 71, 188, 0.5)",
  },
};

export const darkChartTheme: ChartTheme = {
  layout: {
    background: {
      color: "#0f172a",
    },
    textColor: "#f1f5f9",
  },
  grid: {
    vertLines: {
      color: "#1e293b",
    },
    horzLines: {
      color: "#1e293b",
    },
  },
  crosshair: {
    mode: 1,
    vertLine: {
      color: "#64748b",
      labelBackgroundColor: "#334155",
    },
    horzLine: {
      color: "#64748b",
      labelBackgroundColor: "#334155",
    },
  },
  timeScale: {
    borderColor: "#334155",
    timeVisible: true,
    secondsVisible: false,
  },
  watermark: {
    visible: false,
    fontSize: 24,
    horzAlign: "center",
    vertAlign: "center",
    color: "rgba(100, 116, 139, 0.5)",
  },
};

export function getChartTheme(
  theme: "light" | "dark" | "auto" = "auto",
): ChartTheme {
  if (theme === "light") return lightChartTheme;
  if (theme === "dark") return darkChartTheme;

  if (typeof window !== "undefined") {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    return isDark ? darkChartTheme : lightChartTheme;
  }

  return darkChartTheme;
}

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatValue(
  value: number | string,
  precision: number = 4,
): string {
  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return "0.00";
  }

  if (numValue > 0 && numValue < 1e-10) {
    return "0.00";
  }

  if (numValue < 1) {
    return numValue.toFixed(precision);
  } else if (numValue < 1000) {
    return numValue.toFixed(2);
  } else if (numValue < 1000000) {
    return `${(numValue / 1000).toFixed(1)}K`;
  } else {
    return `${(numValue / 1000000).toFixed(1)}M`;
  }
}

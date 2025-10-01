import { normalize } from "./bignumber";

export const formatAmountInput = (raw: string, decimals = 6): string => {
  raw = raw.replace(/[^\d.]/g, "");

  if (raw === "") return "";

  const firstDotIndex = raw.indexOf(".");

  if (firstDotIndex !== -1) {
    raw =
      raw.slice(0, firstDotIndex + 1) +
      raw.slice(firstDotIndex + 1).replace(/\./g, "");
  }

  if (raw.startsWith(".")) {
    raw = "0" + raw;
  }

  const [whole, fraction = ""] = raw.split(".");

  const normalizedWhole = whole.replace(/^0+(?=\d)/, "");

  const limitedFraction = fraction.slice(0, decimals);

  if (raw.endsWith(".") && limitedFraction === "") {
    return normalizedWhole + ".";
  }

  return limitedFraction.length > 0
    ? normalizedWhole + "." + limitedFraction
    : normalizedWhole;
};

export function cleanNumberInput(formatted: string): string {
  return formatted.replace(/,/g, "");
}

export interface FormatNumberOptions {
  decimals?: number;
  thousandSeparator?: string;
  decimalSeparator?: string;
  prefix?: string;
  suffix?: string;
  minDecimals?: number;
  maxDecimals?: number;
  compact?: boolean;
}

export function formatNumber(
  value: number | string,
  options: FormatNumberOptions = {},
): string {
  const {
    decimals,
    thousandSeparator = ",",
    decimalSeparator = ".",
    prefix = "",
    suffix = "",
    minDecimals,
    maxDecimals,
    compact = false,
  } = options;

  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) return "0";

  if (compact) {
    let newValue = num;
    let suffixCompact = "";

    if (Math.abs(num) >= 1_000_000_000) {
      newValue = num / 1_000_000_000;
      suffixCompact = "B";
    } else if (Math.abs(num) >= 1_000_000) {
      newValue = num / 1_000_000;
      suffixCompact = "M";
    } else if (Math.abs(num) >= 1_000) {
      newValue = num / 1_000;
      suffixCompact = "K";
    }

    const decimalPlaces = decimals ?? 2;

    return (
      prefix +
      newValue
        .toFixed(decimalPlaces)
        .replace(/\.0+$/, "")
        .replace(/(\.\d*[1-9])0+$/, "$1") +
      suffixCompact +
      suffix
    );
  }

  let decimalPlaces = decimals;

  if (decimalPlaces === undefined) {
    if (maxDecimals !== undefined) {
      const str = num.toString();
      const decimalIndex = str.indexOf(".");

      if (decimalIndex === -1) {
        decimalPlaces = minDecimals || 0;
      } else {
        const currentDecimals = str.length - decimalIndex - 1;

        decimalPlaces = Math.min(currentDecimals, maxDecimals);
        if (minDecimals !== undefined) {
          decimalPlaces = Math.max(decimalPlaces, minDecimals);
        }
      }
    } else {
      decimalPlaces = 2;
    }
  }

  const formatted = num.toFixed(decimalPlaces);
  const [whole, fraction] = formatted.split(".");

  const wholeFormatted = whole.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    thousandSeparator,
  );

  let result = wholeFormatted;

  if (fraction && decimalPlaces > 0) {
    result += decimalSeparator + fraction;
  }

  return prefix + result + suffix;
}

export function formatNumberNormalize({
  value,
  options,
  normalized,
}: {
  value: number | string;
  options?: FormatNumberOptions;
  normalized?: number;
}): string {
  const {
    decimals,
    thousandSeparator = ",",
    decimalSeparator = ".",
    prefix = "",
    suffix = "",
    minDecimals,
    maxDecimals,
  } = (options as FormatNumberOptions) || {};

  if (normalized) {
    value = normalize(value, normalized);
  }

  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) return "0";
  let decimalPlaces = decimals;

  if (decimalPlaces === undefined) {
    if (maxDecimals !== undefined) {
      const str = num.toString();
      const decimalIndex = str.indexOf(".");

      if (decimalIndex === -1) {
        decimalPlaces = minDecimals || 0;
      } else {
        const currentDecimals = str.length - decimalIndex - 1;

        decimalPlaces = Math.min(currentDecimals, maxDecimals);
        if (minDecimals !== undefined) {
          decimalPlaces = Math.max(decimalPlaces, minDecimals);
        }
      }
    } else {
      decimalPlaces = 2;
    }
  }

  const formatted = num.toFixed(decimalPlaces);
  const [whole, fraction] = formatted.split(".");

  const wholeFormatted = whole.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    thousandSeparator,
  );

  let result = wholeFormatted;

  if (fraction && decimalPlaces > 0) {
    result += decimalSeparator + fraction;
  }

  return prefix + result + suffix;
}

export function formatRealCurrency(
  value: number | string,
  options: {
    currency?: string;
    decimals?: number;
    locale?: string;
  } = {},
): string {
  const { currency = "USD", decimals = 2, locale = "en-US" } = options;

  const numberValue = typeof value === "string" ? parseFloat(value) : value;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numberValue);
}

export function formatCurrency(value: number | string, decimals = 2): string {
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num) || num === 0) return "$0.00";

  if (num < 0.01 && num > 0) {
    return `$<0.01`;
  }

  if (num >= 1_000_000_000) {
    return `$${(num / 1_000_000_000).toFixed(1)}B`;
  }
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `$${(num / 1_000).toFixed(1)}K`;
  }

  const formatted = num.toFixed(decimals);
  const [whole, fraction] = formatted.split(".");
  const wholeFormatted = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return `$${wholeFormatted}.${fraction}`;
}

export function formatPercentage(value: number | string, decimals = 2): string {
  return formatNumber(value, {
    decimals,
    suffix: "%",
  });
}

export function formatCompactNumber(
  value: number | string,
  decimals = 2,
): string {
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) return "0";

  const absNum = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (absNum >= 1e12) {
    return sign + formatNumber(absNum / 1e12, { decimals }) + "T";
  } else if (absNum >= 1e9) {
    return sign + formatNumber(absNum / 1e9, { decimals }) + "B";
  } else if (absNum >= 1e6) {
    return sign + formatNumber(absNum / 1e6, { decimals }) + "M";
  } else if (absNum >= 1e3) {
    return sign + formatNumber(absNum / 1e3, { decimals }) + "K";
  }

  return formatNumber(num, { decimals });
}

export function formatCryptoAmount(
  value: number | string,
  options: {
    maxDecimals?: number;
    minDecimals?: number;
    showFullPrecision?: boolean;
  } = {},
): string {
  const {
    maxDecimals = 8,
    minDecimals = 0,
    showFullPrecision = false,
  } = options;

  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num) || num === 0) return "0";

  if (showFullPrecision) {
    return num.toString();
  }

  if (Math.abs(num) >= 1) {
    return formatNumber(num, {
      maxDecimals: Math.min(maxDecimals, 4),
      minDecimals,
    });
  } else if (Math.abs(num) >= 0.01) {
    return formatNumber(num, {
      maxDecimals: Math.min(maxDecimals, 18),
      minDecimals,
    });
  } else {
    return formatNumber(num, { maxDecimals, minDecimals });
  }
}

export function parseFormattedNumber(formatted: string): number {
  const cleaned = formatted.replace(/[^\d.-]/g, "");
  const num = parseFloat(cleaned);

  return isNaN(num) ? 0 : num;
}

export function isValidNumber(value: string): boolean {
  const cleaned = cleanNumberInput(value);

  return !isNaN(parseFloat(cleaned)) && isFinite(parseFloat(cleaned));
}

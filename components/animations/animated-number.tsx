"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

export function AnimatedNumber({
  value,
  duration = 0.3,
  startFrom = "auto",
  fractionDigits = 2,
}: {
  value: string | number;
  duration?: number;
  startFrom?: "auto" | number;
  fractionDigits?: number;
}) {
  const numericValue = typeof value === "string" ? parseFloat(value) : value;

  const count = useMotionValue(
    typeof startFrom === "number"
      ? startFrom
      : numericValue > 100
        ? Math.floor(numericValue * 0.8)
        : 0,
  );

  const formatted = useTransform(count, (latest) =>
    latest.toLocaleString(undefined, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }),
  );

  useEffect(() => {
    const controls = animate(count, numericValue, { duration });

    return controls.stop;
  }, [numericValue, duration, count]);

  return <motion.span>{formatted}</motion.span>;
}

"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, useEffect } from "react";

import { cn } from "@/lib/utils";

const Spinner = ({ className }: { className?: string }) => (
  <div className="relative">
    <svg
      className={cn("animate-spin h-6 w-6 text-lime-500", className)}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-90"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        fill="currentColor"
      />
    </svg>
    <div className="absolute inset-0 animate-pulse">
      <div className="w-6 h-6 bg-lime-500/20 rounded-full blur-sm" />
    </div>
  </div>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn(
      "w-6 h-6 text-slate-400 transition-colors duration-300",
      className,
    )}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const CheckFilled = ({ className }: { className?: string }) => (
  <motion.svg
    animate={{ scale: 1, rotate: 0 }}
    className={cn("w-6 h-6 text-lime-500", className)}
    fill="currentColor"
    initial={{ scale: 0.8, rotate: -10 }}
    transition={{ type: "spring", stiffness: 200, damping: 15 }}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      clipRule="evenodd"
      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
      fillRule="evenodd"
    />
  </motion.svg>
);

const ProgressBar = ({
  progress,
  total,
}: {
  progress: number;
  total: number;
}) => (
  <div className="w-full mb-8">
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
        Step {progress + 1} of {total}
      </span>
      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
        {Math.round(((progress + 1) / total) * 100)}%
      </span>
    </div>
    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
      <motion.div
        animate={{ width: `${((progress + 1) / total) * 100}%` }}
        className="h-full bg-gradient-to-r from-lime-500 to-emerald-500 rounded-full"
        initial={{ width: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  </div>
);

type LoadingState = {
  text: string;
};

const LoaderCore = ({
  loadingStates,
  value = 0,
}: {
  loadingStates: LoadingState[];
  value?: number;
}) => (
  <div className="flex relative justify-start max-w-lg mx-auto flex-col">
    <ProgressBar progress={value} total={loadingStates.length} />

    <div className="space-y-4">
      {loadingStates.map((loadingState, index) => {
        const distance = Math.abs(index - value);
        const opacity = Math.max(1 - distance * 0.3, 0.3);
        const isActive = index === value;
        const isCompleted = index < value;
        const isPending = index > value;

        return (
          <motion.div
            key={index}
            animate={{
              opacity,
              x: 0,
              scale: isActive ? 1.02 : 1,
            }}
            className={cn(
              "flex items-center gap-4 p-4 rounded-lg transition-all duration-500",
              isActive &&
                "bg-lime-50 dark:bg-lime-950/30 shadow-sm border border-lime-200 dark:border-lime-800",
              isCompleted && "bg-slate-50 dark:bg-slate-900/50",
              isPending && "opacity-60",
            )}
            initial={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <div className="flex-shrink-0 relative">
              {isCompleted && (
                <>
                  <CheckFilled />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    className="absolute inset-0 bg-lime-500 rounded-full blur-lg opacity-20"
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </>
              )}
              {isPending && <CheckIcon />}
              {isActive && <Spinner />}
            </div>

            <div className="flex-1 min-w-0">
              <motion.span
                animate={
                  isActive
                    ? {
                        scale: [1, 1.02, 1],
                      }
                    : {}
                }
                className={cn(
                  "text-base font-medium transition-colors duration-300",
                  isActive && "text-lime-700 dark:text-lime-400",
                  isCompleted && "text-slate-700 dark:text-slate-300",
                  isPending && "text-slate-500 dark:text-slate-400",
                )}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {loadingState.text}
              </motion.span>
            </div>

            {isActive && (
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                className="flex-shrink-0 w-2 h-2 bg-lime-500 rounded-full"
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  </div>
);

export const MultiStepLoader = ({
  loadingStates,
  loading,
  duration = 2000,
  loop = true,
  value: controlledValue,
}: {
  loadingStates: LoadingState[];
  loading?: boolean;
  duration?: number;
  loop?: boolean;
  value?: number;
}) => {
  const [internalValue, setInternalValue] = useState(0);
  const value = controlledValue ?? internalValue;

  useEffect(() => {
    if (!loading) {
      setInternalValue(0);

      return;
    }

    const timeout = setTimeout(() => {
      setInternalValue((prev) =>
        loop
          ? prev === loadingStates.length - 1
            ? 0
            : prev + 1
          : Math.min(prev + 1, loadingStates.length - 1),
      );
    }, duration);

    return () => clearTimeout(timeout);
  }, [internalValue, loading, loop, loadingStates.length, duration]);

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          animate={{ opacity: 1 }}
          className="w-full h-full fixed inset-0 z-[60] flex items-center justify-center"
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
              backgroundSize: "20px 20px",
            }}
          />

          <motion.div
            animate={{ scale: 1, y: 0 }}
            className="relative z-10 w-full max-w-lg mx-4"
            exit={{ scale: 0.9, y: 20 }}
            initial={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <div className="bg-background dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8">
              <LoaderCore loadingStates={loadingStates} value={value} />
            </div>
          </motion.div>

          <div className="absolute inset-0 bg-gradient-radial from-lime-500/5 via-transparent to-transparent" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

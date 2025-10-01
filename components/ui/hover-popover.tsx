"use client";

import { useEffect, useRef } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface HoverPopoverProps {
  content: React.ReactNode;
  trigger: React.ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  contentClassName?: string;
  autoCloseDelay?: number;
  disabled?: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function HoverPopover({
  content,
  trigger,
  align = "end",
  side = "bottom",
  contentClassName,
  autoCloseDelay = 3000,
  disabled = false,
  isOpen,
  setIsOpen,
}: HoverPopoverProps) {
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimeouts = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (autoCloseTimeoutRef.current) {
      clearTimeout(autoCloseTimeoutRef.current);
      autoCloseTimeoutRef.current = null;
    }
  };

  const startAutoCloseTimer = () => {
    if (autoCloseTimeoutRef.current) {
      clearTimeout(autoCloseTimeoutRef.current);
    }
    autoCloseTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, autoCloseDelay);
  };

  const handleMouseEnter = () => {
    if (disabled) return;

    clearTimeouts();
    setIsOpen(true);
    startAutoCloseTimer();
  };

  const handleMouseLeave = () => {
    if (disabled) return;

    startAutoCloseTimer();
  };

  const handleContentMouseEnter = () => {
    if (disabled) return;

    if (autoCloseTimeoutRef.current) {
      clearTimeout(autoCloseTimeoutRef.current);
      autoCloseTimeoutRef.current = null;
    }
  };

  const handleContentMouseLeave = () => {
    if (disabled) return;

    startAutoCloseTimer();
  };

  useEffect(() => {
    return () => {
      clearTimeouts();
    };
  }, []);

  if (disabled) {
    return <>{trigger}</>;
  }

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>

        <PopoverContent
          align={align}
          className={contentClassName}
          side={side}
          onMouseEnter={handleContentMouseEnter}
          onMouseLeave={handleContentMouseLeave}
        >
          {content}
        </PopoverContent>
      </Popover>
    </div>
  );
}

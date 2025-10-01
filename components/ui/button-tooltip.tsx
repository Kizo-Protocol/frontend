import React from "react";
import { CircleHelp } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

export default function ButtonTooltip({
  text,
  iconSize,
  className,
}: {
  text: string;
  iconSize?: number;
  className?: string;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <CircleHelp
            className={cn(
              `w-${iconSize || 4} h-${iconSize || 4} cursor-pointer`,
              className,
            )}
          />
        </TooltipTrigger>
        <TooltipContent
          className="w-auto max-w-xs whitespace-normal break-words text-left inline-block"
          side="top"
        >
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

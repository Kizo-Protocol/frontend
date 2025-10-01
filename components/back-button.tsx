"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

export function BackButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      className={cn(
        "text-md text-muted-foreground cursor-pointer flex items-center gap-1 w-fit hover:text-foreground",
        className,
      )}
      onClick={() => router.back()}
    >
      <ChevronLeft className="w-5 h-5" />
      <span className="-mt-0.5">Go back</span>
    </button>
  );
}

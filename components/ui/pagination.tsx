"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  maxVisiblePages?: number;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  maxVisiblePages = 7,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - delta);
    let end = Math.min(totalPages, currentPage + delta);

    if (currentPage <= delta) {
      end = Math.min(totalPages, maxVisiblePages);
    }
    if (currentPage > totalPages - delta) {
      start = Math.max(1, totalPages - maxVisiblePages + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();
  const showLeftEllipsis = visiblePages[0] > 2;
  const showRightEllipsis =
    visiblePages[visiblePages.length - 1] < totalPages - 1;

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center", className)}
      role="navigation"
    >
      <div className="flex items-center gap-1">
        <Button
          className="h-8 w-8 p-0"
          disabled={currentPage <= 1}
          size="sm"
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>

        {showFirstLast && visiblePages[0] > 1 && (
          <>
            <Button
              className="h-8 w-8 p-0"
              size="sm"
              variant={currentPage === 1 ? "default" : "outline"}
              onClick={() => onPageChange(1)}
            >
              1
            </Button>
            {showLeftEllipsis && (
              <div className="flex items-center justify-center w-8 h-8">
                <MoreHorizontal className="h-4 w-4" />
              </div>
            )}
          </>
        )}

        {visiblePages.map((page) => (
          <Button
            key={page}
            className="h-8 w-8 p-0"
            size="sm"
            variant={currentPage === page ? "default" : "outline"}
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}

        {showFirstLast &&
          visiblePages[visiblePages.length - 1] < totalPages && (
            <>
              {showRightEllipsis && (
                <div className="flex items-center justify-center w-8 h-8">
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              )}
              <Button
                className="h-8 w-8 p-0"
                size="sm"
                variant={currentPage === totalPages ? "default" : "outline"}
                onClick={() => onPageChange(totalPages)}
              >
                {totalPages}
              </Button>
            </>
          )}

        <Button
          className="h-8 w-8 p-0"
          disabled={currentPage >= totalPages}
          size="sm"
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>
      </div>
    </nav>
  );
}

"use client";

import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps): React.ReactElement | null {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  );

  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/25">
        Page {currentPage} of {totalPages}
      </p>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="cursor-pointer px-3 text-[9px] uppercase tracking-[0.15em] text-white/40 hover:text-white"
        >
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {pages.map((page) => (
            <Button
              key={page}
              type="button"
              variant={
                page === currentPage
                  ? "default"
                  : "ghost"
              }
              size="sm"
              onClick={() => onPageChange(page)}
              className={`cursor-pointer px-3 text-[9px] ${page === currentPage
                ? "bg-[#ff729f] text-[#1c1c1c] hover:bg-[#ff729f]/90"
                : "text-white/30 hover:text-white"
                }`}
            >
              {page}
            </Button>
          ))}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="cursor-pointer px-3 text-[9px] uppercase tracking-[0.15em] text-white/40 hover:text-white"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

type Props = {
  page: number;
  totalPages: number;
  total: number;
  rangeStart: number;
  rangeEnd: number;
  pageSize: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onFirst?: () => void;
  onLast?: () => void;
  onPageChange?: (page: number) => void;
};

export function TablePagination({
  page,
  totalPages,
  total,
  rangeStart,
  rangeEnd,
  pageSize,
  canPrev,
  canNext,
  onPrev,
  onNext,
  onFirst,
  onLast,
  onPageChange,
}: Props) {
  if (total === 0) return null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
      <p className="text-center text-xs text-muted-foreground sm:text-left">
        Showing <span className="font-semibold text-foreground">{rangeStart}–{rangeEnd}</span> of{" "}
        <span className="font-semibold text-foreground">{total}</span>
        <span className="hidden sm:inline"> · {pageSize} per page</span>
      </p>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <PagerBtn label="First page" disabled={!canPrev} onClick={onFirst ?? (() => onPageChange?.(1))}>
          <ChevronsLeft className="h-4 w-4" />
        </PagerBtn>
        <PagerBtn label="Previous page" disabled={!canPrev} onClick={onPrev}>
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden xs:inline">Prev</span>
        </PagerBtn>

        {onPageChange ? (
          <div className="flex items-center gap-1.5 px-1 text-xs font-medium">
            <span className="text-muted-foreground">Page</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={page}
              onChange={(e) => {
                const n = Number.parseInt(e.target.value, 10);
                if (!Number.isNaN(n)) onPageChange(Math.min(totalPages, Math.max(1, n)));
              }}
              className="input-app w-14 rounded-lg px-2 py-1.5 text-center text-xs font-bold"
              aria-label="Page number"
            />
            <span className="text-muted-foreground">/ {totalPages}</span>
          </div>
        ) : (
          <span className="min-w-[5rem] px-2 text-center text-xs font-semibold">
            {page} / {totalPages}
          </span>
        )}

        <PagerBtn label="Next page" disabled={!canNext} onClick={onNext}>
          <span className="hidden xs:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </PagerBtn>
        <PagerBtn label="Last page" disabled={!canNext} onClick={onLast ?? (() => onPageChange?.(totalPages))}>
          <ChevronsRight className="h-4 w-4" />
        </PagerBtn>
      </div>
    </div>
  );
}

function PagerBtn({
  children,
  label,
  disabled,
  onClick,
}: {
  children: ReactNode;
  label: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-border/80 bg-background px-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary/60 disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  );
}

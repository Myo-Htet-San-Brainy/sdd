import React from "react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  onPageChange,
  className = "",
}) => {
  if (totalPages <= 1) return null;

  // Helper to generate page numbers (with ellipsis for large sets)
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (page >= totalPages - 3) {
        pages.push(
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <nav
      className={`flex items-center justify-center gap-2 mt-6 ${className}`}
      aria-label="Pagination"
    >
      <button
        className="px-3 py-1 rounded border bg-white text-zinc-700 hover:bg-zinc-100 disabled:opacity-50"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        &larr;
      </button>
      {getPageNumbers().map((p, idx) =>
        typeof p === "number" ? (
          <button
            key={p}
            className={`px-3 py-1 rounded border ${
              p === page
                ? "bg-red-600 text-white border-red-600"
                : "bg-white text-zinc-700 hover:bg-zinc-100"
            }`}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        ) : (
          <span
            key={"ellipsis-" + idx}
            className="px-2 text-zinc-400 select-none"
          >
            ...
          </span>
        )
      )}
      <button
        className="px-3 py-1 rounded border bg-white text-zinc-700 hover:bg-zinc-100 disabled:opacity-50"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        &rarr;
      </button>
    </nav>
  );
};

export default Pagination;

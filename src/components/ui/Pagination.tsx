"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={18} />
      </button>
      {start > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className="px-3 py-1.5 rounded-lg text-sm hover:bg-gray-100">1</button>
          {start > 2 && <span className="px-2 text-gray-400">...</span>}
        </>
      )}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-sm font-medium",
            page === currentPage ? "bg-primary-700 text-white" : "hover:bg-gray-100"
          )}
        >
          {page}
        </button>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-2 text-gray-400">...</span>}
          <button onClick={() => onPageChange(totalPages)} className="px-3 py-1.5 rounded-lg text-sm hover:bg-gray-100">{totalPages}</button>
        </>
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

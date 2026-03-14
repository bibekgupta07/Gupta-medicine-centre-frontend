"use client";

import { cn } from "@/lib/utils";

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  loading,
  emptyMessage = "No data found",
  onRowClick,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                    col.className
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    "hover:bg-gray-50 transition-colors",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-6 py-4 text-sm", col.className)}>
                      {col.render
                        ? col.render(item)
                        : (item as Record<string, unknown>)[col.key]?.toString() || "-"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

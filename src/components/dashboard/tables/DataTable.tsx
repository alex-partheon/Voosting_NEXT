'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { MoreHorizontal, ChevronDown } from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  label: string;
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  onRowClick?: (row: T) => void;
  showActions?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  className,
  onRowClick,
  showActions = false
}: DataTableProps<T>) {
  return (
    <div className={cn("w-full overflow-hidden rounded-xl border border-gray-200 bg-white", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {columns.map((column) => (
                <th
                  key={column.key as string}
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  style={{ width: column.width }}
                >
                  {column.label}
                </th>
              ))}
              {showActions && (
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={cn(
                  "transition-colors",
                  onRowClick && "cursor-pointer hover:bg-gray-50"
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => {
                  const keyStr = String(column.key);
                  const value = keyStr.includes('.') 
                    ? keyStr.split('.').reduce((obj, key) => obj?.[key], row)
                    : row[column.key as keyof T];
                  
                  return (
                    <td key={column.key as string} className="px-6 py-4 text-sm text-gray-900">
                      {column.render ? column.render(value, row) : String(value ?? '')}
                    </td>
                  );
                })}
                {showActions && (
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal size={20} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
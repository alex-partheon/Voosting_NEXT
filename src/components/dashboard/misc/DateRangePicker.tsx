'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon } from 'lucide-react';

interface DateRangePickerProps {
  className?: string;
  onDateChange?: (startDate: string, endDate: string) => void;
}

export function DateRangePicker({ className, onDateChange }: DateRangePickerProps) {
  const [dateRange, setDateRange] = useState('Jan 20, 2022 - Feb 09, 2022');

  return (
    <div className={cn("rounded-xl bg-white p-6 shadow-sm border border-gray-100", className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Date picker with range
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Select a date range.
      </p>
      
      <button className="w-full flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
        <CalendarIcon size={16} />
        <span>{dateRange}</span>
      </button>
    </div>
  );
}
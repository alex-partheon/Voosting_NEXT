'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  className?: string;
  onDateSelect?: (date: Date) => void;
}

export function Calendar({ className, onDateSelect }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 5, 1)); // June 2025
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    setSelectedDate(day);
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    onDateSelect?.(date);
  };

  const highlightedDates = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

  return (
    <div className={cn("rounded-xl bg-white p-6 shadow-sm border border-gray-100", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
        
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}
        
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const isHighlighted = highlightedDates.includes(day);
          const isSelected = selectedDate === day;
          
          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              className={cn(
                "aspect-square rounded-lg text-sm font-medium transition-colors",
                isHighlighted && !isSelected && "bg-blue-500 text-white hover:bg-blue-600",
                isSelected && "bg-blue-600 text-white",
                !isHighlighted && !isSelected && "hover:bg-gray-100 text-gray-700"
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
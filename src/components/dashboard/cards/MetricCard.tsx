import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down';
  description?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel = 'from last month',
  trend,
  description,
  className
}: MetricCardProps) {
  const isPositive = trend === 'up' || (change && change > 0);
  
  return (
    <div className={cn(
      "rounded-2xl bg-white p-6 shadow-sm border border-gray-100",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          
          {change !== undefined && (
            <div className="mt-3 flex items-center gap-2">
              <span className={cn(
                "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                isPositive 
                  ? "bg-green-50 text-green-700" 
                  : "bg-red-50 text-red-700"
              )}>
                {isPositive ? (
                  <ArrowUpRight size={12} />
                ) : (
                  <ArrowDownRight size={12} />
                )}
                {isPositive ? '+' : ''}{change}%
              </span>
              <span className="text-xs text-gray-500">{changeLabel}</span>
            </div>
          )}
          
          {description && (
            <p className="mt-3 text-sm text-gray-600">{description}</p>
          )}
        </div>
        
        {trend && (
          <div className={cn(
            "rounded-lg p-2",
            isPositive ? "bg-green-50" : "bg-red-50"
          )}>
            {isPositive ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
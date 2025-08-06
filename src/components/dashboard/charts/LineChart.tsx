'use client';

import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart as RechartsAreaChart
} from 'recharts';
import { cn } from '@/lib/utils';

interface LineChartProps {
  data: any[];
  lines?: {
    dataKey: string;
    color: string;
    name?: string;
  }[];
  height?: number;
  className?: string;
  showGrid?: boolean;
  type?: 'line' | 'area';
}

export function LineChart({
  data,
  lines = [
    { dataKey: 'value1', color: 'hsl(218.5401, 79.1908%, 66.0784%)' },
    { dataKey: 'value2', color: 'hsl(189.635, 81.0651%, 66.8627%)' }
  ],
  height = 300,
  className,
  showGrid = true,
  type = 'area'
}: LineChartProps) {
  const Chart = type === 'area' ? RechartsAreaChart : RechartsLineChart;
  
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <Chart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          )}
          <XAxis 
            dataKey="name" 
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px'
            }}
          />
          {type === 'area' ? (
            lines.map((line, index) => (
              <Area
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.color}
                fill={line.color}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            ))
          ) : (
            lines.map((line, index) => (
              <Line
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.color}
                strokeWidth={2}
                dot={false}
              />
            ))
          )}
        </Chart>
      </ResponsiveContainer>
    </div>
  );
}
'use client';

import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { cn } from '@/lib/utils';

interface PieChartProps {
  data: {
    name: string;
    value: number;
    color?: string;
  }[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  className?: string;
  showLegend?: boolean;
}

const defaultColors = [
  'hsl(139.6552, 52.7273%, 43.1373%)',
  'hsl(218.5401, 79.1908%, 66.0784%)',
  'hsl(189.635, 81.0651%, 66.8627%)',
  'hsl(207.2727, 44%, 49.0196%)',
  'hsl(138.871, 70.4545%, 34.5098%)'
];

export function PieChart({
  data,
  height = 300,
  innerRadius = 60,
  outerRadius = 80,
  className,
  showLegend = false
}: PieChartProps) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || defaultColors[index % defaultColors.length]} 
              />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px'
            }}
          />
          {showLegend && (
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              formatter={(value) => (
                <span className="text-sm text-gray-600">{value}</span>
              )}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
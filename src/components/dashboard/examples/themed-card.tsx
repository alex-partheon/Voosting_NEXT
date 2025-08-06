import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface ThemedCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'glass';
}

/**
 * Example of a themed card component that adapts to domain themes
 */
export function ThemedCard({
  title,
  description,
  children,
  className,
  variant = 'default',
}: ThemedCardProps) {
  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-200',
        {
          default: '',
          gradient: 'bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20',
          glass: 'bg-background/60 backdrop-blur-md border-border/50',
        }[variant],
        className
      )}
    >
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {description && (
          <CardDescription className="text-sm text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/**
 * Metric card with domain-aware styling
 */
export function MetricCard({
  label,
  value,
  change,
  trend = 'up',
}: {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}) {
  const trendColors = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-muted-foreground',
  };

  return (
    <div className="rounded-lg border bg-card p-6 transition-all hover:shadow-md">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
        {change && (
          <span className={cn('text-sm font-medium', trendColors[trend])}>
            {trend === 'up' && '↑'}
            {trend === 'down' && '↓'}
            {change}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Stats card with animated background
 */
export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-lg border bg-card p-6">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-0 transition-opacity group-hover:opacity-100" />
      
      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </div>
        <p className="mt-2 text-2xl font-bold">{value}</p>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
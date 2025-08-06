import { cn } from '@/lib/utils';
import React from 'react';

// PageHeader 컴포넌트 - shadcn/ui 스타일 기준
interface PageHeaderProps {
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  children?: React.ReactNode; // For action buttons
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export function PageHeader({
  title,
  description,
  children,
  className,
  align = 'center'
}: PageHeaderProps) {
  const alignments = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={cn(
      'space-y-4',
      alignments[align],
      className
    )}>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
        {title}
      </h1>
      
      {description && (
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          {description}
        </p>
      )}
      
      {children && (
        <div className="flex flex-wrap gap-4 justify-center pt-4">
          {children}
        </div>
      )}
    </div>
  );
}

export type { PageHeaderProps };
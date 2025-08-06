import { cn } from '@/lib/utils';
import React from 'react';

// Section 컴포넌트 - shadcn/ui 스타일 기준
interface SectionProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  as?: 'section' | 'div' | 'article';
}

export function Section({ 
  children, 
  size = 'md', 
  className,
  as: Component = 'section' 
}: SectionProps) {
  const sizes = {
    sm: 'py-8 md:py-12',    // Small spacing
    md: 'py-12 md:py-20',   // Medium spacing (default)
    lg: 'py-16 md:py-24',   // Large spacing
    xl: 'py-20 md:py-32',   // Extra large spacing
  };

  return (
    <Component 
      className={cn(
        'relative',
        sizes[size],
        className
      )}
    >
      {children}
    </Component>
  );
}

export type { SectionProps };
import { cn } from '@/lib/utils';
import React from 'react';

// Container 컴포넌트 - shadcn/ui 스타일 기준
interface ContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export function Container({ 
  children, 
  size = 'lg', 
  className 
}: ContainerProps) {
  const sizes = {
    sm: 'max-w-3xl',    // 768px
    md: 'max-w-5xl',    // 1024px
    lg: 'max-w-6xl',    // 1152px (default)
    xl: 'max-w-7xl',    // 1280px
    full: 'max-w-full', // 100%
  };

  return (
    <div 
      className={cn(
        'mx-auto px-4 sm:px-6 lg:px-8',
        sizes[size],
        className
      )}
    >
      {children}
    </div>
  );
}

export type { ContainerProps };
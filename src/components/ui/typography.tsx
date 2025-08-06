'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Heading 컴포넌트 - 일관된 헤딩 스타일
interface HeadingProps {
  children: ReactNode;
  level?: 'h1' | 'h2' | 'h3' | 'h4';
  variant?: 'gradient' | 'solid';
  gradient?: 'business' | 'creator' | 'neutral';
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function Heading({ 
  children, 
  level = 'h2',
  variant = 'gradient',
  gradient = 'neutral',
  className,
  as
}: HeadingProps) {
  const Component = as || level;
  
  const sizes = {
    h1: 'text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold',
    h2: 'text-3xl sm:text-4xl lg:text-5xl font-bold',
    h3: 'text-2xl sm:text-3xl lg:text-4xl font-bold',
    h4: 'text-xl sm:text-2xl lg:text-3xl font-semibold',
  };

  const gradients = {
    business: 'from-[oklch(30%_0.2_250deg)] to-[oklch(40%_0.25_200deg)] dark:from-[oklch(90%_0.2_250deg)] dark:to-[oklch(85%_0.25_200deg)]',
    creator: 'from-[oklch(35%_0.25_160deg)] to-[oklch(45%_0.3_120deg)] dark:from-[oklch(85%_0.25_160deg)] dark:to-[oklch(75%_0.3_120deg)]',
    neutral: 'from-[oklch(35%_0.2_250deg)] to-[oklch(45%_0.25_200deg)] dark:from-[oklch(85%_0.2_250deg)] dark:to-[oklch(80%_0.25_200deg)]',
  };

  const variantClasses = variant === 'gradient' 
    ? cn('text-transparent bg-clip-text bg-gradient-to-r', gradients[gradient])
    : 'text-[oklch(25%_0.05_250deg)] dark:text-[oklch(90%_0.05_250deg)]';

  return (
    <Component className={cn(
      sizes[level],
      variantClasses,
      className
    )}>
      {children}
    </Component>
  );
}

// Text 컴포넌트 - 일관된 텍스트 스타일
interface TextProps {
  children: ReactNode;
  variant?: 'body' | 'lead' | 'caption';
  color?: 'primary' | 'secondary' | 'muted';
  className?: string;
  as?: 'p' | 'span' | 'div';
}

export function Text({ 
  children, 
  variant = 'body',
  color = 'secondary',
  className,
  as = 'p'
}: TextProps) {
  const Component = as;
  
  const sizes = {
    body: 'text-base lg:text-lg',
    lead: 'text-lg sm:text-xl lg:text-2xl',
    caption: 'text-sm lg:text-base',
  };

  const colors = {
    primary: 'text-[oklch(25%_0.05_250deg)] dark:text-[oklch(90%_0.05_250deg)]',
    secondary: 'text-[oklch(40%_0.05_250deg)] dark:text-[oklch(70%_0.05_250deg)]',
    muted: 'text-[oklch(45%_0.03_250deg)] dark:text-[oklch(65%_0.03_250deg)]',
  };

  return (
    <Component className={cn(
      sizes[variant],
      colors[color],
      className
    )}>
      {children}
    </Component>
  );
}

// Badge 컴포넌트 - 일관된 배지 스타일
interface BadgeProps {
  children: ReactNode;
  icon?: ReactNode;
  variant?: 'default' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Badge({ 
  children, 
  icon,
  variant = 'default',
  size = 'md',
  className 
}: BadgeProps) {
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variants = {
    default: 'bg-[oklch(85%_0.1_220deg_/_0.1)] dark:bg-[oklch(25%_0.1_220deg_/_0.2)] backdrop-blur-xl border border-[oklch(80%_0.05_200deg_/_0.2)] dark:border-[oklch(40%_0.05_200deg_/_0.3)]',
    gradient: 'bg-gradient-to-r from-[oklch(85%_0.1_220deg_/_0.1)] to-[oklch(80%_0.15_180deg_/_0.1)] dark:from-[oklch(25%_0.1_220deg_/_0.2)] dark:to-[oklch(30%_0.15_180deg_/_0.2)] backdrop-blur-xl border border-[oklch(80%_0.05_200deg_/_0.2)] dark:border-[oklch(40%_0.05_200deg_/_0.3)]',
  };

  return (
    <span className={cn(
      'inline-flex items-center gap-2 rounded-full font-medium',
      sizes[size],
      variants[variant],
      'text-[oklch(30%_0.1_200deg)] dark:text-[oklch(85%_0.1_200deg)]',
      className
    )}>
      {icon}
      {children}
    </span>
  );
}

// GradientText 컴포넌트 - 그라데이션 텍스트 유틸리티
interface GradientTextProps {
  children: ReactNode;
  gradient?: string;
  className?: string;
  as?: 'span' | 'div';
}

export function GradientText({ 
  children, 
  gradient = 'from-[oklch(35%_0.2_250deg)] to-[oklch(45%_0.25_200deg)] dark:from-[oklch(85%_0.2_250deg)] dark:to-[oklch(80%_0.25_200deg)]',
  className,
  as = 'span'
}: GradientTextProps) {
  const Component = as;
  
  return (
    <Component className={cn(
      'text-transparent bg-clip-text bg-gradient-to-r',
      gradient,
      className
    )}>
      {children}
    </Component>
  );
}
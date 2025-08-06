'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

// Container 컴포넌트 - 일관된 너비와 패딩
interface ContainerProps {
  children: ReactNode;
  variant?: 'narrow' | 'standard' | 'wide';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Container({ 
  children, 
  variant = 'standard',
  size,
  className 
}: ContainerProps) {
  // size prop이 있으면 그것을 사용, 없으면 variant 사용
  const actualVariant = size ? 
    (size === 'sm' ? 'narrow' : size === 'md' ? 'standard' : 'wide') 
    : variant;

  const widths = {
    narrow: 'max-w-3xl',
    standard: 'max-w-5xl',
    wide: 'max-w-6xl',
  };

  return (
    <div className={cn(
      'mx-auto px-4 sm:px-6 lg:px-8',
      widths[actualVariant],
      className
    )}>
      {children}
    </div>
  );
}

// Section 컴포넌트 - 일관된 섹션 간격
interface SectionProps {
  children: ReactNode;
  variant?: 'compact' | 'base' | 'spacious';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Section({ 
  children, 
  variant = 'base',
  size,
  className 
}: SectionProps) {
  // size prop이 있으면 그것을 사용, 없으면 variant 사용
  const actualVariant = size ? 
    (size === 'sm' ? 'compact' : size === 'md' ? 'base' : 'spacious') 
    : variant;

  const spacings = {
    compact: 'py-16 md:py-20',
    base: 'py-20 md:py-24 lg:py-32',
    spacious: 'py-24 md:py-32 lg:py-40',
  };

  return (
    <section className={cn(
      'relative',
      spacings[actualVariant],
      className
    )}>
      {children}
    </section>
  );
}

// PageHeader 컴포넌트 - 페이지 헤더
interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={cn('text-center space-y-4', className)}>
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
        {title}
      </h1>
      {description && (
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}

// FeatureCard 컴포넌트 - 기능 카드
interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({ icon: Icon, title, description, className }: FeatureCardProps) {
  return (
    <div className={cn(
      'p-6 rounded-lg border bg-card text-card-foreground shadow-sm',
      className
    )}>
      <div className="flex items-center space-x-3 mb-4">
        <Icon className="h-6 w-6 text-primary" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

// GlassCard 컴포넌트 - 글래스 효과 카드
interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div className={cn(
      'backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg p-6',
      'shadow-lg hover:shadow-xl transition-shadow duration-300',
      className
    )}>
      {children}
    </div>
  );
}

// StatCard 컴포넌트 - 통계 카드
interface StatCardProps {
  value: string | number;
  label: string;
  description?: string;
  className?: string;
}

export function StatCard({ value, label, description, className }: StatCardProps) {
  return (
    <div className={cn(
      'text-center p-6 rounded-lg border bg-card text-card-foreground shadow-sm',
      className
    )}>
      <div className="text-3xl font-bold text-primary mb-2">{value}</div>
      <div className="text-lg font-semibold mb-1">{label}</div>
      {description && (
        <div className="text-sm text-muted-foreground">{description}</div>
      )}
    </div>
  );
}

// ProcessCard 컴포넌트 - 프로세스 단계 카드
interface ProcessCardProps {
  step: number;
  title: string;
  description: string;
  icon?: LucideIcon;
  className?: string;
}

export function ProcessCard({ step, title, description, icon: Icon, className }: ProcessCardProps) {
  return (
    <motion.div
      className={cn(
        'relative p-6 rounded-lg border bg-card text-card-foreground shadow-sm',
        'hover:shadow-md transition-shadow duration-300',
        className
      )}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
            {step}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {Icon && <Icon className="h-5 w-5 text-primary" />}
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

// 타입 export
export type {
  ContainerProps,
  SectionProps,
  PageHeaderProps,
  FeatureCardProps,
  GlassCardProps,
  StatCardProps,
  ProcessCardProps
};
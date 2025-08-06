// 통합 레이아웃 컴포넌트 시스템
// 모든 레이아웃 관련 컴포넌트를 중앙에서 관리

// 기본 레이아웃 컴포넌트들 (ui/layout-components.tsx에서 import)
export {
  Container,
  Section,
  PageHeader,
  FeatureCard,
  GlassCard,
  StatCard,
  ProcessCard
} from '@/components/ui/layout-components';

// 추가 레이아웃 유틸리티들
export * from './container';
export * from './section';

// 레거시 호환성을 위한 타입 re-export
export type {
  ContainerProps,
  SectionProps,
  PageHeaderProps,
  FeatureCardProps,
  GlassCardProps,
  StatCardProps,
  ProcessCardProps
} from '@/components/ui/layout-components';
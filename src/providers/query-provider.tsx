'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';
import { onAuthStateChange } from '@/lib/supabase/client';

/**
 * React Query 클라이언트 설정
 * 보안 고려사항:
 * - 관리자 데이터는 캐싱하지 않음
 * - 민감한 데이터는 짧은 캐시 시간 설정
 * - 인증 변경 시 쿼리 무효화
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 일반 사용자 기본 설정
        staleTime: 5 * 60 * 1000, // 5분
        gcTime: 10 * 60 * 1000, // 10분 (이전 cacheTime)
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
        refetchOnMount: true,
      },
      mutations: {
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // 서버 사이드: 항상 새 클라이언트 생성
    return makeQueryClient();
  } else {
    // 브라우저: 싱글톤 패턴 사용
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
      
      // 인증 상태 변경 시 관련 쿼리 무효화
      onAuthStateChange((event) => {
        if (event === 'SIGNED_OUT') {
          // 로그아웃 시 모든 쿼리 초기화
          browserQueryClient?.clear();
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // 로그인 또는 토큰 갱신 시 프로필 관련 쿼리 무효화
          browserQueryClient?.invalidateQueries({ queryKey: ['profile'] });
          browserQueryClient?.invalidateQueries({ queryKey: ['dashboard'] });
        } else if (event === 'USER_UPDATED') {
          // 사용자 정보 업데이트 시 프로필 쿼리 무효화
          browserQueryClient?.invalidateQueries({ queryKey: ['profile'] });
        }
      });
    }
    return browserQueryClient;
  }
}

interface QueryProviderProps {
  children: ReactNode;
  /**
   * 개발 환경에서 DevTools 표시 여부
   * @default process.env.NODE_ENV === 'development'
   */
  showDevTools?: boolean;
}

/**
 * React Query Provider 컴포넌트
 * 
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { QueryProvider } from '@/providers/query-provider';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <QueryProvider>
 *           {children}
 *         </QueryProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function QueryProvider({ 
  children, 
  showDevTools = process.env.NODE_ENV === 'development' 
}: QueryProviderProps) {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {showDevTools && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

/**
 * 쿼리 키 팩토리
 * 일관된 쿼리 키 생성을 위한 유틸리티
 */
export const queryKeys = {
  all: ['voosting'] as const,
  
  // 프로필 관련
  profile: () => [...queryKeys.all, 'profile'] as const,
  profileDetail: (userId: string) => [...queryKeys.profile(), userId] as const,
  
  // 대시보드 관련
  dashboard: () => [...queryKeys.all, 'dashboard'] as const,
  dashboardByRole: (role: string) => [...queryKeys.dashboard(), role] as const,
  
  // 캠페인 관련
  campaigns: () => [...queryKeys.all, 'campaigns'] as const,
  campaign: (id: string) => [...queryKeys.campaigns(), id] as const,
  campaignApplications: (campaignId: string) => [...queryKeys.campaign(campaignId), 'applications'] as const,
  
  // 수익 관련
  earnings: () => [...queryKeys.all, 'earnings'] as const,
  earningsByUser: (userId: string) => [...queryKeys.earnings(), userId] as const,
  
  // 추천 관련
  referrals: () => [...queryKeys.all, 'referrals'] as const,
  referralStats: (userId: string) => [...queryKeys.referrals(), 'stats', userId] as const,
  
  // 관리자 관련 (캐싱 없음)
  admin: () => [...queryKeys.all, 'admin'] as const,
  adminUsers: () => [...queryKeys.admin(), 'users'] as const,
  adminAnalytics: () => [...queryKeys.admin(), 'analytics'] as const,
  adminSystem: () => [...queryKeys.admin(), 'system'] as const,
} as const;

/**
 * 쿼리 무효화 헬퍼
 * 특정 도메인의 모든 쿼리를 무효화
 */
export function invalidateQueries(client: QueryClient, domain: keyof typeof queryKeys) {
  return client.invalidateQueries({ queryKey: queryKeys[domain]() });
}

/**
 * 관리자 전용 쿼리 옵션
 * 보안을 위해 캐싱 비활성화
 */
export const adminQueryOptions = {
  staleTime: 0,
  gcTime: 0,
  refetchOnMount: 'always' as const,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
} as const;

/**
 * 민감한 데이터 쿼리 옵션
 * 짧은 캐시 시간 설정
 */
export const sensitiveQueryOptions = {
  staleTime: 30 * 1000, // 30초
  gcTime: 60 * 1000, // 1분
  refetchOnMount: true,
  refetchOnWindowFocus: true,
} as const;

/**
 * 공개 데이터 쿼리 옵션
 * 긴 캐시 시간 설정
 */
export const publicQueryOptions = {
  staleTime: 30 * 60 * 1000, // 30분
  gcTime: 60 * 60 * 1000, // 1시간
  refetchOnMount: false,
  refetchOnWindowFocus: false,
} as const;
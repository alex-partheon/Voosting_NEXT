'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { createBrowserClient, handleClientError, onAuthStateChange } from '@/lib/supabase/client';
import { queryKeys, sensitiveQueryOptions } from '@/providers/query-provider';
import { useAuthStore } from '@/stores/authStore';
import type { Database } from '@/types/database.types';

// 타입 정의
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type UserRole = Database['public']['Enums']['user_role'];

// 프로필 통계 타입
export interface ProfileStats {
  totalCampaigns: number;
  totalEarnings: number;
  totalReferrals: number;
  completedProjects: number;
  activeProjects?: number;
  successRate?: number;
}

// 프로필과 통계를 합친 타입
export interface ProfileWithStats extends Profile {
  stats?: ProfileStats;
}

// Hook 반환 타입
export interface UseProfileReturn {
  data: Profile | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  update: (updates: ProfileUpdate) => Promise<void>;
  isUpdating: boolean;
}

/**
 * 프로필 데이터 가져오기
 * Supabase RLS 정책과 인증 만료 처리 포함
 */
async function fetchProfile(): Promise<Profile> {
  const supabase = createBrowserClient();
  
  try {
    // 현재 인증된 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      // JWT 토큰 만료 처리
      if (authError.message?.includes('JWT') || authError.message?.includes('token')) {
        throw new Error('AUTH_EXPIRED');
      }
      throw handleClientError(authError);
    }
    
    if (!user) {
      throw new Error('NOT_AUTHENTICATED');
    }
    
    // 프로필 조회 (RLS 정책 적용)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) {
      // RLS 정책 오류 처리
      if (error.code === 'PGRST301') {
        throw new Error('PERMISSION_DENIED');
      }
      // 프로필이 없는 경우 (신규 사용자)
      if (error.code === 'PGRST116') {
        throw new Error('PROFILE_NOT_FOUND');
      }
      throw handleClientError(error);
    }
    
    if (!data) {
      throw new Error('PROFILE_NOT_FOUND');
    }
    
    return data;
  } catch (error) {
    // 네트워크 오류 처리
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('NETWORK_ERROR');
    }
    throw error;
  }
}

/**
 * 프로필 업데이트
 */
async function updateProfile(updates: ProfileUpdate): Promise<Profile> {
  const supabase = createBrowserClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new Error('NOT_AUTHENTICATED');
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single();
  
  if (error) {
    throw handleClientError(error);
  }
  
  if (!data) {
    throw new Error('UPDATE_FAILED');
  }
  
  return data;
}

/**
 * 프로필 Hook - 현재 사용자의 프로필 조회 및 관리
 * 
 * @example
 * ```tsx
 * function ProfileComponent() {
 *   const { data: profile, isLoading, error, update } = useProfile();
 *   
 *   if (isLoading) return <Skeleton />;
 *   if (error) {
 *     if (error.message === 'AUTH_EXPIRED') {
 *       return <SignInPrompt />;
 *     }
 *     return <ErrorMessage error={error} />;
 *   }
 *   
 *   return (
 *     <div>
 *       <h1>{profile?.full_name || profile?.email}</h1>
 *       <p>Role: {profile?.role}</p>
 *       <button onClick={() => update({ full_name: 'New Name' })}>
 *         Update Name
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useProfile(): UseProfileReturn {
  const queryClient = useQueryClient();
  const { setUser, clearAuth, updateProfile: updateAuthProfile } = useAuthStore();
  
  // 프로필 조회 쿼리
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.profile(),
    queryFn: fetchProfile,
    ...sensitiveQueryOptions,
    retry: (failureCount, error) => {
      // 인증 관련 오류는 재시도하지 않음
      if (error instanceof Error) {
        const message = error.message;
        if (
          message === 'NOT_AUTHENTICATED' ||
          message === 'AUTH_EXPIRED' ||
          message === 'PERMISSION_DENIED'
        ) {
          return false;
        }
      }
      // 다른 오류는 최대 3번 재시도
      return failureCount < 3;
    },
  });
  
  // 프로필 업데이트 mutation
  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedProfile) => {
      // 쿼리 캐시 업데이트
      queryClient.setQueryData(queryKeys.profile(), updatedProfile);
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
      // Auth store 업데이트
      updateAuthProfile(updatedProfile);
    },
    onError: (error) => {
      console.error('Profile update failed:', error);
    },
  });
  
  // 프로필 데이터를 Auth Store와 동기화
  useEffect(() => {
    if (data) {
      setUser({
        id: data.id,
        email: data.email,
        role: data.role as Exclude<UserRole, 'admin'>,
        profile: data,
      });
    }
  }, [data, setUser]);
  
  // 에러 처리 - 인증 만료 시 Auth Store 초기화
  useEffect(() => {
    if (error instanceof Error) {
      const message = error.message;
      if (message === 'AUTH_EXPIRED' || message === 'NOT_AUTHENTICATED') {
        clearAuth();
      }
    }
  }, [error, clearAuth]);
  
  // 인증 상태 변경 감지 및 자동 리프레시
  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        refetch();
      } else if (event === 'SIGNED_OUT') {
        queryClient.removeQueries({ queryKey: queryKeys.profile() });
        clearAuth();
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [refetch, queryClient, clearAuth]);
  
  // update 함수 래핑
  const update = useCallback(
    async (updates: ProfileUpdate) => {
      await updateMutation.mutateAsync(updates);
    },
    [updateMutation]
  );
  
  return {
    data,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
    update,
    isUpdating: updateMutation.isPending,
  };
}

/**
 * 프로필과 통계 정보를 함께 가져오는 Hook
 * 
 * @example
 * ```tsx
 * function DashboardStats() {
 *   const { data: profile, stats, isLoading } = useProfileWithStats();
 *   
 *   if (isLoading) return <StatsSkeletons />;
 *   
 *   return (
 *     <div className="stats-grid">
 *       <StatCard title="Total Campaigns" value={stats?.totalCampaigns || 0} />
 *       <StatCard title="Total Earnings" value={stats?.totalEarnings || 0} />
 *       <StatCard title="Success Rate" value={`${stats?.successRate || 0}%`} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useProfileWithStats() {
  const supabase = createBrowserClient();
  
  const query = useQuery({
    queryKey: [...queryKeys.profile(), 'stats'],
    queryFn: async (): Promise<ProfileWithStats> => {
      const profile = await fetchProfile();
      
      // 역할별 통계 조회
      if (profile.role === 'creator') {
        const [campaignsResult, earningsResult, referralsResult] = await Promise.all([
          supabase
            .from('campaign_applications')
            .select('*', { count: 'exact' })
            .eq('creator_id', profile.id)
            .eq('status', 'approved'),
          
          supabase
            .from('referral_earnings')
            .select('amount')
            .eq('referrer_id', profile.id)
            .eq('status', 'paid'),
          
          supabase
            .from('profiles')
            .select('*', { count: 'exact' })
            .eq('referrer_l1_id', profile.id),
        ]);
        
        const totalEarnings = earningsResult.data?.reduce((sum, e) => sum + e.amount, 0) || 0;
        const totalCampaigns = campaignsResult.count || 0;
        
        return {
          ...profile,
          stats: {
            totalCampaigns,
            totalEarnings,
            totalReferrals: referralsResult.count || 0,
            completedProjects: totalCampaigns,
            activeProjects: 0, // TODO: 진행 중인 프로젝트 계산
            successRate: totalCampaigns > 0 ? 100 : 0, // TODO: 실제 성공률 계산
          },
        };
      } else if (profile.role === 'business') {
        const [campaignsResult, paymentsResult] = await Promise.all([
          supabase
            .from('campaigns')
            .select('*', { count: 'exact' })
            .eq('business_id', profile.id),
          
          supabase
            .from('payments')
            .select('amount')
            .eq('business_id', profile.id)
            .eq('status', 'completed'),
        ]);
        
        const totalSpent = paymentsResult.data?.reduce((sum, p) => sum + p.amount, 0) || 0;
        
        return {
          ...profile,
          stats: {
            totalCampaigns: campaignsResult.count || 0,
            totalEarnings: totalSpent,
            totalReferrals: 0,
            completedProjects: campaignsResult.count || 0,
            activeProjects: 0,
            successRate: 0,
          },
        };
      }
      
      // 기본값
      return {
        ...profile,
        stats: {
          totalCampaigns: 0,
          totalEarnings: 0,
          totalReferrals: 0,
          completedProjects: 0,
          activeProjects: 0,
          successRate: 0,
        },
      };
    },
    ...sensitiveQueryOptions,
  });
  
  return {
    data: query.data,
    stats: query.data?.stats,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * 실시간 프로필 업데이트 구독 Hook
 * 
 * @example
 * ```tsx
 * function RealtimeProfile() {
 *   const { data: profile } = useProfile();
 *   
 *   useProfileSubscription((payload) => {
 *     console.log('Profile updated:', payload);
 *   });
 *   
 *   return <ProfileDisplay profile={profile} />;
 * }
 * ```
 */
export function useProfileSubscription(
  callback?: (payload: any) => void
) {
  const queryClient = useQueryClient();
  const supabase = createBrowserClient();
  
  useEffect(() => {
    let subscription: any;
    
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      subscription = supabase
        .channel(`profile:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            // 쿼리 캐시 업데이트
            if (payload.eventType === 'UPDATE') {
              queryClient.setQueryData(queryKeys.profile(), payload.new);
            }
            
            // 콜백 실행
            if (callback) {
              callback(payload);
            }
          }
        )
        .subscribe();
    };
    
    setupSubscription();
    
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [queryClient, callback, supabase]);
}

/**
 * 프로필 존재 여부 확인 Hook
 * 
 * @param userId - 확인할 사용자 ID
 */
export function useProfileExists(userId?: string) {
  const supabase = createBrowserClient();
  
  return useQuery({
    queryKey: userId ? [...queryKeys.profileDetail(userId), 'exists'] : [...queryKeys.profile(), 'exists'],
    queryFn: async () => {
      let targetUserId = userId;
      
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;
        targetUserId = user.id;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', targetUserId)
        .single();
      
      if (error && error.code === 'PGRST116') {
        return false;
      }
      
      if (error) {
        throw handleClientError(error);
      }
      
      return !!data;
    },
    enabled: !userId || !!userId,
  });
}
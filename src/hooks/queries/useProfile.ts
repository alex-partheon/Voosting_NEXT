'use client';

import { useQuery } from '@tanstack/react-query';
import { createBrowserClient, handleClientError } from '@/lib/supabase/client';
import { queryKeys, sensitiveQueryOptions } from '@/providers/query-provider';
import type { Tables } from '@/types/database.types';

export type Profile = Tables<'profiles'>;

/**
 * 프로필 데이터 가져오기
 */
async function fetchProfile(userId?: string): Promise<Profile> {
  const supabase = createBrowserClient();

  if (userId) {
    // 특정 사용자 프로필 조회
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw handleClientError(error);
    }

    if (!data) {
      throw new Error('Profile not found');
    }

    return data;
  }

  // 현재 로그인한 사용자 프로필 조회
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError) {
    throw handleClientError(authError);
  }

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    throw handleClientError(error);
  }

  if (!data) {
    throw new Error('Profile not found');
  }

  return data;
}

/**
 * 현재 사용자 프로필 가져오기 훅
 * 
 * @example
 * ```tsx
 * function ProfileComponent() {
 *   const { data: profile, isLoading, error } = useProfile();
 *   
 *   if (isLoading) return <Skeleton />;
 *   if (error) return <ErrorMessage error={error} />;
 *   
 *   return (
 *     <div>
 *       <h1>{profile.full_name || profile.email}</h1>
 *       <p>Role: {profile.role}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile(),
    queryFn: () => fetchProfile(),
    ...sensitiveQueryOptions, // 민감한 데이터이므로 짧은 캐시 시간
  });
}

/**
 * 특정 사용자 프로필 가져오기 훅
 * 
 * @param userId - 조회할 사용자 ID
 * @example
 * ```tsx
 * function UserProfile({ userId }: { userId: string }) {
 *   const { data: profile, isLoading, error } = useUserProfile(userId);
 *   
 *   if (isLoading) return <Skeleton />;
 *   if (error) return <ErrorMessage error={error} />;
 *   
 *   return <ProfileCard profile={profile} />;
 * }
 * ```
 */
export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: queryKeys.profileDetail(userId),
    queryFn: () => fetchProfile(userId),
    enabled: !!userId,
  });
}

/**
 * 프로필 통계 정보 포함 조회
 */
export interface ProfileWithStats extends Profile {
  stats?: {
    totalCampaigns?: number;
    totalEarnings?: number;
    totalReferrals?: number;
    completedProjects?: number;
  };
}

async function fetchProfileWithStats(userId?: string): Promise<ProfileWithStats> {
  const supabase = createBrowserClient();
  
  // 프로필 가져오기
  const profile = await fetchProfile(userId);
  const targetUserId = userId || profile.id;

  // 역할에 따라 다른 통계 가져오기
  if (profile.role === 'creator') {
    // 크리에이터 통계
    const [campaignsResult, earningsResult, referralsResult] = await Promise.all([
      // 참여한 캠페인 수
      supabase
        .from('campaign_applications')
        .select('*', { count: 'exact' })
        .eq('creator_id', targetUserId)
        .eq('status', 'approved'),
      
      // 총 수익
      supabase
        .from('referral_earnings')
        .select('amount')
        .eq('referrer_id', targetUserId)
        .eq('status', 'paid'),
      
      // 추천한 사용자 수
      supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('referrer_l1_id', targetUserId),
    ]);

    const totalEarnings = earningsResult.data?.reduce((sum, e) => sum + e.amount, 0) || 0;

    return {
      ...profile,
      stats: {
        totalCampaigns: campaignsResult.count || 0,
        totalEarnings,
        totalReferrals: referralsResult.count || 0,
        completedProjects: campaignsResult.count || 0,
      },
    };
  } else if (profile.role === 'business') {
    // 비즈니스 통계
    const [campaignsResult, paymentsResult, creatorsResult] = await Promise.all([
      // 생성한 캠페인 수
      supabase
        .from('campaigns')
        .select('*', { count: 'exact' })
        .eq('business_id', targetUserId),
      
      // 총 지출
      supabase
        .from('payments')
        .select('amount')
        .eq('business_id', targetUserId)
        .eq('status', 'completed'),
      
      // 협업한 크리에이터 수 (중복 제거)
      supabase
        .from('campaign_applications')
        .select('creator_id, campaigns!inner(business_id)')
        .eq('campaigns.business_id', targetUserId)
        .eq('status', 'approved'),
    ]);

    const totalSpent = paymentsResult.data?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const uniqueCreators = new Set(creatorsResult.data?.map(a => a.creator_id) || []).size;

    return {
      ...profile,
      stats: {
        totalCampaigns: campaignsResult.count || 0,
        totalEarnings: totalSpent, // 비즈니스의 경우 지출
        totalReferrals: uniqueCreators, // 협업한 크리에이터 수
        completedProjects: campaignsResult.count || 0,
      },
    };
  }

  // 관리자나 기타 역할
  return profile;
}

/**
 * 프로필과 통계 정보 함께 가져오기 훅
 * 
 * @example
 * ```tsx
 * function ProfileWithStats() {
 *   const { data: profile, isLoading } = useProfileWithStats();
 *   
 *   if (isLoading) return <Skeleton />;
 *   
 *   return (
 *     <div>
 *       <h1>{profile.full_name}</h1>
 *       <div className="stats">
 *         <p>Total Campaigns: {profile.stats?.totalCampaigns}</p>
 *         <p>Total Earnings: {profile.stats?.totalEarnings}</p>
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 */
export function useProfileWithStats(userId?: string) {
  return useQuery({
    queryKey: userId 
      ? [...queryKeys.profileDetail(userId), 'stats']
      : [...queryKeys.profile(), 'stats'],
    queryFn: () => fetchProfileWithStats(userId),
    enabled: !userId || !!userId,
    ...sensitiveQueryOptions,
  });
}

/**
 * 프로필 존재 여부 확인 훅
 * 
 * @param userId - 확인할 사용자 ID
 */
export function useProfileExists(userId: string) {
  return useQuery({
    queryKey: [...queryKeys.profileDetail(userId), 'exists'],
    queryFn: async () => {
      const supabase = createBrowserClient();
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Not found
        return false;
      }

      if (error) {
        throw handleClientError(error);
      }

      return !!data;
    },
    enabled: !!userId,
  });
}
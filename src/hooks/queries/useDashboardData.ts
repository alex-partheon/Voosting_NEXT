'use client';

import { useQuery } from '@tanstack/react-query';
import { createBrowserClient, handleClientError } from '@/lib/supabase/client';
import { queryKeys, adminQueryOptions } from '@/providers/query-provider';
import type { Tables } from '@/types/database.types';

interface CreatorDashboardData {
  profile: Tables<'profiles'>;
  activeCampaigns: Tables<'campaigns'>[];
  applications: Tables<'campaign_applications'>[];
  earnings: {
    total: number;
    pending: number;
    paid: number;
  };
  referralStats: Tables<'user_referral_stats'>;
  recentPayments: Tables<'payments'>[];
}

interface BusinessDashboardData {
  profile: Tables<'profiles'>;
  campaigns: Tables<'campaigns'>[];
  totalSpent: number;
  activeCreators: number;
  applications: {
    pending: number;
    approved: number;
    total: number;
  };
  recentPayments: Tables<'payments'>[];
}

interface AdminDashboardData {
  totalUsers: number;
  totalCreators: number;
  totalBusinesses: number;
  totalCampaigns: number;
  totalRevenue: number;
  recentUsers: Tables<'profiles'>[];
  recentCampaigns: Tables<'campaigns'>[];
  systemStats: {
    activeUsers24h: number;
    newUsersToday: number;
    pendingApplications: number;
    activeCampaigns: number;
  };
}

export type DashboardData = CreatorDashboardData | BusinessDashboardData | AdminDashboardData;

/**
 * 크리에이터 대시보드 데이터 가져오기
 */
async function fetchCreatorDashboard(userId: string): Promise<CreatorDashboardData> {
  const supabase = createBrowserClient();

  // 병렬로 데이터 가져오기
  const [
    profileResult,
    campaignsResult,
    applicationsResult,
    earningsResult,
    referralStatsResult,
    paymentsResult,
  ] = await Promise.all([
    // 프로필
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single(),
    
    // 활성 캠페인
    supabase
      .from('campaigns')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(10),
    
    // 내 지원 현황
    supabase
      .from('campaign_applications')
      .select('*')
      .eq('creator_id', userId)
      .order('applied_at', { ascending: false })
      .limit(10),
    
    // 수익 집계
    supabase
      .from('referral_earnings')
      .select('amount, status')
      .eq('referrer_id', userId),
    
    // 추천 통계
    supabase
      .from('user_referral_stats')
      .select('*')
      .eq('id', userId)
      .single(),
    
    // 최근 결제
    supabase
      .from('payments')
      .select('*')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  if (profileResult.error) throw profileResult.error;
  if (campaignsResult.error) throw campaignsResult.error;
  if (applicationsResult.error) throw applicationsResult.error;
  if (earningsResult.error) throw earningsResult.error;
  if (paymentsResult.error) throw paymentsResult.error;

  // 수익 집계 계산
  const earnings = earningsResult.data?.reduce(
    (acc, earning) => {
      acc.total += earning.amount;
      if (earning.status === 'pending') {
        acc.pending += earning.amount;
      } else if (earning.status === 'paid') {
        acc.paid += earning.amount;
      }
      return acc;
    },
    { total: 0, pending: 0, paid: 0 }
  ) || { total: 0, pending: 0, paid: 0 };

  return {
    profile: profileResult.data,
    activeCampaigns: campaignsResult.data || [],
    applications: applicationsResult.data || [],
    earnings,
    referralStats: referralStatsResult.data || {
      id: userId,
      full_name: null,
      referral_code: null,
      total_referrals: 0,
      level1_referrals: 0,
      level2_referrals: 0,
      level3_referrals: 0,
      total_earnings: 0,
      pending_earnings: 0,
      paid_earnings: 0,
    },
    recentPayments: paymentsResult.data || [],
  };
}

/**
 * 비즈니스 대시보드 데이터 가져오기
 */
async function fetchBusinessDashboard(userId: string): Promise<BusinessDashboardData> {
  const supabase = createBrowserClient();

  const [
    profileResult,
    campaignsResult,
    paymentsResult,
    applicationsResult,
  ] = await Promise.all([
    // 프로필
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single(),
    
    // 내 캠페인
    supabase
      .from('campaigns')
      .select('*')
      .eq('business_id', userId)
      .order('created_at', { ascending: false }),
    
    // 결제 내역
    supabase
      .from('payments')
      .select('*')
      .eq('business_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),
    
    // 캠페인 지원 현황
    supabase
      .from('campaign_applications')
      .select('*, campaigns!inner(business_id)')
      .eq('campaigns.business_id', userId),
  ]);

  if (profileResult.error) throw profileResult.error;
  if (campaignsResult.error) throw campaignsResult.error;
  if (paymentsResult.error) throw paymentsResult.error;
  if (applicationsResult.error) throw applicationsResult.error;

  // 통계 계산
  const totalSpent = paymentsResult.data?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const activeCreators = new Set(paymentsResult.data?.map(p => p.creator_id) || []).size;
  
  const applications = (applicationsResult.data || []).reduce(
    (acc, app) => {
      acc.total++;
      if (app.status === 'pending') acc.pending++;
      if (app.status === 'approved') acc.approved++;
      return acc;
    },
    { pending: 0, approved: 0, total: 0 }
  );

  return {
    profile: profileResult.data,
    campaigns: campaignsResult.data || [],
    totalSpent,
    activeCreators,
    applications,
    recentPayments: paymentsResult.data?.slice(0, 5) || [],
  };
}

/**
 * 관리자 대시보드 데이터 가져오기
 * 보안: 캐싱 비활성화
 */
async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  const supabase = createBrowserClient();

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const [
    usersResult,
    campaignsResult,
    paymentsResult,
    recentUsersResult,
    recentCampaignsResult,
    newUsersTodayResult,
    activeUsers24hResult,
    pendingApplicationsResult,
  ] = await Promise.all([
    // 전체 사용자 통계
    supabase
      .from('profiles')
      .select('role', { count: 'exact' }),
    
    // 전체 캠페인 수
    supabase
      .from('campaigns')
      .select('*', { count: 'exact' }),
    
    // 전체 수익
    supabase
      .from('payments')
      .select('commission_amount')
      .eq('status', 'completed'),
    
    // 최근 가입 사용자
    supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10),
    
    // 최근 캠페인
    supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10),
    
    // 오늘 신규 사용자
    supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .gte('created_at', today.toISOString()),
    
    // 24시간 내 활동 사용자 (updated_at 기준)
    supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .gte('updated_at', yesterday.toISOString()),
    
    // 대기 중인 지원
    supabase
      .from('campaign_applications')
      .select('*', { count: 'exact' })
      .eq('status', 'pending'),
  ]);

  if (usersResult.error) throw usersResult.error;
  if (campaignsResult.error) throw campaignsResult.error;
  if (paymentsResult.error) throw paymentsResult.error;

  // 사용자 역할별 통계
  const userStats = (usersResult.data || []).reduce(
    (acc, user) => {
      if (user.role === 'creator') acc.creators++;
      else if (user.role === 'business') acc.businesses++;
      acc.total++;
      return acc;
    },
    { total: 0, creators: 0, businesses: 0 }
  );

  // 총 수익 계산
  const totalRevenue = paymentsResult.data?.reduce(
    (sum, payment) => sum + (payment.commission_amount || 0),
    0
  ) || 0;

  // 활성 캠페인 수
  const activeCampaigns = campaignsResult.data?.filter(c => c.status === 'active').length || 0;

  return {
    totalUsers: userStats.total,
    totalCreators: userStats.creators,
    totalBusinesses: userStats.businesses,
    totalCampaigns: campaignsResult.count || 0,
    totalRevenue,
    recentUsers: recentUsersResult.data || [],
    recentCampaigns: recentCampaignsResult.data || [],
    systemStats: {
      activeUsers24h: activeUsers24hResult.count || 0,
      newUsersToday: newUsersTodayResult.count || 0,
      pendingApplications: pendingApplicationsResult.count || 0,
      activeCampaigns,
    },
  };
}

/**
 * 대시보드 데이터 가져오기 훅
 * 
 * @example
 * ```tsx
 * function Dashboard() {
 *   const { data, isLoading, error } = useDashboardData();
 *   
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage error={error} />;
 *   
 *   return <DashboardContent data={data} />;
 * }
 * ```
 */
export function useDashboardData() {
  return useQuery({
    queryKey: queryKeys.dashboard(),
    queryFn: async () => {
      const supabase = createBrowserClient();
      
      // 현재 사용자 정보 가져오기
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Not authenticated');

      // 사용자 프로필 조회하여 역할 확인
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      if (!profile) throw new Error('Profile not found');

      // 역할에 따라 다른 대시보드 데이터 가져오기
      switch (profile.role) {
        case 'creator':
          return fetchCreatorDashboard(user.id);
        case 'business':
          return fetchBusinessDashboard(user.id);
        case 'admin':
          // 관리자는 캐싱 비활성화
          return fetchAdminDashboard();
        default:
          throw new Error(`Unknown role: ${profile.role}`);
      }
    },
    // 관리자인 경우 캐싱 비활성화를 위한 동적 옵션
    ...(() => {
      if (typeof window !== 'undefined') {
        const supabase = createBrowserClient();
        supabase.auth.getUser().then(({ data }) => {
          if (data.user) {
            supabase
              .from('profiles')
              .select('role')
              .eq('id', data.user.id)
              .single()
              .then(({ data: profile }) => {
                if (profile?.role === 'admin') {
                  return adminQueryOptions;
                }
              });
          }
        });
      }
      return {};
    })(),
  });
}

/**
 * 역할별 대시보드 데이터 가져오기 훅
 * 
 * @param role - 사용자 역할
 * @param userId - 사용자 ID (관리자는 불필요)
 */
export function useDashboardDataByRole(
  role: 'creator' | 'business' | 'admin',
  userId?: string
) {
  const isAdmin = role === 'admin';

  return useQuery({
    queryKey: queryKeys.dashboardByRole(role),
    queryFn: async () => {
      if (role === 'admin') {
        return fetchAdminDashboard();
      }

      if (!userId) {
        throw new Error('User ID is required for non-admin roles');
      }

      if (role === 'creator') {
        return fetchCreatorDashboard(userId);
      }

      return fetchBusinessDashboard(userId);
    },
    // 관리자는 캐싱 비활성화
    ...(isAdmin ? adminQueryOptions : {}),
    enabled: role === 'admin' || !!userId,
  });
}
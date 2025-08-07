'use client';

import { useQuery } from '@tanstack/react-query';
import { createBrowserClient, handleClientError } from '@/lib/supabase/client';
import { queryKeys, adminQueryOptions } from '@/providers/query-provider';
import type { Tables } from '@/types/database.types';

/**
 * 관리자 권한 확인
 */
async function verifyAdminRole(): Promise<boolean> {
  const supabase = createBrowserClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return false;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) return false;
  
  return profile.role === 'admin';
}

/**
 * 전체 사용자 목록 조회 (관리자 전용)
 */
interface AdminUsersData {
  users: Tables<'profiles'>[];
  totalCount: number;
  roleBreakdown: {
    creators: number;
    businesses: number;
    admins: number;
  };
}

async function fetchAdminUsers(
  page: number = 1,
  limit: number = 50,
  filter?: {
    role?: 'creator' | 'business' | 'admin';
    search?: string;
  }
): Promise<AdminUsersData> {
  const supabase = createBrowserClient();
  
  // 관리자 권한 확인
  const isAdmin = await verifyAdminRole();
  if (!isAdmin) {
    throw new Error('Unauthorized: Admin access required');
  }

  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' });

  // 필터 적용
  if (filter?.role) {
    query = query.eq('role', filter.role);
  }
  
  if (filter?.search) {
    query = query.or(
      `email.ilike.%${filter.search}%,full_name.ilike.%${filter.search}%,company_name.ilike.%${filter.search}%`
    );
  }

  // 페이지네이션
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  const { data: users, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw handleClientError(error);
  }

  // 역할별 통계 (전체, 필터 무시)
  const { data: roleStats } = await supabase
    .from('profiles')
    .select('role');

  const roleBreakdown = (roleStats || []).reduce(
    (acc, user) => {
      if (user.role === 'creator') acc.creators++;
      else if (user.role === 'business') acc.businesses++;
      else if (user.role === 'admin') acc.admins++;
      return acc;
    },
    { creators: 0, businesses: 0, admins: 0 }
  );

  return {
    users: users || [],
    totalCount: count || 0,
    roleBreakdown,
  };
}

/**
 * 시스템 분석 데이터 (관리자 전용)
 */
interface SystemAnalytics {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  users: {
    total: number;
    newToday: number;
    newThisWeek: number;
    newThisMonth: number;
    activeToday: number;
    activeThisWeek: number;
  };
  campaigns: {
    total: number;
    active: number;
    completed: number;
    averageBudget: number;
    totalBudget: number;
  };
  performance: {
    avgResponseTime: number;
    errorRate: number;
    successRate: number;
  };
}

async function fetchSystemAnalytics(): Promise<SystemAnalytics> {
  const supabase = createBrowserClient();
  
  // 관리자 권한 확인
  const isAdmin = await verifyAdminRole();
  if (!isAdmin) {
    throw new Error('Unauthorized: Admin access required');
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - today.getDay());
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  // 병렬 데이터 조회
  const [
    totalRevenue,
    thisMonthRevenue,
    lastMonthRevenue,
    allUsers,
    newUsersToday,
    newUsersThisWeek,
    newUsersThisMonth,
    activeUsersToday,
    activeUsersThisWeek,
    allCampaigns,
    activeCampaigns,
    completedCampaigns,
  ] = await Promise.all([
    // 전체 수익
    supabase
      .from('payments')
      .select('commission_amount')
      .eq('status', 'completed'),
    
    // 이번 달 수익
    supabase
      .from('payments')
      .select('commission_amount')
      .eq('status', 'completed')
      .gte('completed_at', thisMonthStart.toISOString()),
    
    // 지난 달 수익
    supabase
      .from('payments')
      .select('commission_amount')
      .eq('status', 'completed')
      .gte('completed_at', lastMonthStart.toISOString())
      .lte('completed_at', lastMonthEnd.toISOString()),
    
    // 전체 사용자
    supabase.from('profiles').select('*', { count: 'exact' }),
    
    // 오늘 신규 사용자
    supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .gte('created_at', today.toISOString()),
    
    // 이번 주 신규 사용자
    supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .gte('created_at', thisWeekStart.toISOString()),
    
    // 이번 달 신규 사용자
    supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .gte('created_at', thisMonthStart.toISOString()),
    
    // 오늘 활동 사용자
    supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .gte('updated_at', today.toISOString()),
    
    // 이번 주 활동 사용자
    supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .gte('updated_at', thisWeekStart.toISOString()),
    
    // 전체 캠페인
    supabase.from('campaigns').select('*'),
    
    // 활성 캠페인
    supabase
      .from('campaigns')
      .select('*', { count: 'exact' })
      .eq('status', 'active'),
    
    // 완료된 캠페인
    supabase
      .from('campaigns')
      .select('*', { count: 'exact' })
      .eq('status', 'completed'),
  ]);

  // 수익 계산
  const totalRevenueAmount = totalRevenue.data?.reduce((sum, p) => sum + (p.commission_amount || 0), 0) || 0;
  const thisMonthRevenueAmount = thisMonthRevenue.data?.reduce((sum, p) => sum + (p.commission_amount || 0), 0) || 0;
  const lastMonthRevenueAmount = lastMonthRevenue.data?.reduce((sum, p) => sum + (p.commission_amount || 0), 0) || 0;
  const revenueGrowth = lastMonthRevenueAmount > 0 
    ? ((thisMonthRevenueAmount - lastMonthRevenueAmount) / lastMonthRevenueAmount) * 100 
    : 0;

  // 캠페인 통계
  const totalBudget = allCampaigns.data?.reduce((sum, c) => sum + (c.budget || 0), 0) || 0;
  const averageBudget = allCampaigns.data && allCampaigns.data.length > 0
    ? totalBudget / allCampaigns.data.length
    : 0;

  return {
    revenue: {
      total: totalRevenueAmount,
      thisMonth: thisMonthRevenueAmount,
      lastMonth: lastMonthRevenueAmount,
      growth: revenueGrowth,
    },
    users: {
      total: allUsers.count || 0,
      newToday: newUsersToday.count || 0,
      newThisWeek: newUsersThisWeek.count || 0,
      newThisMonth: newUsersThisMonth.count || 0,
      activeToday: activeUsersToday.count || 0,
      activeThisWeek: activeUsersThisWeek.count || 0,
    },
    campaigns: {
      total: allCampaigns.data?.length || 0,
      active: activeCampaigns.count || 0,
      completed: completedCampaigns.count || 0,
      averageBudget,
      totalBudget,
    },
    performance: {
      avgResponseTime: 0, // 실제 구현 시 모니터링 시스템과 연동
      errorRate: 0,
      successRate: 100,
    },
  };
}

/**
 * 관리자 사용자 목록 조회 훅
 * 보안: 캐싱 완전 비활성화
 * 
 * @example
 * ```tsx
 * function AdminUsers() {
 *   const { data, isLoading, error } = useAdminUsers(1, 50);
 *   
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage error={error} />;
 *   
 *   return (
 *     <div>
 *       <h2>Total Users: {data.totalCount}</h2>
 *       <UserList users={data.users} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useAdminUsers(
  page: number = 1,
  limit: number = 50,
  filter?: {
    role?: 'creator' | 'business' | 'admin';
    search?: string;
  }
) {
  return useQuery({
    queryKey: [...queryKeys.adminUsers(), page, limit, filter],
    queryFn: () => fetchAdminUsers(page, limit, filter),
    ...adminQueryOptions, // 캐싱 완전 비활성화
  });
}

/**
 * 시스템 분석 데이터 조회 훅
 * 보안: 캐싱 완전 비활성화
 * 
 * @example
 * ```tsx
 * function AdminAnalytics() {
 *   const { data, isLoading, error } = useAdminAnalytics();
 *   
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage error={error} />;
 *   
 *   return (
 *     <AnalyticsDashboard
 *       revenue={data.revenue}
 *       users={data.users}
 *       campaigns={data.campaigns}
 *     />
 *   );
 * }
 * ```
 */
export function useAdminAnalytics() {
  return useQuery({
    queryKey: queryKeys.adminAnalytics(),
    queryFn: fetchSystemAnalytics,
    ...adminQueryOptions, // 캐싱 완전 비활성화
  });
}

/**
 * 관리자 시스템 상태 조회 훅
 * 실시간 시스템 모니터링용
 */
export function useAdminSystemStatus() {
  return useQuery({
    queryKey: queryKeys.adminSystem(),
    queryFn: async () => {
      const isAdmin = await verifyAdminRole();
      if (!isAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }

      // 시스템 상태 체크 (실제 구현 시 모니터링 API와 연동)
      return {
        database: 'healthy',
        storage: 'healthy',
        auth: 'healthy',
        realtime: 'healthy',
        timestamp: new Date().toISOString(),
      };
    },
    ...adminQueryOptions,
    refetchInterval: 30000, // 30초마다 갱신
  });
}

/**
 * 관리자 권한 확인 훅
 */
export function useIsAdmin() {
  return useQuery({
    queryKey: [...queryKeys.admin(), 'role-check'],
    queryFn: verifyAdminRole,
    staleTime: 60000, // 1분
    gcTime: 120000, // 2분
  });
}
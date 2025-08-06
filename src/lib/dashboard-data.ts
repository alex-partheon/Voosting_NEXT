/**
 * 대시보드 데이터 fetching 중앙집중식 관리
 * 실시간 데이터 업데이트와 캐싱을 지원하는 데이터 계층
 */

import { createBrowserClient } from '@/lib/supabase/client';
import { handleClientError } from '@/lib/supabase/client';
import type { 
  Profile, 
  Campaign, 
  CampaignApplication,
  Payment,
  ReferralEarning,
  CreatorDashboardStats,
  BusinessDashboardStats,
  AdminDashboardStats,
  CampaignWithCreator,
  CampaignApplicationWithDetails,
  PaymentWithDetails,
  ReferralEarningWithDetails,
  UserRole,
  CampaignStatus,
  ApplicationStatus,
  PaymentStatus,
  Database 
} from '@/types/supabase';

// 클라이언트 싱글톤
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

function getClient() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient();
  }
  return supabaseClient;
}

// 에러 처리 유틸리티
export interface DashboardError {
  message: string;
  code: string;
  details?: any;
}

export interface DashboardResponse<T> {
  data: T | null;
  error: DashboardError | null;
  loading?: boolean;
}

function createError(error: any, context: string): DashboardError {
  const clientError = handleClientError(error);
  return {
    ...clientError,
    details: { context, original: error },
  };
}

// 기본 데이터 서비스 클래스
export class DashboardDataService {
  private client: ReturnType<typeof createBrowserClient>;

  constructor() {
    this.client = getClient();
  }

  /**
   * 현재 사용자 인증 상태 및 프로필 조회
   */
  async getCurrentUser(): Promise<DashboardResponse<Profile>> {
    try {
      const { data: { user }, error: authError } = await this.client.auth.getUser();
      
      if (authError || !user) {
        return {
          data: null,
          error: createError(authError || new Error('Not authenticated'), 'getCurrentUser'),
        };
      }

      const { data: profile, error: profileError } = await this.client
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        return {
          data: null,
          error: createError(profileError, 'getCurrentUser - profile fetch'),
        };
      }

      return { data: profile, error: null };
    } catch (error) {
      return {
        data: null,
        error: createError(error, 'getCurrentUser - unexpected error'),
      };
    }
  }

  /**
   * 사용자 역할별 권한 검사
   */
  async checkUserRole(requiredRole: UserRole): Promise<boolean> {
    const { data: profile } = await this.getCurrentUser();
    return profile?.role === requiredRole;
  }

  // ===========================================
  // CREATOR 대시보드 데이터 fetching
  // ===========================================

  /**
   * 크리에이터 대시보드 통계 조회
   */
  async getCreatorDashboardStats(userId: string): Promise<DashboardResponse<CreatorDashboardStats>> {
    try {
      // 병렬로 모든 데이터 조회
      const [
        campaignsResult,
        applicationsResult,
        paymentsResult,
        referralEarningsResult
      ] = await Promise.allSettled([
        // 참여한 캠페인들 (승인된 것만)
        this.client
          .from('campaign_applications')
          .select(`
            *,
            campaign:campaigns(*)
          `)
          .eq('applicant_id', userId)
          .eq('status', 'approved'),
        
        // 전체 지원서
        this.client
          .from('campaign_applications')
          .select('*')
          .eq('applicant_id', userId),
        
        // 결제 내역
        this.client
          .from('payments')
          .select('*')
          .eq('user_id', userId),
        
        // 추천 수익
        this.client
          .from('referral_earnings')
          .select('*')
          .eq('user_id', userId)
      ]);

      // 에러 확인
      if (campaignsResult.status === 'rejected' || 
          applicationsResult.status === 'rejected' ||
          paymentsResult.status === 'rejected' ||
          referralEarningsResult.status === 'rejected') {
        
        const firstError = [campaignsResult, applicationsResult, paymentsResult, referralEarningsResult]
          .find(result => result.status === 'rejected')?.reason;
        
        return {
          data: null,
          error: createError(firstError, 'getCreatorDashboardStats - data fetch'),
        };
      }

      const campaigns = campaignsResult.status === 'fulfilled' ? campaignsResult.value.data || [] : [];
      const applications = applicationsResult.status === 'fulfilled' ? applicationsResult.value.data || [] : [];
      const payments = paymentsResult.status === 'fulfilled' ? paymentsResult.value.data || [] : [];
      const referralEarnings = referralEarningsResult.status === 'fulfilled' ? referralEarningsResult.value.data || [] : [];

      // 통계 계산
      const completedPayments = payments.filter(p => p.status === 'completed');
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      
      const monthlyPayments = completedPayments.filter(p => 
        new Date(p.created_at) >= thisMonth
      );

      const activeCampaigns = campaigns.filter(c => 
        c.campaign && c.campaign.status === 'active'
      ).length;

      const completedCampaigns = campaigns.filter(c => 
        c.campaign && c.campaign.status === 'completed'
      ).length;

      const pendingApplications = applications.filter(a => 
        a.status === 'pending'
      ).length;

      const totalApprovedApplications = applications.filter(a => 
        a.status === 'approved'
      ).length;

      const successRate = applications.length > 0 
        ? (totalApprovedApplications / applications.length) * 100 
        : 0;

      const stats: CreatorDashboardStats = {
        totalEarnings: completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
        monthlyEarnings: monthlyPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
        activeCampaigns,
        completedCampaigns,
        pendingApplications,
        successRate: Math.round(successRate * 100) / 100, // 소수점 2자리
        totalReferralEarnings: referralEarnings.reduce((sum, re) => sum + (re.amount || 0), 0),
      };

      return { data: stats, error: null };
    } catch (error) {
      return {
        data: null,
        error: createError(error, 'getCreatorDashboardStats - unexpected error'),
      };
    }
  }

  /**
   * 크리에이터의 캠페인 목록 조회 (상세 정보 포함)
   */
  async getCreatorCampaigns(userId: string): Promise<DashboardResponse<CampaignApplicationWithDetails[]>> {
    try {
      const { data, error } = await this.client
        .from('campaign_applications')
        .select(`
          *,
          campaign:campaigns(*),
          creator:profiles!campaign_applications_applicant_id_fkey(*)
        `)
        .eq('applicant_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return {
          data: null,
          error: createError(error, 'getCreatorCampaigns'),
        };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return {
        data: null,
        error: createError(error, 'getCreatorCampaigns - unexpected error'),
      };
    }
  }

  /**
   * 크리에이터의 월별 수익 통계 조회
   */
  async getCreatorMonthlyStats(userId: string, months: number = 6): Promise<DashboardResponse<Array<{
    month: string;
    campaigns: number;
    revenue: number;
    applications: number;
  }>>> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - months);

      const { data: applications, error: appError } = await this.client
        .from('campaign_applications')
        .select(`
          *,
          campaign:campaigns(*)
        `)
        .eq('applicant_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (appError) {
        return {
          data: null,
          error: createError(appError, 'getCreatorMonthlyStats - applications'),
        };
      }

      const { data: payments, error: payError } = await this.client
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (payError) {
        return {
          data: null,
          error: createError(payError, 'getCreatorMonthlyStats - payments'),
        };
      }

      // 월별로 그룹화
      const monthlyData = new Map<string, {
        campaigns: number;
        revenue: number;
        applications: number;
      }>();

      // 지난 N개월 초기화
      for (let i = 0; i < months; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toISOString().substring(0, 7); // YYYY-MM
        monthlyData.set(monthKey, {
          campaigns: 0,
          revenue: 0,
          applications: 0,
        });
      }

      // 지원서 데이터 집계
      (applications || []).forEach(app => {
        const monthKey = app.created_at.substring(0, 7);
        const existing = monthlyData.get(monthKey);
        if (existing) {
          existing.applications++;
          if (app.status === 'approved') {
            existing.campaigns++;
          }
        }
      });

      // 결제 데이터 집계
      (payments || []).forEach(payment => {
        const monthKey = payment.created_at.substring(0, 7);
        const existing = monthlyData.get(monthKey);
        if (existing) {
          existing.revenue += payment.amount || 0;
        }
      });

      // 배열로 변환 (최신 순)
      const result = Array.from(monthlyData.entries())
        .map(([month, stats]) => ({
          month,
          ...stats,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

      return { data: result, error: null };
    } catch (error) {
      return {
        data: null,
        error: createError(error, 'getCreatorMonthlyStats - unexpected error'),
      };
    }
  }

  // ===========================================
  // BUSINESS 대시보드 데이터 fetching
  // ===========================================

  /**
   * 비즈니스 대시보드 통계 조회
   */
  async getBusinessDashboardStats(userId: string): Promise<DashboardResponse<BusinessDashboardStats>> {
    try {
      const [campaignsResult, paymentsResult, applicationsResult] = await Promise.allSettled([
        // 생성한 캠페인들
        this.client
          .from('campaigns')
          .select('*')
          .eq('business_id', userId),
        
        // 결제 내역
        this.client
          .from('payments')
          .select('*')
          .eq('user_id', userId),
        
        // 모든 지원서 (자신의 캠페인에)
        this.client
          .from('campaign_applications')
          .select(`
            *,
            campaign:campaigns!inner(business_id)
          `)
          .eq('campaign.business_id', userId)
      ]);

      if (campaignsResult.status === 'rejected' ||
          paymentsResult.status === 'rejected' ||
          applicationsResult.status === 'rejected') {
        
        const firstError = [campaignsResult, paymentsResult, applicationsResult]
          .find(result => result.status === 'rejected')?.reason;
        
        return {
          data: null,
          error: createError(firstError, 'getBusinessDashboardStats - data fetch'),
        };
      }

      const campaigns = campaignsResult.status === 'fulfilled' ? campaignsResult.value.data || [] : [];
      const payments = paymentsResult.status === 'fulfilled' ? paymentsResult.value.data || [] : [];
      const applications = applicationsResult.status === 'fulfilled' ? applicationsResult.value.data || [] : [];

      // 이번 달 기준
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const completedPayments = payments.filter(p => p.status === 'completed');
      const monthlyPayments = completedPayments.filter(p => 
        new Date(p.created_at) >= thisMonth
      );

      const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
      const completedCampaigns = campaigns.filter(c => c.status === 'completed').length;
      const selectedCreators = applications.filter(a => a.status === 'approved').length;
      const totalSpent = completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const monthlySpent = monthlyPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const avgCampaignBudget = campaigns.length > 0 
        ? campaigns.reduce((sum, c) => sum + (c.budget || 0), 0) / campaigns.length 
        : 0;

      const stats: BusinessDashboardStats = {
        totalSpent,
        monthlySpent,
        activeCampaigns,
        completedCampaigns,
        totalApplications: applications.length,
        selectedCreators,
        avgCampaignBudget,
      };

      return { data: stats, error: null };
    } catch (error) {
      return {
        data: null,
        error: createError(error, 'getBusinessDashboardStats - unexpected error'),
      };
    }
  }

  /**
   * 비즈니스의 캠페인 목록 조회
   */
  async getBusinessCampaigns(userId: string): Promise<DashboardResponse<CampaignWithCreator[]>> {
    try {
      const { data, error } = await this.client
        .from('campaigns')
        .select(`
          *,
          applications:campaign_applications(count),
          selected_applications:campaign_applications!inner(count)
        `)
        .eq('business_id', userId)
        .eq('selected_applications.status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        return {
          data: null,
          error: createError(error, 'getBusinessCampaigns'),
        };
      }

      // 애플리케이션 수 계산을 위한 별도 쿼리 (더 정확한 데이터를 위해)
      const campaignsWithCounts = await Promise.all(
        (data || []).map(async (campaign) => {
          const [applicationsResult, selectedResult] = await Promise.allSettled([
            this.client
              .from('campaign_applications')
              .select('id', { count: 'exact' })
              .eq('campaign_id', campaign.id),
            this.client
              .from('campaign_applications')
              .select('id', { count: 'exact' })
              .eq('campaign_id', campaign.id)
              .eq('status', 'approved')
          ]);

          return {
            ...campaign,
            applications_count: applicationsResult.status === 'fulfilled' ? applicationsResult.value.count || 0 : 0,
            selected_creators_count: selectedResult.status === 'fulfilled' ? selectedResult.value.count || 0 : 0,
          } as CampaignWithCreator;
        })
      );

      return { data: campaignsWithCounts, error: null };
    } catch (error) {
      return {
        data: null,
        error: createError(error, 'getBusinessCampaigns - unexpected error'),
      };
    }
  }

  // ===========================================
  // ADMIN 대시보드 데이터 fetching
  // ===========================================

  /**
   * 관리자 대시보드 통계 조회
   */
  async getAdminDashboardStats(): Promise<DashboardResponse<AdminDashboardStats>> {
    try {
      // 관리자 권한 확인
      const isAdmin = await this.checkUserRole('admin');
      if (!isAdmin) {
        return {
          data: null,
          error: { message: 'Access denied - Admin role required', code: 'ACCESS_DENIED' },
        };
      }

      const [usersResult, campaignsResult, paymentsResult, referralEarningsResult] = await Promise.allSettled([
        // 전체 사용자
        this.client
          .from('profiles')
          .select('id, created_at', { count: 'exact' }),
        
        // 전체 캠페인
        this.client
          .from('campaigns')
          .select('id, created_at', { count: 'exact' }),
        
        // 전체 결제
        this.client
          .from('payments')
          .select('id, created_at, amount', { count: 'exact' }),
        
        // 추천 수익
        this.client
          .from('referral_earnings')
          .select('amount')
      ]);

      if (usersResult.status === 'rejected' ||
          campaignsResult.status === 'rejected' ||
          paymentsResult.status === 'rejected' ||
          referralEarningsResult.status === 'rejected') {
        
        const firstError = [usersResult, campaignsResult, paymentsResult, referralEarningsResult]
          .find(result => result.status === 'rejected')?.reason;
        
        return {
          data: null,
          error: createError(firstError, 'getAdminDashboardStats - data fetch'),
        };
      }

      const users = usersResult.status === 'fulfilled' ? usersResult.value.data || [] : [];
      const campaigns = campaignsResult.status === 'fulfilled' ? campaignsResult.value.data || [] : [];
      const payments = paymentsResult.status === 'fulfilled' ? paymentsResult.value.data || [] : [];
      const referralEarnings = referralEarningsResult.status === 'fulfilled' ? referralEarningsResult.value.data || [] : [];

      // 이번 달 기준
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const monthlyUsers = users.filter(u => new Date(u.created_at) >= thisMonth).length;
      const monthlyCampaigns = campaigns.filter(c => new Date(c.created_at) >= thisMonth).length;
      const monthlyPayments = payments.filter(p => new Date(p.created_at) >= thisMonth).length;

      // 승인 대기 중인 항목들 조회
      const { data: pendingApplications } = await this.client
        .from('campaign_applications')
        .select('id', { count: 'exact' })
        .eq('status', 'pending');

      const stats: AdminDashboardStats = {
        totalUsers: users.length,
        monthlyUsers,
        totalCampaigns: campaigns.length,
        monthlyCampaigns,
        totalPayments: payments.length,
        monthlyPayments,
        pendingApprovals: pendingApplications?.length || 0,
        totalReferralEarnings: referralEarnings.reduce((sum, re) => sum + (re.amount || 0), 0),
      };

      return { data: stats, error: null };
    } catch (error) {
      return {
        data: null,
        error: createError(error, 'getAdminDashboardStats - unexpected error'),
      };
    }
  }

  /**
   * 관리자용 사용자 목록 조회
   */
  async getAdminUsersList(options?: {
    page?: number;
    limit?: number;
    role?: UserRole;
    search?: string;
  }): Promise<DashboardResponse<{ users: Profile[]; total: number }>> {
    try {
      const isAdmin = await this.checkUserRole('admin');
      if (!isAdmin) {
        return {
          data: null,
          error: { message: 'Access denied - Admin role required', code: 'ACCESS_DENIED' },
        };
      }

      const page = options?.page || 1;
      const limit = options?.limit || 20;
      const offset = (page - 1) * limit;

      let query = this.client
        .from('profiles')
        .select('*', { count: 'exact' });

      if (options?.role) {
        query = query.eq('role', options.role);
      }

      if (options?.search) {
        query = query.or(`display_name.ilike.%${options.search}%,email.ilike.%${options.search}%`);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return {
          data: null,
          error: createError(error, 'getAdminUsersList'),
        };
      }

      return {
        data: {
          users: data || [],
          total: count || 0,
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: createError(error, 'getAdminUsersList - unexpected error'),
      };
    }
  }

  // ===========================================
  // 실시간 업데이트 구독
  // ===========================================

  /**
   * 대시보드 데이터 실시간 구독
   */
  subscribeToUserData(userId: string, callbacks: {
    onCampaignUpdate?: (payload: any) => void;
    onApplicationUpdate?: (payload: any) => void;
    onPaymentUpdate?: (payload: any) => void;
    onReferralUpdate?: (payload: any) => void;
  }) {
    const subscriptions: Array<{ unsubscribe: () => void }> = [];

    // 캠페인 업데이트 구독 (비즈니스용)
    if (callbacks.onCampaignUpdate) {
      const campaignSub = this.client
        .channel(`campaigns:${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'campaigns',
            filter: `business_id=eq.${userId}`,
          },
          callbacks.onCampaignUpdate
        )
        .subscribe();
      
      subscriptions.push({
        unsubscribe: () => this.client.removeChannel(campaignSub),
      });
    }

    // 지원서 업데이트 구독 (크리에이터용)
    if (callbacks.onApplicationUpdate) {
      const appSub = this.client
        .channel(`applications:${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'campaign_applications',
            filter: `applicant_id=eq.${userId}`,
          },
          callbacks.onApplicationUpdate
        )
        .subscribe();
      
      subscriptions.push({
        unsubscribe: () => this.client.removeChannel(appSub),
      });
    }

    // 결제 업데이트 구독
    if (callbacks.onPaymentUpdate) {
      const paymentSub = this.client
        .channel(`payments:${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'payments',
            filter: `user_id=eq.${userId}`,
          },
          callbacks.onPaymentUpdate
        )
        .subscribe();
      
      subscriptions.push({
        unsubscribe: () => this.client.removeChannel(paymentSub),
      });
    }

    // 추천 수익 업데이트 구독
    if (callbacks.onReferralUpdate) {
      const referralSub = this.client
        .channel(`referrals:${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'referral_earnings',
            filter: `user_id=eq.${userId}`,
          },
          callbacks.onReferralUpdate
        )
        .subscribe();
      
      subscriptions.push({
        unsubscribe: () => this.client.removeChannel(referralSub),
      });
    }

    // 전체 구독 해제 함수 반환
    return {
      unsubscribeAll: () => {
        subscriptions.forEach(sub => sub.unsubscribe());
      },
    };
  }
}

// 싱글톤 인스턴스
let dashboardService: DashboardDataService | null = null;

/**
 * 대시보드 데이터 서비스 인스턴스 반환
 */
export function getDashboardService(): DashboardDataService {
  if (!dashboardService) {
    dashboardService = new DashboardDataService();
  }
  return dashboardService;
}

// 편의 함수들
export const dashboardData = {
  getCurrentUser: () => getDashboardService().getCurrentUser(),
  getCreatorStats: (userId: string) => getDashboardService().getCreatorDashboardStats(userId),
  getCreatorCampaigns: (userId: string) => getDashboardService().getCreatorCampaigns(userId),
  getCreatorMonthlyStats: (userId: string, months?: number) => getDashboardService().getCreatorMonthlyStats(userId, months),
  getBusinessStats: (userId: string) => getDashboardService().getBusinessDashboardStats(userId),
  getBusinessCampaigns: (userId: string) => getDashboardService().getBusinessCampaigns(userId),
  getAdminStats: () => getDashboardService().getAdminDashboardStats(),
  getAdminUsers: (options?: Parameters<DashboardDataService['getAdminUsersList']>[0]) => getDashboardService().getAdminUsersList(options),
  subscribe: (userId: string, callbacks: Parameters<DashboardDataService['subscribeToUserData']>[1]) => getDashboardService().subscribeToUserData(userId, callbacks),
};

/**
 * 테스트용 리셋 함수
 */
export function resetDashboardService() {
  dashboardService = null;
  supabaseClient = null;
}
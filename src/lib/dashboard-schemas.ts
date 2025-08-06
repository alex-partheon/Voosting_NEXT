/**
 * 대시보드 데이터 검증을 위한 Zod 스키마
 * 클라이언트-서버 데이터 교환 시 안전성과 타입 검증을 보장
 */

import { z } from 'zod';
import { 
  USER_ROLES, 
  CAMPAIGN_STATUSES, 
  APPLICATION_STATUSES, 
  PAYMENT_STATUSES 
} from '@/types/supabase';

// ===========================================
// 기본 공통 스키마
// ===========================================

export const BaseEntitySchema = z.object({
  id: z.string().uuid('유효하지 않은 ID 형식입니다'),
  created_at: z.string().datetime('유효하지 않은 날짜 형식입니다'),
  updated_at: z.string().datetime('유효하지 않은 날짜 형식입니다').optional(),
});

export const UserRoleSchema = z.enum(['creator', 'business', 'admin'] as const);
export const CampaignStatusSchema = z.enum(['draft', 'active', 'paused', 'completed', 'cancelled'] as const);
export const ApplicationStatusSchema = z.enum(['pending', 'approved', 'rejected', 'completed'] as const);
export const PaymentStatusSchema = z.enum(['pending', 'completed', 'failed', 'refunded'] as const);

// ===========================================
// Profile (사용자 프로필) 스키마
// ===========================================

export const ProfileSchema = BaseEntitySchema.extend({
  email: z.string().email('유효한 이메일 주소를 입력하세요'),
  display_name: z.string().min(1, '표시 이름을 입력하세요').max(100, '표시 이름은 100자 이하로 입력하세요').nullable(),
  avatar_url: z.string().url('유효한 URL을 입력하세요').nullable(),
  role: UserRoleSchema,
  phone: z.string().nullable(),
  bio: z.string().max(500, '자기소개는 500자 이하로 입력하세요').nullable(),
  website: z.string().url('유효한 웹사이트 URL을 입력하세요').nullable(),
  social_links: z.record(z.string()).nullable(),
  settings: z.record(z.any()).nullable(),
  referrer_id: z.string().uuid().nullable(),
  referral_code: z.string().min(6, '추천 코드는 6자 이상이어야 합니다').max(20, '추천 코드는 20자 이하여야 합니다').nullable(),
  is_verified: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export const ProfileUpdateSchema = ProfileSchema.partial().omit({
  id: true,
  created_at: true,
  email: true, // 이메일은 별도 프로세스로 변경
  role: true,  // 역할은 관리자만 변경 가능
});

// ===========================================
// Campaign (캠페인) 스키마
// ===========================================

export const CampaignSchema = BaseEntitySchema.extend({
  title: z.string().min(1, '캠페인 제목을 입력하세요').max(200, '제목은 200자 이하로 입력하세요'),
  description: z.string().min(10, '설명은 10자 이상 입력하세요').max(2000, '설명은 2000자 이하로 입력하세요'),
  category: z.string().min(1, '카테고리를 선택하세요'),
  budget: z.number().min(0, '예산은 0 이상이어야 합니다'),
  currency: z.string().length(3, '통화 코드는 3자리여야 합니다').default('KRW'),
  start_date: z.string().datetime('유효하지 않은 시작일 형식입니다'),
  end_date: z.string().datetime('유효하지 않은 종료일 형식입니다'),
  status: CampaignStatusSchema.default('draft'),
  business_id: z.string().uuid('유효하지 않은 비즈니스 ID입니다'),
  requirements: z.record(z.any()).nullable(),
  deliverables: z.record(z.any()).nullable(),
  target_audience: z.record(z.any()).nullable(),
  platform_requirements: z.array(z.string()).nullable(),
  max_participants: z.number().min(1, '최대 참여자는 1명 이상이어야 합니다').nullable(),
  is_featured: z.boolean().default(false),
  tags: z.array(z.string()).nullable(),
});

export const CampaignCreateSchema = CampaignSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).refine((data) => {
  const startDate = new Date(data.start_date);
  const endDate = new Date(data.end_date);
  return startDate < endDate;
}, {
  message: '종료일은 시작일보다 이후여야 합니다',
  path: ['end_date'],
});

export const CampaignUpdateSchema = CampaignSchema.partial().omit({
  id: true,
  created_at: true,
  business_id: true, // 비즈니스 ID는 변경 불가
});

// ===========================================
// Campaign Application (캠페인 지원서) 스키마
// ===========================================

export const CampaignApplicationSchema = BaseEntitySchema.extend({
  campaign_id: z.string().uuid('유효하지 않은 캠페인 ID입니다'),
  applicant_id: z.string().uuid('유효하지 않은 지원자 ID입니다'),
  status: ApplicationStatusSchema.default('pending'),
  message: z.string().max(1000, '메시지는 1000자 이하로 입력하세요').nullable(),
  portfolio_links: z.array(z.string().url('유효한 URL을 입력하세요')).nullable(),
  expected_deliverables: z.record(z.any()).nullable(),
  proposed_timeline: z.string().nullable(),
  requested_compensation: z.number().min(0, '제안 보상은 0 이상이어야 합니다').nullable(),
  admin_notes: z.string().max(500, '관리자 노트는 500자 이하로 입력하세요').nullable(),
  reviewed_by: z.string().uuid().nullable(),
  reviewed_at: z.string().datetime().nullable(),
});

export const CampaignApplicationCreateSchema = CampaignApplicationSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  status: true, // 기본값 사용
  admin_notes: true,
  reviewed_by: true,
  reviewed_at: true,
});

export const CampaignApplicationUpdateSchema = CampaignApplicationSchema.partial().omit({
  id: true,
  created_at: true,
  campaign_id: true, // 캠페인 ID는 변경 불가
  applicant_id: true, // 지원자 ID는 변경 불가
});

// ===========================================
// Payment (결제) 스키마
// ===========================================

export const PaymentSchema = BaseEntitySchema.extend({
  user_id: z.string().uuid('유효하지 않은 사용자 ID입니다'),
  campaign_id: z.string().uuid('유효하지 않은 캠페인 ID입니다').nullable(),
  amount: z.number().min(0, '결제 금액은 0 이상이어야 합니다'),
  currency: z.string().length(3, '통화 코드는 3자리여야 합니다').default('KRW'),
  status: PaymentStatusSchema.default('pending'),
  payment_method: z.string().nullable(),
  transaction_id: z.string().nullable(),
  gateway_response: z.record(z.any()).nullable(),
  description: z.string().max(200, '설명은 200자 이하로 입력하세요').nullable(),
  metadata: z.record(z.any()).nullable(),
  processed_at: z.string().datetime().nullable(),
  failed_reason: z.string().max(500, '실패 사유는 500자 이하로 입력하세요').nullable(),
});

export const PaymentCreateSchema = PaymentSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  transaction_id: true,
  gateway_response: true,
  processed_at: true,
  failed_reason: true,
});

// ===========================================
// Referral Earning (추천 수익) 스키마
// ===========================================

export const ReferralEarningSchema = BaseEntitySchema.extend({
  user_id: z.string().uuid('유효하지 않은 사용자 ID입니다'),
  referrer_id: z.string().uuid('유효하지 않은 추천인 ID입니다'),
  referred_id: z.string().uuid('유효하지 않은 피추천인 ID입니다'),
  campaign_id: z.string().uuid('유효하지 않은 캠페인 ID입니다').nullable(),
  level: z.number().min(1, '추천 레벨은 1 이상이어야 합니다').max(3, '추천 레벨은 3 이하여야 합니다'),
  amount: z.number().min(0, '수익 금액은 0 이상이어야 합니다'),
  commission_rate: z.number().min(0, '수수료율은 0 이상이어야 합니다').max(1, '수수료율은 1 이하여야 합니다'),
  base_amount: z.number().min(0, '기준 금액은 0 이상이어야 합니다'),
  currency: z.string().length(3, '통화 코드는 3자리여야 합니다').default('KRW'),
  status: PaymentStatusSchema.default('pending'),
  paid_at: z.string().datetime().nullable(),
  notes: z.string().max(500, '노트는 500자 이하로 입력하세요').nullable(),
});

// ===========================================
// 대시보드 통계 스키마
// ===========================================

export const CreatorDashboardStatsSchema = z.object({
  totalEarnings: z.number().min(0, '총 수익은 0 이상이어야 합니다'),
  monthlyEarnings: z.number().min(0, '월 수익은 0 이상이어야 합니다'),
  activeCampaigns: z.number().min(0, '활성 캠페인 수는 0 이상이어야 합니다'),
  completedCampaigns: z.number().min(0, '완료된 캠페인 수는 0 이상이어야 합니다'),
  pendingApplications: z.number().min(0, '대기 중인 지원서 수는 0 이상이어야 합니다'),
  successRate: z.number().min(0, '성공률은 0 이상이어야 합니다').max(100, '성공률은 100 이하여야 합니다'),
  totalReferralEarnings: z.number().min(0, '추천 수익은 0 이상이어야 합니다'),
});

export const BusinessDashboardStatsSchema = z.object({
  totalSpent: z.number().min(0, '총 지출은 0 이상이어야 합니다'),
  monthlySpent: z.number().min(0, '월 지출은 0 이상이어야 합니다'),
  activeCampaigns: z.number().min(0, '활성 캠페인 수는 0 이상이어야 합니다'),
  completedCampaigns: z.number().min(0, '완료된 캠페인 수는 0 이상이어야 합니다'),
  totalApplications: z.number().min(0, '총 지원서 수는 0 이상이어야 합니다'),
  selectedCreators: z.number().min(0, '선택된 크리에이터 수는 0 이상이어야 합니다'),
  avgCampaignBudget: z.number().min(0, '평균 캠페인 예산은 0 이상이어야 합니다'),
});

export const AdminDashboardStatsSchema = z.object({
  totalUsers: z.number().min(0, '총 사용자 수는 0 이상이어야 합니다'),
  monthlyUsers: z.number().min(0, '월 신규 사용자 수는 0 이상이어야 합니다'),
  totalCampaigns: z.number().min(0, '총 캠페인 수는 0 이상이어야 합니다'),
  monthlyCampaigns: z.number().min(0, '월 신규 캠페인 수는 0 이상이어야 합니다'),
  totalPayments: z.number().min(0, '총 결제 수는 0 이상이어야 합니다'),
  monthlyPayments: z.number().min(0, '월 결제 수는 0 이상이어야 합니다'),
  pendingApprovals: z.number().min(0, '승인 대기 수는 0 이상이어야 합니다'),
  totalReferralEarnings: z.number().min(0, '총 추천 수익은 0 이상이어야 합니다'),
});

// ===========================================
// API 응답 스키마
// ===========================================

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export const PaginationSchema = z.object({
  page: z.number().min(1, '페이지는 1 이상이어야 합니다'),
  limit: z.number().min(1, '제한은 1 이상이어야 합니다').max(100, '제한은 100 이하여야 합니다'),
  total: z.number().min(0, '총 개수는 0 이상이어야 합니다'),
  totalPages: z.number().min(0, '총 페이지 수는 0 이상이어야 합니다'),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

export const PaginatedResponseSchema = ApiResponseSchema.extend({
  data: z.array(z.any()).optional(),
  pagination: PaginationSchema.optional(),
});

// ===========================================
// 쿼리 옵션 스키마
// ===========================================

export const QueryOptionsSchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().max(200, '검색어는 200자 이하로 입력하세요').optional(),
  filters: z.record(z.any()).optional(),
});

export const CampaignQueryOptionsSchema = QueryOptionsSchema.extend({
  status: CampaignStatusSchema.optional(),
  category: z.string().optional(),
  minBudget: z.number().min(0).optional(),
  maxBudget: z.number().min(0).optional(),
  businessId: z.string().uuid().optional(),
});

export const CreatorQueryOptionsSchema = QueryOptionsSchema.extend({
  category: z.string().optional(),
  minFollowers: z.number().min(0).optional(),
  maxFollowers: z.number().min(0).optional(),
  platform: z.string().optional(),
  verified: z.boolean().optional(),
});

// ===========================================
// 월별 통계 스키마
// ===========================================

export const MonthlyStatsSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'YYYY-MM 형식이어야 합니다'),
  campaigns: z.number().min(0, '캠페인 수는 0 이상이어야 합니다'),
  revenue: z.number().min(0, '수익은 0 이상이어야 합니다'),
  applications: z.number().min(0, '지원서 수는 0 이상이어야 합니다'),
});

export const MonthlyStatsArraySchema = z.array(MonthlyStatsSchema);

// ===========================================
// 에러 스키마
// ===========================================

export const DashboardErrorSchema = z.object({
  message: z.string().min(1, '에러 메시지는 필수입니다'),
  code: z.string().min(1, '에러 코드는 필수입니다'),
  details: z.any().optional(),
});

export const ValidationErrorSchema = z.object({
  field: z.string().min(1, '필드명은 필수입니다'),
  message: z.string().min(1, '에러 메시지는 필수입니다'),
  code: z.string().min(1, '에러 코드는 필수입니다'),
});

// ===========================================
// 검증 유틸리티 함수들
// ===========================================

/**
 * 데이터 검증 및 타입 안전성 보장
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  error?: string;
  details?: z.ZodError;
} {
  try {
    const result = schema.safeParse(data);
    
    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    } else {
      return {
        success: false,
        error: '데이터 유효성 검사에 실패했습니다',
        details: result.error,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: '데이터 검증 중 예상치 못한 오류가 발생했습니다',
      details: error as z.ZodError,
    };
  }
}

/**
 * API 응답 검증
 */
export function validateApiResponse<T>(
  schema: z.ZodSchema<T>, 
  response: unknown
): {
  success: boolean;
  data?: T;
  error?: string;
} {
  const validation = validateData(schema, response);
  
  if (!validation.success) {
    console.error('API 응답 검증 실패:', validation.details?.format());
    return {
      success: false,
      error: validation.error || '응답 데이터가 예상 형식과 일치하지 않습니다',
    };
  }
  
  return {
    success: true,
    data: validation.data,
  };
}

/**
 * 대시보드 통계 데이터 검증
 */
export function validateDashboardStats(
  role: 'creator' | 'business' | 'admin',
  data: unknown
) {
  switch (role) {
    case 'creator':
      return validateData(CreatorDashboardStatsSchema, data);
    case 'business':
      return validateData(BusinessDashboardStatsSchema, data);
    case 'admin':
      return validateData(AdminDashboardStatsSchema, data);
    default:
      return {
        success: false,
        error: '지원되지 않는 사용자 역할입니다',
      };
  }
}

/**
 * 페이지네이션 쿼리 검증 및 기본값 설정
 */
export function validatePaginationQuery(query: Record<string, any>) {
  const validation = validateData(QueryOptionsSchema, query);
  
  if (!validation.success) {
    // 기본값으로 fallback
    return {
      success: true,
      data: {
        page: 1,
        limit: 20,
        sortOrder: 'desc' as const,
      },
    };
  }
  
  return validation;
}

/**
 * 검색 파라미터 정리 (XSS 방지)
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/<[^>]*>/g, '') // HTML 태그 제거
    .replace(/[<>&"']/g, '') // 특수 문자 제거
    .substring(0, 200); // 길이 제한
}

// ===========================================
// 타입 추론 헬퍼
// ===========================================

export type ValidatedData<T extends z.ZodSchema> = z.infer<T>;
export type CreatorStats = ValidatedData<typeof CreatorDashboardStatsSchema>;
export type BusinessStats = ValidatedData<typeof BusinessDashboardStatsSchema>;
export type AdminStats = ValidatedData<typeof AdminDashboardStatsSchema>;
export type MonthlyStats = ValidatedData<typeof MonthlyStatsSchema>;
export type QueryOptions = ValidatedData<typeof QueryOptionsSchema>;
export type CampaignQueryOptions = ValidatedData<typeof CampaignQueryOptionsSchema>;
export type CreatorQueryOptions = ValidatedData<typeof CreatorQueryOptionsSchema>;
export type DashboardError = ValidatedData<typeof DashboardErrorSchema>;

// 상수 내보내기 (다른 곳에서 재사용)
export const VALIDATION_LIMITS = {
  DISPLAY_NAME_MAX: 100,
  BIO_MAX: 500,
  CAMPAIGN_TITLE_MAX: 200,
  CAMPAIGN_DESCRIPTION_MAX: 2000,
  MESSAGE_MAX: 1000,
  SEARCH_QUERY_MAX: 200,
  PAGE_LIMIT_MAX: 100,
  REFERRAL_CODE_MIN: 6,
  REFERRAL_CODE_MAX: 20,
} as const;
/**
 * Supabase 유틸리티 타입 정의
 * 데이터베이스 스키마를 기반으로 한 헬퍼 타입들
 */

import type { Database } from '@/types/database.types';

// Re-export Database type for convenience
export type { Database } from '@/types/database.types';

// 기본 테이블 타입들
export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];

// Row 타입 헬퍼 (기본 조회용)
export type Row<T extends keyof Tables> = Tables[T]['Row'];
export type Insert<T extends keyof Tables> = Tables[T]['Insert'];
export type Update<T extends keyof Tables> = Tables[T]['Update'];

// 테이블별 타입 별칭 (실제 데이터베이스 테이블만)
export type Profile = Row<'profiles'>;
export type Campaign = Row<'campaigns'>;
export type CampaignApplication = Row<'campaign_applications'>;
export type Payment = Row<'payments'>;
export type ReferralEarning = Row<'referral_earnings'>;

// Insert 타입 별칭
export type ProfileInsert = Insert<'profiles'>;
export type CampaignInsert = Insert<'campaigns'>;
export type CampaignApplicationInsert = Insert<'campaign_applications'>;
export type PaymentInsert = Insert<'payments'>;
export type ReferralEarningInsert = Insert<'referral_earnings'>;

// Update 타입 별칭
export type ProfileUpdate = Update<'profiles'>;
export type CampaignUpdate = Update<'campaigns'>;
export type CampaignApplicationUpdate = Update<'campaign_applications'>;
export type PaymentUpdate = Update<'payments'>;
export type ReferralEarningUpdate = Update<'referral_earnings'>;

// Enum 타입 별칭
export type UserRole = Enums['user_role'];
export type CampaignStatus = Enums['campaign_status'];
export type ApplicationStatus = Enums['application_status'];
export type PaymentStatus = Enums['payment_status'];

// 확장된 타입들 (조인된 데이터)
export interface ProfileWithRole extends Profile {
  role: UserRole;
}

export interface CampaignWithCreator extends Campaign {
  creator?: Profile;
  applications_count?: number;
  selected_creators_count?: number;
}

export interface CampaignApplicationWithDetails extends CampaignApplication {
  campaign: Campaign;
  creator: Profile;
}

export interface ReferralEarningWithDetails extends ReferralEarning {
  referrer: Profile;
  referred: Profile;
  campaign?: Campaign;
}

export interface PaymentWithDetails extends Payment {
  campaign?: Campaign;
  user: Profile;
}

// 추천 관계 타입
export interface ReferralChain {
  level_1?: Profile;
  level_2?: Profile;
  level_3?: Profile;
}

export interface ProfileWithReferrals extends Profile {
  referral_chain: ReferralChain;
  referred_users_l1?: Profile[];
  referred_users_l2?: Profile[];
  referred_users_l3?: Profile[];
  total_referral_earnings?: number;
}

// API 응답 타입들
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 쿼리 옵션 타입들
export interface QueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

export interface CampaignQueryOptions extends QueryOptions {
  status?: CampaignStatus;
  category?: string;
  minBudget?: number;
  maxBudget?: number;
  businessId?: string;
}

export interface CreatorQueryOptions extends QueryOptions {
  category?: string;
  minFollowers?: number;
  maxFollowers?: number;
  platform?: string;
  verified?: boolean;
}

// 대시보드 통계 타입들
export interface CreatorDashboardStats {
  totalEarnings: number;
  monthlyEarnings: number;
  activeCampaigns: number;
  completedCampaigns: number;
  pendingApplications: number;
  successRate: number;
  totalReferralEarnings: number;
}

export interface BusinessDashboardStats {
  totalSpent: number;
  monthlySpent: number;
  activeCampaigns: number;
  completedCampaigns: number;
  totalApplications: number;
  selectedCreators: number;
  avgCampaignBudget: number;
}

export interface AdminDashboardStats {
  totalUsers: number;
  monthlyUsers: number;
  totalCampaigns: number;
  monthlyCampaigns: number;
  totalPayments: number;
  monthlyPayments: number;
  pendingApprovals: number;
  totalReferralEarnings: number;
}

// 에러 타입들
export interface SupabaseError {
  message: string;
  code: string;
  details?: any;
  hint?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiError extends SupabaseError {
  status: number;
  statusText: string;
  validationErrors?: ValidationError[];
}

// 파일 업로드 타입들
export interface FileUploadResult {
  url: string;
  path: string;
  size: number;
  type: string;
  name: string;
}

export interface FileUploadOptions {
  maxSize?: number; // bytes
  allowedTypes?: string[];
  folder?: string;
  makePublic?: boolean;
}

// 실시간 구독 타입들
export interface RealtimePayload<T = any> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T;
  schema: string;
  table: string;
  commit_timestamp: string;
}

export interface RealtimeSubscription {
  id: string;
  unsubscribe: () => void;
}

// 페이지 빌더 타입들 (향후 구현 예정)
export interface PageBlockData {
  id: string;
  type: string;
  content: Record<string, any>;
  style: Record<string, any>;
  order: number;
}

export interface PageTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  spacing: Record<string, string>;
}

// 캠페인 매칭 타입들
export interface MatchingCriteria {
  categories: string[];
  minFollowers: number;
  maxFollowers?: number;
  platforms: string[];
  demographics?: {
    ageRange?: [number, number];
    gender?: string;
    location?: string[];
  };
  budget: {
    min: number;
    max: number;
  };
}

export interface CreatorMatch {
  creator: Profile;
  matchScore: number;
  reasons: string[];
  estimatedReach: number;
  estimatedEngagement: number;
}

// 결제 관련 타입들
export interface PaymentInfo {
  amount: number;
  currency: string;
  method: 'card' | 'bank_transfer' | 'toss_pay';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  transactionId?: string;
  paidAt?: string;
}

export interface CommissionCalculation {
  baseAmount: number;
  platformFee: number;
  referralBonus?: {
    level1: number;
    level2: number;
    level3: number;
  };
  totalPayout: number;
}

// 유틸리티 타입들
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };

// 타입 가드 함수들
export function isProfile(obj: any): obj is Profile {
  return obj && typeof obj.id === 'string' && typeof obj.email === 'string';
}

export function isCampaign(obj: any): obj is Campaign {
  return obj && typeof obj.id === 'string' && typeof obj.title === 'string';
}

export function isPayment(obj: any): obj is Payment {
  return obj && typeof obj.id === 'string' && typeof obj.user_id === 'string';
}

export function isReferralEarning(obj: any): obj is ReferralEarning {
  return obj && typeof obj.id === 'string' && typeof obj.referrer_id === 'string';
}

// 상수들
export const USER_ROLES: UserRole[] = ['creator', 'business', 'admin'];
export const CAMPAIGN_STATUSES: CampaignStatus[] = ['draft', 'active', 'paused', 'completed', 'cancelled'];
export const APPLICATION_STATUSES: ApplicationStatus[] = ['pending', 'approved', 'rejected', 'completed'];
export const PAYMENT_STATUSES: PaymentStatus[] = ['pending', 'completed', 'failed', 'refunded'];

export const DEFAULT_QUERY_LIMIT = 20;
export const MAX_QUERY_LIMIT = 100;
export const DEFAULT_PAGE_SIZE = 10;

// 테이블 이름 상수
export const TABLES = {
  PROFILES: 'profiles',
  CAMPAIGNS: 'campaigns',
  CAMPAIGN_APPLICATIONS: 'campaign_applications',
  PAYMENTS: 'payments',
  REFERRAL_EARNINGS: 'referral_earnings',
} as const;
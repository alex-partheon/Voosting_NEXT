import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';
import {
  AUTH_ROUTES,
  USER_ROLES,
  getRoleBasedRedirect,
  sanitizeRedirectUrl,
  getAuthErrorMessage,
  canAccessRoute,
  type UserRole as AuthUserRole
} from '@/lib/auth-constants';

type UserRole = Database['public']['Enums']['user_role'];
type Profile = Database['public']['Tables']['profiles']['Row'];

/**
 * 현재 인증된 사용자 정보 가져오기
 */
export async function getCurrentUser() {
  const supabase = await createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

/**
 * 현재 사용자의 프로필 정보 가져오기 (Supabase에서)
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return profile;
  } catch (error) {
    console.error('Error getting current profile:', error);
    return null;
  }
}

/**
 * 인증 필요 - 로그인하지 않은 경우 로그인 페이지로 리다이렉트
 * @param redirectTo - 인증 후 리다이렉트할 경로 (옵션)
 */
export async function requireAuth(redirectTo?: string) {
  const user = await getCurrentUser();

  if (!user) {
    // 리다이렉트 URL 검증 및 정리
    const safeRedirectUrl = redirectTo ? sanitizeRedirectUrl(redirectTo) : '';
    const loginUrl = safeRedirectUrl 
      ? `${AUTH_ROUTES.SIGN_IN}?redirectTo=${encodeURIComponent(safeRedirectUrl)}`
      : AUTH_ROUTES.SIGN_IN;
    
    redirect(loginUrl);
  }

  return user;
}

/**
 * 특정 역할 필요 - 권한이 없는 경우 접근 거부
 * @param requiredRoles - 필요한 역할 배열
 * @param pathname - 접근하려는 경로 (권한 체크용)
 */
export async function requireRole(requiredRoles: UserRole[], pathname?: string) {
  const user = await requireAuth(pathname);
  const profile = await getCurrentProfile();

  if (!profile) {
    const loginUrl = pathname 
      ? `${AUTH_ROUTES.SIGN_IN}?redirectTo=${encodeURIComponent(pathname)}`
      : AUTH_ROUTES.SIGN_IN;
    redirect(loginUrl);
  }

  // 역할 확인
  if (!requiredRoles.includes(profile.role)) {
    // 추가 권한 체크: canAccessRoute 활용
    if (pathname && canAccessRoute(profile.role as AuthUserRole, pathname)) {
      // 경로 접근은 가능하지만 역할이 다른 경우 (예: admin이 creator 페이지 접근)
      return { user, profile };
    }
    
    // 권한 없음 - 역할별 기본 대시보드로 리다이렉트
    const defaultRedirect = getRoleBasedRedirect(profile.role as AuthUserRole);
    redirect(`${defaultRedirect}?error=unauthorized`);
  }

  return { user, profile };
}

/**
 * 크리에이터 역할 필요
 */
export async function requireCreator() {
  return requireRole(['creator']);
}

/**
 * 비즈니스 역할 필요
 */
export async function requireBusiness() {
  return requireRole(['business']);
}

/**
 * 관리자 역할 필요
 */
export async function requireAdmin() {
  return requireRole(['admin']);
}

/**
 * 추천 코드로 추천인 정보 가져오기
 */
export async function getReferrerByCode(referralCode: string) {
  const supabase = await createServerClient();
  
  const { data: referrer, error } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('referral_code', referralCode)
    .single();

  if (error || !referrer) {
    return null;
  }

  return referrer;
}

/**
 * 추천 관계 설정
 * @param newUserId - 새 사용자 ID
 * @param referralCode - 추천 코드
 */
export async function setReferralRelationship(
  newUserId: string,
  referralCode: string,
): Promise<{
  success: boolean;
  error?: string;
  data?: Record<string, unknown>;
}> {
  const supabase = await createServerClient();

  try {
    // 입력 검증
    if (!newUserId || !referralCode) {
      return {
        success: false,
        error: getAuthErrorMessage('invalid_request'),
      };
    }

    // 추천인 찾기
    const { data: referrer, error: referrerError } = await supabase
      .from('profiles')
      .select('id, referrer_l1_id, referrer_l2_id')
      .eq('referral_code', referralCode)
      .single();

    if (referrerError || !referrer) {
      return {
        success: false,
        error: '유효하지 않은 추천 코드입니다.',
      };
    }

    // 자기 자신을 추천할 수 없음
    if (referrer.id === newUserId) {
      return {
        success: false,
        error: '자기 자신을 추천할 수 없습니다.',
      };
    }

    // 순환 참조 방지 (추천인의 추천 체인에 자신이 있는지 확인)
    if (referrer.referrer_l1_id === newUserId || 
        referrer.referrer_l2_id === newUserId) {
      return {
        success: false,
        error: '순환 추천 관계는 설정할 수 없습니다.',
      };
    }

    // 3단계 추천 체인 구성
    const updateData = {
      referrer_l1_id: referrer.id,
      referrer_l2_id: referrer.referrer_l1_id,
      referrer_l3_id: referrer.referrer_l2_id,
    };

    // 프로필 업데이트
    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', newUserId);

    if (updateError) {
      console.error('Error updating referral relationship:', updateError);
      return {
        success: false,
        error: getAuthErrorMessage('server_error'),
      };
    }

    return {
      success: true,
      data: updateData,
    };
  } catch (error) {
    console.error('Error in setReferralRelationship:', error);
    return {
      success: false,
      error: getAuthErrorMessage('server_error'),
    };
  }
}

/**
 * 추천 코드 생성 (사용자 ID 기반)
 */
export function generateReferralCode(userId: string): string {
  // 사용자 ID의 앞 8자리를 사용하여 추천 코드 생성
  const cleanId = userId.replace(/-/g, '').toUpperCase();
  return `VT${cleanId.substring(0, 6)}`;
}

/**
 * 사용자 역할 업데이트
 * @param userId - 사용자 ID
 * @param role - 새 역할
 */
export async function updateUserRole(
  userId: string, 
  role: UserRole
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient();

  // 입력 검증
  if (!userId || !role) {
    return { 
      success: false, 
      error: getAuthErrorMessage('invalid_request') 
    };
  }

  // 유효한 역할인지 확인
  const validRoles = Object.values(USER_ROLES) as UserRole[];
  if (!validRoles.includes(role)) {
    return { 
      success: false, 
      error: '유효하지 않은 역할입니다.' 
    };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user role:', error);
    return { 
      success: false, 
      error: getAuthErrorMessage('server_error') 
    };
  }

  return { success: true };
}

/**
 * 사용자 로그아웃 처리
 * @param redirectTo - 로그아웃 후 리다이렉트할 경로
 */
export async function signOut(redirectTo?: string) {
  const supabase = await createServerClient();
  
  // 세션 종료
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error signing out:', error);
  }
  
  // 안전한 리다이렉트 URL 처리
  const safeRedirectUrl = redirectTo ? sanitizeRedirectUrl(redirectTo) : '/';
  redirect(safeRedirectUrl);
}

/**
 * 현재 사용자의 역할 확인
 * @param allowedRoles - 허용된 역할 배열
 */
export async function hasRole(allowedRoles: UserRole[]): Promise<boolean> {
  const profile = await getCurrentProfile();
  
  if (!profile) {
    return false;
  }
  
  return allowedRoles.includes(profile.role);
}

/**
 * 세션 갱신
 */
export async function refreshSession() {
  const supabase = await createServerClient();
  
  const { data: { session }, error } = await supabase.auth.refreshSession();
  
  if (error) {
    console.error('Error refreshing session:', error);
    return { success: false, error: getAuthErrorMessage('session_expired') };
  }
  
  return { success: true, session };
}
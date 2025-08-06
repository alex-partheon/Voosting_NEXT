import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';

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
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return user;
}

/**
 * 특정 역할 필요 - 권한이 없는 경우 접근 거부
 */
export async function requireRole(requiredRoles: UserRole[]) {
  const user = await requireAuth();
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/sign-in');
  }

  if (!requiredRoles.includes(profile.role)) {
    redirect('/unauthorized');
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
        error: '추천 관계 설정 중 오류가 발생했습니다.',
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
      error: '추천 관계 설정 중 오류가 발생했습니다.',
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
 */
export async function updateUserRole(userId: string, role: UserRole) {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user role:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
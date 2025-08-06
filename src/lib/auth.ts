import { redirect } from 'next/navigation';
import { createServerSupabaseClient, getCurrentUser, getCurrentProfile, getUserRole } from '@/lib/supabase/auth-server';
import type { Database } from '@/types/supabase';

type UserRole = Database['public']['Enums']['user_role'];
type Profile = Database['public']['Tables']['profiles']['Row'];

/**
 * 현재 인증된 사용자 정보 가져오기
 */
export async function getUser() {
  const user = await getCurrentUser();
  return user;
}

/**
 * 현재 사용자의 프로필 정보 가져오기 (Supabase에서)
 */
export async function getProfile(): Promise<Profile | null> {
  const profile = await getCurrentProfile();
  return profile;
}

/**
 * 인증이 필요한 페이지에서 사용하는 함수
 */
export async function requireAuth(redirectTo?: string) {
  const user = await getCurrentUser();

  if (!user) {
    const redirectUrl = redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : '';
    redirect(`/auth/sign-in${redirectUrl}`);
  }

  return user;
}

/**
 * 특정 역할이 필요한 페이지에서 사용하는 함수
 */
export async function requireRole(requiredRole: UserRole | UserRole[], redirectTo?: string) {
  const profile = await getCurrentProfile();

  if (!profile) {
    const redirectUrl = redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : '';
    redirect(`/auth/sign-in${redirectUrl}`);
  }

  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  if (!allowedRoles.includes(profile.role as UserRole)) {
    redirect('/unauthorized');
  }

  return profile;
}

/**
 * 사용자 프로필 생성 또는 업데이트
 */
export async function upsertUserProfile(
  userId: string,
  userData: {
    email: string;
    fullName?: string;
    role?: UserRole;
    referralCode?: string;
  },
): Promise<Profile | null> {
  try {
    const supabase = await createServerSupabaseClient();
    
    // 추천 코드가 있다면 추천 관계 설정
    let referralData = {};
    if (userData.referralCode) {
      const { setReferralRelationship } = await import('@/lib/supabase/auth-server');
      const referralResult = await setReferralRelationship(userId, userData.referralCode);
      if (referralResult.success) {
        referralData = referralResult.data || {};
      }
    }

    const { generateReferralCode } = await import('@/lib/supabase/auth-server');
    const { data: profile, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: userData.email,
        full_name: userData.fullName || null,
        role: userData.role || 'creator',
        referral_code: generateReferralCode(userId),
        ...referralData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting profile:', error);
      return null;
    }

    return profile;
  } catch (error) {
    console.error('Error upserting user profile:', error);
    return null;
  }
}

/**
 * 사용자 역할 확인 함수들
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole | UserRole[]): boolean {
  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return allowedRoles.includes(userRole);
}

export function isAdmin(userRole: UserRole): boolean {
  return userRole === 'admin';
}

export function isCreator(userRole: UserRole): boolean {
  return userRole === 'creator';
}

export function isBusiness(userRole: UserRole): boolean {
  return userRole === 'business';
}

// Backward compatibility exports
export { getCurrentUser, getCurrentProfile, getUserRole, generateReferralCode, setReferralRelationship } from '@/lib/supabase/auth-server';
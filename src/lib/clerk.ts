import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Supabase 클라이언트 (데이터베이스 전용)
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

type UserRole = Database['public']['Enums']['user_role'];
type Profile = Database['public']['Tables']['profiles']['Row'];

/**
 * 현재 인증된 사용자 정보 가져오기
 */
export async function getCurrentUser() {
  const user = await currentUser();
  return user;
}

/**
 * 현재 사용자의 프로필 정보 가져오기 (Supabase에서)
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await currentUser();

  if (!user) {
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
 * 인증이 필요한 페이지에서 사용하는 함수
 */
export async function requireAuth(redirectTo?: string) {
  const { userId } = await auth();

  if (!userId) {
    const redirectUrl = redirectTo ? `?redirect_url=${encodeURIComponent(redirectTo)}` : '';
    redirect(`/sign-in${redirectUrl}`);
  }

  return userId;
}

/**
 * 특정 역할이 필요한 페이지에서 사용하는 함수
 */
export async function requireRole(requiredRole: UserRole | UserRole[], redirectTo?: string) {
  const profile = await getCurrentProfile();

  if (!profile) {
    const redirectUrl = redirectTo ? `?redirect_url=${encodeURIComponent(redirectTo)}` : '';
    redirect(`/sign-in${redirectUrl}`);
  }

  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  if (!allowedRoles.includes(profile.role)) {
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
    // 추천 코드가 있다면 추천 관계 설정
    let referralData = {};
    if (userData.referralCode) {
      const referralResult = await setReferralRelationship(userId, userData.referralCode);
      if (referralResult.success) {
        referralData = referralResult.data || {};
      }
    }

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
 * 추천 코드 생성 함수
 */
export function generateReferralCode(userId: string): string {
  const userPart = userId.slice(-6).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${userPart}${randomPart}`;
}

/**
 * 추천 관계 설정 함수
 */
export async function setReferralRelationship(
  newUserId: string,
  referralCode: string,
): Promise<{ success: boolean; error?: string; data?: Record<string, unknown> }> {
  try {
    // 추천 코드로 추천인 찾기
    const { data: referrer, error: referrerError } = await supabase
      .from('profiles')
      .select('id, referrer_l1_id, referrer_l2_id')
      .eq('referral_code', referralCode)
      .single();

    if (referrerError || !referrer) {
      return { success: false, error: 'Invalid referral code' };
    }

    // 3단계 추천 관계 설정
    const updateData: {
      referrer_l1_id: string;
      referrer_l2_id?: string | null;
      referrer_l3_id?: string | null;
    } = {
      referrer_l1_id: referrer.id,
    };

    // 2단계 추천인이 있다면 설정
    if (referrer.referrer_l1_id) {
      updateData.referrer_l2_id = referrer.referrer_l1_id;
    }

    // 3단계 추천인이 있다면 설정
    if (referrer.referrer_l2_id) {
      updateData.referrer_l3_id = referrer.referrer_l2_id;
    }

    return { success: true, data: updateData };
  } catch (error) {
    console.error('Error setting referral relationship:', error);
    return { success: false, error: 'An unexpected error occurred' };
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

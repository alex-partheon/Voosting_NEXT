/**
 * Supabase 인증 관련 함수들
 * 실제 구현을 위한 파일
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

// Supabase 클라이언트 생성
const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * 이메일/비밀번호로 로그인
 */
export async function signIn(email: string, password: string) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

/**
 * 이메일/비밀번호로 회원가입
 */
export async function signUp(email: string, password: string, metadata?: Record<string, any>) {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
}

/**
 * 로그아웃
 */
export async function signOut() {
  return await supabase.auth.signOut();
}

/**
 * OAuth 로그인
 */
export async function signInWithOAuth(provider: 'google' | 'github' | 'kakao') {
  return await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

/**
 * 비밀번호 재설정
 */
export async function resetPassword(email: string) {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
}

/**
 * 현재 사용자 가져오기
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * 세션 갱신
 */
export async function refreshSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    return await supabase.auth.refreshSession();
  }
  return null;
}
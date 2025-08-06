/**
 * Supabase 클라이언트 사이드 인증 헬퍼
 * 클라이언트 컴포넌트에서 사용 가능
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// 클라이언트 사이드 Supabase 클라이언트
export const supabaseClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// OAuth 로그인
export async function signInWithOAuth(provider: 'google' | 'github' | 'kakao') {
  const { data, error } = await supabaseClient.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// 로그아웃
export async function signOut() {
  const { error } = await supabaseClient.auth.signOut()
  
  if (error) {
    throw new Error(error.message)
  }
}

// 비밀번호 재설정
export async function resetPassword(email: string) {
  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  })

  if (error) {
    throw new Error(error.message)
  }
}

// 현재 사용자 가져오기 (클라이언트)
export async function getCurrentUser() {
  const { data: { user }, error } = await supabaseClient.auth.getUser()
  
  if (error) {
    console.error('Error getting current user:', error)
    return null
  }

  if (!user) {
    return null
  }

  // 프로필 정보 함께 조회
  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return {
    id: user.id,
    email: user.email!,
    profile: profile || null,
  }
}

// 추천 코드 생성 함수
export function generateReferralCode(userId: string): string {
  const userPart = userId.slice(-6).toUpperCase()
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${userPart}${randomPart}`
}

// 사용자 역할 확인 함수들
export function hasRole(userRole: string, requiredRole: string | string[]): boolean {
  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  return allowedRoles.includes(userRole)
}

export function isAdmin(userRole: string): boolean {
  return userRole === 'admin'
}

export function isCreator(userRole: string): boolean {
  return userRole === 'creator'
}

export function isBusiness(userRole: string): boolean {
  return userRole === 'business'
}
/**
 * Supabase 서버 사이드 인증 헬퍼
 * 서버 컴포넌트, API 라우트, 미들웨어에서 사용
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

// 서버 사이드 Supabase 클라이언트 (쿠키 지원)
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

// 미들웨어용 Supabase 클라이언트
export function createMiddlewareSupabaseClient(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  return { supabase, response }
}

// 현재 사용자 정보 조회 (서버)
export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    // 프로필 정보 함께 조회
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return {
      id: user.id,
      email: user.email!,
      profile: profile || null,
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// 사용자 역할 확인
export async function getUserRole(): Promise<'creator' | 'business' | 'admin' | null> {
  const user = await getCurrentUser()
  return user?.profile?.role || null
}

// 인증 필요 페이지 보호
export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return user
}

// 특정 역할 필요 페이지 보호
export async function requireRole(role: 'creator' | 'business' | 'admin') {
  const user = await requireAuth()
  
  if (user.profile?.role !== role) {
    throw new Error(`Role ${role} required`)
  }
  
  return user
}

// 회원가입
export async function signUp(
  email: string,
  password: string,
  options: {
    role: 'creator' | 'business'
    full_name?: string
    referred_by?: string
  }
) {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: options.role,
        full_name: options.full_name,
        referred_by: options.referred_by,
      }
    }
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// 로그인
export async function signIn(email: string, password: string) {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// 프로필 생성/업데이트 (회원가입 시)
export async function createOrUpdateProfile(
  userId: string,
  profileData: {
    email: string
    role: 'creator' | 'business' | 'admin'
    full_name?: string
    referral_code?: string
    referred_by?: string
  }
) {
  const supabase = await createServerSupabaseClient()
  
  const profileToUpsert = {
    id: userId,
    email: profileData.email,
    role: profileData.role,
    full_name: profileData.full_name || profileData.email.split('@')[0],
    referral_code: profileData.referral_code || generateReferralCode(userId),
    updated_at: new Date().toISOString(),
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profileToUpsert)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create profile: ${error.message}`)
  }

  return data
}

// 현재 사용자의 프로필 정보 가져오기
export async function getCurrentProfile() {
  const user = await getCurrentUser()
  return user?.profile || null
}

// 추천 코드 생성 함수
export function generateReferralCode(userId: string): string {
  const userPart = userId.slice(-6).toUpperCase()
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${userPart}${randomPart}`
}

// 추천 관계 설정 함수
export async function setReferralRelationship(
  newUserId: string,
  referralCode: string,
): Promise<{ success: boolean; error?: string; data?: Record<string, unknown> }> {
  try {
    const supabase = await createServerSupabaseClient()
    
    // 추천 코드로 추천인 찾기
    const { data: referrer, error: referrerError } = await supabase
      .from('profiles')
      .select('id, referrer_l1_id, referrer_l2_id')
      .eq('referral_code', referralCode)
      .single()

    if (referrerError || !referrer) {
      return { success: false, error: 'Invalid referral code' }
    }

    // 3단계 추천 관계 설정
    const updateData: {
      referrer_l1_id: string
      referrer_l2_id?: string | null
      referrer_l3_id?: string | null
    } = {
      referrer_l1_id: referrer.id,
    }

    // 2단계 추천인이 있다면 설정
    if (referrer.referrer_l1_id) {
      updateData.referrer_l2_id = referrer.referrer_l1_id
    }

    // 3단계 추천인이 있다면 설정
    if (referrer.referrer_l2_id) {
      updateData.referrer_l3_id = referrer.referrer_l2_id
    }

    return { success: true, data: updateData }
  } catch (error) {
    console.error('Error setting referral relationship:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
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
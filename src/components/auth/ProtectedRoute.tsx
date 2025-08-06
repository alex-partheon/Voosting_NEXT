'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './supabase-auth-provider'
import { Loader2 } from 'lucide-react'
import type { Database } from '@/types/supabase'

type UserRole = Database['public']['Tables']['profiles']['Row']['role']

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  redirectTo = '/auth/sign-in' 
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // 사용자가 로그인하지 않은 경우
      if (!user) {
        const currentPath = window.location.pathname
        const redirectUrl = `${redirectTo}?redirectTo=${encodeURIComponent(currentPath)}`
        router.push(redirectUrl)
        return
      }

      // 프로필이 없는 경우 (데이터 생성 대기)
      if (!profile) {
        console.warn('User exists but profile not found')
        return
      }

      // 특정 역할이 필요한 경우 권한 확인
      if (requiredRole && profile.role !== requiredRole) {
        // 역할에 따른 기본 대시보드로 리다이렉트
        const roleRedirectMap = {
          creator: '/creator/dashboard',
          business: '/business/dashboard',
          admin: '/admin/dashboard',
        }
        
        const defaultPath = roleRedirectMap[profile.role] || '/dashboard'
        router.push(defaultPath)
        return
      }
    }
  }, [user, profile, loading, requiredRole, redirectTo, router])

  // 로딩 중일 때 스피너 표시
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">인증 상태 확인 중...</p>
        </div>
      </div>
    )
  }

  // 사용자가 없거나 권한이 없는 경우 빈 화면 (리다이렉트 진행 중)
  if (!user || (requiredRole && profile?.role !== requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">페이지 이동 중...</p>
        </div>
      </div>
    )
  }

  // 모든 조건을 만족하는 경우 컨텐츠 렌더링
  return <>{children}</>
}

// HOC 버전 (Higher-Order Component)
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: UserRole
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute requiredRole={requiredRole}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}

// 페이지 래퍼 버전
export function createProtectedPage<P extends object>(
  PageComponent: React.ComponentType<P>,
  requiredRole?: UserRole
) {
  return function ProtectedPage(props: P) {
    return (
      <ProtectedRoute requiredRole={requiredRole}>
        <PageComponent {...props} />
      </ProtectedRoute>
    )
  }
}

// 역할 확인 훅
export function useRequireAuth(requiredRole?: UserRole) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/sign-in')
    }
    
    if (!loading && user && requiredRole && profile?.role !== requiredRole) {
      router.push('/dashboard') // 또는 적절한 기본 페이지
    }
  }, [user, profile, loading, requiredRole, router])

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    hasRequiredRole: !requiredRole || profile?.role === requiredRole,
  }
}
"use client"

/**
 * 대시보드 컴포넌트 데모
 * 업데이트된 AppSidebar, NavUser, SiteHeader 컴포넌트의 사용법을 보여주는 예시
 */

import { AppSidebar } from "@/components/app-sidebar"
import { NavUser } from "@/components/nav-user"
import { SiteHeader } from "@/components/site-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useSupabase } from "@/hooks/use-supabase"
import { getDomainType, type DomainType } from "@/lib/middleware-utils"
import { useEffect, useState } from "react"

interface DashboardDemoProps {
  domain?: DomainType
  title?: string
}

export function DashboardDemo({ domain, title }: DashboardDemoProps) {
  const { profile, isAuthenticated, isLoading } = useSupabase()
  const [currentDomain, setCurrentDomain] = useState<DomainType>('main')

  // 도메인 타입 감지
  useEffect(() => {
    if (domain) {
      setCurrentDomain(domain)
    } else if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      setCurrentDomain(getDomainType(hostname))
    }
  }, [domain])

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar domain={currentDomain} />
      <SidebarInset>
        <SiteHeader 
          title={title}
          domain={currentDomain}
          showSearch={isAuthenticated}
          showNotifications={isAuthenticated}
        />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50 p-6">
              <h3 className="text-lg font-semibold mb-2">도메인 정보</h3>
              <p className="text-sm text-muted-foreground">
                현재 도메인: {currentDomain}
              </p>
              <p className="text-sm text-muted-foreground">
                사용자 역할: {profile?.role || '없음'}
              </p>
            </div>
            <div className="aspect-video rounded-xl bg-muted/50 p-6">
              <h3 className="text-lg font-semibold mb-2">인증 상태</h3>
              <p className="text-sm text-muted-foreground">
                로그인 상태: {isAuthenticated ? '로그인됨' : '로그인 안됨'}
              </p>
              <p className="text-sm text-muted-foreground">
                사용자 이메일: {profile?.email || '없음'}
              </p>
            </div>
            <div className="aspect-video rounded-xl bg-muted/50 p-6">
              <h3 className="text-lg font-semibold mb-2">기능</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 도메인별 네비게이션</li>
                <li>• Supabase Auth 통합</li>
                <li>• 한국어 현지화</li>
                <li>• 테마 시스템</li>
              </ul>
            </div>
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 p-6">
            <h2 className="text-xl font-semibold mb-4">업데이트된 컴포넌트 특징</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">AppSidebar</h3>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• 도메인별 맞춤형 메뉴 (creator, business, admin)</li>
                  <li>• Supabase 사용자 프로필 통합</li>
                  <li>• 동적 브랜딩 및 URL 설정</li>
                  <li>• 한국어 메뉴 라벨</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">NavUser</h3>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Supabase Auth 로그아웃 기능</li>
                  <li>• 도메인별 메뉴 아이템</li>
                  <li>• 테마 설정 서브메뉴</li>
                  <li>• 사용자 역할 표시</li>
                  <li>• 한국어 UI</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">SiteHeader</h3>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• 동적 브레드크럼 생성</li>
                  <li>• 검색 기능 통합</li>
                  <li>• 알림 시스템</li>
                  <li>• 테마 전환 버튼</li>
                  <li>• 반응형 디자인</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

/**
 * 사용 예시:
 * 
 * // 기본 사용법
 * <DashboardDemo />
 * 
 * // 특정 도메인으로 사용
 * <DashboardDemo domain="creator" />
 * 
 * // 커스텀 제목과 함께
 * <DashboardDemo domain="business" title="비즈니스 대시보드" />
 */
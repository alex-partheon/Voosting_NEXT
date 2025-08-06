"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import {
  IconChevronRight,
  IconMoon,
  IconSun,
  IconBell,
  IconSearch,
  IconUserCircle,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useSupabase } from "@/hooks/use-supabase"
import { useTheme } from "@/hooks/use-theme"
import { getDomainType, type DomainType } from "@/lib/middleware-utils"

interface SiteHeaderProps {
  title?: string
  domain?: DomainType
  showSearch?: boolean
  showNotifications?: boolean
}

export function SiteHeader({ 
  title, 
  domain,
  showSearch = true,
  showNotifications = true 
}: SiteHeaderProps) {
  const pathname = usePathname()
  const { isAuthenticated } = useSupabase()
  const { theme, setTheme } = useTheme()
  const [domainType, setDomainType] = useState<DomainType>('main')
  const [searchQuery, setSearchQuery] = useState('')
  const [notificationCount] = useState(3) // 예시 데이터

  // 도메인 타입 감지
  useEffect(() => {
    if (domain) {
      setDomainType(domain)
    } else if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      setDomainType(getDomainType(hostname))
    }
  }, [domain])

  // 브레드크럼 생성
  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: Array<{ label: string; href?: string; isActive?: boolean }> = []

    // 도메인별 홈 브레드크럼
    const homeLabels: Record<DomainType, string> = {
      main: '홈',
      creator: '크리에이터',
      business: '비즈니스',
      admin: '관리자',
    }

    const homeHrefs: Record<DomainType, string> = {
      main: '/',
      creator: '/creator/dashboard',
      business: '/business/dashboard', 
      admin: '/admin/dashboard',
    }

    // 홈 브레드크럼 추가
    if (segments.length > 0) {
      breadcrumbs.push({
        label: homeLabels[domainType],
        href: homeHrefs[domainType],
      })
    }

    // 경로 세그먼트 처리
    const pathLabels: Record<string, string> = {
      // 공통
      dashboard: '대시보드',
      settings: '설정',
      profile: '프로필',
      help: '도움말',
      notifications: '알림',
      
      // 크리에이터
      campaigns: '캠페인',
      content: '콘텐츠',
      earnings: '수익',
      referrals: '추천',
      analytics: '분석',
      templates: '템플릿',
      messages: '메시지',
      reviews: '리뷰',
      guides: '가이드',
      contracts: '계약서',
      taxes: '세금',
      
      // 비즈니스
      creators: '크리에이터',
      payments: '결제',
      brands: '브랜드',
      targeting: '타겟팅',
      relationships: '관계관리',
      negotiations: '협상',
      support: '지원',
      calculator: '계산기',
      'marketing-guides': '마케팅가이드',
      'contract-templates': '계약템플릿',
      budget: '예산',
      company: '회사정보',
      billing: '결제관리',
      insights: '인사이트',
      
      // 관리자
      users: '사용자',
      commissions: '수수료',
      approvals: '승인대기',
      reports: '신고관리',
      system: '시스템',
      security: '보안',
      notices: '공지사항',
      faq: 'FAQ',
      search: '검색',
      data: '데이터',
      policies: '정책',
      'admin-settings': '관리자설정',
    }

    let currentPath = ''
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isLast = index === segments.length - 1
      
      // 도메인 세그먼트 제외
      if (['creator', 'business', 'admin'].includes(segment) && index === 0) {
        return
      }
      
      breadcrumbs.push({
        label: pathLabels[segment] || segment,
        href: isLast ? undefined : currentPath,
        isActive: isLast,
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()
  const pageTitle = title || breadcrumbs[breadcrumbs.length - 1]?.label || '홈'

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        
        {/* 브레드크럼 */}
        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            {breadcrumbs.map((breadcrumb, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && (
                  <BreadcrumbSeparator>
                    <IconChevronRight className="h-4 w-4" />
                  </BreadcrumbSeparator>
                )}
                <BreadcrumbItem>
                  {breadcrumb.isActive || !breadcrumb.href ? (
                    <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={breadcrumb.href}>
                      {breadcrumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        
        {/* 모바일에서는 현재 페이지 제목만 표시 */}
        <h1 className="md:hidden text-base font-medium truncate">{pageTitle}</h1>
        
        {/* 더 많은 공간을 위해 오른쪽으로 이동 */}
        <div className="ml-auto flex items-center gap-2">
          {/* 검색 (데스크톱에서만) */}
          {showSearch && isAuthenticated && (
            <div className="hidden lg:flex items-center">
              <div className="relative">
                <IconSearch className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          )}
          
          {/* 모바일 검색 버튼 */}
          {showSearch && isAuthenticated && (
            <Button variant="ghost" size="sm" className="lg:hidden">
              <IconSearch className="h-4 w-4" />
            </Button>
          )}
          
          {/* 알림 */}
          {showNotifications && isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <IconBell className="h-4 w-4" />
                  {notificationCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                    >
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-4">
                  <h4 className="font-medium text-sm">알림</h4>
                  <p className="text-xs text-muted-foreground">
                    새로운 알림 {notificationCount}개
                  </p>
                </div>
                <DropdownMenuItem>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">새로운 캠페인 요청</p>
                    <p className="text-xs text-muted-foreground">2시간 전</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">수익 정산 완료</p>
                    <p className="text-xs text-muted-foreground">1일 전</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">시스템 업데이트</p>
                    <p className="text-xs text-muted-foreground">3일 전</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* 테마 전환 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                {theme === 'dark' ? (
                  <IconMoon className="h-4 w-4" />
                ) : (
                  <IconSun className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <IconSun className="mr-2 h-4 w-4" />
                라이트
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <IconMoon className="mr-2 h-4 w-4" />
                다크
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <IconUserCircle className="mr-2 h-4 w-4" />
                시스템
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* 비로그인 상태일 때 로그인 버튼 */}
          {!isAuthenticated && (
            <Button size="sm" asChild>
              <a href="/auth/sign-in">로그인</a>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconBrandInstagram,
  IconCoin,
  IconTargetArrow,
  IconBuildingBank,
  IconGift,
  IconUsersGroup,
  IconMessages,
  IconStar,
  IconAnalyze,
  IconShield,
  IconTools,
  IconPalette,
  IconBulb,
  IconTrendingUp,
  IconHeart,
  IconCash,
  IconCalendar,
  IconClipboardList,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useSupabase } from "@/hooks/use-supabase"
import { getDomainType, type DomainType } from "@/lib/middleware-utils"

// 도메인별 네비게이션 메뉴 구성
const getNavigationData = (domainType: DomainType, userProfile: any) => {
  const baseUser = {
    name: userProfile?.full_name || userProfile?.email || "사용자",
    email: userProfile?.email || "",
    avatar: userProfile?.avatar_url || "/avatars/default.jpg",
  }

  switch (domainType) {
    case 'creator':
      return {
        user: baseUser,
        brandName: "Voosting 크리에이터",
        brandUrl: "/creator/dashboard",
        navMain: [
          {
            title: "대시보드",
            url: "/creator/dashboard",
            icon: IconDashboard,
          },
          {
            title: "캠페인 참여",
            url: "/creator/campaigns",
            icon: IconTargetArrow,
          },
          {
            title: "콘텐츠 관리",
            url: "/creator/content",
            icon: IconBrandInstagram,
          },
          {
            title: "수익 내역",
            url: "/creator/earnings",
            icon: IconCoin,
          },
          {
            title: "추천 시스템",
            url: "/creator/referrals",
            icon: IconGift,
          },
        ],
        navClouds: [
          {
            title: "크리에이터 도구",
            icon: IconPalette,
            isActive: true,
            url: "#",
            items: [
              {
                title: "콘텐츠 템플릿",
                url: "/creator/templates",
              },
              {
                title: "성과 분석",
                url: "/creator/analytics",
              },
            ],
          },
          {
            title: "소통",
            icon: IconMessages,
            url: "#",
            items: [
              {
                title: "메시지",
                url: "/creator/messages",
              },
              {
                title: "리뷰 관리",
                url: "/creator/reviews",
              },
            ],
          },
        ],
        navSecondary: [
          {
            title: "프로필 설정",
            url: "/creator/profile",
            icon: IconSettings,
          },
          {
            title: "도움말 센터",
            url: "/creator/help",
            icon: IconHelp,
          },
          {
            title: "인사이트",
            url: "/creator/insights",
            icon: IconBulb,
          },
        ],
        documents: [
          {
            name: "가이드북",
            url: "/creator/guides",
            icon: IconFileDescription,
          },
          {
            name: "계약서 관리",
            url: "/creator/contracts",
            icon: IconFileWord,
          },
          {
            name: "세금 정보",
            url: "/creator/taxes",
            icon: IconDatabase,
          },
        ],
      }

    case 'business':
      return {
        user: baseUser,
        brandName: "Voosting 비즈니스",
        brandUrl: "/business/dashboard",
        navMain: [
          {
            title: "대시보드",
            url: "/business/dashboard",
            icon: IconDashboard,
          },
          {
            title: "캠페인 관리",
            url: "/business/campaigns",
            icon: IconListDetails,
          },
          {
            title: "크리에이터 검색",
            url: "/business/creators",
            icon: IconUsersGroup,
          },
          {
            title: "성과 분석",
            url: "/business/analytics",
            icon: IconChartBar,
          },
          {
            title: "결제 관리",
            url: "/business/payments",
            icon: IconBuildingBank,
          },
        ],
        navClouds: [
          {
            title: "마케팅 도구",
            icon: IconTrendingUp,
            isActive: true,
            url: "#",
            items: [
              {
                title: "브랜드 관리",
                url: "/business/brands",
              },
              {
                title: "타겟 분석",
                url: "/business/targeting",
              },
            ],
          },
          {
            title: "관계 관리",
            icon: IconHeart,
            url: "#",
            items: [
              {
                title: "크리에이터 관계",
                url: "/business/relationships",
              },
              {
                title: "협상 내역",
                url: "/business/negotiations",
              },
            ],
          },
        ],
        navSecondary: [
          {
            title: "회사 설정",
            url: "/business/settings",
            icon: IconSettings,
          },
          {
            title: "지원 센터",
            url: "/business/support",
            icon: IconHelp,
          },
          {
            title: "ROI 계산기",
            url: "/business/calculator",
            icon: IconAnalyze,
          },
        ],
        documents: [
          {
            name: "마케팅 가이드",
            url: "/business/marketing-guides",
            icon: IconFileDescription,
          },
          {
            name: "계약 템플릿",
            url: "/business/contract-templates",
            icon: IconFileWord,
          },
          {
            name: "예산 관리",
            url: "/business/budget",
            icon: IconCash,
          },
        ],
      }

    case 'admin':
      return {
        user: baseUser,
        brandName: "Voosting 관리자",
        brandUrl: "/admin/dashboard",
        navMain: [
          {
            title: "대시보드",
            url: "/admin/dashboard",
            icon: IconDashboard,
          },
          {
            title: "사용자 관리",
            url: "/admin/users",
            icon: IconUsers,
          },
          {
            title: "캠페인 관리",
            url: "/admin/campaigns",
            icon: IconListDetails,
          },
          {
            title: "수익 분석",
            url: "/admin/analytics",
            icon: IconChartBar,
          },
          {
            title: "수수료 정산",
            url: "/admin/commissions",
            icon: IconFileDescription,
          },
        ],
        navClouds: [
          {
            title: "플랫폼 관리",
            icon: IconCamera,
            isActive: true,
            url: "#",
            items: [
              {
                title: "승인 대기",
                url: "/admin/approvals",
              },
              {
                title: "신고 관리",
                url: "/admin/reports",
              },
            ],
          },
          {
            title: "시스템",
            icon: IconShield,
            url: "#",
            items: [
              {
                title: "시스템 상태",
                url: "/admin/system",
              },
              {
                title: "보안 설정",
                url: "/admin/security",
              },
            ],
          },
          {
            title: "콘텐츠",
            icon: IconFileAi,
            url: "#",
            items: [
              {
                title: "공지사항",
                url: "/admin/notices",
              },
              {
                title: "FAQ 관리",
                url: "/admin/faq",
              },
            ],
          },
        ],
        navSecondary: [
          {
            title: "관리 설정",
            url: "/admin/settings",
            icon: IconSettings,
          },
          {
            title: "도움말",
            url: "/admin/help",
            icon: IconHelp,
          },
          {
            title: "검색",
            url: "/admin/search",
            icon: IconSearch,
          },
        ],
        documents: [
          {
            name: "데이터 관리",
            url: "/admin/data",
            icon: IconDatabase,
          },
          {
            name: "정산 보고서",
            url: "/admin/reports",
            icon: IconReport,
          },
          {
            name: "정책 관리",
            url: "/admin/policies",
            icon: IconFileWord,
          },
        ],
      }

    default: // main domain
      return {
        user: baseUser,
        brandName: "Voosting",
        brandUrl: "/",
        navMain: [
          {
            title: "홈",
            url: "/",
            icon: IconDashboard,
          },
          {
            title: "크리에이터",
            url: "/creators",
            icon: IconStar,
          },
          {
            title: "서비스 안내",
            url: "/service",
            icon: IconFileDescription,
          },
          {
            title: "요금제",
            url: "/pricing",
            icon: IconCoin,
          },
        ],
        navClouds: [],
        navSecondary: [
          {
            title: "문의하기",
            url: "/contact",
            icon: IconMessages,
          },
          {
            title: "도움말",
            url: "/help",
            icon: IconHelp,
          },
        ],
        documents: [],
      }
  }
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  domain?: DomainType
}

export function AppSidebar({ domain, ...props }: AppSidebarProps) {
  const { profile, isLoading } = useSupabase()
  const [domainType, setDomainType] = useState<DomainType>('main')

  // 도메인 타입 감지
  useEffect(() => {
    if (domain) {
      setDomainType(domain)
    } else if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      setDomainType(getDomainType(hostname))
    }
  }, [domain])

  // 로딩 중이거나 프로필이 없는 경우 기본값 사용
  const navigationData = getNavigationData(domainType, isLoading ? null : profile)

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href={navigationData.brandUrl}>
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">{navigationData.brandName}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigationData.navMain} />
        {navigationData.navClouds.length > 0 && (
          <NavDocuments items={navigationData.documents} />
        )}
        <NavSecondary items={navigationData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navigationData.user} domainType={domainType} />
      </SidebarFooter>
    </Sidebar>
  )
}

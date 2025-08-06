"use client"

import { useState } from "react"
import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
  IconSettings,
  IconPalette,
  IconMoon,
  IconSun,
  IconUsers,
  IconShield,
  IconStar,
  IconBuildingBank,
  IconAnalyze,
} from "@tabler/icons-react"
import { useRouter } from "next/navigation"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useSupabase } from "@/hooks/use-supabase"
import { useTheme } from "@/hooks/use-theme"
import { type DomainType } from "@/lib/middleware-utils"

interface NavUserProps {
  user: {
    name: string
    email: string
    avatar: string
  }
  domainType?: DomainType
}

export function NavUser({ user, domainType = 'main' }: NavUserProps) {
  const { isMobile } = useSidebar()
  const { signOut, profile } = useSupabase()
  const { setTheme } = useTheme()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const router = useRouter()

  // 사용자 이니셜 생성
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'
  }

  // 로그아웃 처리
  const handleSignOut = async () => {
    if (isSigningOut) return
    
    setIsSigningOut(true)
    try {
      await signOut()
      router.push('/auth/sign-in')
    } catch (error) {
      console.error('로그아웃 오류:', error)
    } finally {
      setIsSigningOut(false)
    }
  }

  // 도메인별 메뉴 아이템 설정
  const getDomainMenuItems = () => {
    const baseItems = [
      {
        label: "계정 설정",
        icon: IconUserCircle,
        onClick: () => router.push(`/${domainType === 'main' ? '' : domainType + '/'}profile`),
      },
      {
        label: "알림 설정",
        icon: IconNotification,
        onClick: () => router.push(`/${domainType === 'main' ? '' : domainType + '/'}notifications`),
      },
    ]

    // 도메인별 추가 메뉴
    switch (domainType) {
      case 'creator':
        return [
          ...baseItems,
          {
            label: "크리에이터 프로필",
            icon: IconStar,
            onClick: () => router.push('/creator/profile'),
          },
          {
            label: "수익 정산",
            icon: IconCreditCard,
            onClick: () => router.push('/creator/earnings'),
          },
        ]
      case 'business':
        return [
          ...baseItems,
          {
            label: "회사 정보",
            icon: IconBuildingBank,
            onClick: () => router.push('/business/company'),
          },
          {
            label: "결제 관리",
            icon: IconCreditCard,
            onClick: () => router.push('/business/billing'),
          },
          {
            label: "비즈니스 인사이트",
            icon: IconAnalyze,
            onClick: () => router.push('/business/insights'),
          },
        ]
      case 'admin':
        return [
          ...baseItems,
          {
            label: "관리자 설정",
            icon: IconShield,
            onClick: () => router.push('/admin/admin-settings'),
          },
          {
            label: "사용자 관리",
            icon: IconUsers,
            onClick: () => router.push('/admin/users'),
          },
          {
            label: "시스템 관리",
            icon: IconSettings,
            onClick: () => router.push('/admin/system'),
          },
        ]
      default:
        return baseItems
    }
  }

  const menuItems = getDomainMenuItems()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {getUserInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {getUserInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                  {profile?.role && (
                    <span className="text-muted-foreground truncate text-xs font-medium">
                      {profile.role === 'creator' && '크리에이터'}
                      {profile.role === 'business' && '비즈니스'}
                      {profile.role === 'admin' && '관리자'}
                    </span>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {menuItems.map((item, index) => (
                <DropdownMenuItem key={index} onClick={item.onClick}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <IconPalette className="mr-2 h-4 w-4" />
                테마 설정
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <IconSun className="mr-2 h-4 w-4" />
                  라이트 모드
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <IconMoon className="mr-2 h-4 w-4" />
                  다크 모드
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  <IconSettings className="mr-2 h-4 w-4" />
                  시스템 설정
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleSignOut} 
              disabled={isSigningOut}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50"
            >
              <IconLogout className="mr-2 h-4 w-4" />
              {isSigningOut ? '로그아웃 중...' : '로그아웃'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

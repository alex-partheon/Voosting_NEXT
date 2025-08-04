# 🎯 Voosting 이중 타겟 공개페이지 구현 프롬프트

**프로젝트**: Voosting (AI 기반 이중 타겟 마케팅 플랫폼)  
**기술 스택**: Next.js 15 + TypeScript + Tailwind CSS v4 + Shadcn/ui + Clerk Auth

## 📋 구현 개요

**목표**: 비즈니스와 크리에이터 각각을 위한 차별화된 공개페이지 시스템 구현  
**핵심 컨셉**: 이중 타겟 마케팅 플랫폼의 특성을 반영한 트렌디하고 팬시한 디자인

## 🏗️ 아키텍처 구조

```
app/(main)/
├── layout.tsx                 # 공통 레이아웃 (테마 시스템)
├── page.tsx                   # 비즈니스 메인 페이지
├── service/page.tsx           # 비즈니스 서비스 소개
├── pricing/page.tsx           # 비즈니스 요금제
├── contact/page.tsx           # 비즈니스 문의하기
├── creators/
│   ├── layout.tsx            # 크리에이터 영역 레이아웃
│   ├── page.tsx              # 크리에이터 메인 페이지
│   ├── service/page.tsx      # 크리에이터 서비스 소개
│   └── calculator/page.tsx   # 크리에이터 수익 계산기
├── sign-in/[[...sign-in]]/page.tsx    # 통합 로그인
└── sign-up/
    ├── business/page.tsx     # 비즈니스 회원가입
    └── creator/page.tsx      # 크리에이터 회원가입
```

## 🎨 디자인 시스템

### 컬러 팔레트

#### 🏢 비즈니스 테마 (Professional & Trustworthy)

```css
:root[data-target='business'] {
  /* Primary Colors */
  --primary: 219 100% 62%; /* #3B82F6 - Professional Blue */
  --primary-foreground: 0 0% 100%; /* White */

  /* Secondary Colors */
  --secondary: 142 76% 36%; /* #16A34A - Success Green */
  --secondary-foreground: 0 0% 100%;

  /* Accent */
  --accent: 221 83% 53%; /* #1E40AF - Deep Blue */
  --accent-foreground: 0 0% 100%;

  /* Backgrounds */
  --background: 0 0% 100%; /* Pure White */
  --card: 210 40% 98%; /* #F8FAFC - Light Gray */
  --muted: 210 40% 94%; /* #F1F5F9 - Muted Gray */

  /* Text */
  --foreground: 222 84% 5%; /* #0F172A - Dark Slate */
  --muted-foreground: 215 16% 47%; /* #64748B - Gray */

  /* Borders */
  --border: 214 32% 91%; /* #E2E8F0 - Light Border */
}
```

#### 🎨 크리에이터 테마 (Creative & Vibrant)

```css
:root[data-target='creator'] {
  /* Primary Colors */
  --primary: 142 76% 36%; /* #16A34A - Vibrant Green */
  --primary-foreground: 0 0% 100%;

  /* Secondary Colors */
  --secondary: 262 83% 58%; /* #8B5CF6 - Creative Purple */
  --secondary-foreground: 0 0% 100%;

  /* Accent */
  --accent: 158 64% 52%; /* #10B981 - Emerald */
  --accent-foreground: 0 0% 100%;

  /* Backgrounds */
  --background: 0 0% 100%; /* Pure White */
  --card: 151 81% 96%; /* #F0FDF4 - Light Green */
  --muted: 138 76% 97%; /* #F7FEF7 - Very Light Green */

  /* Text */
  --foreground: 155 100% 6%; /* #052E16 - Dark Green */
  --muted-foreground: 142 76% 36%; /* #16A34A - Green */

  /* Borders */
  --border: 142 76% 73%; /* #86EFAC - Green Border */
}
```

### 타이포그래피 시스템

```css
/* 폰트 패밀리 */
.font-primary {
  font-family:
    'Pretendard Variable',
    -apple-system,
    sans-serif;
}
.font-display {
  font-family: 'Pretendard Variable', sans-serif;
  font-variation-settings: 'wght' 700;
}

/* 비즈니스 타이포그래피 */
[data-target='business'] {
  --font-size-hero: 3.5rem;
  --font-weight-hero: 700;
  --line-height-hero: 1.1;
  --letter-spacing-hero: -0.02em;
}

/* 크리에이터 타이포그래피 */
[data-target='creator'] {
  --font-size-hero: 3.25rem;
  --font-weight-hero: 600;
  --line-height-hero: 1.2;
  --letter-spacing-hero: -0.01em;
}
```

## 🧩 핵심 컴포넌트 구현

### 1. 이중 타겟 네비게이션 컴포넌트

```typescript
// components/navigation/dual-target-navigation.tsx
'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Building2, Users, ArrowRight, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavigationProps {
  target: 'business' | 'creator'
}

const NAVIGATION_CONFIG = {
  business: {
    brand: { name: 'Voosting', tagline: 'for Business' },
    theme: 'business',
    primaryColor: 'bg-blue-600 hover:bg-blue-700',
    menuItems: [
      { label: '홈', href: '/' },
      { label: '크리에이터', href: '/creators', crossLink: true, icon: Users },
      { label: '서비스', href: '/service' },
      { label: '요금제', href: '/pricing' },
      { label: '문의하기', href: '/contact' },
    ],
    cta: {
      login: { label: '로그인', href: '/sign-in' },
      signup: { label: '무료로 시작하기', href: '/sign-up/business' }
    }
  },
  creator: {
    brand: { name: 'Voosting', tagline: 'for Creators' },
    theme: 'creator',
    primaryColor: 'bg-green-600 hover:bg-green-700',
    menuItems: [
      { label: '홈', href: '/creators' },
      { label: '비즈니스', href: '/', crossLink: true, icon: Building2 },
      { label: '서비스', href: '/creators/service' },
      { label: '수익 계산기', href: '/creators/calculator' },
    ],
    cta: {
      login: { label: '로그인', href: '/sign-in' },
      signup: { label: '무료로 시작하기', href: '/sign-up/creator' }
    }
  }
}

export default function DualTargetNavigation({ target }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const config = NAVIGATION_CONFIG[target]

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled
        ? "bg-background/95 backdrop-blur-md border-b shadow-sm"
        : "bg-transparent"
    )}>
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href={target === 'business' ? '/' : '/creators'} className="flex items-center space-x-2">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm",
              target === 'business' ? 'bg-blue-600' : 'bg-green-600'
            )}>
              V
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none">{config.brand.name}</span>
              <span className="text-xs text-muted-foreground leading-none">{config.brand.tagline}</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {config.menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative text-sm font-medium transition-colors hover:text-primary",
                    pathname === item.href ? 'text-primary' : 'text-foreground/80',
                    item.crossLink && "flex items-center space-x-1 text-accent hover:text-accent/80"
                  )}
                >
                  {Icon && <Icon size={14} />}
                  <span>{item.label}</span>
                  {item.crossLink && <ArrowRight size={12} />}
                </Link>
              )
            })}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href={config.cta.login.href}>
              <Button variant="ghost" size="sm">
                {config.cta.login.label}
              </Button>
            </Link>
            <Link href={config.cta.signup.href}>
              <Button className={config.primaryColor} size="sm">
                {config.cta.signup.label}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {config.menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors",
                      pathname === item.href
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground/80 hover:bg-muted hover:text-primary',
                      item.crossLink && "text-accent"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {Icon && <Icon size={16} />}
                    <span>{item.label}</span>
                    {item.crossLink && <ArrowRight size={14} />}
                  </Link>
                )
              })}
              <div className="pt-4 space-y-2">
                <Link href={config.cta.login.href} onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">
                    {config.cta.login.label}
                  </Button>
                </Link>
                <Link href={config.cta.signup.href} onClick={() => setIsOpen(false)}>
                  <Button className={cn("w-full", config.primaryColor)}>
                    {config.cta.signup.label}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
```

### 2. 이중 타겟 히어로 섹션

```typescript
// components/sections/dual-target-hero.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Play, TrendingUp, Users, Zap, Shield, Target, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeroProps {
  target: 'business' | 'creator'
}

const HERO_CONTENT = {
  business: {
    badge: { icon: TrendingUp, text: "AI 기반 매칭 시스템" },
    title: "AI 매칭으로 완벽한 크리에이터 찾기",
    subtitle: "검증된 크리에이터 네트워크를 통해 브랜드 성장을 가속화하세요",
    description: "투명한 성과 측정, 간편한 캠페인 관리, 그리고 AI가 추천하는 최적의 크리에이터까지. 마케팅의 새로운 차원을 경험하세요.",
    features: [
      { icon: Target, title: "AI 기반 매칭", desc: "브랜드에 최적화된 크리에이터 자동 추천" },
      { icon: TrendingUp, title: "투명한 성과 측정", desc: "실시간 ROI 분석 및 상세 리포트" },
      { icon: Shield, title: "검증된 크리에이터", desc: "본인인증 완료된 신뢰할 수 있는 파트너" }
    ],
    stats: [
      { value: "10,000+", label: "등록된 크리에이터", trend: "+15%" },
      { value: "2,500+", label: "성공한 캠페인", trend: "+32%" },
      { value: "320%", label: "평균 ROI", trend: "+8%" }
    ],
    cta: {
      primary: { text: "캠페인 시작하기", href: "/sign-up/business" },
      secondary: { text: "서비스 알아보기", href: "/service" },
      demo: { text: "데모 보기", href: "#demo" }
    }
  },
  creator: {
    badge: { icon: Sparkles, text: "3단계 추천 시스템" },
    title: "팔로워 영향력을 수익으로 전환하세요",
    subtitle: "3단계 추천 시스템과 전문 도구로 마케팅크리에이터로 성장하세요",
    description: "자유로운 페이지 빌더, 안정적인 수익 구조, 그리고 무제한 성장 가능성까지. 창작자에서 마케팅 전문가로 레벨업하세요.",
    features: [
      { icon: Zap, title: "3단계 추천 수익", desc: "10% + 5% + 2% 지속적인 패시브 인컴" },
      { icon: Users, title: "자유로운 페이지 빌더", desc: "노코드로 나만의 랜딩페이지 제작" },
      { icon: TrendingUp, title: "실시간 성과 추적", desc: "방문자 분석 및 전환율 최적화 도구" }
    ],
    stats: [
      { value: "₩850K", label: "월평균 수익", trend: "+24%" },
      { value: "8,500+", label: "활성 크리에이터", trend: "+18%" },
      { value: "94%", label: "추천 성공률", trend: "+5%" }
    ],
    cta: {
      primary: { text: "크리에이터 등록하기", href: "/sign-up/creator" },
      secondary: { text: "수익 계산해보기", href: "/creators/calculator" },
      demo: { text: "성공 사례 보기", href: "#success-stories" }
    }
  }
}

export default function DualTargetHero({ target }: HeroProps) {
  const [mounted, setMounted] = useState(false)
  const content = HERO_CONTENT[target]
  const BadgeIcon = content.badge.icon

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section className={cn(
      "relative min-h-screen flex items-center justify-center overflow-hidden",
      "bg-gradient-to-br",
      target === 'business'
        ? "from-blue-50 via-white to-green-50"
        : "from-green-50 via-white to-purple-50"
    )}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={cn(
          "absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20",
          target === 'business' ? "bg-blue-300" : "bg-green-300"
        )} />
        <div className={cn(
          "absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-20",
          target === 'business' ? "bg-green-300" : "bg-purple-300"
        )} />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      </div>

      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            {/* Badge */}
            <div className="flex justify-center mb-6">
              <Badge variant="secondary" className={cn(
                "px-4 py-2 text-sm font-medium rounded-full border-0",
                target === 'business'
                  ? "bg-blue-100 text-blue-700"
                  : "bg-green-100 text-green-700"
              )}>
                <BadgeIcon size={16} className="mr-2" />
                {content.badge.text}
              </Badge>
            </div>

            {/* Main Title */}
            <h1 className={cn(
              "text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight",
              "bg-gradient-to-r bg-clip-text text-transparent",
              target === 'business'
                ? "from-blue-600 via-blue-700 to-green-600"
                : "from-green-600 via-green-700 to-purple-600"
            )}>
              {content.title}
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-6 leading-relaxed">
              {content.subtitle}
            </p>

            {/* Description */}
            <p className="text-lg text-muted-foreground/80 mb-10 max-w-3xl mx-auto leading-relaxed">
              {content.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href={content.cta.primary.href}>
                <Button size="lg" className={cn(
                  "px-8 py-4 text-lg font-semibold rounded-xl shadow-lg transition-all duration-300 hover:scale-105",
                  target === 'business'
                    ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                    : "bg-green-600 hover:bg-green-700 shadow-green-200"
                )}>
                  {content.cta.primary.text}
                  <ArrowRight size={20} className="ml-2" />
                </Button>
              </Link>

              <Link href={content.cta.secondary.href}>
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg font-semibold rounded-xl">
                  {content.cta.secondary.text}
                </Button>
              </Link>

              <Button variant="ghost" size="lg" className="px-6 py-4 text-lg">
                <Play size={16} className="mr-2" />
                {content.cta.demo.text}
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {content.features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className={cn(
                  "relative p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105",
                  "bg-white/70 border-white/20 shadow-lg hover:shadow-xl"
                )}>
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                    target === 'business'
                      ? "bg-blue-100 text-blue-600"
                      : "bg-green-100 text-green-600"
                  )}>
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                </div>
              )
            })}
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-6">
            {content.stats.map((stat, index) => (
              <div key={index} className="text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/20">
                <div className={cn(
                  "text-3xl md:text-4xl font-bold mb-2",
                  target === 'business' ? "text-blue-600" : "text-green-600"
                )}>
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
                <div className={cn(
                  "text-xs font-medium",
                  target === 'business' ? "text-green-600" : "text-purple-600"
                )}>
                  {stat.trend}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
```

### 3. 테마 전환 시스템

```typescript
// components/theme/theme-provider.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface ThemeContextType {
  target: 'business' | 'creator'
  isTransitioning: boolean
  switchTarget: (newTarget: 'business' | 'creator') => Promise<void>
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [target, setTarget] = useState<'business' | 'creator'>('business')
  const [isTransitioning, setIsTransitioning] = useState(false)

  // 경로에 따른 타겟 자동 감지
  useEffect(() => {
    const newTarget = pathname.startsWith('/creators') ? 'creator' : 'business'
    if (newTarget !== target) {
      setTarget(newTarget)
      updateTheme(newTarget)
    }
  }, [pathname, target])

  const updateTheme = (newTarget: 'business' | 'creator') => {
    document.documentElement.setAttribute('data-target', newTarget)

    // CSS 커스텀 프로퍼티 업데이트
    const root = document.documentElement
    if (newTarget === 'business') {
      root.style.setProperty('--theme-primary', '219 100% 62%')
      root.style.setProperty('--theme-secondary', '142 76% 36%')
      root.style.setProperty('--theme-accent', '221 83% 53%')
    } else {
      root.style.setProperty('--theme-primary', '142 76% 36%')
      root.style.setProperty('--theme-secondary', '262 83% 58%')
      root.style.setProperty('--theme-accent', '158 64% 52%')
    }
  }

  const switchTarget = async (newTarget: 'business' | 'creator') => {
    if (newTarget === target) return

    setIsTransitioning(true)

    // 전환 애니메이션
    document.body.classList.add('theme-transitioning')

    await new Promise(resolve => setTimeout(resolve, 300))

    setTarget(newTarget)
    updateTheme(newTarget)

    document.body.classList.remove('theme-transitioning')
    setIsTransitioning(false)
  }

  return (
    <ThemeContext.Provider value={{ target, isTransitioning, switchTarget }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
```

### 4. 수익 계산기 컴포넌트

```typescript
// components/calculator/earnings-calculator.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Calculator, TrendingUp, Users, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EarningsData {
  followers: number
  engagementRate: number
  campaignsPerMonth: number
  avgCampaignValue: number
  referrals: {
    level1: number
    level2: number
    level3: number
  }
}

export default function EarningsCalculator() {
  const [data, setData] = useState<EarningsData>({
    followers: 10000,
    engagementRate: 3,
    campaignsPerMonth: 4,
    avgCampaignValue: 50000,
    referrals: {
      level1: 2,
      level2: 1,
      level3: 0
    }
  })

  const [results, setResults] = useState({
    monthly: 0,
    yearly: 0,
    referralBonus: 0,
    totalWithReferrals: 0
  })

  useEffect(() => {
    calculateEarnings()
  }, [data])

  const calculateEarnings = () => {
    // 기본 캠페인 수익
    const baseMonthly = data.campaignsPerMonth * data.avgCampaignValue

    // 팔로워 수와 참여율에 따른 보너스
    const followersMultiplier = Math.min(data.followers / 10000, 3)
    const engagementMultiplier = Math.min(data.engagementRate / 3, 2)
    const bonusMultiplier = 1 + (followersMultiplier * 0.2) + (engagementMultiplier * 0.3)

    const adjustedMonthly = baseMonthly * bonusMultiplier

    // 추천 수익 (월평균)
    const referralMonthly =
      (data.referrals.level1 * adjustedMonthly * 0.10) +
      (data.referrals.level2 * adjustedMonthly * 0.05) +
      (data.referrals.level3 * adjustedMonthly * 0.02)

    const totalMonthly = adjustedMonthly + referralMonthly

    setResults({
      monthly: Math.round(adjustedMonthly),
      yearly: Math.round(adjustedMonthly * 12),
      referralBonus: Math.round(referralMonthly),
      totalWithReferrals: Math.round(totalMonthly)
    })
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
            <Calculator size={24} />
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-2">수익 계산기</h2>
        <p className="text-muted-foreground">당신의 영향력이 얼마만큼의 수익을 만들어낼 수 있는지 확인해보세요</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* 입력 패널 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users size={20} />
              <span>기본 정보</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 팔로워 수 */}
            <div className="space-y-2">
              <Label>팔로워 수</Label>
              <div className="space-y-3">
                <Slider
                  value={[data.followers]}
                  onValueChange={([value]) => setData(prev => ({ ...prev, followers: value }))}
                  max={100000}
                  min={1000}
                  step={1000}
                  className="w-full"
                />
                <Input
                  type="number"
                  value={data.followers}
                  onChange={(e) => setData(prev => ({ ...prev, followers: Number(e.target.value) }))}
                  className="text-right"
                />
              </div>
            </div>

            {/* 참여율 */}
            <div className="space-y-2">
              <Label>평균 참여율 (%)</Label>
              <div className="space-y-3">
                <Slider
                  value={[data.engagementRate]}
                  onValueChange={([value]) => setData(prev => ({ ...prev, engagementRate: value }))}
                  max={10}
                  min={0.5}
                  step={0.1}
                  className="w-full"
                />
                <Input
                  type="number"
                  value={data.engagementRate}
                  onChange={(e) => setData(prev => ({ ...prev, engagementRate: Number(e.target.value) }))}
                  step="0.1"
                  className="text-right"
                />
              </div>
            </div>

            {/* 월 캠페인 수 */}
            <div className="space-y-2">
              <Label>월 참여 캠페인 수</Label>
              <Input
                type="number"
                value={data.campaignsPerMonth}
                onChange={(e) => setData(prev => ({ ...prev, campaignsPerMonth: Number(e.target.value) }))}
                min="1"
                max="30"
              />
            </div>

            {/* 평균 캠페인 단가 */}
            <div className="space-y-2">
              <Label>평균 캠페인 단가 (원)</Label>
              <Input
                type="number"
                value={data.avgCampaignValue}
                onChange={(e) => setData(prev => ({ ...prev, avgCampaignValue: Number(e.target.value) }))}
                step="10000"
              />
            </div>

            {/* 추천 인원 */}
            <div className="space-y-4">
              <Label className="flex items-center space-x-2">
                <Zap size={16} />
                <span>추천 시스템 (선택사항)</span>
              </Label>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-green-600">1단계 (10%)</Label>
                  <Input
                    type="number"
                    value={data.referrals.level1}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      referrals: { ...prev.referrals, level1: Number(e.target.value) }
                    }))}
                    min="0"
                    className="text-center"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-blue-600">2단계 (5%)</Label>
                  <Input
                    type="number"
                    value={data.referrals.level2}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      referrals: { ...prev.referrals, level2: Number(e.target.value) }
                    }))}
                    min="0"
                    className="text-center"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-purple-600">3단계 (2%)</Label>
                  <Input
                    type="number"
                    value={data.referrals.level3}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      referrals: { ...prev.referrals, level3: Number(e.target.value) }
                    }))}
                    min="0"
                    className="text-center"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 결과 패널 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp size={20} />
              <span>예상 수익</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 월 수익 */}
              <div className="text-center p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                <div className="text-sm text-green-600 mb-1">월 캠페인 수익</div>
                <div className="text-3xl font-bold text-green-700">
                  ₩{results.monthly.toLocaleString()}
                </div>
              </div>

              {/* 추천 수익 */}
              {results.referralBonus > 0 && (
                <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <div className="text-sm text-purple-600 mb-1">월 추천 수익</div>
                  <div className="text-2xl font-bold text-purple-700">
                    ₩{results.referralBonus.toLocaleString()}
                  </div>
                </div>
              )}

              {/* 총 월 수익 */}
              <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <div className="text-sm text-blue-600 mb-1">총 월 수익</div>
                <div className="text-4xl font-bold text-blue-700">
                  ₩{results.totalWithReferrals.toLocaleString()}
                </div>
              </div>

              {/* 연 수익 */}
              <div className="text-center p-4 bg-muted rounded-xl">
                <div className="text-sm text-muted-foreground mb-1">예상 연 수익</div>
                <div className="text-xl font-semibold">
                  ₩{(results.totalWithReferrals * 12).toLocaleString()}
                </div>
              </div>

              {/* CTA */}
              <div className="space-y-3">
                <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
                  지금 시작하기
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  * 실제 수익은 개인의 활동과 시장 상황에 따라 달라질 수 있습니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

## 📱 반응형 디자인 가이드

### 브레이크포인트 시스템

```css
/* Tailwind CSS 브레이크포인트 확장 */
@media (max-width: 640px) {
  /* Mobile First */
  .hero-title {
    font-size: 2.5rem;
  }
  .container {
    padding: 1rem;
  }
}

@media (min-width: 768px) {
  /* Tablet */
  .hero-title {
    font-size: 4rem;
  }
}

@media (min-width: 1024px) {
  /* Desktop */
  .hero-title {
    font-size: 5rem;
  }
}

@media (min-width: 1280px) {
  /* Large Desktop */
  .hero-title {
    font-size: 6rem;
  }
}
```

## 🎭 애니메이션 시스템

### 페이지 전환 애니메이션

```css
/* 테마 전환 애니메이션 */
.theme-transitioning * {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* 스크롤 애니메이션 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}

/* 호버 효과 */
.hover-lift {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}
```

## 🧪 구현 체크리스트

### Phase 1: 기본 구조 (1주)

- [ ] Next.js 15 프로젝트 설정
- [ ] Tailwind CSS v4 + Shadcn/ui 설정
- [ ] 기본 라우팅 구조 구현
- [ ] 테마 시스템 기본 설정

### Phase 2: 네비게이션 & 레이아웃 (1주)

- [ ] DualTargetNavigation 컴포넌트 구현
- [ ] 반응형 모바일 메뉴 구현
- [ ] 테마 전환 시스템 구현
- [ ] 공통 Footer 컴포넌트 구현

### Phase 3: 히어로 섹션 & 메인 페이지 (1.5주)

- [ ] DualTargetHero 컴포넌트 구현
- [ ] 비즈니스 메인 페이지 (/page.tsx)
- [ ] 크리에이터 메인 페이지 (/creators/page.tsx)
- [ ] 배경 애니메이션 및 인터랙션 구현

### Phase 4: 서비스 페이지 (1주)

- [ ] 비즈니스 서비스 페이지 (/service)
- [ ] 크리에이터 서비스 페이지 (/creators/service)
- [ ] 기능 소개 섹션 구현
- [ ] 가격 정책 섹션 구현

### Phase 5: 특화 기능 페이지 (1주)

- [ ] 요금제 페이지 (/pricing)
- [ ] 수익 계산기 (/creators/calculator)
- [ ] 문의하기 페이지 (/contact)
- [ ] FAQ 섹션 구현

### Phase 6: 인증 페이지 & 최적화 (0.5주)

- [ ] Clerk 로그인 페이지 커스터마이징
- [ ] 회원가입 페이지 (business/creator)
- [ ] SEO 최적화 (메타데이터, OG 이미지)
- [ ] 성능 최적화 및 테스트

## 📊 성능 목표

- **Core Web Vitals**
  - LCP (Largest Contentful Paint): < 2.5초
  - FID (First Input Delay): < 100ms
  - CLS (Cumulative Layout Shift): < 0.1

- **페이지 로드 시간**: < 3초
- **Lighthouse 점수**: 90점 이상
- **접근성 점수**: AA 등급 이상

이 프롬프트를 기반으로 Voosting의 트렌디하고 전문적인 이중 타겟 공개페이지를 구현하세요. 각 단계별로 체크리스트를 확인하며 진행하고, 성능과 사용자 경험을 최우선으로 고려해 개발하시기 바랍니다.

"use client"

import { IconTrendingDown, IconTrendingUp, IconUsers, IconCreditCard, IconChartBar, IconCash } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// 실제 구현에서는 Supabase에서 데이터를 가져올 예정
const adminMetrics = {
  totalUsers: {
    value: 2847,
    trend: 12.5,
    description: "이번 달 신규 가입자",
    details: "크리에이터 1,892명 · 비즈니스 955명"
  },
  totalRevenue: {
    value: 125000000, // 1억 2천 5백만원
    trend: 8.3,
    description: "누적 거래 수수료",
    details: "이번 달 2,850만원 수수료 수익"
  },
  activeCampaigns: {
    value: 156,
    trend: -5.2,
    description: "진행 중인 캠페인",
    details: "승인 대기 32건 · 검토 필요 8건"
  },
  platformGrowth: {
    value: 23.8, // 성장률 %
    trend: 4.1,
    description: "플랫폼 성장률",
    details: "월 평균 거래량 기준"
  }
}

function formatCurrency(amount: number): string {
  if (amount >= 100000000) { // 1억 이상
    return `${(amount / 100000000).toFixed(1)}억원`
  } else if (amount >= 10000) { // 1만 이상
    return `${Math.floor(amount / 10000)}만원`
  } else {
    return `${amount.toLocaleString()}원`
  }
}

export function AdminMetricsCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* 총 사용자 수 */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconUsers className="h-4 w-4" />
            총 사용자
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {adminMetrics.totalUsers.value.toLocaleString()}명
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {adminMetrics.totalUsers.trend > 0 ? (
                <IconTrendingUp className="h-3 w-3" />
              ) : (
                <IconTrendingDown className="h-3 w-3" />
              )}
              {Math.abs(adminMetrics.totalUsers.trend)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {adminMetrics.totalUsers.description}
            {adminMetrics.totalUsers.trend > 0 ? (
              <IconTrendingUp className="size-4 text-green-600" />
            ) : (
              <IconTrendingDown className="size-4 text-red-600" />
            )}
          </div>
          <div className="text-muted-foreground">
            {adminMetrics.totalUsers.details}
          </div>
        </CardFooter>
      </Card>

      {/* 누적 수수료 수익 */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconCash className="h-4 w-4" />
            수수료 수익
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(adminMetrics.totalRevenue.value)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {adminMetrics.totalRevenue.trend > 0 ? (
                <IconTrendingUp className="h-3 w-3" />
              ) : (
                <IconTrendingDown className="h-3 w-3" />
              )}
              {Math.abs(adminMetrics.totalRevenue.trend)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {adminMetrics.totalRevenue.description}
            <IconTrendingUp className="size-4 text-green-600" />
          </div>
          <div className="text-muted-foreground">
            {adminMetrics.totalRevenue.details}
          </div>
        </CardFooter>
      </Card>

      {/* 활성 캠페인 */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconCreditCard className="h-4 w-4" />
            활성 캠페인
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {adminMetrics.activeCampaigns.value}개
          </CardTitle>
          <CardAction>
            <Badge variant={adminMetrics.activeCampaigns.trend < 0 ? "destructive" : "outline"}>
              {adminMetrics.activeCampaigns.trend > 0 ? (
                <IconTrendingUp className="h-3 w-3" />
              ) : (
                <IconTrendingDown className="h-3 w-3" />
              )}
              {Math.abs(adminMetrics.activeCampaigns.trend)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {adminMetrics.activeCampaigns.description}
            {adminMetrics.activeCampaigns.trend > 0 ? (
              <IconTrendingUp className="size-4 text-green-600" />
            ) : (
              <IconTrendingDown className="size-4 text-orange-600" />
            )}
          </div>
          <div className="text-muted-foreground">
            {adminMetrics.activeCampaigns.details}
          </div>
        </CardFooter>
      </Card>

      {/* 플랫폼 성장률 */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconChartBar className="h-4 w-4" />
            성장률
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {adminMetrics.platformGrowth.value}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {adminMetrics.platformGrowth.trend > 0 ? (
                <IconTrendingUp className="h-3 w-3" />
              ) : (
                <IconTrendingDown className="h-3 w-3" />
              )}
              {Math.abs(adminMetrics.platformGrowth.trend)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {adminMetrics.platformGrowth.description}
            <IconTrendingUp className="size-4 text-green-600" />
          </div>
          <div className="text-muted-foreground">
            {adminMetrics.platformGrowth.details}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
"use client"

import { IconTrendingUp, IconTrendingDown, IconWallet, IconCoins, IconClock, IconUsers } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface CreatorData {
  revenue: {
    total: number
    thisMonth: number
    pending: number
    referralCommission: number
  }
  profile: {
    followers: number
    engagementRate: number
    rating: number
    completedCampaigns: number
  }
}

interface CreatorMetricsCardsProps {
  data: CreatorData
}

// 숫자를 한국어 통화 형식으로 포맷
function formatKoreanWon(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// 숫자를 압축 형식으로 포맷 (예: 245K)
function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'K'
  }
  return num.toString()
}

export function CreatorMetricsCards({ data }: CreatorMetricsCardsProps) {
  const { revenue, profile } = data

  // 전월 대비 증감률 계산 (예시 데이터)
  const monthlyGrowth = 12.5 // %
  const pendingGrowth = -5.2 // %
  const referralGrowth = 8.3 // %
  const followerGrowth = 3.8 // %

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* 총 수익 */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>총 수익</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatKoreanWon(revenue.total)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-green-600 border-green-200">
              <IconTrendingUp className="w-3 h-3 mr-1" />
              누적
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            전체 캠페인 수익 <IconWallet className="size-4" />
          </div>
          <div className="text-muted-foreground">
            지난 10개월간의 총 수익금액
          </div>
        </CardFooter>
      </Card>

      {/* 이번 달 수익 */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>이번 달 수익</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatKoreanWon(revenue.thisMonth)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-green-600 border-green-200">
              <IconTrendingUp className="w-3 h-3 mr-1" />
              +{monthlyGrowth}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            전월 대비 {monthlyGrowth}% 증가 <IconTrendingUp className="size-4 text-green-500" />
          </div>
          <div className="text-muted-foreground">
            현재 진행 중인 캠페인 포함
          </div>
        </CardFooter>
      </Card>

      {/* 미정산 금액 */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>미정산 금액</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatKoreanWon(revenue.pending)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              <IconClock className="w-3 h-3 mr-1" />
              정산 대기
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            완료된 캠페인 정산 대기 <IconClock className="size-4 text-orange-500" />
          </div>
          <div className="text-muted-foreground">
            평균 정산 기간: 7-14일
          </div>
        </CardFooter>
      </Card>

      {/* 추천 수수료 */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>추천 수수료</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatKoreanWon(revenue.referralCommission)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              <IconTrendingUp className="w-3 h-3 mr-1" />
              +{referralGrowth}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            3단계 추천 시스템 <IconCoins className="size-4 text-blue-500" />
          </div>
          <div className="text-muted-foreground">
            레벨 1: 10%, 레벨 2: 5%, 레벨 3: 2%
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
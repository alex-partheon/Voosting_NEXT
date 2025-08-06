"use client"

import * as React from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

import { useCreatorMonthlyStats } from "@/hooks/use-dashboard-data"
import type { CreatorDashboardStats } from "@/types/supabase"

interface CreatorChartsSectionProps {
  userId: string
  stats: CreatorDashboardStats
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

// 월 포맷팅
function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-')
  return `${parseInt(month)}월`
}

// 압축 숫자 포맷
function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'K'
  }
  return num.toString()
}

// 차트 색상 구성
const chartConfig = {
  campaigns: {
    label: "캠페인 수",
    color: "hsl(var(--primary))",
  },
  revenue: {
    label: "수익",
    color: "hsl(var(--primary))",
  },
  reach: {
    label: "도달 수",
    color: "hsl(142 76% 36%)",
  },
} satisfies ChartConfig

// 카테고리별 색상
const categoryColors = [
  "hsl(221, 83%, 53%)",  // 테크/IT - 파랑
  "hsl(340, 82%, 52%)",  // 뷰티/화장품 - 분홍
  "hsl(142, 76%, 36%)",  // 가전/생활 - 초록
  "hsl(48, 96%, 53%)",   // 자동차 - 노랑
  "hsl(262, 83%, 58%)",  // 핀테크 - 보라
]

export function CreatorChartsSection({ userId, stats }: CreatorChartsSectionProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("6개월")
  const [chartType, setChartType] = React.useState("revenue")
  
  // 월별 통계 데이터 조회
  const { data: monthlyData, loading: monthlyLoading, error: monthlyError } = useCreatorMonthlyStats(
    userId, 
    6, // 6개월 데이터
    {
      onError: (error) => {
        console.error('월별 통계 조회 실패:', error);
      }
    }
  )

  // 선택된 기간에 따른 데이터 필터링
  const filteredMonthlyData = React.useMemo(() => {
    if (!monthlyData) return []
    
    const months = timeRange === "3개월" ? 3 : timeRange === "6개월" ? 6 : 12
    return monthlyData.slice(-months).map(item => ({
      ...item,
      monthLabel: formatMonth(item.month),
      revenueInMillions: item.revenue / 1000000,
      // reach 데이터가 없으므로 기본값 설정 (TODO: 실제 도달 수 데이터 추가)
      reachInThousands: item.applications * 1000 // 임시로 지원서 수 기반 추정
    }))
  }, [monthlyData, timeRange])

  // 카테고리별 데이터는 현재 데이터베이스에 없으므로 기본 데이터 생성
  // TODO: 실제 카테고리별 통계 쿼리 추가
  const categoryDataWithColors = React.useMemo(() => {
    // 임시 카테고리 데이터 (실제 구현 시 데이터베이스에서 조회)
    const defaultCategories = [
      { category: "테크/IT", campaigns: stats.activeCampaigns, revenue: stats.totalEarnings * 0.4, avgPerformance: 94 },
      { category: "뷰티/화장품", campaigns: Math.floor(stats.completedCampaigns * 0.3), revenue: stats.totalEarnings * 0.25, avgPerformance: 89 },
      { category: "가전/생활", campaigns: Math.floor(stats.completedCampaigns * 0.2), revenue: stats.totalEarnings * 0.2, avgPerformance: 91 },
      { category: "자동차", campaigns: Math.floor(stats.completedCampaigns * 0.1), revenue: stats.totalEarnings * 0.15, avgPerformance: 96 },
    ].filter(item => item.campaigns > 0) // 0개인 카테고리 제외
    
    return defaultCategories.map((item, index) => ({
      ...item,
      color: categoryColors[index % categoryColors.length],
      revenueInMillions: item.revenue / 1000000
    }))
  }, [stats])

  // 로딩 상태 처리
  if (monthlyLoading) {
    return (
      <div className="grid gap-4 px-4 lg:px-6 @4xl/main:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <div className="h-5 w-32 bg-muted animate-pulse rounded" />
              <div className="h-4 w-48 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // 에러 상태 처리
  if (monthlyError) {
    return (
      <div className="px-4 lg:px-6">
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <p>차트 데이터를 불러오는 중 문제가 발생했습니다.</p>
              <p className="text-sm mt-1">{monthlyError.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 px-4 lg:px-6 @4xl/main:grid-cols-2">
      {/* 월별 캠페인 참여 차트 */}
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>월별 캠페인 참여</CardTitle>
          <CardDescription>
            <span className="hidden @[540px]/card:block">
              최근 {timeRange}간의 캠페인 참여 현황
            </span>
            <span className="@[540px]/card:hidden">최근 {timeRange} 현황</span>
          </CardDescription>
          <CardAction>
            <ToggleGroup
              type="single"
              value={chartType}
              onValueChange={(value) => value && setChartType(value)}
              variant="outline"
              className="hidden *:data-[slot=toggle-group-item]:!px-3 @[500px]/card:flex"
            >
              <ToggleGroupItem value="revenue">수익</ToggleGroupItem>
              <ToggleGroupItem value="campaigns">캠페인 수</ToggleGroupItem>
              <ToggleGroupItem value="reach">도달 수</ToggleGroupItem>
            </ToggleGroup>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className="flex w-24 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[500px]/card:w-28"
                aria-label="기간 선택"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="3개월" className="rounded-lg">3개월</SelectItem>
                <SelectItem value="6개월" className="rounded-lg">6개월</SelectItem>
                <SelectItem value="12개월" className="rounded-lg">12개월</SelectItem>
              </SelectContent>
            </Select>
          </CardAction>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            {chartType === "revenue" ? (
              <AreaChart data={filteredMonthlyData}>
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="monthLabel"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}M`}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => `${value}`}
                      formatter={(value: number) => [formatKoreanWon(value * 1000000), "수익"]}
                    />
                  }
                />
                <Area
                  dataKey="revenueInMillions"
                  type="natural"
                  fill="url(#fillRevenue)"
                  stroke="hsl(var(--primary))"
                />
              </AreaChart>
            ) : (
              <BarChart data={filteredMonthlyData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="monthLabel"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => `${value}`}
                      formatter={(value: number) => [
                        chartType === "campaigns" 
                          ? `${value}개` 
                          : formatCompactNumber(value * 1000),
                        chartType === "campaigns" ? "캠페인" : "도달 수"
                      ]}
                    />
                  }
                />
                <Bar
                  dataKey={chartType === "campaigns" ? "campaigns" : "reachInThousands"}
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 카테고리별 성과 차트 */}
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>카테고리별 성과</CardTitle>
          <CardDescription>
            <span className="hidden @[540px]/card:block">
              카테고리별 캠페인 수 및 수익 분석
            </span>
            <span className="@[540px]/card:hidden">카테고리별 분석</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="grid gap-6 @[400px]/card:grid-cols-[200px_1fr]">
            {/* 파이 차트 */}
            <ChartContainer
              config={chartConfig}
              className="aspect-square h-[200px] w-full @[400px]/card:h-[200px]"
            >
              <PieChart>
                <Pie
                  data={categoryDataWithColors}
                  dataKey="campaigns"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {categoryDataWithColors.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value: number, name: string) => [
                        `${value}개 캠페인`,
                        name
                      ]}
                    />
                  }
                />
              </PieChart>
            </ChartContainer>

            {/* 카테고리 상세 정보 */}
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium mb-2">카테고리별 상세</div>
              {categoryDataWithColors.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium">{category.category}</span>
                  </div>
                  <div className="flex flex-col items-end text-xs">
                    <span className="font-semibold">
                      {formatKoreanWon(category.revenue)}
                    </span>
                    <span className="text-muted-foreground">
                      {category.campaigns}개 • 평균 {category.avgPerformance}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
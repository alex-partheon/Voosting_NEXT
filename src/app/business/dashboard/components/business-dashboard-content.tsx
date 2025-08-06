"use client"

import * as React from "react"
import { IconTrendingDown, IconTrendingUp, IconUsers, IconTarget, IconCreditCard, IconActivity } from "@tabler/icons-react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie } from "recharts"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { IconRefresh, IconAlertCircle } from "@tabler/icons-react"
import { useDashboardData, useBusinessCampaigns } from "@/hooks/use-dashboard-data"
import type { BusinessDashboardStats } from "@/types/supabase"
const businessMetrics = {
  campaigns: {
    total: 24,
    active: 8,
    completed: 12,
    pending: 4,
  },
  budget: {
    total: "2억 4천만원",
    spent: "1억 8천만원",
    remaining: "6천만원",
    utilization: 75
  },
  roi: {
    average: 285,
    trend: 12.5,
    bestCampaign: 420
  },
  creators: {
    total: 156,
    active: 89,
    pending: 32,
    top: 15
  }
}

// Mock campaign performance data
const campaignPerformanceData = [
  { date: "2024-10-01", reach: 45000, engagement: 2800, conversion: 120 },
  { date: "2024-10-02", reach: 52000, engagement: 3200, conversion: 145 },
  { date: "2024-10-03", reach: 38000, engagement: 2100, conversion: 98 },
  { date: "2024-10-04", reach: 61000, engagement: 4100, conversion: 185 },
  { date: "2024-10-05", reach: 48000, engagement: 2950, conversion: 132 },
  { date: "2024-10-06", reach: 57000, engagement: 3650, conversion: 168 },
  { date: "2024-10-07", reach: 64000, engagement: 4200, conversion: 201 },
]

// Mock creator participation data
const creatorParticipationData = [
  { platform: "인스타그램", participants: 45, color: "#E1306C" },
  { platform: "유튜브", participants: 38, color: "#FF0000" },
  { platform: "틱톡", participants: 32, color: "#000000" },
  { platform: "네이버 블로그", participants: 28, color: "#03C75A" },
  { platform: "기타", participants: 13, color: "#6B7280" },
]

// Mock campaign management data
const campaignManagementData = [
  {
    id: 1,
    name: "삼성 갤럭시 Z시리즈 런칭",
    status: "진행중",
    budget: "5,500만원",
    spent: "3,200만원",
    participants: 24,
    roi: 320,
    startDate: "2024-09-15",
    endDate: "2024-11-15"
  },
  {
    id: 2,
    name: "LG전자 AI 가전 홍보",
    status: "완료",
    budget: "3,800만원",
    spent: "3,650만원",
    participants: 18,
    roi: 285,
    startDate: "2024-08-01",
    endDate: "2024-09-30"
  },
  {
    id: 3,
    name: "현대자동차 신모델 브랜딩",
    status: "진행중",
    budget: "7,200만원",
    spent: "4,100만원",
    participants: 31,
    roi: 195,
    startDate: "2024-09-01",
    endDate: "2024-12-31"
  },
  {
    id: 4,
    name: "네이버페이 결제 프로모션",
    status: "대기중",
    budget: "2,400만원",
    spent: "0원",
    participants: 0,
    roi: 0,
    startDate: "2024-11-01",
    endDate: "2024-11-30"
  },
  {
    id: 5,
    name: "카카오톡 이모티콘 런칭",
    status: "완료",
    budget: "1,800만원",
    spent: "1,720만원",
    participants: 12,
    roi: 420,
    startDate: "2024-07-15",
    endDate: "2024-08-31"
  }
]

// Chart configurations
const performanceChartConfig = {
  reach: {
    label: "도달률",
    color: "hsl(var(--chart-1))",
  },
  engagement: {
    label: "참여도",
    color: "hsl(var(--chart-2))",
  },
  conversion: {
    label: "전환율",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

const participationChartConfig = {
  participants: {
    label: "참여자",
  },
} satisfies ChartConfig

const getStatusBadge = (status: string) => {
  switch (status) {
    case "진행중":
      return <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">진행중</Badge>
    case "완료":
      return <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">완료</Badge>
    case "대기중":
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">대기중</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

const getRoiTrendIcon = (roi: number) => {
  if (roi >= 300) return <IconTrendingUp className="w-4 h-4 text-green-600" />
  if (roi >= 200) return <IconTrendingUp className="w-4 h-4 text-blue-600" />
  return <IconTrendingDown className="w-4 h-4 text-orange-600" />
}

export function BusinessDashboardContent() {
  const [timeRange, setTimeRange] = React.useState("7d")
  
  // 대시보드 데이터 조회
  const { user, stats, loading, error, refresh } = useDashboardData()

  // 로딩 상태
  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Metrics Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Alert>
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-3">
              <p className="font-medium">데이터를 불러오는 중 문제가 발생했습니다</p>
              <p className="text-sm text-muted-foreground">
                {error.message || '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'}
              </p>
              <Button onClick={refresh} size="sm">
                <IconRefresh className="w-4 h-4 mr-2" />
                다시 시도
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // 권한 확인
  if (!user || user.role !== 'business') {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Alert>
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>
            이 페이지는 비즈니스 계정만 접근할 수 있습니다.
            {user && ` 현재 계정 타입: ${user.role}`}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // 통계 데이터가 없는 경우
  if (!stats) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Alert>
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>
            대시보드 통계 데이터를 불러올 수 없습니다.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const businessStats = stats as BusinessDashboardStats

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">비즈니스 대시보드</h1>
          <p className="text-muted-foreground">캠페인 성과와 크리에이터 관리를 한눈에 확인하세요</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="기간 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">최근 7일</SelectItem>
            <SelectItem value="30d">최근 30일</SelectItem>
            <SelectItem value="90d">최근 90일</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 캠페인</CardTitle>
            <IconTarget className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{businessStats.activeCampaigns + businessStats.completedCampaigns}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>진행중: {businessStats.activeCampaigns}</span>
              <span>•</span>
              <span>완료: {businessStats.completedCampaigns}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 지출</CardTitle>
            <IconCreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('ko-KR', {
                style: 'currency',
                currency: 'KRW',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(businessStats.totalSpent)}
            </div>
            <div className="mt-2">
              <Progress value={businessStats.totalSpent > 0 ? (businessStats.monthlySpent / businessStats.totalSpent) * 100 : 0} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                이번 달: {new Intl.NumberFormat('ko-KR', {
                  style: 'currency',
                  currency: 'KRW',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(businessStats.monthlySpent)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 캠페인 예산</CardTitle>
            <IconActivity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('ko-KR', {
                style: 'currency',
                currency: 'KRW',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(businessStats.avgCampaignBudget)}
            </div>
            <div className="flex items-center space-x-1 text-xs">
              <span className="text-muted-foreground">전체 캠페인 기준</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">선택된 크리에이터</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{businessStats.selectedCreators}</div>
            <p className="text-xs text-muted-foreground">
              총 지원자: {businessStats.totalApplications}명
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Campaign Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>캠페인 성과 추이</CardTitle>
            <CardDescription>최근 7일간 주요 지표 변화</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <ChartContainer config={performanceChartConfig}>
              <AreaChart
                data={campaignPerformanceData}
                height={300}
                margin={{
                  left: 12,
                  right: 12,
                  top: 12,
                  bottom: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString("ko-KR", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                />
                <YAxis hide />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("ko-KR", {
                          month: "long",
                          day: "numeric",
                        })
                      }}
                      indicator="dot"
                    />
                  }
                />
                <Area
                  dataKey="reach"
                  type="natural"
                  fill="var(--color-reach)"
                  fillOpacity={0.4}
                  stroke="var(--color-reach)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Creator Participation Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>플랫폼별 크리에이터 분포</CardTitle>
            <CardDescription>활성 크리에이터의 플랫폼 분포</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={participationChartConfig}
              className="mx-auto aspect-square max-h-[300px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={creatorParticipationData}
                  dataKey="participants"
                  nameKey="platform"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  {creatorParticipationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {creatorParticipationData.map((item) => (
                <div key={item.platform} className="flex items-center space-x-2">
                  <div
                    className="h-3 w-3 rounded-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs">{item.platform}: {item.participants}명</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Management Table */}
      <Card>
        <CardHeader>
          <CardTitle>캠페인 관리</CardTitle>
          <CardDescription>진행중인 캠페인과 성과를 관리하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">전체</TabsTrigger>
              <TabsTrigger value="active">진행중</TabsTrigger>
              <TabsTrigger value="completed">완료</TabsTrigger>
              <TabsTrigger value="pending">대기중</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>캠페인명</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>예산</TableHead>
                      <TableHead>사용액</TableHead>
                      <TableHead>참여자</TableHead>
                      <TableHead>ROI</TableHead>
                      <TableHead>기간</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaignManagementData.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">
                          {campaign.name}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(campaign.status)}
                        </TableCell>
                        <TableCell>{campaign.budget}</TableCell>
                        <TableCell>{campaign.spent}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <IconUsers className="h-4 w-4 text-muted-foreground" />
                            <span>{campaign.participants}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getRoiTrendIcon(campaign.roi)}
                            <span>{campaign.roi}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {campaign.startDate} ~ {campaign.endDate}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            상세보기
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="active" className="mt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>캠페인명</TableHead>
                      <TableHead>예산</TableHead>
                      <TableHead>사용액</TableHead>
                      <TableHead>참여자</TableHead>
                      <TableHead>진행률</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaignManagementData
                      .filter((c) => c.status === "진행중")
                      .map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium">
                            {campaign.name}
                          </TableCell>
                          <TableCell>{campaign.budget}</TableCell>
                          <TableCell>{campaign.spent}</TableCell>
                          <TableCell>{campaign.participants}</TableCell>
                          <TableCell>
                            <Progress value={65} className="w-20" />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              관리
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>캠페인명</TableHead>
                      <TableHead>최종 예산</TableHead>
                      <TableHead>참여자</TableHead>
                      <TableHead>ROI</TableHead>
                      <TableHead>완료일</TableHead>
                      <TableHead className="text-right">리포트</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaignManagementData
                      .filter((c) => c.status === "완료")
                      .map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium">
                            {campaign.name}
                          </TableCell>
                          <TableCell>{campaign.spent}</TableCell>
                          <TableCell>{campaign.participants}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getRoiTrendIcon(campaign.roi)}
                              <span className="font-semibold">{campaign.roi}%</span>
                            </div>
                          </TableCell>
                          <TableCell>{campaign.endDate}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              다운로드
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="pending" className="mt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>캠페인명</TableHead>
                      <TableHead>예산</TableHead>
                      <TableHead>시작일</TableHead>
                      <TableHead>예상 참여자</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaignManagementData
                      .filter((c) => c.status === "대기중")
                      .map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium">
                            {campaign.name}
                          </TableCell>
                          <TableCell>{campaign.budget}</TableCell>
                          <TableCell>{campaign.startDate}</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm">
                              시작하기
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
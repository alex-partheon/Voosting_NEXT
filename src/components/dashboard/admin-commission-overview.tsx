"use client"

import * as React from "react"
import {
  IconCash,
  IconClock,
  IconCheck,
  IconAlertTriangle,
  IconTrendingUp,
  IconDownload,
  IconFilter,
  IconSearch,
  IconMoreHorizontal,
} from "@tabler/icons-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
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

// 수수료 정산 데이터 (실제 구현에서는 Supabase에서 가져올 예정)
const commissionData = {
  summary: {
    totalPending: 45600000, // 대기 중인 수수료
    totalPaid: 128300000, // 지급 완료된 수수료
    monthlyGrowth: 12.5,
    averageProcessingTime: 2.3, // 일
  },
  pendingPayments: [
    {
      id: "1",
      creatorName: "김창작",
      creatorEmail: "creator1@example.com",
      amount: 2500000,
      level: 1,
      campaignTitle: "삼성전자 갤럭시 프로모션",
      dueDate: new Date("2024-08-05"),
      referralChain: ["김추천1", "박추천2", "이추천3"]
    },
    {
      id: "2",
      creatorName: "이콘텐츠",
      creatorEmail: "creator2@example.com",
      amount: 1800000,
      level: 2,
      campaignTitle: "LG전자 신제품 런칭",
      dueDate: new Date("2024-08-07"),
      referralChain: ["최추천A", "정추천B"]
    },
    {
      id: "3",
      creatorName: "박마케터",
      creatorEmail: "creator3@example.com",
      amount: 3200000,
      level: 1,
      campaignTitle: "현대자동차 브랜드 캠페인",
      dueDate: new Date("2024-08-10"),
      referralChain: ["한추천X"]
    },
  ],
  monthlyStats: [
    { month: "1월", pending: 32000000, paid: 28000000 },
    { month: "2월", pending: 35000000, paid: 31000000 },
    { month: "3월", pending: 41000000, paid: 38000000 },
    { month: "4월", pending: 38000000, paid: 35000000 },
    { month: "5월", pending: 42000000, paid: 39000000 },
    { month: "6월", pending: 47000000, paid: 44000000 },
    { month: "7월", pending: 45600000, paid: 42800000 },
  ],
  recentTransactions: [
    {
      id: "t1",
      type: "payout",
      creatorName: "최승인",
      amount: 1500000,
      status: "completed",
      processedAt: new Date("2024-07-30T10:30:00"),
      level: 1
    },
    {
      id: "t2",
      type: "payout",
      creatorName: "정기업",
      amount: 850000,
      status: "processing",
      processedAt: new Date("2024-07-30T09:15:00"),
      level: 2
    },
    {
      id: "t3",
      type: "payout",
      creatorName: "한정지",
      amount: 2200000,
      status: "failed",
      processedAt: new Date("2024-07-29T16:45:00"),
      level: 1
    },
  ]
}

const chartConfig = {
  pending: {
    label: "정산 대기",
    color: "hsl(var(--chart-1))",
  },
  paid: {
    label: "정산 완료",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

function formatCurrency(amount: number): string {
  if (amount >= 100000000) { // 1억 이상
    return `${(amount / 100000000).toFixed(1)}억원`
  } else if (amount >= 10000) { // 1만 이상
    return `${Math.floor(amount / 10000)}만원`
  } else {
    return `${amount.toLocaleString()}원`
  }
}

function getLevelBadge(level: number) {
  const colors = {
    1: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    2: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    3: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
  }
  
  return (
    <Badge className={colors[level as keyof typeof colors]}>
      {level}단계
    </Badge>
  )
}

function getStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">완료</Badge>
    case "processing":
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">처리중</Badge>
    case "failed":
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">실패</Badge>
    case "pending":
      return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">대기</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function getDaysUntilDue(dueDate: Date): number {
  const now = new Date()
  const diff = dueDate.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  
  if (days > 0) {
    return `${days}일 전`
  } else if (hours > 0) {
    return `${hours}시간 전`
  } else {
    const minutes = Math.floor(diff / (1000 * 60))
    return `${minutes}분 전`
  }
}

export function AdminCommissionOverview() {
  const [searchQuery, setSearchQuery] = React.useState("")

  const handleProcessPayment = async (paymentId: string) => {
    // 실제 구현에서는 Supabase API 호출
    console.log("수수료 지급 처리:", paymentId)
  }

  const handleDownloadReport = () => {
    // 실제 구현에서는 Excel/CSV 파일 생성
    console.log("정산 보고서 다운로드")
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* 수수료 요약 및 차트 */}
      <div className="grid grid-cols-1 gap-6 @3xl/main:grid-cols-3">
        {/* 수수료 요약 통계 */}
        <div className="space-y-4 @3xl/main:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <IconCash className="h-5 w-5" />
                수수료 정산 현황
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">정산 대기</span>
                  <span className="text-sm font-mono">
                    {formatCurrency(commissionData.summary.totalPending)}
                  </span>
                </div>
                <Progress value={65} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">정산 완료</span>
                  <span className="text-sm font-mono">
                    {formatCurrency(commissionData.summary.totalPaid)}
                  </span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>월 성장률</span>
                  <span className="flex items-center gap-1 text-green-600">
                    <IconTrendingUp className="h-3 w-3" />
                    {commissionData.summary.monthlyGrowth}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span>평균 처리시간</span>
                  <span className="font-mono">
                    {commissionData.summary.averageProcessingTime}일
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 월별 수수료 차트 */}
        <Card className="@3xl/main:col-span-2">
          <CardHeader>
            <CardTitle>월별 수수료 정산 현황</CardTitle>
            <CardDescription>정산 대기 및 완료 금액 추이</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <BarChart data={commissionData.monthlyStats}>
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${Math.floor(value / 10000)}만`} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => [
                        formatCurrency(value as number),
                        name === "pending" ? "정산 대기" : "정산 완료"
                      ]}
                    />
                  }
                />
                <Bar dataKey="pending" fill="var(--color-pending)" />
                <Bar dataKey="paid" fill="var(--color-paid)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* 정산 관리 테이블 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-1.5 @md/main:flex-row @md/main:items-center @md/main:justify-between @md/main:space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <IconClock className="h-5 w-5" />
                수수료 정산 관리
              </CardTitle>
              <CardDescription>
                정산 대기 중인 수수료와 최근 거래 내역을 관리합니다
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="크리에이터 검색..."
                  className="pl-8 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <IconFilter className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleDownloadReport}>
                <IconDownload className="h-4 w-4 mr-2" />
                보고서
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                정산 대기
                <Badge variant="secondary" className="ml-1">
                  {commissionData.pendingPayments.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex items-center gap-2">
                최근 거래
              </TabsTrigger>
            </TabsList>
            
            {/* 정산 대기 */}
            <TabsContent value="pending">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>크리에이터</TableHead>
                      <TableHead>금액</TableHead>
                      <TableHead>단계</TableHead>
                      <TableHead>캠페인</TableHead>
                      <TableHead>마감일</TableHead>
                      <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commissionData.pendingPayments.map((payment) => {
                      const daysUntilDue = getDaysUntilDue(payment.dueDate)
                      return (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {payment.creatorName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{payment.creatorName}</div>
                                <div className="text-sm text-muted-foreground">
                                  {payment.creatorEmail}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell>
                            {getLevelBadge(payment.level)}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-48 truncate" title={payment.campaignTitle}>
                              {payment.campaignTitle}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">
                                {payment.dueDate.toLocaleDateString("ko-KR")}
                              </span>
                              {daysUntilDue <= 3 && (
                                <Badge variant="destructive" className="text-xs">
                                  <IconAlertTriangle className="h-3 w-3 mr-1" />
                                  긴급
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <IconMoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => handleProcessPayment(payment.id)}
                                  className="text-green-600"
                                >
                                  <IconCheck className="h-4 w-4 mr-2" />
                                  지급 처리
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  상세보기
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  지급 보류
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            {/* 최근 거래 */}
            <TabsContent value="recent">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>크리에이터</TableHead>
                      <TableHead>금액</TableHead>
                      <TableHead>단계</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>처리 시간</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commissionData.recentTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {transaction.creatorName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{transaction.creatorName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell>
                          {getLevelBadge(transaction.level)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(transaction.status)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatTimeAgo(transaction.processedAt)}
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
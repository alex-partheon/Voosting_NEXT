"use client"

import * as React from "react"
import {
  IconCircleCheckFilled,
  IconClock,
  IconLoader,
  IconEye,
  IconCalendar,
  IconTrendingUp,
  IconDotsVertical,
  IconExternalLink
} from "@tabler/icons-react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCreatorCampaigns } from "@/hooks/use-dashboard-data"
import type { CampaignApplicationWithDetails, ApplicationStatus, CampaignStatus } from "@/types/supabase"

interface CreatorCampaignsTableProps {
  userId: string
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

// 압축 숫자 포맷
function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'K'
  }
  return num.toString()
}

// 날짜 포맷팅
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// 지원서 상태를 캠페인 상태로 매핑
function mapApplicationStatusToCampaignStatus(status: ApplicationStatus): "active" | "completed" | "pending" {
  switch (status) {
    case 'approved':
      return 'active'
    case 'completed':
      return 'completed'
    case 'pending':
    case 'rejected':
    default:
      return 'pending'
  }
}

// D-day 계산
function calculateDday(deadlineStr: string): string {
  const deadline = new Date(deadlineStr)
  const today = new Date()
  const diffTime = deadline.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return "마감"
  if (diffDays === 0) return "오늘"
  if (diffDays === 1) return "내일"
  return `D-${diffDays}`
}

// 상태별 배지 스타일
function getStatusBadge(status: Campaign["status"]) {
  switch (status) {
    case "completed":
      return (
        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
          <IconCircleCheckFilled className="w-3 h-3 mr-1 fill-current" />
          완료
        </Badge>
      )
    case "active":
      return (
        <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
          <IconLoader className="w-3 h-3 mr-1" />
          진행중
        </Badge>
      )
    case "pending":
      return (
        <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
          <IconClock className="w-3 h-3 mr-1" />
          대기중
        </Badge>
      )
  }
}

// 카테고리별 색상
function getCategoryBadge(category: string) {
  const categoryColors: Record<string, string> = {
    "테크/IT": "bg-blue-100 text-blue-800",
    "뷰티/화장품": "bg-pink-100 text-pink-800",
    "가전/생활": "bg-green-100 text-green-800",
    "자동차": "bg-yellow-100 text-yellow-800",
    "핀테크": "bg-purple-100 text-purple-800"
  }

  return (
    <Badge variant="secondary" className={`${categoryColors[category] || "bg-gray-100 text-gray-800"}`}>
      {category}
    </Badge>
  )
}

const columns: ColumnDef<Campaign>[] = [
  {
    accessorKey: "title",
    header: "캠페인명",
    cell: ({ row }) => {
      const campaign = row.original
      return (
        <div className="flex flex-col gap-1 min-w-[200px]">
          <div className="font-medium line-clamp-2">
            {campaign.title}
          </div>
          <div className="text-sm text-muted-foreground">
            {campaign.brand}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "category",
    header: "카테고리",
    cell: ({ row }) => getCategoryBadge(row.getValue("category")),
  },
  {
    accessorKey: "status",
    header: "상태",
    cell: ({ row }) => getStatusBadge(row.getValue("status")),
  },
  {
    accessorKey: "deadline",
    header: "마감일",
    cell: ({ row }) => {
      const deadline = row.getValue("deadline") as string
      const dday = calculateDday(deadline)
      const isUrgent = deadline && new Date(deadline).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000
      
      return (
        <div className="flex flex-col gap-1">
          <div className="text-sm font-medium">
            {formatDate(deadline)}
          </div>
          <Badge 
            variant="outline" 
            className={`w-fit text-xs ${isUrgent ? 'text-red-600 border-red-200 bg-red-50' : 'text-muted-foreground'}`}
          >
            <IconCalendar className="w-3 h-3 mr-1" />
            {dday}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "reward",
    header: () => <div className="text-right">보상</div>,
    cell: ({ row }) => {
      const reward = row.getValue("reward") as number
      return (
        <div className="text-right font-semibold">
          {formatKoreanWon(reward)}
        </div>
      )
    },
  },
  {
    accessorKey: "performance",
    header: () => <div className="text-center">성과</div>,
    cell: ({ row }) => {
      const performance = row.getValue("performance") as number | null
      const reach = row.original.reach
      
      if (performance === null || reach === null) {
        return (
          <div className="text-center text-muted-foreground text-sm">
            진행중
          </div>
        )
      }
      
      return (
        <div className="flex flex-col items-center gap-2 min-w-[100px]">
          <div className="w-full">
            <div className="flex justify-between text-xs mb-1">
              <span>성과</span>
              <span className="font-semibold">{performance}%</span>
            </div>
            <Progress value={performance} className="h-2" />
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <IconEye className="w-3 h-3" />
            {formatCompactNumber(reach)}
          </div>
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const campaign = row.original
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 data-[state=open]:bg-muted"
            >
              <IconDotsVertical className="h-4 w-4" />
              <span className="sr-only">메뉴 열기</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem>
              <IconEye className="h-4 w-4 mr-2" />
              상세 보기
            </DropdownMenuItem>
            <DropdownMenuItem>
              <IconExternalLink className="h-4 w-4 mr-2" />
              캠페인 보기
            </DropdownMenuItem>
            {campaign.status === "active" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  성과 업데이트
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function CreatorCampaignsTable({ userId }: CreatorCampaignsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [activeTab, setActiveTab] = React.useState("all")

  // 캠페인 데이터 조회
  const { data: campaignApplications, loading, error, refresh } = useCreatorCampaigns(userId, {
    onError: (error) => {
      console.error('캠페인 목록 조회 실패:', error);
    }
  })

  // 데이터 변환 - CampaignApplicationWithDetails를 기존 Campaign 형식으로 매핑
  const campaigns = React.useMemo(() => {
    if (!campaignApplications) return []
    
    return campaignApplications.map(app => ({
      id: parseInt(app.id, 10),
      title: app.campaign?.title || '제목 없음',
      brand: '브랜드명', // TODO: business profile에서 가져오기
      category: app.campaign?.category || '기타',
      status: mapApplicationStatusToCampaignStatus(app.status),
      participationDate: app.created_at,
      deadline: app.campaign?.end_date || '',
      reward: app.requested_compensation || app.campaign?.budget || 0,
      performance: null, // TODO: 성과 데이터 추가
      reach: null // TODO: 도달 수 데이터 추가
    }))
  }, [campaignApplications])

  // 탭에 따른 데이터 필터링
  const filteredCampaigns = React.useMemo(() => {
    switch (activeTab) {
      case "active":
        return campaigns.filter(c => c.status === "active")
      case "completed":
        return campaigns.filter(c => c.status === "completed")
      case "pending":
        return campaigns.filter(c => c.status === "pending")
      default:
        return campaigns
    }
  }, [campaigns, activeTab])

  const table = useReactTable({
    data: filteredCampaigns,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const activeCampaigns = campaigns.filter(c => c.status === "active").length
  const completedCampaigns = campaigns.filter(c => c.status === "completed").length
  const pendingCampaigns = campaigns.filter(c => c.status === "pending").length

  // 로딩 상태
  if (loading) {
    return (
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <Skeleton className="h-12 w-12" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-16" />
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
      <div className="px-4 lg:px-6">
        <Alert>
          <AlertDescription>
            <div className="space-y-2">
              <p>캠페인 데이터를 불러오는 중 문제가 발생했습니다.</p>
              <p className="text-sm text-muted-foreground">{error.message}</p>
              <Button onClick={refresh} size="sm" variant="outline">
                다시 시도
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="px-4 lg:px-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">캠페인 관리</h2>
          <TabsList className="grid w-fit grid-cols-4">
            <TabsTrigger value="all">
              전체 <Badge variant="secondary" className="ml-1">{campaigns.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="active">
              진행중 <Badge variant="secondary" className="ml-1">{activeCampaigns}</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed">
              완료 <Badge variant="secondary" className="ml-1">{completedCampaigns}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending">
              대기 <Badge variant="secondary" className="ml-1">{pendingCampaigns}</Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab}>
          <div className="space-y-4">
            {/* 검색 및 필터 */}
            <div className="flex items-center gap-4">
              <Input
                placeholder="캠페인명 또는 브랜드명으로 검색..."
                value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn("title")?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
              />
            </div>

            {/* 테이블 */}
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className="hover:bg-muted/50"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        캠페인이 없습니다.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* 페이지네이션 */}
            {table.getPageCount() > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  총 {filteredCampaigns.length}개 중 {table.getRowModel().rows.length}개 표시
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    이전
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    다음
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
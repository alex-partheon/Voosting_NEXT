"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

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

// 수익 및 거래량 데이터 (실제 구현에서는 Supabase에서 가져올 예정)
const revenueData = [
  { date: "2024-07-01", revenue: 15000000, transactions: 45, users: 120 },
  { date: "2024-07-02", revenue: 18200000, transactions: 52, users: 135 },
  { date: "2024-07-03", revenue: 12800000, transactions: 38, users: 98 },
  { date: "2024-07-04", revenue: 22100000, transactions: 67, users: 156 },
  { date: "2024-07-05", revenue: 28500000, transactions: 81, users: 189 },
  { date: "2024-07-06", revenue: 25300000, transactions: 74, users: 167 },
  { date: "2024-07-07", revenue: 19900000, transactions: 58, users: 142 },
  { date: "2024-07-08", revenue: 31200000, transactions: 89, users: 203 },
  { date: "2024-07-09", revenue: 16700000, transactions: 49, users: 128 },
  { date: "2024-07-10", revenue: 24800000, transactions: 71, users: 178 },
  { date: "2024-07-11", revenue: 27600000, transactions: 79, users: 186 },
  { date: "2024-07-12", revenue: 20400000, transactions: 62, users: 151 },
  { date: "2024-07-13", revenue: 17800000, transactions: 53, users: 139 },
  { date: "2024-07-14", revenue: 35100000, transactions: 98, users: 221 },
  { date: "2024-07-15", revenue: 29800000, transactions: 85, users: 195 },
  { date: "2024-07-16", revenue: 23500000, transactions: 68, users: 164 },
  { date: "2024-07-17", revenue: 32700000, transactions: 93, users: 208 },
  { date: "2024-07-18", revenue: 26100000, transactions: 76, users: 171 },
  { date: "2024-07-19", revenue: 18900000, transactions: 55, users: 134 },
  { date: "2024-07-20", revenue: 21300000, transactions: 64, users: 159 },
  { date: "2024-07-21", revenue: 14500000, transactions: 42, users: 115 },
  { date: "2024-07-22", revenue: 16200000, transactions: 47, users: 126 },
  { date: "2024-07-23", revenue: 38600000, transactions: 106, users: 234 },
  { date: "2024-07-24", revenue: 33900000, transactions: 97, users: 218 },
  { date: "2024-07-25", revenue: 28200000, transactions: 82, users: 192 },
  { date: "2024-07-26", revenue: 25800000, transactions: 75, users: 176 },
  { date: "2024-07-27", revenue: 41200000, transactions: 112, users: 246 },
  { date: "2024-07-28", revenue: 27900000, transactions: 81, users: 185 },
  { date: "2024-07-29", revenue: 19400000, transactions: 57, users: 141 },
  { date: "2024-07-30", revenue: 36800000, transactions: 103, users: 228 },
]

const chartConfig = {
  revenue: {
    label: "수수료 수익",
    color: "var(--primary)",
  },
  transactions: {
    label: "거래건수",
    color: "hsl(var(--chart-2))",
  },
  users: {
    label: "신규 사용자",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

function formatCurrency(value: number): string {
  return `${(value / 10000).toFixed(0)}만원`
}

export function AdminRevenueChart() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("30d")
  const [metric, setMetric] = React.useState("revenue")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = React.useMemo(() => {
    const endDate = new Date("2024-07-30")
    let daysToSubtract = 30
    
    if (timeRange === "7d") {
      daysToSubtract = 7
    } else if (timeRange === "14d") {
      daysToSubtract = 14
    }
    
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    
    return revenueData.filter((item) => {
      const itemDate = new Date(item.date)
      return itemDate >= startDate && itemDate <= endDate
    })
  }, [timeRange])

  const totalRevenue = filteredData.reduce((sum, item) => sum + item.revenue, 0)
  const totalTransactions = filteredData.reduce((sum, item) => sum + item.transactions, 0)

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex flex-col space-y-1.5">
          <CardTitle className="flex items-center gap-2">
            플랫폼 수익 현황
          </CardTitle>
          <CardDescription>
            <span className="hidden @[540px]/card:block">
              총 수수료 수익 {formatCurrency(totalRevenue)} · {totalTransactions}건 거래
            </span>
            <span className="@[540px]/card:hidden">
              {formatCurrency(totalRevenue)} · {totalTransactions}건
            </span>
          </CardDescription>
        </div>
        
        <CardAction className="flex flex-col gap-2 @[600px]/card:flex-row">
          {/* 지표 선택 */}
          <Select value={metric} onValueChange={setMetric}>
            <SelectTrigger
              className="w-full @[600px]/card:w-40"
              aria-label="지표 선택"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="revenue" className="rounded-lg">
                수수료 수익
              </SelectItem>
              <SelectItem value="transactions" className="rounded-lg">
                거래건수
              </SelectItem>
              <SelectItem value="users" className="rounded-lg">
                신규 사용자
              </SelectItem>
            </SelectContent>
          </Select>

          {/* 기간 선택 */}
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-3 @[500px]/card:flex"
          >
            <ToggleGroupItem value="7d">7일</ToggleGroupItem>
            <ToggleGroupItem value="14d">14일</ToggleGroupItem>
            <ToggleGroupItem value="30d">30일</ToggleGroupItem>
          </ToggleGroup>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-full **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[500px]/card:hidden"
              aria-label="기간 선택"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="7d" className="rounded-lg">
                최근 7일
              </SelectItem>
              <SelectItem value="14d" className="rounded-lg">
                최근 14일
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                최근 30일
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillTransactions" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-transactions)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-transactions)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-users)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-users)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("ko-KR", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                if (metric === "revenue") {
                  return `${(value / 10000).toFixed(0)}만`
                }
                return value.toString()
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("ko-KR", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                  formatter={(value, name) => {
                    if (name === "revenue") {
                      return [formatCurrency(value as number), "수수료 수익"]
                    } else if (name === "transactions") {
                      return [`${value}건`, "거래건수"]
                    } else if (name === "users") {
                      return [`${value}명`, "신규 사용자"]
                    }
                    return [value, name]
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey={metric}
              type="natural"
              fill={`url(#fill${metric.charAt(0).toUpperCase() + metric.slice(1)})`}
              stroke={`var(--color-${metric})`}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
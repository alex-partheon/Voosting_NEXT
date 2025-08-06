"use client"

import { IconServer, IconDatabase, IconCloud, IconShield, IconActivity, IconAlertTriangle, IconCircleCheck, IconRefresh } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

// 시스템 상태 데이터 (실제 구현에서는 실시간 모니터링 API에서 가져올 예정)
const systemStatus = {
  overall: "healthy", // healthy, warning, critical
  services: [
    {
      name: "웹 서버",
      status: "healthy",
      uptime: 99.97,
      responseTime: 145,
      icon: IconServer,
      lastCheck: new Date().getTime() - 30000, // 30초 전
    },
    {
      name: "데이터베이스",
      status: "healthy",
      uptime: 99.99,
      responseTime: 12,
      icon: IconDatabase,
      lastCheck: new Date().getTime() - 15000, // 15초 전
    },
    {
      name: "인증 서비스",
      status: "warning",
      uptime: 99.85,
      responseTime: 230,
      icon: IconShield,
      lastCheck: new Date().getTime() - 45000, // 45초 전
    },
    {
      name: "스토리지",
      status: "healthy",
      uptime: 99.95,
      responseTime: 89,
      icon: IconCloud,
      lastCheck: new Date().getTime() - 20000, // 20초 전
    },
  ],
  metrics: {
    cpuUsage: 45,
    memoryUsage: 67,
    diskUsage: 32,
    networkLoad: 23,
  },
  alerts: [
    {
      id: 1,
      severity: "warning",
      message: "인증 서비스 응답 시간이 평균보다 높습니다",
      timestamp: new Date().getTime() - 120000, // 2분 전
    },
    {
      id: 2,
      severity: "info",
      message: "메모리 사용량이 70%에 근접했습니다",
      timestamp: new Date().getTime() - 300000, // 5분 전
    },
  ]
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "healthy":
      return "default"
    case "warning":
      return "secondary"
    case "critical":
      return "destructive"
    default:
      return "outline"
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "healthy":
      return "text-green-600"
    case "warning":
      return "text-yellow-600"
    case "critical":
      return "text-red-600"
    default:
      return "text-gray-600"
  }
}

function formatTimeAgo(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  
  if (minutes > 0) {
    return `${minutes}분 전`
  } else {
    return `${seconds}초 전`
  }
}

export function AdminSystemStatus() {
  return (
    <div className="grid grid-cols-1 gap-6 px-4 lg:px-6 @3xl/main:grid-cols-2">
      {/* 서비스 상태 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconActivity className="h-5 w-5" />
            시스템 서비스 상태
          </CardTitle>
          <CardDescription>
            전체 시스템 상태: {" "}
            <Badge variant={getStatusBadgeVariant(systemStatus.overall)} className="ml-1">
              {systemStatus.overall === "healthy" ? "정상" : 
               systemStatus.overall === "warning" ? "주의" : "위험"}
            </Badge>
          </CardDescription>
          <CardAction>
            <Button variant="outline" size="sm">
              <IconRefresh className="h-4 w-4" />
              새로고침
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4">
          {systemStatus.services.map((service) => (
            <div key={service.name} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <service.icon className={`h-5 w-5 ${getStatusColor(service.status)}`} />
                <div>
                  <div className="font-medium">{service.name}</div>
                  <div className="text-sm text-muted-foreground">
                    가동률 {service.uptime}% · {service.responseTime}ms
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={getStatusBadgeVariant(service.status)} className="mb-1">
                  {service.status === "healthy" ? (
                    <IconCircleCheck className="h-3 w-3 mr-1" />
                  ) : (
                    <IconAlertTriangle className="h-3 w-3 mr-1" />
                  )}
                  {service.status === "healthy" ? "정상" : 
                   service.status === "warning" ? "주의" : "위험"}
                </Badge>
                <div className="text-xs text-muted-foreground">
                  {formatTimeAgo(service.lastCheck)}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 시스템 리소스 및 알림 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconServer className="h-5 w-5" />
            시스템 리소스
          </CardTitle>
          <CardDescription>
            서버 리소스 사용률 현황
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 리소스 사용률 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>CPU 사용률</span>
                <span className="font-mono">{systemStatus.metrics.cpuUsage}%</span>
              </div>
              <Progress value={systemStatus.metrics.cpuUsage} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>메모리 사용률</span>
                <span className="font-mono">{systemStatus.metrics.memoryUsage}%</span>
              </div>
              <Progress value={systemStatus.metrics.memoryUsage} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>디스크 사용률</span>
                <span className="font-mono">{systemStatus.metrics.diskUsage}%</span>
              </div>
              <Progress value={systemStatus.metrics.diskUsage} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>네트워크 부하</span>
                <span className="font-mono">{systemStatus.metrics.networkLoad}%</span>
              </div>
              <Progress value={systemStatus.metrics.networkLoad} className="h-2" />
            </div>
          </div>

          <Separator />

          {/* 최근 알림 */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">최근 알림</h4>
            {systemStatus.alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 rounded-lg border-l-4 bg-muted/50"
                style={{
                  borderLeftColor: alert.severity === "warning" ? "#f59e0b" : "#3b82f6"
                }}
              >
                {alert.severity === "warning" ? (
                  <IconAlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                ) : (
                  <IconActivity className="h-4 w-4 text-blue-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="text-sm font-medium">{alert.message}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatTimeAgo(alert.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
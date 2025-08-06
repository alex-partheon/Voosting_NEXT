/**
 * 대시보드 전용 에러 바운더리와 에러 처리 컴포넌트들
 * React Error Boundary와 API 에러를 모두 처리
 */

"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  IconAlertTriangle, 
  IconRefresh, 
  IconHome, 
  IconBug,
  IconWifi,
  IconShield,
  IconClock
} from "@tabler/icons-react"
import type { DashboardError } from "@/lib/dashboard-data"

// 에러 타입별 아이콘과 메시지 정의
const ERROR_CONFIGS = {
  // 네트워크 관련 에러
  FETCH_ERROR: {
    icon: IconWifi,
    title: '네트워크 연결 오류',
    description: '서버와의 연결에 문제가 있습니다. 인터넷 연결을 확인하고 다시 시도해 주세요.',
    recoverable: true,
  },
  TIMEOUT_ERROR: {
    icon: IconClock,
    title: '요청 시간 초과',
    description: '서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.',
    recoverable: true,
  },
  
  // 인증/권한 관련 에러
  AUTH_EXPIRED: {
    icon: IconShield,
    title: '인증 만료',
    description: '로그인 세션이 만료되었습니다. 다시 로그인해 주세요.',
    recoverable: false,
    actionLabel: '로그인 페이지로',
    actionUrl: '/auth/sign-in',
  },
  UNAUTHORIZED: {
    icon: IconShield,
    title: '접근 권한 없음',
    description: '이 페이지에 접근할 권한이 없습니다.',
    recoverable: false,
  },
  ACCESS_DENIED: {
    icon: IconShield,
    title: '접근 거부',
    description: '관리자 권한이 필요한 페이지입니다.',
    recoverable: false,
  },

  // 데이터 관련 에러
  NOT_FOUND: {
    icon: IconAlertTriangle,
    title: '데이터를 찾을 수 없음',
    description: '요청한 데이터가 존재하지 않거나 삭제되었습니다.',
    recoverable: true,
  },
  VALIDATION_ERROR: {
    icon: IconBug,
    title: '데이터 형식 오류',
    description: '서버에서 받은 데이터 형식이 올바르지 않습니다.',
    recoverable: true,
  },

  // 기타 에러
  UNKNOWN_ERROR: {
    icon: IconAlertTriangle,
    title: '알 수 없는 오류',
    description: '예상치 못한 오류가 발생했습니다. 문제가 계속되면 관리자에게 문의해 주세요.',
    recoverable: true,
  },
} as const

interface ErrorDisplayProps {
  error: DashboardError | Error | null
  onRetry?: () => void
  onHome?: () => void
  showDetails?: boolean
  compact?: boolean
}

/**
 * 에러 정보를 사용자 친화적으로 표시하는 컴포넌트
 */
export function ErrorDisplay({ 
  error, 
  onRetry, 
  onHome,
  showDetails = false,
  compact = false 
}: ErrorDisplayProps) {
  if (!error) return null

  // DashboardError에서 설정 가져오기
  const isDashboardError = error && typeof error === 'object' && 'code' in error
  const errorCode = isDashboardError ? (error as DashboardError).code : 'UNKNOWN_ERROR'
  const config = ERROR_CONFIGS[errorCode as keyof typeof ERROR_CONFIGS] || ERROR_CONFIGS.UNKNOWN_ERROR

  const Icon = config.icon
  const errorMessage = isDashboardError ? (error as DashboardError).message : error.message

  if (compact) {
    return (
      <Alert className="border-destructive/50 text-destructive">
        <Icon className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <p className="font-medium">{config.title}</p>
            <p className="text-sm opacity-90">{config.description}</p>
          </div>
          {config.recoverable && onRetry && (
            <Button onClick={onRetry} size="sm" variant="outline">
              <IconRefresh className="w-4 h-4" />
            </Button>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-destructive" />
        </div>
        <CardTitle className="text-destructive">{config.title}</CardTitle>
        <CardDescription className="text-base">
          {config.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="text-center space-y-4">
        {/* 에러 세부 정보 (개발 모드에서만) */}
        {showDetails && (
          <details className="text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              기술적 세부 정보 보기
            </summary>
            <div className="mt-2 p-3 bg-muted rounded text-sm font-mono">
              <p><strong>에러 코드:</strong> {errorCode}</p>
              <p><strong>메시지:</strong> {errorMessage}</p>
              {isDashboardError && (error as DashboardError).details && (
                <>
                  <p><strong>상세:</strong></p>
                  <pre className="mt-1 text-xs overflow-auto max-h-32">
                    {JSON.stringify((error as DashboardError).details, null, 2)}
                  </pre>
                </>
              )}
            </div>
          </details>
        )}

        {/* 액션 버튼들 */}
        <div className="flex gap-2 justify-center">
          {config.recoverable && onRetry && (
            <Button onClick={onRetry} size="sm">
              <IconRefresh className="w-4 h-4 mr-2" />
              다시 시도
            </Button>
          )}
          
          {'actionUrl' in config && config.actionUrl ? (
            <Button 
              onClick={() => window.location.href = config.actionUrl!} 
              size="sm" 
              variant={config.recoverable ? "outline" : "default"}
            >
              {'actionLabel' in config ? config.actionLabel : '이동'}
            </Button>
          ) : (
            onHome && (
              <Button 
                onClick={onHome} 
                size="sm" 
                variant={config.recoverable ? "outline" : "default"}
              >
                <IconHome className="w-4 h-4 mr-2" />
                홈으로
              </Button>
            )
          )}
        </div>
        
        {/* 추가 도움말 */}
        {errorCode === 'FETCH_ERROR' && (
          <div className="text-sm text-muted-foreground">
            <p>문제가 지속되는 경우:</p>
            <ul className="mt-1 space-y-1 text-left">
              <li>• 인터넷 연결 상태를 확인해 주세요</li>
              <li>• VPN을 사용 중이라면 잠시 해제해 보세요</li>
              <li>• 브라우저 캐시를 삭제해 보세요</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * React Error Boundary 컴포넌트
 */
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class DashboardErrorBoundary extends React.Component<
  React.PropsWithChildren<{
    fallback?: React.ComponentType<{ error: Error; retry: () => void }>
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  }>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{
    fallback?: React.ComponentType<{ error: Error; retry: () => void }>
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  }>) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo })
    
    // 로깅
    console.error('Dashboard Error Boundary caught an error:', error, errorInfo)
    
    // 선택적 에러 리포팅
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback

      if (FallbackComponent) {
        return <FallbackComponent error={this.state.error} retry={this.handleRetry} />
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <ErrorDisplay
            error={this.state.error}
            onRetry={this.handleRetry}
            onHome={() => window.location.href = '/'}
            showDetails={process.env.NODE_ENV === 'development'}
          />
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * 로딩 실패 시 표시하는 플레이스홀더
 */
export function LoadingErrorPlaceholder({ 
  error, 
  onRetry, 
  height = "200px" 
}: {
  error: DashboardError | Error
  onRetry: () => void
  height?: string
}) {
  return (
    <div className="flex items-center justify-center p-6" style={{ minHeight: height }}>
      <div className="text-center space-y-4 max-w-sm">
        <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
          <IconAlertTriangle className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium text-sm">데이터를 불러올 수 없습니다</p>
          <p className="text-sm text-muted-foreground">
            {'message' in error ? error.message : '알 수 없는 오류가 발생했습니다'}
          </p>
        </div>
        <Button onClick={onRetry} size="sm" variant="outline">
          <IconRefresh className="w-4 h-4 mr-2" />
          다시 시도
        </Button>
      </div>
    </div>
  )
}

/**
 * 빈 데이터 상태를 표시하는 컴포넌트
 */
export function EmptyStateDisplay({ 
  title, 
  description, 
  action 
}: {
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}) {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="text-center space-y-4 max-w-sm">
        <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
          <IconAlertTriangle className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {action && (
          <Button onClick={action.onClick} size="sm">
            {action.label}
          </Button>
        )}
      </div>
    </div>
  )
}

/**
 * HOC for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: React.ComponentType<{ error: Error; retry: () => void }>
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  }
) {
  return function WrappedComponent(props: P) {
    return (
      <DashboardErrorBoundary 
        fallback={options?.fallback} 
        onError={options?.onError}
      >
        <Component {...props} />
      </DashboardErrorBoundary>
    )
  }
}
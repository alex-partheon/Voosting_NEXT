/**
 * 대시보드 데이터 새로고침과 실시간 업데이트 관리
 * 수동/자동 새로고침, 실시간 구독, 백그라운드 업데이트 지원
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { getDashboardService } from '@/lib/dashboard-data'
import type { UserRole } from '@/types/supabase'

// 새로고침 상태 인터페이스
interface RefreshState {
  isRefreshing: boolean
  lastRefreshed: Date | null
  error: string | null
}

// 자동 새로고침 옵션
interface AutoRefreshOptions {
  enabled?: boolean
  interval?: number // milliseconds (default: 30000 = 30초)
  onlyWhenVisible?: boolean // 탭이 활성화된 경우만 새로고침
  maxRetries?: number // 실패 시 최대 재시도 횟수
}

// 실시간 구독 옵션
interface RealtimeOptions {
  enabled?: boolean
  userId?: string
  debounceMs?: number // 연속 업데이트 방지용 debounce (default: 1000ms)
}

/**
 * 대시보드 데이터 새로고침 훅
 */
export function useDashboardRefresh(options: {
  refreshFn: () => Promise<void>
  autoRefresh?: AutoRefreshOptions
  realtime?: RealtimeOptions
} = { refreshFn: async () => {} }) {
  const [state, setState] = useState<RefreshState>({
    isRefreshing: false,
    lastRefreshed: null,
    error: null,
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const retryCountRef = useRef(0)
  const lastUpdateRef = useRef<number>(0)
  const subscriptionRef = useRef<{ unsubscribeAll: () => void } | null>(null)

  const {
    autoRefresh = { enabled: false },
    realtime = { enabled: false },
    refreshFn,
  } = options

  // 수동 새로고침
  const refresh = useCallback(async (showLoading: boolean = true) => {
    if (state.isRefreshing) return

    try {
      if (showLoading) {
        setState(prev => ({ ...prev, isRefreshing: true, error: null }))
      }

      await refreshFn()
      
      setState(prev => ({
        ...prev,
        isRefreshing: false,
        lastRefreshed: new Date(),
        error: null,
      }))

      retryCountRef.current = 0 // 성공 시 재시도 카운트 리셋

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '새로고침 중 오류가 발생했습니다'
      
      setState(prev => ({
        ...prev,
        isRefreshing: false,
        error: errorMessage,
      }))

      console.error('Dashboard refresh error:', error)
    }
  }, [refreshFn, state.isRefreshing])

  // 백그라운드 새로고침 (로딩 인디케이터 없음)
  const backgroundRefresh = useCallback(() => {
    refresh(false)
  }, [refresh])

  // 자동 새로고침 설정
  useEffect(() => {
    if (!autoRefresh.enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    const interval = autoRefresh.interval || 30000 // 30초 기본값
    const maxRetries = autoRefresh.maxRetries || 3

    const performAutoRefresh = async () => {
      // 탭이 비활성화된 경우 건너뛰기
      if (autoRefresh.onlyWhenVisible && document.hidden) {
        return
      }

      // 이미 새로고침 중이면 건너뛰기
      if (state.isRefreshing) {
        return
      }

      // 최대 재시도 횟수 확인
      if (retryCountRef.current >= maxRetries) {
        console.warn(`Auto refresh stopped after ${maxRetries} consecutive failures`)
        return
      }

      try {
        await backgroundRefresh()
      } catch (error) {
        retryCountRef.current++
        console.warn(`Auto refresh failed (attempt ${retryCountRef.current}/${maxRetries}):`, error)
      }
    }

    intervalRef.current = setInterval(performAutoRefresh, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [autoRefresh, backgroundRefresh, state.isRefreshing])

  // 실시간 구독 설정
  useEffect(() => {
    if (!realtime.enabled || !realtime.userId) {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribeAll()
        subscriptionRef.current = null
      }
      return
    }

    const debounceMs = realtime.debounceMs || 1000

    // debounced refresh 함수
    const debouncedRefresh = () => {
      const now = Date.now()
      const timeSinceLastUpdate = now - lastUpdateRef.current

      if (timeSinceLastUpdate < debounceMs) {
        // 너무 빨리 연속으로 업데이트되는 경우 지연
        setTimeout(() => {
          if (Date.now() - lastUpdateRef.current >= debounceMs) {
            backgroundRefresh()
          }
        }, debounceMs - timeSinceLastUpdate)
        return
      }

      lastUpdateRef.current = now
      backgroundRefresh()
    }

    // 실시간 구독 시작
    subscriptionRef.current = getDashboardService().subscribeToUserData(
      realtime.userId,
      {
        onCampaignUpdate: (payload) => {
          console.log('Campaign update received:', payload.eventType)
          debouncedRefresh()
        },
        onApplicationUpdate: (payload) => {
          console.log('Application update received:', payload.eventType)
          debouncedRefresh()
        },
        onPaymentUpdate: (payload) => {
          console.log('Payment update received:', payload.eventType)
          debouncedRefresh()
        },
        onReferralUpdate: (payload) => {
          console.log('Referral update received:', payload.eventType)
          debouncedRefresh()
        },
      }
    )

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribeAll()
        subscriptionRef.current = null
      }
    }
  }, [realtime, backgroundRefresh])

  // 페이지 visibility 변경 시 처리
  useEffect(() => {
    if (!autoRefresh.onlyWhenVisible) return

    const handleVisibilityChange = () => {
      if (!document.hidden && autoRefresh.enabled) {
        // 탭이 활성화되면 즉시 새로고침 (5초 이상 비활성화된 경우에만)
        const timeSinceLastRefresh = state.lastRefreshed 
          ? Date.now() - state.lastRefreshed.getTime() 
          : Infinity

        if (timeSinceLastRefresh > 5000) { // 5초
          backgroundRefresh()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [autoRefresh.onlyWhenVisible, autoRefresh.enabled, state.lastRefreshed, backgroundRefresh])

  // 컴포넌트 언마운트 시 cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribeAll()
      }
    }
  }, [])

  return {
    ...state,
    refresh,
    backgroundRefresh,
    isAutoRefreshEnabled: autoRefresh.enabled,
    isRealtimeEnabled: realtime.enabled,
  }
}

/**
 * 역할별 자동 새로고침 설정 프리셋
 */
export const REFRESH_PRESETS = {
  creator: {
    autoRefresh: {
      enabled: true,
      interval: 60000, // 1분
      onlyWhenVisible: true,
      maxRetries: 3,
    },
    realtime: {
      enabled: true,
      debounceMs: 2000,
    },
  },
  business: {
    autoRefresh: {
      enabled: true,
      interval: 30000, // 30초 (비즈니스는 더 자주 업데이트)
      onlyWhenVisible: true,
      maxRetries: 5,
    },
    realtime: {
      enabled: true,
      debounceMs: 1000,
    },
  },
  admin: {
    autoRefresh: {
      enabled: true,
      interval: 20000, // 20초 (관리자는 가장 자주 업데이트)
      onlyWhenVisible: true,
      maxRetries: 5,
    },
    realtime: {
      enabled: true,
      debounceMs: 500,
    },
  },
} as const

/**
 * 역할별 프리셋을 사용하는 편의 훅
 */
export function useRoleBasedRefresh(
  role: UserRole,
  userId: string,
  refreshFn: () => Promise<void>,
  overrides?: {
    autoRefresh?: Partial<AutoRefreshOptions>
    realtime?: Partial<RealtimeOptions>
  }
) {
  const preset = REFRESH_PRESETS[role]
  
  const autoRefreshOptions = {
    ...preset.autoRefresh,
    ...overrides?.autoRefresh,
  }
  
  const realtimeOptions = {
    ...preset.realtime,
    userId,
    ...overrides?.realtime,
  }

  return useDashboardRefresh({
    refreshFn,
    autoRefresh: autoRefreshOptions,
    realtime: realtimeOptions,
  })
}

/**
 * 네트워크 상태를 감지하여 자동 새로고침을 조절하는 훅
 */
export function useNetworkAwareRefresh(
  refreshFn: () => Promise<void>,
  userId?: string,
  role?: UserRole
) {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // 온라인 복구 시 즉시 새로고침
      refreshFn().catch(console.error)
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [refreshFn])

  const refreshOptions = useRoleBasedRefresh(
    role || 'creator',
    userId || '',
    refreshFn,
    {
      autoRefresh: {
        enabled: isOnline, // 오프라인 시 자동 새로고침 비활성화
      },
      realtime: {
        enabled: isOnline, // 오프라인 시 실시간 구독 비활성화
      },
    }
  )

  return {
    ...refreshOptions,
    isOnline,
  }
}
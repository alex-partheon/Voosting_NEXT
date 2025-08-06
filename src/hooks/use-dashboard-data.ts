/**
 * 대시보드 데이터 fetching을 위한 React hooks
 * 로딩 상태, 에러 처리, 실시간 업데이트, 캐싱을 지원
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getDashboardService, type DashboardResponse, type DashboardError } from '@/lib/dashboard-data';
import { validateDashboardStats } from '@/lib/dashboard-schemas';
import type { 
  Profile,
  CreatorDashboardStats,
  BusinessDashboardStats,
  AdminDashboardStats,
  CampaignApplicationWithDetails,
  CampaignWithCreator,
  UserRole
} from '@/types/supabase';

// ===========================================
// 기본 hooks 인터페이스
// ===========================================

interface UseDataState<T> {
  data: T | null;
  loading: boolean;
  error: DashboardError | null;
}

interface UseDataActions {
  refresh: () => Promise<void>;
  clearError: () => void;
}

type UseDataReturn<T> = UseDataState<T> & UseDataActions;

// ===========================================
// 공통 데이터 fetching hook
// ===========================================

function useAsyncData<T>(
  fetchFn: () => Promise<DashboardResponse<T>>,
  deps: React.DependencyList = [],
  options: {
    immediate?: boolean;
    validateFn?: (data: T) => boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: DashboardError) => void;
  } = {}
): UseDataReturn<T> {
  const [state, setState] = useState<UseDataState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchRef = useRef<AbortController | null>(null);
  const {
    immediate = true,
    validateFn,
    onSuccess,
    onError,
  } = options;

  const fetchData = useCallback(async () => {
    // 이전 요청 취소
    if (fetchRef.current) {
      fetchRef.current.abort();
    }

    // 새 요청 시작
    fetchRef.current = new AbortController();
    
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetchFn();
      
      // 요청이 취소되었는지 확인
      if (fetchRef.current.signal.aborted) {
        return;
      }

      if (response.error) {
        setState({
          data: null,
          loading: false,
          error: response.error,
        });
        onError?.(response.error);
        return;
      }

      if (response.data) {
        // 선택적 데이터 검증
        if (validateFn && !validateFn(response.data)) {
          const validationError: DashboardError = {
            message: '서버에서 받은 데이터가 유효하지 않습니다',
            code: 'VALIDATION_ERROR',
          };
          setState({
            data: null,
            loading: false,
            error: validationError,
          });
          onError?.(validationError);
          return;
        }

        setState({
          data: response.data,
          loading: false,
          error: null,
        });
        onSuccess?.(response.data);
      }
    } catch (error) {
      // 요청이 취소되었는지 확인
      if (fetchRef.current?.signal.aborted) {
        return;
      }

      const dashboardError: DashboardError = {
        message: error instanceof Error ? error.message : '예상치 못한 오류가 발생했습니다',
        code: 'FETCH_ERROR',
        details: error,
      };

      setState({
        data: null,
        loading: false,
        error: dashboardError,
      });
      onError?.(dashboardError);
    }
  }, deps);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // 컴포넌트 마운트 시 자동 fetch
  useEffect(() => {
    if (immediate) {
      fetchData();
    }

    // 컴포넌트 언마운트 시 cleanup
    return () => {
      if (fetchRef.current) {
        fetchRef.current.abort();
      }
    };
  }, deps);

  return {
    ...state,
    refresh: fetchData,
    clearError,
  };
}

// ===========================================
// 사용자 프로필 hooks
// ===========================================

/**
 * 현재 사용자 프로필 조회
 */
export function useCurrentUser(options?: {
  onSuccess?: (user: Profile) => void;
  onError?: (error: DashboardError) => void;
}) {
  return useAsyncData(
    () => getDashboardService().getCurrentUser(),
    [], // deps 없음 (항상 현재 사용자)
    {
      onSuccess: options?.onSuccess,
      onError: options?.onError,
    }
  );
}

/**
 * 사용자 역할 검증 hook
 */
export function useUserRole(): {
  role: UserRole | null;
  isCreator: boolean;
  isBusiness: boolean;
  isAdmin: boolean;
  loading: boolean;
} {
  const { data: user, loading } = useCurrentUser();

  return {
    role: user?.role || null,
    isCreator: user?.role === 'creator',
    isBusiness: user?.role === 'business',
    isAdmin: user?.role === 'admin',
    loading,
  };
}

// ===========================================
// Creator 대시보드 hooks
// ===========================================

/**
 * 크리에이터 대시보드 통계
 */
export function useCreatorDashboardStats(userId: string, options?: {
  onSuccess?: (stats: CreatorDashboardStats) => void;
  onError?: (error: DashboardError) => void;
}) {
  return useAsyncData(
    () => getDashboardService().getCreatorDashboardStats(userId),
    [userId],
    {
      validateFn: (data) => {
        const validation = validateDashboardStats('creator', data);
        return validation.success;
      },
      onSuccess: options?.onSuccess,
      onError: options?.onError,
    }
  );
}

/**
 * 크리에이터의 캠페인 목록
 */
export function useCreatorCampaigns(userId: string, options?: {
  onSuccess?: (campaigns: CampaignApplicationWithDetails[]) => void;
  onError?: (error: DashboardError) => void;
}) {
  return useAsyncData(
    () => getDashboardService().getCreatorCampaigns(userId),
    [userId],
    {
      onSuccess: options?.onSuccess,
      onError: options?.onError,
    }
  );
}

/**
 * 크리에이터의 월별 통계
 */
export function useCreatorMonthlyStats(
  userId: string, 
  months: number = 6,
  options?: {
    onSuccess?: (stats: Array<{
      month: string;
      campaigns: number;
      revenue: number;
      applications: number;
    }>) => void;
    onError?: (error: DashboardError) => void;
  }
) {
  return useAsyncData(
    () => getDashboardService().getCreatorMonthlyStats(userId, months),
    [userId, months],
    {
      onSuccess: options?.onSuccess,
      onError: options?.onError,
    }
  );
}

// ===========================================
// Business 대시보드 hooks
// ===========================================

/**
 * 비즈니스 대시보드 통계
 */
export function useBusinessDashboardStats(userId: string, options?: {
  onSuccess?: (stats: BusinessDashboardStats) => void;
  onError?: (error: DashboardError) => void;
}) {
  return useAsyncData(
    () => getDashboardService().getBusinessDashboardStats(userId),
    [userId],
    {
      validateFn: (data) => {
        const validation = validateDashboardStats('business', data);
        return validation.success;
      },
      onSuccess: options?.onSuccess,
      onError: options?.onError,
    }
  );
}

/**
 * 비즈니스의 캠페인 목록
 */
export function useBusinessCampaigns(userId: string, options?: {
  onSuccess?: (campaigns: CampaignWithCreator[]) => void;
  onError?: (error: DashboardError) => void;
}) {
  return useAsyncData(
    () => getDashboardService().getBusinessCampaigns(userId),
    [userId],
    {
      onSuccess: options?.onSuccess,
      onError: options?.onError,
    }
  );
}

// ===========================================
// Admin 대시보드 hooks
// ===========================================

/**
 * 관리자 대시보드 통계
 */
export function useAdminDashboardStats(options?: {
  onSuccess?: (stats: AdminDashboardStats) => void;
  onError?: (error: DashboardError) => void;
}) {
  return useAsyncData(
    () => getDashboardService().getAdminDashboardStats(),
    [], // 관리자는 전체 통계이므로 deps 없음
    {
      validateFn: (data) => {
        const validation = validateDashboardStats('admin', data);
        return validation.success;
      },
      onSuccess: options?.onSuccess,
      onError: options?.onError,
    }
  );
}

/**
 * 관리자용 사용자 목록
 */
export function useAdminUsersList(
  options?: {
    page?: number;
    limit?: number;
    role?: UserRole;
    search?: string;
  },
  callbacks?: {
    onSuccess?: (data: { users: Profile[]; total: number }) => void;
    onError?: (error: DashboardError) => void;
  }
) {
  return useAsyncData(
    () => getDashboardService().getAdminUsersList(options),
    [options?.page, options?.limit, options?.role, options?.search],
    {
      onSuccess: callbacks?.onSuccess,
      onError: callbacks?.onError,
    }
  );
}

// ===========================================
// 실시간 업데이트 hooks
// ===========================================

/**
 * 실시간 데이터 구독
 */
export function useRealtimeSubscription(
  userId: string,
  callbacks: {
    onCampaignUpdate?: (payload: any) => void;
    onApplicationUpdate?: (payload: any) => void;
    onPaymentUpdate?: (payload: any) => void;
    onReferralUpdate?: (payload: any) => void;
  },
  enabled: boolean = true
) {
  const subscriptionRef = useRef<{ unsubscribeAll: () => void } | null>(null);

  useEffect(() => {
    if (!enabled || !userId) {
      return;
    }

    // 구독 시작
    subscriptionRef.current = getDashboardService().subscribeToUserData(
      userId,
      callbacks
    );

    // cleanup
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribeAll();
        subscriptionRef.current = null;
      }
    };
  }, [userId, enabled, Object.values(callbacks).join(',')]);

  // 구독 상태 제어
  const unsubscribe = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribeAll();
      subscriptionRef.current = null;
    }
  }, []);

  return {
    isSubscribed: subscriptionRef.current !== null,
    unsubscribe,
  };
}

// ===========================================
// 통합 대시보드 hook
// ===========================================

/**
 * 역할별 통합 대시보드 데이터
 * 사용자의 역할을 자동 감지하여 적절한 데이터를 가져옴
 */
export function useDashboardData() {
  const { data: user, loading: userLoading, error: userError } = useCurrentUser();
  const [stats, setStats] = useState<CreatorDashboardStats | BusinessDashboardStats | AdminDashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<DashboardError | null>(null);

  // 역할별 통계 데이터 가져오기
  useEffect(() => {
    if (!user || userLoading) {
      return;
    }

    const fetchStats = async () => {
      setStatsLoading(true);
      setStatsError(null);

      try {
        let response: DashboardResponse<any>;

        switch (user.role) {
          case 'creator':
            response = await getDashboardService().getCreatorDashboardStats(user.id);
            break;
          case 'business':
            response = await getDashboardService().getBusinessDashboardStats(user.id);
            break;
          case 'admin':
            response = await getDashboardService().getAdminDashboardStats();
            break;
          default:
            throw new Error(`지원되지 않는 사용자 역할: ${user.role}`);
        }

        if (response.error) {
          setStatsError(response.error);
        } else {
          setStats(response.data);
        }
      } catch (error) {
        setStatsError({
          message: error instanceof Error ? error.message : '통계 데이터를 가져오는 중 오류가 발생했습니다',
          code: 'STATS_FETCH_ERROR',
          details: error,
        });
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [user, userLoading]);

  // 실시간 업데이트 구독 (데이터 새로고침 트리거)
  const { isSubscribed } = useRealtimeSubscription(
    user?.id || '',
    {
      onCampaignUpdate: () => {
        // 캠페인 업데이트 시 통계 새로고침
        if (user && (user.role === 'business' || user.role === 'admin')) {
          setStatsLoading(true);
          // debounce를 위한 약간의 지연
          setTimeout(async () => {
            try {
              let response: DashboardResponse<any>;
              if (user.role === 'business') {
                response = await getDashboardService().getBusinessDashboardStats(user.id);
              } else {
                response = await getDashboardService().getAdminDashboardStats();
              }
              
              if (response.data) {
                setStats(response.data);
              }
            } catch (error) {
              console.error('실시간 업데이트 중 오류:', error);
            } finally {
              setStatsLoading(false);
            }
          }, 1000);
        }
      },
      onApplicationUpdate: () => {
        // 지원서 업데이트 시 크리에이터 통계 새로고침
        if (user && user.role === 'creator') {
          setStatsLoading(true);
          setTimeout(async () => {
            try {
              const response = await getDashboardService().getCreatorDashboardStats(user.id);
              if (response.data) {
                setStats(response.data);
              }
            } catch (error) {
              console.error('실시간 업데이트 중 오류:', error);
            } finally {
              setStatsLoading(false);
            }
          }, 1000);
        }
      },
      onPaymentUpdate: () => {
        // 결제 업데이트 시 모든 역할의 통계 새로고침 (수익 관련)
        if (user) {
          setStatsLoading(true);
          setTimeout(async () => {
            try {
              let response: DashboardResponse<any>;
              switch (user.role) {
                case 'creator':
                  response = await getDashboardService().getCreatorDashboardStats(user.id);
                  break;
                case 'business':
                  response = await getDashboardService().getBusinessDashboardStats(user.id);
                  break;
                case 'admin':
                  response = await getDashboardService().getAdminDashboardStats();
                  break;
                default:
                  return;
              }
              
              if (response.data) {
                setStats(response.data);
              }
            } catch (error) {
              console.error('실시간 업데이트 중 오류:', error);
            } finally {
              setStatsLoading(false);
            }
          }, 1000);
        }
      },
      onReferralUpdate: () => {
        // 추천 수익 업데이트 시 크리에이터와 관리자 통계 새로고침
        if (user && (user.role === 'creator' || user.role === 'admin')) {
          setStatsLoading(true);
          setTimeout(async () => {
            try {
              let response: DashboardResponse<any>;
              if (user.role === 'creator') {
                response = await getDashboardService().getCreatorDashboardStats(user.id);
              } else {
                response = await getDashboardService().getAdminDashboardStats();
              }
              
              if (response.data) {
                setStats(response.data);
              }
            } catch (error) {
              console.error('실시간 업데이트 중 오류:', error);
            } finally {
              setStatsLoading(false);
            }
          }, 1000);
        }
      },
    },
    !!user // 사용자가 있을 때만 구독
  );

  return {
    user,
    stats,
    loading: userLoading || statsLoading,
    error: userError || statsError,
    isSubscribed,
    refresh: async () => {
      if (user) {
        setStatsLoading(true);
        setStatsError(null);
        
        try {
          let response: DashboardResponse<any>;
          switch (user.role) {
            case 'creator':
              response = await getDashboardService().getCreatorDashboardStats(user.id);
              break;
            case 'business':
              response = await getDashboardService().getBusinessDashboardStats(user.id);
              break;
            case 'admin':
              response = await getDashboardService().getAdminDashboardStats();
              break;
            default:
              throw new Error(`지원되지 않는 사용자 역할: ${user.role}`);
          }

          if (response.error) {
            setStatsError(response.error);
          } else {
            setStats(response.data);
          }
        } catch (error) {
          setStatsError({
            message: error instanceof Error ? error.message : '데이터 새로고침 중 오류가 발생했습니다',
            code: 'REFRESH_ERROR',
            details: error,
          });
        } finally {
          setStatsLoading(false);
        }
      }
    },
  };
}
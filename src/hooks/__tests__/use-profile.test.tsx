import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProfile, useProfileWithStats, useProfileExists } from '../use-profile';
import { createBrowserClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import type { ReactNode } from 'react';

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createBrowserClient: jest.fn(),
  handleClientError: jest.fn((error) => error),
  onAuthStateChange: jest.fn(() => ({
    data: { subscription: { unsubscribe: jest.fn() } },
  })),
}));

// Mock Auth Store
jest.mock('@/stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

describe('useProfile Hook', () => {
  let queryClient: QueryClient;
  let wrapper: ({ children }: { children: ReactNode }) => JSX.Element;
  let mockSupabase: any;
  let mockAuthStore: any;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    // Mock Supabase client
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(),
    };

    (createBrowserClient as jest.Mock).mockReturnValue(mockSupabase);

    // Mock Auth Store
    mockAuthStore = {
      setUser: jest.fn(),
      clearAuth: jest.fn(),
      updateProfile: jest.fn(),
    };

    (useAuthStore as jest.Mock).mockReturnValue(mockAuthStore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('프로필 조회', () => {
    it('인증된 사용자의 프로필을 성공적으로 조회해야 함', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'creator',
        full_name: 'Test User',
        referral_code: 'TEST123',
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useProfile(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockProfile);
      expect(result.current.isError).toBe(false);
      expect(result.current.error).toBe(null);
      expect(mockAuthStore.setUser).toHaveBeenCalledWith({
        id: mockProfile.id,
        email: mockProfile.email,
        role: mockProfile.role,
        profile: mockProfile,
      });
    });

    it('인증되지 않은 경우 에러를 반환해야 함', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const { result } = renderHook(() => useProfile(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.data).toBeUndefined();
      expect(result.current.error?.message).toBe('NOT_AUTHENTICATED');
      expect(mockAuthStore.clearAuth).toHaveBeenCalled();
    });

    it('JWT 토큰 만료 시 AUTH_EXPIRED 에러를 반환해야 함', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'JWT expired' },
      });

      const { result } = renderHook(() => useProfile(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe('AUTH_EXPIRED');
      expect(mockAuthStore.clearAuth).toHaveBeenCalled();
    });

    it('RLS 정책 위반 시 PERMISSION_DENIED 에러를 반환해야 함', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST301' },
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useProfile(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe('PERMISSION_DENIED');
    });

    it('프로필이 없는 경우 PROFILE_NOT_FOUND 에러를 반환해야 함', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' },
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useProfile(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe('PROFILE_NOT_FOUND');
    });
  });

  describe('프로필 업데이트', () => {
    it('프로필을 성공적으로 업데이트해야 함', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'creator',
        full_name: 'Test User',
      };
      const updatedProfile = { ...mockProfile, full_name: 'Updated Name' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: updatedProfile,
                error: null,
              }),
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useProfile(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.update({ full_name: 'Updated Name' });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });

      expect(mockAuthStore.updateProfile).toHaveBeenCalledWith(updatedProfile);
    });
  });

  describe('useProfileWithStats', () => {
    it('크리에이터의 통계를 포함한 프로필을 조회해야 함', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'creator',
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockProfile,
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'campaign_applications') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({
                  data: [],
                  count: 5,
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'referral_earnings') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({
                  data: [{ amount: 1000 }, { amount: 2000 }],
                  error: null,
                }),
              }),
            }),
          };
        }
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: [],
              count: 3,
              error: null,
            }),
          }),
        };
      });

      const { result } = renderHook(() => useProfileWithStats(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.role).toBe('creator');
      expect(result.current.stats).toEqual({
        totalCampaigns: 5,
        totalEarnings: 3000,
        totalReferrals: 3,
        completedProjects: 5,
        activeProjects: 0,
        successRate: 100,
      });
    });
  });

  describe('useProfileExists', () => {
    it('프로필이 존재하는 경우 true를 반환해야 함', async () => {
      const userId = 'user-123';

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: userId },
              error: null,
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useProfileExists(userId), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBe(true);
    });

    it('프로필이 존재하지 않는 경우 false를 반환해야 함', async () => {
      const userId = 'non-existent';

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' },
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useProfileExists(userId), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBe(false);
    });
  });
});
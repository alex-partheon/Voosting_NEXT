/**
 * useSupabase Hook 테스트
 * Migrated from Clerk to Supabase Auth
 */

import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react';

// Mock Supabase Auth
const mockSupabaseAuth = {
  getSession: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChange: jest.fn(),
};

const mockSupabaseClient = {
  auth: mockSupabaseAuth,
};

// Mock Supabase client
const mockCreateBrowserClient = jest.fn();
const mockGetDatabaseService = jest.fn();
const mockOnAuthStateChange = jest.fn();

jest.mock('@/lib/supabase/client', () => ({
  createBrowserClient: () => mockSupabaseClient,
  getDatabaseService: () => mockGetDatabaseService(),
  onAuthStateChange: (callback: any) => mockOnAuthStateChange(callback),
  handleClientError: jest.fn((error) => ({
    message: error.message || 'Unknown error',
    code: error.code || 'UNKNOWN_ERROR',
  })),
}));

import { useSupabase, useRequireRole, useRealtimeSubscription, useFileUpload } from '../use-supabase';

describe('useSupabase', () => {
  let mockDatabaseService: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDatabaseService = {
      getCurrentUserProfile: jest.fn(),
      updateUserProfile: jest.fn(),
      createRealtimeSubscription: jest.fn(),
      uploadFile: jest.fn(),
      deleteFile: jest.fn(),
    };

    mockGetDatabaseService.mockReturnValue(mockDatabaseService);
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } });
    mockSupabaseAuth.getSession.mockResolvedValue({ data: { session: null }, error: null });
  });

  test('로딩 상태를 올바르게 관리한다', async () => {
    mockSupabaseAuth.getSession.mockResolvedValue({ 
      data: { session: null }, 
      error: null 
    });

    const { result } = renderHook(() => useSupabase());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
  });

  test('인증된 사용자의 상태를 올바르게 반환한다', async () => {
    const mockUser = { id: 'test-user-id', email: 'test@example.com' };
    const mockProfile = { id: 'test-user-id', email: 'test@example.com', role: 'creator' };

    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { 
        session: { 
          user: mockUser,
          access_token: 'test-token',
          refresh_token: 'test-refresh-token'
        } 
      },
      error: null
    });

    mockDatabaseService.getCurrentUserProfile.mockResolvedValue({
      data: mockProfile,
      error: null,
    });

    const { result } = renderHook(() => useSupabase());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.userRole).toBe('creator');
    expect(result.current.error).toBeNull();
  });

  test('인증되지 않은 사용자의 상태를 올바르게 반환한다', async () => {
    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    });

    const { result } = renderHook(() => useSupabase());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.profile).toBeNull();
    expect(result.current.userRole).toBeNull();
  });

  test('프로필 로딩 에러를 처리한다', async () => {
    const mockUser = { id: 'test-user-id', email: 'test@example.com' };

    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { 
        session: { 
          user: mockUser,
          access_token: 'test-token',
          refresh_token: 'test-refresh-token'
        } 
      },
      error: null
    });

    mockDatabaseService.getCurrentUserProfile.mockResolvedValue({
      data: null,
      error: { message: 'Profile not found' },
    });

    const { result } = renderHook(() => useSupabase());

    await waitFor(() => {
      expect(result.current.error).toBe('Profile not found');
    });

    expect(result.current.profile).toBeNull();
  });

  test('refreshProfile 함수가 올바르게 작동한다', async () => {
    const mockUser = { id: 'test-user-id', email: 'test@example.com' };
    const mockProfile = { id: 'test-user-id', email: 'test@example.com', role: 'creator' };

    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { 
        session: { 
          user: mockUser,
          access_token: 'test-token',
          refresh_token: 'test-refresh-token'
        } 
      },
      error: null
    });

    mockDatabaseService.getCurrentUserProfile
      .mockResolvedValueOnce({ data: null, error: { message: 'Not found' } })
      .mockResolvedValueOnce({ data: mockProfile, error: null });

    const { result } = renderHook(() => useSupabase());

    await waitFor(() => {
      expect(result.current.error).toBe('Not found');
    });

    await act(async () => {
      await result.current.refreshProfile();
    });

    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.error).toBeNull();
  });

  test('updateProfile 함수가 올바르게 작동한다', async () => {
    const mockUser = { id: 'test-user-id', email: 'test@example.com' };
    const mockProfile = { id: 'test-user-id', email: 'test@example.com', role: 'creator' };
    const updatedProfile = { ...mockProfile, full_name: 'Updated Name' };

    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { 
        session: { 
          user: mockUser,
          access_token: 'test-token',
          refresh_token: 'test-refresh-token'
        } 
      },
      error: null
    });

    mockDatabaseService.getCurrentUserProfile.mockResolvedValue({
      data: mockProfile,
      error: null,
    });

    mockDatabaseService.updateUserProfile.mockResolvedValue({
      data: updatedProfile,
      error: null,
    });

    const { result } = renderHook(() => useSupabase());

    await waitFor(() => {
      expect(result.current.profile).toEqual(mockProfile);
    });

    let updateResult;
    await act(async () => {
      updateResult = await result.current.updateProfile({ full_name: 'Updated Name' });
    });

    expect(updateResult).toBe(true);
    expect(result.current.profile).toEqual(updatedProfile);
    expect(mockDatabaseService.updateUserProfile).toHaveBeenCalledWith({ full_name: 'Updated Name' });
  });

  test('updateProfile에서 에러를 처리한다', async () => {
    const mockUser = { id: 'test-user-id', email: 'test@example.com' };

    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { 
        session: { 
          user: mockUser,
          access_token: 'test-token',
          refresh_token: 'test-refresh-token'
        } 
      },
      error: null
    });

    mockDatabaseService.updateUserProfile.mockResolvedValue({
      data: null,
      error: { message: 'Update failed' },
    });

    const { result } = renderHook(() => useSupabase());

    let updateResult;
    await act(async () => {
      updateResult = await result.current.updateProfile({ full_name: 'Test' });
    });

    expect(updateResult).toBe(false);
    expect(result.current.error).toBe('Update failed');
  });

  test('signOut 함수가 올바르게 작동한다', async () => {
    const mockUser = { id: 'test-user-id', email: 'test@example.com' };

    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { 
        session: { 
          user: mockUser,
          access_token: 'test-token',
          refresh_token: 'test-refresh-token'
        } 
      },
      error: null
    });

    mockSupabaseAuth.signOut.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useSupabase());

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockSupabaseAuth.signOut).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.profile).toBeNull();
    expect(result.current.error).toBeNull();
  });

  test('clearError 함수가 올바르게 작동한다', async () => {
    const mockUser = { id: 'test-user-id', email: 'test@example.com' };

    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { 
        session: { 
          user: mockUser,
          access_token: 'test-token',
          refresh_token: 'test-refresh-token'
        } 
      },
      error: null
    });

    mockDatabaseService.getCurrentUserProfile.mockResolvedValue({
      data: null,
      error: { message: 'Some error' },
    });

    const { result } = renderHook(() => useSupabase());

    await waitFor(() => {
      expect(result.current.error).toBe('Some error');
    });

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});

describe('useRequireRole', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDatabaseService.mockReturnValue({});
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } });
    mockSupabaseAuth.getSession.mockResolvedValue({ data: { session: null }, error: null });
  });

  test('필요한 역할을 가진 사용자를 허용한다', () => {
    // Mock useSupabase hook result
    jest.doMock('../use-supabase', () => ({
      useSupabase: () => ({
        userRole: 'creator',
        isLoading: false,
        isAuthenticated: true,
      }),
      useRequireRole: jest.requireActual('../use-supabase').useRequireRole,
    }));

    const { result } = renderHook(() => useRequireRole('creator'));

    expect(result.current.hasRequiredRole).toBe(true);
    expect(result.current.canAccess).toBe(true);
  });

  test('여러 역할 중 하나를 가진 사용자를 허용한다', () => {
    jest.doMock('../use-supabase', () => ({
      useSupabase: () => ({
        userRole: 'business',
        isLoading: false,
        isAuthenticated: true,
      }),
      useRequireRole: jest.requireActual('../use-supabase').useRequireRole,
    }));

    const { result } = renderHook(() => useRequireRole(['creator', 'business']));

    expect(result.current.hasRequiredRole).toBe(true);
    expect(result.current.canAccess).toBe(true);
  });

  test('필요한 역할을 가지지 않은 사용자를 거부한다', () => {
    jest.doMock('../use-supabase', () => ({
      useSupabase: () => ({
        userRole: 'creator',
        isLoading: false,
        isAuthenticated: true,
      }),
      useRequireRole: jest.requireActual('../use-supabase').useRequireRole,
    }));

    const { result } = renderHook(() => useRequireRole('admin'));

    expect(result.current.hasRequiredRole).toBe(false);
    expect(result.current.canAccess).toBe(false);
  });
});

describe('useRealtimeSubscription', () => {
  let mockDatabaseService: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDatabaseService = {
      createRealtimeSubscription: jest.fn(),
    };

    mockGetDatabaseService.mockReturnValue(mockDatabaseService);
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } });
    mockSupabaseAuth.getSession.mockResolvedValue({ data: { session: null }, error: null });
  });

  test('인증된 사용자에 대해 실시간 구독을 생성한다', () => {
    const mockUnsubscribe = jest.fn();
    mockDatabaseService.createRealtimeSubscription.mockReturnValue({
      subscription: {},
      unsubscribe: mockUnsubscribe,
    });

    jest.doMock('../use-supabase', () => ({
      useSupabase: () => ({
        db: mockDatabaseService,
        isAuthenticated: true,
      }),
      useRealtimeSubscription: jest.requireActual('../use-supabase').useRealtimeSubscription,
    }));

    const { result } = renderHook(() => useRealtimeSubscription('campaigns', 'filter'));

    expect(mockDatabaseService.createRealtimeSubscription).toHaveBeenCalledWith(
      'campaigns',
      'filter',
      expect.any(Function)
    );
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual([]);
  });

  test('인증되지 않은 사용자에 대해 구독을 생성하지 않는다', () => {
    jest.doMock('../use-supabase', () => ({
      useSupabase: () => ({
        db: mockDatabaseService,
        isAuthenticated: false,
      }),
      useRealtimeSubscription: jest.requireActual('../use-supabase').useRealtimeSubscription,
    }));

    const { result } = renderHook(() => useRealtimeSubscription('campaigns'));

    expect(mockDatabaseService.createRealtimeSubscription).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual([]);
  });
});

describe('useFileUpload', () => {
  let mockDatabaseService: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDatabaseService = {
      uploadFile: jest.fn(),
      deleteFile: jest.fn(),
    };

    mockGetDatabaseService.mockReturnValue(mockDatabaseService);
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } });
    mockSupabaseAuth.getSession.mockResolvedValue({ data: { session: null }, error: null });
  });

  test('파일 업로드를 올바르게 처리한다', async () => {
    const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const mockUploadResult = {
      url: 'https://example.com/test.txt',
      path: 'test/test.txt',
    };

    mockDatabaseService.uploadFile.mockResolvedValue({
      data: mockUploadResult,
      error: null,
    });

    jest.doMock('../use-supabase', () => ({
      useSupabase: () => ({
        db: mockDatabaseService,
      }),
      useFileUpload: jest.requireActual('../use-supabase').useFileUpload,
    }));

    const { result } = renderHook(() => useFileUpload('test-bucket'));

    let uploadResult;
    await act(async () => {
      uploadResult = await result.current.uploadFile(mockFile, 'test/test.txt');
    });

    expect(mockDatabaseService.uploadFile).toHaveBeenCalledWith(
      'test-bucket',
      'test/test.txt',
      mockFile,
      undefined
    );
    expect(uploadResult).toEqual(mockUploadResult);
    expect(result.current.isUploading).toBe(false);
  });

  test('파일 업로드 에러를 처리한다', async () => {
    const mockFile = new File(['test'], 'test.txt');

    mockDatabaseService.uploadFile.mockResolvedValue({
      data: null,
      error: { message: 'Upload failed' },
    });

    jest.doMock('../use-supabase', () => ({
      useSupabase: () => ({
        db: mockDatabaseService,
      }),
      useFileUpload: jest.requireActual('../use-supabase').useFileUpload,
    }));

    const { result } = renderHook(() => useFileUpload('test-bucket'));

    let uploadResult;
    await act(async () => {
      uploadResult = await result.current.uploadFile(mockFile, 'test/test.txt');
    });

    expect(uploadResult).toBeNull();
    expect(result.current.uploadError).toBe('Upload failed');
    expect(result.current.isUploading).toBe(false);
  });

  test('파일 삭제를 올바르게 처리한다', async () => {
    mockDatabaseService.deleteFile.mockResolvedValue({ error: null });

    jest.doMock('../use-supabase', () => ({
      useSupabase: () => ({
        db: mockDatabaseService,
      }),
      useFileUpload: jest.requireActual('../use-supabase').useFileUpload,
    }));

    const { result } = renderHook(() => useFileUpload('test-bucket'));

    let deleteResult;
    await act(async () => {
      deleteResult = await result.current.deleteFile(['test/test.txt']);
    });

    expect(mockDatabaseService.deleteFile).toHaveBeenCalledWith('test-bucket', ['test/test.txt']);
    expect(deleteResult).toBe(true);
    expect(result.current.uploadError).toBeNull();
  });
});
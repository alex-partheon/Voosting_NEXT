/**
 * Supabase 서버 클라이언트 테스트 (Supabase Auth 전용)
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { 
  createServerClient, 
  createAdminClient, 
  createMiddlewareClient,
  DatabaseService,
  createDatabaseService,
  createAdminDatabaseService,
  handleSupabaseError,
  rls
} from '../server';

// Mock modules
jest.mock('@supabase/ssr');
jest.mock('next/headers');
jest.mock('@/lib/env');

const mockCookies = {
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
};

const mockCreateServerClient = jest.fn();
const mockEnv = {
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_ANON_KEY: 'test-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
};

// Mock Next.js cookies properly
const mockCookiesFunction = jest.fn().mockResolvedValue(mockCookies);

// Setup mocks
beforeEach(() => {
  jest.clearAllMocks();
  
  // Mock Supabase SSR
  const mockSSR = require('@supabase/ssr');
  mockSSR.createServerClient = mockCreateServerClient;
  
  // Mock Next.js headers with proper async function
  const mockHeaders = require('next/headers');
  mockHeaders.cookies = mockCookiesFunction;
  
  // Mock environment
  const mockEnvModule = require('@/lib/env');
  mockEnvModule.env = mockEnv;
});

describe('createServerClient', () => {
  test('서버 클라이언트를 올바르게 생성한다', async () => {
    const mockClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    };
    
    mockCreateServerClient.mockReturnValue(mockClient);

    const client = await createServerClient();

    expect(mockCreateServerClient).toHaveBeenCalledWith(
      mockEnv.SUPABASE_URL,
      mockEnv.SUPABASE_ANON_KEY,
      expect.objectContaining({
        cookies: expect.objectContaining({
          get: expect.any(Function),
          set: expect.any(Function),
          remove: expect.any(Function),
        }),
      })
    );

    expect(client).toBe(mockClient);
  });

  test('쿠키 설정 시 에러가 발생해도 계속 진행한다', async () => {
    const mockClient = {};
    mockCreateServerClient.mockReturnValue(mockClient);
    
    mockCookies.set.mockImplementation(() => {
      throw new Error('cookies error');
    });

    const client = await createServerClient();

    expect(client).toBe(mockClient);
  });
});

describe('createAdminClient', () => {
  test('관리자 클라이언트를 올바르게 생성한다', () => {
    const mockClient = {};
    mockCreateServerClient.mockReturnValue(mockClient);

    const client = createAdminClient();

    expect(mockCreateServerClient).toHaveBeenCalledWith(
      mockEnv.SUPABASE_URL,
      mockEnv.SUPABASE_SERVICE_ROLE_KEY,
      expect.objectContaining({
        cookies: expect.objectContaining({
          get: expect.any(Function),
          set: expect.any(Function),
          remove: expect.any(Function),
        }),
      })
    );

    expect(client).toBe(mockClient);
  });

  test('Service Role Key가 없으면 에러를 던진다', () => {
    const originalKey = mockEnv.SUPABASE_SERVICE_ROLE_KEY;
    delete mockEnv.SUPABASE_SERVICE_ROLE_KEY;

    expect(() => createAdminClient()).toThrow('SUPABASE_SERVICE_ROLE_KEY is required for admin operations');

    mockEnv.SUPABASE_SERVICE_ROLE_KEY = originalKey;
  });
});

describe('createMiddlewareClient', () => {
  test('미들웨어 클라이언트를 올바르게 생성한다', () => {
    const mockClient = {};
    mockCreateServerClient.mockReturnValue(mockClient);

    const client = createMiddlewareClient();

    expect(mockCreateServerClient).toHaveBeenCalledWith(
      mockEnv.SUPABASE_URL,
      mockEnv.SUPABASE_ANON_KEY,
      expect.objectContaining({
        cookies: expect.objectContaining({
          get: expect.any(Function),
          set: expect.any(Function),
          remove: expect.any(Function),
        }),
      })
    );

    expect(client).toBe(mockClient);
  });
});

describe('DatabaseService', () => {
  let mockClient: any;
  let databaseService: DatabaseService;

  beforeEach(() => {
    mockClient = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      order: jest.fn().mockReturnThis(),
    };

    databaseService = new DatabaseService(mockClient);
  });

  describe('getCurrentUserProfile', () => {
    test('인증된 사용자의 프로필을 반환한다', async () => {
      const mockUser = { id: 'test-user-id', email: 'test@example.com' };
      const mockProfile = { id: 'test-user-id', email: 'test@example.com' };
      
      mockClient.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
      mockClient.single.mockResolvedValue({ data: mockProfile, error: null });

      const result = await databaseService.getCurrentUserProfile();

      expect(mockClient.from).toHaveBeenCalledWith('profiles');
      expect(mockClient.select).toHaveBeenCalledWith('*');
      expect(mockClient.eq).toHaveBeenCalledWith('id', 'test-user-id');
      expect(mockClient.single).toHaveBeenCalled();
      expect(result).toEqual({ data: mockProfile, error: null });
    });

    test('인증되지 않은 사용자는 에러를 반환한다', async () => {
      mockClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

      const result = await databaseService.getCurrentUserProfile();

      expect(result).toEqual({ data: null, error: { message: 'Not authenticated' } });
      expect(mockClient.from).not.toHaveBeenCalled();
    });
  });

  describe('updateUserProfile', () => {
    test('사용자 프로필을 업데이트한다', async () => {
      const mockUser = { id: 'test-user-id', email: 'test@example.com' };
      const updates = { full_name: 'Updated Name' };
      const mockUpdatedProfile = { id: 'test-user-id', full_name: 'Updated Name' };
      
      mockClient.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
      mockClient.single.mockResolvedValue({ data: mockUpdatedProfile, error: null });

      const result = await databaseService.updateUserProfile(updates);

      expect(mockClient.from).toHaveBeenCalledWith('profiles');
      expect(mockClient.update).toHaveBeenCalledWith(
        expect.objectContaining({
          ...updates,
          updated_at: expect.any(String),
        })
      );
      expect(mockClient.eq).toHaveBeenCalledWith('id', 'test-user-id');
      expect(result).toEqual({ data: mockUpdatedProfile, error: null });
    });

    test('인증되지 않은 사용자는 에러를 반환한다', async () => {
      mockClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

      const result = await databaseService.updateUserProfile({ full_name: 'Test' });

      expect(result).toEqual({ data: null, error: { message: 'Not authenticated' } });
      expect(mockClient.from).not.toHaveBeenCalled();
    });
  });

  describe('upsertUserProfile', () => {
    test('사용자 프로필을 생성 또는 업데이트한다', async () => {
      const profileData = { id: 'test-user-id', email: 'test@example.com' };
      const mockProfile = { ...profileData };
      
      mockClient.single.mockResolvedValue({ data: mockProfile, error: null });

      const result = await databaseService.upsertUserProfile(profileData);

      expect(mockClient.from).toHaveBeenCalledWith('profiles');
      expect(mockClient.upsert).toHaveBeenCalledWith(profileData);
      expect(mockClient.select).toHaveBeenCalled();
      expect(mockClient.single).toHaveBeenCalled();
      expect(result).toEqual({ data: mockProfile, error: null });
    });
  });

  describe('getReferralRelationships', () => {
    test('추천 관계를 조회한다', async () => {
      const userId = 'test-user-id';
      const mockReferralData = {
        id: userId,
        referral_code: 'ABC123',
        referrer_l1_id: 'referrer-1',
      };
      
      mockClient.single.mockResolvedValue({ data: mockReferralData, error: null });

      const result = await databaseService.getReferralRelationships(userId);

      expect(mockClient.from).toHaveBeenCalledWith('profiles');
      expect(mockClient.select).toHaveBeenCalledWith(expect.stringContaining('referral_code'));
      expect(mockClient.eq).toHaveBeenCalledWith('id', userId);
      expect(result).toEqual({ data: mockReferralData, error: null });
    });
  });

  describe('getReferredUsers', () => {
    test('추천받은 사용자 목록을 조회한다', async () => {
      const userId = 'test-user-id';
      const mockReferredUsers = [
        { id: 'user-1', full_name: 'User 1', email: 'user1@example.com' },
        { id: 'user-2', full_name: 'User 2', email: 'user2@example.com' },
      ];
      
      mockClient.order.mockResolvedValue({ data: mockReferredUsers, error: null });

      const result = await databaseService.getReferredUsers(userId);

      expect(mockClient.from).toHaveBeenCalledWith('profiles');
      expect(mockClient.select).toHaveBeenCalledWith('id, full_name, email, created_at');
      expect(mockClient.eq).toHaveBeenCalledWith('referrer_l1_id', userId);
      expect(mockClient.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual({ data: mockReferredUsers, error: null });
    });
  });
});

describe('createDatabaseService', () => {
  test('데이터베이스 서비스 인스턴스를 생성한다', async () => {
    const mockClient = {};
    mockCreateServerClient.mockResolvedValue(mockClient);

    // Mock the createServerClient function to be async
    jest.doMock('../server', () => ({
      ...jest.requireActual('../server'),
      createServerClient: jest.fn().mockResolvedValue(mockClient),
    }));

    const service = await createDatabaseService();

    expect(service).toBeInstanceOf(DatabaseService);
  }, 10000);
});

describe('createAdminDatabaseService', () => {
  test('관리자 데이터베이스 서비스 인스턴스를 생성한다', () => {
    const mockClient = {};
    mockCreateServerClient.mockReturnValue(mockClient);

    const service = createAdminDatabaseService();

    expect(service).toBeInstanceOf(DatabaseService);
  });
});

describe('handleSupabaseError', () => {
  test('NOT_FOUND 에러를 올바르게 처리한다', () => {
    const error = { code: 'PGRST116', message: 'No rows found' };
    
    const result = handleSupabaseError(error);

    expect(result).toEqual({
      message: 'Record not found',
      code: 'NOT_FOUND',
    });
  });

  test('UNAUTHORIZED 에러를 올바르게 처리한다', () => {
    const error = { code: 'PGRST301', message: 'Unauthorized' };
    
    const result = handleSupabaseError(error);

    expect(result).toEqual({
      message: 'Unauthorized access',
      code: 'UNAUTHORIZED',
    });
  });

  test('일반 에러를 올바르게 처리한다', () => {
    const error = { message: 'Something went wrong', code: 'UNKNOWN' };
    
    const result = handleSupabaseError(error);

    expect(result).toEqual({
      message: 'Something went wrong',
      code: 'UNKNOWN',
    });
  });

  test('메시지가 없는 에러를 처리한다', () => {
    const error = { code: 'TEST_ERROR' };
    
    const result = handleSupabaseError(error);

    expect(result).toEqual({
      message: 'An unexpected error occurred',
      code: 'TEST_ERROR',
    });
  });
});

describe('rls helper functions', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      auth: {
        getUser: jest.fn(),
        getSession: jest.fn(),
      },
    };
  });

  test('getCurrentUser가 올바른 사용자 정보를 반환한다', async () => {
    const mockUser = { id: 'test-user-id', email: 'test@example.com' };
    mockClient.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });

    const result = await rls.getCurrentUser(mockClient);

    expect(mockClient.auth.getUser).toHaveBeenCalled();
    expect(result).toEqual({ data: { user: mockUser }, error: null });
  });

  test('getCurrentSession이 올바른 세션 정보를 반환한다', async () => {
    const mockSession = { 
      user: { id: 'test-user-id', email: 'test@example.com' },
      access_token: 'test-token'
    };
    mockClient.auth.getSession.mockResolvedValue({ data: { session: mockSession }, error: null });

    const result = await rls.getCurrentSession(mockClient);

    expect(mockClient.auth.getSession).toHaveBeenCalled();
    expect(result).toEqual({ data: { session: mockSession }, error: null });
  });
});
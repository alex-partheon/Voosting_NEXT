/**
 * Supabase 클라이언트 사이드 클라이언트 테스트
 */

import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Mock browser environment
Object.defineProperty(window, 'location', {
  value: {
    hostname: 'localhost'
  },
  writable: true
});

import {
  createBrowserClient,
  getSupabaseClient,
  getDatabaseService,
  ClientDatabaseService,
  handleClientError,
  onAuthStateChange,
  refreshSession,
  getSession,
  resetClient
} from '../client';

// Mock modules
jest.mock('@supabase/ssr');
jest.mock('@/lib/env');

const mockCreateBrowserClient = jest.fn();
const mockEnv = {
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_ANON_KEY: 'test-anon-key',
};

// Mock modules
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn()
}));

jest.mock('@/lib/env', () => ({
  env: jest.fn()
}));

// Setup mocks
beforeEach(async () => {
  jest.clearAllMocks();
  resetClient(); // 각 테스트 전에 클라이언트 리셋
  
  const { createBrowserClient } = await import('@supabase/ssr');
  const { env } = await import('@/lib/env');
  
  (createBrowserClient as jest.Mock).mockImplementation(mockCreateBrowserClient);
  (env as jest.Mock).mockImplementation(() => mockEnv);
});

describe('createBrowserClient', () => {
  test('브라우저 클라이언트를 올바르게 생성한다', () => {
    const mockClient = { auth: {}, from: jest.fn() };
    mockCreateBrowserClient.mockReturnValue(mockClient);

    const client = createBrowserClient();

    expect(mockCreateBrowserClient).toHaveBeenCalledWith(
      mockEnv.SUPABASE_URL,
      mockEnv.SUPABASE_ANON_KEY
    );
    expect(client).toBe(mockClient);
  });

  test('싱글톤 패턴으로 동일한 인스턴스를 반환한다', () => {
    const mockClient = { auth: {}, from: jest.fn() };
    mockCreateBrowserClient.mockReturnValue(mockClient);

    const client1 = createBrowserClient();
    const client2 = createBrowserClient();

    expect(client1).toBe(client2);
    expect(mockCreateBrowserClient).toHaveBeenCalledTimes(1);
  });

  test('서버 사이드에서 호출하면 에러를 던진다', () => {
    // Mock server environment
    const originalWindow = global.window;
    delete (global as any).window;

    expect(() => createBrowserClient()).toThrow(
      'createBrowserClient can only be used in browser environment'
    );

    global.window = originalWindow;
  });
});

describe('getSupabaseClient', () => {
  test('브라우저 클라이언트를 반환한다', () => {
    const mockClient = { auth: {}, from: jest.fn() };
    mockCreateBrowserClient.mockReturnValue(mockClient);

    const client = getSupabaseClient();

    expect(client).toBe(mockClient);
  });
});

describe('ClientDatabaseService', () => {
  let mockClient: any;
  let databaseService: ClientDatabaseService;

  beforeEach(() => {
    mockClient = {
      auth: {
        getUser: jest.fn(),
        onAuthStateChange: jest.fn(),
        refreshSession: jest.fn(),
        getSession: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      channel: jest.fn().mockReturnThis(),
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
      removeChannel: jest.fn(),
      storage: {
        from: jest.fn().mockReturnThis(),
        upload: jest.fn(),
        remove: jest.fn(),
        list: jest.fn(),
        getPublicUrl: jest.fn(),
      },
    };

    mockCreateBrowserClient.mockReturnValue(mockClient);
    databaseService = new ClientDatabaseService();
  });

  describe('getCurrentUser', () => {
    test('현재 사용자를 반환한다', async () => {
      const mockUser = { id: 'test-user-id', email: 'test@example.com' };
      mockClient.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });

      const user = await databaseService.getCurrentUser();

      expect(mockClient.auth.getUser).toHaveBeenCalled();
      expect(user).toBe(mockUser);
    });

    test('에러 발생 시 null을 반환한다', async () => {
      mockClient.auth.getUser.mockResolvedValue({ 
        data: { user: null }, 
        error: { message: 'Not authenticated' } 
      });

      const user = await databaseService.getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe('getCurrentUserProfile', () => {
    test('현재 사용자 프로필을 반환한다', async () => {
      const mockUser = { id: 'test-user-id' };
      const mockProfile = { id: 'test-user-id', email: 'test@example.com' };
      
      mockClient.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
      mockClient.single.mockResolvedValue({ data: mockProfile, error: null });

      const result = await databaseService.getCurrentUserProfile();

      expect(mockClient.from).toHaveBeenCalledWith('profiles');
      expect(mockClient.select).toHaveBeenCalledWith('*');
      expect(mockClient.eq).toHaveBeenCalledWith('id', 'test-user-id');
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
      const mockUser = { id: 'test-user-id' };
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
  });

  describe('createRealtimeSubscription', () => {
    test('실시간 구독을 생성한다', () => {
      const mockSubscription = {};
      const callback = jest.fn();
      
      mockClient.subscribe.mockReturnValue(mockSubscription);

      const result = databaseService.createRealtimeSubscription('campaigns', 'filter', callback);

      expect(mockClient.channel).toHaveBeenCalledWith('realtime:campaigns');
      expect(mockClient.on).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaigns',
          filter: 'filter',
        },
        expect.any(Function)
      );
      expect(mockClient.subscribe).toHaveBeenCalled();
      expect(result).toEqual({
        subscription: mockSubscription,
        unsubscribe: expect.any(Function),
      });
    });

    test('구독 해제가 올바르게 작동한다', () => {
      const mockSubscription = {};
      mockClient.subscribe.mockReturnValue(mockSubscription);

      const { unsubscribe } = databaseService.createRealtimeSubscription('campaigns');
      unsubscribe();

      expect(mockClient.removeChannel).toHaveBeenCalledWith(mockSubscription);
    });
  });

  describe('uploadFile', () => {
    test('파일을 업로드한다', async () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const mockUploadData = { path: 'test/test.txt' };
      const mockPublicUrl = { publicUrl: 'https://example.com/test.txt' };
      
      mockClient.storage.upload.mockResolvedValue({ data: mockUploadData, error: null });
      mockClient.storage.getPublicUrl.mockReturnValue({ data: mockPublicUrl });

      const result = await databaseService.uploadFile('test-bucket', 'test/test.txt', mockFile);

      expect(mockClient.storage.from).toHaveBeenCalledWith('test-bucket');
      expect(mockClient.storage.upload).toHaveBeenCalledWith(
        'test/test.txt',
        mockFile,
        {
          cacheControl: '3600',
          contentType: 'text/plain',
          upsert: false,
        }
      );
      expect(result).toEqual({
        data: {
          ...mockUploadData,
          publicUrl: mockPublicUrl.publicUrl,
        },
        error: null,
      });
    });

    test('업로드 에러를 처리한다', async () => {
      const mockFile = new File(['test'], 'test.txt');
      const mockError = { message: 'Upload failed' };
      
      mockClient.storage.upload.mockResolvedValue({ data: null, error: mockError });

      const result = await databaseService.uploadFile('test-bucket', 'test/test.txt', mockFile);

      expect(result).toEqual({
        data: null,
        error: mockError,
      });
    });
  });
});

describe('getDatabaseService', () => {
  test('데이터베이스 서비스 인스턴스를 반환한다', () => {
    const mockClient = { auth: {}, from: jest.fn() };
    mockCreateBrowserClient.mockReturnValue(mockClient);

    const service = getDatabaseService();

    expect(service).toBeInstanceOf(ClientDatabaseService);
  });

  test('싱글톤 패턴으로 동일한 인스턴스를 반환한다', () => {
    const mockClient = { auth: {}, from: jest.fn() };
    mockCreateBrowserClient.mockReturnValue(mockClient);

    const service1 = getDatabaseService();
    const service2 = getDatabaseService();

    expect(service1).toBe(service2);
  });

  test('서버 사이드에서 호출하면 에러를 던진다', () => {
    const originalWindow = global.window;
    delete (global as any).window;

    expect(() => getDatabaseService()).toThrow(
      'getDatabaseService can only be used in browser environment'
    );

    global.window = originalWindow;
  });
});

describe('handleClientError', () => {
  test('NOT_FOUND 에러를 올바르게 처리한다', () => {
    const error = { code: 'PGRST116', message: 'No rows found' };
    
    const result = handleClientError(error);

    expect(result).toEqual({
      message: 'Record not found',
      code: 'NOT_FOUND',
    });
  });

  test('UNAUTHORIZED 에러를 올바르게 처리한다', () => {
    const error = { code: 'PGRST301', message: 'Unauthorized' };
    
    const result = handleClientError(error);

    expect(result).toEqual({
      message: 'Unauthorized access',
      code: 'UNAUTHORIZED',
    });
  });

  test('JWT 에러를 올바르게 처리한다', () => {
    const error = { message: 'JWT token expired' };
    
    const result = handleClientError(error);

    expect(result).toEqual({
      message: 'Authentication session expired',
      code: 'AUTH_EXPIRED',
    });
  });

  test('일반 에러를 올바르게 처리한다', () => {
    const error = { message: 'Something went wrong', code: 'UNKNOWN' };
    
    const result = handleClientError(error);

    expect(result).toEqual({
      message: 'Something went wrong',
      code: 'UNKNOWN',
    });
  });
});

describe('onAuthStateChange', () => {
  test('인증 상태 변경 리스너를 등록한다', () => {
    const mockClient = {
      auth: {
        onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: {} } }),
      },
    };
    const callback = jest.fn();
    
    mockCreateBrowserClient.mockReturnValue(mockClient);

    const subscription = onAuthStateChange(callback);

    expect(mockClient.auth.onAuthStateChange).toHaveBeenCalledWith(expect.any(Function));
    expect(subscription).toEqual({ data: { subscription: {} } });
  });
});

describe('refreshSession', () => {
  test('세션을 새로고침한다', async () => {
    const mockClient = {
      auth: {
        refreshSession: jest.fn().mockResolvedValue({ data: { session: {} }, error: null }),
      },
    };
    
    mockCreateBrowserClient.mockReturnValue(mockClient);

    const result = await refreshSession();

    expect(mockClient.auth.refreshSession).toHaveBeenCalled();
    expect(result).toEqual({ data: { session: {} }, error: null });
  });

  test('세션 새로고침 에러를 처리한다', async () => {
    const mockError = { message: 'Session refresh failed' };
    const mockClient = {
      auth: {
        refreshSession: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      },
    };
    
    mockCreateBrowserClient.mockReturnValue(mockClient);

    const result = await refreshSession();

    expect(result).toEqual({ data: null, error: mockError });
  });
});

describe('getSession', () => {
  test('현재 세션을 반환한다', async () => {
    const mockSession = { access_token: 'test-token' };
    const mockClient = {
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
      },
    };
    
    mockCreateBrowserClient.mockReturnValue(mockClient);

    const result = await getSession();

    expect(mockClient.auth.getSession).toHaveBeenCalled();
    expect(result).toEqual({ session: mockSession, error: null });
  });

  test('세션 조회 에러를 처리한다', async () => {
    const mockError = { message: 'Get session failed' };
    const mockClient = {
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: mockError }),
      },
    };
    
    mockCreateBrowserClient.mockReturnValue(mockClient);

    const result = await getSession();

    expect(result).toEqual({ session: null, error: mockError });
  });
});

describe('resetClient', () => {
  test('클라이언트를 리셋한다', () => {
    const mockClient = { auth: {}, from: jest.fn() };
    mockCreateBrowserClient.mockReturnValue(mockClient);

    // 클라이언트 생성
    const client1 = createBrowserClient();
    const service1 = getDatabaseService();

    // 리셋
    resetClient();

    // 새로운 인스턴스 생성
    const client2 = createBrowserClient();
    const service2 = getDatabaseService();

    expect(mockCreateBrowserClient).toHaveBeenCalledTimes(2);
    expect(service1).not.toBe(service2);
  });
});
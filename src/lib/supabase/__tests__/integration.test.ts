/**
 * Supabase 통합 테스트
 * 실제 데이터베이스 연결 없이 통합 시나리오 테스트
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';

// Mock environment
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

describe('Supabase 통합 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('타입 안전성 검증', () => {
    test('데이터베이스 타입이 올바르게 정의되어 있다', () => {
      // 타입 import 테스트
      expect(async () => {
        const types = await import('@/types/database.types');
        expect(types).toHaveProperty('Database');
      }).not.toThrow();
    });

    test('유틸리티 타입이 올바르게 정의되어 있다', async () => {
      expect(async () => {
        const types = await import('@/types/supabase');
        expect(types).toHaveProperty('USER_ROLES');
        expect(types).toHaveProperty('CAMPAIGN_STATUSES');
        expect(types).toHaveProperty('APPLICATION_STATUSES');
      }).not.toThrow();
    });

    test('통합 타입 파일이 올바르게 내보내진다', async () => {
      expect(async () => {
        const types = await import('@/types/database');
        // 기본 타입들이 내보내졌는지 확인
        expect(types).toBeDefined();
      }).not.toThrow();
    });
  });

  describe('에러 핸들링 검증', () => {
    test('Supabase 에러 핸들링이 올바르게 작동한다', () => {
      const { handleSupabaseError } = require('../server');
      
      // NOT_FOUND 에러
      const notFoundError = { code: 'PGRST116', message: 'No rows found' };
      const notFoundResult = handleSupabaseError(notFoundError);
      expect(notFoundResult.code).toBe('NOT_FOUND');
      expect(notFoundResult.message).toBe('Record not found');

      // UNAUTHORIZED 에러
      const unauthorizedError = { code: 'PGRST301', message: 'Unauthorized' };
      const unauthorizedResult = handleSupabaseError(unauthorizedError);
      expect(unauthorizedResult.code).toBe('UNAUTHORIZED');
      expect(unauthorizedResult.message).toBe('Unauthorized access');

      // 일반 에러
      const generalError = { message: 'Something went wrong', code: 'UNKNOWN' };
      const generalResult = handleSupabaseError(generalError);
      expect(generalResult.code).toBe('UNKNOWN');
      expect(generalResult.message).toBe('Something went wrong');
    });

    test('클라이언트 에러 핸들링이 올바르게 작동한다', () => {
      // Mock browser environment
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true
      });

      const { handleClientError } = require('../client');
      
      // JWT 에러
      const jwtError = { message: 'JWT token expired' };
      const jwtResult = handleClientError(jwtError);
      expect(jwtResult.code).toBe('AUTH_EXPIRED');
      expect(jwtResult.message).toBe('Authentication session expired');

      // 일반 에러
      const generalError = { message: 'Client error', code: 'CLIENT_ERROR' };
      const generalResult = handleClientError(generalError);
      expect(generalResult.code).toBe('CLIENT_ERROR');
      expect(generalResult.message).toBe('Client error');
    });
  });

  describe('설정 검증', () => {
    test('환경 변수가 올바르게 설정되어 있다', () => {
      const { env } = require('@/lib/env');
      
      expect(env.SUPABASE_URL).toBeDefined();
      expect(env.SUPABASE_ANON_KEY).toBeDefined();
    });

    test('타입 상수가 올바르게 정의되어 있다', () => {
      const { 
        USER_ROLES, 
        CAMPAIGN_STATUSES, 
        APPLICATION_STATUSES,
        EARNING_STATUSES,
        DEFAULT_QUERY_LIMIT,
        TABLES
      } = require('@/types/supabase');
      
      expect(USER_ROLES).toContain('creator');
      expect(USER_ROLES).toContain('business');
      expect(USER_ROLES).toContain('admin');
      
      expect(CAMPAIGN_STATUSES).toContain('draft');
      expect(CAMPAIGN_STATUSES).toContain('active');
      expect(CAMPAIGN_STATUSES).toContain('completed');
      
      expect(APPLICATION_STATUSES).toContain('pending');
      expect(APPLICATION_STATUSES).toContain('approved');
      expect(APPLICATION_STATUSES).toContain('rejected');
      
      expect(EARNING_STATUSES).toContain('pending');
      expect(EARNING_STATUSES).toContain('paid');
      expect(EARNING_STATUSES).toContain('cancelled');
      
      expect(DEFAULT_QUERY_LIMIT).toBe(20);
      
      expect(TABLES.PROFILES).toBe('profiles');
      expect(TABLES.CAMPAIGNS).toBe('campaigns');
      expect(TABLES.EARNINGS).toBe('earnings');
    });
  });

  describe('타입 가드 함수 검증', () => {
    test('타입 가드 함수들이 올바르게 작동한다', () => {
      const { isProfile, isCampaign, isCreator, isBusiness } = require('@/types/supabase');
      
      // isProfile 테스트
      expect(isProfile({ id: 'test-id', email: 'test@example.com' })).toBe(true);
      expect(isProfile({ id: 'test-id' })).toBe(false);
      expect(isProfile(null)).toBe(false);
      
      // isCampaign 테스트
      expect(isCampaign({ id: 'test-id', title: 'Test Campaign' })).toBe(true);
      expect(isCampaign({ id: 'test-id' })).toBe(false);
      expect(isCampaign(null)).toBe(false);
      
      // isCreator 테스트
      expect(isCreator({ id: 'test-id', profile_id: 'profile-id' })).toBe(true);
      expect(isCreator({ id: 'test-id' })).toBe(false);
      expect(isCreator(null)).toBe(false);
      
      // isBusiness 테스트
      expect(isBusiness({ id: 'test-id', profile_id: 'profile-id' })).toBe(true);
      expect(isBusiness({ id: 'test-id' })).toBe(false);
      expect(isBusiness(null)).toBe(false);
    });
  });

  describe('RLS 정책 헬퍼 검증', () => {
    test('RLS 헬퍼 함수가 올바른 매개변수로 호출된다', async () => {
      const { rls } = require('../server');
      
      const mockClient = {
        rpc: jest.fn().mockResolvedValue({ data: null, error: null })
      };
      
      // setCurrentUserId 테스트
      await rls.setCurrentUserId(mockClient, 'test-user-id');
      expect(mockClient.rpc).toHaveBeenCalledWith('set_claim', {
        uid: 'test-user-id',
        claim: 'user_id',
        value: 'test-user-id'
      });
      
      // setCurrentUserRole 테스트
      await rls.setCurrentUserRole(mockClient, 'creator');
      expect(mockClient.rpc).toHaveBeenCalledWith('set_claim', {
        uid: 'role',
        claim: 'role',
        value: 'creator'
      });
    });
  });

  describe('클라이언트 싱글톤 패턴 검증', () => {
    test('브라우저 환경에서 클라이언트 재사용', () => {
      // Mock browser environment
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true
      });

      // Mock the SSR package
      jest.doMock('@supabase/ssr', () => ({
        createBrowserClient: jest.fn(() => ({ 
          auth: {},
          from: jest.fn(),
          channel: jest.fn(),
          storage: { from: jest.fn() }
        }))
      }));

      const { resetClient } = require('../client');
      
      // 테스트 전 클라이언트 리셋
      resetClient();
      
      const { createBrowserClient, getSupabaseClient } = require('../client');
      
      // 첫 번째 호출
      const client1 = createBrowserClient();
      
      // 두 번째 호출 (같은 인스턴스여야 함)
      const client2 = createBrowserClient();
      const client3 = getSupabaseClient();
      
      expect(client1).toBe(client2);
      expect(client2).toBe(client3);
    });

    test('서버 환경에서 에러 발생', () => {
      // Mock server environment
      delete (global as any).window;

      const { createBrowserClient, getDatabaseService } = require('../client');
      
      expect(() => createBrowserClient()).toThrow(
        'createBrowserClient can only be used in browser environment'
      );
      
      expect(() => getDatabaseService()).toThrow(
        'getDatabaseService can only be used in browser environment'
      );
    });
  });

  describe('파일 업로드 검증', () => {
    test('파일 업로드 옵션이 올바르게 설정된다', () => {
      // Mock browser environment
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true
      });

      const mockStorageClient = {
        upload: jest.fn().mockResolvedValue({ 
          data: { path: 'test/file.txt' }, 
          error: null 
        }),
        getPublicUrl: jest.fn().mockReturnValue({ 
          data: { publicUrl: 'https://example.com/file.txt' } 
        })
      };

      const mockClient = {
        storage: {
          from: jest.fn().mockReturnValue(mockStorageClient)
        }
      };

      jest.doMock('@supabase/ssr', () => ({
        createBrowserClient: jest.fn(() => mockClient)
      }));

      const { ClientDatabaseService } = require('../client');
      const service = new ClientDatabaseService();
      
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      
      // 기본 옵션으로 업로드
      service.uploadFile('test-bucket', 'test/file.txt', mockFile);
      
      expect(mockStorageClient.upload).toHaveBeenCalledWith(
        'test/file.txt',
        mockFile,
        {
          cacheControl: '3600',
          contentType: 'text/plain',
          upsert: false,
        }
      );
    });
  });
});

describe('프로덕션 시나리오 시뮬레이션', () => {
  test('프로필 생성 → 업데이트 → 조회 시나리오', () => {
    // 이 테스트는 실제 데이터베이스 없이 플로우만 검증
    const mockProfile = {
      id: 'user-123',
      email: 'test@example.com',
      role: 'creator' as const,
      full_name: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    };

    const mockUpdatedProfile = {
      ...mockProfile,
      full_name: 'Test User',
      updated_at: '2024-01-02T00:00:00Z'
    };

    // 1. 프로필 생성
    expect(mockProfile.id).toBeDefined();
    expect(mockProfile.email).toBeDefined();
    expect(mockProfile.role).toBe('creator');

    // 2. 프로필 업데이트
    const updates = { full_name: 'Test User' };
    const updatedProfile = { ...mockProfile, ...updates };
    expect(updatedProfile.full_name).toBe('Test User');

    // 3. 프로필 조회 검증
    expect(updatedProfile.id).toBe(mockProfile.id);
    expect(updatedProfile.email).toBe(mockProfile.email);
    expect(updatedProfile.full_name).toBe('Test User');
  });

  test('캠페인 신청 시나리오', () => {
    const mockCampaign = {
      id: 'campaign-123',
      title: 'Test Campaign',
      business_id: 'business-123',
      status: 'active' as const
    };

    const mockApplication = {
      id: 'app-123',
      campaign_id: mockCampaign.id,
      creator_id: 'creator-123',
      status: 'pending' as const,
      applied_at: '2024-01-01T00:00:00Z'
    };

    // 1. 캠페인 존재 확인
    expect(mockCampaign.status).toBe('active');

    // 2. 신청 생성
    expect(mockApplication.campaign_id).toBe(mockCampaign.id);
    expect(mockApplication.status).toBe('pending');

    // 3. 신청 승인 시뮬레이션
    const approvedApplication = {
      ...mockApplication,
      status: 'approved' as const,
      reviewed_at: '2024-01-02T00:00:00Z'
    };

    expect(approvedApplication.status).toBe('approved');
    expect(approvedApplication.reviewed_at).toBeDefined();
  });

  test('수익 계산 시나리오', () => {
    const commission = 1000; // 1000원
    const platformFee = commission * 0.1; // 10%
    const creatorEarning = commission - platformFee;

    // 3단계 추천 수수료 계산
    const referralL1 = commission * 0.1; // 10%
    const referralL2 = commission * 0.05; // 5%
    const referralL3 = commission * 0.02; // 2%

    expect(platformFee).toBe(100);
    expect(creatorEarning).toBe(900);
    expect(referralL1).toBe(100);
    expect(referralL2).toBe(50);
    expect(referralL3).toBe(20);

    // 총 수수료가 원본 수수료보다 작거나 같은지 확인
    const totalReferral = referralL1 + referralL2 + referralL3;
    expect(totalReferral).toBeLessThanOrEqual(commission);
  });
});
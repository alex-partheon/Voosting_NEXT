/**
 * Supabase Auth 통합 테스트
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { 
  signIn,
  signUp,
  signOut,
  signInWithOAuth,
  resetPassword,
  getCurrentUser,
  getCurrentProfile,
  generateReferralCode,
  setReferralRelationship,
} from '@/lib/supabase-auth';

// Mock Supabase dependencies
jest.mock('@supabase/ssr');
jest.mock('next/headers');

const mockSupabaseClient = {
  auth: {
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signInWithOAuth: jest.fn(),
    signOut: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    getUser: jest.fn(),
    getSession: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
};

const mockCookies = {
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
};

// Mock modules
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn()
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn()
}));

// Setup mocks
beforeEach(async () => {
  jest.clearAllMocks();
  
  const { createServerClient } = await import('@supabase/ssr');
  const { cookies } = await import('next/headers');
  
  (createServerClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  (cookies as jest.Mock).mockResolvedValue(mockCookies);
  
  // Mock environment variables
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3002';
});

describe('Supabase Auth 기능 테스트', () => {
  describe('signIn (이메일 로그인)', () => {
    it('올바른 이메일과 비밀번호로 로그인 성공', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
      };

      const mockAuthData = {
        user: mockUser,
        session: {
          access_token: 'test-token',
          user: mockUser,
        },
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: mockAuthData,
        error: null,
      });

      const result = await signIn('test@example.com', 'correct-password');

      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'correct-password',
      });
      expect(result.user?.email).toBe('test@example.com');
    });

    it('잘못된 비밀번호로 로그인 실패', async () => {
      const mockError = new Error('Invalid login credentials');
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      });

      await expect(
        signIn('test@example.com', 'wrong-password')
      ).rejects.toThrow('Invalid login credentials');
    });
  });

  describe('signUp (회원가입)', () => {
    it('새 사용자 회원가입 성공', async () => {
      const mockUser = {
        id: 'new-user-id',
        email: 'new@example.com',
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {
          user: mockUser,
          session: null, // 이메일 확인 대기
        },
        error: null,
      });

      const result = await signUp('new@example.com', 'password123', {
        role: 'creator',
        full_name: 'New Creator',
      });

      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        options: {
          data: {
            role: 'creator',
            full_name: 'New Creator',
            referred_by: undefined,
          },
        },
      });
      expect(result.user?.email).toBe('new@example.com');
    });

    it('추천인 코드와 함께 회원가입', async () => {
      const mockUser = {
        id: 'new-user-id',
        email: 'new@example.com',
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {
          user: mockUser,
          session: null,
        },
        error: null,
      });

      await signUp('new@example.com', 'password123', {
        role: 'business',
        referred_by: 'REF12345',
      });

      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        options: {
          data: {
            role: 'business',
            full_name: undefined,
            referred_by: 'REF12345',
          },
        },
      });
    });

    it('중복 이메일로 회원가입 실패', async () => {
      const mockError = new Error('User already registered');
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      });

      await expect(
        signUp('existing@example.com', 'password123', { role: 'creator' })
      ).rejects.toThrow('User already registered');
    });
  });

  describe('signInWithOAuth (OAuth 로그인)', () => {
    it('Google OAuth 로그인 요청 성공', async () => {
      const mockOAuthData = {
        provider: 'google',
        url: 'https://accounts.google.com/oauth/authorize?...',
      };

      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: mockOAuthData,
        error: null,
      });

      const result = await signInWithOAuth('google');

      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3002/auth/callback',
        },
      });
      expect(result.provider).toBe('google');
    });

    it('GitHub OAuth 로그인 요청 성공', async () => {
      const mockOAuthData = {
        provider: 'github',
        url: 'https://github.com/login/oauth/authorize?...',
      };

      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: mockOAuthData,
        error: null,
      });

      const result = await signInWithOAuth('github');

      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'github',
        options: {
          redirectTo: 'http://localhost:3002/auth/callback',
        },
      });
      expect(result.provider).toBe('github');
    });
  });

  describe('signOut (로그아웃)', () => {
    it('로그아웃 성공', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      });

      await expect(signOut()).resolves.not.toThrow();
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
    });

    it('로그아웃 중 에러 발생', async () => {
      const mockError = new Error('Sign out failed');
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: mockError,
      });

      await expect(signOut()).rejects.toThrow('Sign out failed');
    });
  });

  describe('resetPassword (비밀번호 재설정)', () => {
    it('비밀번호 재설정 이메일 발송 성공', async () => {
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        error: null,
      });

      await expect(resetPassword('test@example.com')).resolves.not.toThrow();
      expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        {
          redirectTo: 'http://localhost:3002/auth/reset-password',
        }
      );
    });
  });

  describe('getCurrentUser (현재 사용자 조회)', () => {
    it('인증된 사용자 정보 반환', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
      };

      const mockProfile = {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'creator',
        referral_code: 'ABC123',
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockSingle = jest.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      });
      mockSupabaseClient.from().single = mockSingle;

      const result = await getCurrentUser();

      expect(result?.id).toBe('test-user-id');
      expect(result?.email).toBe('test@example.com');
      expect(result?.profile?.role).toBe('creator');
    });

    it('인증되지 않은 사용자는 null 반환', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await getCurrentUser();

      expect(result).toBeNull();
    });

    it('사용자는 있지만 프로필이 없는 경우', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });
      mockSupabaseClient.from().single = mockSingle;

      const result = await getCurrentUser();

      expect(result?.id).toBe('test-user-id');
      expect(result?.profile).toBeNull();
    });
  });

  describe('getCurrentProfile (프로필 조회)', () => {
    it('현재 사용자의 프로필 반환', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
      };

      const mockProfile = {
        id: 'test-user-id',
        role: 'business',
        referral_code: 'BIZ456',
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockSingle = jest.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      });
      mockSupabaseClient.from().single = mockSingle;

      const result = await getCurrentProfile();

      expect(result?.role).toBe('business');
      expect(result?.referral_code).toBe('BIZ456');
    });
  });

  describe('generateReferralCode (추천 코드 생성)', () => {
    it('올바른 형식의 추천 코드 생성', () => {
      const userId = 'abcdefgh-1234-5678-9012-123456789012';
      const referralCode = generateReferralCode(userId);

      expect(referralCode).toHaveLength(10);
      expect(referralCode).toMatch(/^[A-Z0-9]{10}$/);
      expect(referralCode.substring(0, 6)).toBe('123456'); // userId 마지막 6자리 대문자
    });

    it('서로 다른 사용자는 다른 추천 코드를 가짐', () => {
      const userId1 = 'user1-1234-5678-9012-123456789012';
      const userId2 = 'user2-1234-5678-9012-987654321098';

      const code1 = generateReferralCode(userId1);
      const code2 = generateReferralCode(userId2);

      expect(code1).not.toBe(code2);
    });
  });

  describe('setReferralRelationship (추천 관계 설정)', () => {
    it('유효한 추천 코드로 관계 설정 성공', async () => {
      const mockReferrer = {
        id: 'referrer-id',
        referrer_l1_id: 'grandparent-id',
        referrer_l2_id: 'great-grandparent-id',
      };

      const mockSingle = jest.fn().mockResolvedValue({
        data: mockReferrer,
        error: null,
      });
      mockSupabaseClient.from().single = mockSingle;

      const result = await setReferralRelationship('new-user-id', 'VALID123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        referrer_l1_id: 'referrer-id',
        referrer_l2_id: 'grandparent-id',
        referrer_l3_id: 'great-grandparent-id',
      });
    });

    it('유효하지 않은 추천 코드로 실패', async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });
      mockSupabaseClient.from().single = mockSingle;

      const result = await setReferralRelationship('new-user-id', 'INVALID');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid referral code');
    });

    it('3단계 추천 체인 설정', async () => {
      const mockReferrer = {
        id: 'level1-referrer',
        referrer_l1_id: 'level2-referrer',
        referrer_l2_id: 'level3-referrer',
      };

      const mockSingle = jest.fn().mockResolvedValue({
        data: mockReferrer,
        error: null,
      });
      mockSupabaseClient.from().single = mockSingle;

      const result = await setReferralRelationship('new-user-id', 'CHAIN123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        referrer_l1_id: 'level1-referrer', // 10% 수수료
        referrer_l2_id: 'level2-referrer', // 5% 수수료
        referrer_l3_id: 'level3-referrer', // 2% 수수료
      });
    });
  });

  describe('역할 확인 함수들', () => {
    it('hasRole 함수가 올바르게 동작', async () => {
      const { hasRole } = await import('@/lib/supabase-auth');

      expect(hasRole('creator', 'creator')).toBe(true);
      expect(hasRole('creator', 'business')).toBe(false);
      expect(hasRole('admin', ['admin', 'creator'])).toBe(true);
      expect(hasRole('business', ['admin', 'creator'])).toBe(false);
    });

    it('isAdmin 함수가 올바르게 동작', async () => {
      const { isAdmin } = await import('@/lib/supabase-auth');

      expect(isAdmin('admin')).toBe(true);
      expect(isAdmin('creator')).toBe(false);
      expect(isAdmin('business')).toBe(false);
    });

    it('isCreator 함수가 올바르게 동작', async () => {
      const { isCreator } = await import('@/lib/supabase-auth');

      expect(isCreator('creator')).toBe(true);
      expect(isCreator('admin')).toBe(false);
      expect(isCreator('business')).toBe(false);
    });

    it('isBusiness 함수가 올바르게 동작', async () => {
      const { isBusiness } = await import('@/lib/supabase-auth');

      expect(isBusiness('business')).toBe(true);
      expect(isBusiness('creator')).toBe(false);
      expect(isBusiness('admin')).toBe(false);
    });
  });
});
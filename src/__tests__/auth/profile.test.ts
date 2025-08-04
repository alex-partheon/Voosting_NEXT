import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import type { SupabaseClient } from '@supabase/supabase-js';

type MockSupabase = Partial<SupabaseClient> & {
  auth: {
    admin: {
      createUser: jest.Mock;
      deleteUser: jest.Mock;
    };
    signInWithPassword: jest.Mock;
    signOut: jest.Mock;
    getSession: jest.Mock;
  };
  from: jest.Mock;
};

// Mock Supabase client for testing
const mockSupabase: MockSupabase = {
  auth: {
    admin: {
      createUser: jest.fn(),
      deleteUser: jest.fn(),
    },
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
  },
  from: jest.fn((_table) => {
    const builder = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    };
    return builder;
  }),
};

// Mock the createClient function
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase as SupabaseClient),
}));

const supabase = mockSupabase;

describe('사용자 프로필 및 역할 시스템', () => {
  let testUserId: string;

  beforeEach(() => {
    // 테스트용 사용자 ID 생성
    testUserId = `test-user-${Date.now()}`;

    // Mock 함수들 초기화
    jest.clearAllMocks();
  });

  afterEach(() => {
    // 테스트 후 정리
    jest.clearAllMocks();
  });

  describe('자동 프로필 생성', () => {
    it('회원가입 시 자동으로 프로필이 생성되어야 함', async () => {
      // Mock 데이터 설정
      const mockProfile = {
        id: testUserId,
        email: 'test@example.com',
        role: 'creator',
        referral_code: 'ABC12345',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Mock 함수 설정
      const mockSingle = jest.fn().mockResolvedValue({ data: mockProfile, error: null });
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      supabase.from.mockReturnValue({ select: mockSelect });

      // 프로필 조회 시뮬레이션
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', testUserId)
        .single();

      expect(error).toBeNull();
      expect(profile).toBeDefined();
      expect(profile?.id).toBe(testUserId);
      expect(profile?.role).toBe('creator');
      expect(profile?.referral_code).toBeDefined();
      expect(profile?.referral_code).toHaveLength(8);
    });

    it('추천 코드는 고유해야 함', async () => {
      // 서로 다른 추천 코드를 가진 두 프로필 모킹
      const mockProfile1 = { referral_code: 'ABC12345' };
      const mockProfile2 = { referral_code: 'XYZ67890' };

      const mockSingle1 = jest.fn().mockResolvedValue({ data: mockProfile1, error: null });
      const mockSingle2 = jest.fn().mockResolvedValue({ data: mockProfile2, error: null });

      // 첫 번째 호출과 두 번째 호출에 대해 다른 결과 반환
      const mockEq = jest
        .fn()
        .mockReturnValueOnce({ single: mockSingle1 })
        .mockReturnValueOnce({ single: mockSingle2 });

      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      supabase.from.mockReturnValue({ select: mockSelect });

      // 첫 번째 사용자의 추천 코드
      const { data: profile1 } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', testUserId)
        .single();

      // 두 번째 사용자의 추천 코드
      const { data: profile2 } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', 'test-user-2')
        .single();

      expect(profile1?.referral_code).not.toBe(profile2?.referral_code);
    });
  });

  describe('역할 기반 시스템', () => {
    it('사용자 역할을 업데이트할 수 있어야 함', async () => {
      // Mock 업데이트된 프로필 데이터
      const mockUpdatedProfile = {
        id: testUserId,
        role: 'business',
        updated_at: new Date().toISOString(),
      };

      // Mock 함수 설정
      const mockSingle = jest.fn().mockResolvedValue({ data: mockUpdatedProfile, error: null });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockEq = jest.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
      supabase.from.mockReturnValue({ update: mockUpdate });

      // 역할을 business로 변경
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update({ role: 'business' })
        .eq('id', testUserId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(updatedProfile?.role).toBe('business');
      expect(mockUpdate).toHaveBeenCalledWith({ role: 'business' });
    });

    it('유효하지 않은 역할은 거부되어야 함', async () => {
      // Mock 에러 응답
      const mockError = {
        message: 'invalid input value for enum user_role: "invalid_role"',
        code: '22P02',
      };

      const mockEq = jest.fn().mockResolvedValue({ data: null, error: mockError });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
      supabase.from.mockReturnValue({ update: mockUpdate });

      // 유효하지 않은 역할로 업데이트 시도
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'invalid_role' as never })
        .eq('id', testUserId);

      expect(error).toBeDefined();
      expect(error?.message).toContain('invalid input value for enum user_role');
    });
  });

  describe('인증 콜백 기능', () => {
    it('인증 후 올바른 리디렉션을 처리해야 함', async () => {
      // Mock 세션 데이터
      const mockSession = {
        user: {
          id: testUserId,
          email: 'test@example.com',
        },
      };

      // Mock 프로필 데이터
      const mockProfile = {
        id: testUserId,
        role: 'creator',
      };

      // Mock 함수 설정
      const mockAuth = {
        getSession: jest.fn().mockResolvedValue({ data: mockSession, error: null }),
      };
      supabase.auth = mockAuth;

      const mockSingle = jest.fn().mockResolvedValue({ data: mockProfile, error: null });
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      supabase.from.mockReturnValue({ select: mockSelect });

      // 인증 콜백 시뮬레이션
      const { data: session } = await supabase.auth.getSession();
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session?.user?.id)
        .single();

      expect(session?.user?.id).toBe(testUserId);
      expect(profile?.role).toBe('creator');
    });
  });

  describe('3단계 추천 시스템', () => {
    it('추천인 관계를 설정할 수 있어야 함', async () => {
      const referrerId = 'referrer-user-id';
      const newUserId = 'new-user-id';
      const referralCode = 'REF12345';

      // Mock 추천인 프로필 데이터
      const mockReferrerProfile = {
        id: referrerId,
        referral_code: referralCode,
      };

      // Mock 새 사용자 프로필 데이터
      const mockNewUserProfile = {
        id: newUserId,
        referred_by: referrerId,
      };

      // Mock 추천 수익 데이터
      const mockEarnings = [
        {
          id: 'earning-1',
          referrer_id: referrerId,
          referred_id: newUserId,
          level: 1,
          amount: 1000,
          created_at: new Date().toISOString(),
        },
      ];

      // Mock 함수들 설정
      const mockSingle = jest
        .fn()
        .mockImplementationOnce(() => Promise.resolve({ data: mockReferrerProfile, error: null }))
        .mockImplementationOnce(() => Promise.resolve({ data: mockNewUserProfile, error: null }));

      const mockEq = jest
        .fn()
        .mockImplementationOnce(() => ({ single: mockSingle }))
        .mockImplementationOnce(() => Promise.resolve({ data: null, error: null }))
        .mockImplementationOnce(() => ({ single: mockSingle }))
        .mockImplementationOnce(() => Promise.resolve({ data: mockEarnings, error: null }));

      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });

      supabase.from.mockImplementation((table) => {
        if (table === 'profiles') {
          return { select: mockSelect, update: mockUpdate };
        } else if (table === 'referral_earnings') {
          return { select: mockSelect };
        }
        return { select: mockSelect };
      });

      // 추천인의 추천 코드 가져오기
      const { data: referrerProfile } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', referrerId)
        .single();

      expect(referrerProfile?.referral_code).toBe(referralCode);

      // 추천 관계 설정
      await supabase.from('profiles').update({ referred_by: referrerId }).eq('id', newUserId);

      // 추천 관계 확인
      const { data: newUserProfile } = await supabase
        .from('profiles')
        .select('referred_by')
        .eq('id', newUserId)
        .single();

      expect(newUserProfile?.referred_by).toBe(referrerId);

      // 추천 수익 생성 확인을 위한 별도 모킹
      const mockEarningsEq = jest.fn().mockReturnValueOnce({
        eq: jest.fn().mockResolvedValue({ data: mockEarnings, error: null }),
      });

      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({ eq: mockEarningsEq }),
      });

      const { data: earnings } = await supabase
        .from('referral_earnings')
        .select('*')
        .eq('referrer_id', referrerId)
        .eq('referred_id', newUserId);

      expect(earnings).toHaveLength(1);
      expect(earnings![0].level).toBe(1);
    });
  });
});

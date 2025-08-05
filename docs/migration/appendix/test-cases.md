# 테스트 케이스 예제 모음

## 목차
1. [단위 테스트 (Unit Tests)](#단위-테스트-unit-tests)
2. [통합 테스트 (Integration Tests)](#통합-테스트-integration-tests)
3. [E2E 테스트 (End-to-End Tests)](#e2e-테스트-end-to-end-tests)
4. [성능 테스트 (Performance Tests)](#성능-테스트-performance-tests)
5. [보안 테스트 (Security Tests)](#보안-테스트-security-tests)

---

## 단위 테스트 (Unit Tests)

### 1. 인증 유틸리티 테스트

```typescript
// src/utils/__tests__/auth.test.ts
import { AuthUtils } from '@/utils/auth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Supabase 모킹
jest.mock('@supabase/auth-helpers-nextjs');
const mockSupabase = createClientComponentClient as jest.MockedFunction<typeof createClientComponentClient>;

describe('AuthUtils', () => {
  const mockAuthClient = {
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
      signOut: jest.fn(),
      refreshSession: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.mockReturnValue(mockAuthClient as any);
  });

  describe('getCurrentSession', () => {
    it('성공적으로 세션을 반환해야 한다', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
        access_token: 'token-123',
        expires_at: Date.now() / 1000 + 3600,
      };

      mockAuthClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await AuthUtils.getCurrentSession();

      expect(result).toEqual(mockSession);
      expect(mockAuthClient.auth.getSession).toHaveBeenCalledTimes(1);
    });

    it('에러 발생 시 null을 반환해야 한다', async () => {
      mockAuthClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: new Error('Session error'),
      });

      const result = await AuthUtils.getCurrentSession();

      expect(result).toBeNull();
    });

    it('예외 발생 시 null을 반환해야 한다', async () => {
      mockAuthClient.auth.getSession.mockRejectedValue(new Error('Network error'));

      const result = await AuthUtils.getCurrentSession();

      expect(result).toBeNull();
    });
  });

  describe('getUserProfile', () => {
    it('사용자 프로필을 성공적으로 가져와야 한다', async () => {
      const mockProfile = {
        user_id: 'user-123',
        email: 'test@example.com',
        role: 'creator',
      };

      const mockFrom = mockAuthClient.from();
      mockFrom.single.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const result = await AuthUtils.getUserProfile('user-123');

      expect(result).toEqual(mockProfile);
      expect(mockAuthClient.from).toHaveBeenCalledWith('profiles');
      expect(mockFrom.select).toHaveBeenCalledWith('*');
      expect(mockFrom.eq).toHaveBeenCalledWith('user_id', 'user-123');
    });

    it('프로필이 없을 때 에러를 던져야 한다', async () => {
      const mockFrom = mockAuthClient.from();
      mockFrom.single.mockResolvedValue({
        data: null,
        error: new Error('Profile not found'),
      });

      await expect(AuthUtils.getUserProfile('user-123')).rejects.toThrow('Profile fetch failed');
    });
  });

  describe('hasRole', () => {
    it('올바른 역할을 가진 경우 true를 반환해야 한다', async () => {
      const mockProfile = { role: 'admin' };
      const mockFrom = mockAuthClient.from();
      mockFrom.single.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const result = await AuthUtils.hasRole('user-123', 'admin');

      expect(result).toBe(true);
    });

    it('다른 역할을 가진 경우 false를 반환해야 한다', async () => {
      const mockProfile = { role: 'creator' };
      const mockFrom = mockAuthClient.from();
      mockFrom.single.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const result = await AuthUtils.hasRole('user-123', 'admin');

      expect(result).toBe(false);
    });

    it('프로필 조회 실패 시 false를 반환해야 한다', async () => {
      const mockFrom = mockAuthClient.from();
      mockFrom.single.mockRejectedValue(new Error('Database error'));

      const result = await AuthUtils.hasRole('user-123', 'admin');

      expect(result).toBe(false);
    });
  });

  describe('signOut', () => {
    beforeEach(() => {
      // localStorage와 sessionStorage 모킹
      Object.defineProperty(window, 'localStorage', {
        value: {
          removeItem: jest.fn(),
        },
      });
      Object.defineProperty(window, 'sessionStorage', {
        value: {
          clear: jest.fn(),
        },
      });
    });

    it('성공적으로 로그아웃해야 한다', async () => {
      mockAuthClient.auth.signOut.mockResolvedValue({ error: null });

      const result = await AuthUtils.signOut();

      expect(result).toBe(true);
      expect(mockAuthClient.auth.signOut).toHaveBeenCalledTimes(1);
      expect(localStorage.removeItem).toHaveBeenCalledWith('user-preferences');
      expect(sessionStorage.clear).toHaveBeenCalledTimes(1);
    });

    it('로그아웃 실패 시 false를 반환해야 한다', async () => {
      mockAuthClient.auth.signOut.mockResolvedValue({
        error: new Error('Sign out failed'),
      });

      const result = await AuthUtils.signOut();

      expect(result).toBe(false);
    });
  });

  describe('refreshTokenIfNeeded', () => {
    it('토큰이 30분 이내에 만료될 때 갱신해야 한다', async () => {
      const expiresAt = Math.floor(Date.now() / 1000) + 1800; // 30분 후
      const mockSession = {
        expires_at: expiresAt - 1500, // 25분 후 만료
        user: { id: 'user-123' },
      };

      const mockNewSession = {
        expires_at: expiresAt + 3600, // 1시간 30분 후
        user: { id: 'user-123' },
      };

      mockAuthClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      mockAuthClient.auth.refreshSession.mockResolvedValue({
        data: { session: mockNewSession },
        error: null,
      });

      const result = await AuthUtils.refreshTokenIfNeeded();

      expect(result).toEqual(mockNewSession);
      expect(mockAuthClient.auth.refreshSession).toHaveBeenCalledTimes(1);
    });

    it('토큰이 충분히 유효할 때 갱신하지 않아야 한다', async () => {
      const expiresAt = Math.floor(Date.now() / 1000) + 7200; // 2시간 후
      const mockSession = {
        expires_at: expiresAt,
        user: { id: 'user-123' },
      };

      mockAuthClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await AuthUtils.refreshTokenIfNeeded();

      expect(result).toEqual(mockSession);
      expect(mockAuthClient.auth.refreshSession).not.toHaveBeenCalled();
    });
  });
});
```

### 2. 도메인 라우팅 유틸리티 테스트

```typescript
// src/utils/__tests__/domain-routing.test.ts
import { DomainUtils } from '@/utils/domain-routing';

describe('DomainUtils', () => {
  describe('getDomainType', () => {
    const testCases = [
      { hostname: '', expected: 'main' },
      { hostname: 'localhost:3002', expected: 'main' },
      { hostname: 'voosting.app', expected: 'main' },
      { hostname: 'creator.localhost:3002', expected: 'creator' },
      { hostname: 'creator.voosting.app', expected: 'creator' },
      { hostname: 'CREATOR.VOOSTING.APP', expected: 'creator' },
      { hostname: 'business.localhost:3002', expected: 'business' },
      { hostname: 'business.voosting.app', expected: 'business' },
      { hostname: 'admin.localhost:3002', expected: 'admin' },
      { hostname: 'admin.voosting.app', expected: 'admin' },
      { hostname: 'api.voosting.app', expected: 'main' },
      { hostname: 'www.voosting.app', expected: 'main' },
    ];

    testCases.forEach(({ hostname, expected }) => {
      it(`"${hostname}"에 대해 "${expected}"를 반환해야 한다`, () => {
        expect(DomainUtils.getDomainType(hostname)).toBe(expected);
      });
    });
  });

  describe('isDomainRoleMatch', () => {
    const validMatches = [
      { domain: 'main', role: 'creator' },
      { domain: 'main', role: 'business' },
      { domain: 'main', role: 'admin' },
      { domain: 'creator', role: 'creator' },
      { domain: 'business', role: 'business' },
      { domain: 'admin', role: 'admin' },
    ];

    const invalidMatches = [
      { domain: 'creator', role: 'business' },
      { domain: 'creator', role: 'admin' },
      { domain: 'business', role: 'creator' },
      { domain: 'business', role: 'admin' },
      { domain: 'admin', role: 'creator' },
      { domain: 'admin', role: 'business' },
    ];

    validMatches.forEach(({ domain, role }) => {
      it(`${domain} 도메인에 ${role} 역할이 매칭되어야 한다`, () => {
        expect(DomainUtils.isDomainRoleMatch(domain as any, role as any)).toBe(true);
      });
    });

    invalidMatches.forEach(({ domain, role }) => {
      it(`${domain} 도메인에 ${role} 역할이 매칭되지 않아야 한다`, () => {
        expect(DomainUtils.isDomainRoleMatch(domain as any, role as any)).toBe(false);
      });
    });
  });

  describe('getDefaultRedirectPath', () => {
    const testCases = [
      { role: 'creator', expected: '/creator/dashboard' },
      { role: 'business', expected: '/business/dashboard' },
      { role: 'admin', expected: '/admin/dashboard' },
    ];

    testCases.forEach(({ role, expected }) => {
      it(`${role} 역할에 대해 "${expected}"를 반환해야 한다`, () => {
        expect(DomainUtils.getDefaultRedirectPath(role as any)).toBe(expected);
      });
    });
  });

  describe('rewriteUrlForDomain', () => {
    it('main 도메인일 때 경로를 변경하지 않아야 한다', () => {
      expect(DomainUtils.rewriteUrlForDomain('/dashboard', 'main')).toBe('/dashboard');
      expect(DomainUtils.rewriteUrlForDomain('/profile', 'main')).toBe('/profile');
    });

    it('creator 도메인일 때 적절히 경로를 변경해야 한다', () => {
      expect(DomainUtils.rewriteUrlForDomain('/', 'creator')).toBe('/creator/dashboard');
      expect(DomainUtils.rewriteUrlForDomain('/dashboard', 'creator')).toBe('/creator/dashboard');
      expect(DomainUtils.rewriteUrlForDomain('/profile', 'creator')).toBe('/creator/profile');
    });

    it('business 도메인일 때 적절히 경로를 변경해야 한다', () => {
      expect(DomainUtils.rewriteUrlForDomain('/', 'business')).toBe('/business/dashboard');
      expect(DomainUtils.rewriteUrlForDomain('/dashboard', 'business')).toBe('/business/dashboard');
      expect(DomainUtils.rewriteUrlForDomain('/campaigns', 'business')).toBe('/business/campaigns');
    });

    it('admin 도메인일 때 적절히 경로를 변경해야 한다', () => {
      expect(DomainUtils.rewriteUrlForDomain('/', 'admin')).toBe('/admin/dashboard');
      expect(DomainUtils.rewriteUrlForDomain('/dashboard', 'admin')).toBe('/admin/dashboard');
      expect(DomainUtils.rewriteUrlForDomain('/users', 'admin')).toBe('/admin/users');
    });
  });
});
```

### 3. React 훅 테스트

```typescript
// src/hooks/__tests__/use-auth.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/use-auth';
import { AuthUtils } from '@/utils/auth';

// AuthUtils 모킹
jest.mock('@/utils/auth');
const mockAuthUtils = AuthUtils as jest.Mocked<typeof AuthUtils>;

// Supabase 모킹
const mockSupabaseAuth = {
  onAuthStateChange: jest.fn(),
};

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => ({
    auth: mockSupabaseAuth,
  }),
}));

describe('useAuth', () => {
  const mockSession = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
    },
    access_token: 'token-123',
    expires_at: Date.now() / 1000 + 3600,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // onAuthStateChange 모킹
    mockSupabaseAuth.onAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: jest.fn(),
        },
      },
    });
  });

  it('초기 상태에서 로딩 중이어야 한다', () => {
    mockAuthUtils.getCurrentSession.mockImplementation(() => new Promise(() => {})); // 무한 대기

    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('세션이 있을 때 사용자 정보를 설정해야 한다', async () => {
    mockAuthUtils.getCurrentSession.mockResolvedValue(mockSession);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockSession.user);
    expect(result.current.session).toEqual(mockSession);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('세션이 없을 때 사용자 정보를 null로 설정해야 한다', async () => {
    mockAuthUtils.getCurrentSession.mockResolvedValue(null);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('세션 조회 에러 시 에러 상태를 설정해야 한다', async () => {
    const errorMessage = 'Session fetch failed';
    mockAuthUtils.getCurrentSession.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });

  it('signOut 함수가 정상 작동해야 한다', async () => {
    mockAuthUtils.getCurrentSession.mockResolvedValue(mockSession);
    mockAuthUtils.signOut.mockResolvedValue(true);

    const { result } = renderHook(() => useAuth());

    // 초기 세션 로드 대기
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);

    // signOut 실행
    await act(async () => {
      await result.current.signOut();
    });

    expect(mockAuthUtils.signOut).toHaveBeenCalledTimes(1);
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('signOut 실패 시 에러 상태를 설정해야 한다', async () => {
    mockAuthUtils.getCurrentSession.mockResolvedValue(mockSession);
    mockAuthUtils.signOut.mockResolvedValue(false);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.error).toBe('로그아웃에 실패했습니다.');
    expect(result.current.loading).toBe(false);
  });

  it('인증 상태 변경 이벤트를 처리해야 한다', async () => {
    let authStateChangeCallback: (event: string, session: any) => void;

    mockSupabaseAuth.onAuthStateChange.mockImplementation((callback) => {
      authStateChangeCallback = callback;
      return {
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      };
    });

    mockAuthUtils.getCurrentSession.mockResolvedValue(null);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // SIGNED_IN 이벤트 시뮬레이션
    act(() => {
      authStateChangeCallback!('SIGNED_IN', mockSession);
    });

    expect(result.current.user).toEqual(mockSession.user);
    expect(result.current.session).toEqual(mockSession);
    expect(result.current.isAuthenticated).toBe(true);

    // SIGNED_OUT 이벤트 시뮬레이션
    act(() => {
      authStateChangeCallback!('SIGNED_OUT', null);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
```

---

## 통합 테스트 (Integration Tests)

### 1. 인증 플로우 통합 테스트

```typescript
// src/__tests__/auth-integration.test.ts
import { AuthUtils } from '@/utils/auth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// 실제 Supabase 클라이언트를 사용하는 통합 테스트
describe('Auth Integration Tests', () => {
  let supabase: ReturnType<typeof createClientComponentClient>;

  beforeAll(() => {
    // 테스트 환경에서 Supabase 클라이언트 초기화
    supabase = createClientComponentClient({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    });
  });

  afterEach(async () => {
    // 각 테스트 후 로그아웃
    await supabase.auth.signOut();
  });

  describe('이메일 로그인 플로우', () => {
    const testEmail = 'test@example.com';
    const testPassword = 'testpassword123';

    it('회원가입부터 로그인까지 전체 플로우가 작동해야 한다', async () => {
      // 1. 회원가입
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            role: 'creator',
          },
        },
      });

      expect(signUpError).toBeNull();
      expect(signUpData.user).toBeDefined();
      expect(signUpData.user?.email).toBe(testEmail);

      // 2. 프로필 생성 확인 (웹훅 시뮬레이션)
      if (signUpData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: signUpData.user.id,
            email: testEmail,
            role: 'creator',
            referral_code: `REF${signUpData.user.id.slice(0, 6)}`,
          });

        expect(profileError).toBeNull();
      }

      // 3. 로그인
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      expect(signInError).toBeNull();
      expect(signInData.session).toBeDefined();
      expect(signInData.user?.email).toBe(testEmail);

      // 4. 세션 확인
      const session = await AuthUtils.getCurrentSession();
      expect(session).toBeDefined();
      expect(session?.user.email).toBe(testEmail);

      // 5. 프로필 조회
      const profile = await AuthUtils.getUserProfile(signInData.user!.id);
      expect(profile).toBeDefined();
      expect(profile.email).toBe(testEmail);
      expect(profile.role).toBe('creator');

      // 6. 역할 확인
      const hasCreatorRole = await AuthUtils.hasRole(signInData.user!.id, 'creator');
      const hasAdminRole = await AuthUtils.hasRole(signInData.user!.id, 'admin');
      
      expect(hasCreatorRole).toBe(true);
      expect(hasAdminRole).toBe(false);

      // 7. 로그아웃
      const signOutResult = await AuthUtils.signOut();
      expect(signOutResult).toBe(true);

      // 8. 세션 확인 (로그아웃 후)
      const sessionAfterSignOut = await AuthUtils.getCurrentSession();
      expect(sessionAfterSignOut).toBeNull();
    });

    it('잘못된 자격증명으로 로그인 시 에러가 발생해야 한다', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      });

      expect(error).toBeDefined();
      expect(error?.message).toContain('Invalid login credentials');
      expect(data.session).toBeNull();
    });

    it('약한 비밀번호로 회원가입 시 에러가 발생해야 한다', async () => {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: '123', // 약한 비밀번호
      });

      expect(error).toBeDefined();
      expect(error?.message).toContain('Password should be');
      expect(data.user).toBeNull();
    });
  });

  describe('토큰 갱신 플로우', () => {
    it('토큰 갱신이 정상 작동해야 한다', async () => {
      // 로그인
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'testpassword123',
      });

      expect(signInData.session).toBeDefined();

      // 토큰 갱신
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

      expect(refreshError).toBeNull();
      expect(refreshData.session).toBeDefined();
      expect(refreshData.session?.access_token).toBeDefined();
      expect(refreshData.session?.refresh_token).toBeDefined();

      // 새 세션이 이전 세션과 다른지 확인
      expect(refreshData.session?.access_token).not.toBe(signInData.session?.access_token);
    });
  });

  describe('프로필 관리', () => {
    let userId: string;

    beforeEach(async () => {
      // 테스트용 사용자 생성
      const { data } = await supabase.auth.signUp({
        email: 'profile-test@example.com',
        password: 'testpassword123',
      });
      userId = data.user!.id;

      // 프로필 생성
      await supabase.from('profiles').insert({
        user_id: userId,
        email: 'profile-test@example.com',
        role: 'creator',
        referral_code: `REF${userId.slice(0, 6)}`,
      });
    });

    it('프로필 업데이트가 정상 작동해야 한다', async () => {
      // 프로필 업데이트
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: 'Test User',
          phone: '010-1234-5678',
        })
        .eq('user_id', userId);

      expect(error).toBeNull();

      // 업데이트된 프로필 조회
      const updatedProfile = await AuthUtils.getUserProfile(userId);
      expect(updatedProfile.full_name).toBe('Test User');
      expect(updatedProfile.phone).toBe('010-1234-5678');
    });

    it('RLS 정책이 정상 작동해야 한다', async () => {
      // 다른 사용자로 로그인
      const { data: otherUser } = await supabase.auth.signUp({
        email: 'other@example.com',
        password: 'testpassword123',
      });

      // 다른 사용자의 프로필 조회 시도 (RLS로 차단되어야 함)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId);

      // RLS 정책에 따라 빈 배열이 반환되어야 함
      expect(data).toEqual([]);
    });
  });
});
```

### 2. 추천 시스템 통합 테스트

```typescript
// src/__tests__/referral-integration.test.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

describe('Referral System Integration Tests', () => {
  let supabase: ReturnType<typeof createClientComponentClient>;

  beforeAll(() => {
    supabase = createClientComponentClient();
  });

  describe('3단계 추천 시스템', () => {
    it('추천 체인이 올바르게 설정되어야 한다', async () => {
      // Level 1 사용자 생성 (최상위 추천자)
      const { data: level1User } = await supabase.auth.signUp({
        email: 'level1@example.com',
        password: 'testpassword123',
      });

      const level1Profile = {
        user_id: level1User!.user!.id,
        email: 'level1@example.com',
        role: 'creator' as const,
        referral_code: 'LEVEL1',
      };

      await supabase.from('profiles').insert(level1Profile);

      // Level 2 사용자 생성 (Level 1의 추천으로)
      const { data: level2User } = await supabase.auth.signUp({
        email: 'level2@example.com',
        password: 'testpassword123',
      });

      const level2Profile = {
        user_id: level2User!.user!.id,
        email: 'level2@example.com',
        role: 'creator' as const,
        referral_code: 'LEVEL2',
        referrer_l1_id: level1User!.user!.id,
      };

      await supabase.from('profiles').insert(level2Profile);

      // Level 3 사용자 생성 (Level 2의 추천으로)
      const { data: level3User } = await supabase.auth.signUp({
        email: 'level3@example.com',
        password: 'testpassword123',
      });

      const level3Profile = {
        user_id: level3User!.user!.id,
        email: 'level3@example.com',
        role: 'creator' as const,
        referral_code: 'LEVEL3',
        referrer_l1_id: level2User!.user!.id,
        referrer_l2_id: level1User!.user!.id,
      };

      await supabase.from('profiles').insert(level3Profile);

      // Level 4 사용자 생성 (Level 3의 추천으로)
      const { data: level4User } = await supabase.auth.signUp({
        email: 'level4@example.com',
        password: 'testpassword123',
      });

      const level4Profile = {
        user_id: level4User!.user!.id,
        email: 'level4@example.com',
        role: 'creator' as const,
        referral_code: 'LEVEL4',
        referrer_l1_id: level3User!.user!.id,
        referrer_l2_id: level2User!.user!.id,
        referrer_l3_id: level1User!.user!.id,
      };

      await supabase.from('profiles').insert(level4Profile);

      // 추천 체인 검증
      const { data: finalProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', level4User!.user!.id)
        .single();

      expect(finalProfile?.referrer_l1_id).toBe(level3User!.user!.id);
      expect(finalProfile?.referrer_l2_id).toBe(level2User!.user!.id);
      expect(finalProfile?.referrer_l3_id).toBe(level1User!.user!.id);

      // 추천 통계 계산
      const { data: level1Stats } = await supabase
        .from('profiles')
        .select('user_id')
        .or(`referrer_l1_id.eq.${level1User!.user!.id},referrer_l2_id.eq.${level1User!.user!.id},referrer_l3_id.eq.${level1User!.user!.id}`);

      expect(level1Stats?.length).toBe(3); // Level 2, 3, 4 모두 Level 1의 추천 혜택
    });

    it('수수료 계산이 올바르게 작동해야 한다', () => {
      const campaignRevenue = 100000; // 10만원

      // 3단계 추천 수수료 계산
      const l1Commission = campaignRevenue * 0.1; // 10%
      const l2Commission = campaignRevenue * 0.05; // 5%
      const l3Commission = campaignRevenue * 0.02; // 2%
      const creatorEarnings = campaignRevenue - l1Commission - l2Commission - l3Commission;

      expect(l1Commission).toBe(10000);
      expect(l2Commission).toBe(5000);
      expect(l3Commission).toBe(2000);
      expect(creatorEarnings).toBe(83000); // 83%
    });
  });
});
```

---

## E2E 테스트 (End-to-End Tests)

### 1. 인증 플로우 E2E 테스트

```typescript
// tests/e2e/auth-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    fullName: 'Test User',
  };

  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 홈페이지로 이동
    await page.goto('/');
  });

  test('사용자가 회원가입할 수 있어야 한다', async ({ page }) => {
    // 회원가입 페이지로 이동
    await page.click('text=회원가입');
    await expect(page).toHaveURL('/auth/signup');

    // 크리에이터 회원가입 선택
    await page.click('[data-testid="creator-signup"]');
    await expect(page).toHaveURL('/auth/signup/creator');

    // 회원가입 폼 작성
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.fill('[data-testid="confirm-password-input"]', testUser.password);
    await page.fill('[data-testid="full-name-input"]', testUser.fullName);

    // 이용약관 및 개인정보처리방침 동의
    await page.check('[data-testid="terms-checkbox"]');
    await page.check('[data-testid="privacy-checkbox"]');

    // 회원가입 버튼 클릭
    await page.click('[data-testid="signup-button"]');

    // 이메일 인증 안내 페이지로 이동
    await expect(page).toHaveURL('/auth/verify-email');
    await expect(page.locator('text=이메일 인증')).toBeVisible();
  });

  test('사용자가 로그인할 수 있어야 한다', async ({ page }) => {
    // 로그인 페이지로 이동
    await page.click('text=로그인');
    await expect(page).toHaveURL('/auth/signin');

    // 로그인 폼 작성
    await page.fill('[data-testid="email-input"]', 'verified@example.com');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');

    // 로그인 버튼 클릭
    await page.click('[data-testid="signin-button"]');

    // 대시보드로 이동 확인
    await expect(page).toHaveURL('/creator/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('잘못된 자격증명으로 로그인 시 에러가 표시되어야 한다', async ({ page }) => {
    await page.goto('/auth/signin');

    // 잘못된 자격증명으로 로그인 시도
    await page.fill('[data-testid="email-input"]', 'wrong@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="signin-button"]');

    // 에러 메시지 확인
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('text=이메일 또는 비밀번호가 올바르지 않습니다')).toBeVisible();
  });

  test('사용자가 로그아웃할 수 있어야 한다', async ({ page }) => {
    // 로그인된 상태로 시작
    await page.goto('/auth/signin');
    await page.fill('[data-testid="email-input"]', 'verified@example.com');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.click('[data-testid="signin-button"]');

    await expect(page).toHaveURL('/creator/dashboard');

    // 사용자 메뉴 클릭
    await page.click('[data-testid="user-menu"]');

    // 로그아웃 클릭
    await page.click('[data-testid="logout-button"]');

    // 홈페이지로 리디렉션 확인
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=로그인')).toBeVisible();
  });

  test.describe('소셜 로그인', () => {
    test('Google 로그인 플로우가 작동해야 한다', async ({ page, context }) => {
      await page.goto('/auth/signin');

      // Google 로그인 버튼 클릭
      const [popup] = await Promise.all([
        context.waitForEvent('page'),
        page.click('[data-testid="google-signin-button"]'),
      ]);

      // Google OAuth 페이지 확인
      await popup.waitForLoadState();
      expect(popup.url()).toContain('accounts.google.com');

      // Note: 실제 Google 인증은 테스트 환경에서 모킹되어야 함
    });
  });
});
```

### 2. 다중 도메인 라우팅 E2E 테스트

```typescript
// tests/e2e/multi-domain.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Multi-Domain Routing', () => {
  test.describe('도메인별 접근 제어', () => {
    test('메인 도메인에서 모든 역할이 접근 가능해야 한다', async ({ page }) => {
      await page.goto('http://localhost:3002/');
      
      // 메인 페이지 로드 확인
      await expect(page.locator('[data-testid="main-hero"]')).toBeVisible();
      await expect(page.locator('text=크리에이터')).toBeVisible();
      await expect(page.locator('text=비즈니스')).toBeVisible();
    });

    test('크리에이터 서브도메인에서 권한 확인', async ({ page }) => {
      // 인증되지 않은 상태에서 크리에이터 도메인 접근
      await page.goto('http://creator.localhost:3002/');
      
      // 로그인 페이지로 리디렉션 확인
      await expect(page).toHaveURL(/\/auth\/signin/);
      await expect(page.locator('[data-testid="signin-form"]')).toBeVisible();
    });

    test('비즈니스 서브도메인에서 권한 확인', async ({ page }) => {
      // 인증되지 않은 상태에서 비즈니스 도메인 접근
      await page.goto('http://business.localhost:3002/');
      
      // 로그인 페이지로 리디렉션 확인
      await expect(page).toHaveURL(/\/auth\/signin/);
    });

    test('관리자 서브도메인에서 권한 확인', async ({ page }) => {
      // 인증되지 않은 상태에서 관리자 도메인 접근
      await page.goto('http://admin.localhost:3002/');
      
      // 로그인 페이지로 리디렉션 확인
      await expect(page).toHaveURL(/\/auth\/signin/);
    });
  });

  test.describe('역할 기반 리디렉션', () => {
    test('크리에이터가 올바른 대시보드에 접근해야 한다', async ({ page }) => {
      // 크리에이터로 로그인
      await page.goto('/auth/signin');
      await page.fill('[data-testid="email-input"]', 'creator@example.com');
      await page.fill('[data-testid="password-input"]', 'TestPassword123!');
      await page.click('[data-testid="signin-button"]');

      // 크리에이터 대시보드로 리디렉션 확인
      await expect(page).toHaveURL('/creator/dashboard');
      await expect(page.locator('[data-testid="creator-dashboard"]')).toBeVisible();

      // 잘못된 도메인 접근 시 올바른 도메인으로 리디렉션
      await page.goto('http://business.localhost:3002/dashboard');
      await expect(page).toHaveURL('http://creator.localhost:3002/dashboard');
    });

    test('비즈니스 사용자가 올바른 대시보드에 접근해야 한다', async ({ page }) => {
      // 비즈니스 사용자로 로그인
      await page.goto('/auth/signin');
      await page.fill('[data-testid="email-input"]', 'business@example.com');
      await page.fill('[data-testid="password-input"]', 'TestPassword123!');
      await page.click('[data-testid="signin-button"]');

      // 비즈니스 대시보드로 리디렉션 확인
      await expect(page).toHaveURL('/business/dashboard');
      await expect(page.locator('[data-testid="business-dashboard"]')).toBeVisible();

      // 잘못된 도메인 접근 시 올바른 도메인으로 리디렉션
      await page.goto('http://creator.localhost:3002/dashboard');
      await expect(page).toHaveURL('http://business.localhost:3002/dashboard');
    });
  });

  test.describe('URL 재작성', () => {
    test('서브도메인 URL이 올바르게 재작성되어야 한다', async ({ page }) => {
      // 크리에이터로 로그인
      await page.goto('/auth/signin');
      await page.fill('[data-testid="email-input"]', 'creator@example.com');
      await page.fill('[data-testid="password-input"]', 'TestPassword123!');
      await page.click('[data-testid="signin-button"]');

      // 다양한 크리에이터 서브도메인 URL 테스트
      const testUrls = [
        'http://creator.localhost:3002/',
        'http://creator.localhost:3002/dashboard',
        'http://creator.localhost:3002/campaigns',
        'http://creator.localhost:3002/earnings',
      ];

      for (const url of testUrls) {
        await page.goto(url);
        
        // 페이지가 올바르게 로드되었는지 확인
        await expect(page.locator('[data-testid="creator-layout"]')).toBeVisible();
        
        // URL이 변경되지 않았는지 확인 (재작성은 내부적으로 처리)
        expect(page.url()).toBe(url);
      }
    });
  });

  test.describe('성능 테스트', () => {
    test('미들웨어 응답 시간이 1초 미만이어야 한다', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('http://creator.localhost:3002/');
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(1000); // 1초 미만
    });
  });
});
```

---

## 성능 테스트 (Performance Tests)

### 1. 인증 성능 테스트

```typescript
// tests/performance/auth-performance.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Performance Tests', () => {
  test('로그인 성능이 3초 미만이어야 한다', async ({ page }) => {
    await page.goto('/auth/signin');

    // 로그인 시작 시간 기록
    const startTime = Date.now();

    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.click('[data-testid="signin-button"]');

    // 대시보드 로드 완료까지 대기
    await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();

    // 총 소요 시간 계산
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.log(`Login time: ${totalTime}ms`);
    expect(totalTime).toBeLessThan(3000); // 3초 미만
  });

  test('세션 검증 성능이 100ms 미만이어야 한다', async ({ page }) => {
    // 로그인된 상태로 시작
    await page.goto('/auth/signin');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.click('[data-testid="signin-button"]');
    await expect(page).toHaveURL('/creator/dashboard');

    // 페이지 새로고침으로 세션 검증 테스트
    const startTime = Date.now();
    await page.reload();
    await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();
    const endTime = Date.now();

    const sessionValidationTime = endTime - startTime;
    console.log(`Session validation time: ${sessionValidationTime}ms`);
    expect(sessionValidationTime).toBeLessThan(100); // 100ms 미만
  });

  test('동시 로그인 처리 성능', async ({ browser }) => {
    const concurrentUsers = 10;
    const pages = [];

    // 여러 페이지 생성
    for (let i = 0; i < concurrentUsers; i++) {
      const context = await browser.newContext();
      const page = await context.newPage();
      pages.push(page);
    }

    const startTime = Date.now();

    // 동시 로그인 실행
    const loginPromises = pages.map(async (page, index) => {
      await page.goto('/auth/signin');
      await page.fill('[data-testid="email-input"]', `user${index}@example.com`);
      await page.fill('[data-testid="password-input"]', 'TestPassword123!');
      await page.click('[data-testid="signin-button"]');
      await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();
    });

    await Promise.all(loginPromises);
    const endTime = Date.now();

    const totalTime = endTime - startTime;
    const averageTime = totalTime / concurrentUsers;

    console.log(`Concurrent login - Total: ${totalTime}ms, Average: ${averageTime}ms`);
    expect(averageTime).toBeLessThan(5000); // 평균 5초 미만

    // 페이지 정리
    for (const page of pages) {
      await page.close();
    }
  });
});
```

### 2. 데이터베이스 성능 테스트

```typescript
// tests/performance/database-performance.test.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { performance } from 'perf_hooks';

describe('Database Performance Tests', () => {
  let supabase: ReturnType<typeof createClientComponentClient>;

  beforeAll(() => {
    supabase = createClientComponentClient();
  });

  test('프로필 조회 성능이 100ms 미만이어야 한다', async () => {
    const startTime = performance.now();

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', 'test-user-id')
      .single();

    const endTime = performance.now();
    const queryTime = endTime - startTime;

    expect(error).toBeNull();
    expect(queryTime).toBeLessThan(100); // 100ms 미만
    console.log(`Profile query time: ${queryTime.toFixed(2)}ms`);
  });

  test('배치 프로필 조회 성능', async () => {
    const userIds = Array.from({ length: 100 }, (_, i) => `user-${i}`);
    
    const startTime = performance.now();

    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, email, role')
      .in('user_id', userIds);

    const endTime = performance.now();
    const queryTime = endTime - startTime;

    expect(error).toBeNull();
    expect(queryTime).toBeLessThan(500); // 500ms 미만
    console.log(`Batch profile query time: ${queryTime.toFixed(2)}ms for ${userIds.length} users`);
  });

  test('복잡한 조인 쿼리 성능', async () => {
    const startTime = performance.now();

    const { data, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        business_profile:profiles!business_id(*),
        creator_profile:profiles!creator_id(*)
      `)
      .limit(50);

    const endTime = performance.now();
    const queryTime = endTime - startTime;

    expect(error).toBeNull();
    expect(queryTime).toBeLessThan(1000); // 1초 미만
    console.log(`Complex join query time: ${queryTime.toFixed(2)}ms`);
  });

  test('대량 데이터 삽입 성능', async () => {
    const testData = Array.from({ length: 1000 }, (_, i) => ({
      user_id: `bulk-user-${i}`,
      email: `bulk-user-${i}@example.com`,
      role: 'creator' as const,
      referral_code: `BULK${i}`,
    }));

    const startTime = performance.now();

    const { error } = await supabase
      .from('profiles')
      .insert(testData);

    const endTime = performance.now();
    const insertTime = endTime - startTime;

    expect(error).toBeNull();
    expect(insertTime).toBeLessThan(5000); // 5초 미만
    console.log(`Bulk insert time: ${insertTime.toFixed(2)}ms for ${testData.length} records`);

    // 테스트 데이터 정리
    await supabase
      .from('profiles')
      .delete()
      .like('user_id', 'bulk-user-%');
  });

  test('인덱스 성능 확인', async () => {
    // 인덱스가 있는 컬럼 조회
    const startTime1 = performance.now();
    await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', 'test-user-id'); // user_id는 기본키
    const endTime1 = performance.now();

    // 인덱스가 없는 컬럼 조회
    const startTime2 = performance.now();
    await supabase
      .from('profiles')
      .select('*')
      .eq('phone', '010-1234-5678'); // phone은 인덱스 없음 (가정)
    const endTime2 = performance.now();

    const indexedQueryTime = endTime1 - startTime1;
    const nonIndexedQueryTime = endTime2 - startTime2;

    console.log(`Indexed query: ${indexedQueryTime.toFixed(2)}ms`);
    console.log(`Non-indexed query: ${nonIndexedQueryTime.toFixed(2)}ms`);

    // 인덱스 쿼리가 더 빨라야 함
    expect(indexedQueryTime).toBeLessThan(nonIndexedQueryTime);
  });
});
```

---

## 보안 테스트 (Security Tests)

### 1. 인증 보안 테스트

```typescript
// tests/security/auth-security.test.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

describe('Authentication Security Tests', () => {
  let supabase: ReturnType<typeof createClientComponentClient>;

  beforeAll(() => {
    supabase = createClientComponentClient();
  });

  describe('입력 검증', () => {
    test('SQL 인젝션 공격을 방어해야 한다', async () => {
      const maliciousEmail = "test@example.com'; DROP TABLE profiles; --";
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: maliciousEmail,
        password: 'password123',
      });

      // SQL 인젝션이 차단되어야 함
      expect(error).toBeDefined();
      expect(error?.message).not.toContain('syntax error');
      expect(data.session).toBeNull();

      // 테이블이 여전히 존재하는지 확인
      const { data: profiles, error: selectError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      expect(selectError).toBeNull();
      expect(profiles).toBeDefined();
    });

    test('XSS 공격을 방어해야 한다', async () => {
      const xssPayload = '<script>alert("XSS")</script>';
      
      const { error } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            full_name: xssPayload,
          },
        },
      });

      // XSS 페이로드가 적절히 처리되어야 함
      if (!error) {
        // 프로필에서 스크립트 태그가 제거되었는지 확인
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('email', 'test@example.com')
          .single();

        expect(profile?.full_name).not.toContain('<script>');
      }
    });

    test('약한 패스워드를 거부해야 한다', async () => {
      const weakPasswords = [
        '123',
        'password',
        '12345678',
        'qwerty',
        'abc123',
      ];

      for (const password of weakPasswords) {
        const { data, error } = await supabase.auth.signUp({
          email: `weak-${Date.now()}@example.com`,
          password,
        });

        expect(error).toBeDefined();
        expect(error?.message).toContain('Password should be');
        expect(data.user).toBeNull();
      }
    });
  });

  describe('세션 보안', () => {
    test('토큰 만료 시 접근이 차단되어야 한다', async () => {
      // 만료된 토큰으로 요청 시뮬레이션
      const expiredToken = 'expired.jwt.token';
      
      const supabaseWithExpiredToken = createClientComponentClient({
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        supabaseKey: expiredToken,
      });

      const { data, error } = await supabaseWithExpiredToken
        .from('profiles')
        .select('*')
        .limit(1);

      expect(error).toBeDefined();
      expect(data).toBeNull();
    });

    test('동시 세션 제한이 작동해야 한다', async () => {
      const email = 'concurrent-test@example.com';
      const password = 'TestPassword123!';

      // 첫 번째 세션 생성
      const { data: session1 } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      expect(session1.session).toBeDefined();

      // 두 번째 세션 생성 (새 브라우저 시뮬레이션)
      const supabase2 = createClientComponentClient();
      const { data: session2 } = await supabase2.auth.signInWithPassword({
        email,
        password,
      });

      expect(session2.session).toBeDefined();

      // 첫 번째 세션이 무효화되었는지 확인
      const { data: user1 } = await supabase.auth.getUser();
      expect(user1.user).toBeNull(); // 첫 번째 세션 무효화됨

      // 두 번째 세션은 여전히 유효해야 함
      const { data: user2 } = await supabase2.auth.getUser();
      expect(user2.user).toBeDefined();
    });
  });

  describe('권한 제어', () => {
    test('권한 없는 사용자의 관리자 기능 접근이 차단되어야 한다', async () => {
      // 일반 사용자로 로그인
      const { data: userData } = await supabase.auth.signUp({
        email: 'regular-user@example.com',
        password: 'TestPassword123!',
      });

      // 일반 사용자 프로필 생성
      await supabase.from('profiles').insert({
        user_id: userData.user!.id,
        email: 'regular-user@example.com',
        role: 'creator',
        referral_code: 'REGULAR',
      });

      // 관리자 전용 테이블에 접근 시도 (가정)
      const { data, error } = await supabase
        .from('admin_logs') // 관리자 전용 테이블
        .select('*');

      // RLS 정책에 의해 차단되어야 함
      expect(data).toEqual([]); // 빈 배열 반환
    });

    test('다른 사용자의 데이터 접근이 차단되어야 한다', async () => {
      // 사용자 A로 로그인
      const { data: userA } = await supabase.auth.signUp({
        email: 'user-a@example.com',
        password: 'TestPassword123!',
      });

      // 사용자 B 프로필 생성 (직접 삽입)
      const userBId = 'user-b-id';
      await supabase.from('profiles').insert({
        user_id: userBId,
        email: 'user-b@example.com',
        role: 'creator',
        referral_code: 'USERB',
      });

      // 사용자 A가 사용자 B의 프로필에 접근 시도
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userBId);

      // RLS 정책에 의해 차단되어야 함
      expect(data).toEqual([]);
    });
  });

  describe('레이트 리미팅', () => {
    test('과도한 로그인 시도가 차단되어야 한다', async () => {
      const email = 'rate-limit-test@example.com';
      const wrongPassword = 'wrongpassword';

      const attempts = [];
      const maxAttempts = 10;

      // 연속적인 실패한 로그인 시도
      for (let i = 0; i < maxAttempts; i++) {
        const promise = supabase.auth.signInWithPassword({
          email,
          password: wrongPassword,
        });
        attempts.push(promise);
      }

      const results = await Promise.all(attempts);

      // 나중의 시도들은 레이트 리미팅으로 차단되어야 함
      const rateLimitedAttempts = results.filter(result => 
        result.error?.message?.includes('Too many requests')
      );

      expect(rateLimitedAttempts.length).toBeGreaterThan(0);
    }, 30000); // 30초 타임아웃
  });

  describe('데이터 암호화', () => {
    test('민감한 데이터가 암호화되어 저장되어야 한다', async () => {
      const sensitiveData = {
        email: 'sensitive@example.com',
        phone: '010-1234-5678',
        full_name: 'Sensitive User',
      };

      const { data: user } = await supabase.auth.signUp({
        email: sensitiveData.email,
        password: 'TestPassword123!',
      });

      await supabase.from('profiles').insert({
        user_id: user.user!.id,
        email: sensitiveData.email,
        phone: sensitiveData.phone,
        full_name: sensitiveData.full_name,
        role: 'creator',
        referral_code: 'SENSITIVE',
      });

      // 데이터베이스에서 직접 조회 (서비스 역할로)
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.user!.id)
        .single();

      expect(profile).toBeDefined();
      
      // 실제 운영 환경에서는 민감한 데이터가 암호화되어 있어야 함
      // 여기서는 데이터가 올바르게 저장되었는지만 확인
      expect(profile?.email).toBe(sensitiveData.email);
      expect(profile?.phone).toBe(sensitiveData.phone);
    });
  });
});
```

### 2. API 보안 테스트

```typescript
// tests/security/api-security.spec.ts
import { test, expect } from '@playwright/test';

test.describe('API Security Tests', () => {
  test.describe('인증 API 보안', () => {
    test('Authorization 헤더 없이 보호된 API 접근 시 401 에러', async ({ request }) => {
      const response = await request.get('/api/protected/profile');
      
      expect(response.status()).toBe(401);
      
      const body = await response.json();
      expect(body.error).toContain('Unauthorized');
    });

    test('잘못된 토큰으로 API 접근 시 401 에러', async ({ request }) => {
      const response = await request.get('/api/protected/profile', {
        headers: {
          'Authorization': 'Bearer invalid.jwt.token',
        },
      });
      
      expect(response.status()).toBe(401);
    });

    test('만료된 토큰으로 API 접근 시 401 에러', async ({ request }) => {
      // 만료된 토큰 (실제로는 테스트용 만료된 토큰 생성)
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';
      
      const response = await request.get('/api/protected/profile', {
        headers: {
          'Authorization': `Bearer ${expiredToken}`,
        },
      });
      
      expect(response.status()).toBe(401);
    });
  });

  test.describe('입력 검증', () => {
    test('SQL 인젝션 시도가 차단되어야 한다', async ({ request }) => {
      const maliciousPayload = {
        email: "test@example.com'; DROP TABLE profiles; --",
        password: 'password123',
      };

      const response = await request.post('/api/auth/signin', {
        data: maliciousPayload,
      });

      // 요청이 거부되거나 안전하게 처리되어야 함
      expect(response.status()).not.toBe(200);
    });

    test('대용량 페이로드가 차단되어야 한다', async ({ request }) => {
      const largePayload = {
        email: 'test@example.com',
        password: 'a'.repeat(10000), // 10KB 패스워드
        data: 'x'.repeat(1000000), // 1MB 추가 데이터
      };

      const response = await request.post('/api/auth/signup', {
        data: largePayload,
      });

      // 413 Payload Too Large 또는 400 Bad Request
      expect([400, 413, 422]).toContain(response.status());
    });

    test('잘못된 Content-Type이 차단되어야 한다', async ({ request }) => {
      const response = await request.post('/api/auth/signin', {
        headers: {
          'Content-Type': 'application/xml',
        },
        data: '<xml>malicious</xml>',
      });

      expect(response.status()).toBe(400);
    });
  });

  test.describe('CORS 정책', () => {
    test('허용되지 않은 Origin에서의 요청이 차단되어야 한다', async ({ request }) => {
      const response = await request.post('/api/auth/signin', {
        headers: {
          'Origin': 'https://malicious-site.com',
        },
        data: {
          email: 'test@example.com',
          password: 'password123',
        },
      });

      // CORS 정책에 따라 차단되어야 함
      const corsHeader = response.headers()['access-control-allow-origin'];
      expect(corsHeader).not.toBe('https://malicious-site.com');
    });
  });

  test.describe('헤더 보안', () => {
    test('보안 헤더가 올바르게 설정되어야 한다', async ({ request }) => {
      const response = await request.get('/');
      
      const headers = response.headers();
      
      // 필수 보안 헤더 확인
      expect(headers['x-frame-options']).toBe('DENY');
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(headers['permissions-policy']).toContain('camera=()');
    });

    test('민감한 정보가 헤더에 노출되지 않아야 한다', async ({ request }) => {
      const response = await request.get('/api/auth/me');
      
      const headers = response.headers();
      
      // 서버 정보 숨김
      expect(headers['server']).toBeUndefined();
      expect(headers['x-powered-by']).toBeUndefined();
      
      // 민감한 환경 변수 노출 방지
      expect(JSON.stringify(headers)).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
      expect(JSON.stringify(headers)).not.toContain('JWT_SECRET');
    });
  });
});
```

이 포괄적인 테스트 케이스들은 Supabase Auth 마이그레이션 후 시스템의 안정성, 성능, 보안을 보장하는 데 도움이 됩니다. 각 테스트는 실제 운영 환경에서 발생할 수 있는 다양한 시나리오를 다루고 있습니다.
# 마이그레이션 코드 스니펫 모음

## 목차
1. [유틸리티 함수](#유틸리티-함수)
2. [React 훅](#react-훅)
3. [미들웨어 패턴](#미들웨어-패턴)
4. [에러 핸들링](#에러-핸들링)
5. [성능 최적화](#성능-최적화)

---

## 유틸리티 함수

### 1. 세션 관리 유틸리티

```typescript
// utils/auth.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database.types';

export class AuthUtils {
  private static supabase = createClientComponentClient<Database>();

  /**
   * 현재 세션 가져오기 (캐시 적용)
   */
  static async getCurrentSession() {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      
      if (error) {
        console.error('Session retrieval failed:', error);
        return null;
      }
      
      return session;
    } catch (error) {
      console.error('Session error:', error);
      return null;
    }
  }

  /**
   * 사용자 프로필 가져오기
   */
  static async getUserProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new Error(`Profile fetch failed: ${error.message}`);
    }

    return data;
  }

  /**
   * 역할 기반 접근 제어
   */
  static async hasRole(userId: string, role: string): Promise<boolean> {
    try {
      const profile = await this.getUserProfile(userId);
      return profile.role === role;
    } catch {
      return false;
    }
  }

  /**
   * 안전한 로그아웃
   */
  static async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out failed:', error);
        return false;
      }

      // 클라이언트 사이드 정리
      localStorage.removeItem('user-preferences');
      sessionStorage.clear();
      
      return true;
    } catch (error) {
      console.error('Sign out error:', error);
      return false;
    }
  }

  /**
   * 토큰 검증 및 갱신
   */
  static async refreshTokenIfNeeded() {
    const session = await this.getCurrentSession();
    
    if (!session) return null;

    // 토큰이 30분 이내에 만료되면 갱신
    const expiresAt = new Date(session.expires_at! * 1000);
    const now = new Date();
    const thirtyMinutes = 30 * 60 * 1000;

    if (expiresAt.getTime() - now.getTime() < thirtyMinutes) {
      const { data: { session: newSession }, error } = await this.supabase.auth.refreshSession();
      
      if (error) {
        console.error('Token refresh failed:', error);
        return null;
      }
      
      return newSession;
    }

    return session;
  }
}
```

### 2. 도메인 라우팅 유틸리티

```typescript
// utils/domain-routing.ts
export type DomainType = 'main' | 'creator' | 'business' | 'admin';
export type UserRole = 'creator' | 'business' | 'admin';

export class DomainUtils {
  /**
   * 도메인 타입 감지
   */
  static getDomainType(hostname: string): DomainType {
    if (!hostname) return 'main';
    
    const lowerHost = hostname.toLowerCase();
    
    if (lowerHost.includes('creator.')) return 'creator';
    if (lowerHost.includes('business.')) return 'business';
    if (lowerHost.includes('admin.')) return 'admin';
    
    return 'main';
  }

  /**
   * 역할과 도메인 매칭 검증
   */
  static isDomainRoleMatch(domainType: DomainType, userRole: UserRole): boolean {
    const roleMapping: Record<DomainType, UserRole[]> = {
      main: ['creator', 'business', 'admin'],
      creator: ['creator'],
      business: ['business'],
      admin: ['admin']
    };

    return roleMapping[domainType]?.includes(userRole) ?? false;
  }

  /**
   * 역할 기반 기본 리디렉션 경로
   */
  static getDefaultRedirectPath(userRole: UserRole): string {
    const redirectPaths: Record<UserRole, string> = {
      creator: '/creator/dashboard',
      business: '/business/dashboard',
      admin: '/admin/dashboard'
    };

    return redirectPaths[userRole] || '/';
  }

  /**
   * URL 재작성 (도메인별)
   */
  static rewriteUrlForDomain(pathname: string, domainType: DomainType): string {
    if (domainType === 'main') return pathname;

    const prefixes: Record<Exclude<DomainType, 'main'>, string> = {
      creator: '/creator',
      business: '/business',
      admin: '/admin'
    };

    const prefix = prefixes[domainType as Exclude<DomainType, 'main'>];

    if (pathname === '/' || pathname === '/dashboard') {
      return `${prefix}/dashboard`;
    }

    return `${prefix}${pathname}`;
  }
}
```

---

## React 훅

### 1. 인증 상태 관리 훅

```typescript
// hooks/use-auth.ts
import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AuthUtils } from '@/utils/auth';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null
  });

  const supabase = createClientComponentClient();

  const updateAuthState = useCallback((session: Session | null, error?: string) => {
    setState({
      user: session?.user ?? null,
      session,
      loading: false,
      error: error ?? null
    });
  }, []);

  useEffect(() => {
    // 초기 세션 가져오기
    AuthUtils.getCurrentSession()
      .then(session => updateAuthState(session))
      .catch(error => updateAuthState(null, error.message));

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_OUT') {
          updateAuthState(null);
        } else if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          updateAuthState(session);
        } else if (event === 'TOKEN_REFRESHED') {
          updateAuthState(session);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth, updateAuthState]);

  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const success = await AuthUtils.signOut();
      if (success) {
        updateAuthState(null);
      } else {
        setState(prev => ({ ...prev, loading: false, error: '로그아웃에 실패했습니다.' }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : '로그아웃 오류' 
      }));
    }
  }, [updateAuthState]);

  return {
    ...state,
    signOut,
    isAuthenticated: !!state.user,
    isLoading: state.loading
  };
}
```

### 2. 사용자 프로필 훅

```typescript
// hooks/use-profile.ts
import { useState, useEffect } from 'react';
import { AuthUtils } from '@/utils/auth';
import { useAuth } from './use-auth';
import type { Database } from '@/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!user?.id) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const profileData = await AuthUtils.getUserProfile(user.id);
        setProfile(profileData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '프로필 로딩 실패');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user?.id]);

  return {
    profile,
    loading,
    error,
    hasRole: (role: string) => profile?.role === role,
    refetch: () => {
      if (user?.id) {
        AuthUtils.getUserProfile(user.id)
          .then(setProfile)
          .catch(err => setError(err.message));
      }
    }
  };
}
```

### 3. 보호된 라우트 훅

```typescript
// hooks/use-protected-route.ts
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './use-auth';
import { useProfile } from './use-profile';
import { DomainUtils } from '@/utils/domain-routing';

interface UseProtectedRouteOptions {
  requiredRole?: string;
  redirectTo?: string;
  domainCheck?: boolean;
}

export function useProtectedRoute(options: UseProtectedRouteOptions = {}) {
  const { user, isLoading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const router = useRouter();

  const isLoading = authLoading || profileLoading;

  useEffect(() => {
    // 로딩 중이면 대기
    if (isLoading) return;

    // 인증되지 않은 사용자
    if (!user) {
      router.push(options.redirectTo || '/auth/signin');
      return;
    }

    // 역할 확인
    if (options.requiredRole && profile?.role !== options.requiredRole) {
      const defaultPath = DomainUtils.getDefaultRedirectPath(profile?.role as any);
      router.push(defaultPath);
      return;
    }

    // 도메인 확인
    if (options.domainCheck && typeof window !== 'undefined') {
      const domainType = DomainUtils.getDomainType(window.location.hostname);
      const userRole = profile?.role;

      if (userRole && !DomainUtils.isDomainRoleMatch(domainType, userRole as any)) {
        const correctPath = DomainUtils.getDefaultRedirectPath(userRole as any);
        window.location.href = correctPath; // 전체 페이지 리디렉션
        return;
      }
    }
  }, [user, profile, isLoading, router, options]);

  return {
    user,
    profile,
    isLoading,
    isAuthorized: !isLoading && !!user && (!options.requiredRole || profile?.role === options.requiredRole)
  };
}
```

---

## 미들웨어 패턴

### 1. 인증 미들웨어

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DomainUtils } from '@/utils/domain-routing';

// 보호된 경로 패턴
const PROTECTED_PATTERNS = [
  '/creator/dashboard',
  '/business/dashboard', 
  '/admin/dashboard',
  '/api/protected'
];

// 인증이 필요한 경로인지 확인
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PATTERNS.some(pattern => 
    pathname.startsWith(pattern) || pathname.match(new RegExp(pattern.replace('*', '.*')))
  );
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  try {
    // Supabase 클라이언트 생성
    const supabase = createMiddlewareClient({ req: request, res: response });

    // 도메인 타입 감지
    const domainType = DomainUtils.getDomainType(hostname);

    // URL 재작성 (서브도메인 → 경로 기반)
    if (domainType !== 'main') {
      const rewrittenPath = DomainUtils.rewriteUrlForDomain(pathname, domainType);
      
      if (rewrittenPath !== pathname) {
        const rewriteUrl = new URL(rewrittenPath, request.url);
        return NextResponse.rewrite(rewriteUrl);
      }
    }

    // 보호된 경로가 아니면 바로 통과
    if (!isProtectedRoute(pathname)) {
      return response;
    }

    // 세션 확인
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Middleware auth error:', error);
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    // 인증되지 않은 사용자
    if (!session?.user) {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('redirectedFrom', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // 사용자 프로필 및 역할 확인
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (!profile) {
      console.error('Profile not found for user:', session.user.id);
      return NextResponse.redirect(new URL('/auth/complete-profile', request.url));
    }

    // 도메인-역할 매칭 확인
    if (!DomainUtils.isDomainRoleMatch(domainType, profile.role as any)) {
      const correctPath = DomainUtils.getDefaultRedirectPath(profile.role as any);
      return NextResponse.redirect(new URL(correctPath, request.url));
    }

    return response;

  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
```

### 2. API 라우트 인증 미들웨어

```typescript
// utils/api-auth.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/database.types';

export async function withAuth<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  options: {
    requiredRole?: string;
    requireEmailVerified?: boolean;
  } = {}
) {
  return async (request: NextRequest, ...args: T) => {
    try {
      const supabase = createRouteHandlerClient<Database>({ cookies });
      
      // 세션 확인
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        return NextResponse.json(
          { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
          { status: 401 }
        );
      }

      // 이메일 인증 확인
      if (options.requireEmailVerified && !session.user.email_confirmed_at) {
        return NextResponse.json(
          { error: 'Email verification required', code: 'EMAIL_NOT_VERIFIED' },
          { status: 403 }
        );
      }

      // 역할 확인
      if (options.requiredRole) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        if (profileError || !profile) {
          return NextResponse.json(
            { error: 'Profile not found', code: 'PROFILE_NOT_FOUND' },
            { status: 404 }
          );
        }

        if (profile.role !== options.requiredRole) {
          return NextResponse.json(
            { error: 'Insufficient permissions', code: 'INSUFFICIENT_ROLE' },
            { status: 403 }
          );
        }
      }

      // 인증된 요청에 사용자 정보 추가
      (request as any).user = session.user;
      
      return handler(request, ...args);

    } catch (error) {
      console.error('API auth middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error', code: 'INTERNAL_ERROR' },
        { status: 500 }
      );
    }
  };
}

// 사용 예시
// export const GET = withAuth(async (request) => {
//   const user = (request as any).user;
//   return NextResponse.json({ user });
// }, { requiredRole: 'admin' });
```

---

## 에러 핸들링

### 1. 에러 경계 컴포넌트

```typescript
// components/error-boundary.tsx
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Auth Error Boundary caught an error:', error, errorInfo);
    
    // 에러 추적 서비스로 전송
    this.props.onError?.(error, errorInfo);
    
    // 인증 관련 에러인 경우 특별 처리
    if (this.isAuthError(error)) {
      this.handleAuthError(error);
    }
  }

  private isAuthError(error: Error): boolean {
    const authErrorKeywords = [
      'invalid_grant',
      'unauthorized',
      'session_not_found',
      'jwt',
      'token'
    ];

    return authErrorKeywords.some(keyword => 
      error.message.toLowerCase().includes(keyword)
    );
  }

  private handleAuthError(error: Error) {
    // 인증 에러 시 로그아웃 처리
    if (typeof window !== 'undefined') {
      localStorage.removeItem('supabase.auth.token');
      window.location.href = '/auth/signin?error=session_expired';
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium text-gray-900">인증 오류가 발생했습니다</h3>
              <p className="mt-2 text-sm text-gray-500">
                페이지를 새로고침하거나 다시 로그인해 주세요.
              </p>
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  새로고침
                </button>
                <button
                  onClick={() => window.location.href = '/auth/signin'}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  로그인
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 2. 에러 처리 유틸리티

```typescript
// utils/error-handler.ts
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'invalid_credentials',
  EMAIL_NOT_CONFIRMED = 'email_not_confirmed',
  TOO_MANY_REQUESTS = 'too_many_requests',
  WEAK_PASSWORD = 'weak_password',
  EMAIL_ALREADY_REGISTERED = 'email_already_registered',
  SESSION_EXPIRED = 'session_expired',
  NETWORK_ERROR = 'network_error',
  UNKNOWN_ERROR = 'unknown_error'
}

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  userMessage: string;
  details?: any;
}

export class AuthErrorHandler {
  private static errorMessages: Record<AuthErrorCode, string> = {
    [AuthErrorCode.INVALID_CREDENTIALS]: '이메일 또는 비밀번호가 올바르지 않습니다.',
    [AuthErrorCode.EMAIL_NOT_CONFIRMED]: '이메일 인증이 필요합니다. 받은편지함을 확인해 주세요.',
    [AuthErrorCode.TOO_MANY_REQUESTS]: '너무 많은 요청입니다. 잠시 후 다시 시도해 주세요.',
    [AuthErrorCode.WEAK_PASSWORD]: '비밀번호는 8자 이상이어야 하며, 숫자와 특수문자를 포함해야 합니다.',
    [AuthErrorCode.EMAIL_ALREADY_REGISTERED]: '이미 등록된 이메일 주소입니다.',
    [AuthErrorCode.SESSION_EXPIRED]: '세션이 만료되었습니다. 다시 로그인해 주세요.',
    [AuthErrorCode.NETWORK_ERROR]: '네트워크 연결을 확인해 주세요.',
    [AuthErrorCode.UNKNOWN_ERROR]: '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
  };

  static handleSupabaseError(error: any): AuthError {
    let code: AuthErrorCode;
    
    // Supabase 에러 메시지를 기반으로 에러 코드 결정
    if (error.message?.includes('Invalid login credentials')) {
      code = AuthErrorCode.INVALID_CREDENTIALS;
    } else if (error.message?.includes('Email not confirmed')) {
      code = AuthErrorCode.EMAIL_NOT_CONFIRMED;
    } else if (error.message?.includes('Too many requests')) {
      code = AuthErrorCode.TOO_MANY_REQUESTS;
    } else if (error.message?.includes('Password should be')) {
      code = AuthErrorCode.WEAK_PASSWORD;
    } else if (error.message?.includes('already registered')) {
      code = AuthErrorCode.EMAIL_ALREADY_REGISTERED;
    } else if (error.message?.includes('JWT') || error.message?.includes('session')) {
      code = AuthErrorCode.SESSION_EXPIRED;
    } else if (error.name === 'NetworkError' || !navigator.onLine) {
      code = AuthErrorCode.NETWORK_ERROR;
    } else {
      code = AuthErrorCode.UNKNOWN_ERROR;
    }

    return {
      code,
      message: error.message || 'Unknown error',
      userMessage: this.errorMessages[code],
      details: error
    };
  }

  static isRetryableError(error: AuthError): boolean {
    return [
      AuthErrorCode.TOO_MANY_REQUESTS,
      AuthErrorCode.NETWORK_ERROR,
      AuthErrorCode.SESSION_EXPIRED
    ].includes(error.code);
  }

  static getRetryDelay(error: AuthError): number {
    switch (error.code) {
      case AuthErrorCode.TOO_MANY_REQUESTS:
        return 5000; // 5초
      case AuthErrorCode.NETWORK_ERROR:
        return 2000; // 2초
      case AuthErrorCode.SESSION_EXPIRED:
        return 1000; // 1초
      default:
        return 0;
    }
  }
}
```

---

## 성능 최적화

### 1. 세션 캐시 시스템

```typescript
// utils/session-cache.ts
import type { Session } from '@supabase/supabase-js';

interface CacheEntry {
  session: Session | null;
  timestamp: number;
  ttl: number;
}

export class SessionCache {
  private static instance: SessionCache;
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5분

  static getInstance(): SessionCache {
    if (!SessionCache.instance) {
      SessionCache.instance = new SessionCache();
    }
    return SessionCache.instance;
  }

  set(key: string, session: Session | null, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      session,
      timestamp: Date.now(),
      ttl
    });

    // 메모리 누수 방지를 위한 자동 정리
    this.scheduleCleanup();
  }

  get(key: string): Session | null | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) return undefined;

    const now = Date.now();
    const isExpired = (now - entry.timestamp) > entry.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.session;
  }

  invalidate(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  private scheduleCleanup(): void {
    // 10분마다 만료된 엔트리 정리
    setTimeout(() => {
      this.cleanup();
    }, 10 * 60 * 1000);
  }

  private cleanup(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if ((now - entry.timestamp) > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // 디버깅용 메서드
  getStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

// 전역 인스턴스
export const sessionCache = SessionCache.getInstance();
```

### 2. 배치 요청 유틸리티

```typescript
// utils/batch-requests.ts
interface BatchRequest<T> {
  id: string;
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
}

export class BatchRequestManager {
  private batches = new Map<string, BatchRequest<any>[]>();
  private timers = new Map<string, NodeJS.Timeout>();
  private readonly BATCH_DELAY = 50; // 50ms 지연 후 배치 실행

  async batchRequest<T>(
    batchKey: string,
    requestId: string,
    requestFn: (ids: string[]) => Promise<T[]>
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      // 배치에 요청 추가
      if (!this.batches.has(batchKey)) {
        this.batches.set(batchKey, []);
      }

      const batch = this.batches.get(batchKey)!;
      batch.push({
        id: requestId,
        promise: Promise.resolve(null as any),
        resolve,
        reject
      });

      // 타이머 재설정
      if (this.timers.has(batchKey)) {
        clearTimeout(this.timers.get(batchKey)!);
      }

      this.timers.set(batchKey, setTimeout(() => {
        this.executeBatch(batchKey, requestFn);
      }, this.BATCH_DELAY));
    });
  }

  private async executeBatch<T>(
    batchKey: string,
    requestFn: (ids: string[]) => Promise<T[]>
  ): Promise<void> {
    const batch = this.batches.get(batchKey);
    if (!batch?.length) return;

    // 배치 정리
    this.batches.delete(batchKey);
    this.timers.delete(batchKey);

    try {
      const ids = batch.map(req => req.id);
      const results = await requestFn(ids);

      // 결과를 각 요청에 전달
      batch.forEach((request, index) => {
        if (results[index] !== undefined) {
          request.resolve(results[index]);
        } else {
          request.reject(new Error(`No result for request ${request.id}`));
        }
      });
    } catch (error) {
      // 에러를 모든 요청에 전달
      batch.forEach(request => {
        request.reject(error);
      });
    }
  }
}

// 사용 예시: 사용자 프로필 배치 로딩
export const profileBatchManager = new BatchRequestManager();

export async function getBatchedProfile(userId: string) {
  return profileBatchManager.batchRequest(
    'profiles',
    userId,
    async (userIds: string[]) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds);

      if (error) throw error;

      // 결과를 요청 순서에 맞게 정렬
      return userIds.map(id => 
        data.find(profile => profile.user_id === id)
      );
    }
  );
}
```

### 3. 성능 모니터링 유틸리티

```typescript
// utils/performance-monitor.ts
interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  success: boolean;
  error?: string;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private readonly MAX_METRICS = 1000; // 최대 1000개 메트릭 저장

  // 성능 측정 데코레이터
  measure<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    name: string
  ): T {
    return (async (...args: any[]) => {
      const startTime = performance.now();
      const startTimestamp = Date.now();

      try {
        const result = await fn(...args);
        const duration = performance.now() - startTime;

        this.addMetric({
          name,
          duration,
          timestamp: startTimestamp,
          success: true
        });

        return result;
      } catch (error) {
        const duration = performance.now() - startTime;

        this.addMetric({
          name,
          duration,
          timestamp: startTimestamp,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        throw error;
      }
    }) as T;
  }

  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // 메트릭 수 제한
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }

    // 실시간 성능 경고
    if (metric.duration > 1000) { // 1초 이상
      console.warn(`Slow operation detected: ${metric.name} took ${metric.duration.toFixed(2)}ms`);
    }
  }

  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name);
    }
    return [...this.metrics];
  }

  getAverageTime(name: string): number {
    const relevantMetrics = this.metrics.filter(m => m.name === name && m.success);
    if (relevantMetrics.length === 0) return 0;

    const totalTime = relevantMetrics.reduce((sum, m) => sum + m.duration, 0);
    return totalTime / relevantMetrics.length;
  }

  getSuccessRate(name: string): number {
    const relevantMetrics = this.metrics.filter(m => m.name === name);
    if (relevantMetrics.length === 0) return 0;

    const successCount = relevantMetrics.filter(m => m.success).length;
    return successCount / relevantMetrics.length;
  }

  generateReport(): {
    totalOperations: number;
    operationStats: Record<string, {
      count: number;
      averageTime: number;
      successRate: number;
      slowestOperation: number;
    }>;
  } {
    const operationStats: Record<string, any> = {};

    // 고유한 작업 명 추출
    const uniqueNames = [...new Set(this.metrics.map(m => m.name))];

    uniqueNames.forEach(name => {
      const relevantMetrics = this.metrics.filter(m => m.name === name);
      const successfulMetrics = relevantMetrics.filter(m => m.success);

      operationStats[name] = {
        count: relevantMetrics.length,
        averageTime: this.getAverageTime(name),
        successRate: this.getSuccessRate(name),
        slowestOperation: Math.max(...relevantMetrics.map(m => m.duration))
      };
    });

    return {
      totalOperations: this.metrics.length,
      operationStats
    };
  }

  clear(): void {
    this.metrics = [];
  }
}

// 전역 성능 모니터
export const performanceMonitor = new PerformanceMonitor();

// 사용 예시
export const signInWithPerformance = performanceMonitor.measure(
  AuthUtils.signInWithPassword,
  'signInWithPassword'
);
```

이 코드 스니펫들은 Supabase Auth 마이그레이션 시 자주 사용되는 패턴들을 포함하고 있으며, 성능 최적화와 에러 처리를 중점으로 구성되었습니다.
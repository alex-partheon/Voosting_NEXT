# Supabase Auth MVP 구현 가이드

**문서 버전**: 1.0  
**작성일**: 2025년 7월 30일  
**적용 단계**: Core MVP (Week 1-2)  
**우선순위**: P0 (최고 우선순위)

---

## 🎯 MVP 인증 시스템 목표

### Core MVP 인증 요구사항

```yaml
필수 기능 (8주 내 구현): ✅ 카카오 OAuth 소셜 로그인
  ✅ 이메일/비밀번호 로그인 (백업용)
  ✅ 사용자 프로필 관리
  ✅ 역할 기반 접근 제어 (크리에이터/비즈니스)
  ✅ 멀티도메인 인증 (crt./biz./adm.)
  ✅ 1단계 추천 관계 설정

제외 기능 (Enhanced MVP에서 구현): 🔄 복잡한 RLS 정책 (기본 정책만)
  🔄 실시간 세션 동기화
  🔄 고급 보안 기능
  🔄 2-3단계 추천 시스템
```

### 기대 효과

- **개발 속도**: Clerk 대비 1주 추가 시간으로 완전한 제어권 확보
- **비용 절약**: 즉시 월 $25+ 절약, 확장 시 기하급수적 절약
- **기술 통합**: Supabase 생태계 완전 활용

---

## 🛠 1. Supabase 프로젝트 설정

### 1.1 Supabase 프로젝트 생성

```bash
# 1. Supabase 계정 생성 및 프로젝트 생성
# https://supabase.com/dashboard

# 2. 로컬 CLI 설치
npm install -g supabase

# 3. 프로젝트 초기화
supabase init

# 4. 로컬 개발 환경 시작
supabase start

# 5. 원격 프로젝트 연결
supabase link --project-ref YOUR_PROJECT_REF
```

### 1.2 환경 변수 설정

```bash
# .env.local
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."

# 사이트 URL (리다이렉트용)
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# 카카오 OAuth (Supabase Dashboard에서 설정)
NEXT_PUBLIC_KAKAO_CLIENT_ID="your-kakao-rest-api-key"
```

### 1.3 패키지 설치

```bash
# Supabase 클라이언트 라이브러리
npm install @supabase/supabase-js @supabase/ssr

# 기존 Clerk 패키지 제거
npm uninstall @clerk/nextjs @clerk/themes
```

---

## 🗄️ 2. MVP 데이터베이스 스키마

### 2.1 핵심 테이블 구조

```sql
-- supabase/migrations/20250801000001_create_profiles.sql

-- 사용자 역할 ENUM
CREATE TYPE user_role AS ENUM ('creator', 'business', 'admin');

-- 사용자 프로필 테이블 (MVP 버전)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'creator',
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,

  -- MVP: 1단계 추천만 구현
  referrer_id UUID REFERENCES profiles(id),
  referral_code TEXT UNIQUE NOT NULL DEFAULT generate_referral_code(),

  -- 수익 관리 (MVP: 기본 구조)
  total_earnings DECIMAL(10,2) DEFAULT 0,
  referral_earnings DECIMAL(10,2) DEFAULT 0,

  -- 메타데이터
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 추천 코드 생성 함수
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
BEGIN
  RETURN UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

-- 프로필 업데이트 트리거
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_referrer ON profiles(referrer_id);
CREATE INDEX idx_profiles_referral_code ON profiles(referral_code);
```

### 2.2 Row Level Security (MVP 기본 정책)

```sql
-- supabase/migrations/20250801000002_create_rls_policies.sql

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 기본 RLS 정책 (MVP용 - 단순화)
-- 1. 사용자는 자신의 프로필만 조회/수정 가능
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. 인증된 사용자는 다른 사용자의 공개 정보 조회 가능
CREATE POLICY "Users can view others public info" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- 3. 새 사용자 프로필 생성 허용
CREATE POLICY "Enable insert for authenticated users" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Enhanced MVP에서 확장될 고급 정책들은 나중에 추가
-- 예: 도메인별 접근 제어, 관리자 권한, 복잡한 비즈니스 로직
```

### 2.3 사용자 생성 트리거

```sql
-- supabase/migrations/20250801000003_create_user_trigger.sql

-- 새 사용자 등록 시 자동으로 프로필 생성
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'creator'  -- MVP: 기본값은 크리에이터
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.users 테이블에 트리거 연결
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

---

## 🔧 3. Next.js 15 클라이언트 구현

### 3.1 Supabase 클라이언트 설정

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
};

// 전역 클라이언트 인스턴스 (MVP에서 단순화)
export const supabase = createClient();
```

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

export const createClient = () => {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server component에서는 cookie 설정 불가
          }
        },
      },
    },
  );
};
```

### 3.2 TypeScript 타입 정의

```typescript
// types/database.ts (Supabase CLI로 자동 생성)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'creator' | 'business' | 'admin';
          avatar_url: string | null;
          bio: string | null;
          phone: string | null;
          referrer_id: string | null;
          referral_code: string;
          total_earnings: number;
          referral_earnings: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role?: 'creator' | 'business' | 'admin';
          avatar_url?: string | null;
          bio?: string | null;
          phone?: string | null;
          referrer_id?: string | null;
          referral_code?: string;
          total_earnings?: number;
          referral_earnings?: number;
        };
        Update: {
          email?: string;
          name?: string;
          role?: 'creator' | 'business' | 'admin';
          avatar_url?: string | null;
          bio?: string | null;
          phone?: string | null;
          referrer_id?: string | null;
          total_earnings?: number;
          referral_earnings?: number;
          updated_at?: string;
        };
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
```

### 3.3 인증 훅 구현

```typescript
// hooks/use-auth.ts
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types/database';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    // 현재 세션 확인
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      }

      setLoading(false);
    };

    getSession();

    // 인증 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();

    setProfile(profile);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (!error && data) {
      setProfile(data);
    }

    return { data, error };
  };

  return {
    user,
    profile,
    loading,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
    isCreator: profile?.role === 'creator',
    isBusiness: profile?.role === 'business',
    isAdmin: profile?.role === 'admin',
  };
}
```

---

## 🔑 4. 카카오 OAuth 구현

### 4.1 Supabase Dashboard 설정

```yaml
# Supabase Dashboard > Authentication > Providers > Kakao

Site URL: http://localhost:3000
Redirect URLs:
  - http://localhost:3000/auth/callback
  - https://your-domain.com/auth/callback

Kakao OAuth 설정:
  Client ID: YOUR_KAKAO_REST_API_KEY
  Client Secret: YOUR_KAKAO_CLIENT_SECRET

Scopes: profile_nickname,profile_image,account_email
```

### 4.2 카카오 로그인 컴포넌트

```typescript
// components/auth/kakao-login-button.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function KakaoLoginButton() {
  const supabase = createClient()

  const handleKakaoLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'profile_nickname profile_image account_email'
        }
      })

      if (error) {
        console.error('카카오 로그인 실패:', error)
        alert('로그인에 실패했습니다. 다시 시도해주세요.')
      }
    } catch (error) {
      console.error('카카오 로그인 오류:', error)
      alert('로그인 중 오류가 발생했습니다.')
    }
  }

  return (
    <Button
      onClick={handleKakaoLogin}
      className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
    >
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"
        />
      </svg>
      카카오로 시작하기
    </Button>
  )
}
```

### 4.3 이메일 로그인 컴포넌트 (백업용)

```typescript
// components/auth/email-login-form.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function EmailLoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setMessage(error.message)
      } else {
        // 성공 시 리다이렉트는 미들웨어에서 처리
        setMessage('로그인 성공!')
      }
    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          type="password"
          placeholder="비밀번호를 입력하세요"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? '로그인 중...' : '이메일로 로그인'}
      </Button>

      {message && (
        <p className={`text-sm text-center ${
          message.includes('성공') ? 'text-green-600' : 'text-red-600'
        }`}>
          {message}
        </p>
      )}
    </form>
  )
}
```

### 4.4 인증 콜백 처리

```typescript
// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // 사용자 역할에 따라 적절한 도메인으로 리다이렉트
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      // MVP: 간단한 리다이렉트 로직
      if (profile?.role === 'business') {
        return NextResponse.redirect(`${origin.replace('://', '://biz.')}/dashboard`);
      } else if (profile?.role === 'admin') {
        return NextResponse.redirect(`${origin.replace('://', '://adm.')}/admin`);
      } else {
        // 기본값: 크리에이터 대시보드
        return NextResponse.redirect(`${origin.replace('://', '://crt.')}/dashboard`);
      }
    }
  }

  // 에러 발생 시 로그인 페이지로
  return NextResponse.redirect(`${origin}/auth/login`);
}
```

---

## 🌐 5. 멀티도메인 미들웨어

### 5.1 MVP 미들웨어 구현

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // 세션 갱신
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl.clone();

  // 도메인별 라우팅 (MVP: 기본 구현)
  if (hostname.includes('crt.')) {
    // 크리에이터 도메인
    if (!user && !isPublicRoute(url.pathname)) {
      url.pathname = '/auth/login';
      return NextResponse.redirect(url);
    }

    url.pathname = `/creator${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  if (hostname.includes('biz.')) {
    // 비즈니스 도메인
    if (!user && !isPublicRoute(url.pathname)) {
      url.pathname = '/auth/login';
      return NextResponse.redirect(url);
    }

    url.pathname = `/business${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  if (hostname.includes('adm.')) {
    // 관리자 도메인
    if (!user) {
      url.pathname = '/auth/login';
      return NextResponse.redirect(url);
    }

    url.pathname = `/admin${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return supabaseResponse;
}

function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/callback',
    '/',
    '/about',
    '/contact',
  ];
  return publicRoutes.some((route) => pathname.startsWith(route));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
```

---

## 🎨 6. MVP UI 컴포넌트

### 6.1 통합 로그인 페이지

```typescript
// app/(main)/auth/login/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KakaoLoginButton } from '@/components/auth/kakao-login-button'
import { EmailLoginForm } from '@/components/auth/email-login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">캐쉬업 로그인</CardTitle>
          <p className="text-gray-600">
            크리에이터와 광고주를 연결하는 플랫폼
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 카카오 로그인 (주요 방법) */}
          <KakaoLoginButton />

          {/* 구분선 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">
                또는
              </span>
            </div>
          </div>

          {/* 이메일 로그인 (백업용) */}
          <EmailLoginForm />

          {/* 회원가입 링크 */}
          <div className="text-center text-sm">
            <span className="text-gray-600">아직 계정이 없으신가요? </span>
            <a href="/auth/register" className="text-blue-600 hover:underline">
              회원가입
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 6.2 프로필 관리 컴포넌트

```typescript
// components/profile/profile-form.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function ProfileForm() {
  const { profile, updateProfile, user } = useAuth()
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    bio: profile?.bio || '',
    phone: profile?.phone || '',
    role: profile?.role || 'creator'
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setLoading(true)

    try {
      const { error } = await updateProfile(formData)

      if (error) {
        alert('프로필 업데이트에 실패했습니다.')
      } else {
        alert('프로필이 성공적으로 업데이트되었습니다.')
      }
    } catch (error) {
      alert('오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (!profile) return <div>로딩 중...</div>

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">이름</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">역할</Label>
        <Select
          value={formData.role}
          onValueChange={(value) => setFormData({...formData, role: value as any})}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="creator">크리에이터</SelectItem>
            <SelectItem value="business">비즈니스</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">소개</Label>
        <Textarea
          id="bio"
          placeholder="자신을 소개해주세요"
          value={formData.bio}
          onChange={(e) => setFormData({...formData, bio: e.target.value})}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">연락처</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="010-1234-5678"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">추천 정보</h3>
        <p className="text-sm text-gray-600 mb-2">
          추천 코드: <code className="bg-white px-2 py-1 rounded">{profile.referral_code}</code>
        </p>
        <p className="text-xs text-gray-500">
          이 코드를 공유하여 새로운 사용자를 초대하고 추천 수익을 받으세요!
        </p>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? '저장 중...' : '프로필 저장'}
      </Button>
    </form>
  )
}
```

---

## 🔄 7. 1단계 추천 시스템 구현

### 7.1 추천 가입 처리

```typescript
// lib/referral/referral-system.ts
import { createClient } from '@/lib/supabase/client';

export async function processReferralSignup(newUserId: string, referralCode?: string) {
  if (!referralCode) return null;

  const supabase = createClient();

  try {
    // 1. 추천인 찾기
    const { data: referrer, error: referrerError } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('referral_code', referralCode)
      .single();

    if (referrerError || !referrer) {
      console.log('유효하지 않은 추천 코드:', referralCode);
      return null;
    }

    // 2. 새 사용자에게 추천인 설정
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        referrer_id: referrer.id,
      })
      .eq('id', newUserId);

    if (updateError) {
      console.error('추천 관계 설정 실패:', updateError);
      return null;
    }

    return {
      referrerId: referrer.id,
      referrerName: referrer.name,
    };
  } catch (error) {
    console.error('추천 처리 중 오류:', error);
    return null;
  }
}

// 추천 수익 계산 (캠페인 완료 시 호출)
export async function calculateReferralEarning(creatorId: string, campaignEarning: number) {
  const supabase = createClient();

  try {
    // 크리에이터의 추천인 조회
    const { data: creator } = await supabase
      .from('profiles')
      .select('referrer_id')
      .eq('id', creatorId)
      .single();

    if (!creator?.referrer_id) {
      return; // 추천인이 없음
    }

    // MVP: 1단계 추천 수익만 (10%)
    const referralEarning = campaignEarning * 0.1;

    // 추천인의 수익에 추가
    const { error } = await supabase
      .from('profiles')
      .update({
        referral_earnings: supabase.sql`referral_earnings + ${referralEarning}`,
        total_earnings: supabase.sql`total_earnings + ${referralEarning}`,
      })
      .eq('id', creator.referrer_id);

    if (error) {
      console.error('추천 수익 지급 실패:', error);
    } else {
      console.log(`추천 수익 지급 완료: ${referralEarning}원`);
    }
  } catch (error) {
    console.error('추천 수익 계산 오류:', error);
  }
}
```

### 7.2 추천 현황 컴포넌트

```typescript
// components/referral/referral-dashboard.tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ReferralStats {
  totalReferrals: number
  totalReferralEarnings: number
  recentReferrals: Array<{
    id: string
    name: string
    created_at: string
  }>
}

export function ReferralDashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) {
      loadReferralStats()
    }
  }, [profile])

  const loadReferralStats = async () => {
    if (!profile) return

    const supabase = createClient()

    try {
      // 추천한 사용자 목록 조회
      const { data: referrals, error } = await supabase
        .from('profiles')
        .select('id, name, created_at')
        .eq('referrer_id', profile.id)
        .order('created_at', { ascending: false })

      if (!error && referrals) {
        setStats({
          totalReferrals: referrals.length,
          totalReferralEarnings: profile.referral_earnings,
          recentReferrals: referrals.slice(0, 5) // 최근 5명만
        })
      }
    } catch (error) {
      console.error('추천 통계 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/auth/register?ref=${profile?.referral_code}`
    navigator.clipboard.writeText(referralLink)
    alert('추천 링크가 복사되었습니다!')
  }

  if (loading) return <div>로딩 중...</div>
  if (!stats) return <div>데이터를 불러올 수 없습니다.</div>

  return (
    <div className="space-y-6">
      {/* 추천 현황 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">총 추천 인원</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {stats.totalReferrals}명
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">추천 수익</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {stats.totalReferralEarnings.toLocaleString()}원
            </div>
            <p className="text-sm text-gray-500 mt-1">
              추천인 수익의 10%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 추천 링크 공유 */}
      <Card>
        <CardHeader>
          <CardTitle>추천 링크 공유</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <code className="flex-1 p-2 bg-gray-100 rounded text-sm">
              {typeof window !== 'undefined' &&
                `${window.location.origin}/auth/register?ref=${profile?.referral_code}`
              }
            </code>
            <Button onClick={copyReferralLink} size="sm">
              복사
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            이 링크를 공유하여 새로운 사용자를 초대하고,
            그들이 얻는 수익의 <strong>10%</strong>를 추천 수익으로 받으세요!
          </p>
        </CardContent>
      </Card>

      {/* 최근 추천 목록 */}
      {stats.recentReferrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>최근 추천 사용자</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.recentReferrals.map((referral) => (
                <div key={referral.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium">{referral.name}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(referral.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

---

## 📋 8. MVP 구현 체크리스트

### 8.1 Week 1 체크리스트 (환경 설정)

```yaml
Supabase 프로젝트 설정: □ Supabase 계정 생성 및 프로젝트 생성
  □ 환경 변수 설정 (.env.local)
  □ Supabase CLI 설치 및 초기화
  □ 로컬 개발 환경 설정

데이터베이스 스키마: □ profiles 테이블 생성
  □ RLS 기본 정책 설정
  □ 사용자 트리거 함수 생성
  □ 타입 정의 파일 생성

Next.js 클라이언트 설정: □ Supabase 클라이언트 라이브러리 설치
  □ 클라이언트/서버 컴포넌트 분리
  □ TypeScript 타입 정의
  □ 기본 인증 훅 구현
```

### 8.2 Week 2 체크리스트 (인증 구현)

```yaml
카카오 OAuth: □ Supabase Dashboard에서 카카오 OAuth 설정
  □ 카카오 개발자 콘솔 설정
  □ 카카오 로그인 버튼 컴포넌트
  □ 인증 콜백 처리

이메일 인증: □ 이메일/비밀번호 로그인 폼
  □ 회원가입 폼 (간단 버전)
  □ 비밀번호 재설정 (기본 기능)

미들웨어: □ 멀티도메인 라우팅 미들웨어
  □ 인증 보호 라우트 설정
  □ 세션 갱신 처리
  □ 역할 기반 리다이렉트

UI 컴포넌트: □ 로그인 페이지 완성
  □ 프로필 관리 페이지
  □ 추천 현황 대시보드
  □ 기본 레이아웃 컴포넌트
```

### 8.3 테스트 체크리스트

```yaml
기능 테스트: □ 카카오 로그인 플로우 테스트
  □ 이메일 로그인 플로우 테스트
  □ 도메인별 리다이렉트 테스트
  □ 추천 가입 플로우 테스트
  □ 프로필 수정 기능 테스트

보안 테스트: □ RLS 정책 검증
  □ 세션 보안 확인
  □ 권한 체크 테스트
  □ SQL 인젝션 방지 확인

성능 테스트: □ 페이지 로딩 속도 확인
  □ 데이터베이스 쿼리 최적화
  □ 이미지 로딩 최적화
  □ 모바일 성능 확인
```

---

## 🚀 9. Enhanced MVP로의 확장 준비

### 9.1 확장 예정 기능

```yaml
Enhanced MVP에서 추가될 기능: 🔄 복잡한 RLS 정책 (도메인별 데이터 격리)
  🔄 실시간 세션 동기화
  🔄 고급 보안 기능 (2FA, 세션 관리)
  🔄 2-3단계 추천 시스템
  🔄 소셜 로그인 확대 (구글, 네이버)
  🔄 프로필 이미지 업로드
  🔄 이메일 인증 및 복구 시스템
```

### 9.2 데이터베이스 확장 준비

```sql
-- Enhanced MVP를 위한 테이블 확장 예정
-- (현재는 주석 처리, 나중에 마이그레이션으로 추가)

/*
-- 2-3단계 추천을 위한 컬럼 추가
ALTER TABLE profiles ADD COLUMN referrer_l2_id UUID REFERENCES profiles(id);
ALTER TABLE profiles ADD COLUMN referrer_l3_id UUID REFERENCES profiles(id);

-- 세션 관리를 위한 테이블
CREATE TABLE user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  device_info JSONB,
  ip_address INET,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- 보안 로그를 위한 테이블
CREATE TABLE security_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  event_type TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
*/
```

---

## 🎯 10. 성공 지표 및 모니터링

### 10.1 MVP 성공 지표

```yaml
인증 성공률:
  ✅ 카카오 로그인 성공률: >95
  ✅ 이메일 로그인 성공률: >90
  ✅ 세션 유지율: >99
  ✅ 로그인 후 이탈률: <10%

기능 사용률:
  ✅ 프로필 완성률: >80
  ✅ 추천 링크 생성률: >60
  ✅ 추천 가입 성공률: >20
  ✅ 역할 변경률: <5% (대부분 초기 설정 유지)

기술적 성능:
  ✅ 로그인 응답 시간: <2초
  ✅ 페이지 로딩 시간: <3초
  ✅ 데이터베이스 쿼리 시간: <100ms
  ✅ 서비스 가동률: >99
```

### 10.2 모니터링 설정

```typescript
// lib/monitoring/auth-events.ts
import { createClient } from '@/lib/supabase/client';

export const logAuthEvent = async (
  eventType: 'login_success' | 'login_failure' | 'signup_success' | 'logout',
  userId?: string,
  metadata?: any,
) => {
  const supabase = createClient();

  try {
    await supabase.from('auth_events').insert({
      event_type: eventType,
      user_id: userId,
      metadata,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log auth event:', error);
  }
};

// 사용 예시
// 로그인 성공 시
await logAuthEvent('login_success', user.id, { provider: 'kakao' });

// 로그인 실패 시
await logAuthEvent('login_failure', undefined, { error: 'invalid_credentials' });
```

---

## 📚 11. 참고 자료 및 다음 단계

### 11.1 공식 문서

- [Supabase Auth 공식 문서](https://supabase.com/docs/guides/auth)
- [Next.js 15 App Router 가이드](https://nextjs.org/docs/app)
- [카카오 로그인 개발 가이드](https://developers.kakao.com/docs/latest/ko/kakaologin/common)

### 11.2 다음 단계

1. **Week 3-4**: 멀티도메인 UI 및 기본 대시보드 구현
2. **Week 5-6**: 캠페인 시스템과 인증 시스템 통합
3. **Week 7-8**: 추천 시스템과 수익 관리 통합
4. **Enhanced MVP**: 고급 인증 기능 및 보안 강화

### 11.3 트러블슈팅 가이드

```yaml
자주 발생하는 문제:
  카카오 OAuth 설정 오류:
    - 해결: Supabase Dashboard와 카카오 콘솔 설정 일치 확인
    - 리다이렉트 URL 정확성 검증

  RLS 정책 오류:
    - 해결: auth.uid() 함수 사용 확인
    - 정책 순서 및 조건 검토

  세션 동기화 문제:
    - 해결: 미들웨어에서 세션 갱신 로직 확인
    - 쿠키 설정 및 도메인 설정 검토

  성능 이슈:
    - 해결: 데이터베이스 인덱스 최적화
    - 불필요한 쿼리 제거
```

---

**구현 시작일**: 2025년 8월 1일  
**완료 목표일**: 2025년 8월 14일 (2주)  
**담당자**: Lead Developer + Frontend Developer  
**우선순위**: P0 (최고 우선순위)

이 가이드를 따라 구현하면 2주 만에 안정적이고 확장 가능한 Supabase Auth 시스템을 구축할 수 있습니다.

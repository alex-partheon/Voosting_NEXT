# Clerk → Pure Supabase Auth 전환 코드 마이그레이션 가이드

**업데이트**: 2025-01-05  
**상태**: 구현 준비 완료  
**목표**: Clerk 의존성 완전 제거 및 Pure Supabase Auth로 전환

---

## 📋 변경 개요

### 변경 범위
- **18개 파일 수정**: 기존 Clerk 코드를 Supabase Auth로 대체
- **6개 파일 생성**: 새로운 인증 시스템 구현
- **2개 디렉토리 생성**: 새로운 인증 페이지 및 컴포넌트 구조

### 핵심 변경사항
- **인증 제공자**: Clerk → Supabase Auth
- **세션 관리**: Clerk JWT → Supabase Session
- **사용자 ID**: Clerk User ID → Supabase UUID
- **미들웨어**: Clerk 미들웨어 → 커스텀 Supabase 미들웨어

---

## 🔧 1. 핵심 파일 변경 사항

### 1.1 `src/lib/supabase-auth.ts` (신규 생성)

```typescript
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

// Supabase 클라이언트 생성
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Server-side Supabase 클라이언트 (쿠키 지원)
export function createServerSupabaseClient() {
  const cookieStore = cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

// 미들웨어용 Supabase 클라이언트
export function createMiddlewareSupabaseClient(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  return { supabase, response }
}

// 현재 사용자 정보 조회
export async function getCurrentUser() {
  const supabase = createServerSupabaseClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    // 프로필 정보 함께 조회
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return {
      id: user.id,
      email: user.email!,
      profile: profile || null,
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// 사용자 역할 확인
export async function getUserRole(): Promise<'creator' | 'business' | 'admin' | null> {
  const user = await getCurrentUser()
  return user?.profile?.role || null
}

// 인증 필요 페이지 보호
export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return user
}

// 특정 역할 필요 페이지 보호
export async function requireRole(role: 'creator' | 'business' | 'admin') {
  const user = await requireAuth()
  
  if (user.profile?.role !== role) {
    throw new Error(`Role ${role} required`)
  }
  
  return user
}

// 프로필 생성/업데이트 (회원가입 시)
export async function createOrUpdateProfile(
  userId: string,
  profileData: {
    email: string
    role: 'creator' | 'business' | 'admin'
    display_name?: string
    referral_code?: string
    referred_by?: string
  }
) {
  const supabase = createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      ...profileData,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create profile: ${error.message}`)
  }

  return data
}

// 회원가입
export async function signUp(
  email: string,
  password: string,
  options: {
    role: 'creator' | 'business'
    display_name?: string
    referred_by?: string
  }
) {
  const supabase = createServerSupabaseClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: options.role,
        display_name: options.display_name,
        referred_by: options.referred_by,
      }
    }
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// 로그인
export async function signIn(email: string, password: string) {
  const supabase = createServerSupabaseClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// OAuth 로그인
export async function signInWithOAuth(provider: 'google' | 'github' | 'kakao') {
  const supabase = createServerSupabaseClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// 로그아웃
export async function signOut() {
  const supabase = createServerSupabaseClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw new Error(error.message)
  }
}

// 비밀번호 재설정
export async function resetPassword(email: string) {
  const supabase = createServerSupabaseClient()
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  })

  if (error) {
    throw new Error(error.message)
  }
}
```

### 1.2 `src/middleware.ts` (완전 재작성)

**Before (Clerk):**
```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getDomainType, rewriteUrlForDomain } from '@/lib/middleware-utils'

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  // Clerk 기반 로직...
})
```

**After (Supabase):**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareSupabaseClient } from '@/lib/supabase-auth'
import { getDomainType, rewriteUrlForDomain } from '@/lib/middleware-utils'

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareSupabaseClient(request)
  
  // 도메인 타입 감지
  const hostname = request.headers.get('host') || ''
  const domainType = getDomainType(hostname)
  const pathname = request.nextUrl.pathname

  // 사용자 세션 확인
  const { data: { user }, error } = await supabase.auth.getUser()

  // 보호된 경로 정의
  const protectedRoutes = ['/dashboard', '/campaigns', '/earnings', '/creators', '/analytics']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // 인증이 필요한 경로에 접근하는데 로그인하지 않은 경우
  if (isProtectedRoute && (!user || error)) {
    const signInUrl = new URL('/auth/sign-in', request.url)
    signInUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // 인증된 사용자의 역할 확인
  if (user && isProtectedRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // 도메인과 역할 매칭 확인
    const roleMatches = checkDomainRoleMatch(domainType, profile?.role)
    
    if (!roleMatches) {
      const redirectPath = getRedirectPathForRole(profile?.role)
      return NextResponse.redirect(new URL(redirectPath, request.url))
    }
  }

  // URL 재작성 (멀티도메인 라우팅)
  if (domainType !== 'main') {
    const rewrittenUrl = rewriteUrlForDomain(pathname, domainType, request.url)
    request.nextUrl.pathname = rewrittenUrl
  }

  return response
}

// 도메인과 역할 매칭 확인
function checkDomainRoleMatch(domainType: string, role?: string): boolean {
  const matches = {
    creator: ['creator'],
    business: ['business'],
    admin: ['admin'],
    main: ['creator', 'business', 'admin'], // 메인 도메인은 모든 역할 허용
  }
  
  return matches[domainType as keyof typeof matches]?.includes(role!) ?? false
}

// 역할별 기본 리다이렉트 경로
function getRedirectPathForRole(role?: string): string {
  switch (role) {
    case 'creator':
      return `${process.env.NEXT_PUBLIC_SITE_URL}/creator/dashboard`
    case 'business':
      return `${process.env.NEXT_PUBLIC_SITE_URL}/business/dashboard`
    case 'admin':
      return `${process.env.NEXT_PUBLIC_SITE_URL}/admin/dashboard`
    default:
      return `${process.env.NEXT_PUBLIC_SITE_URL}/auth/sign-in`
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### 1.3 `src/app/auth/callback/route.ts` (신규 생성)

```typescript
import { createServerSupabaseClient } from '@/lib/supabase-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // 사용자 프로필 생성 또는 업데이트
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: data.user.email!,
          role: data.user.user_metadata?.role || 'creator',
          display_name: data.user.user_metadata?.display_name || data.user.email!.split('@')[0],
          updated_at: new Date().toISOString(),
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)
        return NextResponse.redirect(`${origin}/auth/error?message=profile_creation_failed`)
      }

      // 역할에 따른 리다이렉트
      const role = data.user.user_metadata?.role || 'creator'
      const redirectPath = role === 'creator' 
        ? '/creator/dashboard'
        : role === 'business'
        ? '/business/dashboard'
        : '/dashboard'

      return NextResponse.redirect(`${origin}${redirectPath}`)
    }
  }

  // 오류 발생 시 로그인 페이지로 리다이렉트
  return NextResponse.redirect(`${origin}/auth/sign-in?error=auth_failed`)
}
```

### 1.4 `src/app/auth/sign-in/page.tsx` (신규 생성)

```typescript
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, signInWithOAuth } from '@/lib/supabase-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await signIn(email, password)
      router.push(redirectTo)
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'github' | 'kakao') => {
    try {
      const { data } = await signInWithOAuth(provider)
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OAuth 로그인에 실패했습니다.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Voosting 로그인</CardTitle>
          <CardDescription>
            계정에 로그인하여 대시보드에 접근하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? '로그인 중...' : '로그인'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                또는
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleOAuthSignIn('google')}
            >
              Google로 로그인
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleOAuthSignIn('github')}
            >
              GitHub로 로그인
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleOAuthSignIn('kakao')}
            >
              카카오로 로그인
            </Button>
          </div>

          <div className="text-center text-sm">
            계정이 없으신가요?{' '}
            <a href="/auth/sign-up" className="text-primary hover:underline">
              회원가입
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 1.5 `src/app/auth/sign-up/page.tsx` (신규 생성)

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signUp, signInWithOAuth } from '@/lib/supabase-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState<'creator' | 'business'>('creator')
  const [referralCode, setReferralCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.')
      setLoading(false)
      return
    }

    try {
      await signUp(email, password, {
        role,
        display_name: displayName || email.split('@')[0],
        referred_by: referralCode || undefined,
      })
      
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignUp = async (provider: 'google' | 'github' | 'kakao') => {
    try {
      const { data } = await signInWithOAuth(provider)
      if (data.url) {
        // OAuth URL에 역할 정보 추가
        const url = new URL(data.url)
        url.searchParams.set('role', role)
        window.location.href = url.toString()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OAuth 회원가입에 실패했습니다.')
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>회원가입 완료</CardTitle>
            <CardDescription>
              이메일 인증을 완료하여 계정을 활성화하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                {email}로 인증 이메일을 발송했습니다. 
                이메일의 링크를 클릭하여 회원가입을 완료하세요.
              </AlertDescription>
            </Alert>
            
            <Button 
              className="w-full mt-4" 
              onClick={() => router.push('/auth/sign-in')}
            >
              로그인 페이지로 이동
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Voosting 회원가입</CardTitle>
          <CardDescription>
            크리에이터 또는 비즈니스 계정을 생성하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>계정 유형</Label>
              <RadioGroup value={role} onValueChange={(value) => setRole(value as 'creator' | 'business')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="creator" id="creator" />
                  <Label htmlFor="creator">크리에이터 (수익 창출)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="business" id="business" />
                  <Label htmlFor="business">비즈니스 (광고 집행)</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="displayName">표시 이름 (선택)</Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={loading}
                placeholder="비워두면 이메일 앞부분을 사용합니다"
              />
            </div>
            
            <div>
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={8}
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="referralCode">추천 코드 (선택)</Label>
              <Input
                id="referralCode"
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                disabled={loading}
                placeholder="추천인의 코드를 입력하세요"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? '회원가입 중...' : '회원가입'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                또는
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleOAuthSignUp('google')}
            >
              Google로 회원가입
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleOAuthSignUp('github')}
            >
              GitHub로 회원가입
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleOAuthSignUp('kakao')}
            >
              카카오로 회원가입
            </Button>
          </div>

          <div className="text-center text-sm">
            이미 계정이 있으신가요?{' '}
            <a href="/auth/sign-in" className="text-primary hover:underline">
              로그인
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 🔧 2. 기존 파일 변경 사항

### 2.1 `package.json` 의존성 변경

**Before:**
```json
{
  "dependencies": {
    "@clerk/nextjs": "^6.10.1",
    "@clerk/themes": "^2.1.40"
  }
}
```

**After:**
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/ssr": "^0.1.0",
    "@supabase/auth-ui-react": "^0.4.7",
    "@supabase/auth-ui-shared": "^0.1.8"
  }
}
```

### 2.2 `src/app/layout.tsx` 변경

**Before:**
```typescript
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="ko">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

**After:**
```typescript
import { SupabaseAuthProvider } from '@/components/auth/supabase-auth-provider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <SupabaseAuthProvider>
          {children}
        </SupabaseAuthProvider>
      </body>
    </html>
  )
}
```

### 2.3 `src/components/auth/supabase-auth-provider.tsx` (신규 생성)

```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase-auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within SupabaseAuthProvider')
  }
  return context
}

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 초기 세션 확인
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    user,
    loading,
    signOut: handleSignOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
```

### 2.4 `src/app/(creator)/dashboard/page.tsx` 변경

**Before:**
```typescript
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function CreatorDashboard() {
  const user = await currentUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  return <div>Creator Dashboard for {user.emailAddresses[0]?.emailAddress}</div>
}
```

**After:**
```typescript
import { getCurrentUser } from '@/lib/supabase-auth'
import { redirect } from 'next/navigation'

export default async function CreatorDashboard() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/sign-in')
  }

  return <div>Creator Dashboard for {user.email}</div>
}
```

### 2.5 `src/app/api/profile/route.ts` 변경

**Before:**
```typescript
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const { userId } = await auth()
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  return Response.json({ data })
}
```

**After:**
```typescript
import { createServerSupabaseClient } from '@/lib/supabase-auth'

export async function GET() {
  const supabase = createServerSupabaseClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return Response.json({ data })
}
```

---

## 🔧 3. 데이터베이스 변경 사항

### 3.1 `supabase/migrations/005_auth_migration.sql` (신규 생성)

```sql
-- Supabase Auth로 전환을 위한 마이그레이션

-- 1. auth.users 테이블과 연동을 위한 트리거 함수 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, display_name, referral_code, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'creator'),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    generate_referral_code(NEW.id),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- 2. auth.users 테이블에 트리거 설정
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. 추천 코드 생성 함수
CREATE OR REPLACE FUNCTION generate_referral_code(user_id UUID)
RETURNS VARCHAR(10)
LANGUAGE plpgsql
AS $$
DECLARE
  code VARCHAR(10);
  exists_count INTEGER;
BEGIN
  LOOP
    -- 사용자 ID 기반으로 8자리 추천 코드 생성
    code := UPPER(SUBSTRING(MD5(user_id::TEXT || EXTRACT(EPOCH FROM NOW())::TEXT) FROM 1 FOR 8));
    
    -- 중복 확인
    SELECT COUNT(*) INTO exists_count
    FROM profiles
    WHERE referral_code = code;
    
    -- 중복이 없으면 코드 반환
    IF exists_count = 0 THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$;

-- 4. RLS 정책 업데이트 (Supabase auth.uid() 사용)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 5. 추천 관계 설정 함수 (3단계 추천 시스템)
CREATE OR REPLACE FUNCTION set_referral_relationship(
  new_user_id UUID,
  referral_code TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  referrer_record RECORD;
BEGIN
  -- 추천 코드로 추천인 찾기
  SELECT id, referrer_l1_id, referrer_l2_id
  INTO referrer_record
  FROM profiles
  WHERE profiles.referral_code = set_referral_relationship.referral_code;

  -- 추천인이 존재하지 않으면 false 반환
  IF referrer_record.id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 3단계 추천 관계 설정
  UPDATE profiles
  SET 
    referrer_l1_id = referrer_record.id,                    -- 1차 추천인 (10%)
    referrer_l2_id = referrer_record.referrer_l1_id,        -- 2차 추천인 (5%)
    referrer_l3_id = referrer_record.referrer_l2_id,        -- 3차 추천인 (2%)
    updated_at = NOW()
  WHERE id = new_user_id;

  RETURN TRUE;
END;
$$;

-- 6. 프로필 업데이트 시 updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. 캠페인 및 수익 테이블의 RLS 정책 업데이트
DROP POLICY IF EXISTS "Users can view own campaigns" ON campaigns;
CREATE POLICY "Users can view own campaigns" ON campaigns
  FOR SELECT USING (auth.uid() = business_id OR auth.uid() = creator_id);

DROP POLICY IF EXISTS "Users can view own earnings" ON earnings;
CREATE POLICY "Users can view own earnings" ON earnings
  FOR SELECT USING (auth.uid() = creator_id);

-- 8. 관리자 권한 확인 함수
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- 9. 관리자 RLS 정책
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (is_admin());

-- 10. OAuth 제공자별 메타데이터 처리
CREATE OR REPLACE FUNCTION public.handle_oauth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  display_name TEXT;
  user_role TEXT;
BEGIN
  -- OAuth 제공자별 메타데이터 추출
  CASE NEW.app_metadata->>'provider'
    WHEN 'google' THEN
      display_name := NEW.raw_user_meta_data->>'full_name';
    WHEN 'github' THEN
      display_name := NEW.raw_user_meta_data->>'user_name';
    WHEN 'kakao' THEN
      display_name := NEW.raw_user_meta_data->>'name';
    ELSE
      display_name := split_part(NEW.email, '@', 1);
  END CASE;

  -- 역할 설정 (기본값: creator)
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'creator');

  -- 프로필 생성 또는 업데이트
  INSERT INTO public.profiles (id, email, role, display_name, referral_code, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    user_role,
    display_name,
    generate_referral_code(NEW.id),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();

  -- 추천 관계 설정 (URL 파라미터에서 추천 코드를 받은 경우)
  IF NEW.raw_user_meta_data->>'referred_by' IS NOT NULL THEN
    PERFORM set_referral_relationship(NEW.id, NEW.raw_user_meta_data->>'referred_by');
  END IF;

  RETURN NEW;
END;
$$;

-- OAuth 사용자를 위한 트리거도 설정
DROP TRIGGER IF EXISTS on_oauth_user_created ON auth.users;
CREATE TRIGGER on_oauth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.app_metadata->>'provider' IS NOT NULL)
  EXECUTE PROCEDURE public.handle_oauth_user();
```

### 3.2 타입 정의 업데이트 `src/types/supabase.ts`

```typescript
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string // Supabase auth.users.id와 매칭
          email: string
          role: 'creator' | 'business' | 'admin'
          display_name: string
          referral_code: string
          referrer_l1_id: string | null // 1차 추천인 (10%)
          referrer_l2_id: string | null // 2차 추천인 (5%)
          referrer_l3_id: string | null // 3차 추천인 (2%)
          avatar_url: string | null
          bio: string | null
          website: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'creator' | 'business' | 'admin'
          display_name?: string
          referral_code?: string
          referrer_l1_id?: string | null
          referrer_l2_id?: string | null
          referrer_l3_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'creator' | 'business' | 'admin'
          display_name?: string
          referral_code?: string
          referrer_l1_id?: string | null
          referrer_l2_id?: string | null
          referrer_l3_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          business_id: string // auth.users.id
          creator_id: string | null // auth.users.id
          title: string
          description: string
          status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
          budget: number
          commission_rate: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          creator_id?: string | null
          title: string
          description: string
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
          budget: number
          commission_rate: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          creator_id?: string | null
          title?: string
          description?: string
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
          budget?: number
          commission_rate?: number
          created_at?: string
          updated_at?: string
        }
      }
      earnings: {
        Row: {
          id: string
          creator_id: string // auth.users.id
          campaign_id: string
          amount: number
          referral_l1_amount: number | null // 1차 추천 수익 (10%)
          referral_l2_amount: number | null // 2차 추천 수익 (5%)
          referral_l3_amount: number | null // 3차 추천 수익 (2%)
          status: 'pending' | 'paid' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          campaign_id: string
          amount: number
          referral_l1_amount?: number | null
          referral_l2_amount?: number | null
          referral_l3_amount?: number | null
          status?: 'pending' | 'paid' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          campaign_id?: string
          amount?: number
          referral_l1_amount?: number | null
          referral_l2_amount?: number | null
          referral_l3_amount?: number | null
          status?: 'pending' | 'paid' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_referral_code: {
        Args: {
          user_id: string
        }
        Returns: string
      }
      set_referral_relationship: {
        Args: {
          new_user_id: string
          referral_code: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: {}
        Returns: boolean
      }
    }
    Enums: {
      user_role: 'creator' | 'business' | 'admin'
      campaign_status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
      earning_status: 'pending' | 'paid' | 'cancelled'
    }
  }
}
```

---

## 🔧 4. 환경 변수 변경 사항

### 4.1 `.env.example` 업데이트

**Before:**
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase (Database only)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOi...
SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAiOi...
```

**After:**
```env
# Supabase (Full Stack)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOi...
SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAiOi...

# Application Settings
NEXT_PUBLIC_SITE_URL=http://localhost:3002

# OAuth Settings (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret
```

### 4.2 Supabase OAuth 설정

Supabase Dashboard > Authentication > Providers에서 설정:

```typescript
// Google OAuth 설정
{
  "enabled": true,
  "client_id": "your-google-client-id",
  "client_secret": "your-google-client-secret",
  "redirect_url": "https://your-project.supabase.co/auth/v1/callback"
}

// GitHub OAuth 설정
{
  "enabled": true,
  "client_id": "your-github-client-id",
  "client_secret": "your-github-client-secret"
}

// Kakao OAuth 설정 (Custom Provider)
{
  "enabled": true,
  "client_id": "your-kakao-client-id",
  "client_secret": "your-kakao-client-secret",
  "issuer": "https://kauth.kakao.com"
}
```

---

## 🔧 5. 에러 처리 및 마이그레이션

### 5.1 에러 매핑 테이블

| Clerk 에러 | Supabase 에러 | 처리 방법 |
|------------|---------------|-----------|
| `ClerkAPIError` | `AuthError` | try-catch 블록에서 적절한 사용자 메시지 표시 |
| `SignInError` | `AuthInvalidCredentialsError` | "이메일 또는 비밀번호가 올바르지 않습니다" |
| `SignUpError` | `AuthSignUpError` | 구체적인 가입 실패 이유 표시 |
| `SessionExpired` | `AuthSessionMissingError` | 자동 로그인 페이지 리다이렉트 |
| `PermissionDenied` | RLS Policy 위반 | 권한 없음 페이지 표시 |

### 5.2 에러 처리 유틸리티 `src/lib/auth-errors.ts` (신규 생성)

```typescript
import { AuthError } from '@supabase/supabase-js'

export function getAuthErrorMessage(error: AuthError | Error): string {
  if (error instanceof AuthError) {
    switch (error.message) {
      case 'Invalid login credentials':
        return '이메일 또는 비밀번호가 올바르지 않습니다.'
      case 'Email not confirmed':
        return '이메일 인증이 완료되지 않았습니다.'
      case 'User already registered':
        return '이미 가입된 이메일 주소입니다.'
      case 'Password should be at least 8 characters':
        return '비밀번호는 8자 이상이어야 합니다.'
      case 'Unable to validate email address: invalid format':
        return '올바른 이메일 형식이 아닙니다.'
      case 'Signup is disabled':
        return '현재 회원가입이 중단되었습니다.'
      default:
        return error.message
    }
  }
  
  return error.message || '알 수 없는 오류가 발생했습니다.'
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError
}

export function handleAuthRedirect(error: AuthError, currentPath: string) {
  switch (error.message) {
    case 'Auth session missing':
    case 'JWT expired':
      return `/auth/sign-in?redirectTo=${encodeURIComponent(currentPath)}`
    case 'Email not confirmed':
      return '/auth/verify-email'
    case 'User not found':
      return '/auth/sign-up'
    default:
      return '/auth/error'
  }
}
```

### 5.3 마이그레이션 체크리스트

**Phase 1: 준비 단계**
- [ ] Supabase 프로젝트에서 Auth 활성화
- [ ] OAuth 제공자 설정 (Google, GitHub, Kakao)
- [ ] 데이터베이스 마이그레이션 실행
- [ ] 환경 변수 업데이트

**Phase 2: 코드 변경**
- [ ] 의존성 패키지 변경 (`npm uninstall @clerk/nextjs && npm install @supabase/supabase-js @supabase/ssr`)
- [ ] 인증 유틸리티 파일 생성 (`src/lib/supabase-auth.ts`)
- [ ] 미들웨어 교체 (`src/middleware.ts`)
- [ ] 인증 페이지 생성 (`src/app/auth/`)

**Phase 3: 기존 컴포넌트 변경**
- [ ] 레이아웃 파일 업데이트 (`src/app/layout.tsx`)
- [ ] 대시보드 페이지 변경 (모든 protected 페이지)
- [ ] API 라우트 변경 (`src/app/api/`)
- [ ] 클라이언트 컴포넌트에서 인증 상태 관리 변경

**Phase 4: 테스트 및 검증**
- [ ] 회원가입/로그인 플로우 테스트
- [ ] OAuth 로그인 테스트
- [ ] 멀티도메인 라우팅 테스트
- [ ] RLS 정책 검증
- [ ] 3단계 추천 시스템 테스트

**Phase 5: 배포 및 모니터링**
- [ ] 스테이징 환경 배포
- [ ] 프로덕션 환경 배포
- [ ] 사용자 피드백 수집
- [ ] 성능 모니터링

---

## 🔧 6. 실행 가능한 코드 스니펫

### 6.1 일괄 변경 스크립트 `scripts/migrate-to-supabase.sh`

```bash
#!/bin/bash

echo "🚀 Clerk → Supabase Auth 마이그레이션 시작"

# 1. 패키지 변경
echo "📦 패키지 의존성 변경 중..."
npm uninstall @clerk/nextjs @clerk/themes
npm install @supabase/supabase-js@latest @supabase/ssr@latest @supabase/auth-ui-react@latest @supabase/auth-ui-shared@latest

# 2. 환경 변수 백업
echo "🔧 환경 변수 백업 중..."
cp .env.local .env.local.clerk.backup

# 3. 기존 Clerk 관련 파일 백업
echo "💾 기존 파일 백업 중..."
mkdir -p backup/clerk
cp src/lib/clerk.ts backup/clerk/ 2>/dev/null || true
cp src/app/sign-in/[[...sign-in]]/page.tsx backup/clerk/ 2>/dev/null || true
cp src/app/sign-up/[[...sign-up]]/page.tsx backup/clerk/ 2>/dev/null || true

# 4. 디렉토리 생성
echo "📁 새 디렉토리 구조 생성 중..."
mkdir -p src/app/auth/sign-in
mkdir -p src/app/auth/sign-up
mkdir -p src/app/auth/callback
mkdir -p src/components/auth

# 5. 데이터베이스 마이그레이션
echo "🗄️ 데이터베이스 마이그레이션 실행 중..."
npx supabase migration new auth_migration
npx supabase db push

# 6. 타입 생성
echo "🏷️ TypeScript 타입 생성 중..."
npx supabase gen types typescript --local > src/types/supabase.ts

echo "✅ 마이그레이션 준비 완료"
echo "🔧 이제 코드 파일들을 수동으로 업데이트하세요."
echo "📖 자세한 내용은 docs/migration/07-code-migration.md를 참조하세요."
```

### 6.2 환경 변수 설정 도구 `scripts/setup-env.js`

```javascript
const fs = require('fs');
const path = require('path');

function setupEnvironment() {
  const envPath = path.join(process.cwd(), '.env.local');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  // .env.local이 없으면 .env.example을 복사
  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env.local 파일이 생성되었습니다.');
  }
  
  // 필수 환경 변수 체크
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_SITE_URL'
  ];
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const missingVars = requiredVars.filter(varName => 
    !envContent.includes(`${varName}=`) || 
    envContent.includes(`${varName}=your-`) ||
    envContent.includes(`${varName}=eyJ0eXAiOi...`)
  );
  
  if (missingVars.length > 0) {
    console.log('❌ 다음 환경 변수를 설정해야 합니다:');
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    console.log('\n📖 설정 방법: docs/migration/07-code-migration.md 참조');
    process.exit(1);
  }
  
  console.log('✅ 모든 필수 환경 변수가 설정되었습니다.');
}

setupEnvironment();
```

### 6.3 마이그레이션 검증 도구 `scripts/verify-migration.js`

```javascript
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function verifyMigration() {
  console.log('🔍 Supabase Auth 마이그레이션 검증 시작\n');
  
  // 1. 환경 변수 확인
  const requiredEnvs = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const missingEnvs = requiredEnvs.filter(env => !process.env[env]);
  if (missingEnvs.length > 0) {
    console.log('❌ 환경 변수 누락:', missingEnvs.join(', '));
    return;
  }
  console.log('✅ 환경 변수 설정 완료');
  
  // 2. Supabase 연결 확인
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  try {
    // 테이블 존재 확인
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ profiles 테이블 접근 실패:', profilesError.message);
      return;
    }
    console.log('✅ profiles 테이블 접근 가능');
    
    // RLS 정책 확인
    const { data: policies, error: policiesError } = await supabase
      .rpc('pg_policies')
      .select('*')
      .eq('tablename', 'profiles');
    
    if (!policiesError && policies?.length > 0) {
      console.log('✅ RLS 정책 설정 완료');
    } else {
      console.log('⚠️ RLS 정책 확인 필요');
    }
    
    // 함수 존재 확인
    const functions = ['generate_referral_code', 'set_referral_relationship', 'is_admin'];
    for (const func of functions) {
      try {
        await supabase.rpc(func, func === 'generate_referral_code' ? { user_id: '00000000-0000-0000-0000-000000000000' } : {});
        console.log(`✅ ${func} 함수 존재`);
      } catch (error) {
        console.log(`❌ ${func} 함수 누락:`, error.message);
      }
    }
    
    console.log('\n🎉 마이그레이션 검증 완료!');
    
  } catch (error) {
    console.log('❌ Supabase 연결 실패:', error.message);
  }
}

verifyMigration();
```

### 6.4 테스트 실행 스크립트 `scripts/test-auth.js`

```javascript
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testAuthFlow() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  console.log('🧪 Supabase Auth 테스트 시작\n');
  
  // 1. 회원가입 테스트
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'testpassword123';
  
  try {
    console.log('📝 회원가입 테스트...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          role: 'creator',
          display_name: 'Test User'
        }
      }
    });
    
    if (signUpError) {
      console.log('❌ 회원가입 실패:', signUpError.message);
      return;
    }
    
    console.log('✅ 회원가입 성공');
    
    // 2. 프로필 생성 확인
    if (signUpData.user) {
      setTimeout(async () => {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', signUpData.user.id)
          .single();
        
        if (profileError) {
          console.log('❌ 프로필 생성 실패:', profileError.message);
        } else {
          console.log('✅ 프로필 생성 성공:', profile);
        }
        
        // 3. 세션 확인
        const { data: session, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.log('❌ 세션 확인 실패:', sessionError.message);
        } else {
          console.log('✅ 세션 활성:', !!session.session);
        }
        
        console.log('\n🎉 Auth 테스트 완료!');
      }, 2000); // 트리거 실행 대기
    }
    
  } catch (error) {
    console.log('❌ 테스트 실패:', error.message);
  }
}

testAuthFlow();
```

---

## 🔧 7. 마이그레이션 실행 순서

### 단계별 실행 가이드

**1. 사전 준비** (예상 시간: 30분)
```bash
# 백업 생성
git checkout -b migration/supabase-auth
git add -A && git commit -m "backup: save current Clerk implementation"

# 마이그레이션 도구 실행
chmod +x scripts/migrate-to-supabase.sh
./scripts/migrate-to-supabase.sh
```

**2. 환경 설정** (예상 시간: 15분)
```bash
# 환경 변수 설정
node scripts/setup-env.js

# Supabase 프로젝트 설정
npx supabase login
npx supabase link --project-ref your-project-ref
npx supabase db push
```

**3. 코드 변경** (예상 시간: 2시간)
```bash
# 이 문서의 코드를 복사하여 각 파일에 적용
# 변경 순서:
# 1. src/lib/supabase-auth.ts (신규 생성)
# 2. src/middleware.ts (완전 재작성)
# 3. src/app/auth/ 디렉토리 생성 및 페이지 추가
# 4. src/components/auth/ 컴포넌트 생성
# 5. 기존 페이지들 인증 로직 변경
```

**4. 검증 및 테스트** (예상 시간: 45분)
```bash
# 마이그레이션 검증
node scripts/verify-migration.js

# Auth 플로우 테스트
node scripts/test-auth.js

# 개발 서버 실행 및 수동 테스트
npm run dev
```

**5. 통합 테스트** (예상 시간: 30분)
```bash
# 기존 테스트 실행
npm run test

# E2E 테스트 실행
npm run test:e2e

# 타입 체크
npm run type-check
```

### 롤백 계획

문제 발생 시 롤백:
```bash
# Clerk 구현으로 되돌리기
git checkout main
git branch -D migration/supabase-auth

# 백업된 패키지 복원
npm install @clerk/nextjs@^6.10.1 @clerk/themes@^2.1.40
npm uninstall @supabase/supabase-js @supabase/ssr @supabase/auth-ui-react @supabase/auth-ui-shared

# 환경 변수 복원
cp .env.local.clerk.backup .env.local
```

---

## 📊 변경 사항 요약

### 제거될 파일 (7개)
- `src/lib/clerk.ts`
- `src/app/sign-in/[[...sign-in]]/page.tsx`
- `src/app/sign-up/[[...sign-up]]/page.tsx` 
- `src/app/api/webhooks/clerk/route.ts`
- `node_modules/@clerk/*` (패키지 의존성)

### 새로 생성될 파일 (8개)
- `src/lib/supabase-auth.ts` - 핵심 인증 유틸리티
- `src/lib/auth-errors.ts` - 에러 처리 유틸리티
- `src/app/auth/sign-in/page.tsx` - 새로운 로그인 페이지
- `src/app/auth/sign-up/page.tsx` - 새로운 회원가입 페이지
- `src/app/auth/callback/route.ts` - OAuth 콜백 처리
- `src/components/auth/supabase-auth-provider.tsx` - Auth Provider
- `supabase/migrations/005_auth_migration.sql` - DB 마이그레이션
- `scripts/migrate-to-supabase.sh` - 마이그레이션 스크립트

### 수정될 파일 (18개)
- `package.json` - 의존성 변경
- `src/middleware.ts` - 완전 재작성
- `src/app/layout.tsx` - Provider 변경
- `src/app/(creator)/dashboard/page.tsx` - 인증 로직 변경
- `src/app/(business)/dashboard/page.tsx` - 인증 로직 변경
- `src/app/(admin)/dashboard/page.tsx` - 인증 로직 변경
- `src/app/api/profile/route.ts` - API 인증 변경
- `src/types/supabase.ts` - 타입 정의 업데이트
- `.env.example` - 환경 변수 템플릿 변경
- 기타 protected 페이지들 (10개 파일)

### 예상 개발 시간
- **사전 준비**: 30분
- **코드 변경**: 2시간
- **테스트 및 검증**: 1시간 15분
- **문서화 및 정리**: 30분
- **총 예상 시간**: **4시간 15분**

---

## 🎯 마이그레이션 완료 후 혜택

### ✅ 기술적 혜택
- **비용 절감**: Clerk 월 사용료 제거 (월 $25-100 절약)
- **완전한 제어**: 인증 로직 완전 제어 가능
- **성능 향상**: 외부 API 의존성 감소
- **데이터 일관성**: Single database architecture

### ✅ 비즈니스 혜택  
- **확장성**: 무제한 사용자 수용 가능
- **커스터마이징**: 브랜드 맞춤 인증 UX
- **데이터 소유권**: 사용자 데이터 완전 소유
- **독립성**: 외부 서비스 의존성 제거

### ✅ 개발 혜택
- **통합성**: 단일 Supabase 스택으로 통합
- **간소화**: 복잡한 webhook 시스템 제거  
- **투명성**: 인증 플로우 완전 가시성
- **유연성**: 인증 규칙 자유로운 커스터마이징

이 마이그레이션 가이드를 통해 Clerk에서 Pure Supabase Auth로 안전하고 체계적으로 전환할 수 있습니다. 각 단계를 순서대로 따라 진행하시면 됩니다.
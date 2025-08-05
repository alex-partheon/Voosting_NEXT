# Pure Supabase Auth 마이그레이션 문제 해결 가이드

## 목차
1. [자주 발생하는 문제들](#자주-발생하는-문제들)
2. [단계별 디버깅 방법](#단계별-디버깅-방법)
3. [에러 메시지별 해결 방안](#에러-메시지별-해결-방안)
4. [성능 최적화 팁](#성능-최적화-팁)
5. [모니터링 및 로깅](#모니터링-및-로깅)

---

## 자주 발생하는 문제들

### 1. 세션 관리 문제

**문제**: 페이지 새로고침 시 인증 상태 손실
```typescript
// ❌ 잘못된 패턴
const { user } = useUser(); // undefined on refresh

// ✅ 올바른 패턴  
const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    setLoading(false);
  }
  getSession();
}, []);
```

**해결 방안**:
- `getSession()` 먼저 호출하여 기존 세션 복원
- 로딩 상태 적절히 관리
- SSR 환경에서 쿠키 기반 세션 처리

### 2. RLS 정책 충돌

**문제**: Row Level Security 정책으로 인한 접근 거부
```sql
-- ❌ 문제가 되는 RLS 정책
CREATE POLICY "Users can only see own data" ON profiles
  FOR ALL USING (auth.uid() = user_id);

-- 세션이 없으면 auth.uid()가 null이 되어 모든 접근 차단
```

**해결 방안**:
```sql
-- ✅ 개선된 RLS 정책
CREATE POLICY "Users can see own data" ON profiles
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.role() = 'service_role'
  );

CREATE POLICY "Public profiles visible" ON profiles
  FOR SELECT USING (is_public = true);
```

### 3. OAuth 설정 문제

**문제**: OAuth 리디렉션 실패 또는 무한 루프
```typescript
// ❌ 잘못된 리디렉션 설정
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'http://localhost:3000/dashboard' // 절대 URL
  }
});
```

**해결 방안**:
```typescript
// ✅ 올바른 리디렉션 설정
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
    queryParams: {
      next: '/dashboard'
    }
  }
});
```

### 4. 미들웨어 인증 문제

**문제**: Next.js 미들웨어에서 세션 검증 실패
```typescript
// ❌ 문제가 되는 패턴
export async function middleware(request: NextRequest) {
  const { data: { user } } = await supabase.auth.getUser();
  // 미들웨어에서는 브라우저 쿠키에 접근할 수 없음
}
```

**해결 방안**:
```typescript
// ✅ 올바른 미들웨어 패턴
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }
  
  return res;
}
```

---

## 단계별 디버깅 방법

### Phase 1: 환경 설정 검증

```bash
# 1. 환경 변수 확인
echo "NEXT_PUBLIC_SUPABASE_URL: $NEXT_PUBLIC_SUPABASE_URL"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY: $NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "SUPABASE_SERVICE_ROLE_KEY: $SUPABASE_SERVICE_ROLE_KEY"

# 2. Supabase 연결 테스트
curl -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
     -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
     "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/"
```

### Phase 2: 인증 플로우 검증

```typescript
// 디버깅 유틸리티
export const debugAuth = {
  async checkSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('Current session:', {
      user: session?.user?.id,
      expires_at: session?.expires_at,
      error
    });
    return session;
  },

  async checkUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    console.log('Current user:', {
      id: user?.id,
      email: user?.email,
      error
    });
    return user;
  },

  logAuthEvents() {
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', {
        event,
        user: session?.user?.id,
        timestamp: new Date().toISOString()
      });
    });
  }
};
```

### Phase 3: 데이터베이스 접근 검증

```sql
-- RLS 정책 디버깅
SET session_replication_role = replica; -- RLS 비활성화
SELECT * FROM profiles WHERE user_id = 'test-user-id';
SET session_replication_role = DEFAULT; -- RLS 재활성화

-- 현재 사용자 확인
SELECT auth.uid() as current_user_id;
SELECT auth.role() as current_role;

-- 정책 적용 상태 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'profiles';
```

### Phase 4: 성능 분석

```typescript
// 성능 측정 래퍼
export function withPerformanceLogging<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  name: string
): T {
  return (async (...args: any[]) => {
    const start = performance.now();
    try {
      const result = await fn(...args);
      const duration = performance.now() - start;
      console.log(`${name}: ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`${name} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }) as T;
}

// 사용 예시
const signInWithLogging = withPerformanceLogging(
  supabase.auth.signInWithPassword.bind(supabase.auth),
  'signInWithPassword'
);
```

---

## 에러 메시지별 해결 방안

### AUTH001: "Invalid JWT"

**원인**: 만료되었거나 손상된 JWT 토큰

**해결 방안**:
```typescript
// 토큰 검증 및 갱신
async function handleInvalidJWT() {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    if (error) {
      // 리프레시 실패 시 재로그인 필요
      await supabase.auth.signOut();
      window.location.href = '/auth/signin';
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }
}
```

### AUTH002: "Email not confirmed"

**원인**: 이메일 인증이 완료되지 않음

**해결 방안**:
```typescript
// 이메일 재전송
async function resendConfirmation(email: string) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  });
  
  if (error) {
    throw new Error(`이메일 재전송 실패: ${error.message}`);
  }
}
```

### AUTH003: "Row Level Security policy violation"

**원인**: RLS 정책으로 인한 접근 거부

**해결 방안**:
```sql
-- 1. 정책 상태 확인
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- 2. 임시 정책 생성 (개발 환경)
CREATE POLICY "Allow all for development" ON your_table
  FOR ALL USING (true);

-- 3. 적절한 정책으로 교체
DROP POLICY "Allow all for development" ON your_table;
CREATE POLICY "Users own data" ON your_table
  FOR ALL USING (auth.uid() = user_id);
```

### AUTH004: "OAuth redirect mismatch"

**원인**: OAuth 리디렉션 URL 불일치

**해결 방안**:
1. Supabase 대시보드에서 허용된 리디렉션 URL 확인
2. 개발/프로덕션 환경별 URL 설정

```typescript
const getRedirectURL = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://your-domain.com/auth/callback';
  }
  return 'http://localhost:3000/auth/callback';
};
```

### AUTH005: "Rate limit exceeded"

**원인**: API 호출 빈도 제한 초과

**해결 방안**:
```typescript
// 재시도 로직 구현
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.message?.includes('rate limit') && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}
```

---

## 성능 최적화 팁

### 1. 세션 캐싱

```typescript
// 세션 캐시 구현
class SessionCache {
  private cache: { session: Session | null; timestamp: number } | null = null;
  private readonly TTL = 5 * 60 * 1000; // 5분

  async getSession(): Promise<Session | null> {
    const now = Date.now();
    
    if (this.cache && (now - this.cache.timestamp) < this.TTL) {
      return this.cache.session;
    }

    const { data: { session } } = await supabase.auth.getSession();
    this.cache = { session, timestamp: now };
    
    return session;
  }

  invalidate() {
    this.cache = null;
  }
}

export const sessionCache = new SessionCache();
```

### 2. 배치 처리

```typescript
// 여러 프로필 한번에 조회
async function getMultipleProfiles(userIds: string[]) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('user_id', userIds);
    
  if (error) throw error;
  return data;
}

// 단일 조회는 피하고 배치로 처리
const profiles = await getMultipleProfiles([user1.id, user2.id, user3.id]);
```

### 3. 연결 풀링

```typescript
// 커넥션 재사용
import { createClient } from '@supabase/supabase-js';

// 싱글톤 패턴으로 클라이언트 재사용
let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
        db: {
          schema: 'public',
        },
        global: {
          headers: { 'x-my-custom-header': 'my-app-name' },
        },
      }
    );
  }
  return supabaseInstance;
}
```

### 4. 쿼리 최적화

```sql
-- 인덱스 생성
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_campaigns_creator_id ON campaigns(creator_id);

-- 복합 인덱스
CREATE INDEX idx_campaigns_status_created ON campaigns(status, created_at);

-- 쿼리 성능 분석
EXPLAIN ANALYZE SELECT * FROM profiles WHERE user_id = 'user-123';
```

### 5. 실시간 구독 최적화

```typescript
// 선택적 구독
const subscription = supabase
  .channel('campaigns')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'campaigns',
      filter: `creator_id=eq.${userId}` // 필터링으로 불필요한 이벤트 제거
    },
    (payload) => {
      console.log('Campaign updated:', payload);
    }
  )
  .subscribe();

// 컴포넌트 언마운트 시 구독 해제
useEffect(() => {
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

---

## 모니터링 및 로깅

### 1. 에러 추적

```typescript
// 에러 로깅 서비스
export class AuthErrorTracker {
  static track(error: any, context?: Record<string, any>) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // 에러 로깅 서비스로 전송 (예: Sentry, LogRocket)
    console.error('Auth Error:', errorData);
    
    // 개발 환경에서는 상세 로그
    if (process.env.NODE_ENV === 'development') {
      console.table(errorData);
    }
  }
}
```

### 2. 성능 메트릭

```typescript
// 성능 메트릭 수집
export class AuthMetrics {
  private static metrics: Record<string, number[]> = {};

  static recordTiming(operation: string, duration: number) {
    if (!this.metrics[operation]) {
      this.metrics[operation] = [];
    }
    this.metrics[operation].push(duration);
  }

  static getAverageTime(operation: string): number {
    const times = this.metrics[operation] || [];
    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  static generateReport() {
    const report: Record<string, any> = {};
    
    Object.keys(this.metrics).forEach(operation => {
      const times = this.metrics[operation];
      report[operation] = {
        average: this.getAverageTime(operation),
        min: Math.min(...times),
        max: Math.max(...times),
        count: times.length
      };
    });
    
    return report;
  }
}
```

### 3. 헬스체크

```typescript
// API 라우트: /api/health/auth
export async function GET() {
  try {
    // Supabase 연결 테스트
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      return Response.json(
        { status: 'unhealthy', error: error.message },
        { status: 500 }
      );
    }

    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      auth: 'operational'
    });
  } catch (error) {
    return Response.json(
      { status: 'unhealthy', error: 'Connection failed' },
      { status: 500 }
    );
  }
}
```

---

## 마이그레이션 체크리스트

### 사전 준비
- [ ] 백업 완료
- [ ] 테스트 환경 구축
- [ ] 롤백 계획 수립
- [ ] 모니터링 설정

### 마이그레이션 실행
- [ ] 환경 변수 설정
- [ ] Clerk 코드 제거
- [ ] Supabase Auth 코드 적용
- [ ] 미들웨어 업데이트
- [ ] RLS 정책 설정

### 사후 검증
- [ ] 인증 플로우 테스트
- [ ] 성능 검증
- [ ] 에러 로그 확인
- [ ] 사용자 피드백 수집

---

## 추가 리소스

- [Supabase Auth 공식 문서](https://supabase.com/docs/guides/auth)
- [Next.js Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [RLS 정책 가이드](https://supabase.com/docs/guides/auth/row-level-security)
- [OAuth 설정 가이드](https://supabase.com/docs/guides/auth/social-login)

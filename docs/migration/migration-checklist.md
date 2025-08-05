# Supabase Auth 마이그레이션 체크리스트

## 사전 준비사항 체크리스트

### 📋 환경 설정 준비

- [ ] **Supabase 프로젝트 상태 확인**
  ```bash
  npx supabase status
  # 모든 서비스가 running 상태인지 확인
  ```

- [ ] **현재 데이터베이스 백업**
  ```bash
  # 현재 프로덕션 데이터 백업
  npx supabase db dump --data-only > backup_before_migration.sql
  npx supabase db dump --schema-only > schema_backup.sql
  ```

- [ ] **Git 브랜치 생성**
  ```bash
  git checkout -b feature/supabase-auth-migration
  git push -u origin feature/supabase-auth-migration
  ```

- [ ] **환경 변수 확인**
  ```bash
  # 필요한 환경 변수가 모두 설정되어 있는지 확인
  echo $NEXT_PUBLIC_SUPABASE_URL
  echo $NEXT_PUBLIC_SUPABASE_ANON_KEY  
  echo $SUPABASE_SERVICE_ROLE_KEY
  ```

- [ ] **Supabase Auth 설정 확인**
  - [ ] Email confirmation 설정
  - [ ] OAuth providers 설정 (Google, GitHub 등)
  - [ ] Redirect URLs 설정
  - [ ] Password policy 설정

### 📊 현재 시스템 분석

- [ ] **Clerk 사용자 데이터 내보내기**
  ```bash
  # 현재 Clerk 사용자 목록 확인
  node scripts/export-clerk-users.js
  ```

- [ ] **현재 프로필 데이터 확인**
  ```sql
  SELECT COUNT(*) FROM profiles;
  SELECT role, COUNT(*) FROM profiles GROUP BY role;
  SELECT COUNT(*) FROM profiles WHERE referrer_l1_id IS NOT NULL;
  ```

- [ ] **의존성 파악**
  ```bash
  # Clerk 의존성 확인
  grep -r "@clerk" src/ --exclude-dir=node_modules
  grep -r "clerkMiddleware\|currentUser\|auth()" src/ --exclude-dir=node_modules
  ```

- [ ] **테스트 커버리지 확인**
  ```bash
  npm run test:coverage
  # 인증 관련 테스트 커버리지 > 80% 확인
  ```

## Phase 1: 기반 구축 체크리스트 (2-3일)

### 🔧 새로운 인증 모듈 구현

- [ ] **src/lib/auth/client.ts 생성**
  - [ ] `createAuthClient()` 함수
  - [ ] `signUpWithEmail()` 함수
  - [ ] `signInWithEmail()` 함수
  - [ ] `signInWithOAuth()` 함수
  - [ ] `signOut()` 함수
  - [ ] `resetPassword()` 함수

- [ ] **src/lib/auth/server.ts 생성**
  - [ ] `createServerAuthClient()` 함수
  - [ ] `getCurrentUser()` 함수
  - [ ] `getCurrentProfile()` 함수
  - [ ] `requireAuth()` 함수
  - [ ] `requireRole()` 함수

- [ ] **src/lib/auth/middleware.ts 생성**
  - [ ] `createMiddlewareAuthClient()` 함수
  - [ ] `getMiddlewareUser()` 함수
  - [ ] `validateMiddlewareAuth()` 함수

- [ ] **src/lib/auth/providers.tsx 생성**
  - [ ] `AuthProvider` 컴포넌트
  - [ ] `useAuth` 훅
  - [ ] `useDomainAuth` 훅
  - [ ] 인증 상태 변경 리스너

- [ ] **src/lib/auth/types.ts 생성**
  - [ ] 인증 관련 타입 정의
  - [ ] 사용자 메타데이터 타입
  - [ ] 세션 타입

### 🗄️ 데이터베이스 업데이트

- [ ] **RLS 정책 업데이트**
  ```sql
  -- 기존 Clerk 기반 정책 제거
  DROP POLICY IF EXISTS "Users can access own profile" ON profiles;
  
  -- 새로운 Supabase Auth 기반 정책 생성
  CREATE POLICY "Users can access own data" ON profiles
    FOR ALL USING (auth.uid()::text = id);
  ```

- [ ] **Database Function 업데이트**
  ```sql
  -- create_profile_with_referral 함수 수정
  -- Clerk User ID -> Supabase Auth UID 변경
  ```

- [ ] **Trigger 함수 업데이트**
  ```sql
  -- 인증 상태 변경 시 프로필 동기화 트리거
  CREATE OR REPLACE FUNCTION handle_new_user() 
  RETURNS trigger AS $$
  BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'role', 'creator'));
    RETURN new;
  END;
  $$ language plpgsql security definer;
  
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  ```

### 🧪 초기 테스트

- [ ] **새로운 인증 모듈 단위 테스트**
  ```bash
  npm run test src/lib/auth/
  ```

- [ ] **데이터베이스 연결 테스트**
  ```bash
  node scripts/test-supabase-connection.js
  ```

- [ ] **RLS 정책 테스트**
  ```bash
  node scripts/test-rls-policies.js
  ```

## Phase 2: 핵심 기능 마이그레이션 체크리스트 (3-4일)

### 🛣️ 미들웨어 교체

- [ ] **새로운 middleware.ts 구현**
  - [ ] Supabase 미들웨어 클라이언트 통합
  - [ ] 기존 도메인 라우팅 로직 유지
  - [ ] 인증 체크 로직 교체
  - [ ] 세션 관리 로직 추가

- [ ] **미들웨어 테스트**
  ```bash
  # 도메인별 라우팅 테스트
  curl -H "Host: creator.localhost:3002" http://localhost:3002/dashboard
  curl -H "Host: business.localhost:3002" http://localhost:3002/dashboard
  curl -H "Host: admin.localhost:3002" http://localhost:3002/dashboard
  ```

- [ ] **성능 측정**
  ```bash
  # 미들웨어 응답 시간 측정 (목표: < 500ms)
  for i in {1..10}; do
    time curl -H "Host: creator.localhost:3002" http://localhost:3002/dashboard -s > /dev/null
  done
  ```

### 🔐 인증 페이지 교체

- [ ] **src/app/auth/sign-in/page.tsx 생성**
  - [ ] 이메일 로그인 폼
  - [ ] OAuth 로그인 버튼
  - [ ] 에러 처리
  - [ ] 로딩 상태
  - [ ] 역할별 리다이렉트

- [ ] **src/app/auth/sign-up/page.tsx 생성**
  - [ ] 이메일 회원가입 폼
  - [ ] 역할 선택 UI
  - [ ] 추천 코드 입력
  - [ ] 약관 동의
  - [ ] 이메일 확인 안내

- [ ] **src/app/auth/callback/route.ts 생성**
  - [ ] OAuth 콜백 처리
  - [ ] 이메일 확인 처리
  - [ ] 프로필 생성 로직

### 🎯 핵심 기능 업데이트

- [ ] **src/lib/clerk.ts 함수들을 새 auth 모듈로 이전**
  
  | 기존 함수 | 새 함수 | 상태 |
  |-----------|---------|------|
  | `getCurrentUser()` | `auth/server.getCurrentUser()` | [ ] |
  | `getCurrentProfile()` | `auth/server.getCurrentProfile()` | [ ] |
  | `requireAuth()` | `auth/server.requireAuth()` | [ ] |
  | `requireRole()` | `auth/server.requireRole()` | [ ] |
  | `upsertUserProfile()` | `auth/server.upsertUserProfile()` | [ ] |

- [ ] **추천 시스템 통합**
  - [ ] 회원가입 시 추천 코드 처리
  - [ ] Database Function 호출
  - [ ] 추천 관계 검증

### 🔄 프로바이더 통합

- [ ] **루트 레이아웃에 AuthProvider 추가**
  ```tsx
  // src/app/layout.tsx
  import { AuthProvider } from '@/lib/auth/providers'
  
  export default function RootLayout({ children }) {
    return (
      <html>
        <body>
          <AuthProvider>
            {children}
          </AuthProvider>
        </body>
      </html>
    )
  }
  ```

- [ ] **기존 컴포넌트에서 useAuth 훅 사용**
  - [ ] 네비게이션 컴포넌트
  - [ ] 프로필 페이지  
  - [ ] 설정 페이지
  - [ ] 대시보드 컴포넌트

### 🧪 통합 테스트

- [ ] **인증 플로우 E2E 테스트**
  ```bash
  npx playwright test auth-flow.spec.ts
  ```

- [ ] **도메인별 접근 권한 테스트**
  ```bash
  npx playwright test domain-access.spec.ts
  ```

- [ ] **추천 시스템 테스트**
  ```bash
  npx playwright test referral-system.spec.ts
  ```

## Phase 3: 최종 정리 및 검증 체크리스트 (1-2일)

### 🗑️ Clerk 의존성 제거

- [ ] **패키지 제거**
  ```bash
  npm uninstall @clerk/nextjs svix
  npm audit --fix
  ```

- [ ] **파일 삭제**
  ```bash
  rm -rf src/app/api/webhooks/clerk/
  rm src/lib/clerk.ts
  rm -rf src/app/sign-in/[[...sign-in]]/
  rm -rf src/app/sign-up/[[...sign-up]]/
  ```

- [ ] **환경 변수 정리**
  ```bash
  # .env.local에서 제거
  # NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  # CLERK_SECRET_KEY  
  # CLERK_WEBHOOK_SECRET
  ```

- [ ] **Import 구문 정리**
  ```bash
  # 모든 Clerk import 제거 확인
  grep -r "@clerk" src/ --exclude-dir=node_modules
  # 결과가 없어야 함
  ```

### 🔍 전체 시스템 검증

- [ ] **기능적 검증**
  - [ ] 이메일 로그인/로그아웃 ✅
  - [ ] Google OAuth 로그인 ✅  
  - [ ] GitHub OAuth 로그인 ✅
  - [ ] 회원가입 + 프로필 생성 ✅
  - [ ] 추천 코드 입력 시 추천 관계 생성 ✅
  - [ ] 역할별 도메인 라우팅 ✅
  - [ ] 권한 없는 페이지 접근 차단 ✅

- [ ] **성능 검증**
  ```bash
  # 로그인 시간 측정 (목표: < 2초)
  time curl -X POST http://localhost:3002/auth/sign-in \
    -d "email=test@example.com&password=test123"
  
  # 미들웨어 응답 시간 (목표: < 500ms)  
  time curl -H "Host: creator.localhost:3002" http://localhost:3002/dashboard
  
  # 세션 갱신 시간 (목표: < 1초)
  time curl http://localhost:3002/api/auth/refresh
  ```

- [ ] **보안 검증**
  ```bash
  # RLS 정책 테스트
  node scripts/test-rls-security.js
  
  # 무단 접근 테스트
  node scripts/test-unauthorized-access.js
  
  # 세션 만료 테스트
  node scripts/test-session-expiry.js
  ```

### 📊 데이터 무결성 검증

- [ ] **기존 사용자 데이터 확인**
  ```sql
  -- 모든 profiles가 유효한지 확인
  SELECT COUNT(*) FROM profiles WHERE id IS NULL OR email IS NULL;
  -- 결과: 0이어야 함
  
  -- 추천 관계 무결성 확인
  SELECT COUNT(*) FROM profiles p1 
  LEFT JOIN profiles p2 ON p1.referrer_l1_id = p2.id
  WHERE p1.referrer_l1_id IS NOT NULL AND p2.id IS NULL;
  -- 결과: 0이어야 함
  ```

- [ ] **새로운 사용자 생성 테스트**
  ```bash
  # 새 사용자 생성 후 프로필 자동 생성 확인
  node scripts/test-new-user-creation.js
  ```

### 🧪 전체 테스트 실행

- [ ] **단위 테스트**
  ```bash
  npm run test
  # 모든 테스트 통과 확인
  ```

- [ ] **통합 테스트**
  ```bash
  npm run test:integration
  # API 엔드포인트 테스트
  ```

- [ ] **E2E 테스트**
  ```bash
  npm run test:e2e
  # 전체 사용자 플로우 테스트
  ```

- [ ] **빌드 테스트**
  ```bash
  npm run build
  # 빌드 오류 없이 완료되는지 확인
  ```

## 배포 및 모니터링 체크리스트

### 🚀 배포 준비

- [ ] **프로덕션 환경 변수 설정**
  ```bash
  # Vercel/Netlify에 환경 변수 추가
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
  ```

- [ ] **Supabase 프로덕션 설정**
  - [ ] Auth 설정 확인
  - [ ] RLS 정책 적용
  - [ ] Database 함수 배포
  - [ ] Redirect URLs 업데이트

- [ ] **도메인 설정**
  - [ ] DNS 설정 확인
  - [ ] SSL 인증서 확인
  - [ ] 서브도메인 설정 확인

### 📈 모니터링 설정

- [ ] **로그 모니터링 설정**
  ```typescript
  // 인증 관련 로그 추가
  console.log('Auth event:', { event, user: user?.id, timestamp: new Date() })
  ```

- [ ] **에러 추적 설정**
  ```typescript
  // Sentry 또는 다른 에러 추적 도구 설정
  import * as Sentry from '@sentry/nextjs'
  
  try {
    await signInWithEmail(email, password)
  } catch (error) {
    Sentry.captureException(error)
    throw error
  }
  ```

- [ ] **성능 모니터링**
  ```typescript
  // 인증 관련 성능 메트릭 수집
  const startTime = Date.now()
  const result = await signInWithEmail(email, password)
  const duration = Date.now() - startTime
  
  // 성능 데이터 전송
  analytics.track('auth_signin_duration', { duration })
  ```

### 🔄 점진적 배포

- [ ] **카나리 배포 (10% 트래픽)**
  - [ ] 10% 사용자에게만 새 인증 시스템 적용
  - [ ] 에러율 모니터링 (< 0.1%)
  - [ ] 성능 지표 확인

- [ ] **단계적 확장 (50% 트래픽)**  
  - [ ] 에러 없음 확인 후 50%로 확대
  - [ ] 추가 성능 모니터링
  - [ ] 사용자 피드백 수집

- [ ] **전체 배포 (100% 트래픽)**
  - [ ] 모든 사용자에게 적용
  - [ ] 24시간 모니터링
  - [ ] 롤백 준비 상태 유지

## 롤백 체크리스트

### ⚠️ 롤백 트리거 조건

- [ ] **에러율 > 1%**
- [ ] **로그인 실패율 > 5%**  
- [ ] **응답 시간 > 5초**
- [ ] **데이터 손실 발견**
- [ ] **보안 이슈 발견**

### 🔙 롤백 실행

- [ ] **코드 롤백**
  ```bash
  git checkout main
  git revert [migration-commit-hash]
  git push origin main
  ```

- [ ] **데이터베이스 롤백**
  ```sql
  -- RLS 정책 롤백
  DROP POLICY "Users can access own data" ON profiles;
  CREATE POLICY "Users can access own profile" ON profiles
    FOR ALL USING (id = current_setting('request.jwt.claim.user_id')::text);
  ```

- [ ] **환경 변수 롤백**
  ```bash
  # Clerk 환경 변수 복원
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
  CLERK_SECRET_KEY=...
  CLERK_WEBHOOK_SECRET=...
  ```

- [ ] **패키지 복원**
  ```bash
  npm install @clerk/nextjs svix
  ```

### 📋 롤백 후 검증

- [ ] **기본 기능 동작 확인**
- [ ] **사용자 로그인 테스트**
- [ ] **도메인 라우팅 테스트**
- [ ] **데이터 무결성 확인**

## 마이그레이션 완료 보고서

### 📊 성과 지표

- [ ] **마이그레이션 소요 시간**: ___일
- [ ] **다운타임**: ___분  
- [ ] **데이터 손실**: 0건
- [ ] **에러율**: ___%
- [ ] **성능 개선**: ___%

### 📝 완료 문서화

- [ ] **변경 사항 문서 업데이트**
- [ ] **API 문서 업데이트**
- [ ] **개발자 가이드 업데이트** 
- [ ] **사용자 가이드 업데이트**

### 🎯 향후 계획

- [ ] **추가 최적화 계획**
- [ ] **모니터링 개선 계획**
- [ ] **보안 강화 계획**
- [ ] **사용자 경험 개선 계획**

---

**⚠️ 중요 참고사항:**
- 각 체크리스트 항목은 반드시 순서대로 진행하세요
- 실패 시 즉시 이전 단계로 롤백하세요
- 모든 변경사항은 Git으로 버전 관리하세요
- 프로덕션 배포 전 스테이징에서 충분히 테스트하세요
- 백업은 매 단계마다 생성하세요
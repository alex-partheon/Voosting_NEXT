# Clerk → Supabase Auth 마이그레이션 실행 체크리스트

## 📋 마이그레이션 개요

**목표**: Clerk 인증 시스템을 Supabase Auth로 완전 전환하여 비용 최적화 및 단일 벤더 의존성 달성

**전체 예상 소요시간**: 16-20 시간 (8 단계)
**위험도**: Medium-High (사용자 인증 시스템 전면 교체)
**롤백 가능성**: 각 단계별 체크포인트 제공

---

## Phase 1: 준비 작업 (백업, 환경 설정)
*예상 소요시간: 2-3 시간*

### P1-1: 백업 및 현재 상태 스냅샷 생성
- [ ] **Priority**: 🔴 Critical
- **작업**: 
  - Clerk 사용자 데이터 전체 백업
  - Supabase profiles 테이블 백업
  - 현재 환경변수 설정 백업
- **실행 방법**:
  ```bash
  # Clerk 사용자 데이터 백업
  curl -H "Authorization: Bearer $CLERK_SECRET_KEY" \
    https://api.clerk.dev/v1/users > backup/clerk-users-$(date +%Y%m%d).json
  
  # Supabase 백업
  npx supabase db dump --file backup/supabase-backup-$(date +%Y%m%d).sql
  
  # 환경변수 백업
  cp .env.local backup/.env.backup-$(date +%Y%m%d)
  ```
- **검증 기준**: JSON 파일과 SQL 덤프 파일이 정상 생성되었는지 확인
- **롤백 포인트**: 전체 백업 파일 세트 완성
- **관련 파일**: `backup/clerk-users-*.json`, `backup/supabase-backup-*.sql`

### P1-2: 개발 환경 브랜치 생성
- [ ] **Priority**: 🔴 Critical
- **작업**: 마이그레이션 전용 브랜치 생성 및 작업 환경 준비
- **실행 방법**:
  ```bash
  git checkout -b migration/clerk-to-supabase-auth
  git push -u origin migration/clerk-to-supabase-auth
  ```
- **검증 기준**: 새 브랜치에서 현재 앱이 정상 동작하는지 확인
- **예상 소요시간**: 15분
- **롤백 포인트**: main 브랜치로 복귀 가능

### P1-3: 사용자 매핑 테이블 생성
- [ ] **Priority**: 🟡 High
- **작업**: Clerk User ID → Supabase User ID 매핑을 위한 임시 테이블 생성
- **실행 방법**:
  ```sql
  -- supabase/migrations/xxx_create_user_migration_mapping.sql
  CREATE TABLE user_migration_mapping (
    clerk_user_id TEXT PRIMARY KEY,
    supabase_user_id UUID REFERENCES auth.users(id),
    migrated_at TIMESTAMP DEFAULT NOW(),
    migration_status TEXT DEFAULT 'pending'
  );
  ```
- **검증 기준**: 테이블이 정상 생성되고 RLS 정책이 적용되었는지 확인
- **예상 소요시간**: 30분
- **관련 파일**: `supabase/migrations/xxx_create_user_migration_mapping.sql`

### P1-4: 테스트 사용자 계정 준비
- [ ] **Priority**: 🟡 High
- **작업**: 마이그레이션 테스트용 사용자 계정 생성
- **실행 방법**:
  - Clerk에서 테스트 사용자 3개 생성 (각 역할별)
  - 각 사용자의 ID, 이메일, 역할 정보 기록
- **검증 기준**: 테스트 사용자로 로그인 및 대시보드 접근 가능
- **예상 소요시간**: 30분

### P1-5: 롤백 계획 수립
- [ ] **Priority**: 🟡 High
- **작업**: 각 단계별 롤백 시나리오 및 스크립트 준비
- **실행 방법**:
  ```bash
  # 롤백 스크립트 생성
  cat > scripts/rollback-phase-n.sh << 'EOF'
  #!/bin/bash
  echo "Rolling back Phase N..."
  # Phase별 롤백 로직
  EOF
  chmod +x scripts/rollback-phase-*.sh
  ```
- **검증 기준**: 모든 롤백 스크립트가 실행 가능하고 문법 오류 없음
- **예상 소요시간**: 1시간

### P1-6: 모니터링 대시보드 설정
- [ ] **Priority**: 🟢 Medium
- **작업**: 마이그레이션 진행 상황 모니터링 도구 설정
- **실행 방법**:
  - Supabase Dashboard의 Auth 섹션 모니터링 설정
  - 사용자 등록/로그인 지표 추적 준비
- **검증 기준**: 실시간 사용자 통계 확인 가능
- **예상 소요시간**: 45분

---

## Phase 2: Supabase Auth 설정 (OAuth, 정책)
*예상 소요시간: 2.5-3 시간*

### P2-1: Supabase Auth 기본 설정
- [ ] **Priority**: 🔴 Critical
- **작업**: Supabase 프로젝트에서 Auth 서비스 활성화 및 설정
- **실행 방법**:
  ```bash
  # Supabase CLI를 통한 설정
  npx supabase auth update --enable-signup=true
  npx supabase auth update --minimum-password-length=8
  npx supabase auth update --enable-email-confirmations=false  # 개발용
  ```
- **검증 기준**: Supabase Dashboard에서 Auth 설정이 반영되었는지 확인
- **예상 소요시간**: 30분
- **관련 파일**: `supabase/config.toml`

### P2-2: OAuth 제공자 설정
- [ ] **Priority**: 🔴 Critical
- **작업**: Google, GitHub, Discord OAuth 제공자 설정
- **실행 방법**:
  1. Google Cloud Console에서 OAuth 클라이언트 생성
  2. GitHub OAuth App 생성
  3. Discord OAuth App 생성
  4. Supabase Dashboard에서 각 제공자 설정
- **검증 기준**: 각 OAuth 제공자로 테스트 로그인 성공
- **예상 소요시간**: 1.5시간
- **롤백 포인트**: OAuth 설정 이전 상태로 복귀 가능

### P2-3: 이메일 템플릿 커스터마이징
- [ ] **Priority**: 🟡 High
- **작업**: 브랜드에 맞는 이메일 템플릿 설정
- **실행 방법**:
  - Supabase Dashboard → Auth → Email Templates
  - 확인 이메일, 비밀번호 리셋 템플릿 수정
  - Voosting 브랜드 컬러 및 로고 적용
- **검증 기준**: 테스트 이메일 발송 및 디자인 확인
- **예상 소요시간**: 45분

### P2-4: RLS 정책 업데이트
- [ ] **Priority**: 🔴 Critical
- **작업**: auth.uid() 기반 RLS 정책으로 전환
- **실행 방법**:
  ```sql
  -- 기존 Clerk 기반 정책 제거
  DROP POLICY IF EXISTS "Users can access own profile" ON profiles;
  
  -- Supabase Auth 기반 정책 생성
  CREATE POLICY "Users can access own profile" ON profiles
    FOR ALL USING (auth.uid() = id);
    
  CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
  ```
- **검증 기준**: 새로운 RLS 정책으로 CRUD 작업 테스트 성공
- **예상 소요시간**: 45분
- **관련 파일**: `supabase/migrations/xxx_update_rls_policies.sql`

### P2-5: 데이터베이스 트리거 설정
- [ ] **Priority**: 🟡 High
- **작업**: 새 사용자 등록 시 자동 프로필 생성 트리거
- **실행 방법**:
  ```sql
  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO public.profiles (id, email, role, referral_code)
    VALUES (
      NEW.id,
      NEW.email,
      'creator',
      generate_referral_code()
    );
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  ```
- **검증 기준**: 새 사용자 등록 시 프로필이 자동 생성되는지 확인
- **예상 소요시간**: 30분

### P2-6: 보안 설정 강화
- [ ] **Priority**: 🟡 High
- **작업**: 세션 만료, 보안 정책 등 설정
- **실행 방법**:
  ```bash
  # JWT 만료 시간 설정 (24시간)
  npx supabase auth update --jwt-expiry=86400
  
  # 최대 로그인 시도 제한
  npx supabase auth update --rate-limit-email-password=5
  ```
- **검증 기준**: 보안 정책이 정상 적용되었는지 테스트
- **예상 소요시간**: 30분

---

## Phase 3: 새로운 인증 컴포넌트 개발
*예상 소요시간: 3-4 시간*

### P3-1: Supabase Auth 클라이언트 설정
- [ ] **Priority**: 🔴 Critical
- **작업**: 새로운 Supabase 클라이언트 및 Auth 헬퍼 함수 개발
- **실행 방법**:
  ```typescript
  // src/lib/supabase/auth.ts 생성
  import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
  
  export const supabaseAuth = createClientComponentClient()
  
  export async function signInWithEmail(email: string, password: string) {
    return await supabaseAuth.auth.signInWithPassword({ email, password })
  }
  
  export async function signUpWithEmail(email: string, password: string) {
    return await supabaseAuth.auth.signUp({ email, password })
  }
  ```
- **검증 기준**: 기본 인증 함수들이 정상 동작하는지 단위 테스트
- **예상 소요시간**: 1시간
- **관련 파일**: `src/lib/supabase/auth.ts`

### P3-2: 새로운 로그인 컴포넌트 개발
- [ ] **Priority**: 🔴 Critical
- **작업**: Supabase Auth 기반 로그인 폼 컴포넌트 생성
- **실행 방법**:
  ```typescript
  // src/components/auth/SupabaseSignIn.tsx 생성
  'use client'
  import { useState } from 'react'
  import { signInWithEmail } from '@/lib/supabase/auth'
  
  export default function SupabaseSignIn() {
    // 로그인 폼 로직 구현
  }
  ```
- **검증 기준**: 이메일/비밀번호 로그인 및 OAuth 로그인 모두 동작
- **예상 소요시간**: 1.5시간
- **관련 파일**: `src/components/auth/SupabaseSignIn.tsx`

### P3-3: 새로운 회원가입 컴포넌트 개발
- [ ] **Priority**: 🔴 Critical
- **작업**: 역할 선택이 포함된 회원가입 컴포넌트 생성
- **실행 방법**:
  - Creator/Business 역할 선택 UI 구현
  - 추천인 코드 입력 필드 추가
  - 이메일 확인 플로우 구현
- **검증 기준**: 모든 역할별 회원가입 플로우가 정상 동작
- **예상 소요시간**: 1.5시간
- **관련 파일**: `src/components/auth/SupabaseSignUp.tsx`

### P3-4: 세션 관리 훅 개발
- [ ] **Priority**: 🟡 High
- **작업**: useAuth 훅을 Supabase Auth 기반으로 재구현
- **실행 방법**:
  ```typescript
  // src/hooks/useSupabaseAuth.ts
  import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
  
  export function useSupabaseAuth() {
    const user = useUser()
    const supabase = useSupabaseClient()
    
    return {
      user,
      isLoading: !user,
      signOut: () => supabase.auth.signOut(),
      // 기타 인증 관련 함수들
    }
  }
  ```
- **검증 기준**: 세션 상태가 정확히 추적되고 자동 갱신됨
- **예상 소요시간**: 45분
- **관련 파일**: `src/hooks/useSupabaseAuth.ts`

### P3-5: 보호된 라우트 래퍼 개발
- [ ] **Priority**: 🟡 High
- **작업**: withAuth HOC를 Supabase Auth 기반으로 재구현
- **실행 방법**:
  ```typescript
  // src/components/auth/ProtectedRoute.tsx
  import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
  
  export function ProtectedRoute({ children, requiredRole }: Props) {
    const { user, isLoading } = useSupabaseAuth()
    
    if (isLoading) return <LoadingSpinner />
    if (!user) return <RedirectToLogin />
    
    return <>{children}</>
  }
  ```
- **검증 기준**: 미인증 사용자는 로그인 페이지로 리다이렉트
- **예상 소요시간**: 30분

### P3-6: 에러 핸들링 시스템 구축
- [ ] **Priority**: 🟢 Medium
- **작업**: Supabase Auth 에러에 대한 사용자 친화적 메시지 시스템
- **실행 방법**:
  - 인증 에러 타입별 한국어 메시지 매핑
  - 토스트 알림 시스템 연동
  - 에러 로깅 시스템 구축
- **검증 기준**: 모든 인증 에러가 적절한 메시지로 표시됨
- **예상 소요시간**: 45분

---

## Phase 4: 데이터베이스 스키마 업데이트
*예상 소요시간: 2-2.5 시间*

### P4-1: profiles 테이블 스키마 수정
- [ ] **Priority**: 🔴 Critical
- **작업**: UUID 기반 ID로 변경 및 Supabase Auth 연동
- **실행 방법**:
  ```sql
  -- supabase/migrations/xxx_update_profiles_schema.sql
  -- 기존 TEXT id를 UUID로 변경하는 마이그레이션
  ALTER TABLE profiles 
    ALTER COLUMN id TYPE UUID USING id::uuid,
    ALTER COLUMN id SET DEFAULT gen_random_uuid();
    
  -- auth.users와의 외래키 관계 설정
  ALTER TABLE profiles 
    ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  ```
- **검증 기준**: 기존 데이터 무손실로 마이그레이션 완료
- **예상 소요시간**: 1시간
- **롤백 포인트**: 스키마 변경 이전 백업으로 복원 가능
- **관련 파일**: `supabase/migrations/xxx_update_profiles_schema.sql`

### P4-2: 외래키 관계 업데이트
- [ ] **Priority**: 🔴 Critical
- **작업**: profiles 테이블을 참조하는 모든 테이블의 외래키 수정
- **실행 방법**:
  ```sql
  -- campaigns, earnings, referrals 등 테이블의 외래키 업데이트
  ALTER TABLE campaigns 
    DROP CONSTRAINT campaigns_creator_id_fkey,
    ADD CONSTRAINT campaigns_creator_id_fkey 
    FOREIGN KEY (creator_id) REFERENCES profiles(id);
  ```
- **검증 기준**: 모든 외래키 관계가 정상 동작하고 referential integrity 유지
- **예상 소요시간**: 45분

### P4-3: 추천 시스템 스키마 업데이트
- [ ] **Priority**: 🟡 High
- **작업**: 3단계 추천 시스템을 위한 테이블 구조 최적화
- **실행 방법**:
  ```sql
  -- 추천 관계 테이블 최적화
  CREATE INDEX idx_profiles_referrer_l1 ON profiles(referrer_l1_id);
  CREATE INDEX idx_profiles_referrer_l2 ON profiles(referrer_l2_id);
  CREATE INDEX idx_profiles_referrer_l3 ON profiles(referrer_l3_id);
  ```
- **검증 기준**: 추천 체인 조회 성능이 최적화됨 (< 100ms)
- **예상 소요시간**: 30분

### P4-4: 데이터 검증 함수 생성
- [ ] **Priority**: 🟡 High
- **작업**: 마이그레이션 후 데이터 무결성 검증 함수
- **실행 방법**:
  ```sql
  CREATE OR REPLACE FUNCTION validate_migration_data()
  RETURNS TABLE(check_name TEXT, status TEXT, details TEXT) AS $$
  BEGIN
    -- 모든 profiles에 auth.users 대응 레코드 존재 확인
    -- 외래키 관계 무결성 확인
    -- 추천 체인 무결성 확인
  END;
  $$ LANGUAGE plpgsql;
  ```
- **검증 기준**: 모든 데이터 검증이 PASS 상태
- **예상 소요시간**: 45분

### P4-5: 성능 최적화 인덱스 생성
- [ ] **Priority**: 🟢 Medium
- **작업**: 주요 쿼리 성능 향상을 위한 인덱스 생성
- **실행 방법**:
  ```sql
  CREATE INDEX idx_profiles_email ON profiles(email);
  CREATE INDEX idx_profiles_role ON profiles(role);
  CREATE INDEX idx_profiles_referral_code ON profiles(referral_code);
  ```
- **검증 기준**: 주요 쿼리 실행 시간이 50% 이상 향상
- **예상 소요시간**: 30분

### P4-6: 백업 및 복원 테스트
- [ ] **Priority**: 🟡 High
- **작업**: 스키마 변경 후 백업/복원 프로세스 검증
- **실행 방법**:
  ```bash
  # 새 스키마로 백업 생성
  npx supabase db dump --file test-backup.sql
  
  # 복원 테스트 (별도 환경)
  npx supabase db reset
  psql -f test-backup.sql
  ```
- **검증 기준**: 백업/복원 후 모든 기능이 정상 동작
- **예상 소요시간**: 45분

---

## Phase 5: 미들웨어 및 유틸리티 전환
*예상 소요시간: 2.5-3 시간*

### P5-1: 미들웨어 인증 로직 전환
- [ ] **Priority**: 🔴 Critical
- **작업**: middleware.ts에서 Clerk → Supabase Auth 전환
- **실행 방법**:
  ```typescript
  // src/middleware.ts 수정
  import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
  
  export async function middleware(request: NextRequest) {
    const supabase = createMiddlewareClient({ req: request, res: response })
    const { data: { session } } = await supabase.auth.getSession()
    
    // 기존 Clerk 로직을 Supabase Auth로 대체
  }
  ```
- **검증 기준**: 모든 보호된 라우트에서 인증 검사가 정상 동작
- **예상 소요시간**: 1.5시간
- **롤백 포인트**: 기존 Clerk 미들웨어로 즉시 복원 가능
- **관련 파일**: `src/middleware.ts`

### P5-2: 서버 액션 인증 헬퍼 업데이트
- [ ] **Priority**: 🔴 Critical
- **작업**: getCurrentUser 등 인증 헬퍼 함수를 Supabase Auth 기반으로 재구현
- **실행 방법**:
  ```typescript
  // src/lib/auth.ts 완전 재작성
  import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
  
  export async function getCurrentUser() {
    const supabase = createServerComponentClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }
  ```
- **검증 기준**: 모든 서버 컴포넌트에서 사용자 정보 조회 정상 동작
- **예상 소요시간**: 1시간
- **관련 파일**: `src/lib/auth.ts`, `src/lib/clerk.ts` (제거)

### P5-3: API 라우트 인증 로직 전환
- [ ] **Priority**: 🔴 Critical
- **작업**: 모든 API 라우트에서 Clerk → Supabase 인증 로직 변경
- **실행 방법**:
  ```typescript
  // 예: src/app/api/profile/route.ts
  import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
  
  export async function GET(request: Request) {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // 나머지 로직
  }
  ```
- **검증 기준**: 모든 API 엔드포인트에서 인증이 정상 동작
- **예상 소요시간**: 45분
- **관련 파일**: `src/app/api/*/route.ts` (모든 API 라우트)

### P5-4: 역할 기반 접근 제어 업데이트
- [ ] **Priority**: 🟡 High
- **작업**: requireRole 함수를 Supabase 기반으로 재구현
- **실행 방법**:
  ```typescript
  // src/lib/auth.ts에 추가
  export async function requireRole(requiredRole: UserRole) {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profile?.role !== requiredRole) {
      throw new Error('Insufficient permissions')
    }
    
    return { user, profile }
  }
  ```
- **검증 기준**: 역할별 페이지 접근 제어가 정상 동작
- **예상 소요시간**: 30분

### P5-5: 웹훅 엔드포인트 제거
- [ ] **Priority**: 🟢 Medium
- **작업**: Clerk 웹훅 관련 코드 제거 및 정리
- **실행 방법**:
  ```bash
  # Clerk 웹훅 관련 파일 제거
  rm src/app/api/webhooks/clerk/route.ts
  rm -rf src/lib/clerk/
  
  # 환경변수에서 Clerk 관련 변수 제거 (주석 처리)
  # CLERK_SECRET_KEY=...
  # NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
  ```
- **검증 기준**: Clerk 관련 코드가 완전히 제거되고 빌드 오류 없음
- **예상 소요시간**: 30분

### P5-6: 타입 정의 업데이트
- [ ] **Priority**: 🟢 Medium
- **작업**: User 타입을 Supabase Auth 기반으로 변경
- **실행 방법**:
  ```typescript
  // src/types/auth.ts 업데이트
  import { User as SupabaseUser } from '@supabase/auth-helpers-nextjs'
  
  export type User = SupabaseUser
  export interface UserProfile extends User {
    role: 'creator' | 'business' | 'admin'
    referral_code: string
    // 기타 프로필 필드
  }
  ```
- **검증 기준**: TypeScript 컴파일 오류 없이 모든 타입이 정상 해결
- **예상 소요시간**: 15분

---

## Phase 6: 사용자 인터페이스 전환
*예상 소요시간: 2.5-3 시간*

### P6-1: 로그인 페이지 교체
- [ ] **Priority**: 🔴 Critical
- **작업**: `/sign-in` 페이지를 새로운 Supabase 컴포넌트로 교체
- **실행 방법**:
  ```typescript
  // src/app/sign-in/page.tsx 완전 재작성
  import SupabaseSignIn from '@/components/auth/SupabaseSignIn'
  
  export default function SignInPage() {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SupabaseSignIn />
      </div>
    )
  }
  ```
- **검증 기준**: 모든 로그인 방식(이메일, OAuth)이 정상 동작
- **예상 소요시간**: 45분
- **관련 파일**: `src/app/sign-in/page.tsx`

### P6-2: 회원가입 페이지 교체
- [ ] **Priority**: 🔴 Critical
- **작업**: 역할별 회원가입 페이지를 새로운 컴포넌트로 교체
- **실행 방법**:
  - `/sign-up/creator` 페이지 업데이트
  - `/sign-up/business` 페이지 업데이트
  - 추천인 코드 입력 기능 통합
- **검증 기준**: 각 역할별 회원가입이 정상 동작하고 프로필이 자동 생성
- **예상 소요시간**: 1시간
- **관련 파일**: `src/app/sign-up/*/page.tsx`

### P6-3: 대시보드 인증 상태 업데이트
- [ ] **Priority**: 🔴 Critical
- **작업**: 모든 대시보드에서 사용자 정보 표시 및 로그아웃 기능 업데이트
- **실행 방법**:
  ```typescript
  // 대시보드 컴포넌트에서 useSupabaseAuth 훅 사용
  const { user, signOut } = useSupabaseAuth()
  ```
- **검증 기준**: 사용자 정보가 정확히 표시되고 로그아웃이 정상 동작
- **예상 소요시간**: 45분
- **관련 파일**: 모든 대시보드 레이아웃 파일

### P6-4: 프로필 설정 페이지 업데이트
- [ ] **Priority**: 🟡 High
- **작업**: 사용자 프로필 수정 기능을 Supabase Auth 기반으로 업데이트
- **실행 방법**:
  - 이메일 변경 기능 구현
  - 비밀번호 변경 기능 구현
  - OAuth 연결/해제 기능 구현
- **검증 기준**: 모든 프로필 수정 기능이 정상 동작
- **예상 소요시간**: 45분

### P6-5: 에러 페이지 및 리다이렉트 로직 업데이트
- [ ] **Priority**: 🟢 Medium
- **작업**: 인증 실패 시 에러 페이지 및 리다이렉트 로직 수정
- **실행 방법**:
  - 401 Unauthorized 에러 페이지 생성
  - 로그인 후 원래 페이지로 복귀 로직 구현
  - 세션 만료 시 자동 로그아웃 처리
- **검증 기준**: 모든 인증 관련 에러가 적절히 처리됨
- **예상 소요시간**: 30분

### P6-6: 로딩 상태 및 UX 개선
- [ ] **Priority**: 🟢 Medium
- **작업**: 인증 관련 로딩 상태 및 사용자 경험 최적화
- **실행 방법**:
  - 로그인/회원가입 중 로딩 스피너 표시
  - 성공/실패 토스트 메시지 구현
  - 인증 상태 변경 시 부드러운 트랜지션
- **검증 기준**: 사용자 경험이 매끄럽고 피드백이 적절함
- **예상 소요시간**: 30분

---

## Phase 7: 테스트 및 검증
*예상 소요시간: 2-3 시간*

### P7-1: 단위 테스트 업데이트
- [ ] **Priority**: 🔴 Critical
- **작업**: 모든 인증 관련 단위 테스트를 Supabase Auth 기반으로 수정
- **실행 방법**:
  ```typescript
  // src/lib/__tests__/auth.test.ts 업데이트
  import { getCurrentUser, signInWithEmail } from '@/lib/auth'
  
  describe('Supabase Auth', () => {
    it('should authenticate user with email/password', async () => {
      // Supabase Auth 테스트 로직
    })
  })
  ```
- **검증 기준**: 모든 단위 테스트가 통과 (90% 이상 커버리지 유지)
- **예상 소요시간**: 1시간
- **관련 파일**: `src/lib/__tests__/*.test.ts`

### P7-2: 통합 테스트 실행
- [ ] **Priority**: 🔴 Critical
- **작업**: E2E 테스트를 통한 전체 인증 플로우 검증
- **실행 방법**:
  ```typescript
  // test/auth.spec.ts 업데이트
  test('complete authentication flow', async ({ page }) => {
    // 회원가입 → 로그인 → 대시보드 접근 → 로그아웃 전체 플로우 테스트
  })
  ```
- **검증 기준**: 16개 주요 시나리오가 모두 통과
- **예상 소요시간**: 45분
- **관련 파일**: `test/*.spec.ts`

### P7-3: 성능 테스트
- [ ] **Priority**: 🟡 High
- **작업**: 인증 관련 성능 지표 측정 및 최적화
- **실행 방법**:
  ```bash
  # 로그인 성능 테스트
  time curl -X POST http://localhost:3002/api/auth/signin \
    -d '{"email":"test@example.com","password":"password"}'
  
  # 미들웨어 성능 테스트
  for i in {1..10}; do
    time curl -H "Host: creator.localhost:3002" http://localhost:3002/dashboard
  done
  ```
- **검증 기준**: 
  - 로그인 응답 시간 < 500ms
  - 미들웨어 응답 시간 < 1000ms
  - 대시보드 로딩 시간 < 3초
- **예상 소요시간**: 30분

### P7-4: 보안 테스트
- [ ] **Priority**: 🔴 Critical
- **작업**: 인증 시스템 보안 취약점 검사
- **실행 방법**:
  - JWT 토큰 검증 테스트
  - CSRF 공격 방어 테스트
  - SQL Injection 방어 테스트
  - Rate Limiting 테스트
- **검증 기준**: 모든 보안 테스트가 통과하고 취약점 없음
- **예상 소요시간**: 45분

### P7-5: 다중 브라우저 호환성 테스트
- [ ] **Priority**: 🟡 High
- **작업**: Chrome, Firefox, Safari에서 인증 기능 테스트
- **실행 방법**:
  ```bash
  # Playwright를 통한 다중 브라우저 테스트
  npx playwright test --project=chromium
  npx playwright test --project=firefox  
  npx playwright test --project=webkit
  ```
- **검증 기준**: 모든 브라우저에서 인증 플로우가 정상 동작
- **예상 소요시간**: 30분

### P7-6: 사용자 수용 테스트 (UAT)
- [ ] **Priority**: 🟡 High
- **작업**: 실제 사용자 시나리오 기반 전체 시스템 테스트
- **실행 방법**:
  - 테스트 사용자별 전체 시나리오 실행
  - 크리에이터 → 비즈니스 → 관리자 역할별 기능 테스트
  - 실제 이메일, OAuth 로그인 테스트
- **검증 기준**: 모든 사용자 시나리오가 문제없이 완료
- **예상 소요시간**: 30분

---

## Phase 8: 배포 및 정리
*예상 소요시간: 1.5-2 시간*

### P8-1: 환경변수 정리
- [ ] **Priority**: 🔴 Critical
- **작업**: Clerk 관련 환경변수 제거 및 Supabase 전용 설정
- **실행 방법**:
  ```bash
  # .env.local에서 Clerk 변수 제거
  sed -i '/CLERK_/d' .env.local
  
  # .env.example 업데이트
  cat >> .env.example << 'EOF'
  # Supabase Auth (Clerk에서 전환됨)
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
  EOF
  ```
- **검증 기준**: 필요한 환경변수만 남아있고 불필요한 변수는 제거됨
- **예상 소요시간**: 15분
- **관련 파일**: `.env.local`, `.env.example`

### P8-2: 의존성 정리
- [ ] **Priority**: 🟡 High
- **작업**: Clerk 관련 패키지 제거 및 Supabase 패키지 정리
- **실행 방법**:
  ```bash
  # Clerk 패키지 제거
  npm uninstall @clerk/nextjs @clerk/themes svix
  
  # 불필요한 Supabase 패키지 정리 (필요시)
  npm install @supabase/auth-helpers-nextjs@latest
  npm install @supabase/supabase-js@latest
  ```
- **검증 기준**: package.json에 불필요한 의존성 없고 빌드 오류 없음
- **예상 소요시간**: 30분
- **관련 파일**: `package.json`, `package-lock.json`

### P8-3: 코드 정리 및 최적화
- [ ] **Priority**: 🟢 Medium
- **작업**: 사용하지 않는 Clerk 관련 코드 및 주석 제거
- **실행 방법**:
  ```bash
  # 미사용 import 제거
  npx eslint --fix src/
  
  # Clerk 관련 주석 제거
  grep -r "clerk\|Clerk" src/ --include="*.ts" --include="*.tsx" | \
    grep -i "todo\|fixme\|remove"
  ```
- **검증 기준**: ESLint 및 TypeScript 컴파일 오류 없음
- **예상 소요시간**: 30분

### P8-4: 문서 업데이트
- [ ] **Priority**: 🟢 Medium
- **작업**: 마이그레이션 완료를 반영한 문서 업데이트
- **실행 방법**:
  - CLAUDE.md의 인증 섹션 업데이트
  - README.md의 환경 설정 가이드 수정
  - API 문서 업데이트 (필요시)
- **검증 기준**: 모든 문서가 현재 상태를 정확히 반영
- **예상 소요시간**: 30분
- **관련 파일**: `CLAUDE.md`, `README.md`

### P8-5: 배포 준비 및 검증
- [ ] **Priority**: 🔴 Critical
- **작업**: 프로덕션 환경 배포 준비 및 최종 검증
- **실행 방법**:
  ```bash
  # 프로덕션 빌드 테스트
  npm run build
  
  # 프로덕션 모드 실행 테스트
  npm start
  
  # 환경별 설정 확인
  echo "Testing production environment..."
  ```
- **검증 기준**: 프로덕션 빌드 성공하고 모든 기능이 정상 동작
- **예상 소요시간**: 30분

### P8-6: 마이그레이션 완료 보고서 작성
- [ ] **Priority**: 🟢 Medium
- **작업**: 마이그레이션 결과 및 후속 작업 계획 문서화
- **실행 방법**:
  - 완료된 작업 목록 정리
  - 성능 개선 지표 정리
  - 향후 유지보수 계획 수립
  - 알려진 이슈 및 제한사항 문서화
- **검증 기준**: 완전하고 정확한 마이그레이션 보고서 완성
- **예상 소요시간**: 45분
- **관련 파일**: `docs/migration/migration-completion-report.md`

---

## 🚨 위험 관리 및 체크포인트

### 주요 위험 요소
1. **데이터 손실**: 사용자 프로필 데이터 손실 위험
2. **서비스 중단**: 인증 시스템 전환 중 서비스 접근 불가
3. **성능 저하**: 새로운 인증 시스템의 성능 이슈
4. **보안 취약점**: 마이그레이션 과정에서 보안 허점 발생

### 완화 방안
- **Phase 1**: 전체 데이터 백업 및 복원 계획 수립
- **Phase 2-4**: 각 단계별 롤백 포인트 설정
- **Phase 7**: 철저한 테스트를 통한 품질 보증
- **Phase 8**: 점진적 배포 및 모니터링

### 체크포인트
- **Phase 1 완료**: ✅ 백업 및 테스트 환경 구성 완료
- **Phase 4 완료**: ✅ 데이터베이스 마이그레이션 무손실 완료
- **Phase 7 완료**: ✅ 모든 테스트 통과 및 성능 기준 달성
- **Phase 8 완료**: ✅ 프로덕션 배포 및 모니터링 시작

---

## 📊 진행 상황 추적

### 전체 진행률
- [ ] **Phase 1**: 준비 작업 (0/6 완료)
- [ ] **Phase 2**: Supabase Auth 설정 (0/6 완료)
- [ ] **Phase 3**: 새로운 인증 컴포넌트 개발 (0/6 완료)
- [ ] **Phase 4**: 데이터베이스 스키마 업데이트 (0/6 완료)
- [ ] **Phase 5**: 미들웨어 및 유틸리티 전환 (0/6 완료)
- [ ] **Phase 6**: 사용자 인터페이스 전환 (0/6 완료)
- [ ] **Phase 7**: 테스트 및 검증 (0/6 완료)
- [ ] **Phase 8**: 배포 및 정리 (0/5 완료)

**총 진행률**: 0/47 작업 완료 (0%)

### 마일스톤
- [ ] **M1**: 백업 및 환경 준비 완료 (Phase 1)
- [ ] **M2**: Supabase Auth 기본 설정 완료 (Phase 2)
- [ ] **M3**: 새로운 인증 시스템 개발 완료 (Phase 3)
- [ ] **M4**: 데이터베이스 마이그레이션 완료 (Phase 4)
- [ ] **M5**: 기존 시스템 전환 완료 (Phase 5-6)
- [ ] **M6**: 품질 검증 완료 (Phase 7)
- [ ] **M7**: 프로덕션 배포 완료 (Phase 8)

---

## 🔄 롤백 시나리오

각 Phase별 롤백 절차가 `scripts/rollback-phase-n.sh`에 준비되어 있습니다.

**긴급 롤백 시나리오**:
```bash
# Phase 4 이후 긴급 롤백 (데이터베이스 복원)
./scripts/emergency-rollback.sh

# Phase 6 이후 긴급 롤백 (Clerk 재활성화)
./scripts/rollback-to-clerk.sh
```

**롤백 결정 기준**:
- 사용자 인증 실패율 > 5%
- 시스템 응답 시간 > 5초
- 데이터 무결성 오류 발생
- 보안 취약점 발견

이 체크리스트를 따라 진행하면 안전하고 체계적인 Clerk → Supabase Auth 마이그레이션을 완료할 수 있습니다.
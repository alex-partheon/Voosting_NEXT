# E2E 인증 플로우 테스트 가이드

이 문서는 Voosting 프로젝트의 E2E 인증 테스트 실행 및 디버깅을 위한 가이드입니다.

## 📋 테스트 개요

### 구현된 테스트 시나리오

1. **전체 로그인 플로우** (3개 시나리오)
   - 홈페이지 → 로그인 → 크리에이터 대시보드
   - 비즈니스 계정 로그인 → 비즈니스 대시보드 
   - 관리자 계정 로그인 → 관리자 대시보드

2. **회원가입 플로우** (4개 시나리오)
   - 크리에이터 회원가입 완주
   - 비즈니스 회원가입 완주
   - OAuth 로그인 (Google/GitHub) - *현재 스킵됨*

3. **도메인별 접근 시나리오** (5개 시나리오)
   - 올바른 역할로 도메인 접근
   - 잘못된 역할로 접근 시 리다이렉트
   - 관리자 권한 검증
   - 보호된 경로 접근 차단
   - 로그인 후 원래 페이지로 리다이렉트

4. **세션 관리** (4개 시나리오)
   - 새 탭에서 인증 유지
   - 로그아웃 후 접근 차단
   - 세션 만료 처리 - *현재 스킵됨*
   - 브라우저 재시작 후 세션 확인

5. **에러 시나리오** (6개 시나리오)
   - 잘못된 로그인 정보
   - 중복 이메일 회원가입
   - 비밀번호 불일치
   - 네트워크 오류 - *현재 스킵됨*
   - 이메일 미인증 계정
   - 연속 로그인 실패로 인한 계정 잠김

6. **성능 및 UX 테스트** (3개 시나리오)
   - 로그인 처리 시간 측정
   - 로딩 상태 및 사용자 피드백
   - 모바일 환경 테스트

## 🚀 테스트 실행 방법

### 1. 환경 설정

```bash
# 1. Supabase 로컬 환경 시작
pnpm supabase:start

# 2. 환경 변수 확인 (.env.local)
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# 3. 개발 서버 시작 (별도 터미널)
pnpm dev
```

### 2. 테스트 실행 명령어

```bash
# 모든 인증 테스트 실행
pnpm test:e2e:auth

# UI 모드로 테스트 (디버깅용)
pnpm test:e2e:ui

# 브라우저 창에서 테스트 관찰
pnpm test:e2e:headed

# 특정 테스트만 실행
npx playwright test auth-flow.spec.ts --grep "로그인 플로우"

# 모바일 환경 테스트
npx playwright test auth-flow.spec.ts --project="Mobile Chrome"
```

### 3. 테스트 결과 확인

```bash
# HTML 리포트 보기
npx playwright show-report

# 스크린샷 및 비디오 확인
ls test-results/
```

## 🔍 현재 구현에서 예상되는 실패 지점

### ❌ 확실히 실패할 테스트들

다음 테스트들은 현재 UI 구현이 완료되지 않아 실패할 것으로 예상됩니다:

#### 1. UI 요소 누락으로 인한 실패

```typescript
// 실패 예상 - 해당 data-testid가 구현되지 않음
await page.click('[data-testid="header-sign-in-button"]'); // ❌
await page.fill('[data-testid="email-input"]', email);      // ❌
await page.click('[data-testid="sign-up-button"]');         // ❌
```

**예상 에러 메시지:**
```
Error: locator.click: Timeout 30000ms exceeded.
  Locator: [data-testid="header-sign-in-button"]
  - waiting for locator to be visible
```

#### 2. 페이지 라우팅 미구현

```typescript
// 실패 예상 - 페이지가 존재하지 않음
await expect(page).toHaveURL('/sign-up/creator');     // ❌
await expect(page).toHaveURL('/sign-up/business');    // ❌
```

**예상 에러 메시지:**
```
Error: expect(received).toHaveURL(expected)
Expected: /sign-up/creator
Received: /404
```

#### 3. 대시보드 페이지 미구현

```typescript
// 실패 예상 - 대시보드 페이지가 구현되지 않음
await expect(page.locator('h1')).toContainText('크리에이터 대시보드'); // ❌
```

### 🟡 부분적으로 실패할 가능성이 있는 테스트들

#### 1. 도메인 라우팅 테스트

```typescript
// 현재 middleware 구현에 따라 결과가 달라질 수 있음
await page.goto('http://creator.localhost:3002/dashboard');
await expect(page).toHaveURL('http://creator.localhost:3002/dashboard'); // 🟡
```

#### 2. 세션 관리 테스트

Supabase Auth 설정에 따라 세션 지속 시간이 다를 수 있습니다.

### ✅ 성공할 것으로 예상되는 테스트들

#### 1. 기본 네비게이션

```typescript
// 홈페이지 접근은 성공할 것
await page.goto('/');
await expect(page).toHaveTitle(/Voosting|Create Next App/); // ✅
```

#### 2. 미들웨어 라우팅

```typescript
// 미들웨어는 구현되어 있으므로 기본 리다이렉트는 작동
await page.goto('http://creator.localhost:3002/');
// → 인증 페이지로 리다이렉트 또는 404 페이지 ✅
```

## 🔧 디버깅 팁

### 1. 테스트 실패 시 확인사항

```bash
# 1. Supabase 서비스 상태 확인
pnpm supabase:status

# 2. 개발 서버 로그 확인
# dev 터미널에서 오류 메시지 확인

# 3. 브라우저 콘솔 오류 확인
npx playwright test --headed auth-flow.spec.ts
```

### 2. 스크린샷 디버깅

테스트 실패 시 자동으로 스크린샷이 저장됩니다:

```bash
# 실패 시 스크린샷 위치
test-results/
├── auth-flow-전체-로그인-플로우-chromium/
│   ├── test-failed-1.png
│   └── trace.zip
```

### 3. 개별 테스트 실행

```bash
# 특정 describe 블록만 실행
npx playwright test --grep "전체 로그인 플로우"

# 특정 test만 실행
npx playwright test --grep "홈페이지.*크리에이터 대시보드"

# 디버그 모드로 실행
npx playwright test --debug auth-flow.spec.ts
```

### 4. 테스트 데이터 확인

```bash
# Supabase Studio에서 테스트 사용자 확인
# http://localhost:54323
# Authentication > Users 탭에서 테스트 계정 확인

# 또는 CLI로 확인
npx supabase auth list --local
```

## 📝 테스트 커스터마이징

### 1. 테스트 사용자 수정

`test/auth-test-setup.ts` 파일에서 테스트 사용자 정보를 수정할 수 있습니다:

```typescript
export const TEST_USERS: Record<string, TestUser> = {
  creator: {
    email: 'your-test-creator@domain.com',  // 이메일 변경
    password: 'YourPassword123!',           // 비밀번호 변경
    role: 'creator'
  },
  // ...
};
```

### 2. 테스트 타임아웃 조정

`playwright.config.ts`에서 타임아웃 설정을 조정할 수 있습니다:

```typescript
timeout: 30 * 1000, // 전체 테스트 타임아웃 (기본: 30초)
expect: {
  timeout: 10 * 1000 // assertion 타임아웃 (기본: 10초)
}
```

### 3. 추가 테스트 작성

새로운 테스트 시나리오를 추가하려면:

1. `test/auth-flow.spec.ts` 파일에 새로운 `test()` 블록 추가
2. 필요한 경우 `test/auth-test-setup.ts`에 헬퍼 메서드 추가
3. `data-testid` 속성을 UI 컴포넌트에 추가

## 🎯 다음 단계

### Phase 1: UI 구현 완료 후

1. **data-testid 속성 추가**
   - 모든 폼 요소에 테스트 식별자 추가
   - 버튼, 링크, 입력 필드에 고유 ID 부여

2. **페이지 라우팅 구현**
   - `/sign-up/creator`, `/sign-up/business` 페이지 생성
   - 각 도메인별 대시보드 페이지 구현

3. **에러 핸들링 구현**
   - 로그인/회원가입 실패 시 에러 메시지 표시
   - 네트워크 오류 처리

### Phase 2: 고급 테스트 활성화

1. **OAuth 테스트 구현**
   - Google, GitHub OAuth 플로우 테스트
   - Mock OAuth 서비스 구성

2. **세션 관리 테스트 완성**
   - JWT 토큰 만료 시뮬레이션
   - 자동 토큰 갱신 테스트

3. **성능 모니터링 추가**
   - Core Web Vitals 측정
   - 인증 플로우 성능 벤치마크

## 📞 문제 해결

테스트 실행 중 문제가 발생하면:

1. **환경 확인**: `pnpm supabase:status`로 모든 서비스가 실행 중인지 확인
2. **로그 확인**: 개발 서버와 Supabase 로그에서 오류 메시지 확인  
3. **데이터 정리**: `pnpm supabase:reset`으로 데이터베이스 초기화
4. **캐시 정리**: `rm -rf .next/cache test-results/`로 캐시 삭제

이 테스트 수트는 인증 시스템의 견고성을 검증하고, 사용자 경험의 품질을 보장하기 위해 설계되었습니다.
# 테스트 전략 - Pure Supabase Auth 마이그레이션

**Clerk → Pure Supabase Auth 전환을 위한 종합적인 테스트 전략**

## 📋 개요

이 문서는 Voosting 프로젝트의 Pure Supabase Auth 마이그레이션을 위한 체계적인 테스트 전략을 제시합니다. 안전하고 신뢰할 수 있는 전환을 보장하기 위해 3단계 테스트 프로세스를 제공합니다.

## 🎯 테스트 목표

- **기능 완전성**: 모든 기존 기능의 정상 작동 보장
- **데이터 무결성**: 사용자 데이터 및 추천 관계 무손실 검증
- **보안 강화**: Auth 시스템 보안 취약점 제거
- **성능 개선**: 인증 프로세스 성능 향상 확인

## 📊 테스트 매트릭스

### 🔴 Critical Tests (필수)
- 사용자 인증 플로우 (로그인/로그아웃)
- 역할 기반 접근 제어 (creator/business/admin)
- 3단계 추천 시스템 무결성
- 멀티도메인 라우팅

### 🟡 High Priority Tests (중요)
- OAuth 통합 (Google, Kakao)
- 세션 관리 및 자동 갱신
- RLS 정책 검증
- 데이터베이스 마이그레이션

### 🟢 Medium Priority Tests (권장)
- UI/UX 일관성
- 성능 벤치마킹
- 크로스 브라우저 호환성
- API 응답 시간

## 🏗️ 테스트 아키텍처

### Phase 1: 마이그레이션 전 테스트
```bash
# 현재 시스템 베이스라인 설정
npm run test:baseline
npm run test:e2e:current
npm run benchmark:auth
```

### Phase 2: 마이그레이션 중 테스트
```bash
# 각 단계별 검증
npm run test:migration:step1
npm run test:migration:step2
# ... step8까지
```

### Phase 3: 마이그레이션 후 테스트
```bash
# 완전성 검증
npm run test:supabase:full
npm run test:regression
npm run test:security
```

## 🧪 자동화된 테스트 스위트

### 1. 인증 플로우 테스트

```typescript
// tests/auth/authentication.test.ts
describe('Supabase Auth Flow', () => {
  test('이메일 회원가입 및 로그인', async () => {
    // 회원가입 프로세스 테스트
    const { user } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'securepass123',
      options: {
        data: {
          role: 'creator',
          referral_code: 'TEST123'
        }
      }
    });
    
    expect(user).toBeDefined();
    expect(user?.email).toBe('test@example.com');
    
    // 프로필 생성 확인
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user!.id)
      .single();
    
    expect(profile).toBeDefined();
    expect(profile?.role).toBe('creator');
  });

  test('OAuth 로그인 플로우', async () => {
    // Google OAuth 테스트
    const { data } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3002/auth/callback'
      }
    });
    
    expect(data.url).toContain('google');
  });
});
```

### 2. 권한 및 RLS 테스트

```typescript
// tests/auth/permissions.test.ts
describe('Role-Based Access Control', () => {
  test('크리에이터 권한 테스트', async () => {
    // 크리에이터로 로그인
    const { user } = await signInAsRole('creator');
    
    // 크리에이터 전용 데이터 접근 테스트
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('*');
    
    // 비즈니스 전용 데이터 접근 차단 확인
    const { error } = await supabase
      .from('business_analytics')
      .select('*');
    
    expect(error?.code).toBe('PGRST301'); // Unauthorized
  });

  test('관리자 전체 접근 권한', async () => {
    const { user } = await signInAsRole('admin');
    
    // 관리자는 모든 데이터 접근 가능
    const { data: allUsers } = await supabase
      .from('profiles')
      .select('*');
    
    expect(allUsers).toBeDefined();
    expect(Array.isArray(allUsers)).toBe(true);
  });
});
```

### 3. 추천 시스템 테스트

```typescript
// tests/referral/system.test.ts
describe('3-Tier Referral System', () => {
  test('추천 관계 설정 및 수수료 계산', async () => {
    // 추천인 생성
    const referrer = await createTestUser('referrer@test.com');
    
    // 신규 사용자 추천 코드로 가입
    const newUser = await signUpWithReferral({
      email: 'referred@test.com',
      referralCode: referrer.referral_code
    });
    
    // 추천 관계 확인
    const { data: profile } = await supabase
      .from('profiles')
      .select('referrer_l1_id, referrer_l2_id, referrer_l3_id')
      .eq('id', newUser.id)
      .single();
    
    expect(profile?.referrer_l1_id).toBe(referrer.id);
    
    // 수수료 계산 테스트
    await createTestPayment(newUser.id, 1000);
    
    const { data: earnings } = await supabase
      .from('referral_earnings')
      .select('*')
      .eq('referrer_id', referrer.id);
    
    expect(earnings?.[0]?.amount).toBe(100); // 10%
  });
});
```

## 🚀 성능 벤치마킹

### 인증 성능 목표
- **로그인 응답 시간**: < 500ms
- **JWT 검증**: < 100ms
- **RLS 쿼리**: < 200ms
- **미들웨어 처리**: < 100ms

### 벤치마크 스크립트
```bash
#!/bin/bash
# scripts/benchmark-auth.sh

echo "🚀 Supabase Auth 성능 벤치마크 시작..."

# 로그인 성능 테스트
echo "📊 로그인 성능 측정 (100회 반복)"
npm run benchmark:login

# JWT 검증 성능
echo "🔑 JWT 검증 성능 측정"
npm run benchmark:jwt

# RLS 쿼리 성능
echo "🛡️ RLS 쿼리 성능 측정"
npm run benchmark:rls

# 종합 리포트 생성
echo "📈 성능 리포트 생성 완료"
```

## 🔒 보안 테스트

### 1. JWT 보안 검증
```typescript
// tests/security/jwt.test.ts
describe('JWT Security', () => {
  test('만료된 토큰 처리', async () => {
    const expiredToken = generateExpiredJWT();
    
    const response = await fetch('/api/protected', {
      headers: { Authorization: `Bearer ${expiredToken}` }
    });
    
    expect(response.status).toBe(401);
  });

  test('변조된 토큰 거부', async () => {
    const tamperedToken = tamperedJWT();
    
    const response = await fetch('/api/protected', {
      headers: { Authorization: `Bearer ${tamperedToken}` }
    });
    
    expect(response.status).toBe(401);
  });
});
```

### 2. RLS 정책 검증
```sql
-- tests/security/rls-test.sql
-- 사용자간 데이터 격리 테스트
BEGIN;
  -- 사용자 A로 설정
  SELECT auth.jwt_claim('sub', 'user-a-id');
  
  -- 사용자 A 데이터만 조회되는지 확인
  SELECT COUNT(*) FROM profiles WHERE id != 'user-a-id';
  -- 결과: 0이어야 함
ROLLBACK;
```

## 📱 E2E 테스트 시나리오

### Playwright 테스트 스위트
```typescript
// tests/e2e/auth-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('완전한 인증 플로우', () => {
  test('크리에이터 회원가입부터 대시보드까지', async ({ page }) => {
    // 메인 페이지 접속
    await page.goto('http://localhost:3002');
    
    // 회원가입 페이지로 이동
    await page.click('text=회원가입');
    await page.click('text=크리에이터로 시작하기');
    
    // 이메일 회원가입
    await page.fill('[data-testid=email]', 'test@example.com');
    await page.fill('[data-testid=password]', 'securepass123');
    await page.click('[data-testid=signup-button]');
    
    // 이메일 확인 (테스트 환경에서는 자동 확인)
    await page.waitForURL('**/creator/dashboard');
    
    // 대시보드 로드 확인
    await expect(page.locator('h1')).toContainText('크리에이터 대시보드');
  });

  test('역할별 도메인 접근 제어', async ({ page }) => {
    // 크리에이터로 로그인
    await signInAsCreator(page);
    
    // 비즈니스 도메인 접근 시도
    await page.goto('http://business.localhost:3002/dashboard');
    
    // 크리에이터 도메인으로 리다이렉트 확인
    await expect(page).toHaveURL(/creator\.localhost/);
  });
});
```

## 📈 테스트 리포팅

### 테스트 결과 대시보드
```bash
# 테스트 실행 및 리포트 생성
npm run test:all
npm run test:report

# 커버리지 리포트
npm run test:coverage

# 성능 벤치마크 리포트
npm run benchmark:report
```

### 품질 게이트
- **테스트 커버리지**: 최소 85%
- **E2E 테스트 통과율**: 100%
- **보안 스캔**: 0개 Critical 이슈
- **성능 기준**: 모든 메트릭 목표치 달성

## 🔄 지속적 통합 (CI/CD)

### GitHub Actions 워크플로우
```yaml
# .github/workflows/migration-test.yml
name: Migration Test Suite

on:
  push:
    branches: [migration/supabase-auth]

jobs:
  test-migration:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
      
      - name: Setup Supabase
        run: |
          npm install -g @supabase/cli
          supabase start
          
      - name: Run migration tests
        run: |
          npm run test:migration
          npm run test:e2e
          npm run benchmark:quick
          
      - name: Generate report
        run: npm run test:report
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## 📞 지원 및 문의

### 테스트 관련 문의
- **QA 팀**: 테스트 전략, 자동화
- **개발팀**: 기능 테스트, 통합 테스트
- **DevOps**: 성능 테스트, 모니터링

---

**📅 최종 업데이트**: 2024년 8월 5일  
**✅ 문서 상태**: 작성 완료  
**👥 검토자**: QA팀, 개발팀

> 💡 **중요**: 모든 테스트는 프로덕션 환경 배포 전 반드시 통과해야 합니다.
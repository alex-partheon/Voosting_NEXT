import { test, expect, type Page, type BrowserContext } from '@playwright/test';

/**
 * E2E 인증 플로우 테스트
 * 
 * 현재 Supabase Auth 구현을 기반으로 한 포괄적인 인증 시나리오 테스트
 * 일부 테스트는 현재 구현에서 실패할 것으로 예상되며, 
 * 실제 인증 구현 완료 후 활성화되어야 합니다.
 */

// 테스트용 사용자 계정 정의
const TEST_USERS = {
  creator: {
    email: 'test-creator@voosting.app',
    password: 'TestPassword123!',
    role: 'creator'
  },
  business: {
    email: 'test-business@voosting.app',
    password: 'TestPassword123!',
    role: 'business'
  },
  admin: {
    email: 'test-admin@voosting.app',
    password: 'TestPassword123!',
    role: 'admin'
  }
};

// 테스트 헬퍼 함수들
class AuthTestHelpers {
  constructor(private page: Page) {}

  /**
   * 테스트용 사용자로 로그인
   */
  async signIn(userType: keyof typeof TEST_USERS) {
    const user = TEST_USERS[userType];
    
    // 로그인 페이지로 이동
    await this.page.goto('/sign-in');
    
    // 이메일과 비밀번호 입력
    await this.page.fill('[data-testid="email-input"]', user.email);
    await this.page.fill('[data-testid="password-input"]', user.password);
    
    // 로그인 버튼 클릭
    await this.page.click('[data-testid="sign-in-button"]');
    
    // 로그인 처리 대기 (리다이렉트 또는 대시보드 로딩)
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 새 사용자 회원가입
   */
  async signUp(userType: keyof typeof TEST_USERS) {
    const user = TEST_USERS[userType];
    
    // 회원가입 페이지로 이동
    await this.page.goto('/sign-up');
    
    // 역할 선택
    await this.page.click(`[data-testid="role-${user.role}"]`);
    
    // 이메일과 비밀번호 입력
    await this.page.fill('[data-testid="email-input"]', user.email);
    await this.page.fill('[data-testid="password-input"]', user.password);
    await this.page.fill('[data-testid="confirm-password-input"]', user.password);
    
    // 약관 동의
    await this.page.check('[data-testid="terms-checkbox"]');
    
    // 회원가입 버튼 클릭
    await this.page.click('[data-testid="sign-up-button"]');
    
    // 이메일 인증 대기 또는 가입 완료 처리
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 로그아웃 수행
   */
  async signOut() {
    // 사용자 메뉴 클릭
    await this.page.click('[data-testid="user-menu-button"]');
    
    // 로그아웃 버튼 클릭
    await this.page.click('[data-testid="sign-out-button"]');
    
    // 로그아웃 처리 대기
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 현재 사용자가 인증되었는지 확인
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      // 대시보드 접근 시도
      const response = await this.page.goto('/dashboard');
      
      // 200 OK 응답이면 인증됨
      return response?.status() === 200;
    } catch {
      return false;
    }
  }

  /**
   * 데이터베이스 정리 - 테스트 후 정리용
   */
  async cleanupTestUsers() {
    // 실제 구현에서는 Supabase admin API를 통한 사용자 삭제
    // 현재는 placeholder
    console.log('테스트 사용자 정리 (구현 대기)');
  }
}

test.describe('E2E 인증 플로우 테스트', () => {
  let authHelper: AuthTestHelpers;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthTestHelpers(page);
  });

  test.afterEach(async ({ page }) => {
    // 각 테스트 후 정리
    try {
      await authHelper.signOut();
    } catch {
      // 이미 로그아웃되었거나 로그인되지 않음
    }
  });

  test.describe('1. 전체 로그인 플로우', () => {
    test('홈페이지 → 로그인 버튼 → 로그인 폼 → 크리에이터 대시보드', async ({ page }) => {
      // 1. 홈페이지 접속
      await page.goto('/');
      
      // 홈페이지가 로드되었는지 확인
      await expect(page.locator('h1')).toContainText(/Voosting|부스팅/);
      
      // 2. 로그인 버튼 클릭
      await page.click('[data-testid="header-sign-in-button"]');
      
      // 로그인 페이지로 이동 확인
      await expect(page).toHaveURL('/sign-in');
      
      // 3. 크리에이터 계정으로 로그인
      await authHelper.signIn('creator');
      
      // 4. 크리에이터 대시보드로 리다이렉트 확인
      await expect(page).toHaveURL('http://creator.localhost:3002/dashboard');
      
      // 대시보드 콘텐츠 확인
      await expect(page.locator('h1')).toContainText('크리에이터 대시보드');
    });

    test('비즈니스 계정 로그인 → 비즈니스 대시보드 접근', async ({ page }) => {
      // 1. 로그인 페이지 직접 접속
      await page.goto('/sign-in');
      
      // 2. 비즈니스 계정으로 로그인
      await authHelper.signIn('business');
      
      // 3. 비즈니스 대시보드로 리다이렉트 확인
      await expect(page).toHaveURL('http://business.localhost:3002/dashboard');
      
      // 대시보드 콘텐츠 확인
      await expect(page.locator('h1')).toContainText('비즈니스 대시보드');
    });

    test('관리자 계정 로그인 → 관리자 대시보드 접근', async ({ page }) => {
      // 1. 로그인 페이지 접속
      await page.goto('/sign-in');
      
      // 2. 관리자 계정으로 로그인
      await authHelper.signIn('admin');
      
      // 3. 관리자 대시보드로 리다이렉트 확인
      await expect(page).toHaveURL('http://admin.localhost:3002/dashboard');
      
      // 대시보드 콘텐츠 확인
      await expect(page.locator('h1')).toContainText('관리자 대시보드');
    });
  });

  test.describe('2. 회원가입 플로우', () => {
    test('크리에이터 회원가입 플로우 완주', async ({ page }) => {
      // 1. 홈페이지에서 크리에이터 영역 이동
      await page.goto('/');
      await page.click('[data-testid="creators-nav-link"]');
      
      // 2. 크리에이터 회원가입 버튼 클릭
      await page.click('[data-testid="creator-signup-button"]');
      
      // 3. 회원가입 페이지 확인
      await expect(page).toHaveURL('/sign-up/creator');
      
      // 4. 수익 구조 미리보기 확인
      await expect(page.locator('[data-testid="earnings-preview"]')).toBeVisible();
      await expect(page.locator('[data-testid="referral-info"]')).toContainText('10% / 5% / 2%');
      
      // 5. 회원가입 폼 작성
      const testEmail = `creator-test-${Date.now()}@voosting.app`;
      await page.fill('[data-testid="email-input"]', testEmail);
      await page.fill('[data-testid="password-input"]', 'TestPassword123!');
      await page.fill('[data-testid="confirm-password-input"]', 'TestPassword123!');
      
      // 약관 동의
      await page.check('[data-testid="terms-checkbox"]');
      
      // 6. 회원가입 버튼 클릭
      await page.click('[data-testid="sign-up-button"]');
      
      // 7. 이메일 인증 페이지 또는 환영 메시지 확인
      await expect(page.locator('[data-testid="signup-success"]')).toBeVisible();
    });

    test('비즈니스 회원가입 플로우 완주', async ({ page }) => {
      // 1. 홈페이지에서 비즈니스 영역 이동
      await page.goto('/business');
      
      // 2. 비즈니스 회원가입 버튼 클릭
      await page.click('[data-testid="business-signup-button"]');
      
      // 3. 회원가입 페이지 확인
      await expect(page).toHaveURL('/sign-up/business');
      
      // 4. ROI 성과 강조 섹션 확인
      await expect(page.locator('[data-testid="roi-showcase"]')).toBeVisible();
      
      // 5. 회원가입 폼 작성
      const testEmail = `business-test-${Date.now()}@voosting.app`;
      await page.fill('[data-testid="email-input"]', testEmail);
      await page.fill('[data-testid="password-input"]', 'TestPassword123!');
      await page.fill('[data-testid="confirm-password-input"]', 'TestPassword123!');
      
      // 사업자 정보 입력 (옵션)
      await page.fill('[data-testid="company-name"]', '테스트 회사');
      
      // 약관 동의
      await page.check('[data-testid="terms-checkbox"]');
      
      // 6. 회원가입 버튼 클릭
      await page.click('[data-testid="sign-up-button"]');
      
      // 7. 가입 완료 확인
      await expect(page.locator('[data-testid="signup-success"]')).toBeVisible();
    });

    test.skip('OAuth 로그인 시뮬레이션 - Google', async ({ page }) => {
      // OAuth 로그인은 실제 서비스와 연동이 필요하므로 현재 스킵
      // 추후 Supabase Auth OAuth 설정 완료 후 테스트 활성화
      
      await page.goto('/sign-in');
      
      // Google 로그인 버튼 클릭
      await page.click('[data-testid="google-signin-button"]');
      
      // OAuth 플로우 시뮬레이션 (구현 대기)
      // 1. Google 인증 페이지로 리다이렉트
      // 2. 테스트 계정으로 로그인
      // 3. 콜백 URL로 리다이렉트
      // 4. 프로필 생성 또는 기존 계정 연동
      // 5. 역할에 맞는 대시보드로 이동
    });

    test.skip('OAuth 로그인 시뮬레이션 - GitHub', async ({ page }) => {
      // GitHub OAuth 로그인 테스트 (구현 대기)
      await page.goto('/sign-in');
      
      await page.click('[data-testid="github-signin-button"]');
      
      // GitHub OAuth 플로우 처리
    });
  });

  test.describe('3. 도메인별 접근 시나리오', () => {
    test('크리에이터가 올바른 도메인에서 대시보드 접근', async ({ page }) => {
      // 1. 크리에이터 계정으로 로그인
      await page.goto('/sign-in');
      await authHelper.signIn('creator');
      
      // 2. 크리에이터 도메인에서 대시보드 접근
      await page.goto('http://creator.localhost:3002/dashboard');
      
      // 3. 정상 접근 확인
      await expect(page).toHaveURL('http://creator.localhost:3002/dashboard');
      await expect(page.locator('h1')).toContainText('크리에이터 대시보드');
    });

    test('잘못된 역할로 다른 도메인 접근 시 리다이렉트', async ({ page }) => {
      // 1. 크리에이터 계정으로 로그인
      await page.goto('/sign-in');
      await authHelper.signIn('creator');
      
      // 2. 비즈니스 도메인 접근 시도
      await page.goto('http://business.localhost:3002/dashboard');
      
      // 3. 크리에이터 대시보드로 리다이렉트 확인
      await expect(page).toHaveURL('http://creator.localhost:3002/dashboard');
      
      // 리다이렉트 알림 메시지 확인
      await expect(page.locator('[data-testid="redirect-notice"]')).toContainText('크리에이터 대시보드로 이동했습니다');
    });

    test('관리자만 관리자 도메인 접근 가능', async ({ page }) => {
      // 1. 일반 크리에이터로 로그인
      await page.goto('/sign-in');
      await authHelper.signIn('creator');
      
      // 2. 관리자 도메인 접근 시도
      await page.goto('http://admin.localhost:3002/dashboard');
      
      // 3. 접근 거부 확인 (403 또는 리다이렉트)
      await expect(page.locator('[data-testid="access-denied"]')).toBeVisible();
      
      // 4. 관리자 계정으로 재로그인
      await authHelper.signOut();
      await authHelper.signIn('admin');
      
      // 5. 관리자 도메인 접근 성공
      await page.goto('http://admin.localhost:3002/dashboard');
      await expect(page).toHaveURL('http://admin.localhost:3002/dashboard');
      await expect(page.locator('h1')).toContainText('관리자 대시보드');
    });

    test('보호된 경로에 인증 없이 접근 시 로그인 페이지로 리다이렉트', async ({ page }) => {
      // 1. 인증 없이 크리에이터 대시보드 접근
      await page.goto('http://creator.localhost:3002/dashboard');
      
      // 2. 로그인 페이지로 리다이렉트 확인
      await expect(page).toHaveURL(/\/sign-in.*redirect=/);
      
      // 3. 리다이렉트 파라미터에 원래 URL 포함 확인
      const url = new URL(page.url());
      expect(url.searchParams.get('redirect')).toBe('/creator/dashboard');
    });

    test('로그인 후 원래 접근하려던 페이지로 리다이렉트', async ({ page }) => {
      // 1. 인증 없이 특정 페이지 접근 (예: 캠페인 목록)
      await page.goto('http://creator.localhost:3002/campaigns');
      
      // 2. 로그인 페이지로 리다이렉트 확인
      await expect(page).toHaveURL(/\/sign-in.*redirect=%2Fcreator%2Fcampaigns/);
      
      // 3. 로그인 수행
      await authHelper.signIn('creator');
      
      // 4. 원래 페이지로 리다이렉트 확인
      await expect(page).toHaveURL('http://creator.localhost:3002/campaigns');
    });
  });

  test.describe('4. 세션 관리', () => {
    test('로그인 유지 상태 확인 - 새 탭에서도 인증 유지', async ({ context, page }) => {
      // 1. 첫 번째 탭에서 로그인
      await page.goto('/sign-in');
      await authHelper.signIn('creator');
      
      // 2. 새 탭 열기
      const newPage = await context.newPage();
      
      // 3. 새 탭에서 보호된 페이지 접근
      await newPage.goto('http://creator.localhost:3002/dashboard');
      
      // 4. 인증이 유지되는지 확인
      await expect(newPage).toHaveURL('http://creator.localhost:3002/dashboard');
      await expect(newPage.locator('h1')).toContainText('크리에이터 대시보드');
      
      await newPage.close();
    });

    test('로그아웃 후 보호된 경로 접근 차단', async ({ page }) => {
      // 1. 로그인
      await page.goto('/sign-in');
      await authHelper.signIn('creator');
      
      // 2. 대시보드 접근 확인
      await page.goto('http://creator.localhost:3002/dashboard');
      await expect(page.locator('h1')).toContainText('크리에이터 대시보드');
      
      // 3. 로그아웃
      await authHelper.signOut();
      
      // 4. 보호된 페이지 재접근 시도
      await page.goto('http://creator.localhost:3002/dashboard');
      
      // 5. 로그인 페이지로 리다이렉트 확인
      await expect(page).toHaveURL(/\/sign-in/);
    });

    test.skip('세션 만료 시 재인증 요구', async ({ page }) => {
      // 세션 만료 시뮬레이션은 복잡하므로 현재 스킵
      // 추후 Supabase Auth JWT 토큰 만료 처리 구현 후 테스트
      
      // 1. 로그인
      await authHelper.signIn('creator');
      
      // 2. 세션 강제 만료 (쿠키 삭제 또는 시간 조작)
      await page.evaluate(() => {
        localStorage.clear();
        document.cookie.split(";").forEach(c => {
          const eqPos = c.indexOf("=");
          const name = eqPos > -1 ? c.substr(0, eqPos) : c;
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        });
      });
      
      // 3. API 호출 또는 페이지 새로고침
      await page.reload();
      
      // 4. 재인증 요구 확인
      await expect(page).toHaveURL(/\/sign-in/);
    });

    test('브라우저 재시작 후 세션 유지 확인', async ({ browser }) => {
      // 1. 새 브라우저 컨텍스트로 로그인
      const context1 = await browser.newContext();
      const page1 = await context1.newPage();
      const helper1 = new AuthTestHelpers(page1);
      
      await page1.goto('/sign-in');
      await helper1.signIn('creator');
      
      await expect(page1).toHaveURL('http://creator.localhost:3002/dashboard');
      
      // 2. 첫 번째 컨텍스트 종료 (브라우저 재시작 시뮬레이션)
      await context1.close();
      
      // 3. 새 컨텍스트에서 세션 확인
      const context2 = await browser.newContext();
      const page2 = await context2.newPage();
      
      await page2.goto('http://creator.localhost:3002/dashboard');
      
      // 4. 세션이 유지되지 않음을 확인 (정상 동작)
      await expect(page2).toHaveURL(/\/sign-in/);
      
      await context2.close();
    });
  });

  test.describe('5. 에러 시나리오', () => {
    test('잘못된 이메일/비밀번호로 로그인 시도', async ({ page }) => {
      await page.goto('/sign-in');
      
      // 존재하지 않는 이메일로 로그인 시도
      await page.fill('[data-testid="email-input"]', 'nonexistent@voosting.app');
      await page.fill('[data-testid="password-input"]', 'WrongPassword123!');
      await page.click('[data-testid="sign-in-button"]');
      
      // 에러 메시지 확인
      await expect(page.locator('[data-testid="auth-error"]')).toContainText('이메일 또는 비밀번호가 올바르지 않습니다');
      
      // 로그인 페이지에 머물러 있는지 확인
      await expect(page).toHaveURL('/sign-in');
    });

    test('이미 존재하는 이메일로 회원가입 시도', async ({ page }) => {
      await page.goto('/sign-up');
      
      // 이미 존재하는 이메일로 가입 시도
      await page.click('[data-testid="role-creator"]');
      await page.fill('[data-testid="email-input"]', TEST_USERS.creator.email);
      await page.fill('[data-testid="password-input"]', 'NewPassword123!');
      await page.fill('[data-testid="confirm-password-input"]', 'NewPassword123!');
      await page.check('[data-testid="terms-checkbox"]');
      
      await page.click('[data-testid="sign-up-button"]');
      
      // 중복 계정 에러 메시지 확인
      await expect(page.locator('[data-testid="signup-error"]')).toContainText('이미 가입된 이메일입니다');
    });

    test('비밀번호 확인 불일치 시 회원가입 차단', async ({ page }) => {
      await page.goto('/sign-up');
      
      await page.click('[data-testid="role-creator"]');
      await page.fill('[data-testid="email-input"]', 'new-user@voosting.app');
      await page.fill('[data-testid="password-input"]', 'Password123!');
      await page.fill('[data-testid="confirm-password-input"]', 'DifferentPassword123!');
      
      // 비밀번호 불일치 에러 확인
      await expect(page.locator('[data-testid="password-mismatch-error"]')).toContainText('비밀번호가 일치하지 않습니다');
      
      // 회원가입 버튼이 비활성화되어야 함
      await expect(page.locator('[data-testid="sign-up-button"]')).toBeDisabled();
    });

    test.skip('네트워크 오류 시 에러 메시지 표시', async ({ page }) => {
      // 네트워크 차단 시뮬레이션
      await page.route('**/auth/**', route => route.abort());
      
      await page.goto('/sign-in');
      
      await page.fill('[data-testid="email-input"]', TEST_USERS.creator.email);
      await page.fill('[data-testid="password-input"]', TEST_USERS.creator.password);
      await page.click('[data-testid="sign-in-button"]');
      
      // 네트워크 에러 메시지 확인
      await expect(page.locator('[data-testid="network-error"]')).toContainText('네트워크 연결을 확인해주세요');
    });

    test('미승인 계정 접근 시도 (이메일 미인증)', async ({ page }) => {
      // 이메일 미인증 상태의 계정으로 로그인 시도
      const unverifiedEmail = 'unverified@voosting.app';
      
      await page.goto('/sign-in');
      await page.fill('[data-testid="email-input"]', unverifiedEmail);
      await page.fill('[data-testid="password-input"]', 'TestPassword123!');
      await page.click('[data-testid="sign-in-button"]');
      
      // 이메일 인증 요구 메시지 확인
      await expect(page.locator('[data-testid="email-verification-required"]')).toContainText('이메일 인증이 필요합니다');
      
      // 인증 이메일 재발송 옵션 확인
      await expect(page.locator('[data-testid="resend-verification"]')).toBeVisible();
    });

    test('계정 잠김 시나리오 - 연속 로그인 실패', async ({ page }) => {
      await page.goto('/sign-in');
      
      // 5회 연속 로그인 실패
      for (let i = 0; i < 5; i++) {
        await page.fill('[data-testid="email-input"]', TEST_USERS.creator.email);
        await page.fill('[data-testid="password-input"]', 'WrongPassword123!');
        await page.click('[data-testid="sign-in-button"]');
        
        // 에러 메시지 대기
        await page.waitForSelector('[data-testid="auth-error"]', { timeout: 3000 });
      }
      
      // 계정 잠김 메시지 확인
      await expect(page.locator('[data-testid="account-locked"]')).toContainText('계정이 일시적으로 잠겼습니다');
      
      // 로그인 버튼 비활성화 확인
      await expect(page.locator('[data-testid="sign-in-button"]')).toBeDisabled();
    });
  });

  test.describe('6. 성능 및 UX 테스트', () => {
    test('로그인 처리 시간 측정', async ({ page }) => {
      await page.goto('/sign-in');
      
      const startTime = Date.now();
      
      await page.fill('[data-testid="email-input"]', TEST_USERS.creator.email);
      await page.fill('[data-testid="password-input"]', TEST_USERS.creator.password);
      await page.click('[data-testid="sign-in-button"]');
      
      // 대시보드 로딩 완료까지 대기
      await page.waitForURL(/dashboard/);
      
      const endTime = Date.now();
      const loginTime = endTime - startTime;
      
      // 로그인 처리가 3초 이내에 완료되어야 함
      expect(loginTime).toBeLessThan(3000);
      
      console.log(`로그인 처리 시간: ${loginTime}ms`);
    });

    test('로딩 상태 및 사용자 피드백 확인', async ({ page }) => {
      await page.goto('/sign-in');
      
      await page.fill('[data-testid="email-input"]', TEST_USERS.creator.email);
      await page.fill('[data-testid="password-input"]', TEST_USERS.creator.password);
      
      // 로그인 버튼 클릭
      await page.click('[data-testid="sign-in-button"]');
      
      // 로딩 상태 확인
      await expect(page.locator('[data-testid="sign-in-loading"]')).toBeVisible();
      
      // 버튼 비활성화 확인
      await expect(page.locator('[data-testid="sign-in-button"]')).toBeDisabled();
      
      // 로딩 완료까지 대기
      await page.waitForURL(/dashboard/);
      
      // 로딩 상태가 사라졌는지 확인
      await expect(page.locator('[data-testid="sign-in-loading"]')).not.toBeVisible();
    });

    test('모바일 환경에서 인증 플로우', async ({ page }) => {
      // 모바일 뷰포트 설정
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/sign-in');
      
      // 모바일에서 폼이 정상 표시되는지 확인
      await expect(page.locator('[data-testid="sign-in-form"]')).toBeVisible();
      
      // 입력 필드가 터치하기 적절한 크기인지 확인
      const emailInput = page.locator('[data-testid="email-input"]');
      const inputBounds = await emailInput.boundingBox();
      
      // 터치 대상 최소 크기 (44px) 확인
      expect(inputBounds?.height).toBeGreaterThanOrEqual(44);
      
      // 로그인 수행
      await authHelper.signIn('creator');
      
      // 모바일에서도 정상 리다이렉트 확인
      await expect(page).toHaveURL(/dashboard/);
    });
  });
});

// 테스트 데이터 정리를 위한 글로벌 설정
test.afterAll(async () => {
  // 모든 테스트 완료 후 테스트 데이터 정리
  console.log('테스트 완료 - 테스트 데이터 정리 필요');
  
  // 실제 구현에서는 다음과 같은 정리 작업 수행:
  // 1. 테스트용 사용자 계정 삭제
  // 2. 테스트 중 생성된 데이터 삭제
  // 3. 데이터베이스 상태 복원
});
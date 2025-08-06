import { test, expect } from '@playwright/test';

test.describe('Hydration Error Fixes', () => {
  test('pricing page should not have button nesting hydration errors', async ({ page }) => {
    // Console error 감지
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Pricing 페이지 방문
    await page.goto('/pricing');
    
    // 페이지 로딩 완료 대기
    await page.waitForLoadState('networkidle');
    
    // 요금 계산기 버튼이 존재하는지 확인 (button nesting 수정 확인)
    const calculatorButton = page.getByText('요금 계산기');
    await expect(calculatorButton).toBeVisible();
    
    // Button nesting hydration 에러 체크
    const hydrationErrors = consoleErrors.filter(error => 
      error.includes('button') && 
      (error.includes('descendant') || error.includes('hydration') || error.includes('nested'))
    );
    
    // 콘솔에 hydration 에러가 없어야 함
    expect(hydrationErrors).toHaveLength(0);
  });

  test('contact page should not have button nesting hydration errors', async ({ page }) => {
    // Console error 감지
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Contact 페이지 방문
    await page.goto('/contact');
    
    // 페이지 로딩 완료 대기
    await page.waitForLoadState('networkidle');
    
    // 문의 보내기 버튼이 존재하는지 확인 (MagneticButton as="div" 확인)
    const submitButton = page.getByText('문의 보내기');
    await expect(submitButton).toBeVisible();
    
    // Button nesting hydration 에러 체크
    const hydrationErrors = consoleErrors.filter(error => 
      error.includes('button') && 
      (error.includes('descendant') || error.includes('hydration') || error.includes('nested'))
    );
    
    // 콘솔에 hydration 에러가 없어야 함
    expect(hydrationErrors).toHaveLength(0);
  });

  test('MagneticButton components should render correctly', async ({ page }) => {
    // Pricing 페이지에서 MagneticButton이 올바르게 렌더링되는지 확인
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
    
    // 요금 계산기 버튼이 클릭 가능한지 확인
    const calculatorButton = page.getByText('요금 계산기');
    await expect(calculatorButton).toBeEnabled();
    
    // 마우스 호버 시 정상 동작하는지 확인
    await calculatorButton.hover();
    await expect(calculatorButton).toBeVisible();
  });
});
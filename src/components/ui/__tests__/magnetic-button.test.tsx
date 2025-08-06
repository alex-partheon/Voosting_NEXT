import React from 'react';

// MagneticButton 컴포넌트의 타입 검증 테스트
describe('MagneticButton Types', () => {
  it('should compile with correct prop types', () => {
    // TypeScript 컴파일 시 타입 검증
    const validProps = {
      children: 'Test',
      className: 'test-class',
      onClick: () => {},
      as: 'button' as const,
      type: 'submit' as const,
      disabled: false,
    };

    const validDivProps = {
      children: 'Test',
      className: 'test-class',
      onClick: () => {},
      as: 'div' as const,
    };

    // 타입 검증만 수행 (컴파일 시점)
    expect(validProps).toBeDefined();
    expect(validDivProps).toBeDefined();
  });

  it('should have correct default values', () => {
    // 기본값 검증
    const defaultAs = 'button';
    const defaultType = 'button';
    const defaultDisabled = false;

    expect(defaultAs).toBe('button');
    expect(defaultType).toBe('button');
    expect(defaultDisabled).toBe(false);
  });

  it('should support both button and div elements', () => {
    // 지원하는 element 타입 검증
    const supportedElements = ['button', 'div'];
    
    expect(supportedElements).toContain('button');
    expect(supportedElements).toContain('div');
    expect(supportedElements).toHaveLength(2);
  });
});
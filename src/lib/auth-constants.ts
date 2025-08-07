/**
 * Authentication and Authorization Constants
 * 인증 및 권한 관련 상수 정의
 */

// ============================================================================
// 인증 경로 상수
// ============================================================================
export const AUTH_ROUTES = {
  SIGN_IN: '/auth/sign-in',
  SIGN_UP: '/auth/sign-up',
  CALLBACK: '/auth/callback',
  SIGN_OUT: '/auth/sign-out',
  ERROR: '/auth/error',
} as const;

export const DASHBOARD_ROUTES = {
  DEFAULT: '/dashboard',
  CREATOR: '/dashboard', // 통합 대시보드 사용
  BUSINESS: '/dashboard', // 통합 대시보드 사용
  ADMIN: '/admin/dashboard',
} as const;

// ============================================================================
// 리다이렉트 파라미터 상수
// ============================================================================
export const REDIRECT_PARAM = 'redirectTo';
export const ERROR_PARAM = 'error';
export const MESSAGE_PARAM = 'message';

// ============================================================================
// 사용자 역할 상수
// ============================================================================
export const USER_ROLES = {
  CREATOR: 'creator',
  BUSINESS: 'business',
  ADMIN: 'admin',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// ============================================================================
// 도메인 타입 상수
// ============================================================================
export const DOMAIN_TYPES = {
  MAIN: 'main',
  CREATOR: 'creator',
  BUSINESS: 'business',
  ADMIN: 'admin',
} as const;

export type DomainType = (typeof DOMAIN_TYPES)[keyof typeof DOMAIN_TYPES];

// ============================================================================
// 보호된 경로 목록
// ============================================================================
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/settings',
  '/creator/dashboard',
  '/creator/campaigns',
  '/creator/earnings',
  '/creator/pages',
  '/business/dashboard',
  '/business/campaigns',
  '/business/creators',
  '/business/analytics',
  '/admin/dashboard',
  '/admin/users',
  '/admin/analytics',
  '/admin/settings',
] as const;

// ============================================================================
// 공개 경로 목록
// ============================================================================
export const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/pricing',
  '/features',
  '/contact',
  '/blog',
  '/creators',
  '/creators/service',
  '/creators/calculator',
  '/business',
  '/business/service',
  '/service',
  '/terms',
  '/privacy',
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth/callback',
  '/auth/error',
] as const;

// ============================================================================
// 역할별 접근 가능 경로
// ============================================================================
export const ROLE_BASED_ROUTES: Record<UserRole, string[]> = {
  [USER_ROLES.CREATOR]: [
    '/dashboard',
    '/creator/dashboard',
    '/creator/campaigns',
    '/creator/earnings',
    '/creator/pages',
    '/profile',
    '/settings',
  ],
  [USER_ROLES.BUSINESS]: [
    '/dashboard',
    '/business/dashboard',
    '/business/campaigns',
    '/business/creators',
    '/business/analytics',
    '/profile',
    '/settings',
  ],
  [USER_ROLES.ADMIN]: [
    '/dashboard',
    '/admin/dashboard',
    '/admin/users',
    '/admin/analytics',
    '/admin/settings',
    '/profile',
    '/settings',
    // Admin can access all routes
    ...PROTECTED_ROUTES,
  ],
};

// ============================================================================
// 도메인별 기본 경로
// ============================================================================
export const DOMAIN_DEFAULT_ROUTES: Record<DomainType, string> = {
  [DOMAIN_TYPES.MAIN]: '/',
  [DOMAIN_TYPES.CREATOR]: '/creator/dashboard',
  [DOMAIN_TYPES.BUSINESS]: '/business/dashboard',
  [DOMAIN_TYPES.ADMIN]: '/admin/dashboard',
};

// ============================================================================
// 유틸리티 함수들
// ============================================================================

/**
 * 보호된 경로인지 확인
 * @param pathname - 확인할 경로
 * @returns 보호된 경로 여부
 */
export function isProtectedRoute(pathname: string): boolean {
  if (!pathname) return false;
  
  // 정확한 매칭 확인
  if (PROTECTED_ROUTES.includes(pathname as any)) {
    return true;
  }
  
  // 하위 경로 확인 (예: /dashboard/settings)
  return PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route + '/') || pathname === route
  );
}

/**
 * 공개 경로인지 확인
 * @param pathname - 확인할 경로
 * @returns 공개 경로 여부
 */
export function isPublicRoute(pathname: string): boolean {
  if (!pathname) return true;
  
  // 정확한 매칭 확인
  if (PUBLIC_ROUTES.includes(pathname as any)) {
    return true;
  }
  
  // 정적 파일 및 API 경로는 항상 공개
  if (pathname.startsWith('/_next/') || 
      pathname.startsWith('/api/') ||
      pathname.startsWith('/static/')) {
    return true;
  }
  
  return false;
}

/**
 * 역할별 기본 리다이렉트 경로 가져오기
 * @param role - 사용자 역할
 * @returns 리다이렉트 경로
 */
export function getRoleBasedRedirect(role: UserRole | null | undefined): string {
  // admin 역할만 별도 대시보드, 나머지는 통합 대시보드 사용
  if (role === USER_ROLES.ADMIN) {
    return DASHBOARD_ROUTES.ADMIN;
  }
  
  return DASHBOARD_ROUTES.DEFAULT;
}

/**
 * 사용자가 특정 경로에 접근 가능한지 확인
 * @param role - 사용자 역할
 * @param pathname - 확인할 경로
 * @returns 접근 가능 여부
 */
export function canAccessRoute(role: UserRole | null | undefined, pathname: string): boolean {
  if (!role || !pathname) return false;
  
  // Admin은 모든 경로 접근 가능
  if (role === USER_ROLES.ADMIN) {
    return true;
  }
  
  const allowedRoutes = ROLE_BASED_ROUTES[role];
  if (!allowedRoutes) return false;
  
  // 정확한 매칭 또는 하위 경로 확인
  return allowedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
}

/**
 * 리다이렉트 URL 보안 검증
 * @param url - 검증할 URL
 * @returns 안전한 URL 여부
 */
export function validateRedirectUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  
  try {
    // 상대 경로인 경우
    if (url.startsWith('/')) {
      // 이중 슬래시 방지 (//evil.com 공격 방지)
      if (url.startsWith('//')) {
        return false;
      }
      
      // 특수 문자 체크
      const suspiciousPatterns = [
        /javascript:/i,
        /data:/i,
        /vbscript:/i,
        /file:/i,
        /<script/i,
        /on\w+=/i,
      ];
      
      return !suspiciousPatterns.some(pattern => pattern.test(url));
    }
    
    // 절대 URL인 경우
    const parsedUrl = new URL(url);
    
    // 허용된 프로토콜만
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false;
    }
    
    // 허용된 도메인 체크 (프로덕션에서는 환경 변수로 관리)
    const allowedHosts = [
      'localhost:3002',
      'voosting.app',
      'www.voosting.app',
      'creator.voosting.app',
      'business.voosting.app',
      'admin.voosting.app',
    ];
    
    // 개발 환경에서는 localhost 허용
    if (process.env.NODE_ENV === 'development') {
      allowedHosts.push('localhost:3000', 'localhost:3001', '127.0.0.1:3002');
    }
    
    return allowedHosts.some(host => 
      parsedUrl.host === host || parsedUrl.host.endsWith('.' + host)
    );
  } catch {
    // URL 파싱 실패 시 안전하지 않은 것으로 간주
    return false;
  }
}

/**
 * XSS 방지를 위한 URL 정리
 * @param url - 정리할 URL
 * @returns 안전한 URL 또는 기본값
 */
export function sanitizeRedirectUrl(url: string | null | undefined): string {
  if (!url) {
    return DASHBOARD_ROUTES.DEFAULT;
  }
  
  // 보안 검증 실패 시 기본 대시보드로
  if (!validateRedirectUrl(url)) {
    return DASHBOARD_ROUTES.DEFAULT;
  }
  
  // 상대 경로인 경우 그대로 반환
  if (url.startsWith('/')) {
    // 쿼리 파라미터와 해시 제거 (XSS 방지)
    const cleanPath = url.split('?')[0].split('#')[0];
    
    // 경로 정규화
    const normalizedPath = cleanPath
      .split('/')
      .filter(Boolean)
      .join('/');
    
    return '/' + normalizedPath;
  }
  
  try {
    // 절대 URL인 경우 경로만 추출
    const parsedUrl = new URL(url);
    return sanitizeRedirectUrl(parsedUrl.pathname);
  } catch {
    return DASHBOARD_ROUTES.DEFAULT;
  }
}

/**
 * 도메인 타입에 따른 역할 매칭 확인
 * @param domainType - 도메인 타입
 * @param role - 사용자 역할
 * @returns 매칭 여부
 */
export function isDomainRoleMatch(domainType: DomainType, role: UserRole | null | undefined): boolean {
  if (!role) return false;
  
  // Admin은 모든 도메인 접근 가능
  if (role === USER_ROLES.ADMIN) {
    return true;
  }
  
  switch (domainType) {
    case DOMAIN_TYPES.CREATOR:
      return role === USER_ROLES.CREATOR;
    case DOMAIN_TYPES.BUSINESS:
      return role === USER_ROLES.BUSINESS;
    case DOMAIN_TYPES.ADMIN:
      return role === USER_ROLES.ADMIN;
    case DOMAIN_TYPES.MAIN:
      return true; // 메인 도메인은 모든 역할 접근 가능
    default:
      return false;
  }
}

/**
 * 인증 에러 메시지 매핑
 */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'access_denied': '접근이 거부되었습니다.',
  'invalid_request': '잘못된 요청입니다.',
  'unauthorized_client': '인증되지 않은 클라이언트입니다.',
  'unsupported_response_type': '지원하지 않는 응답 타입입니다.',
  'server_error': '서버 오류가 발생했습니다.',
  'temporarily_unavailable': '일시적으로 서비스를 사용할 수 없습니다.',
  'invalid_credentials': '잘못된 인증 정보입니다.',
  'email_not_confirmed': '이메일 인증이 필요합니다.',
  'user_not_found': '사용자를 찾을 수 없습니다.',
  'session_expired': '세션이 만료되었습니다. 다시 로그인해주세요.',
  'role_mismatch': '해당 페이지에 접근 권한이 없습니다.',
  'default': '인증 중 오류가 발생했습니다.',
};

/**
 * 에러 코드에 따른 메시지 가져오기
 * @param errorCode - 에러 코드
 * @returns 에러 메시지
 */
export function getAuthErrorMessage(errorCode: string | null | undefined): string {
  if (!errorCode) {
    return AUTH_ERROR_MESSAGES.default;
  }
  
  return AUTH_ERROR_MESSAGES[errorCode] || AUTH_ERROR_MESSAGES.default;
}

// ============================================================================
// 세션 관련 상수
// ============================================================================
export const SESSION_CONFIG = {
  // 세션 만료 시간 (밀리초)
  SESSION_DURATION: 7 * 24 * 60 * 60 * 1000, // 7일
  
  // 세션 갱신 간격 (밀리초)
  REFRESH_INTERVAL: 4 * 60 * 60 * 1000, // 4시간
  
  // 세션 갱신 전 남은 시간 (밀리초)
  REFRESH_THRESHOLD: 1 * 60 * 60 * 1000, // 1시간
  
  // 쿠키 설정
  COOKIE_NAME: 'voosting-auth-token',
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  },
} as const;

// ============================================================================
// Type Exports
// ============================================================================
export type AuthRoute = (typeof AUTH_ROUTES)[keyof typeof AUTH_ROUTES];
export type DashboardRoute = (typeof DASHBOARD_ROUTES)[keyof typeof DASHBOARD_ROUTES];
export type ProtectedRoute = (typeof PROTECTED_ROUTES)[number];
export type PublicRoute = (typeof PUBLIC_ROUTES)[number];
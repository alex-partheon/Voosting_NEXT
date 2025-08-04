/**
 * 미들웨어 유틸리티 함수
 * 도메인 감지, URL 리라이팅 등의 기능 제공
 */

/**
 * 도메인 타입 정의
 */
export type DomainType = 'main' | 'creator' | 'business' | 'admin';

/**
 * 유효한 도메인 타입 목록
 */
const VALID_DOMAIN_TYPES: readonly DomainType[] = ['main', 'creator', 'business', 'admin'] as const;

/**
 * 도메인별 접두사 매핑
 */
const DOMAIN_PREFIXES: Record<DomainType, string> = {
  main: '',
  creator: '/creator',
  business: '/business',
  admin: '/admin',
} as const;

/**
 * 리라이팅하지 않을 경로 패턴
 */
const EXCLUDED_PATHS = ['/auth/', '/api/', '/_next/', '/favicon', '/public/'] as const;

/**
 * 호스트네임에서 도메인 타입을 감지
 * @param hostname - 호스트네임 (예: creator.voosting.app, localhost:3002)
 * @returns 도메인 타입
 */
export function getDomainType(hostname: string): DomainType {
  if (!hostname) return 'main';

  const lowerHost = hostname.toLowerCase();

  if (lowerHost.includes('creator.')) return 'creator';
  if (lowerHost.includes('business.')) return 'business';
  if (lowerHost.includes('admin.')) return 'admin';

  return 'main';
}

/**
 * 호스트에서 포트를 제거하고 도메인만 추출
 * @param host - 호스트 문자열 (포트 포함 가능)
 * @returns 도메인 문자열
 */
export function getDomainFromHost(host: string | null | undefined): string {
  if (!host) return '';

  // 포트 번호 제거
  return host.split(':')[0] || '';
}

/**
 * 유효한 도메인 타입인지 확인
 * @param domain - 확인할 도메인 타입
 * @returns 유효 여부
 */
export function isValidDomain(domain: unknown): domain is DomainType {
  return VALID_DOMAIN_TYPES.includes(domain as DomainType);
}

/**
 * 도메인에 따른 URL 리라이팅
 * @param pathname - 원본 경로
 * @param domainType - 도메인 타입
 * @param baseUrl - 기본 URL (쿼리 파라미터 파싱용)
 * @returns 리라이팅된 경로
 */
export function rewriteUrlForDomain(
  pathname: string,
  domainType: DomainType,
  _baseUrl: string,
): string {
  // 빈 경로 처리
  if (!pathname || pathname === '') {
    return domainType === 'main' ? '/' : `${DOMAIN_PREFIXES[domainType]}/dashboard`;
  }

  // 이중 슬래시 정리
  const cleanPath = pathname.replace(/\/+/g, '/');

  // URL 파싱하여 쿼리 파라미터와 해시 분리
  let path = cleanPath;
  let query = '';
  let hash = '';

  // 쿼리 파라미터 분리
  const queryIndex = path.indexOf('?');
  if (queryIndex !== -1) {
    query = path.substring(queryIndex);
    path = path.substring(0, queryIndex);
  }

  // 해시 분리
  const hashIndex = path.indexOf('#');
  if (hashIndex !== -1) {
    hash = path.substring(hashIndex);
    path = path.substring(0, hashIndex);
  }

  // 메인 도메인은 리라이팅하지 않음
  if (domainType === 'main') {
    return `${path}${query}${hash}`;
  }

  // 제외 경로 확인
  const shouldExclude = EXCLUDED_PATHS.some((excluded) => path.startsWith(excluded));
  if (shouldExclude) {
    return `${path}${query}${hash}`;
  }

  // 이미 해당 도메인 접두사로 시작하는 경우 그대로 반환
  const prefix = DOMAIN_PREFIXES[domainType];
  if (path.startsWith(prefix)) {
    return `${path}${query}${hash}`;
  }

  // 루트 경로 또는 /dashboard 처리
  if (path === '/' || path === '/dashboard') {
    return `${prefix}/dashboard${query}${hash}`;
  }

  // 일반 경로 리라이팅
  const rewrittenPath = `${prefix}${path}`;
  return `${rewrittenPath}${query}${hash}`;
}

/**
 * 도메인 타입과 사용자 역할이 일치하는지 확인
 * @param domainType - 도메인 타입
 * @param userRole - 사용자 역할
 * @returns 일치 여부
 */
export function isDomainRoleMatch(domainType: DomainType, userRole: string): boolean {
  // 관리자는 모든 도메인 접근 가능
  if (userRole === 'admin') return true;

  // 메인 도메인은 모든 사용자 접근 가능
  if (domainType === 'main') return true;

  // 도메인과 역할이 일치해야 함
  return domainType === userRole;
}

/**
 * 도메인별 기본 리다이렉트 경로 반환
 * @param domainType - 도메인 타입
 * @returns 리다이렉트 경로
 */
export function getDefaultRedirectPath(domainType: DomainType): string {
  if (domainType === 'main') return '/';
  return `${DOMAIN_PREFIXES[domainType]}/dashboard`;
}

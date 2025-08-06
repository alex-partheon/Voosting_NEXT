import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';
import {
  getDomainType,
  rewriteUrlForDomain,
  isDomainRoleMatch,
  getDefaultRedirectPath,
  getDomainFromHost,
} from '@/lib/middleware-utils';

/**
 * 보호된 경로 정의
 */
const protectedRoutes = {
  // 인증이 필요한 경로
  auth: [
    '/dashboard',
    '/profile',
    '/campaigns/create',
    '/campaigns/manage',
    '/applications',
    '/earnings',
    '/settings',
  ],

  // 크리에이터 전용 경로
  creator: [
    '/creator',
    '/creator/dashboard',
    '/creator/campaigns',
    '/creator/applications',
    '/creator/earnings',
  ],

  // 비즈니스 전용 경로
  business: [
    '/business',
    '/business/dashboard',
    '/business/campaigns',
    '/business/creators',
    '/business/analytics',
  ],

  // 관리자 전용 경로
  admin: [
    '/admin',
    '/admin/dashboard',
    '/admin/users',
    '/admin/campaigns',
    '/admin/analytics',
    '/admin/settings',
  ],
};

/**
 * 공개 경로 (인증 없이 접근 가능)
 */
const publicRoutes = [
  '/',
  '/about',
  '/contact',
  '/pricing',
  '/service',
  '/creators',
  '/creators/service',
  '/creators/calculator',
  '/sign-in',
  '/sign-up',
  '/auth/callback',
  '/auth/confirm',
];

/**
 * 공개 경로인지 확인하는 함수
 */
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => {
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}

/**
 * 경로가 보호된 경로인지 확인
 */
function isProtectedRoute(pathname: string): boolean {
  return Object.values(protectedRoutes)
    .flat()
    .some((route) => pathname.startsWith(route));
}

/**
 * 사용자 역할에 따른 접근 권한 확인
 */
function hasRouteAccess(pathname: string, userRole: string): boolean {
  // 관리자는 모든 경로에 접근 가능
  if (userRole === 'admin') {
    return true;
  }

  // 크리에이터 전용 경로 확인
  if (protectedRoutes.creator.some((route) => pathname.startsWith(route))) {
    return userRole === 'creator';
  }

  // 비즈니스 전용 경로 확인
  if (protectedRoutes.business.some((route) => pathname.startsWith(route))) {
    return userRole === 'business';
  }

  // 관리자 전용 경로 확인
  if (protectedRoutes.admin.some((route) => pathname.startsWith(route))) {
    return userRole === 'admin';
  }

  // 일반 보호된 경로는 모든 인증된 사용자가 접근 가능
  return true;
}

/**
 * 역할별 기본 대시보드 경로 반환
 */
function getDefaultDashboard(userRole: string): string {
  switch (userRole) {
    case 'creator':
      return '/creator/dashboard';
    case 'business':
      return '/business/dashboard';
    case 'admin':
      return '/admin/dashboard';
    default:
      return '/dashboard';
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hostname = req.headers.get('host') || '';
  
  // 정적 파일과 API 경로는 처리하지 않음
  if (pathname.startsWith('/_next') || pathname.includes('.') || pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }

  // Supabase 클라이언트 생성
  const response = NextResponse.next();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  try {
    // 도메인 타입 감지
    const domain = getDomainFromHost(hostname);
    const domainType = getDomainType(domain);

    // URL 리라이팅 적용
    const rewrittenPath = rewriteUrlForDomain(pathname, domainType, req.url);

    // 경로가 변경된 경우 새 URL 생성
    const url = req.nextUrl.clone();
    if (rewrittenPath !== pathname) {
      const [pathOnly, ...rest] = rewrittenPath.split(/[?#]/);
      url.pathname = pathOnly;

      const existingParams = url.searchParams.toString();
      if (existingParams && rest.length > 0) {
        const rewrittenQuery = rest.find((part) => part.includes('='));
        if (rewrittenQuery) {
          const params = new URLSearchParams(rewrittenQuery);
          params.forEach((value, key) => {
            url.searchParams.set(key, value);
          });
        }
      }
    }

    // 공개 경로 처리
    if (isPublicRoute(url.pathname)) {
      // 이미 로그인한 사용자가 로그인 페이지에 접근하면 대시보드로 리다이렉트
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (user && (url.pathname === '/sign-in' || url.pathname === '/sign-up')) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          const userRole = profile?.role || 'creator';

          // 도메인과 역할이 일치하는지 확인
          if (isDomainRoleMatch(domainType, userRole)) {
            const dashboardUrl = getDefaultDashboard(userRole);
            return NextResponse.redirect(new URL(dashboardUrl, req.url));
          } else {
            // 역할에 맞는 도메인으로 리다이렉트
            const redirectPath = getDefaultRedirectPath(userRole);
            return NextResponse.redirect(new URL(redirectPath, req.url));
          }
        } catch (error) {
          console.error('Error fetching user profile for redirect:', error);
        }
      }

      // 경로가 변경된 경우 리라이트
      if (rewrittenPath !== pathname) {
        return NextResponse.rewrite(url);
      }

      return response;
    }

    // 보호된 경로에 대한 인증 확인
    if (isProtectedRoute(url.pathname)) {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (!user) {
        // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
        const redirectUrl = new URL('/sign-in', req.url);
        redirectUrl.searchParams.set('redirect_url', rewrittenPath);
        return NextResponse.redirect(redirectUrl);
      }

      try {
        // 사용자 프로필 및 역할 확인
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError || !profile) {
          console.error('Error fetching user profile:', profileError);
          const redirectUrl = new URL('/sign-in', req.url);
          return NextResponse.redirect(redirectUrl);
        }

        // 도메인과 사용자 역할 일치 확인
        if (!isDomainRoleMatch(domainType, profile.role)) {
          // 사용자의 역할에 맞는 도메인으로 리다이렉트
          const correctPath = getDefaultRedirectPath(profile.role);
          return NextResponse.redirect(new URL(correctPath, req.url));
        }

        // 역할별 접근 권한 확인
        if (!hasRouteAccess(url.pathname, profile.role)) {
          // 권한이 없는 경우 해당 역할의 기본 대시보드로 리다이렉트
          const dashboardUrl = getDefaultDashboard(profile.role);
          return NextResponse.redirect(new URL(dashboardUrl, req.url));
        }
      } catch (error) {
        console.error('Error in protected route handling:', error);
        const redirectUrl = new URL('/sign-in', req.url);
        return NextResponse.redirect(redirectUrl);
      }
    }

    // 경로가 변경된 경우 리라이트
    if (rewrittenPath !== pathname) {
      return NextResponse.rewrite(url);
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);

    // 오류 발생 시 공개 경로가 아니면 로그인 페이지로 리다이렉트
    if (!isPublicRoute(pathname)) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    return response;
  }
}

/**
 * 미들웨어가 실행될 경로 설정
 */
export const config = {
  matcher: [
    /*
     * 다음 경로를 제외한 모든 요청에 대해 미들웨어 실행:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - 파일 확장자가 있는 경로 (정적 파일)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
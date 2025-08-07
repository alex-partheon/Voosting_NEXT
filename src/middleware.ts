import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';
import {
  getDomainType,
  rewriteUrlForDomain,
  getDomainFromHost,
} from '@/lib/middleware-utils';
import {
  AUTH_ROUTES,
  DASHBOARD_ROUTES,
  REDIRECT_PARAM,
  USER_ROLES,
  isProtectedRoute,
  isPublicRoute,
  isDomainRoleMatch,
  getRoleBasedRedirect,
  validateRedirectUrl,
  sanitizeRedirectUrl,
} from '@/lib/auth-constants';

/**
 * 사용자 역할에 따른 접근 권한 확인
 */
function hasRouteAccess(pathname: string, userRole: string): boolean {
  // 관리자는 모든 경로에 접근 가능
  if (userRole === USER_ROLES.ADMIN) {
    return true;
  }

  // 관리자 전용 경로 확인
  if (pathname.startsWith('/admin')) {
    return userRole === USER_ROLES.ADMIN;
  }

  // 통합 대시보드는 모든 인증된 사용자가 접근 가능
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    return true;
  }

  // 프로필 및 설정은 모든 인증된 사용자가 접근 가능
  if (pathname.startsWith('/profile') || pathname.startsWith('/settings')) {
    return true;
  }

  // 레거시 경로들 (creator/*, business/*) - 통합 대시보드로 리다이렉트
  if (pathname.startsWith('/creator/') || pathname.startsWith('/business/')) {
    return true; // 일단 접근 허용 후 리다이렉트 처리
  }

  // 기타 보호된 경로는 모든 인증된 사용자가 접근 가능
  return true;
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && (url.pathname === AUTH_ROUTES.SIGN_IN || url.pathname.startsWith(AUTH_ROUTES.SIGN_UP))) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          const userRole = profile?.role || USER_ROLES.CREATOR;

          // 도메인과 역할이 일치하는지 확인
          if (isDomainRoleMatch(domainType, userRole)) {
            const dashboardUrl = getRoleBasedRedirect(userRole);
            return NextResponse.redirect(new URL(dashboardUrl, req.url));
          } else {
            // 역할에 맞는 도메인으로 리다이렉트
            const redirectPath = getRoleBasedRedirect(userRole);
            return NextResponse.redirect(new URL(redirectPath, req.url));
          }
        } catch (error) {
          console.error('Error fetching user profile for redirect:', error);
          // 데이터베이스 오류 시 기본 대시보드로 리다이렉트
          return NextResponse.redirect(new URL(DASHBOARD_ROUTES.DEFAULT, req.url));
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
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      // 세션 만료 또는 인증 오류 처리
      if (authError) {
        console.error('Authentication error:', authError);
        const redirectUrl = new URL(AUTH_ROUTES.SIGN_IN, req.url);
        
        // 안전한 리다이렉트 URL 설정
        const safeRedirectPath = sanitizeRedirectUrl(rewrittenPath);
        if (validateRedirectUrl(safeRedirectPath)) {
          redirectUrl.searchParams.set(REDIRECT_PARAM, safeRedirectPath);
        }
        
        return NextResponse.redirect(redirectUrl);
      }
      
      if (!user) {
        // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
        const redirectUrl = new URL(AUTH_ROUTES.SIGN_IN, req.url);
        
        // 안전한 리다이렉트 URL 설정
        const safeRedirectPath = sanitizeRedirectUrl(rewrittenPath);
        if (validateRedirectUrl(safeRedirectPath)) {
          redirectUrl.searchParams.set(REDIRECT_PARAM, safeRedirectPath);
        }
        
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
          
          // 프로필이 없는 경우 프로필 생성 페이지로 리다이렉트 (필요시)
          // 또는 기본 역할로 처리
          const redirectUrl = new URL(AUTH_ROUTES.SIGN_IN, req.url);
          redirectUrl.searchParams.set('error', 'profile_not_found');
          return NextResponse.redirect(redirectUrl);
        }

        // 도메인과 사용자 역할 일치 확인
        if (!isDomainRoleMatch(domainType, profile.role)) {
          // 사용자의 역할에 맞는 도메인으로 리다이렉트
          const correctPath = getRoleBasedRedirect(profile.role);
          return NextResponse.redirect(new URL(correctPath, req.url));
        }

        // 레거시 대시보드 경로 리다이렉트 처리
        if (url.pathname.startsWith('/creator/dashboard') || url.pathname.startsWith('/business/dashboard')) {
          // 통합 대시보드로 리다이렉트
          console.log('[Middleware] Redirecting legacy dashboard path to unified dashboard');
          return NextResponse.redirect(new URL(DASHBOARD_ROUTES.DEFAULT, req.url));
        }

        // 역할별 접근 권한 확인
        if (!hasRouteAccess(url.pathname, profile.role)) {
          // 권한이 없는 경우 해당 역할의 기본 대시보드로 리다이렉트
          const dashboardUrl = getRoleBasedRedirect(profile.role);
          return NextResponse.redirect(new URL(dashboardUrl, req.url));
        }
      } catch (error) {
        console.error('Error in protected route handling:', error);
        
        // 데이터베이스 오류 시 안전한 폴백
        const redirectUrl = new URL(AUTH_ROUTES.SIGN_IN, req.url);
        redirectUrl.searchParams.set('error', 'database_error');
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
      const redirectUrl = new URL(AUTH_ROUTES.SIGN_IN, req.url);
      redirectUrl.searchParams.set('error', 'middleware_error');
      return NextResponse.redirect(redirectUrl);
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
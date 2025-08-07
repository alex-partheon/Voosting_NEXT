import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { 
  AUTH_ROUTES, 
  REDIRECT_PARAM, 
  ERROR_PARAM,
  getRoleBasedRedirect,
  sanitizeRedirectUrl,
  validateRedirectUrl,
  getAuthErrorMessage,
  USER_ROLES
} from '@/lib/auth-constants';

/**
 * Generate a unique referral code for a user
 * @param userId - User ID
 * @returns Unique referral code
 */
function generateReferralCode(userId: string): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 6);
  const userPart = userId.substring(0, 4);
  return `${userPart}${timestamp}${randomPart}`.toUpperCase().substring(0, 10);
}

/**
 * Supabase Auth 콜백 핸들러
 * OAuth 로그인 후 리다이렉트 처리 및 프로필 자동 생성
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const error_description = searchParams.get('error_description');
  
  // 통합된 리다이렉트 파라미터 사용 (next → redirectTo)
  const redirectTo = searchParams.get(REDIRECT_PARAM) || searchParams.get('next');

  // 에러가 있는 경우 로그인 페이지로 리다이렉트
  if (error) {
    console.error('[Auth Callback] OAuth error:', { error, error_description });
    const errorMessage = getAuthErrorMessage(error) || error_description || error;
    
    return NextResponse.redirect(
      `${origin}${AUTH_ROUTES.SIGN_IN}?${ERROR_PARAM}=${encodeURIComponent(errorMessage)}`
    );
  }

  if (!code) {
    console.warn('[Auth Callback] No authorization code received');
    return NextResponse.redirect(
      `${origin}${AUTH_ROUTES.SIGN_IN}?${ERROR_PARAM}=${encodeURIComponent('인증 코드가 없습니다.')}`
    );
  }

  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  try {
    // 인증 코드를 세션으로 교환
    const { data: authData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('[Auth Callback] Code exchange error:', exchangeError);
      const errorMessage = getAuthErrorMessage(exchangeError.message) || exchangeError.message;
      
      return NextResponse.redirect(
        `${origin}${AUTH_ROUTES.SIGN_IN}?${ERROR_PARAM}=${encodeURIComponent(errorMessage)}`
      );
    }

    if (!authData.user) {
      console.error('[Auth Callback] No user data after code exchange');
      return NextResponse.redirect(
        `${origin}${AUTH_ROUTES.SIGN_IN}?${ERROR_PARAM}=${encodeURIComponent('사용자 정보를 가져올 수 없습니다.')}`
      );
    }

    const user = authData.user;
    console.log('[Auth Callback] Authentication successful for user:', user.id);

    // 사용자 프로필 확인 및 자동 생성
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, referral_code')
      .eq('id', user.id)
      .single();

    // 프로필이 없는 경우 자동 생성 (OAuth 첫 로그인)
    if (profileError || !profile) {
      console.log('[Auth Callback] Creating new profile for OAuth user:', user.id);
      
      // OAuth 제공자로부터 역할 힌트 가져오기 (예: user_metadata)
      const roleHint = user.user_metadata?.role;
      const defaultRole = roleHint && Object.values(USER_ROLES).includes(roleHint) 
        ? roleHint as keyof typeof USER_ROLES
        : USER_ROLES.CREATOR; // 기본값: creator

      const newProfile = {
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        role: defaultRole,
        referral_code: generateReferralCode(user.id),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select('id, role, referral_code')
        .single();

      if (createError) {
        console.error('[Auth Callback] Profile creation error:', createError);
        
        // 프로필 생성 실패해도 로그인은 성공했으므로 기본 대시보드로 이동
        // (추후 프로필 설정 페이지로 유도 가능)
        const fallbackPath = sanitizeRedirectUrl(redirectTo);
        return NextResponse.redirect(`${origin}${fallbackPath}`);
      }

      profile = createdProfile;
      console.log('[Auth Callback] Profile created successfully:', profile.id);
    }

    // 리다이렉트 URL 검증 및 정리
    let finalRedirectPath: string;
    
    if (redirectTo && validateRedirectUrl(redirectTo)) {
      // 사용자가 지정한 리다이렉트 URL 사용 (보안 검증 통과)
      finalRedirectPath = sanitizeRedirectUrl(redirectTo);
    } else {
      // 역할 기반 기본 리다이렉트 (admin만 별도, 나머지는 통합 대시보드)
      finalRedirectPath = getRoleBasedRedirect(profile?.role || null);
    }

    console.log('[Auth Callback] Redirecting to:', finalRedirectPath);
    return NextResponse.redirect(`${origin}${finalRedirectPath}`);

  } catch (error) {
    console.error('[Auth Callback] Unexpected error:', error);
    
    // 예상치 못한 오류 발생 시 안전한 폴백
    const errorMessage = error instanceof Error ? error.message : '인증 처리 중 오류가 발생했습니다.';
    
    return NextResponse.redirect(
      `${origin}${AUTH_ROUTES.SIGN_IN}?${ERROR_PARAM}=${encodeURIComponent(errorMessage)}`
    );
  }
}
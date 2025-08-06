import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Supabase Auth 콜백 핸들러
 * OAuth 로그인 후 리다이렉트 처리
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';
  const error = searchParams.get('error');
  const error_description = searchParams.get('error_description');

  // 에러가 있는 경우 로그인 페이지로 리다이렉트
  if (error) {
    console.error('Auth callback error:', error, error_description);
    return NextResponse.redirect(
      `${origin}/auth/sign-in?error=${encodeURIComponent(error_description || error)}`
    );
  }

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);

    try {
      // 인증 코드를 세션으로 교환
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('Code exchange error:', exchangeError);
        return NextResponse.redirect(
          `${origin}/auth/sign-in?error=${encodeURIComponent(exchangeError.message)}`
        );
      }

      if (data.user) {
        console.log('Auth callback success for user:', data.user.id);
        
        // 사용자 프로필 확인
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        // 역할에 따른 리다이렉트
        let redirectPath = next;
        if (profile?.role) {
          switch (profile.role) {
            case 'creator':
              redirectPath = '/creator/dashboard';
              break;
            case 'business':
              redirectPath = '/business/dashboard';
              break;
            case 'admin':
              redirectPath = '/admin/dashboard';
              break;
            default:
              redirectPath = '/dashboard';
          }
        }

        return NextResponse.redirect(`${origin}${redirectPath}`);
      }
    } catch (error) {
      console.error('Auth callback unexpected error:', error);
      return NextResponse.redirect(
        `${origin}/auth/sign-in?error=${encodeURIComponent('인증 처리 중 오류가 발생했습니다.')}`
      );
    }
  }

  // 코드가 없는 경우 로그인 페이지로 리다이렉트
  return NextResponse.redirect(`${origin}/auth/sign-in`);
}
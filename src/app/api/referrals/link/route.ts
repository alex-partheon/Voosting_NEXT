import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

/**
 * 추천 링크 생성 API
 * GET /api/referrals/link
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const baseUrl =
    searchParams.get('baseUrl') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  try {
    const supabase = await createServerClient();
    
    // Supabase Auth로 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // 사용자 프로필에서 추천 코드 조회
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('referral_code')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (!profile.referral_code) {
      return NextResponse.json({ error: 'Referral code not found' }, { status: 404 });
    }

    // 추천 링크 생성
    const referralLink = `${baseUrl}/auth/register?ref=${profile.referral_code}`;

    return NextResponse.json({
      referralCode: profile.referral_code,
      referralLink,
      shareText: `Voosting에 함께 참여하세요! 내 추천 링크: ${referralLink}`,
    });
  } catch (error) {
    console.error('Error generating referral link:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

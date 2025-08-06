import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

/**
 * 추천 코드 검증
 * GET /api/referrals/validate?code=REFERRAL_CODE
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const referralCode = searchParams.get('code');

  try {
    const supabase = await createServerClient();
    if (!referralCode) {
      return NextResponse.json({ error: 'Referral code is required' }, { status: 400 });
    }

    // 추천 코드로 사용자 찾기
    const { data: referrer, error: referrerError } = await supabase
      .from('profiles')
      .select(
        `
        id,
        full_name,
        avatar_url,
        role,
        referral_code,
        created_at
      `,
      )
      .eq('referral_code', referralCode)
      .single();

    if (referrerError || !referrer) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Invalid referral code',
        },
        { status: 404 },
      );
    }

    // 추천인의 추천 통계 조회
    const { data: referralStats, error: _statsError } = await supabase
      .from('profiles')
      .select('id')
      .eq('referrer_l1_id', referrer.id);

    const referralCount = referralStats?.length || 0;

    return NextResponse.json({
      valid: true,
      referrer: {
        id: referrer.id,
        fullName: referrer.full_name,
        avatarUrl: referrer.avatar_url,
        role: referrer.role,
        referralCode: referrer.referral_code,
        memberSince: referrer.created_at,
        totalReferrals: referralCount,
      },
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/referrals/validate:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

/**
 * 추천 관계 설정
 * POST /api/referrals/validate
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    // Supabase Auth로 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // 요청 본문 파싱
    const { referralCode } = await request.json();

    if (!referralCode) {
      return NextResponse.json({ error: 'Referral code is required' }, { status: 400 });
    }

    // 현재 사용자 프로필 확인
    const { data: currentProfile, error: profileError } = await supabase
      .from('profiles')
      .select('referrer_l1_id, referrer_l2_id, referrer_l3_id')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching current profile:', profileError);
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
    }

    // 이미 추천 관계가 설정되어 있는지 확인
    if (currentProfile.referrer_l1_id) {
      return NextResponse.json({ error: 'Referral relationship already exists' }, { status: 400 });
    }

    // 추천 코드로 추천인 찾기
    const { data: referrer, error: referrerError } = await supabase
      .from('profiles')
      .select('id, referrer_l1_id, referrer_l2_id, full_name')
      .eq('referral_code', referralCode)
      .single();

    if (referrerError || !referrer) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
    }

    // 자기 자신을 추천할 수 없음
    if (referrer.id === userId) {
      return NextResponse.json({ error: 'Cannot refer yourself' }, { status: 400 });
    }

    // 3단계 추천 관계 설정
    const updateData: {
      referrer_l1_id: string;
      referrer_l2_id?: string | null;
      referrer_l3_id?: string | null;
      updated_at: string;
    } = {
      referrer_l1_id: referrer.id,
      updated_at: new Date().toISOString(),
    };

    // 2단계 추천인이 있다면 설정
    if (referrer.referrer_l1_id) {
      updateData.referrer_l2_id = referrer.referrer_l1_id;
    }

    // 3단계 추천인이 있다면 설정
    if (referrer.referrer_l2_id) {
      updateData.referrer_l3_id = referrer.referrer_l2_id;
    }

    // 추천 관계 업데이트
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating referral relationship:', updateError);
      return NextResponse.json({ error: 'Failed to set referral relationship' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Referral relationship set successfully',
      referrer: {
        name: referrer.full_name,
        id: referrer.id,
      },
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Unexpected error in POST /api/referrals/validate:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

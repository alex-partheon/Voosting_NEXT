import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Supabase 클라이언트 (데이터베이스 전용)
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

/**
 * 사용자의 추천 정보 조회
 * GET /api/referrals
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'referred' | 'earnings' | 'stats'

  try {
    // Clerk로 현재 사용자 확인
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    switch (type) {
      case 'referred': {
        // 내가 추천한 사용자들 조회
        const { data: referredUsers, error: referredError } = await supabase
          .from('profiles')
          .select(
            `
            id,
            full_name,
            email,
            avatar_url,
            role,
            created_at,
            referrer_l1_id,
            referrer_l2_id,
            referrer_l3_id
          `,
          )
          .or(`referrer_l1_id.eq.${userId},referrer_l2_id.eq.${userId},referrer_l3_id.eq.${userId}`)
          .order('created_at', { ascending: false });

        if (referredError) {
          console.error('Error fetching referred users:', referredError);
          return NextResponse.json({ error: 'Failed to fetch referred users' }, { status: 500 });
        }

        // 레벨별로 분류
        const referralData = {
          level1: referredUsers?.filter((user) => user.referrer_l1_id === user.id) || [],
          level2: referredUsers?.filter((user) => user.referrer_l2_id === user.id) || [],
          level3: referredUsers?.filter((user) => user.referrer_l3_id === user.id) || [],
        };

        return NextResponse.json({ referrals: referralData });
      }

      case 'earnings': {
        // 추천 수익 조회
        const { data: earnings, error: earningsError } = await supabase
          .from('referral_earnings')
          .select(
            `
            *,
            referred:referred_id(full_name, email, avatar_url)
          `,
          )
          .eq('referrer_id', userId)
          .order('created_at', { ascending: false });

        if (earningsError) {
          console.error('Error fetching referral earnings:', earningsError);
          return NextResponse.json({ error: 'Failed to fetch referral earnings' }, { status: 500 });
        }

        return NextResponse.json({ earnings });
      }

      case 'stats': {
        // 추천 통계 조회
        const [referredCountResult, earningsStatsResult] = await Promise.all([
          // 추천한 사용자 수 (레벨별)
          supabase
            .from('profiles')
            .select('referrer_l1_id, referrer_l2_id, referrer_l3_id')
            .or(
              `referrer_l1_id.eq.${userId},referrer_l2_id.eq.${userId},referrer_l3_id.eq.${userId}`,
            ),

          // 수익 통계
          supabase
            .from('referral_earnings')
            .select('level, amount, status')
            .eq('referrer_id', userId),
        ]);

        if (referredCountResult.error || earningsStatsResult.error) {
          console.error('Error fetching referral stats:', {
            referredError: referredCountResult.error,
            earningsError: earningsStatsResult.error,
          });
          return NextResponse.json(
            { error: 'Failed to fetch referral statistics' },
            { status: 500 },
          );
        }

        const referredUsers = referredCountResult.data || [];
        const earnings = earningsStatsResult.data || [];

        const stats = {
          totalReferred: referredUsers.length,
          level1Count: referredUsers.filter((u) => u.referrer_l1_id === userId).length,
          level2Count: referredUsers.filter((u) => u.referrer_l2_id === userId).length,
          level3Count: referredUsers.filter((u) => u.referrer_l3_id === userId).length,

          totalEarnings: earnings.reduce((sum, e) => sum + e.amount, 0),
          paidEarnings: earnings
            .filter((e) => e.status === 'paid')
            .reduce((sum, e) => sum + e.amount, 0),
          pendingEarnings: earnings
            .filter((e) => e.status === 'pending')
            .reduce((sum, e) => sum + e.amount, 0),

          earningsByLevel: {
            level1: earnings.filter((e) => e.level === 1).reduce((sum, e) => sum + e.amount, 0),
            level2: earnings.filter((e) => e.level === 2).reduce((sum, e) => sum + e.amount, 0),
            level3: earnings.filter((e) => e.level === 3).reduce((sum, e) => sum + e.amount, 0),
          },
        };

        return NextResponse.json({ stats });
      }

      default: {
        // 기본: 사용자의 추천 코드와 기본 정보 반환
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('referral_code, full_name')
          .eq('id', userId)
          .single();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
        }

        return NextResponse.json({
          referralCode: profile.referral_code,
          referralUrl: `${process.env.NEXT_PUBLIC_SITE_URL}?ref=${profile.referral_code}`,
        });
      }
    }
  } catch (error) {
    console.error('Unexpected error in GET /api/referrals:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

/**
 * 추천 수익 생성 (시스템 내부 사용)
 * POST /api/referrals
 */
export async function POST(request: NextRequest) {
  try {
    // Clerk로 현재 사용자 확인 (관리자 또는 시스템 권한 필요)
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 관리자 권한 확인
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // 요청 본문 파싱
    const { referrerId, referredId, level, commissionRate, amount, campaignId, paymentId } =
      await request.json();

    // 필수 필드 검증
    if (!referrerId || !referredId || !level || !commissionRate || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 추천 수익 생성
    const { data: earning, error: earningError } = await supabase
      .from('referral_earnings')
      .insert({
        referrer_id: referrerId,
        referred_id: referredId,
        level,
        commission_rate: commissionRate,
        amount,
        campaign_id: campaignId,
        payment_id: paymentId,
        status: 'pending',
      })
      .select()
      .single();

    if (earningError) {
      console.error('Error creating referral earning:', earningError);
      return NextResponse.json({ error: 'Failed to create referral earning' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Referral earning created successfully',
      earning,
    });
  } catch (error) {
    console.error('Unexpected error in POST /api/referrals:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

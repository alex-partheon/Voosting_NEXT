import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';

type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

/**
 * 현재 사용자 프로필 조회
 * GET /api/profile
 */
export async function GET() {
  try {
    const supabase = await createServerClient();
    
    // Supabase Auth로 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 사용자 프로필 조회
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(
        `
        *,
        referrer_l1:referrer_l1_id(id, full_name, referral_code),
        referrer_l2:referrer_l2_id(id, full_name, referral_code),
        referrer_l3:referrer_l3_id(id, full_name, referral_code)
      `,
      )
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Unexpected error in GET /api/profile:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

/**
 * 사용자 프로필 업데이트
 * PUT /api/profile
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    // Supabase Auth로 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // 요청 본문 파싱
    const body = await request.json();

    // 업데이트 가능한 필드만 추출
    const allowedFields: (keyof ProfileUpdate)[] = [
      'full_name',
      'avatar_url',
      'phone',
      'bio',
      'website',
      'social_links',
      'creator_category',
      'follower_count',
      'engagement_rate',
      'company_name',
      'business_registration',
    ];

    const updateData: ProfileUpdate = {
      updated_at: new Date().toISOString(),
    };

    // 허용된 필드만 업데이트 데이터에 포함
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    // 프로필 업데이트
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Unexpected error in PUT /api/profile:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

/**
 * 사용자 역할 변경 (관리자 전용)
 * PATCH /api/profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    // Supabase Auth로 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // 관리자 권한 확인
    const { data: currentProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || currentProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // 요청 본문 파싱
    const { userId: targetUserId, role } = await request.json();

    if (!targetUserId || !role) {
      return NextResponse.json({ error: 'User ID and role are required' }, { status: 400 });
    }

    // 유효한 역할인지 확인
    const validRoles = ['creator', 'business', 'admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // 사용자 역할 업데이트
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        role,
        updated_at: new Date().toISOString(),
      })
      .eq('id', targetUserId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user role:', updateError);
      return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'User role updated successfully',
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Unexpected error in PATCH /api/profile:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

/**
 * Supabase Auth 테스트 계정 생성 스크립트
 * Admin API를 사용하여 테스트 사용자를 생성합니다.
 * 
 * 실행 방법: node scripts/create-test-users.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase Admin 클라이언트 생성
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// 테스트 계정 정보
const testAccounts = [
  {
    email: 'creator1@test.com',
    password: 'testPassword123!',
    full_name: '크리에이터 1호',
    role: 'creator',
    referral_code: 'CREATOR1'
  },
  {
    email: 'creator2@test.com',
    password: 'testPassword123!',
    full_name: '크리에이터 2호',
    role: 'creator',
    referrer_email: 'creator1@test.com'
  },
  {
    email: 'creator3@test.com',
    password: 'testPassword123!',
    full_name: '크리에이터 3호',
    role: 'creator',
    referrer_email: 'creator2@test.com'
  },
  {
    email: 'business1@test.com',
    password: 'testPassword123!',
    full_name: '비즈니스 1호',
    role: 'business',
    company_name: '테스트 광고주 A'
  },
  {
    email: 'business2@test.com',
    password: 'testPassword123!',
    full_name: '비즈니스 2호',
    role: 'business',
    company_name: '테스트 광고주 B'
  },
  {
    email: 'admin@test.com',
    password: 'testPassword123!',
    full_name: '플랫폼 관리자',
    role: 'admin'
  }
];

// 추천 코드 생성 함수
function generateReferralCode(userId) {
  const cleanId = userId.replace(/-/g, '').toUpperCase();
  return `VT${cleanId.substring(0, 6)}`;
}

// 사용자 생성 함수
async function createUser(userData) {
  try {
    console.log(`\n🔄 ${userData.email} 계정 생성 중...`);

    // 1. Auth 사용자 생성
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // 이메일 확인 건너뛰기
      user_metadata: {
        full_name: userData.full_name
      }
    });

    if (authError) {
      console.error(`❌ Auth 사용자 생성 실패:`, authError.message);
      return null;
    }

    console.log(`✅ Auth 사용자 생성 완료: ${authData.user.id}`);

    // 2. 프로필 데이터 준비
    const profileData = {
      id: authData.user.id,
      email: userData.email,
      full_name: userData.full_name,
      role: userData.role,
      referral_code: userData.referral_code || generateReferralCode(authData.user.id),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 비즈니스 계정인 경우 추가 정보
    if (userData.role === 'business' && userData.company_name) {
      profileData.company_name = userData.company_name;
      profileData.business_registration_number = `BR-${Date.now()}`;
    }

    // 3. 추천인 정보 설정
    if (userData.referrer_email) {
      // 추천인 찾기
      const { data: referrer } = await supabaseAdmin
        .from('profiles')
        .select('id, referrer_l1_id, referrer_l2_id')
        .eq('email', userData.referrer_email)
        .single();

      if (referrer) {
        profileData.referrer_l1_id = referrer.id;
        profileData.referrer_l2_id = referrer.referrer_l1_id;
        profileData.referrer_l3_id = referrer.referrer_l2_id;
        console.log(`🔗 추천 관계 설정: ${userData.referrer_email} → ${userData.email}`);
      }
    }

    // 4. 프로필 생성
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(profileData)
      .select()
      .single();

    if (profileError) {
      console.error(`❌ 프로필 생성 실패:`, profileError.message);
      return null;
    }

    console.log(`✅ 프로필 생성 완료`);
    return profile;

  } catch (error) {
    console.error(`❌ 오류 발생:`, error.message);
    return null;
  }
}

// 메인 실행 함수
async function main() {
  console.log('🚀 Supabase 테스트 계정 생성 시작...\n');
  console.log(`URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);

  // 기존 테스트 계정 확인
  const { data: existingProfiles } = await supabaseAdmin
    .from('profiles')
    .select('email')
    .in('email', testAccounts.map(a => a.email));

  if (existingProfiles && existingProfiles.length > 0) {
    console.log('\n⚠️  이미 존재하는 테스트 계정:');
    existingProfiles.forEach(p => console.log(`  - ${p.email}`));
  }

  // 순차적으로 계정 생성 (추천 관계 때문에)
  for (const account of testAccounts) {
    await createUser(account);
  }

  // 최종 확인
  console.log('\n\n📊 생성된 계정 확인...');
  const { data: profiles, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .in('email', testAccounts.map(a => a.email))
    .order('created_at');

  if (error) {
    console.error('프로필 조회 오류:', error);
    return;
  }

  console.log('\n✅ 생성된 테스트 계정 목록:\n');
  console.table(profiles.map(p => ({
    이메일: p.email,
    이름: p.full_name,
    역할: p.role,
    추천코드: p.referral_code,
    추천인: p.referrer_l1_id ? '있음' : '없음'
  })));

  console.log('\n🎉 테스트 계정 생성 완료!');
  console.log('공통 비밀번호: testPassword123!');
}

// 스크립트 실행
main().catch(console.error);
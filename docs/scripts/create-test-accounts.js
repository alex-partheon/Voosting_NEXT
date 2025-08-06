#!/usr/bin/env node

/**
 * Voosting 플랫폼 테스트 계정 생성 스크립트
 * 
 * 이 스크립트는 개발 및 QA를 위한 체계적인 테스트 계정을 생성합니다.
 * - Supabase Auth API를 통한 계정 생성
 * - Supabase에 프로필 데이터 생성  
 * - 3단계 추천 체인 구성 (10% → 5% → 2%)
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// 환경 변수 검증
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  process.exit(1);
}

// Supabase Admin 클라이언트 초기화 (서비스 역할로 사용자 생성 가능)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// 테스트 계정 설정
const TEST_ACCOUNTS = [
  {
    email: 'creator1@test.com',
    password: 'testPassword123!',
    role: 'creator',
    fullName: '크리에이터 1호',
    referralCode: 'CREATOR1',
    description: 'L1 추천인 - 추천 체인의 시작점'
  },
  {
    email: 'creator2@test.com', 
    password: 'testPassword123!',
    role: 'creator',
    fullName: '크리에이터 2호',
    referredBy: 'CREATOR1', // creator1의 추천 코드
    description: 'L2 추천인 - creator1의 추천으로 가입'
  },
  {
    email: 'creator3@test.com',
    password: 'testPassword123!', 
    role: 'creator',
    fullName: '크리에이터 3호',
    referredBy: 'creator2@test.com', // creator2의 이메일로 조회 후 추천 코드 찾기
    description: 'L3 추천받은 사용자 - creator2의 추천으로 가입'
  },
  {
    email: 'business1@test.com',
    password: 'testPassword123!',
    role: 'business', 
    fullName: '비즈니스 1호',
    companyName: '테스트 광고주 A',
    description: '활성 캠페인 보유자'
  },
  {
    email: 'business2@test.com',
    password: 'testPassword123!',
    role: 'business',
    fullName: '비즈니스 2호', 
    companyName: '테스트 광고주 B',
    description: '신규 가입자'
  },
  {
    email: 'admin@test.com',
    password: 'testPassword123!',
    role: 'admin',
    fullName: '플랫폼 관리자',
    description: '플랫폼 전체 관리 권한'
  }
];

/**
 * 추천 코드로 추천인 정보 조회
 */
async function getReferrerInfo(referralCode) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, referrer_l1_id, referrer_l2_id, referral_code')
    .eq('referral_code', referralCode.toUpperCase())
    .single();

  if (error) {
    console.warn(`⚠️ 추천 코드 '${referralCode}' 조회 실패:`, error.message);
    return null;
  }

  return data;
}

/**
 * 이메일로 사용자의 추천 코드 조회
 */
async function getReferralCodeByEmail(email) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, referral_code, referrer_l1_id, referrer_l2_id')
    .eq('email', email)
    .single();

  if (error) {
    console.warn(`⚠️ 이메일 '${email}'의 추천 코드 조회 실패:`, error.message);
    return null;
  }

  return data;
}

/**
 * 고유한 추천 코드 생성
 */
async function generateUniqueReferralCode(baseCode = null) {
  if (baseCode) {
    // 기본 코드가 제공된 경우 중복 확인
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('referral_code', baseCode.toUpperCase())
      .single();
    
    if (!data) {
      return baseCode.toUpperCase();
    }
  }

  // 랜덤 코드 생성
  let attempts = 0;
  while (attempts < 10) {
    const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('referral_code', randomCode)
      .single();
    
    if (!data) {
      return randomCode;
    }
    attempts++;
  }

  throw new Error('고유한 추천 코드 생성에 실패했습니다.');
}

/**
 * Supabase Auth Admin SDK를 사용한 계정 생성
 */
async function createSupabaseAuthAccount(accountInfo) {
  try {
    console.log(`📧 Supabase Auth 계정 생성 중: ${accountInfo.email}`);
    
    // Admin SDK를 사용한 사용자 생성
    const { data, error } = await supabase.auth.admin.createUser({
      email: accountInfo.email,
      password: accountInfo.password,
      email_confirm: true, // 이메일 자동 확인
      user_metadata: {
        full_name: accountInfo.fullName,
        display_name: accountInfo.fullName, // 트리거에서 사용
        role: accountInfo.role,
        referred_by: accountInfo.referredBy || null
      }
    });

    if (error) {
      // 이미 존재하는 사용자인 경우
      if (error.message?.includes('already registered') || error.message?.includes('User already registered')) {
        console.log(`ℹ️ 이미 존재하는 계정: ${accountInfo.email}`);
        
        // 기존 사용자 조회
        const { data: existingUser, error: listError } = await supabase.auth.admin.listUsers();
        if (!listError && existingUser?.users) {
          const foundUser = existingUser.users.find(u => u.email === accountInfo.email);
          if (foundUser) {
            return foundUser.id;
          }
        }
      }
      
      throw error;
    }

    console.log(`✅ Supabase Auth 계정 생성 완료: ${data.user.id}`);
    return data.user.id;
  } catch (error) {
    console.error(`❌ Supabase Auth 계정 생성 오류:`, {
      email: accountInfo.email,
      message: error.message,
      details: error
    });
    
    throw error;
  }
}

/**
 * 데이터베이스 트리거가 생성한 프로필 확인 및 업데이트
 */
async function createSupabaseProfile(supabaseAuthId, accountInfo) {
  try {
    console.log(`📋 Supabase 프로필 확인 및 업데이트 중: ${accountInfo.email}`);
    console.log(`   Supabase Auth ID: ${supabaseAuthId}`);

    // 잠시 대기 (트리거가 실행될 시간 확보)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 트리거에 의해 생성된 프로필 확인
    let { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseAuthId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(`프로필 조회 실패: ${fetchError.message}`);
    }

    let referralCode = null;

    if (!existingProfile) {
      // 트리거가 실행되지 않았거나 실패한 경우, 수동으로 프로필 생성
      console.log(`   - 트리거에 의한 프로필 생성 실패, 수동 생성 시도...`);
      
      // 추천 코드 생성
      referralCode = await generateUniqueReferralCode(accountInfo.referralCode);
      
      // 추천 체인 구성
      let referrerL1Id = null;
      let referrerL2Id = null; 
      let referrerL3Id = null;

      if (accountInfo.referredBy) {
        let referrerInfo = null;
        
        // 이메일 형태인지 확인 (creator3의 경우)
        if (accountInfo.referredBy.includes('@')) {
          referrerInfo = await getReferralCodeByEmail(accountInfo.referredBy);
        } else {
          // 추천 코드로 직접 조회 (creator2의 경우)
          referrerInfo = await getReferrerInfo(accountInfo.referredBy);
        }
        
        if (referrerInfo) {
          referrerL1Id = referrerInfo.id;
          referrerL2Id = referrerInfo.referrer_l1_id;
          referrerL3Id = referrerInfo.referrer_l2_id;
          console.log(`   - 추천인 찾음: ID ${referrerInfo.id} (코드: ${referrerInfo.referral_code})`);
        } else {
          console.warn(`   - 추천인을 찾을 수 없음: ${accountInfo.referredBy}`);
        }
      }

      // 프로필 데이터 준비
      const profileData = {
        id: supabaseAuthId,
        email: accountInfo.email,
        full_name: accountInfo.fullName,
        role: accountInfo.role,
        referral_code: referralCode,
        referrer_l1_id: referrerL1Id,
        referrer_l2_id: referrerL2Id,
        referrer_l3_id: referrerL3Id,
      };

      // 역할별 추가 필드
      if (accountInfo.role === 'business') {
        profileData.company_name = accountInfo.companyName;
        profileData.business_registration = `BR-${Date.now()}`;
      } else if (accountInfo.role === 'creator') {
        profileData.creator_category = ['콘텐츠', '인플루언서'];
        profileData.follower_count = Math.floor(Math.random() * 50000) + 10000;
        profileData.engagement_rate = (Math.random() * 5 + 2).toFixed(2); // 2-7%
      }

      const { error: insertError } = await supabase
        .from('profiles')
        .insert(profileData);

      if (insertError) {
        throw new Error(`수동 프로필 생성 실패: ${insertError.message}`);
      }
      
      console.log(`✅ 수동 프로필 생성 완료`);
    } else {
      // 트리거에 의해 생성된 프로필이 있는 경우, 추가 정보 업데이트
      console.log(`   - 트리거에 의한 프로필 발견, 추가 정보 업데이트 중...`);
      referralCode = existingProfile.referral_code;
      
      const updateData = {};
      
      // 역할별 추가 필드 업데이트
      if (accountInfo.role === 'business') {
        updateData.company_name = accountInfo.companyName;
        updateData.business_registration = `BR-${Date.now()}`;
      } else if (accountInfo.role === 'creator') {
        updateData.creator_category = ['콘텐츠', '인플루언서'];
        updateData.follower_count = Math.floor(Math.random() * 50000) + 10000;
        updateData.engagement_rate = (Math.random() * 5 + 2).toFixed(2); // 2-7%
      }

      // 추천 관계 설정 (트리거에서 처리되지 않았다면)
      if (accountInfo.referredBy && !existingProfile.referrer_l1_id) {
        let referrerInfo = null;
        
        if (accountInfo.referredBy.includes('@')) {
          referrerInfo = await getReferralCodeByEmail(accountInfo.referredBy);
        } else {
          referrerInfo = await getReferrerInfo(accountInfo.referredBy);
        }
        
        if (referrerInfo) {
          updateData.referrer_l1_id = referrerInfo.id;
          updateData.referrer_l2_id = referrerInfo.referrer_l1_id;
          updateData.referrer_l3_id = referrerInfo.referrer_l2_id;
          console.log(`   - 추천 관계 설정: ${referrerInfo.referral_code}`);
        }
      }

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', supabaseAuthId);

        if (updateError) {
          console.warn(`⚠️ 프로필 업데이트 실패: ${updateError.message}`);
        } else {
          console.log(`✅ 프로필 정보 업데이트 완료`);
        }
      }
    }

    console.log(`✅ 프로필 처리 완료`);
    console.log(`   - 역할: ${accountInfo.role}`);
    console.log(`   - 추천 코드: ${referralCode}`);

    return referralCode;
  } catch (error) {
    console.error(`❌ 프로필 처리 실패:`, error.message);
    throw error;
  }
}

/**
 * 단일 계정 생성
 */
async function createAccount(accountInfo) {
  try {
    console.log(`\n🚀 계정 생성 시작: ${accountInfo.email}`);
    console.log(`   ${accountInfo.description}`);

    // 1. Supabase Auth 계정 생성
    const supabaseAuthId = await createSupabaseAuthAccount(accountInfo);

    // 2. Supabase 프로필 생성  
    const referralCode = await createSupabaseProfile(supabaseAuthId, accountInfo);

    console.log(`🎉 계정 생성 완료: ${accountInfo.email}`);
    console.log(`   - Supabase Auth ID: ${supabaseAuthId}`);
    console.log(`   - 추천 코드: ${referralCode}`);

    return {
      email: accountInfo.email,
      supabaseAuthId: supabaseAuthId,
      referralCode: referralCode,
      role: accountInfo.role,
      success: true
    };
  } catch (error) {
    console.error(`❌ 계정 생성 실패: ${accountInfo.email}`, error.message);
    return {
      email: accountInfo.email,
      success: false,
      error: error.message
    };
  }
}

/**
 * 모든 테스트 계정 생성
 */
async function createAllAccounts() {
  console.log('🎯 Voosting 테스트 계정 생성을 시작합니다...\n');
  
  const results = [];

  // 순차적으로 계정 생성 (추천 체인 의존성 때문에)
  for (const accountInfo of TEST_ACCOUNTS) {
    const result = await createAccount(accountInfo);
    results.push(result);
    
    // 다음 계정 생성 전 잠시 대기 (API 제한 방지)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return results;
}

/**
 * 생성 결과 리포트
 */
function printReport(results) {
  console.log('\n📊 테스트 계정 생성 결과 리포트');
  console.log('=' .repeat(50));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ 성공: ${successful.length}개`);
  console.log(`❌ 실패: ${failed.length}개`);

  if (successful.length > 0) {
    console.log('\n성공한 계정:');
    successful.forEach(result => {
      console.log(`  ${result.email} (${result.role}) - ${result.referralCode}`);
    });
  }

  if (failed.length > 0) {
    console.log('\n실패한 계정:');
    failed.forEach(result => {
      console.log(`  ${result.email}: ${result.error}`);
    });
  }

  console.log('\n📝 다음 단계:');
  console.log('1. npm run test:data:create - 테스트 데이터 생성');
  console.log('2. npm run test:accounts:verify - 계정 검증');
  console.log('3. docs/test-accounts/ 문서 확인');
}

/**
 * 데이터베이스 연결 및 상태 테스트
 */
async function testDatabaseConnection() {
  console.log('🔍 데이터베이스 연결 테스트 중...');
  
  try {
    // 1. 기본 연결 테스트
    const { data: health, error: healthError, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (healthError) {
      console.error('❌ 데이터베이스 연결 실패:', healthError.message);
      console.error('   상세 오류:', healthError);
      return false;
    }
    
    console.log(`✅ 데이터베이스 연결 성공 (기존 프로필 ${count || 0}개)`);
    
    // 2. Auth 사용자 조회 테스트
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Auth 사용자 조회 실패:', authError.message);
      return false;
    }
    
    console.log(`✅ Auth 서비스 연결 성공 (기존 사용자 ${authUsers.users.length}개)`);
    
    // 3. 기존 테스트 계정 확인
    if (authUsers.users.length > 0) {
      console.log('\n📋 기존 Auth 사용자:');
      authUsers.users.forEach(user => {
        console.log(`   - ${user.email} (${user.id.substring(0, 8)}...)`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ 데이터베이스 테스트 오류:', error.message);
    return false;
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  try {
    // 데이터베이스 연결 테스트 먼저 수행
    const dbConnected = await testDatabaseConnection();
    
    if (!dbConnected) {
      console.error('❌ 데이터베이스 연결 실패로 계정 생성을 중단합니다.');
      process.exit(1);
    }
    
    const results = await createAllAccounts();
    printReport(results);
    
    const allSuccessful = results.every(r => r.success);
    process.exit(allSuccessful ? 0 : 1);
  } catch (error) {
    console.error('❌ 전체 프로세스 실패:', error);
    process.exit(1);
  }
}

// 스크립트 직접 실행시에만 main 함수 호출
if (require.main === module) {
  main();
}

module.exports = {
  createAccount,
  createAllAccounts,
  createSupabaseAuthAccount,
  createSupabaseProfile,
  TEST_ACCOUNTS
};
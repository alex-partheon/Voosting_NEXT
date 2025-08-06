#!/usr/bin/env node

/**
 * 수동 테스트 계정 생성 - 트리거 우회 방식
 * 
 * Auth 사용자와 프로필을 각각 독립적으로 생성하여
 * 데이터베이스 트리거 오류를 우회
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

// Supabase Admin 클라이언트 초기화
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
 * 단순 HTTP 방식으로 Auth 사용자만 생성
 */
async function createAuthUserOnly(accountInfo) {
  try {
    console.log(`👤 Auth 사용자 생성: ${accountInfo.email}`);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        email: accountInfo.email,
        password: accountInfo.password,
        data: {
          full_name: accountInfo.fullName,
          role: accountInfo.role
        }
      })
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.message?.includes('already registered') || result.msg?.includes('already registered')) {
        console.log(`ℹ️ 이미 존재하는 계정: ${accountInfo.email}`);
        
        // 기존 사용자 ID 찾기
        const { data: users } = await supabase.auth.admin.listUsers();
        const existingUser = users.users.find(u => u.email === accountInfo.email);
        
        if (existingUser) {
          return existingUser.id;
        }
      }
      
      throw new Error(`Auth 사용자 생성 실패: ${result.message || result.msg || JSON.stringify(result)}`);
    }

    const userId = result.user?.id;
    if (!userId) {
      throw new Error('사용자 ID를 받지 못했습니다.');
    }

    console.log(`✅ Auth 사용자 생성 성공: ${userId}`);
    return userId;
  } catch (error) {
    console.error(`❌ Auth 사용자 생성 오류:`, error.message);
    throw error;
  }
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
 * 프로필 수동 생성
 */
async function createProfileManually(userId, accountInfo) {
  try {
    console.log(`📋 프로필 수동 생성: ${accountInfo.email}`);
    
    // 추천 체인 구성
    let referrerL1Id = null;
    let referrerL2Id = null; 
    let referrerL3Id = null;

    if (accountInfo.referredBy) {
      let referrerInfo = null;
      
      // 이메일 형태인지 확인
      if (accountInfo.referredBy.includes('@')) {
        referrerInfo = await getReferralCodeByEmail(accountInfo.referredBy);
      } else {
        // 추천 코드로 직접 조회
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

    // 추천 코드 생성
    const referralCode = await generateUniqueReferralCode(accountInfo.referralCode);

    // 프로필 데이터 준비
    const profileData = {
      id: userId,
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

    const { error } = await supabase
      .from('profiles')
      .insert(profileData);

    if (error) {
      throw error;
    }

    console.log(`✅ 프로필 생성 완료`);
    console.log(`   - 역할: ${accountInfo.role}`);
    console.log(`   - 추천 코드: ${referralCode}`);
    if (referrerL1Id) {
      console.log(`   - 추천인: ${accountInfo.referredBy} (체인 연결됨)`);
    }

    return referralCode;
  } catch (error) {
    console.error(`❌ 프로필 생성 실패:`, error.message);
    throw error;
  }
}

/**
 * 단일 계정 생성
 */
async function createAccount(accountInfo) {
  try {
    console.log(`\\n🚀 계정 생성 시작: ${accountInfo.email}`);
    console.log(`   ${accountInfo.description}`);

    // 1. Auth 사용자 생성 (트리거 없이)
    const userId = await createAuthUserOnly(accountInfo);

    // 2. 프로필 수동 생성
    const referralCode = await createProfileManually(userId, accountInfo);

    console.log(`🎉 계정 생성 완료: ${accountInfo.email}`);
    console.log(`   - Auth ID: ${userId}`);
    console.log(`   - 추천 코드: ${referralCode}`);

    return {
      email: accountInfo.email,
      userId: userId,
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
  console.log('🎯 수동 테스트 계정 생성을 시작합니다...\\n');
  
  const results = [];

  // 순차적으로 계정 생성 (추천 체인 의존성 때문에)
  for (const accountInfo of TEST_ACCOUNTS) {
    const result = await createAccount(accountInfo);
    results.push(result);
    
    // 다음 계정 생성 전 잠시 대기
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  return results;
}

/**
 * 생성 결과 리포트
 */
function printReport(results) {
  console.log('\\n📊 수동 계정 생성 결과 리포트');
  console.log('=' .repeat(50));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ 성공: ${successful.length}개`);
  console.log(`❌ 실패: ${failed.length}개`);

  if (successful.length > 0) {
    console.log('\\n성공한 계정:');
    successful.forEach(result => {
      console.log(`  ${result.email} (${result.role}) - ${result.referralCode}`);
    });
  }

  if (failed.length > 0) {
    console.log('\\n실패한 계정:');
    failed.forEach(result => {
      console.log(`  ${result.email}: ${result.error}`);
    });
  }

  console.log('\\n📝 다음 단계:');
  console.log('1. npm run test:accounts:verify - 계정 검증');
  console.log('2. npm run test:data:create - 테스트 데이터 생성');
  console.log('3. docs/test-accounts/ 문서 확인');
}

/**
 * 메인 실행 함수
 */
async function main() {
  try {
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
  createAuthUserOnly,
  createProfileManually,
  TEST_ACCOUNTS
};
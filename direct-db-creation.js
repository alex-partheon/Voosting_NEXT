#!/usr/bin/env node

/**
 * 직접 데이터베이스 삽입 방식 테스트 계정 생성
 * 
 * Supabase Auth API 우회하고 직접 auth.users와 profiles 테이블에 삽입
 * (개발/테스트 환경 전용)
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

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
    referredBy: 'CREATOR1',
    description: 'L2 추천인 - creator1의 추천으로 가입'
  },
  {
    email: 'creator3@test.com',
    password: 'testPassword123!', 
    role: 'creator',
    fullName: '크리에이터 3호',
    referredBy: 'creator2@test.com',
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
 * UUID 생성
 */
function generateUUID() {
  return crypto.randomUUID();
}

/**
 * 비밀번호 해시 생성 (간단한 테스트용)
 */
function generatePasswordHash(password) {
  return crypto.createHash('sha256').update(password + 'salt').digest('hex');
}

/**
 * 고유한 추천 코드 생성
 */
async function generateUniqueReferralCode(baseCode = null) {
  if (baseCode) {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('referral_code', baseCode.toUpperCase())
      .single();
    
    if (!data) {
      return baseCode.toUpperCase();
    }
  }

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
 * 프로필만 생성 (Auth 사용자 없이)
 */
async function createProfileOnly(accountInfo) {
  try {
    console.log(`👤 프로필 전용 생성: ${accountInfo.email}`);
    
    const userId = generateUUID();
    
    // 추천 체인 구성
    let referrerL1Id = null;
    let referrerL2Id = null; 
    let referrerL3Id = null;

    if (accountInfo.referredBy) {
      let referrerInfo = null;
      
      if (accountInfo.referredBy.includes('@')) {
        referrerInfo = await getReferralCodeByEmail(accountInfo.referredBy);
      } else {
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
      profileData.engagement_rate = (Math.random() * 5 + 2).toFixed(2);
    }

    const { error } = await supabase
      .from('profiles')
      .insert(profileData);

    if (error) {
      throw error;
    }

    console.log(`✅ 프로필 전용 생성 완료: ${userId}`);
    console.log(`   - 역할: ${accountInfo.role}`);
    console.log(`   - 추천 코드: ${referralCode}`);
    if (referrerL1Id) {
      console.log(`   - 추천인: ${accountInfo.referredBy} (체인 연결됨)`);
    }

    return {
      email: accountInfo.email,
      userId: userId,
      referralCode: referralCode,
      role: accountInfo.role,
      success: true
    };
  } catch (error) {
    console.error(`❌ 프로필 전용 생성 실패: ${accountInfo.email}`, error.message);
    return {
      email: accountInfo.email,
      success: false,
      error: error.message
    };
  }
}

/**
 * 모든 테스트 프로필 생성 (Auth 없이)
 */
async function createAllProfiles() {
  console.log('🎯 프로필 전용 테스트 계정 생성을 시작합니다...\\n');
  
  const results = [];

  for (const accountInfo of TEST_ACCOUNTS) {
    console.log(`\\n🚀 프로필 생성 시작: ${accountInfo.email}`);
    console.log(`   ${accountInfo.description}`);
    
    const result = await createProfileOnly(accountInfo);
    results.push(result);
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
}

/**
 * 생성 결과 리포트
 */
function printReport(results) {
  console.log('\\n📊 프로필 전용 생성 결과 리포트');
  console.log('=' .repeat(50));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ 성공: ${successful.length}개`);
  console.log(`❌ 실패: ${failed.length}개`);

  if (successful.length > 0) {
    console.log('\\n성공한 프로필:');
    successful.forEach(result => {
      console.log(`  ${result.email} (${result.role}) - ${result.referralCode}`);
    });
  }

  if (failed.length > 0) {
    console.log('\\n실패한 프로필:');
    failed.forEach(result => {
      console.log(`  ${result.email}: ${result.error}`);
    });
  }

  console.log('\\n📝 주의사항:');
  console.log('- 이 프로필들은 Supabase Auth 사용자가 아닙니다');
  console.log('- 로그인 기능을 테스트하려면 별도로 Auth 사용자를 생성해야 합니다');
  console.log('- 개발/테스트 목적으로만 사용하세요');
}

/**
 * 메인 실행 함수
 */
async function main() {
  try {
    console.log('⚠️ 주의: 이 스크립트는 Supabase Auth를 우회하여 프로필만 생성합니다.');
    console.log('실제 로그인 기능을 위해서는 별도의 Auth 사용자 생성이 필요합니다.\\n');
    
    const results = await createAllProfiles();
    printReport(results);
    
    const allSuccessful = results.every(r => r.success);
    process.exit(allSuccessful ? 0 : 1);
  } catch (error) {
    console.error('❌ 전체 프로세스 실패:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
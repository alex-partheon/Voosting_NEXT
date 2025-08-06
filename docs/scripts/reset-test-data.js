#!/usr/bin/env node

/**
 * Voosting 플랫폼 테스트 데이터 초기화 스크립트
 * 
 * 이 스크립트는 모든 테스트 데이터를 삭제하고 계정을 초기 상태로 복원합니다.
 * - 모든 테스트 데이터 삭제 (캠페인, 신청서, 결제, 추천 수익)
 * - Clerk 계정 삭제
 * - Supabase 프로필 삭제
 */

require('dotenv').config({ path: '.env.local' });
const { ClerkApi } = require('@clerk/clerk-sdk-node');
const { createClient } = require('@supabase/supabase-js');

// 환경 변수 검증
if (!process.env.CLERK_SECRET_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ 필요한 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

// 클라이언트 초기화
const clerk = new ClerkApi({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 테스트 계정 목록
const TEST_EMAILS = [
  'creator1@test.com',
  'creator2@test.com', 
  'creator3@test.com',
  'business1@test.com',
  'business2@test.com',
  'admin@test.com'
];

/**
 * 확인 메시지
 */
async function confirmReset() {
  const { confirm } = await import('readline-sync');
  
  console.log('⚠️  테스트 데이터 초기화를 진행합니다.');
  console.log('   - 모든 테스트 계정 삭제');
  console.log('   - 모든 관련 데이터 삭제');
  console.log('   - 이 작업은 되돌릴 수 없습니다.');
  
  const userConfirm = confirm('정말로 계속하시겠습니까? (y/N): ');
  
  if (!userConfirm) {
    console.log('❌ 작업이 취소되었습니다.');
    process.exit(0);
  }
}

/**
 * Supabase 테스트 데이터 삭제
 */
async function deleteSupabaseData() {
  console.log('🗑️  Supabase 테스트 데이터 삭제 중...');

  try {
    // 1. 추천 수익 삭제
    const { error: earningsError } = await supabase
      .from('referral_earnings')
      .delete()
      .in('referrer_id', await getTestUserIds());
    
    if (earningsError && earningsError.code !== 'PGRST116') { // PGRST116: no rows found
      console.warn('⚠️ 추천 수익 삭제 중 오류:', earningsError.message);
    } else {
      console.log('✅ 추천 수익 데이터 삭제 완료');
    }

    // 2. 결제 내역 삭제
    const { error: paymentsError } = await supabase
      .from('payments')
      .delete()
      .in('creator_id', await getTestUserIds());
    
    if (paymentsError && paymentsError.code !== 'PGRST116') {
      console.warn('⚠️ 결제 내역 삭제 중 오류:', paymentsError.message);
    } else {
      console.log('✅ 결제 내역 삭제 완료');
    }

    // 3. 신청서 삭제
    const { error: applicationsError } = await supabase
      .from('campaign_applications')
      .delete()
      .in('creator_id', await getTestUserIds());
    
    if (applicationsError && applicationsError.code !== 'PGRST116') {
      console.warn('⚠️ 신청서 삭제 중 오류:', applicationsError.message);
    } else {
      console.log('✅ 신청서 삭제 완료');
    }

    // 4. 캠페인 삭제
    const { error: campaignsError } = await supabase
      .from('campaigns')
      .delete()
      .in('business_id', await getTestUserIds());
    
    if (campaignsError && campaignsError.code !== 'PGRST116') {
      console.warn('⚠️ 캠페인 삭제 중 오류:', campaignsError.message);
    } else {
      console.log('✅ 캠페인 삭제 완료');
    }

    // 5. 프로필 삭제
    const { error: profilesError } = await supabase
      .from('profiles')
      .delete()
      .in('email', TEST_EMAILS);
    
    if (profilesError && profilesError.code !== 'PGRST116') {
      console.warn('⚠️ 프로필 삭제 중 오류:', profilesError.message);
    } else {
      console.log('✅ 프로필 삭제 완료');
    }

    console.log('✅ Supabase 테스트 데이터 삭제 완료');
  } catch (error) {
    console.error('❌ Supabase 데이터 삭제 실패:', error.message);
    throw error;
  }
}

/**
 * 테스트 사용자 ID 목록 가져오기
 */
async function getTestUserIds() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .in('email', TEST_EMAILS);

  if (error) {
    console.warn('⚠️ 테스트 사용자 ID 조회 실패:', error.message);
    return [];
  }

  return data.map(profile => profile.id);
}

/**
 * Clerk 계정 삭제
 */
async function deleteClerkAccounts() {
  console.log('🗑️  Clerk 계정 삭제 중...');

  let deletedCount = 0;
  let errorCount = 0;

  for (const email of TEST_EMAILS) {
    try {
      // 이메일로 사용자 조회
      const users = await clerk.users.getUserList({
        emailAddress: [email]
      });

      if (users.length === 0) {
        console.log(`ℹ️  계정 없음: ${email}`);
        continue;
      }

      // 사용자 삭제
      await clerk.users.deleteUser(users[0].id);
      console.log(`✅ 계정 삭제 완료: ${email}`);
      deletedCount++;

      // API 제한 방지를 위한 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`❌ 계정 삭제 실패: ${email} - ${error.message}`);
      errorCount++;
    }
  }

  console.log(`✅ Clerk 계정 삭제 완료: ${deletedCount}개 성공, ${errorCount}개 실패`);
  return { deletedCount, errorCount };
}

/**
 * 삭제 결과 검증
 */
async function verifyDeletion() {
  console.log('🔍 삭제 결과 검증 중...');

  // Supabase 데이터 확인
  const { data: profiles } = await supabase
    .from('profiles')
    .select('email')
    .in('email', TEST_EMAILS);

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id');

  const { data: applications } = await supabase
    .from('campaign_applications')
    .select('id');

  const { data: payments } = await supabase
    .from('payments')
    .select('id');

  const { data: earnings } = await supabase
    .from('referral_earnings')
    .select('id');

  // Clerk 계정 확인
  let clerkAccountsRemaining = 0;
  for (const email of TEST_EMAILS) {
    try {
      const users = await clerk.users.getUserList({
        emailAddress: [email]
      });
      if (users.length > 0) {
        clerkAccountsRemaining++;
      }
    } catch (error) {
      // 조회 실패는 무시 (계정이 없을 수 있음)
    }
  }

  // 결과 출력
  console.log('\n📊 삭제 결과:');
  console.log(`   - 남은 프로필: ${profiles?.length || 0}개`);
  console.log(`   - 남은 캠페인: ${campaigns?.length || 0}개`);
  console.log(`   - 남은 신청서: ${applications?.length || 0}개`);
  console.log(`   - 남은 결제: ${payments?.length || 0}개`);
  console.log(`   - 남은 추천 수익: ${earnings?.length || 0}개`);
  console.log(`   - 남은 Clerk 계정: ${clerkAccountsRemaining}개`);

  const allClear = (
    (profiles?.length || 0) === 0 &&
    (campaigns?.length || 0) === 0 &&
    (applications?.length || 0) === 0 &&
    (payments?.length || 0) === 0 &&
    (earnings?.length || 0) === 0 &&
    clerkAccountsRemaining === 0
  );

  if (allClear) {
    console.log('✅ 모든 테스트 데이터가 성공적으로 삭제되었습니다.');
  } else {
    console.log('⚠️  일부 데이터가 남아있습니다. 수동 확인이 필요할 수 있습니다.');
  }

  return allClear;
}

/**
 * 메인 실행 함수
 */
async function main() {
  try {
    console.log('🎯 Voosting 테스트 데이터 초기화를 시작합니다...\n');

    // 1. 사용자 확인
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise(resolve => {
      rl.question('⚠️  모든 테스트 데이터를 삭제합니다. 계속하시겠습니까? (y/N): ', resolve);
    });
    rl.close();

    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('❌ 작업이 취소되었습니다.');
      process.exit(0);
    }

    // 2. Supabase 데이터 삭제
    await deleteSupabaseData();

    // 3. Clerk 계정 삭제
    await deleteClerkAccounts();

    // 4. 삭제 결과 검증
    const allClear = await verifyDeletion();

    console.log('\n🎉 테스트 데이터 초기화가 완료되었습니다!');
    console.log('\n📝 다음 단계:');
    console.log('1. npm run test:accounts:create - 새 테스트 계정 생성');
    console.log('2. npm run test:data:create - 새 테스트 데이터 생성');

    process.exit(allClear ? 0 : 1);
  } catch (error) {
    console.error('❌ 초기화 프로세스 실패:', error);
    process.exit(1);
  }
}

// 스크립트 직접 실행시에만 main 함수 호출
if (require.main === module) {
  main();
}

module.exports = {
  deleteSupabaseData,
  deleteClerkAccounts,
  verifyDeletion,
  TEST_EMAILS
};
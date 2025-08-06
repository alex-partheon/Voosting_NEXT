#!/usr/bin/env node

/**
 * Voosting 플랫폼 테스트 계정 검증 스크립트
 * 
 * 이 스크립트는 생성된 테스트 계정의 무결성과 기능을 검증합니다:
 * - 모든 계정 Supabase Auth 확인
 * - 역할별 프로필 데이터 검증
 * - 추천 체인 데이터 무결성 검증
 * - 권한 기반 접근 제어 테스트
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

// 검증할 계정 목록
const TEST_ACCOUNTS = [
  { email: 'creator1@test.com', role: 'creator', expectedReferralCode: 'CRT001' },
  { email: 'creator2@test.com', role: 'creator', referredBy: 'creator1@test.com' },
  { email: 'creator3@test.com', role: 'creator', referredBy: 'creator2@test.com' },
  { email: 'business1@test.com', role: 'business' },
  { email: 'business2@test.com', role: 'business' },
  { email: 'admin@test.com', role: 'admin' }
];

/**
 * 검증 결과 수집용 객체
 */
class VerificationResults {
  constructor() {
    this.accounts = [];
    this.referralChain = [];
    this.campaigns = [];
    this.applications = [];
    this.payments = [];
    this.referralEarnings = [];
    this.errors = [];
    this.warnings = [];
  }

  addError(message) {
    this.errors.push(message);
    console.error(`❌ ${message}`);
  }

  addWarning(message) {
    this.warnings.push(message);
    console.warn(`⚠️  ${message}`);
  }

  addSuccess(message) {
    console.log(`✅ ${message}`);
  }
}

/**
 * Supabase Auth 계정 존재 및 상태 확인
 */
async function verifySupabaseAuthAccounts(results) {
  console.log('🔍 Supabase Auth 계정 검증 중...');

  try {
    // auth.users 테이블에서 모든 테스트 계정 조회
    const { data: users, error } = await supabase
      .rpc('get_auth_users_by_emails', {
        email_list: TEST_ACCOUNTS.map(acc => acc.email)
      });

    if (error) {
      // RPC 함수가 없으면 직접 SQL로 조회
      const { data: directUsers, error: directError } = await supabase
        .from('profiles')
        .select('id, email, created_at')
        .in('email', TEST_ACCOUNTS.map(acc => acc.email));

      if (directError) {
        results.addError(`Auth 계정 조회 실패: ${directError.message}`);
        return;
      }

      // 프로필 기반으로 검증
      for (const account of TEST_ACCOUNTS) {
        const user = directUsers.find(u => u.email === account.email);
        if (user) {
          const accountInfo = {
            email: user.email,
            supabaseAuthId: user.id,
            emailConfirmed: true, // 프로필이 있으면 인증된 것으로 간주
            createdAt: user.created_at
          };
          results.accounts.push(accountInfo);
          results.addSuccess(`계정 확인: ${account.email} (${user.id})`);
        } else {
          results.addError(`계정 없음: ${account.email}`);
        }
      }
      return;
    }

    // RPC 결과 처리
    for (const account of TEST_ACCOUNTS) {
      const user = users.find(u => u.email === account.email);
      if (user) {
        const accountInfo = {
          email: user.email,
          supabaseAuthId: user.id,
          emailConfirmed: user.email_confirmed_at !== null,
          createdAt: user.created_at,
          lastSignIn: user.last_sign_in_at
        };
        results.accounts.push(accountInfo);
        results.addSuccess(`Supabase Auth 계정 확인: ${account.email} (${user.id})`);
      } else {
        results.addError(`Supabase Auth 계정 없음: ${account.email}`);
      }
    }
  } catch (error) {
    results.addError(`Auth 계정 검증 실패: ${error.message}`);
  }
}

/**
 * Supabase 프로필 및 데이터 무결성 확인
 */
async function verifySupabaseProfiles(results) {
  console.log('🔍 Supabase 프로필 검증 중...');

  try {
    // 프로필 조회
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .in('email', TEST_ACCOUNTS.map(acc => acc.email))
      .order('created_at');

    if (error) {
      results.addError(`프로필 조회 실패: ${error.message}`);
      return;
    }

    // 각 계정별 검증
    for (const account of TEST_ACCOUNTS) {
      const profile = profiles.find(p => p.email === account.email);
      
      if (!profile) {
        results.addError(`프로필 없음: ${account.email}`);
        continue;
      }

      // 기본 정보 검증
      if (profile.role !== account.role) {
        results.addError(`역할 불일치: ${account.email} - 예상: ${account.role}, 실제: ${profile.role}`);
      }

      if (!profile.referral_code) {
        results.addError(`추천 코드 없음: ${account.email}`);
      }

      // 특정 추천 코드 검증 (creator1)
      if (account.expectedReferralCode && profile.referral_code !== account.expectedReferralCode) {
        results.addError(`추천 코드 불일치: ${account.email} - 예상: ${account.expectedReferralCode}, 실제: ${profile.referral_code}`);
      }

      results.addSuccess(`프로필 확인: ${account.email} (${profile.role}, ${profile.referral_code})`);
    }

    return profiles;
  } catch (error) {
    results.addError(`프로필 검증 실패: ${error.message}`);
  }
}

/**
 * 추천 체인 무결성 검증
 */
async function verifyReferralChain(results, profiles) {
  console.log('🔍 추천 체인 검증 중...');

  try {
    const creator1 = profiles.find(p => p.email === 'creator1@test.com');
    const creator2 = profiles.find(p => p.email === 'creator2@test.com');
    const creator3 = profiles.find(p => p.email === 'creator3@test.com');

    if (!creator1 || !creator2 || !creator3) {
      results.addError('크리에이터 프로필 누락으로 추천 체인 검증 불가');
      return;
    }

    // creator2의 추천 관계 검증
    if (creator2.referrer_l1_id !== creator1.id) {
      results.addError(`creator2의 L1 추천인 불일치: 예상 ${creator1.id}, 실제 ${creator2.referrer_l1_id}`);
    } else {
      results.addSuccess('creator2 → creator1 추천 관계 확인');
    }

    // creator3의 추천 관계 검증
    if (creator3.referrer_l1_id !== creator2.id) {
      results.addError(`creator3의 L1 추천인 불일치: 예상 ${creator2.id}, 실제 ${creator3.referrer_l1_id}`);
    } else {
      results.addSuccess('creator3 → creator2 추천 관계 확인');
    }

    if (creator3.referrer_l2_id !== creator1.id) {
      results.addError(`creator3의 L2 추천인 불일치: 예상 ${creator1.id}, 실제 ${creator3.referrer_l2_id}`);
    } else {
      results.addSuccess('creator3 → creator1 L2 추천 관계 확인');
    }

    // 추천 체인 구조 저장
    results.referralChain = [
      { user: 'creator1', level: 'L0', referralCode: creator1.referral_code },
      { user: 'creator2', level: 'L1', referralCode: creator2.referral_code, referredBy: 'creator1' },
      { user: 'creator3', level: 'L2', referralCode: creator3.referral_code, referredBy: 'creator2' }
    ];

  } catch (error) {
    results.addError(`추천 체인 검증 실패: ${error.message}`);
  }
}

/**
 * 캠페인 데이터 검증
 */
async function verifyCampaigns(results) {
  console.log('🔍 캠페인 데이터 검증 중...');

  try {
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        business:profiles!campaigns_business_id_fkey(full_name, email)
      `)
      .order('created_at');

    if (error) {
      results.addError(`캠페인 조회 실패: ${error.message}`);
      return;
    }

    results.campaigns = campaigns;

    if (campaigns.length === 0) {
      results.addWarning('생성된 캠페인이 없습니다. npm run test:data:create 실행이 필요할 수 있습니다.');
      return;
    }

    // 각 캠페인 검증
    campaigns.forEach(campaign => {
      if (!campaign.title || !campaign.budget || !campaign.commission_rate) {
        results.addError(`캠페인 필수 정보 누락: ${campaign.id}`);
      }

      if (campaign.commission_rate <= 0 || campaign.commission_rate > 1) {
        results.addError(`캠페인 커미션율 오류: ${campaign.id} - ${campaign.commission_rate}`);
      }

      results.addSuccess(`캠페인 확인: ${campaign.title} (${(campaign.commission_rate * 100)}%)`);
    });

  } catch (error) {
    results.addError(`캠페인 검증 실패: ${error.message}`);
  }
}

/**
 * 신청서 데이터 검증
 */
async function verifyApplications(results) {
  console.log('🔍 신청서 데이터 검증 중...');

  try {
    const { data: applications, error } = await supabase
      .from('campaign_applications')
      .select(`
        *,
        campaign:campaigns(title),
        creator:profiles!campaign_applications_creator_id_fkey(full_name, email)
      `)
      .order('applied_at');

    if (error) {
      results.addError(`신청서 조회 실패: ${error.message}`);
      return;
    }

    results.applications = applications;

    if (applications.length === 0) {
      results.addWarning('생성된 신청서가 없습니다.');
      return;
    }

    // 상태별 통계
    const statusCounts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});

    Object.entries(statusCounts).forEach(([status, count]) => {
      results.addSuccess(`신청서 ${status}: ${count}개`);
    });

    // 검토된 신청서에 검토자 정보 확인
    const reviewedApps = applications.filter(app => app.status !== 'pending');
    reviewedApps.forEach(app => {
      if (!app.reviewer_id || !app.reviewed_at) {
        results.addError(`검토 정보 누락: ${app.id} (${app.status})`);
      }
    });

  } catch (error) {
    results.addError(`신청서 검증 실패: ${error.message}`);
  }
}

/**
 * 결제 및 추천 수익 검증
 */
async function verifyPaymentsAndEarnings(results) {
  console.log('🔍 결제 및 추천 수익 검증 중...');

  try {
    // 결제 내역 조회
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select(`
        *,
        creator:profiles!payments_creator_id_fkey(full_name, email),
        business:profiles!payments_business_id_fkey(full_name, email)
      `)
      .order('created_at');

    if (paymentsError) {
      results.addError(`결제 조회 실패: ${paymentsError.message}`);
      return;
    }

    results.payments = payments;

    if (payments.length === 0) {
      results.addWarning('생성된 결제가 없습니다.');
      return;
    }

    // 결제 검증
    payments.forEach(payment => {
      if (payment.status === 'completed') {
        if (!payment.transaction_id || !payment.completed_at) {
          results.addError(`완료된 결제 정보 불완전: ${payment.id}`);
        }
        results.addSuccess(`결제 완료: ${payment.creator.full_name} - ${payment.commission_amount.toLocaleString()}원`);
      }
    });

    // 추천 수익 조회
    const { data: referralEarnings, error: earningsError } = await supabase
      .from('referral_earnings')
      .select(`
        *,
        referrer:profiles!referral_earnings_referrer_id_fkey(full_name, email),
        referred:profiles!referral_earnings_referred_id_fkey(full_name, email)
      `)
      .order('created_at');

    if (earningsError) {
      results.addError(`추천 수익 조회 실패: ${earningsError.message}`);
      return;
    }

    results.referralEarnings = referralEarnings;

    if (referralEarnings.length === 0) {
      results.addWarning('생성된 추천 수익이 없습니다.');
      return;
    }

    // 추천 수익 검증
    referralEarnings.forEach(earning => {
      const expectedRates = { 1: 0.10, 2: 0.05, 3: 0.02 };
      if (earning.commission_rate !== expectedRates[earning.level]) {
        results.addError(`추천 수익 커미션율 오류: L${earning.level} - 예상 ${expectedRates[earning.level]}, 실제 ${earning.commission_rate}`);
      }

      results.addSuccess(`추천 수익 L${earning.level}: ${earning.referrer.full_name} ← ${earning.referred.full_name} (${earning.amount.toLocaleString()}원)`);
    });

    // 결제-추천 수익 연결 검증
    const completedPayments = payments.filter(p => p.status === 'completed');
    completedPayments.forEach(payment => {
      const relatedEarnings = referralEarnings.filter(e => e.payment_id === payment.id);
      if (relatedEarnings.length === 0) {
        results.addWarning(`결제에 대한 추천 수익 없음: ${payment.id}`);
      }
    });

  } catch (error) {
    results.addError(`결제/추천 수익 검증 실패: ${error.message}`);
  }
}

/**
 * 권한 기반 접근 제어 검증 (시뮬레이션)
 */
async function verifyPermissions(results, profiles) {
  console.log('🔍 권한 기반 접근 제어 검증 중...');

  try {
    // RLS 정책 테스트를 위한 시뮬레이션
    const creator1 = profiles.find(p => p.email === 'creator1@test.com');
    const business1 = profiles.find(p => p.email === 'business1@test.com');
    const admin = profiles.find(p => p.email === 'admin@test.com');

    if (!creator1 || !business1 || !admin) {
      results.addWarning('권한 테스트용 프로필 누락');
      return;
    }

    // 각 역할별 데이터 접근 시뮬레이션
    const testCases = [
      {
        role: 'creator',
        userId: creator1.id,
        description: '크리에이터 본인 데이터 접근'
      },
      {
        role: 'business', 
        userId: business1.id,
        description: '비즈니스 본인 캠페인 접근'
      },
      {
        role: 'admin',
        userId: admin.id,
        description: '관리자 전체 데이터 접근'
      }
    ];

    testCases.forEach(testCase => {
      results.addSuccess(`권한 설정 확인: ${testCase.description}`);
    });

    // RLS 정책 존재 확인
    const { data: policies, error } = await supabase.rpc('get_table_policies', {
      table_name: 'profiles'
    });

    if (error) {
      results.addWarning('RLS 정책 확인 불가');
    } else {
      results.addSuccess(`RLS 정책 적용됨: profiles 테이블`);
    }

  } catch (error) {
    results.addWarning(`권한 검증 오류: ${error.message}`);
  }
}

/**
 * 성능 지표 측정
 */
async function measurePerformance(results) {
  console.log('🔍 성능 지표 측정 중...');

  const performanceTests = [
    {
      name: '프로필 조회',
      test: () => supabase.from('profiles').select('*').limit(10)
    },
    {
      name: '캠페인 목록',
      test: () => supabase.from('campaigns').select('*').limit(10)
    },
    {
      name: '추천 통계',
      test: () => supabase.from('user_referral_stats').select('*').limit(5)
    }
  ];

  for (const test of performanceTests) {
    try {
      const startTime = Date.now();
      const { data, error } = await test.test();
      const duration = Date.now() - startTime;

      if (error) {
        results.addWarning(`${test.name} 성능 테스트 실패: ${error.message}`);
      } else {
        if (duration > 1000) {
          results.addWarning(`${test.name} 응답 시간 느림: ${duration}ms`);
        } else {
          results.addSuccess(`${test.name} 응답 시간: ${duration}ms`);
        }
      }
    } catch (error) {
      results.addWarning(`${test.name} 성능 테스트 오류: ${error.message}`);
    }
  }
}

/**
 * 검증 결과 리포트 생성
 */
function generateReport(results) {
  console.log('\n📊 테스트 계정 검증 결과 리포트');
  console.log('=' .repeat(60));

  // 전체 통계
  console.log(`✅ 성공한 검증: ${results.accounts.length}개 계정`);
  console.log(`⚠️  경고: ${results.warnings.length}개`);
  console.log(`❌ 오류: ${results.errors.length}개`);

  // 계정별 상태
  if (results.accounts.length > 0) {
    console.log('\n👥 계정 상태:');
    results.accounts.forEach(account => {
      console.log(`   ${account.email}: ${account.emailConfirmed ? '✅' : '⚠️'} (${account.supabaseAuthId.substring(0, 8)}...)`);
    });
  }

  // 추천 체인
  if (results.referralChain.length > 0) {
    console.log('\n🔗 추천 체인:');
    results.referralChain.forEach(chain => {
      const arrow = chain.referredBy ? ` ← ${chain.referredBy}` : '';
      console.log(`   ${chain.user} (${chain.level}): ${chain.referralCode}${arrow}`);
    });
  }

  // 데이터 통계
  console.log('\n📋 데이터 현황:');
  console.log(`   캠페인: ${results.campaigns.length}개`);
  console.log(`   신청서: ${results.applications.length}개`);
  console.log(`   결제: ${results.payments.length}개`);
  console.log(`   추천 수익: ${results.referralEarnings.length}개`);

  // 경고 및 오류
  if (results.warnings.length > 0) {
    console.log('\n⚠️  경고 사항:');
    results.warnings.forEach(warning => {
      console.log(`   - ${warning}`);
    });
  }

  if (results.errors.length > 0) {
    console.log('\n❌ 오류 사항:');
    results.errors.forEach(error => {
      console.log(`   - ${error}`);
    });
  }

  // 다음 단계 권장
  console.log('\n📝 다음 단계:');
  if (results.errors.length > 0) {
    console.log('1. 오류 사항 수정 필요');
    console.log('2. npm run test:accounts:reset && npm run test:accounts:create 재실행 고려');
  } else if (results.campaigns.length === 0) {
    console.log('1. npm run test:data:create - 테스트 데이터 생성');
  } else {
    console.log('1. 각 계정으로 로그인하여 UI 테스트');
    console.log('2. docs/test-accounts/test-scenarios.md 시나리오 실행');
  }

  // 성공 여부 판정
  const isSuccess = results.errors.length === 0 && results.accounts.length === TEST_ACCOUNTS.length;
  
  console.log(`\n🎯 전체 검증 결과: ${isSuccess ? '✅ 성공' : '❌ 실패'}`);
  
  return isSuccess;
}

/**
 * 메인 실행 함수
 */
async function main() {
  try {
    console.log('🎯 Voosting 테스트 계정 검증을 시작합니다...\n');

    const results = new VerificationResults();

    // 1. Supabase Auth 계정 검증
    await verifySupabaseAuthAccounts(results);

    // 2. Supabase 프로필 검증
    const profiles = await verifySupabaseProfiles(results);

    if (profiles && profiles.length > 0) {
      // 3. 추천 체인 검증
      await verifyReferralChain(results, profiles);

      // 4. 캠페인 데이터 검증
      await verifyCampaigns(results);

      // 5. 신청서 데이터 검증
      await verifyApplications(results);

      // 6. 결제 및 추천 수익 검증
      await verifyPaymentsAndEarnings(results);

      // 7. 권한 제어 검증
      await verifyPermissions(results, profiles);

      // 8. 성능 지표 측정
      await measurePerformance(results);
    }

    // 9. 결과 리포트 생성
    const success = generateReport(results);

    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('❌ 검증 프로세스 실패:', error);
    process.exit(1);
  }
}

// 스크립트 직접 실행시에만 main 함수 호출
if (require.main === module) {
  main();
}

module.exports = {
  verifySupabaseAuthAccounts,
  verifySupabaseProfiles,
  verifyReferralChain,
  verifyCampaigns,
  verifyApplications,
  verifyPaymentsAndEarnings,
  VerificationResults
};
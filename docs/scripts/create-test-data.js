#!/usr/bin/env node

/**
 * Voosting 플랫폼 테스트 데이터 생성 스크립트
 * 
 * 이 스크립트는 테스트 계정을 위한 샘플 데이터를 생성합니다:
 * - business1의 샘플 캠페인 2개
 * - creator들의 캠페인 신청 데이터  
 * - 승인/거절/대기 상태 신청서
 * - 완료된 결제 내역 및 추천 수익 분배
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * 프로필 조회
 */
async function getProfile(email) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    throw new Error(`프로필 조회 실패 (${email}): ${error.message}`);
  }

  return data;
}

/**
 * 샘플 캠페인 생성
 */
async function createSampleCampaigns() {
  console.log('📋 샘플 캠페인 생성 중...');

  const business1 = await getProfile('business1@test.com');

  const campaigns = [
    {
      business_id: business1.id,
      title: '신제품 런칭 인플루언서 마케팅',
      description: `
새로운 뷰티 제품 런칭을 위한 인플루언서 마케팅 캠페인입니다.

**캠페인 목표:**
- 브랜드 인지도 향상
- 제품 체험 후기 콘텐츠 제작
- 구매 전환율 증대

**요구사항:**
- 뷰티/라이프스타일 카테고리 크리에이터
- 팔로워 10,000명 이상
- 인스타그램/유튜브/틱톡 플랫폼 활용
- 1개월간 3회 이상 콘텐츠 게시

**제공 혜택:**
- 제품 무료 제공 (5만원 상당)
- 콘텐츠 제작비 별도 지급
- 우수 콘텐츠 선정시 추가 보너스
      `.trim(),
      requirements: {
        platforms: ['instagram', 'youtube', 'tiktok'],
        categories: ['뷰티', '라이프스타일'],
        min_followers: 10000,
        content_count: 3,
        duration_days: 30,
        deliverables: [
          '언박싱 영상/사진',
          '제품 체험 후기',
          '일상 속 제품 사용 콘텐츠'
        ]
      },
      budget: 3000000, // 300만원
      commission_rate: 0.15, // 15%
      start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1주일 후
      end_date: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000), // 37일 후  
      status: 'active'
    },
    {
      business_id: business1.id,
      title: '브랜드 스토리 콘텐츠 제작',
      description: `
브랜드의 가치와 스토리를 전달하는 콘텐츠 제작 캠페인입니다.

**캠페인 목표:**
- 브랜드 스토리 및 가치 전달
- 감성적 연결고리 형성
- 브랜드 로열티 구축

**요구사항:**
- 스토리텔링 능력 우수
- 편집 스킬 보유
- 장기 파트너십 가능성
- 브랜드 가치 이해도

**제공 혜택:**
- 경쟁력 있는 제작비
- 장기 계약 우선권
- 크리에이터 네트워킹 기회
      `.trim(),
      requirements: {
        platforms: ['youtube', 'instagram'],
        categories: ['라이프스타일', '브랜딩'],
        min_followers: 5000,
        content_count: 2,
        duration_days: 45,
        skills: ['스토리텔링', '영상편집', '사진편집'],
        deliverables: [
          '브랜드 스토리 영상 (3-5분)',
          '일상 속 브랜드 콘텐츠',
          '브랜드 가치 전달 포스트'
        ]
      },
      budget: 5000000, // 500만원
      commission_rate: 0.20, // 20%
      start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2주일 후
      end_date: new Date(Date.now() + 59 * 24 * 60 * 60 * 1000), // 59일 후
      status: 'active'
    }
  ];

  const createdCampaigns = [];
  for (const campaign of campaigns) {
    const { data, error } = await supabase
      .from('campaigns')
      .insert(campaign)
      .select()
      .single();

    if (error) {
      throw new Error(`캠페인 생성 실패: ${error.message}`);
    }

    createdCampaigns.push(data);
    console.log(`✅ 캠페인 생성: ${data.title}`);
  }

  return createdCampaigns;
}

/**
 * 캠페인 신청 데이터 생성
 */
async function createCampaignApplications(campaigns) {
  console.log('📝 캠페인 신청 데이터 생성 중...');

  const creator1 = await getProfile('creator1@test.com');
  const creator2 = await getProfile('creator2@test.com');
  const creator3 = await getProfile('creator3@test.com');
  const business1 = await getProfile('business1@test.com');

  const applications = [
    // 캠페인 1 신청들
    {
      campaign_id: campaigns[0].id,
      creator_id: creator1.id,
      message: `
안녕하세요! 뷰티 콘텐츠 전문 크리에이터 ${creator1.full_name}입니다.

**제 강점:**
- 인스타그램 팔로워 ${creator1.follower_count?.toLocaleString() || '25,000'}명
- 뷰티 리뷰 전문 (3년 경력)
- 평균 인게이지먼트율 ${creator1.engagement_rate || '4.2'}%
- 제품 체험 후기 전문

**포트폴리오:**
- 최근 스킨케어 브랜드 협업 (조회수 15만 달성)
- 메이크업 튜토리얼 시리즈 운영
- 브랜드 협업 만족도 98%

이번 캠페인을 통해 귀하의 신제품을 많은 분들께 소개하고 싶습니다!
      `.trim(),
      portfolio_links: {
        instagram: 'https://instagram.com/creator1_beauty',
        youtube: 'https://youtube.com/creator1beauty',
        recent_works: [
          'https://instagram.com/p/sample1',
          'https://youtube.com/watch?v=sample1'
        ]
      },
      status: 'approved',
      applied_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3일 전
      reviewed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1일 전
      reviewer_id: business1.id,
      review_notes: '포트폴리오와 팔로워 수 우수. 브랜드 톤앤매너 적합.'
    },
    {
      campaign_id: campaigns[0].id,
      creator_id: creator2.id,
      message: `
${creator2.full_name}입니다. 신제품 런칭 캠페인에 관심이 많습니다!

**활동 현황:**
- 틱톡 ${creator2.follower_count?.toLocaleString() || '18,000'}명
- 짧은 영상 콘텐츠 전문
- 트렌디한 편집 스타일
- Z세대 타겟 콘텐츠

꼭 함께 일하고 싶습니다. 검토 부탁드립니다!
      `.trim(),
      portfolio_links: {
        tiktok: 'https://tiktok.com/@creator2_trend',
        instagram: 'https://instagram.com/creator2_official'
      },
      status: 'pending',
      applied_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1일 전
    },
    {
      campaign_id: campaigns[0].id,
      creator_id: creator3.id,
      message: `
신입 크리에이터 ${creator3.full_name}입니다.

팔로워는 적지만 열정적으로 참여하겠습니다!
콘텐츠 퀄리티로 보답하겠습니다.
      `.trim(),
      portfolio_links: {
        instagram: 'https://instagram.com/creator3_newbie'
      },
      status: 'rejected',
      applied_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5일 전
      reviewed_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4일 전
      reviewer_id: business1.id,
      review_notes: '팔로워 수 미달. 경력 부족으로 이번 캠페인에는 부적합.'
    },

    // 캠페인 2 신청들  
    {
      campaign_id: campaigns[1].id,
      creator_id: creator1.id,
      message: `
브랜드 스토리 콘텐츠 제작에 매우 관심이 있습니다!

**스토리텔링 경험:**
- 브랜드 다큐멘터리 제작 경험
- 감성적 콘텐츠 전문
- 장기 파트너십 선호

브랜드의 가치를 잘 전달할 수 있습니다.
      `.trim(),
      portfolio_links: {
        youtube: 'https://youtube.com/watch?v=brand_story1',
        instagram: 'https://instagram.com/p/brand_content1'
      },
      status: 'approved',
      applied_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2일 전
      reviewed_at: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12시간 전
      reviewer_id: business1.id,
      review_notes: '스토리텔링 능력 우수. 브랜드 콘셉트 이해도 높음.'
    },
    {
      campaign_id: campaigns[1].id,
      creator_id: creator2.id,
      message: `
영상 편집 스킬을 활용한 브랜드 콘텐츠 제작 희망합니다.

**기술 역량:**
- Adobe Premiere Pro 고급
- After Effects 모션그래픽
- 감성적 색감 보정 전문

장기 협업 가능합니다!
      `.trim(),
      portfolio_links: {
        youtube: 'https://youtube.com/channel/creator2_video',
        vimeo: 'https://vimeo.com/creator2portfolio'
      },
      status: 'pending',
      applied_at: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6시간 전
    }
  ];

  const createdApplications = [];
  for (const application of applications) {
    const { data, error } = await supabase
      .from('campaign_applications')
      .insert(application)
      .select()
      .single();

    if (error) {
      throw new Error(`신청서 생성 실패: ${error.message}`);
    }

    createdApplications.push(data);
    console.log(`✅ 신청서 생성: ${application.status} (${data.id.substring(0, 8)}...)`);
  }

  return createdApplications;
}

/**
 * 결제 및 추천 수익 데이터 생성
 */
async function createPaymentData(campaigns, applications) {
  console.log('💳 결제 및 추천 수익 데이터 생성 중...');

  const business1 = await getProfile('business1@test.com');
  const creator1 = await getProfile('creator1@test.com');

  // 승인된 신청서에 대한 완료된 결제 생성
  const approvedApplications = applications.filter(app => app.status === 'approved');
  
  const payments = [];
  for (const application of approvedApplications) {
    const campaign = campaigns.find(c => c.id === application.campaign_id);
    const baseAmount = 1000000; // 기본 100만원
    const commissionAmount = baseAmount * campaign.commission_rate;

    const payment = {
      campaign_id: campaign.id,
      creator_id: application.creator_id,
      business_id: business1.id,
      amount: baseAmount,
      commission_amount: commissionAmount,
      status: 'completed',
      payment_method: 'bank_transfer',
      transaction_id: `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      completed_at: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) // 최근 24시간 내
    };

    const { data, error } = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single();

    if (error) {
      throw new Error(`결제 생성 실패: ${error.message}`);
    }

    payments.push(data);
    console.log(`✅ 결제 생성: ${commissionAmount.toLocaleString()}원 (${data.id.substring(0, 8)}...)`);

    // 결제 완료로 인한 추천 수익 자동 생성 (트리거에 의해)
    // create_referral_earnings 함수가 자동으로 호출됨
  }

  // 추천 수익 조회
  const { data: referralEarnings, error: earningsError } = await supabase
    .from('referral_earnings')
    .select(`
      *,
      referrer:profiles!referral_earnings_referrer_id_fkey(full_name, email),
      referred:profiles!referral_earnings_referred_id_fkey(full_name, email)
    `)
    .order('created_at', { ascending: false });

  if (earningsError) {
    console.warn('추천 수익 조회 실패:', earningsError.message);
  } else {
    console.log(`💰 추천 수익 생성 확인: ${referralEarnings.length}건`);
    referralEarnings.forEach(earning => {
      console.log(`   L${earning.level}: ${earning.amount.toLocaleString()}원 (${earning.referrer.full_name} ← ${earning.referred.full_name})`);
    });
  }

  return { payments, referralEarnings };
}

/**
 * 생성 결과 리포트
 */
function printReport(data) {
  console.log('\n📊 테스트 데이터 생성 결과 리포트');
  console.log('=' .repeat(50));

  console.log(`📋 캠페인: ${data.campaigns.length}개`);
  data.campaigns.forEach(campaign => {
    console.log(`   - ${campaign.title}`);
    console.log(`     예산: ${campaign.budget.toLocaleString()}원, 커미션: ${(campaign.commission_rate * 100)}%`);
  });

  console.log(`\n📝 신청서: ${data.applications.length}개`);
  const statusCounts = data.applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});
  Object.entries(statusCounts).forEach(([status, count]) => {
    const statusKr = { approved: '승인', pending: '대기', rejected: '거절' }[status];
    console.log(`   - ${statusKr}: ${count}개`);
  });

  console.log(`\n💳 결제: ${data.payments.length}개`);
  const totalAmount = data.payments.reduce((sum, payment) => sum + payment.commission_amount, 0);
  console.log(`   - 총 커미션: ${totalAmount.toLocaleString()}원`);

  if (data.referralEarnings && data.referralEarnings.length > 0) {
    console.log(`\n💰 추천 수익: ${data.referralEarnings.length}건`);
    const totalReferralAmount = data.referralEarnings.reduce((sum, earning) => sum + parseFloat(earning.amount), 0);
    console.log(`   - 총 추천 수익: ${totalReferralAmount.toLocaleString()}원`);
  }

  console.log('\n✅ 테스트 데이터 생성 완료!');
  console.log('\n📝 다음 단계:');
  console.log('1. npm run test:accounts:verify - 전체 계정 검증');
  console.log('2. 각 계정으로 로그인하여 기능 테스트');
  console.log('3. docs/test-accounts/ 문서 확인');
}

/**
 * 메인 실행 함수
 */
async function main() {
  try {
    console.log('🎯 Voosting 테스트 데이터 생성을 시작합니다...\n');

    // 1. 캠페인 생성
    const campaigns = await createSampleCampaigns();
    
    // 2. 신청서 생성
    const applications = await createCampaignApplications(campaigns);
    
    // 3. 결제 및 추천 수익 생성
    const { payments, referralEarnings } = await createPaymentData(campaigns, applications);

    // 4. 결과 리포트
    printReport({
      campaigns,
      applications, 
      payments,
      referralEarnings
    });

    console.log('\n🎉 모든 테스트 데이터 생성이 완료되었습니다!');
  } catch (error) {
    console.error('❌ 테스트 데이터 생성 실패:', error);
    process.exit(1);
  }
}

// 스크립트 직접 실행시에만 main 함수 호출
if (require.main === module) {
  main();
}

module.exports = {
  createSampleCampaigns,
  createCampaignApplications,
  createPaymentData
};
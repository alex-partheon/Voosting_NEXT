# 캠페인 및 결제 테스트 데이터

Voosting 플랫폼의 캠페인 생태계 테스트를 위한 샘플 데이터 구조와 시나리오입니다.

## 📋 캠페인 데이터 구조

### 캠페인 1: 신제품 런칭 인플루언서 마케팅

**기본 정보**:
- **제목**: 신제품 런칭 인플루언서 마케팅
- **광고주**: business1@test.com (테스트 광고주 A)
- **예산**: 3,000,000원
- **커미션율**: 15%
- **진행 기간**: 30일
- **상태**: 활성 (active)

**상세 설명**:
```
새로운 뷰티 제품 런칭을 위한 인플루언서 마케팅 캠페인입니다.

캠페인 목표:
- 브랜드 인지도 향상
- 제품 체험 후기 콘텐츠 제작
- 구매 전환율 증대

요구사항:
- 뷰티/라이프스타일 카테고리 크리에이터
- 팔로워 10,000명 이상
- 인스타그램/유튜브/틱톡 플랫폼 활용
- 1개월간 3회 이상 콘텐츠 게시

제공 혜택:
- 제품 무료 제공 (5만원 상당)
- 콘텐츠 제작비 별도 지급
- 우수 콘텐츠 선정시 추가 보너스
```

**기술적 요구사항**:
```json
{
  "platforms": ["instagram", "youtube", "tiktok"],
  "categories": ["뷰티", "라이프스타일"],
  "min_followers": 10000,
  "content_count": 3,
  "duration_days": 30,
  "deliverables": [
    "언박싱 영상/사진",
    "제품 체험 후기",
    "일상 속 제품 사용 콘텐츠"
  ]
}
```

### 캠페인 2: 브랜드 스토리 콘텐츠 제작

**기본 정보**:
- **제목**: 브랜드 스토리 콘텐츠 제작
- **광고주**: business1@test.com (테스트 광고주 A)
- **예산**: 5,000,000원
- **커미션율**: 20%
- **진행 기간**: 45일
- **상태**: 활성 (active)

**상세 설명**:
```
브랜드의 가치와 스토리를 전달하는 콘텐츠 제작 캠페인입니다.

캠페인 목표:
- 브랜드 스토리 및 가치 전달
- 감성적 연결고리 형성
- 브랜드 로열티 구축

요구사항:
- 스토리텔링 능력 우수
- 편집 스킬 보유
- 장기 파트너십 가능성
- 브랜드 가치 이해도

제공 혜택:
- 경쟁력 있는 제작비
- 장기 계약 우선권
- 크리에이터 네트워킹 기회
```

**기술적 요구사항**:
```json
{
  "platforms": ["youtube", "instagram"],
  "categories": ["라이프스타일", "브랜딩"],
  "min_followers": 5000,
  "content_count": 2,
  "duration_days": 45,
  "skills": ["스토리텔링", "영상편집", "사진편집"],
  "deliverables": [
    "브랜드 스토리 영상 (3-5분)",
    "일상 속 브랜드 콘텐츠",
    "브랜드 가치 전달 포스트"
  ]
}
```

## 📝 신청서 데이터

### 신청서 1: creator1 → 캠페인1 (승인됨)

**신청 정보**:
- **신청자**: creator1@test.com (크리에이터 1호)
- **캠페인**: 신제품 런칭 인플루언서 마케팅
- **신청일**: 3일 전
- **검토일**: 1일 전
- **상태**: 승인 (approved)
- **검토자**: business1@test.com

**신청 메시지**:
```
안녕하세요! 뷰티 콘텐츠 전문 크리에이터 크리에이터 1호입니다.

제 강점:
- 인스타그램 팔로워 25,000명
- 뷰티 리뷰 전문 (3년 경력)
- 평균 인게이지먼트율 4.2%
- 제품 체험 후기 전문

포트폴리오:
- 최근 스킨케어 브랜드 협업 (조회수 15만 달성)
- 메이크업 튜토리얼 시리즈 운영
- 브랜드 협업 만족도 98%

이번 캠페인을 통해 귀하의 신제품을 많은 분들께 소개하고 싶습니다!
```

**포트폴리오 링크**:
```json
{
  "instagram": "https://instagram.com/creator1_beauty",
  "youtube": "https://youtube.com/creator1beauty",
  "recent_works": [
    "https://instagram.com/p/sample1",
    "https://youtube.com/watch?v=sample1"
  ]
}
```

**검토 메모**: "포트폴리오와 팔로워 수 우수. 브랜드 톤앤매너 적합."

### 신청서 2: creator2 → 캠페인1 (대기 중)

**신청 정보**:
- **신청자**: creator2@test.com (크리에이터 2호)
- **캠페인**: 신제품 런칭 인플루언서 마케팅
- **신청일**: 1일 전
- **상태**: 대기 중 (pending)

**신청 메시지**:
```
크리에이터 2호입니다. 신제품 런칭 캠페인에 관심이 많습니다!

활동 현황:
- 틱톡 18,000명
- 짧은 영상 콘텐츠 전문
- 트렌디한 편집 스타일
- Z세대 타겟 콘텐츠

꼭 함께 일하고 싶습니다. 검토 부탁드립니다!
```

**포트폴리오 링크**:
```json
{
  "tiktok": "https://tiktok.com/@creator2_trend",
  "instagram": "https://instagram.com/creator2_official"
}
```

### 신청서 3: creator3 → 캠페인1 (거절됨)

**신청 정보**:
- **신청자**: creator3@test.com (크리에이터 3호)
- **캠페인**: 신제품 런칭 인플루언서 마케팅
- **신청일**: 5일 전
- **검토일**: 4일 전
- **상태**: 거절 (rejected)
- **검토자**: business1@test.com

**신청 메시지**:
```
신입 크리에이터 크리에이터 3호입니다.

팔로워는 적지만 열정적으로 참여하겠습니다!
콘텐츠 퀄리티로 보답하겠습니다.
```

**포트폴리오 링크**:
```json
{
  "instagram": "https://instagram.com/creator3_newbie"
}
```

**거절 사유**: "팔로워 수 미달. 경력 부족으로 이번 캠페인에는 부적합."

### 신청서 4: creator1 → 캠페인2 (승인됨)

**신청 정보**:
- **신청자**: creator1@test.com (크리에이터 1호)
- **캠페인**: 브랜드 스토리 콘텐츠 제작
- **신청일**: 2일 전
- **검토일**: 12시간 전
- **상태**: 승인 (approved)
- **검토자**: business1@test.com

**신청 메시지**:
```
브랜드 스토리 콘텐츠 제작에 매우 관심이 있습니다!

스토리텔링 경험:
- 브랜드 다큐멘터리 제작 경험
- 감성적 콘텐츠 전문
- 장기 파트너십 선호

브랜드의 가치를 잘 전달할 수 있습니다.
```

**포트폴리오 링크**:
```json
{
  "youtube": "https://youtube.com/watch?v=brand_story1",
  "instagram": "https://instagram.com/p/brand_content1"
}
```

**검토 메모**: "스토리텔링 능력 우수. 브랜드 콘셉트 이해도 높음."

### 신청서 5: creator2 → 캠페인2 (대기 중)

**신청 정보**:
- **신청자**: creator2@test.com (크리에이터 2호)
- **캠페인**: 브랜드 스토리 콘텐츠 제작
- **신청일**: 6시간 전
- **상태**: 대기 중 (pending)

**신청 메시지**:
```
영상 편집 스킬을 활용한 브랜드 콘텐츠 제작 희망합니다.

기술 역량:
- Adobe Premiere Pro 고급
- After Effects 모션그래픽
- 감성적 색감 보정 전문

장기 협업 가능합니다!
```

**포트폴리오 링크**:
```json
{
  "youtube": "https://youtube.com/channel/creator2_video",
  "vimeo": "https://vimeo.com/creator2portfolio"
}
```

## 💳 결제 데이터

### 결제 1: creator1 캠페인1 완료

**결제 정보**:
- **결제 ID**: `payment_001`
- **캠페인**: 신제품 런칭 인플루언서 마케팅
- **크리에이터**: creator1@test.com
- **비즈니스**: business1@test.com
- **기본 금액**: 1,000,000원
- **커미션 금액**: 150,000원 (15%)
- **결제 방법**: 계좌이체 (bank_transfer)
- **거래 ID**: `TXN_20250805_A1B2C3`
- **완료일**: 어제

**추천 수익 자동 분배**:
```sql
-- creator1의 추천 체인 없음 (최상위)
-- 추천 수익 발생하지 않음
```

### 결제 2: creator1 캠페인2 완료

**결제 정보**:
- **결제 ID**: `payment_002`
- **캠페인**: 브랜드 스토리 콘텐츠 제작
- **크리에이터**: creator1@test.com
- **비즈니스**: business1@test.com
- **기본 금액**: 1,000,000원
- **커미션 금액**: 200,000원 (20%)
- **결제 방법**: 계좌이체 (bank_transfer)
- **거래 ID**: `TXN_20250805_D4E5F6`
- **완료일**: 12시간 전

**추천 수익 자동 분배**:
```sql
-- creator1의 추천 체인 없음 (최상위)
-- 추천 수익 발생하지 않음
```

## 💰 추천 수익 시뮬레이션

### 시나리오: creator3 결제 완료시

**가정**: creator3가 새로운 캠페인에서 100만원 결제 완료

**자동 생성되는 추천 수익**:

#### referral_earnings 테이블 삽입 데이터

```sql
-- L1 추천 수익 (creator2 ← creator3)
INSERT INTO referral_earnings (
    referrer_id, referred_id, level, commission_rate, amount,
    campaign_id, payment_id, status
) VALUES (
    'creator2_clerk_id', 'creator3_clerk_id', 1, 0.10, 100000.00,
    'new_campaign_id', 'payment_003', 'pending'
);

-- L2 추천 수익 (creator1 ← creator3)
INSERT INTO referral_earnings (
    referrer_id, referred_id, level, commission_rate, amount,
    campaign_id, payment_id, status
) VALUES (
    'creator1_clerk_id', 'creator3_clerk_id', 2, 0.05, 50000.00,
    'new_campaign_id', 'payment_003', 'pending'
);
```

**결과 통계**:
- creator3: 1,000,000원 (직접 수익)
- creator2: 100,000원 (L1 추천 수익)
- creator1: 50,000원 (L2 추천 수익)

### 시나리오: creator2 결제 완료시

**가정**: creator2가 대기 중인 캠페인에서 승인받아 150만원 결제 완료

**자동 생성되는 추천 수익**:

#### referral_earnings 테이블 삽입 데이터

```sql
-- L1 추천 수익 (creator1 ← creator2)
INSERT INTO referral_earnings (
    referrer_id, referred_id, level, commission_rate, amount,
    campaign_id, payment_id, status
) VALUES (
    'creator1_clerk_id', 'creator2_clerk_id', 1, 0.10, 150000.00,
    'campaign_id', 'payment_004', 'pending'
);
```

**결과 통계**:
- creator2: 1,500,000원 (직접 수익)
- creator1: 150,000원 (L1 추천 수익)

## 📊 데이터 검증 쿼리

### 캠페인 현황 조회

```sql
-- 전체 캠페인 현황
SELECT 
    c.title,
    c.budget,
    c.commission_rate * 100 as commission_percentage,
    c.status,
    p.company_name as advertiser,
    COUNT(ca.id) as application_count
FROM campaigns c
JOIN profiles p ON c.business_id = p.id
LEFT JOIN campaign_applications ca ON c.id = ca.campaign_id
GROUP BY c.id, c.title, c.budget, c.commission_rate, c.status, p.company_name
ORDER BY c.created_at;
```

### 신청서 현황 조회

```sql
-- 신청서 현황 통계
SELECT 
    c.title as campaign_title,
    ca.status,
    COUNT(*) as count
FROM campaign_applications ca
JOIN campaigns c ON ca.campaign_id = c.id
GROUP BY c.title, ca.status
ORDER BY c.title, ca.status;
```

### 결제 및 추천 수익 조회

```sql
-- 결제 내역 및 관련 추천 수익
SELECT 
    p.id as payment_id,
    p.amount,
    p.commission_amount,
    creator.full_name as creator_name,
    COUNT(re.id) as referral_earnings_count,
    COALESCE(SUM(re.amount), 0) as total_referral_amount
FROM payments p
JOIN profiles creator ON p.creator_id = creator.id
LEFT JOIN referral_earnings re ON p.id = re.payment_id
WHERE p.status = 'completed'
GROUP BY p.id, p.amount, p.commission_amount, creator.full_name
ORDER BY p.completed_at DESC;
```

### 사용자별 수익 통계

```sql
-- 사용자별 총 수익 통계
SELECT 
    p.full_name,
    p.email,
    p.role,
    -- 직접 수익 (크리에이터인 경우)
    COALESCE(direct.total_commission, 0) as direct_earnings,
    -- 추천 수익
    COALESCE(referral.total_referral, 0) as referral_earnings,
    -- 총 수익
    COALESCE(direct.total_commission, 0) + COALESCE(referral.total_referral, 0) as total_earnings
FROM profiles p
LEFT JOIN (
    SELECT 
        creator_id,
        SUM(commission_amount) as total_commission
    FROM payments 
    WHERE status = 'completed'
    GROUP BY creator_id
) direct ON p.id = direct.creator_id
LEFT JOIN (
    SELECT 
        referrer_id,
        SUM(amount) as total_referral
    FROM referral_earnings 
    WHERE status = 'pending'
    GROUP BY referrer_id
) referral ON p.id = referral.referrer_id
WHERE p.email LIKE '%@test.com'
ORDER BY total_earnings DESC;
```

## 🧪 테스트 시나리오

### 기본 데이터 확인

```bash
# 1. 스크립트 실행으로 데이터 생성
npm run test:data:create

# 2. 데이터 생성 확인
npm run test:accounts:verify
```

### UI에서 데이터 확인

#### business1 로그인
1. **대시보드**: 2개 캠페인, 5개 신청서, 2건 결제 완료
2. **캠페인 관리**: 각 캠페인별 신청자 현황
3. **신청서 검토**: 승인/대기/거절 상태별 신청서
4. **결제 관리**: 완료된 결제 내역 및 정산

#### creator1 로그인
1. **수익 대시보드**: 직접 수익 350,000원 (150,000 + 200,000)
2. **캠페인 현황**: 2개 승인된 캠페인 참여 중
3. **추천 현황**: creator2 직접 추천, creator3 간접 추천

#### creator2 로그인
1. **수익 대시보드**: 직접 수익 0원, 대기 중인 신청서
2. **추천 현황**: creator3 직접 추천

#### creator3 로그인
1. **수익 대시보드**: 직접 수익 0원, 거절된 신청서
2. **추천 현황**: 추천한 사용자 없음

### 추가 테스트 데이터 생성

#### 새로운 캠페인 생성 테스트

```javascript
// business2로 로그인하여 새 캠페인 생성
const newCampaign = {
  title: "패션 아이템 홍보 캠페인",
  description: "신규 패션 브랜드 홍보를 위한 캠페인",
  budget: 2000000,
  commission_rate: 0.12,
  requirements: {
    platforms: ["instagram", "tiktok"],
    categories: ["패션", "라이프스타일"],
    min_followers: 8000
  }
};
```

#### 추가 신청서 생성 테스트

```javascript
// creator3가 새 캠페인에 신청
const newApplication = {
  message: "패션 콘텐츠에 도전하고 싶습니다!",
  portfolio_links: {
    instagram: "https://instagram.com/creator3_fashion"
  }
};
```

## 🔧 데이터 관리

### 초기화 및 재생성

```bash
# 모든 테스트 데이터 삭제
npm run test:accounts:reset

# 계정 재생성
npm run test:accounts:create

# 데이터 재생성  
npm run test:data:create
```

### 부분 데이터 업데이트

```sql
-- 신청서 상태 변경
UPDATE campaign_applications 
SET status = 'approved', reviewed_at = NOW(), reviewer_id = 'business1_clerk_id'
WHERE creator_id = 'creator2_clerk_id' AND status = 'pending';

-- 결제 완료 처리 (추천 수익 자동 생성됨)
UPDATE payments 
SET status = 'completed', completed_at = NOW()
WHERE creator_id = 'creator2_clerk_id';
```

### 수동 추천 수익 생성

```sql
-- 수동으로 추천 수익 생성 (트리거 우회)
SELECT create_referral_earnings(
    'creator3_clerk_id',  -- 수익 발생자
    1000000.00,          -- 수익 금액
    'campaign_id',       -- 캠페인 ID
    'payment_id'         -- 결제 ID
);
```

---

**참고**: 이 테스트 데이터는 실제 프로덕션 환경의 다양한 시나리오를 반영하여 설계되었습니다.
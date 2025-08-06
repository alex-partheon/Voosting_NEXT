# 3단계 추천 체인 테스트 가이드

Voosting 플랫폼의 핵심 기능인 3단계 추천 시스템의 구조, 수익 분배, 테스트 방법을 상세히 설명합니다.

## 🔗 추천 체인 구조

### 기본 원리

```
Level 1 (L1) ──10%──→ Level 2 (L2) ──5%──→ Level 3 (L3) ──2%──→ Level 4
     A                    B                   C                D
```

- **L1 추천인**: 직접 추천한 사용자로부터 **10%** 수익
- **L2 추천인**: 간접 추천한 사용자로부터 **5%** 수익  
- **L3 추천인**: 2단계 간접 추천 사용자로부터 **2%** 수익

### 테스트 계정 추천 체인

```
creator1@test.com (CREATOR1)
    │
    ├─ 10% ─────┐
    │           │
    ▼           │
creator2@test.com   │
    │           │
    ├─ 10% ─────┼─ 5% ───┐
    │           │        │
    ▼           ▼        │
creator3@test.com   creator1  │
                      │        │
                      ▼        ▼
                  + 10%    + 5%
```

**실제 관계**:
- creator1 → creator2 → creator3
- creator3가 수익 얻을 때: creator2(10%) + creator1(5%)
- creator2가 수익 얻을 때: creator1(10%)

## 💰 수익 분배 계산

### 시나리오 1: creator3가 100만원 수익 달성

**결제 완료시 자동 분배**:
```sql
-- creator3 직접 수익
100만원 (원본 수익)

-- 추천 수익 자동 생성
INSERT INTO referral_earnings:
- creator2: 10만원 (L1, 10%)
- creator1: 5만원 (L2, 5%)
```

**결과**:
- creator3: 100만원 (직접)
- creator2: 10만원 (L1 추천 수익)
- creator1: 5만원 (L2 추천 수익)

### 시나리오 2: creator2가 150만원 수익 달성

**결제 완료시 자동 분배**:
```sql
-- creator2 직접 수익
150만원 (원본 수익)

-- 추천 수익 자동 생성
INSERT INTO referral_earnings:
- creator1: 15만원 (L1, 10%)
```

**결과**:
- creator2: 150만원 (직접)
- creator1: 15만원 (L1 추천 수익)

### 시나리오 3: creator1의 총 수익

**creator1의 모든 수익원**:
1. **직접 수익**: 본인 캠페인 참여 수익
2. **L1 추천 수익**: creator2의 수익에서 10%
3. **L2 추천 수익**: creator3의 수익에서 5%

```
총 수익 = 직접 수익 + L1 수익 + L2 수익
```

## 🔧 기술 구현

### 데이터베이스 구조

#### profiles 테이블 추천 필드
```sql
CREATE TABLE profiles (
    id TEXT PRIMARY KEY,  -- Clerk User ID
    referrer_l1_id TEXT REFERENCES profiles(id),  -- 직접 추천인
    referrer_l2_id TEXT REFERENCES profiles(id),  -- 1단계 상위 추천인  
    referrer_l3_id TEXT REFERENCES profiles(id),  -- 2단계 상위 추천인
    referral_code TEXT NOT NULL UNIQUE,           -- 본인 추천 코드
    -- 기타 필드들...
);
```

#### referral_earnings 테이블
```sql
CREATE TABLE referral_earnings (
    id UUID PRIMARY KEY,
    referrer_id TEXT REFERENCES profiles(id),     -- 수익을 받는 추천인
    referred_id TEXT REFERENCES profiles(id),     -- 수익을 발생시킨 사용자
    level INTEGER CHECK (level IN (1, 2, 3)),     -- 추천 레벨 (1, 2, 3)
    commission_rate DECIMAL(5,2),                 -- 커미션율 (0.10, 0.05, 0.02)
    amount DECIMAL(10,2),                         -- 수익 금액
    campaign_id UUID REFERENCES campaigns(id),    -- 관련 캠페인
    payment_id UUID REFERENCES payments(id),      -- 관련 결제
    status TEXT DEFAULT 'pending',                -- 지급 상태
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ
);
```

### 추천 수익 자동 생성 함수

```sql
CREATE OR REPLACE FUNCTION create_referral_earnings(
    p_referred_id TEXT,      -- 수익 발생자 (creator3)
    p_amount DECIMAL(10,2),  -- 원본 수익 (100만원)
    p_campaign_id UUID DEFAULT NULL,
    p_payment_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_profile RECORD;
    v_commission_rates DECIMAL[] := ARRAY[0.10, 0.05, 0.02]; -- 10%, 5%, 2%
BEGIN
    -- 추천받은 사용자의 추천 체인 조회
    SELECT referrer_l1_id, referrer_l2_id, referrer_l3_id
    INTO v_profile
    FROM profiles
    WHERE id = p_referred_id;
    
    -- L1 추천인 수익 생성 (10%)
    IF v_profile.referrer_l1_id IS NOT NULL THEN
        INSERT INTO referral_earnings (
            referrer_id, referred_id, level, commission_rate, amount, 
            campaign_id, payment_id
        ) VALUES (
            v_profile.referrer_l1_id, p_referred_id, 1, 
            v_commission_rates[1], p_amount * v_commission_rates[1], 
            p_campaign_id, p_payment_id
        );
    END IF;
    
    -- L2 추천인 수익 생성 (5%)
    IF v_profile.referrer_l2_id IS NOT NULL THEN
        INSERT INTO referral_earnings (
            referrer_id, referred_id, level, commission_rate, amount,
            campaign_id, payment_id
        ) VALUES (
            v_profile.referrer_l2_id, p_referred_id, 2, 
            v_commission_rates[2], p_amount * v_commission_rates[2], 
            p_campaign_id, p_payment_id
        );
    END IF;
    
    -- L3 추천인 수익 생성 (2%)
    IF v_profile.referrer_l3_id IS NOT NULL THEN
        INSERT INTO referral_earnings (
            referrer_id, referred_id, level, commission_rate, amount,
            campaign_id, payment_id
        ) VALUES (
            v_profile.referrer_l3_id, p_referred_id, 3, 
            v_commission_rates[3], p_amount * v_commission_rates[3], 
            p_campaign_id, p_payment_id
        );
    END IF;
END;
$$ LANGUAGE plpgsql;
```

### 자동 트리거

```sql
-- 결제 완료시 추천 수익 자동 생성
CREATE OR REPLACE FUNCTION trigger_create_referral_earnings()
RETURNS TRIGGER AS $$
BEGIN
    -- 결제가 완료 상태로 변경될 때만 실행
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        PERFORM create_referral_earnings(
            NEW.creator_id,
            NEW.commission_amount,
            NEW.campaign_id,
            NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payments_create_referral_earnings
    AFTER UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_create_referral_earnings();
```

## 🧪 테스트 방법

### 1. 추천 체인 구성 확인

```sql
-- 추천 체인 전체 구조 조회
SELECT 
    id,
    full_name,
    email,
    referral_code,
    referrer_l1_id,
    referrer_l2_id,
    referrer_l3_id
FROM profiles 
WHERE email LIKE '%@test.com'
ORDER BY created_at;
```

**예상 결과**:
```
creator1: CREATOR1, null, null, null
creator2: AUTO_CODE, creator1_id, null, null  
creator3: AUTO_CODE, creator2_id, creator1_id, null
```

### 2. 추천 수익 계산 테스트

```bash
# 1. 계정 생성 (추천 체인 구성됨)
npm run test:accounts:create

# 2. 테스트 데이터 생성 (결제 완료 포함)
npm run test:data:create

# 3. 추천 수익 확인
npm run test:accounts:verify
```

### 3. 수동 추천 수익 계산 검증

```sql
-- creator3의 결제 완료 시뮬레이션
INSERT INTO payments (
    campaign_id, creator_id, business_id,
    amount, commission_amount, status,
    payment_method, transaction_id, completed_at
) VALUES (
    'campaign_id', 'creator3_clerk_id', 'business1_clerk_id',
    1000000, 150000, 'completed',
    'bank_transfer', 'TEST_TXN_001', NOW()
);

-- 추천 수익 자동 생성 확인 (트리거에 의해)
SELECT 
    r.*,
    referrer.full_name as referrer_name,
    referred.full_name as referred_name
FROM referral_earnings r
JOIN profiles referrer ON r.referrer_id = referrer.id
JOIN profiles referred ON r.referred_id = referred.id
WHERE r.referred_id = 'creator3_clerk_id'
ORDER BY r.level;
```

**예상 결과**:
```
Level 1: creator2 ← creator3, 15,000원 (10%)
Level 2: creator1 ← creator3, 7,500원 (5%)
```

### 4. 추천 통계 조회 테스트

```sql
-- 사용자별 추천 통계 뷰 활용
SELECT * FROM user_referral_stats;
```

**예상 결과**:
```
creator1: level1_referrals=1, level2_referrals=1, total_earnings=X
creator2: level1_referrals=1, level2_referrals=0, total_earnings=Y  
creator3: level1_referrals=0, level2_referrals=0, total_earnings=Z
```

## 🔍 UI/UX 테스트

### 크리에이터 대시보드에서 확인

#### creator1 로그인 후
1. **수익 대시보드**:
   - 직접 수익: 본인 캠페인 수익 표시
   - L1 추천 수익: creator2에서 발생한 수익
   - L2 추천 수익: creator3에서 발생한 수익

2. **추천 관리 페이지**:
   - 내 추천 코드: CREATOR1
   - 직접 추천인: creator2 (1명)
   - 간접 추천인: creator3 (1명, L2)

#### creator2 로그인 후
1. **수익 대시보드**:
   - 직접 수익: 본인 캠페인 수익
   - L1 추천 수익: creator3에서 발생한 수익

2. **추천 관리 페이지**:
   - 내 추천 코드: AUTO_GENERATED
   - 추천인: creator1 (CREATOR1 코드로 가입)
   - 직접 추천인: creator3 (1명)

#### creator3 로그인 후
1. **수익 대시보드**:
   - 직접 수익: 본인 캠페인 수익 (현재 0)

2. **추천 관리 페이지**:
   - 내 추천 코드: AUTO_GENERATED
   - 추천인: creator2 (해당 코드로 가입)
   - 직접 추천인: 없음

### 관리자 대시보드에서 확인

#### admin 로그인 후
1. **추천 관리 페이지**:
   - 전체 추천 체인 시각화
   - 추천 수익 내역 전체 조회
   - 레벨별 수익 분포

2. **사용자 관리**:
   - 각 사용자의 추천 관계 확인
   - 추천 코드별 사용 현황

## ⚠️ 주의사항 및 제한사항

### 비즈니스 규칙

#### 추천 제한
- **자기 추천 불가**: 본인 추천 코드로 가입 불가
- **중복 추천 불가**: 이미 가입된 이메일은 추천 적용 불가
- **추천 관계 고정**: 가입 후 추천 관계 변경 불가

#### 수익 지급 규칙
- **최소 지급액**: 1만원 이상시 지급
- **지급 주기**: 월 1회 정산 (매월 말일)
- **세금 처리**: 원천징수 적용 (3.3%)

### 기술적 제한사항

#### 성능 고려사항
- **추천 체인 깊이**: 최대 3단계로 제한
- **순환 참조 방지**: 추천 관계 순환 검증
- **동시성 처리**: 결제 완료 처리시 락 적용

#### 데이터 무결성
- **외래키 제약조건**: 추천 관계 참조 무결성
- **트랜잭션 처리**: 추천 수익 생성은 트랜잭션 내에서
- **롤백 처리**: 결제 취소시 추천 수익도 함께 취소

## 🐛 트러블슈팅

### 일반적인 문제

#### 추천 수익이 생성되지 않음
**원인**: 결제 상태가 'completed'로 변경되지 않음
**해결**: 결제 테이블에서 status 확인 및 수동 업데이트

```sql
-- 결제 상태 확인
SELECT * FROM payments WHERE creator_id = 'creator_id';

-- 수동 상태 변경 (개발 환경에서만)
UPDATE payments SET status = 'completed' WHERE id = 'payment_id';
```

#### 추천 체인이 올바르게 구성되지 않음
**원인**: 계정 생성시 추천 코드 순서 문제
**해결**: 계정 생성 스크립트 순차 실행 확인

```bash
# 올바른 순서로 계정 재생성
npm run test:accounts:reset
npm run test:accounts:create
```

#### 수익 계산이 부정확함
**원인**: 커미션율 설정 오류 또는 함수 버그
**해결**: 함수 재생성 및 수동 계산 검증

```sql
-- 함수 재생성
\i supabase/migrations/004_update_profiles_clerk.sql

-- 수동 계산 검증
SELECT 
    amount,
    amount * 0.10 as expected_l1,
    amount * 0.05 as expected_l2,
    amount * 0.02 as expected_l3
FROM payments 
WHERE status = 'completed';
```

### 개발 환경 문제

#### 로컬 환경에서 추천 코드 입력 테스트
```bash
# 개발 서버에서 신규 계정 생성시
# 회원가입 페이지에서 추천 코드 'CREATOR1' 입력
# 추천 체인 자동 구성 확인
```

#### 프로덕션 배포 전 검증
```bash
# 모든 테스트 실행
npm run test:accounts:verify
npm run test:data:verify
npm run test:referral:verify
```

---

**참고**: 이 추천 시스템은 MLM(다단계)이 아닌 제한된 3단계 추천 시스템으로, 관련 법규를 준수합니다.
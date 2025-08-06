# Voosting 테스트 계정 가이드

Voosting 플랫폼의 개발 및 QA를 위한 체계적인 테스트 계정 시스템입니다.

## 📋 개요

이 테스트 계정 시스템은 다음을 포함합니다:
- **6개 역할별 테스트 계정** (크리에이터 3개, 비즈니스 2개, 관리자 1개)
- **3단계 추천 체인** (10% → 5% → 2% 커미션 구조)
- **완전한 캠페인 생태계** (캠페인, 신청서, 결제, 수익 분배)
- **실제 사용 시나리오** 기반 테스트 데이터

## 🚀 빠른 시작

### 1. 테스트 계정 생성

```bash
# 1. 모든 테스트 계정 생성
npm run test:accounts:create

# 2. 테스트 데이터 생성 (캠페인, 신청서, 결제)
npm run test:data:create

# 3. 계정 및 데이터 검증
npm run test:accounts:verify
```

### 2. 개발 서버 실행

```bash
npm run dev
```

### 3. 테스트 계정으로 로그인

각 역할별 대시보드에서 테스트:
- **메인 사이트**: http://localhost:3002
- **크리에이터**: http://creator.localhost:3002
- **비즈니스**: http://business.localhost:3002  
- **관리자**: http://admin.localhost:3002

## 📊 테스트 계정 구조

### 크리에이터 계정 (3개)
```
creator1@test.com → creator2@test.com → creator3@test.com
     (L1)              (L2)              (L3)
    10% ←────────── 5% ←────────── 2%
```

### 비즈니스 계정 (2개)
- **business1@test.com**: 활성 캠페인 보유자 (2개 캠페인 운영 중)
- **business2@test.com**: 신규 가입자 (빈 상태)

### 관리자 계정 (1개)
- **admin@test.com**: 플랫폼 전체 관리 권한

## 🔗 관련 문서

| 문서 | 설명 |
|------|------|
| [account-list.md](./account-list.md) | 전체 계정 목록 및 상세 정보 |
| [test-scenarios.md](./test-scenarios.md) | 역할별 테스트 시나리오 |
| [referral-chain.md](./referral-chain.md) | 3단계 추천 체인 테스트 가이드 |
| [campaign-test-data.md](./campaign-test-data.md) | 캠페인 및 결제 테스트 데이터 |

## 🔧 관리 명령어

### 계정 관리
```bash
# 계정 생성
npm run test:accounts:create

# 계정 검증
npm run test:accounts:verify

# 계정 초기화 (모든 데이터 삭제)
npm run test:accounts:reset
```

### 데이터 관리
```bash
# 테스트 데이터 생성
npm run test:data:create

# 데이터 초기화
npm run test:data:reset
```

## ⚠️ 주의사항

### 보안
- **개발 환경 전용**: 이 계정들은 개발 환경에서만 사용
- **프로덕션 금지**: 프로덕션 환경에 절대 배포하지 않음
- **비밀번호**: 모든 계정은 `testPassword123!` 사용

### 데이터 무결성
- **순차 실행**: 계정 생성 → 데이터 생성 순서로 실행
- **의존성**: 추천 체인 때문에 creator1 → creator2 → creator3 순서 중요
- **검증**: 각 단계 후 반드시 검증 스크립트 실행

### 개발 팁
- **브라우저 프로필**: 각 역할별로 별도 브라우저 프로필 사용 권장
- **시크릿 모드**: 여러 계정 동시 테스트시 시크릿 모드 활용
- **로컬 스토리지**: 계정 전환시 로컬 스토리지 초기화

## 🐛 문제 해결

### 계정 생성 실패
```bash
# Clerk API 키 확인
echo $CLERK_SECRET_KEY

# Supabase 연결 확인  
echo $SUPABASE_SERVICE_ROLE_KEY

# 환경 변수 재로드
source .env.local
```

### 로그인 문제
1. **계정 존재 확인**: Clerk Dashboard에서 계정 존재 여부 확인
2. **비밀번호 재설정**: Clerk에서 비밀번호 재설정
3. **프로필 확인**: Supabase에서 profiles 테이블 확인

### 추천 체인 문제
```sql
-- Supabase에서 추천 체인 확인
SELECT 
  id, full_name, referral_code,
  referrer_l1_id, referrer_l2_id, referrer_l3_id
FROM profiles 
WHERE email LIKE '%@test.com'
ORDER BY created_at;
```

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. [troubleshooting 가이드](../tech docs/troubleshooting.md)
2. Supabase 로그: http://localhost:54323
3. Clerk Dashboard: https://clerk.com/dashboard
4. 개발자 콘솔 에러 메시지

---

**마지막 업데이트**: 2025-08-05  
**버전**: 1.0.0  
**담당자**: 개발팀
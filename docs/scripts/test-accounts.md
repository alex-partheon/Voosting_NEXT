# Voosting 테스트 계정 가이드

이 문서는 Voosting 플랫폼의 테스트 계정 정보와 사용 방법을 설명합니다.

## 테스트 계정 목록

### 크리에이터 계정

#### Creator 1 (최상위 추천인)
- **이메일**: `creator1@test.com`
- **비밀번호**: `testPassword123!`
- **역할**: Creator
- **추천 코드**: `CRT001`
- **카테고리**: ["lifestyle", "fashion"]
- **팔로워 수**: 50,000
- **참여율**: 4.5%
- **추천 관계**: 없음 (최상위)

#### Creator 2 (Level 1)
- **이메일**: `creator2@test.com`
- **비밀번호**: `testPassword123!`
- **역할**: Creator
- **추천 코드**: `CRT002`
- **카테고리**: ["beauty", "lifestyle"]
- **팔로워 수**: 30,000
- **참여율**: 3.8%
- **추천 관계**: creator1에 의해 추천됨

#### Creator 3 (Level 2)
- **이메일**: `creator3@test.com`
- **비밀번호**: `testPassword123!`
- **역할**: Creator
- **추천 코드**: `CRT003`
- **카테고리**: ["tech", "gaming"]
- **팔로워 수**: 75,000
- **참여율**: 5.2%
- **추천 관계**: creator2에 의해 추천됨 (L2: creator1)

### 비즈니스 계정

#### Business 1
- **이메일**: `business1@test.com`
- **비밀번호**: `testPassword123!`
- **역할**: Business
- **추천 코드**: `BIZ001`
- **회사명**: 테스트 컴퍼니 1
- **사업자 등록번호**: 123-45-67890
- **추천 관계**: creator3에 의해 추천됨 (L2: creator2, L3: creator1)

#### Business 2
- **이메일**: `business2@test.com`
- **비밀번호**: `testPassword123!`
- **역할**: Business
- **추천 코드**: `BIZ002`
- **회사명**: 테스트 컴퍼니 2
- **사업자 등록번호**: 098-76-54321
- **추천 관계**: business1에 의해 추천됨 (L2: creator3, L3: creator2)

### 관리자 계정

#### Admin
- **이메일**: `admin@test.com`
- **비밀번호**: `testPassword123!`
- **역할**: Admin
- **추천 코드**: `ADM001`
- **추천 관계**: 없음

## 추천 체인 구조

```
creator1 (L0) → creator2 (L1) → creator3 (L2) → business1 (L3) → business2 (L4)
```

### 커미션 계산 예시

만약 business2가 100,000원의 커미션을 발생시킨다면:
- **business1** (L1): 10,000원 (10%)
- **creator3** (L2): 5,000원 (5%)
- **creator2** (L3): 2,000원 (2%)

## 테스트 데이터

### 캠페인
1. **신제품 런칭 인플루언서 마케팅**
   - 예산: 3,000,000원
   - 커미션: 15%
   - 상태: 활성

2. **브랜드 스토리 콘텐츠 제작**
   - 예산: 5,000,000원
   - 커미션: 20%
   - 상태: 활성

### 신청서
- 승인된 신청서: 2개
- 대기 중인 신청서: 2개
- 거절된 신청서: 1개

### 결제
- creator1: 150,000원 결제 완료
- creator1: 200,000원 결제 완료
- 총 커미션: 350,000원

## 테스트 시나리오

### 1. 로그인 테스트
각 계정으로 로그인하여 대시보드 접근 확인:
- http://creator.localhost:3002 (크리에이터 대시보드)
- http://business.localhost:3002 (비즈니스 대시보드)
- http://admin.localhost:3002 (관리자 대시보드)

### 2. 권한 테스트
- 크리에이터: 본인 프로필 및 신청서만 접근 가능
- 비즈니스: 본인 캠페인 및 신청서만 접근 가능
- 관리자: 모든 데이터 접근 가능

### 3. 추천 시스템 테스트
1. 새로운 사용자가 추천 코드로 가입
2. 추천 체인이 올바르게 설정되는지 확인
3. 커미션 발생 시 추천 수익이 올바르게 계산되는지 확인

## 관리 명령어

### 계정 생성
```bash
npm run test:accounts:create
```

### 테스트 데이터 생성
```bash
npm run test:data:create
```

### 계정 검증
```bash
npm run test:accounts:verify
```

### 계정 초기화
```bash
npm run test:accounts:reset
```

## 주의사항

1. **개발 환경 전용**: 이 계정들은 개발 및 테스트 목적으로만 사용해야 합니다.
2. **정기 초기화**: 테스트 후에는 `npm run test:accounts:reset`으로 데이터를 정리하세요.
3. **보안**: 실제 운영 환경에서는 절대 사용하지 마세요.
4. **로컬 호스트 설정**: 서브도메인 테스트를 위해 `/etc/hosts` 파일에 다음을 추가하세요:
   ```
   127.0.0.1 creator.localhost
   127.0.0.1 business.localhost
   127.0.0.1 admin.localhost
   ```

## 문제 해결

### 로그인 실패
- Supabase 연결 상태 확인
- 환경 변수 설정 확인
- 계정이 올바르게 생성되었는지 확인

### 권한 오류
- RLS 정책 확인
- 사용자 역할이 올바르게 설정되었는지 확인
- 세션 상태 확인

### 추천 체인 오류
- 데이터베이스 트리거 확인
- 추천 코드 중복 여부 확인
- 추천 관계 데이터 무결성 확인

---

**마지막 업데이트**: 2024년 12월
**작성자**: Senior Lead Developer
**버전**: 1.0.0
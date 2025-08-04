# TASK2.MD - Enhanced MVP (Week 9-12)

# 🥈 Enhanced MVP 개발 태스크 - 차별화 기능 구현

**🎯 MVP 목표**: 핵심 차별화 기능 구현  
**개발 기간**: 4주 (Week 9-12)  
**포함 태스크**: 78개 (35.3%)  
**개발 방법론**: Behavior-Driven Development (BDD) + Design Thinking + Agile/Scrum

## 📖 목차

- [Enhanced MVP 개요](#enhanced-mvp-개요)
- [개발 방법론](#개발-방법론)
- [Phase 5: 추천 시스템 및 결제 (Week 12-14)](#phase-5-추천-시스템-및-결제-week-12-14)

---

## 🎯 Enhanced MVP 개요

### 차별화 가치 제안

- 직관적인 페이지 빌더로 전문성 없이도 멋진 페이지 제작
- AI 추천으로 적합한 캠페인 자동 매칭
- 안전한 결제 시스템으로 신뢰성 확보
- 실시간 알림 시스템으로 즉각적인 상호작용

### 추가 기능

- 드래그앤드롭 페이지 빌더 (기본 블록)
- Google Gemini AI 기반 캠페인 매칭
- 토스페이먼츠 연동 및 자동 정산
- 실시간 알림 시스템
- 모바일 반응형 최적화

### 성공 지표 (12주 후)

- 총 사용자: 500명+
- 월 활성 사용자: 200명+
- 월 거래액: 100만원+
- 사용자 리텐션: 60%+

---

## 🛠 개발 방법론

### Behavior-Driven Development (BDD)

```yaml
사용자 스토리 중심:
  - Given-When-Then 시나리오 작성
  - 비즈니스 가치 중심 개발
  - 사용자 행동 패턴 분석
  - 받아들임 기준 명확화

BDD 프로세스:
  - Discovery: 비즈니스 요구사항 발견
  - Formulation: 시나리오 구체화
  - Automation: 자동화된 테스트 구현
  - Verification: 비즈니스 가치 검증

협업 도구:
  - Cucumber/Gherkin 시나리오
  - Living Documentation
  - Example Mapping
  - Three Amigos 세션
```

### Design Thinking

```yaml
사용자 중심 설계:
  - Empathize: 사용자 니즈 파악
  - Define: 문제 정의
  - Ideate: 아이디어 발상
  - Prototype: 프로토타이핑
  - Test: 사용자 테스트

디자인 프로세스:
  - 사용자 페르소나 정의
  - 사용자 여정 맵핑 (User Journey)
  - 와이어프레임 및 프로토타입
  - 사용성 테스트
  - 반복적 개선

도구 및 방법:
  - Figma 프로토타이핑
  - 사용자 인터뷰
  - A/B 테스트
  - 히트맵 분석
```

### Agile/Scrum 방법론

```yaml
스프린트 구성:
  - 1주 스프린트 (총 4개 스프린트)
  - 빠른 피드백 사이클
  - 지속적 통합 및 배포
  - 사용자 피드백 반영

개발 리듬:
  - 매일 스탠드업 (15분)
  - 스프린트 계획 (2시간)
  - 스프린트 리뷰 (1시간)
  - 회고 및 개선 (1시간)

품질 관리:
  - Definition of Done 준수
  - 코드 리뷰 및 페어 프로그래밍
  - 자동화된 테스트 및 배포
  - 성능 모니터링
```

---

## 💰 Phase 5: 추천 시스템 및 결제 (Week 12-14)

> **목표**: 3단계 추천 시스템 및 TossPayments 결제 연동  
> **기간**: 3주  
> **개발 방법론**: Domain-Driven Design + Security First + Test-Driven Development  
> **산출물**: 추천 네트워크, 수익 분배 시스템, 결제 시스템, 신원 인증

### 📅 Week 1: 추천 시스템 설계 및 구현

#### Day 1-2: 추천 시스템 아키텍처 설계

##### TASK-150: 3단계 추천 시스템 아키텍처 설계

**우선순위**: P0 🔴 **크기**: L (1일) **담당자**: Senior Lead Developer  
**개발 방법론**: Domain-Driven Design + Event Storming

**BDD 시나리오**:

```gherkin
Feature: 3단계 추천 시스템
  As a 크리에이터
  I want to 다른 사용자를 추천하여 수익을 얻을 수 있기를
  So that 지속적인 수입원을 확보할 수 있다

Scenario: 새로운 사용자 추천 등록
  Given 크리에이터가 로그인되어 있고
  When 새로운 사용자가 추천 링크로 가입하면
  Then 추천 관계가 데이터베이스에 저장되고
  And 3단계 추천 체인이 설정된다
```

**완료 기준**:

- [ ] 3단계 추천 도메인 모델 설계
- [ ] 추천 관계 테이블 스키마 정의
- [ ] 수익 분배 비즈니스 로직 설계
- [ ] 이벤트 기반 아키텍처 설계

---

##### TASK-151: 추천 코드 생성 시스템 구현

**우선순위**: P1 🟠 **크기**: M (6시간) **담당자**: Senior Lead Developer  
**개발 방법론**: Test-Driven Development + Security First

**완료 기준**:

- [x] 고유 추천 코드 생성 알고리즘
- [x] 추천 코드 검증 시스템
- [x] 추천 링크 생성 API
- [x] 보안 토큰 관리

---

##### TASK-152: 추천 관계 추적 시스템 구현

**우선순위**: P1 🟠 **크기**: L (1일) **담당자**: Senior Lead Developer  
**개발 방법론**: Domain-Driven Design + Event Sourcing

```sql
-- 추천 관계 테이블 예시
CREATE TABLE referral_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES profiles(id),
  referred_id UUID REFERENCES profiles(id),
  tier INTEGER CHECK (tier IN (1, 2, 3)),
  commission_rate DECIMAL(5,4),
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);
```

**완료 기준**:

- [ ] 3단계 추천 관계 추적 구현
- [ ] 추천 체인 검증 로직
- [ ] 순환 참조 방지 시스템
- [ ] 추천 통계 집계 함수

---

#### Day 3-4: 수익 분배 시스템

##### TASK-153: 자동 수익 분배 엔진 구현

**우선순위**: P0 🔴 **크기**: XL (2일) **담당자**: Senior Lead Developer  
**개발 방법론**: Domain-Driven Design + Event-Driven Architecture

**BDD 시나리오**:

```gherkin
Scenario: 캠페인 완료 시 자동 수익 분배
  Given 크리에이터가 캠페인을 완료했고
  And 3단계 추천 체인이 존재할 때
  When 수익 분배가 실행되면
  Then L1 추천자는 10% 수익을 받고
  And L2 추천자는 5% 수익을 받고
  And L3 추천자는 2% 수익을 받는다
```

**완료 기준**:

- [ ] SQL 트리거 기반 자동 분배
- [ ] 수익 계산 비즈니스 로직
- [ ] 분배 내역 로깅 시스템
- [ ] 에러 처리 및 롤백 메커니즘

---

##### TASK-154: 수익 내역 조회 API 구현

**우선순위**: P1 🟠 **크기**: M (6시간) **담당자**: Senior Lead Developer  
**개발 방법론**: API-First Design + Test-Driven Development

**완료 기준**:

- [ ] 개인 수익 내역 조회 API
- [ ] 추천 수익 내역 조회 API
- [ ] 수익 통계 조회 API
- [ ] 페이지네이션 및 필터링

---

##### TASK-155: 추천 대시보드 UI 구현

**우선순위**: P1 🟠 **크기**: L (1일) **담당자**: Senior Frontend Developer  
**개발 방법론**: Design Thinking + Component-Driven Development

**완료 기준**:

- [ ] 추천 현황 대시보드
- [ ] 추천 링크 공유 인터페이스
- [ ] 수익 내역 표시
- [ ] 추천 네트워크 시각화

---

### 📅 Week 2: 결제 시스템 통합

#### Day 1-2: TossPayments 연동

##### TASK-156: TossPayments SDK 통합

**우선순위**: P0 🔴 **크기**: L (1일) **담당자**: Senior Lead Developer  
**개발 방법론**: Security First + Test-Driven Development

**BDD 시나리오**:

```gherkin
Feature: 안전한 결제 처리
  As a 비즈니스 사용자
  I want to 안전하게 결제를 처리할 수 있기를
  So that 신뢰할 수 있는 거래를 진행할 수 있다

Scenario: 캠페인 결제 처리
  Given 비즈니스 사용자가 캠페인을 생성했고
  When 결제 정보를 입력하고 결제 버튼을 클릭하면
  Then TossPayments를 통해 안전하게 결제가 처리되고
  And 결제 완료 후 캠페인이 활성화된다
```

**완료 기준**:

- [ ] TossPayments JavaScript SDK 통합
- [ ] 서버 사이드 결제 검증
- [ ] 결제 보안 정책 구현
- [ ] 결제 실패 처리 로직

---

##### TASK-157: 결제 관리 API 구현

**우선순위**: P1 🟠 **크기**: M (6시간) **담당자**: Senior Lead Developer  
**개발 방법론**: API-First Design + Security First

**완료 기준**:

- [ ] 결제 요청 생성 API
- [ ] 결제 상태 조회 API
- [ ] 결제 취소/환불 API
- [ ] 결제 내역 조회 API

---

##### TASK-158: 자동 정산 시스템 구현

**우선순위**: P1 🟠 **크기**: L (1일) **담당자**: Senior Lead Developer  
**개발 방법론**: Event-Driven Architecture + Batch Processing

**완료 기준**:

- [ ] 정산 스케줄러 구현
- [ ] 정산 계산 로직
- [ ] 정산 승인 워크플로우
- [ ] 정산 내역 관리

---

#### Day 3-4: 신원 인증 시스템

##### TASK-159: 토스 1원 인증 API 연동

**우선순위**: P1 🟠 **크기**: M (6시간) **담당자**: Senior Lead Developer  
**개발 방법론**: Security First + Test-Driven Development

**BDD 시나리오**:

```gherkin
Feature: 계좌 인증을 통한 신원 확인
  As a 크리에이터
  I want to 계좌 인증을 통해 신원을 확인받고 싶다
  So that 정산 시 안전하게 수익을 받을 수 있다

Scenario: 1원 인증 프로세스
  Given 크리에이터가 계좌 정보를 입력했을 때
  When 1원 인증을 요청하면
  Then 해당 계좌로 1원이 입금되고
  And 입금자명으로 인증을 완료할 수 있다
```

**완료 기준**:

- [ ] 토스 1원 인증 API 연동
- [ ] 인증 프로세스 UI 구현
- [ ] 인증 상태 관리
- [ ] 인증 완료 처리 로직

---

##### TASK-160: 계좌 정보 관리 시스템

**우선순위**: P1 🟠 **크기**: M (4시간) **담당자**: Senior Lead Developer  
**개발 방법론**: Security First + Data Protection

**완료 기준**:

- [ ] 계좌 정보 암호화 저장
- [ ] 계좌 정보 조회/수정 API
- [ ] 계좌 인증 상태 관리
- [ ] 개인정보 보호 정책 준수

---

### 📅 Week 3: 드래그앤드롭 페이지 빌더

#### Day 1-3: 페이지 빌더 아키텍처

##### TASK-161: 블록 기반 에디터 아키텍처 설계

**우선순위**: P0 🔴 **크기**: L (1일) **담당자**: Senior Frontend Developer  
**개발 방법론**: Design Thinking + Component-Driven Development

**완료 기준**:

- [ ] 블록 컴포넌트 인터페이스 설계
- [ ] 드래그앤드롭 상태 관리
- [ ] 에디터 컨텍스트 아키텍처
- [ ] 미리보기 시스템 설계

---

##### TASK-162: 기본 블록 컴포넌트 구현

**우선순위**: P1 🟠 **크기**: XL (2일) **담당자**: Senior Frontend Developer + Senior Web Designer  
**개발 방법론**: Component-Driven Development + Test-Driven Development

**기본 블록 타입**:

```typescript
interface BlockComponent {
  id: string;
  type: 'header' | 'text' | 'image' | 'button' | 'form' | 'video';
  props: Record<string, any>;
  children?: BlockComponent[];
  styles?: CSSProperties;
}
```

**완료 기준**:

- [ ] Header 블록 (H1-H6, 스타일링)
- [ ] Text 블록 (Rich Text Editor)
- [ ] Image 블록 (업로드, 크롭)
- [ ] Button 블록 (다양한 스타일)
- [ ] Form 블록 (입력 필드)
- [ ] Video 블록 (YouTube, 업로드)

---

##### TASK-163: 드래그앤드롭 인터랙션 구현

**우선순위**: P1 🟠 **크기**: L (1일) **담당자**: Senior Frontend Developer  
**개발 방법론**: User Experience Design + Test-Driven Development

**완료 기준**:

- [ ] React DnD Kit 통합
- [ ] 드래그 시각적 피드백
- [ ] 드롭 영역 하이라이트
- [ ] 블록 순서 변경 기능
- [ ] 중첩 블록 지원

---

#### Day 4-5: 에디터 UI 및 기능

##### TASK-164: 페이지 에디터 UI 구현

**우선순위**: P1 🟠 **크기**: L (1일) **담당자**: Senior Web Designer  
**개발 방법론**: Design Thinking + User-Centered Design

**완료 기준**:

- [ ] 좌측 블록 팔레트
- [ ] 중앙 에디터 캔버스
- [ ] 우측 속성 패널
- [ ] 상단 도구 모음
- [ ] 반응형 프리뷰 모드

---

##### TASK-165: 페이지 저장 및 발행 시스템

**우선순위**: P1 🟠 **크기**: M (6시간) **담당자**: Senior Lead Developer  
**개발 방법론**: Domain-Driven Design + Event Sourcing

**완료 기준**:

- [ ] 자동 저장 기능
- [ ] 버전 관리 시스템
- [ ] 페이지 발행/비공개 처리
- [ ] SEO 메타데이터 관리

---

### 📅 Week 4: AI 매칭 시스템

#### Day 1-3: Google Gemini AI 통합

##### TASK-166: Gemini AI API 통합

**우선순위**: P0 🔴 **크기**: L (1일) **담당자**: Senior Lead Developer  
**개발 방법론**: API-First Design + Machine Learning Engineering

**BDD 시나리오**:

```gherkin
Feature: AI 기반 캠페인 매칭
  As a 크리에이터
  I want AI가 나에게 적합한 캠페인을 추천해주기를
  So that 효율적으로 수익을 창출할 수 있다

Scenario: 맞춤형 캠페인 추천
  Given 크리에이터의 프로필과 관심사가 등록되어 있고
  When AI 매칭을 요청하면
  Then Gemini AI가 적합한 캠페인 목록을 반환하고
  And 매칭 점수와 이유가 함께 제공된다
```

**완료 기준**:

- [ ] Google Gemini API 연동
- [ ] 프롬프트 엔지니어링
- [ ] 응답 파싱 및 검증
- [ ] 에러 처리 및 폴백

---

##### TASK-167: 매칭 알고리즘 구현

**우선순위**: P1 🟠 **크기**: L (1일) **담당자**: Senior Lead Developer  
**개발 방법론**: Machine Learning Engineering + Data-Driven Development

**매칭 기준**:

```typescript
interface MatchingCriteria {
  audience_overlap: number; // 타겟 오디언스 중복도
  engagement_rate: number; // 참여율 유사성
  content_category: string[]; // 콘텐츠 카테고리 일치
  geographic_match: string[]; // 지역적 연관성
  brand_affinity: number; // 브랜드 친화도
  performance_history: number; // 과거 성과 기록
}
```

**완료 기준**:

- [ ] 다차원 매칭 알고리즘
- [ ] 매칭 점수 계산 로직
- [ ] 개인화 추천 시스템
- [ ] 매칭 결과 랭킹

---

##### TASK-168: 매칭 결과 UI 구현

**우선순위**: P1 🟠 **크기**: M (6시간) **담당자**: Senior Frontend Developer  
**개발 방법론**: Design Thinking + Data Visualization

**완료 기준**:

- [ ] 추천 캠페인 카드 디자인
- [ ] 매칭 점수 시각화
- [ ] 필터링 및 정렬 기능
- [ ] 상세 매칭 이유 표시

---

#### Day 4-5: 실시간 알림 시스템

##### TASK-169: Supabase Realtime 알림 구현

**우선순위**: P1 🟠 **크기**: M (6시간) **담당자**: Senior Lead Developer  
**개발 방법론**: Event-Driven Architecture + Real-time Systems

**완료 기준**:

- [ ] 실시간 구독 시스템
- [ ] 알림 타입 정의 및 관리
- [ ] 브라우저 푸시 알림
- [ ] 알림 읽음 상태 관리

---

##### TASK-170: 알림 센터 UI 구현

**우선순위**: P1 🟠 **크기**: M (4시간) **담당자**: Senior Frontend Developer  
**개발 방법론**: User Experience Design + Component-Driven Development

**완료 기준**:

- [ ] 알림 목록 인터페이스
- [ ] 알림 카테고리 분류
- [ ] 실시간 알림 표시
- [ ] 알림 설정 관리

---

### 📅 추가 기능 및 최적화

##### TASK-171: 모바일 반응형 최적화

**우선순위**: P1 🟠 **크기**: L (1일) **담당자**: Senior Frontend Developer  
**개발 방법론**: Mobile-First Design + Performance Optimization

**완료 기준**:

- [ ] 모바일 우선 반응형 디자인
- [ ] 터치 인터랙션 최적화
- [ ] 모바일 성능 최적화
- [ ] 크로스 브라우저 테스트

---

##### TASK-172: PWA 기본 기능 구현

**우선순위**: P2 🟡 **크기**: M (6시간) **담당자**: Senior Frontend Developer  
**개발 방법론**: Progressive Enhancement + Service Worker

**완료 기준**:

- [ ] Service Worker 구현
- [ ] Web App Manifest
- [ ] 오프라인 기본 기능
- [ ] 설치 프롬프트

---

##### TASK-173: Vitest 전환 검토 및 구현

**우선순위**: P2 🟡 **크기**: M (6시간) **담당자**: Senior Lead Developer  
**개발 방법론**: Performance Optimization + Test-Driven Development

**BDD 시나리오**:

```gherkin
Feature: 테스트 도구 성능 최적화
  As a 개발팀
  I want 더 빠른 테스트 실행 환경을 구축하고 싶다
  So that 개발 생산성을 향상시킬 수 있다

Scenario: Vitest 전환 후 성능 개선
  Given Jest 기반 테스트 환경이 구축되어 있고
  When Vitest로 전환하면
  Then 테스트 시작 시간이 3-5배 빠르고
  And 메모리 사용량이 50% 절약되고
  And HMR을 통한 실시간 테스트 결과를 확인할 수 있다
```

**완료 기준**:

- [ ] Vitest 전환 가능성 재평가
- [ ] 복잡한 컴포넌트 테스트 성능 이슈 모니터링
- [ ] Next.js 통합 설정 구성
- [ ] 기존 Jest 테스트 마이그레이션
- [ ] 성능 벤치마크 비교 분석
- [ ] 팀 의견 수렴 및 전환 계획 수립

**참고 문서**: [Vitest vs Jest 비교 분석](../idea/vitest-vs-jest-analysis.md)

---

## 📝 다음 단계

Enhanced MVP 완료 후 다음 단계:

1. **사용자 테스트**: 실제 사용자 100명+ 베타 테스트
2. **성능 최적화**: Core Web Vitals 최적화
3. **데이터 분석**: 사용자 행동 패턴 분석
4. **피드백 반영**: 사용자 의견 기반 개선

**다음 문서**: Full Product (task3.md) - 완성도 높은 제품

---

**마지막 업데이트**: 2025년 7월 30일  
**문서 버전**: 1.0  
**관련 문서**: [MVP-ROADMAP.md](./mvp/MVP-ROADMAP.md), [ENHANCED-MVP.md](./mvp/ENHANCED-MVP.md)

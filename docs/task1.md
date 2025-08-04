# TASK1.MD - Core MVP (Week 1-8)

# 🥇 Core MVP 개발 태스크 - 비즈니스 모델 검증

**🎯 MVP 목표**: 핵심 비즈니스 모델 검증  
**개발 기간**: 8주 (Week 1-8)  
**포함 태스크**: 89개 (40.3%)  
**개발 방법론**: Domain-Driven Design (DDD) + Test-Driven Development (TDD) + Agile/Scrum  
**전체 진행률**: 10/89 완료 (11.2%) 🟦

### 🎯 현재 상태

- **완료**: TASK-001 ~ TASK-005, TASK-006, TASK-007, TASK-009, TASK-015, TASK-015-1
- **보류**: TASK-008 (카카오 OAuth 연동 설정 - Enhanced MVP에서 구현 예정, Clerk에 OAuth 추가)
- **다음 작업**: TASK-010 (사용자 프로필 및 역할 시스템 설정)

## 📖 목차

- [Core MVP 개요](#core-mvp-개요)
- [개발 방법론](#개발-방법론)
- [Phase 1: 기반 구축 (Week 1-2)](#phase-1-기반-구축-week-1-2)
- [Phase 2: 사용자 관리 (Week 3-4)](#phase-2-사용자-관리-week-3-4)
- [Phase 3: 데이터 모델 (Week 5-7)](#phase-3-데이터-모델-week-5-7)
- [Phase 4: 핵심 기능 (Week 8-11)](#phase-4-핵심-기능-week-8-11)

---

## 🎯 Core MVP 개요

### 핵심 가치 제안

- 크리에이터가 캠페인에 참여하여 수익 창출
- 광고주가 캠페인을 생성하여 홍보 효과 확인
- 기본적인 추천을 통한 네트워크 확장

### 검증 가능한 최소 기능

- Clerk 기반 회원가입/로그인 (이메일 인증)
- 역할별 대시보드 (크리에이터/비즈니스)
- 캠페인 생성 및 참여 신청
- 정적 공유 페이지 생성
- 수동 수익 정산
- 1단계 추천 시스템 (10% 수익)

### 성공 지표 (8주 후)

- 크리에이터 가입: 100명+
- 비즈니스 가입: 20명+
- 일일 활성 사용자: 30명+
- 첫 수익 발생: 10건+

---

## 🛠 개발 방법론

### Domain-Driven Design (DDD)

```yaml
도메인 모델링:
  - User Domain: 사용자 인증, 역할, 프로필 관리
  - Campaign Domain: 캠페인 생성, 참여, 관리
  - Sharing Domain: 공유 페이지 생성, 관리
  - Referral Domain: 1단계 추천 시스템

아키텍처 패턴:
  - Clean Architecture 적용
  - Domain 중심 레이어링
  - Repository Pattern
  - Service Layer Pattern

바운디드 컨텍스트:
  - Authentication Context
  - Campaign Management Context
  - Content Sharing Context
  - Referral Tracking Context
```

### Test-Driven Development (TDD)

```yaml
테스트 전략:
  - Red-Green-Refactor 사이클
  - 단위 테스트 우선 작성
  - 통합 테스트 커버리지 80%+
  - E2E 테스트 핵심 플로우

테스트 도구:
  - Vitest (단위 테스트)
  - React Testing Library (컴포넌트 테스트)
  - Playwright (E2E 테스트)
  - Supabase Test Suite (데이터베이스 테스트)

테스트 기준:
  - 모든 비즈니스 로직 테스트 커버
  - UI 컴포넌트 상호작용 테스트
  - API 엔드포인트 테스트
  - 인증 플로우 테스트
```

### Agile/Scrum 방법론

```yaml
스프린트 구성:
  - 2주 스프린트 (총 4개 스프린트)
  - 매일 스탠드업 미팅
  - 스프린트 계획 회의
  - 스프린트 리뷰 및 회고

백로그 관리:
  - Epic → Story → Task 분해
  - 우선순위 기반 백로그 정렬
  - 스토리 포인트 추정
  - 번다운 차트 관리

협업 방식:
  - GitHub Projects 활용
  - 코드 리뷰 필수
  - 페어 프로그래밍 권장
  - 지식 공유 세션
```

---

## 🚀 Phase 1: 기반 구축 (Week 1-2)

> **목표**: 프로젝트 초기 설정 및 기본 인프라 구축  
> **기간**: 2주  
> **개발 방법론**: DevOps + Infrastructure as Code  
> **산출물**: 기본 Next.js 앱, Clerk 인증 시스템, 멀티도메인 라우팅  
> **진행률**: 9/20 완료 (45%) 🟨

### 📅 Week 1: 프로젝트 설정

#### Day 1-2: 초기 프로젝트 설정

##### TASK-000: 프로젝트 킥오프 및 계획 수립

**우선순위**: P0 🔴 **크기**: M (6시간) **담당자**: Project Manager (PM)  
**개발 방법론**: Agile/Scrum

**완료 기준**:

- [ ] 프로젝트 목표 및 범위 정의
- [ ] 팀 역할 및 책임 분담
- [ ] 일정 및 마일스톤 수립
- [ ] 커뮤니케이션 계획 수립
- [ ] 리스크 분석 및 대응 계획

---

##### TASK-001: Next.js 15 프로젝트 생성 ✅ **완료**

**우선순위**: P0 🔴 **크기**: S (4시간) **담당자**: Senior Lead Developer  
**개발 방법론**: DevOps

```bash
npx create-next-app@latest cashup --typescript --tailwind --app
cd cashup
npm install
```

**완료 기준**:

- [x] Next.js 15 프로젝트 생성 완료
- [x] TypeScript 설정 완료
- [x] 기본 Tailwind CSS 설정 완료
- [x] 개발 서버 정상 실행 확인

---

##### TASK-002: 기본 디렉토리 구조 생성 ✅ **완료**

**우선순위**: P1 🟠 **크기**: XS (1시간) **담당자**: Senior Lead Developer  
**개발 방법론**: Domain-Driven Design (DDD)

```
cashup/
├── app/
│   ├── (main)/
│   ├── (creator)/
│   ├── (business)/
│   ├── (admin)/
│   └── api/
├── components/
│   ├── ui/
│   ├── forms/
│   └── blocks/
├── lib/
├── hooks/
├── stores/
└── types/
```

**완료 기준**:

- [x] 모든 디렉토리 생성 완료
- [x] 각 디렉토리에 README.md 파일 생성
- [x] tsconfig.json path mapping 설정

---

##### TASK-003: ESLint, Prettier 설정 ✅ **완료**

**우선순위**: P1 🟠 **크기**: S (2시간) **담당자**: Senior Lead Developer  
**개발 방법론**: DevOps

**완료 기준**:

- [x] ESLint 설정 파일 생성
- [x] Prettier 설정 파일 생성
- [x] VSCode 설정 파일 생성
- [x] pre-commit hook 설정

---

##### TASK-004: Tailwind CSS v4 설정 ✅ **완료**

**우선순위**: P1 🟠 **크기**: S (3시간) **담당자**: Senior Frontend Developer  
**개발 방법론**: Design Thinking

**완료 기준**:

- [x] Tailwind CSS v4 설치 및 설정
- [x] 커스텀 컬러 팔레트 정의
- [x] 반응형 브레이크포인트 설정
- [x] 글로벌 스타일 파일 생성

---

##### TASK-005: Shadcn/ui 설치 및 설정 ✅ **완료**

**우선순위**: P1 🟠 **크기**: M (4시간) **담당자**: Senior Web Designer  
**개발 방법론**: Design Thinking + Component-Driven Development

```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input
```

**완료 기준**:

- [x] Shadcn/ui 초기 설정 완료
- [x] 기본 컴포넌트 설치 (Button, Card, Input)
- [x] 컴포넌트 스토리북 설정 (선택사항)
- [x] 테마 설정 완료

---

#### Day 3-4: Clerk 인증 시스템 설정

##### TASK-006: Clerk 인증 시스템 설정 ✅ **완료**

**우선순위**: P0 🔴 **크기**: M (6시간) **담당자**: Senior Lead Developer  
**개발 방법론**: Infrastructure as Code + Security First

**완료 기준**:

- [x] Clerk 프로젝트 생성 및 인증 설정
- [x] Next.js에 Clerk SDK 설치
- [x] 환경 변수 설정
- [x] 기본 인증 페이지 생성

**구현 내용**:

- Supabase 클라이언트 설정 (서버/클라이언트)
- 환경 변수 관리 및 타입 안전성 구현
- 인증 콜백 라우트 구현
- 로그아웃 API 엔드포인트 구현

---

##### TASK-007: Clerk 인증 미들웨어 구현 ✅ **완료**

**우선순위**: P1 🟠 **크기**: L (1일) **담당자**: Senior Lead Developer  
**개발 방법론**: Domain-Driven Design + Security First

```typescript
// middleware.ts 구현
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Supabase 클라이언트 생성
  // 도메인별 라우팅 로직
  // RLS 기반 권한 검사 로직
}
```

**완료 기준**:

- [x] 도메인별 라우팅 미들웨어 구현
- [x] RLS 기반 접근 제어 구현
- [x] 보호된 라우트 설정 완료
- [x] 미들웨어 테스트 완료

**구현 내용**:

- 인증 미들웨어를 통한 라우트 보호
- 3단계 추천 시스템 API 구현
- 데이터베이스 스키마 및 마이그레이션 생성
- RLS 정책 및 보안 설정 완료
- 개발 환경 설정 및 시드 데이터 추가

---

##### TASK-008: 카카오 OAuth 연동 설정 ⏸️ **보류**

**우선순위**: P1 🟠 **크기**: M (4시간) **담당자**: Senior Lead Developer  
**개발 방법론**: Security First

**보류 사유**: Clerk 기본 이메일 인증 완료 후 Enhanced MVP 단계에서 OAuth 추가 구현 예정 (Week 9-10)

**완료 기준**:

- [ ] 카카오 개발자 계정 생성
- [ ] OAuth 앱 등록
- [ ] Supabase Dashboard에서 카카오 OAuth 설정
- [ ] 로그인 플로우 테스트

---

##### TASK-009: 기본 로그인/회원가입 페이지 구현 ✅ **완료**

**우선순위**: P1 🟠 **크기**: M (6시간) **담당자**: Senior Frontend Developer  
**개발 방법론**: Test-Driven Development + Design Thinking

**완료 기준**:

- [x] 로그인 페이지 UI 구현
- [x] 회원가입 페이지 UI 구현
- [x] 카카오 로그인 버튼 구현
- [x] 반응형 디자인 적용

**구현 내용**:

- `/src/app/auth/signin/page.tsx`: 로그인 페이지 구현
- `/src/app/auth/signup/page.tsx`: 회원가입 페이지 구현
- 카카오 OAuth 및 이메일 로그인/회원가입 지원
- 와이어프레임 수준의 레이아웃으로 주요 컴포넌트에 border 적용
- 반응형 디자인 및 에러 처리 구현
- Clerk 인증 시스템 연동 완료

---

##### TASK-010: 사용자 프로필 및 역할 시스템 설정

**우선순위**: P2 🟡 **크기**: M (6시간) **담당자**: Senior Lead Developer  
**개발 방법론**: Domain-Driven Design + Security First

**완료 기준**:

- [ ] profiles 테이블 생성 (auth.users 연동)
- [ ] user_role ENUM 정의 (business, creator, admin)
- [ ] 회원가입 시 기본 프로필 생성 트리거
- [ ] 역할 기반 대시보드 리다이렉션
- [ ] 3단계 추천 시스템 필드 추가

---

#### Day 5: Supabase 기본 설정

##### TASK-011: Supabase 프로젝트 생성 ✅

**우선순위**: P0 🔴 **크기**: S (2시간) **담당자**: Senior Lead Developer  
**개발 방법론**: Infrastructure as Code

**완료 기준**:

- [x] Supabase 계정 생성
- [x] 프로젝트 생성
- [x] 데이터베이스 초기 설정
- [x] API 키 확인

---

##### TASK-012: 환경 변수 설정 ✅ **완료**

**우선순위**: P1 🟠 **크기**: XS (1시간) **담답자**: Senior Lead Developer  
**개발 방법론**: Security First + DevOps

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
```

**완료 기준**:

- [x] 모든 필수 환경 변수 설정
- [x] .env.example 파일 생성
- [x] 환경 변수 검증 함수 구현

**구현 내용**:

- `.env.example`: 모든 필수/선택 환경 변수 템플릿 생성
- `/src/lib/env.ts`: 타입 안전한 환경 변수 관리 시스템 구현
- `/src/lib/env.server.ts`: 서버 전용 환경 변수 분리
- TDD 방식으로 완전한 테스트 커버리지 구현
- `/docs/environment-variables.md`: 환경 변수 사용 가이드 작성

---

##### TASK-013: Supabase 클라이언트 설정

**우선순위**: P1 🟠 **크기**: M (4시간) **담당자**: Senior Lead Developer  
**개발 방법론**: Test-Driven Development

**완료 기준**:

- [x] 서버 사이드 클라이언트 설정
- [x] 클라이언트 사이드 클라이언트 설정
- [x] TypeScript 타입 설정
- [x] 연결 테스트 완료

---

##### TASK-014: 데이터베이스 스키마 설정 (Clerk User ID 기반)

**우선순위**: P1 🟠 **크기**: L (1일) **담당자**: Senior Lead Developer  
**개발 방법론**: Domain-Driven Design + Security First

**완료 기준**:

- [x] profiles 테이블 및 RLS 정책 생성
- [x] referral_earnings 테이블 생성
- [x] 다중 도메인 접근 RLS 정책 설정
- [x] 데이터베이스 트리거 및 함수 구현
- [x] 통합 인증 테스트 완료

---

### 📅 Week 2: 기본 UI 및 라우팅

#### Day 1-2: 도메인별 라우팅

##### TASK-015: 미들웨어 도메인 라우팅 구현 ✅ **완료**

**우선순위**: P0 🔴 **크기**: L (1일) **담당자**: Senior Lead Developer  
**개발 방법론**: Domain-Driven Design

**완료 기준**:

- [x] 서브도메인 감지 로직 구현
- [x] 도메인별 라우트 리라이팅
- [x] 테스트 환경에서 동작 확인
- [x] 에러 처리 구현

**구현 내용**:

- `/src/middleware.ts`: 도메인별 라우팅 미들웨어 구현 (78.49% 테스트 커버리지)
- `/src/lib/middleware-utils.ts`: 도메인 감지 및 URL 리라이팅 유틸리티 (100% 테스트 커버리지)
- 63개의 유닛 테스트 작성 및 통과
- 16개의 E2E 테스트 시나리오 검증
- 평균 처리 시간 215ms (목표 < 1000ms 달성)

---

##### TASK-015-1: 스타일 가이드 페이지 구현 ✅ **완료**

**우선순위**: P1 🟠 **크기**: M (6시간) **담당자**: Senior Web Designer + Senior Frontend Developer  
**개발 방법론**: Design System First + Component-Driven Development

**완료 기준**:

- [x] `/style-guide` 페이지 라우트 생성
- [x] theme.md 기반 컬러 팔레트 시각화
- [x] 타이포그래피 시스템 표시
- [x] 버튼 컴포넌트 variants 미리보기
- [x] 카드 컴포넌트 스타일 미리보기
- [x] 대시보드/공개페이지 테마 비교 섹션
- [x] 반응형 디자인 확인
- [x] 접근성 가이드라인 표시

**구현 세부사항**:

- [x] CashUp 브랜드 컬러 시스템 (cashGreen, cashBlue 등) 시각화
- [x] 대시보드 테마와 공개페이지 테마 차이점 명시
- [x] 한글 폰트 (Pretendard) 적용 확인
- [x] 3단계 추천 수익 시각화 패턴 미리보기

**구현 내용**:

- `/src/app/style-guide/page.tsx`: 최신 디자인 트렌드를 반영한 스타일 가이드 페이지
- `/src/app/globals.css`: theme.md 기반 CSS 변수 시스템 구현
- `/src/components/ui/badge.tsx`: 배지 컴포넌트 추가
- `/src/components/ui/tabs.tsx`: 탭 컴포넌트 추가
- Bento Grid 레이아웃, 글래스모피즘, 뉴모피즘 효과 적용
- 다크 모드 제외, 라이트 모드만 구현
- 상태 배지 및 메트릭 표시 스타일 확인

---

##### TASK-016: 메인 레이아웃 컴포넌트 생성

**우선순위**: P1 🟠 **크기**: M (6시간) **담당자**: Senior Frontend Developer  
**개발 방법론**: Component-Driven Development + Design Thinking

**완료 기준**:

- [ ] 헤더 컴포넌트 구현
- [ ] 푸터 컴포넌트 구현
- [ ] 네비게이션 메뉴 구현
- [ ] 반응형 레이아웃 적용

---

##### TASK-017: 크리에이터 레이아웃 구현

**우선순위**: P1 🟠 **크기**: M (6시간) **담당자**: Senior Frontend Developer  
**개발 방법론**: User-Centered Design + Component-Driven Development

**완료 기준**:

- [ ] 사이드바 네비게이션 구현
- [ ] 대시보드 헤더 구현
- [ ] 메뉴 아이템 구성
- [ ] 모바일 반응형 적용

---

##### TASK-018: 비즈니스 레이아웃 구현

**우선순위**: P1 🟠 **크기**: M (6시간) **담당자**: Senior Frontend Developer  
**개발 방법론**: User-Centered Design + Component-Driven Development

**완료 기준**:

- [ ] 비즈니스 전용 사이드바 구현
- [ ] 상단 네비게이션 구현
- [ ] 브랜딩 요소 적용
- [ ] 접근성 개선

---

##### TASK-019: 관리자 레이아웃 구현

**우선순위**: P2 🟡 **크기**: M (6시간) **담당자**: Senior Frontend Developer  
**개발 방법론**: Security First + User-Centered Design

**완료 기준**:

- [ ] 관리자 전용 UI 구현
- [ ] 시스템 상태 표시
- [ ] 고급 네비게이션 구현
- [ ] 권한 기반 메뉴 표시

---

#### Day 3-4: 기본 UI 컴포넌트

##### TASK-020: Button 컴포넌트 구현

**우선순위**: P1 🟠 **크기**: S (3시간) **담당자**: Senior Web Designer  
**개발 방법론**: Component-Driven Development + Test-Driven Development

**완료 기준**:

- [ ] 다양한 variant 구현 (primary, secondary, outline)
- [ ] 크기 옵션 구현 (sm, md, lg)
- [ ] 로딩 상태 구현
- [ ] 아이콘 버튼 지원

---

## 📝 다음 단계

이 문서는 Core MVP (Week 1-8)의 Phase 1 기반 구축 부분을 다룹니다.
전체 Core MVP 태스크는 다음과 같이 구성됩니다:

- **Phase 2: 사용자 관리 (Week 3-4)** - 사용자 역할 및 프로필 관리 시스템
- **Phase 3: 데이터 모델 (Week 5-7)** - 데이터베이스 스키마 및 실시간 기능
- **Phase 4: 핵심 기능 (Week 8-11)** - 캠페인 시스템 및 공유 페이지 구축

**다음 작업**: Enhanced MVP (task2.md)와 Full Product (task3.md) 파일 생성

---

**마지막 업데이트**: 2025년 7월 30일  
**문서 버전**: 1.0  
**관련 문서**: [MVP-ROADMAP.md](./mvp/MVP-ROADMAP.md), [CORE-MVP.md](./mvp/CORE-MVP.md)

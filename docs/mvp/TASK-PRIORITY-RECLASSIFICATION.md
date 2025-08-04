# 221개 태스크 MVP 우선순위 재분류

**문서 버전**: 1.0  
**작성일**: 2025년 7월 30일  
**기준**: TASK.MD의 221개 태스크를 3단계 MVP 전략에 따라 재분류  
**목표**: 개발팀이 MVP-first 접근법으로 작업할 수 있도록 태스크 우선순위 재정렬

---

## 🎯 재분류 기준

### 3단계 MVP 전략 기준

```yaml
Core MVP (8주):
  - 비즈니스 모델 검증에 필수적인 기능만
  - 수동 처리 가능한 기능 우선
  - 기본적인 UI/UX로 충분한 기능
  - 1단계 추천 시스템만 구현

Enhanced MVP (4주):
  - 차별화를 위한 핵심 기능
  - 자동화가 필요한 기능
  - 고급 UI/UX가 필요한 기능
  - AI 및 외부 API 연동

Full Product (4주):
  - 완성도를 위한 추가 기능
  - 3단계 추천 시스템 완성
  - 고급 보안 및 어뷰징 방지
  - 관리자 도구 및 모니터링
```

### 우선순위 매트릭스

| 기준              | Core MVP  | Enhanced MVP | Full Product | 제외      |
| ----------------- | --------- | ------------ | ------------ | --------- |
| **비즈니스 영향** | 필수      | 중요         | 유용         | 불필요    |
| **기술 복잡도**   | 낮음-중간 | 중간-높음    | 높음         | 매우 높음 |
| **사용자 가치**   | 핵심      | 차별화       | 완성도       | 부가      |
| **개발 리소스**   | 최소      | 적정         | 충분         | 과다      |

---

## 🥇 Core MVP 태스크 (Priority 1)

> **목표**: 8주 내 핵심 비즈니스 모델 검증  
> **총 태스크**: 89개 (40.3%)  
> **개발 기간**: Week 1-8

### 🔧 Phase 1: 기반 구축 (Week 1-2)

**선별 기준**: 모든 기능의 기반이 되는 필수 인프라

#### 기본 설정 및 환경

```yaml
포함된 태스크 (14개):
  ✅ TASK-001: Next.js 15 프로젝트 생성 및 초기 설정
  ✅ TASK-002: TypeScript 설정 및 타입 정의
  ✅ TASK-003: Tailwind CSS v4 설정
  ✅ TASK-004: Shadcn/ui 설치 및 설정
  ✅ TASK-005: 프로젝트 폴더 구조 생성
  ✅ TASK-006: 환경 변수 설정
  ✅ TASK-007: Git 저장소 설정
  ✅ TASK-008: Vercel 배포 환경 설정
  ✅ TASK-009: package.json 의존성 관리
  ✅ TASK-010: ESLint/Prettier 설정
  ✅ TASK-011: 기본 middleware.ts 설정
  ✅ TASK-012: 절대 경로 import 설정
  ✅ TASK-013: 개발 서버 실행 확인
  ✅ TASK-014: 기본 error 페이지 생성

제외된 태스크 (1개):
  ❌ TASK-015: Storybook 설정 → Enhanced MVP로 이동
```

#### 데이터베이스 기초

```yaml
포함된 태스크 (8개):
  ✅ TASK-016: Supabase 프로젝트 생성
  ✅ TASK-017: 환경 변수 Supabase 설정
  ✅ TASK-018: 기본 테이블 스키마 설계
  ✅ TASK-019: RLS 기본 정책 설정
  ✅ TASK-020: 데이터베이스 연결 테스트
  ✅ TASK-021: Supabase 클라이언트 설정
  ✅ TASK-022: 기본 CRUD 헬퍼 함수
  ✅ TASK-023: 데이터베이스 타입 생성

제외된 태스크 (2개):
  ❌ TASK-024: Edge Functions 설정 → Enhanced MVP로 이동
  ❌ TASK-025: Realtime 설정 → Enhanced MVP로 이동
```

#### UI 컴포넌트 기초

```yaml
포함된 태스크 (10개):
  ✅ TASK-026: Button 컴포넌트 구현
  ✅ TASK-027: Input 컴포넌트 구현
  ✅ TASK-028: Card 컴포넌트 구현
  ✅ TASK-029: Layout 컴포넌트 구현
  ✅ TASK-030: Loading 컴포넌트 구현
  ✅ TASK-031: Alert 컴포넌트 구현
  ✅ TASK-032: Modal 컴포넌트 구현
  ✅ TASK-033: Form 기본 컴포넌트
  ✅ TASK-034: Navigation 컴포넌트
  ✅ TASK-035: 기본 테마 설정

제외된 태스크 (5개):
  ❌ TASK-036: Badge 컴포넌트 → Full Product로 이동
  ❌ TASK-037: Avatar 컴포넌트 → Enhanced MVP로 이동
  ❌ TASK-038: Tooltip 컴포넌트 → Full Product로 이동
  ❌ TASK-039: Dropdown 컴포넌트 → Enhanced MVP로 이동
  ❌ TASK-040: Advanced Form 컴포넌트 → Enhanced MVP로 이동
```

### 🔐 Phase 2: 인증 시스템 (Week 2-3)

**선별 기준**: MVP 사용자 관리에 필수적인 기본 인증 기능만

#### Supabase Auth 기본 구현

```yaml
포함된 태스크 (12개):
  ✅ TASK-041: Supabase Auth 설정
  ✅ TASK-042: 카카오 OAuth 연동
  ✅ TASK-043: 로그인 페이지 구현
  ✅ TASK-044: 회원가입 페이지 구현
  ✅ TASK-045: 로그아웃 기능 구현
  ✅ TASK-046: 인증 상태 관리
  ✅ TASK-047: 보호된 라우트 설정
  ✅ TASK-048: 사용자 프로필 기본 구조
  ✅ TASK-049: 역할 선택 (크리에이터/비즈니스)
  ✅ TASK-050: 기본 프로필 수정 기능
  ✅ TASK-051: 세션 관리
  ✅ TASK-052: 인증 에러 처리

제외된 태스크 (8개):
  ❌ TASK-053: 이메일 인증 → Enhanced MVP로 이동
  ❌ TASK-054: 비밀번호 재설정 → Enhanced MVP로 이동
  ❌ TASK-055: 2FA/MFA → Full Product로 이동
  ❌ TASK-056: 소셜 로그인 확장 → Full Product로 이동
  ❌ TASK-057: 고급 프로필 기능 → Enhanced MVP로 이동
  ❌ TASK-058: 계정 삭제 → Full Product로 이동
  ❌ TASK-059: 계정 보안 설정 → Full Product로 이동
  ❌ TASK-060: 로그인 히스토리 → Full Product로 이동
```

#### 멀티도메인 라우팅

```yaml
포함된 태스크 (7개):
  ✅ TASK-061: 도메인별 미들웨어 구성
  ✅ TASK-062: 메인 도메인 라우팅
  ✅ TASK-063: 크리에이터 도메인 라우팅 (crt.)
  ✅ TASK-064: 비즈니스 도메인 라우팅 (biz.)
  ✅ TASK-065: 역할 기반 접근 제어
  ✅ TASK-066: 도메인별 레이아웃
  ✅ TASK-067: 기본 네비게이션

제외된 태스크 (3개):
  ❌ TASK-068: 관리자 도메인 (adm.) → Full Product로 이동
  ❌ TASK-069: 동적 서브도메인 → Full Product로 이동
  ❌ TASK-070: 고급 권한 관리 → Enhanced MVP로 이동
```

### 📊 Phase 3: 기본 대시보드 (Week 3-4)

**선별 기준**: 핵심 기능 확인에 필요한 최소한의 대시보드

#### 크리에이터 대시보드

```yaml
포함된 태스크 (8개):
  ✅ TASK-071: 크리에이터 메인 대시보드
  ✅ TASK-072: 수익 현황 표시 (기본)
  ✅ TASK-073: 참여 가능한 캠페인 목록
  ✅ TASK-074: 참여 중인 캠페인 표시
  ✅ TASK-075: 기본 프로필 관리
  ✅ TASK-076: 추천 현황 (1단계만)
  ✅ TASK-077: 기본 통계 카드
  ✅ TASK-078: 대시보드 네비게이션

제외된 태스크 (5개):
  ❌ TASK-079: 고급 차트/그래프 → Enhanced MVP로 이동
  ❌ TASK-080: 상세 분석 → Enhanced MVP로 이동
  ❌ TASK-081: 커스텀 대시보드 → Full Product로 이동
  ❌ TASK-082: 알림 센터 → Enhanced MVP로 이동
  ❌ TASK-083: 활동 피드 → Full Product로 이동
```

#### 비즈니스 대시보드

```yaml
포함된 태스크 (8개):
  ✅ TASK-084: 비즈니스 메인 대시보드
  ✅ TASK-085: 활성 캠페인 현황
  ✅ TASK-086: 예산 관리 (기본)
  ✅ TASK-087: 크리에이터 신청 현황
  ✅ TASK-088: 캠페인 성과 요약 (기본)
  ✅ TASK-089: 기본 통계 카드
  ✅ TASK-090: 대시보드 네비게이션
  ✅ TASK-091: 기본 설정 페이지

제외된 태스크 (7개):
  ❌ TASK-092: 고급 분석 대시보드 → Enhanced MVP로 이동
  ❌ TASK-093: ROI 계산기 → Enhanced MVP로 이동
  ❌ TASK-094: 캠페인 A/B 테스트 → Full Product로 이동
  ❌ TASK-095: 크리에이터 평가 시스템 → Full Product로 이동
  ❌ TASK-096: 자동 캠페인 관리 → Enhanced MVP로 이동
  ❌ TASK-097: 예산 최적화 도구 → Full Product로 이동
  ❌ TASK-098: 실시간 성과 모니터링 → Enhanced MVP로 이동
```

### 🎯 Phase 4: 캠페인 시스템 기본 (Week 5-6)

**선별 기준**: 수동 관리 가능한 기본 캠페인 기능만

#### 캠페인 CRUD

```yaml
포함된 태스크 (10개):
  ✅ TASK-099: 캠페인 생성 폼 (기본)
  ✅ TASK-100: 캠페인 목록 페이지
  ✅ TASK-101: 캠페인 상세 페이지
  ✅ TASK-102: 캠페인 수정 기능
  ✅ TASK-103: 캠페인 삭제 기능
  ✅ TASK-104: 썸네일 이미지 업로드
  ✅ TASK-105: 캠페인 상태 관리 (기본)
  ✅ TASK-106: 캠페인 기간 설정
  ✅ TASK-107: 보상 금액 설정
  ✅ TASK-108: 카테고리 선택 (고정 옵션)

제외된 태스크 (12개):
  ❌ TASK-109: 캠페인 템플릿 → Enhanced MVP로 이동
  ❌ TASK-110: 고급 캠페인 설정 → Enhanced MVP로 이동
  ❌ TASK-111: 캠페인 미리보기 → Enhanced MVP로 이동
  ❌ TASK-112: 캠페인 복제 → Full Product로 이동
  ❌ TASK-113: 캠페인 일괄 관리 → Full Product로 이동
  ❌ TASK-114: 캠페인 분석 도구 → Enhanced MVP로 이동
  ❌ TASK-115: 캠페인 자동화 → Enhanced MVP로 이동
  ❌ TASK-116: 고급 이미지 편집 → Full Product로 이동
  ❌ TASK-117: 동영상 업로드 → Enhanced MVP로 이동
  ❌ TASK-118: 다중 이미지 관리 → Enhanced MVP로 이동
  ❌ TASK-119: 캠페인 태그 시스템 → Full Product로 이동
  ❌ TASK-120: 캠페인 검색/필터 → Enhanced MVP로 이동
```

#### 캠페인 참여 시스템

```yaml
포함된 태스크 (8개):
  ✅ TASK-121: 참여 신청 기능
  ✅ TASK-122: 신청 현황 추적
  ✅ TASK-123: 신청 승인/거절 (수동)
  ✅ TASK-124: 참여 중인 캠페인 관리
  ✅ TASK-125: 미션 완료 보고 (수동)
  ✅ TASK-126: 완료 승인 시스템 (수동)
  ✅ TASK-127: 기본 메시징 시스템
  ✅ TASK-128: 참여 현황 알림 (기본)

제외된 태스크 (7개):
  ❌ TASK-129: 자동 매칭 시스템 → Enhanced MVP로 이동
  ❌ TASK-130: 스마트 추천 → Enhanced MVP로 이동
  ❌ TASK-131: 고급 메시징 → Enhanced MVP로 이동
  ❌ TASK-132: 파일 첨부 시스템 → Enhanced MVP로 이동
  ❌ TASK-133: 진행률 추적 → Enhanced MVP로 이동
  ❌ TASK-134: 자동 리마인더 → Enhanced MVP로 이동
  ❌ TASK-135: 참여자 평가 → Full Product로 이동
```

### 📄 Phase 5: 공유 페이지 기본 (Week 6-7)

**선별 기준**: 정적이고 기본적인 공유 페이지만

#### 정적 공유 페이지

```yaml
포함된 태스크 (8개):
  ✅ TASK-136: domain/[slug] 라우팅
  ✅ TASK-137: 크리에이터 프로필 표시
  ✅ TASK-138: 참여 캠페인 목록
  ✅ TASK-139: 기본 소개 텍스트
  ✅ TASK-140: 연락처 정보
  ✅ TASK-141: 추천 링크 기능
  ✅ TASK-142: 방문자 수 추적 (기본)
  ✅ TASK-143: 3가지 기본 템플릿

제외된 태스크 (9개):
  ❌ TASK-144: 드래그앤드롭 빌더 → Enhanced MVP로 이동
  ❌ TASK-145: 커스텀 블록 → Enhanced MVP로 이동
  ❌ TASK-146: 고급 템플릿 → Enhanced MVP로 이동
  ❌ TASK-147: 다이나믹 콘텐츠 → Enhanced MVP로 이동
  ❌ TASK-148: SEO 최적화 → Enhanced MVP로 이동
  ❌ TASK-149: 소셜 미디어 연동 → Enhanced MVP로 이동
  ❌ TASK-150: 고급 분석 → Enhanced MVP로 이동
  ❌ TASK-151: 커스텀 도메인 → Full Product로 이동
  ❌ TASK-152: 다국어 지원 → Full Product로 이동
```

### 💰 Phase 6: 수익 관리 기본 (Week 7-8)

**선별 기준**: 수동 정산이 가능한 기본 수익 관리만

#### 수익 계산 및 관리

```yaml
포함된 태스크 (7개):
  ✅ TASK-153: 캠페인 수익 기록
  ✅ TASK-154: 1단계 추천 수익 계산 (10%)
  ✅ TASK-155: 수익 내역 조회
  ✅ TASK-156: 총 수익 표시
  ✅ TASK-157: 출금 가능 금액 계산
  ✅ TASK-158: 기본 수익 통계
  ✅ TASK-159: 수익 히스토리

제외된 태스크 (8개):
  ❌ TASK-160: 3단계 추천 수익 → Full Product로 이동
  ❌ TASK-161: 복잡한 수익 분배 → Full Product로 이동
  ❌ TASK-162: 세금 관리 → Full Product로 이동
  ❌ TASK-163: 수익 예측 → Enhanced MVP로 이동
  ❌ TASK-164: 수익 최적화 → Enhanced MVP로 이동
  ❌ TASK-165: 고급 리포팅 → Enhanced MVP로 이동
  ❌ TASK-166: 수익 분석 도구 → Enhanced MVP로 이동
  ❌ TASK-167: 자동 세무 보고 → Full Product로 이동
```

#### 출금 시스템 기본

```yaml
포함된 태스크 (5개):
  ✅ TASK-168: 출금 신청 폼
  ✅ TASK-169: 최소 출금 금액 검증 (10,000원)
  ✅ TASK-170: 출금 신청 내역
  ✅ TASK-171: 관리자 승인 시스템 (수동)
  ✅ TASK-172: 출금 완료 알림

제외된 태스크 (6개):
  ❌ TASK-173: 토스페이먼츠 자동 정산 → Enhanced MVP로 이동
  ❌ TASK-174: 1원 인증 → Enhanced MVP로 이동
  ❌ TASK-175: 자동 출금 스케줄 → Enhanced MVP로 이동
  ❌ TASK-176: 다중 계좌 관리 → Full Product로 이동
  ❌ TASK-177: 출금 수수료 관리 → Full Product로 이동
  ❌ TASK-178: 출금 한도 관리 → Full Product로 이동
```

---

## 🥈 Enhanced MVP 태스크 (Priority 2)

> **목표**: 4주 내 핵심 차별화 기능 구현  
> **총 태스크**: 78개 (35.3%)  
> **개발 기간**: Week 9-12

### 🎨 드래그앤드롭 페이지 빌더 (Week 9-10)

**선별 기준**: 사용자 경험 차별화를 위한 핵심 기능

#### 페이지 빌더 시스템

```yaml
포함된 태스크 (15개):
  ✅ TASK-144: 드래그앤드롭 빌더 (Core MVP에서 이동)
  ✅ TASK-145: 커스텀 블록 (Core MVP에서 이동)
  ✅ TASK-146: 고급 템플릿 (Core MVP에서 이동)
  ✅ TASK-147: 다이나믹 콘텐츠 (Core MVP에서 이동)
  ✅ TASK-179: React DnD Kit 통합
  ✅ TASK-180: 블록 라이브러리 구성
  ✅ TASK-181: 텍스트 블록 구현
  ✅ TASK-182: 이미지 블록 구현
  ✅ TASK-183: 버튼 블록 구현
  ✅ TASK-184: 폼 블록 구현
  ✅ TASK-185: 동영상 블록 구현
  ✅ TASK-186: 레이아웃 블록 구현
  ✅ TASK-187: 블록 스타일링 시스템
  ✅ TASK-188: 미리보기 모드
  ✅ TASK-189: 저장/불러오기 기능
```

### 🤖 AI 매칭 시스템 (Week 10-11)

**선별 기준**: 경쟁 우위를 위한 핵심 차별화 기능

#### Google Gemini AI 통합

```yaml
포함된 태스크 (12개):
  ✅ TASK-129: 자동 매칭 시스템 (Core MVP에서 이동)
  ✅ TASK-130: 스마트 추천 (Core MVP에서 이동)
  ✅ TASK-190: Google Gemini API 연동
  ✅ TASK-191: 크리에이터 프로필 분석
  ✅ TASK-192: 캠페인 요구사항 분석
  ✅ TASK-193: 매칭 알고리즘 구현
  ✅ TASK-194: 매칭 스코어 계산
  ✅ TASK-195: AI 추천 UI 구현
  ✅ TASK-196: 매칭 결과 최적화
  ✅ TASK-197: AI 학습 데이터 수집
  ✅ TASK-198: 매칭 정확도 모니터링
  ✅ TASK-199: AI 기반 캠페인 제안
```

### 💳 결제 시스템 (Week 11-12)

**선별 기준**: 신뢰성 확보를 위한 필수 기능

#### 토스페이먼츠 연동

```yaml
포함된 태스크 (13개):
  ✅ TASK-173: 토스페이먼츠 자동 정산 (Core MVP에서 이동)
  ✅ TASK-174: 1원 인증 (Core MVP에서 이동)
  ✅ TASK-175: 자동 출금 스케줄 (Core MVP에서 이동)
  ✅ TASK-200: 토스페이먼츠 SDK 통합
  ✅ TASK-201: 계좌 인증 시스템
  ✅ TASK-202: 자동 정산 로직
  ✅ TASK-203: 결제 내역 관리
  ✅ TASK-204: 정산 스케줄러
  ✅ TASK-205: 결제 실패 처리
  ✅ TASK-206: 환불 시스템
  ✅ TASK-207: 결제 보안 강화
  ✅ TASK-208: 거래 내역 추적
  ✅ TASK-209: 결제 대시보드
```

### ⚡ 실시간 기능 (Week 12)

**선별 기준**: 사용자 경험 향상을 위한 고급 기능

#### Supabase Realtime 활용

```yaml
포함된 태스크 (10개):
  ✅ TASK-025: Realtime 설정 (Core MVP에서 이동)
  ✅ TASK-082: 알림 센터 (Core MVP에서 이동)
  ✅ TASK-131: 고급 메시징 (Core MVP에서 이동)
  ✅ TASK-210: 실시간 알림 시스템
  ✅ TASK-211: 실시간 채팅
  ✅ TASK-212: 실시간 상태 업데이트
  ✅ TASK-213: 푸시 알림 연동
  ✅ TASK-214: 실시간 통계 업데이트
  ✅ TASK-215: 웹소켓 연결 관리
  ✅ TASK-216: 실시간 협업 기능
```

### 📱 모바일 최적화 (Week 12)

**선별 기준**: 모바일 사용자 경험 필수

#### PWA 및 모바일 UX

```yaml
포함된 태스크 (8개):
  ✅ TASK-217: PWA 설정
  ✅ TASK-218: 모바일 UI 최적화
  ✅ TASK-219: 터치 제스처 지원
  ✅ TASK-220: 오프라인 모드
  ✅ TASK-221: 앱 아이콘 및 스플래시
  ✅ TASK-222: 모바일 네비게이션
  ✅ TASK-223: 모바일 폼 최적화
  ✅ TASK-224: 모바일 성능 최적화
```

---

## 🥉 Full Product 태스크 (Priority 3)

> **목표**: 4주 내 완성도 높은 제품  
> **총 태스크**: 54개 (24.4%)  
> **개발 기간**: Week 13-16

### 🔗 3단계 추천 시스템 완성 (Week 13)

**선별 기준**: 지속가능한 수익 구조 완성

#### 다단계 추천 시스템

```yaml
포함된 태스크 (8개):
  ✅ TASK-160: 3단계 추천 수익 (Enhanced MVP에서 이동)
  ✅ TASK-161: 복잡한 수익 분배 (Enhanced MVP에서 이동)
  ✅ TASK-225: 2단계 추천 (5%) 구현
  ✅ TASK-226: 3단계 추천 (2%) 구현
  ✅ TASK-227: 추천 체인 추적
  ✅ TASK-228: 다단계 수익 계산
  ✅ TASK-229: 추천 성과 분석
  ✅ TASK-230: 추천 리워드 시스템
```

### 🛡️ 보안 및 어뷰징 방지 (Week 14)

**선별 기준**: 신뢰할 수 있는 플랫폼 구축

#### 고급 보안 시스템

```yaml
포함된 태스크 (12개):
  ✅ TASK-055: 2FA/MFA (Enhanced MVP에서 이동)
  ✅ TASK-058: 계정 삭제 (Enhanced MVP에서 이동)
  ✅ TASK-059: 계정 보안 설정 (Enhanced MVP에서 이동)
  ✅ TASK-231: 어뷰징 탐지 시스템
  ✅ TASK-232: 자동 계정 제재
  ✅ TASK-233: IP 기반 차단
  ✅ TASK-234: 디바이스 지문 인식
  ✅ TASK-235: 의심 활동 모니터링
  ✅ TASK-236: 보안 로그 관리
  ✅ TASK-237: GDPR 컴플라이언스
  ✅ TASK-238: 개인정보 암호화
  ✅ TASK-239: 보안 감사 로그
```

### ⚙️ 관리자 대시보드 (Week 15)

**선별 기준**: 플랫폼 운영에 필수적인 관리 도구

#### Admin 도메인 시스템

```yaml
포함된 태스크 (10개):
  ✅ TASK-068: 관리자 도메인 (adm.) (Enhanced MVP에서 이동)
  ✅ TASK-240: 관리자 대시보드 구현
  ✅ TASK-241: 사용자 관리 시스템
  ✅ TASK-242: 캠페인 승인 시스템
  ✅ TASK-243: 수익 관리 도구
  ✅ TASK-244: 신고 처리 시스템
  ✅ TASK-245: 플랫폼 통계 대시보드
  ✅ TASK-246: 시스템 모니터링
  ✅ TASK-247: 백업 관리 시스템
  ✅ TASK-248: 관리자 권한 관리
```

### 📊 고급 분석 및 최적화 (Week 16)

**선별 기준**: 데이터 기반 의사결정 지원

#### 분석 도구 및 최적화

```yaml
포함된 태스크 (10개):
  ✅ TASK-092: 고급 분석 대시보드 (Enhanced MVP에서 이동)
  ✅ TASK-165: 고급 리포팅 (Enhanced MVP에서 이동)
  ✅ TASK-249: 사용자 행동 분석
  ✅ TASK-250: 캠페인 ROI 분석
  ✅ TASK-251: 예측 분석 모델
  ✅ TASK-252: A/B 테스트 플랫폼
  ✅ TASK-253: 성능 최적화 도구
  ✅ TASK-254: SEO 최적화 완성
  ✅ TASK-255: 캐싱 시스템 고도화
  ✅ TASK-256: 데이터베이스 최적화
```

### 🌐 확장 기능 (Week 16)

**선별 기준**: 시장 확장을 위한 추가 기능

#### 고급 확장 기능

```yaml
포함된 태스크 (14개):
  ✅ TASK-069: 동적 서브도메인 (Enhanced MVP에서 이동)
  ✅ TASK-151: 커스텀 도메인 (Enhanced MVP에서 이동)
  ✅ TASK-152: 다국어 지원 (Enhanced MVP에서 이동)
  ✅ TASK-176: 다중 계좌 관리 (Enhanced MVP에서 이동)
  ✅ TASK-257: 다중 통화 지원
  ✅ TASK-258: 국제 결제 연동
  ✅ TASK-259: 다국어 콘텐츠 관리
  ✅ TASK-260: 시간대 지원
  ✅ TASK-261: 글로벌 CDN 연동
  ✅ TASK-262: 다중 언어 SEO
  ✅ TASK-263: 지역별 법률 컴플라이언스
  ✅ TASK-264: 글로벌 결제 수단
  ✅ TASK-265: 현지화 마케팅 도구
  ✅ TASK-266: 글로벌 고객 지원
```

---

## 🗑️ 제외된 태스크 (우선순위 없음)

> **총 태스크**: 0개 (0%)  
> **사유**: 모든 태스크가 3단계 MVP 중 어느 단계에는 포함됨

**중요**: 원본 TASK.MD의 221개 태스크는 모두 3단계 MVP 전략에 포함되었습니다. 단지 우선순위와 개발 시기가 재조정되었습니다.

---

## 📊 재분류 결과 요약

### 태스크 분포

| 분류             | 태스크 수 | 비율  | 개발 기간  | 주요 목표          |
| ---------------- | --------- | ----- | ---------- | ------------------ |
| **Core MVP**     | 89개      | 40.3% | Week 1-8   | 비즈니스 모델 검증 |
| **Enhanced MVP** | 78개      | 35.3% | Week 9-12  | 차별화 기능 구현   |
| **Full Product** | 54개      | 24.4% | Week 13-16 | 완성도 높은 제품   |
| **제외**         | 0개       | 0%    | -          | -                  |
| **총계**         | 221개     | 100%  | 16주       | 완전한 제품 출시   |

### 주요 이동 패턴

```yaml
Core → Enhanced (주요 이동):
  - Storybook 설정 → 개발 완료 후 필요
  - 드래그앤드롭 빌더 → 차별화 핵심 기능
  - AI 매칭 시스템 → 고급 기능
  - 토스페이먼츠 연동 → 자동화 필요

Enhanced → Full (주요 이동):
  - 3단계 추천 시스템 → 완성도 기능
  - 고급 보안 → 운영 안정성
  - 관리자 도구 → 플랫폼 관리

변경 없음 (Core 유지):
  - 기본 인프라 → 모든 기능의 기반
  - 기본 인증 → 필수 기능
  - 기본 캠페인 CRUD → 핵심 비즈니스 로직
  - 1단계 추천 → MVP 검증 핵심
```

---

## 🚀 개발팀 활용 가이드

### 스프린트 계획

```yaml
Sprint 1-8 (Core MVP):
  - 매주 11-12개 태스크 진행
  - 핵심 기능 우선 개발
  - 수동 프로세스 허용
  - 빠른 검증 및 피드백

Sprint 9-12 (Enhanced MVP):
  - 매주 19-20개 태스크 진행
  - 차별화 기능 집중
  - 자동화 및 고도화
  - 사용자 경험 개선

Sprint 13-16 (Full Product):
  - 매주 13-14개 태스크 진행
  - 완성도 및 안정성
  - 운영 도구 구축
  - 확장 기능 추가
```

### 팀 역할별 우선순위

```yaml
Lead Developer:
  - Core MVP: 인프라, 데이터베이스, 인증
  - Enhanced MVP: AI 연동, 결제 시스템
  - Full Product: 보안, 관리자 도구

Frontend Developer:
  - Core MVP: 기본 UI, 대시보드
  - Enhanced MVP: 페이지 빌더, 모바일 최적화
  - Full Product: 고급 분석, 다국어

Full-Stack Developer:
  - Core MVP: 캠페인 시스템, 공유 페이지
  - Enhanced MVP: 실시간 기능, PWA
  - Full Product: 확장 기능, 최적화
```

---

**다음 단계**: 이 재분류를 기반으로 개발팀은 Core MVP부터 순차적으로 개발을 시작하여 8주 만에 첫 수익 창출, 16주 만에 완성된 제품 출시를 목표로 합니다.

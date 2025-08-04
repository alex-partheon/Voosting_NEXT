# Voosting (부스팅) 서비스 제품 요구사항 문서 (PRD) - Next.js 15

문서 버전: 6.0  
최종 수정일: 2025년 7월 30일  
기술 스택: Next.js 15 + TypeScript + Supabase + Tailwind CSS + Clerk Auth  
**🎯 MVP 전략**: 3단계 MVP 개발 (Core → Enhanced → Full Product)

## 📋 MVP 개발 가이드

> **중요**: 본 PRD는 3단계 MVP 전략에 따라 구성되어 있습니다. 각 기능별로 MVP 단계가 명시되어 있으니 개발 우선순위를 참고하세요.

### MVP 전략 개요

- **Core MVP (8주)**: 비즈니스 모델 검증을 위한 핵심 기능만 구현
- **Enhanced MVP (4주)**: 차별화를 위한 고급 기능 추가
- **Full Product (4주)**: 완성도 높은 제품으로 시장 출시

### 관련 MVP 문서

- [MVP 로드맵](./mvp/MVP-ROADMAP.md)
- [Core MVP 상세 계획](./mvp/CORE-MVP.md)
- [Enhanced MVP 계획](./mvp/ENHANCED-MVP.md)
- [태스크 우선순위 재분류](./mvp/TASK-PRIORITY-RECLASSIFICATION.md)

## 1. 프로젝트 개요

### 1.1. 프로젝트 명

캐쉬업 (CashUp)

### 1.2. 미션

AI 기술을 통해 광고주와 **크리에이터(레퍼러)**를 지능적으로 연결하여, 데이터 기반의 예측 가능하고 효율적인 성과 마케팅 생태계를 구축한다.

### 1.3. 핵심 서비스

Voosting: 광고주의 온라인 채널 성장을 위해, 크리에이터가 자신의 영향력(블로그, SNS 등)을 활용해 캠페인을 홍보하거나 직접 미션에 참여하고 보상을 받는 PWA 서비스.

### 1.4. 주요 사용자 (User Persona)

#### 1.4.1. 이중 타겟 전략

Voosting은 두 개의 주요 타겟 그룹을 대상으로 하는 **이중 타겟 마케팅 플랫폼**입니다. 각 그룹은 서로 다른 니즈와 동기를 가지고 있으며, 플랫폼은 이들을 효과적으로 연결하는 매개체 역할을 합니다.

#### 1.4.2. 주요 사용자 그룹

**광고주 (비즈니스)**

- **정의**: 온라인 홍보, 채널 성장, 고객 참여 유도가 필요한 소상공인 및 중소기업
- **주요 니즈**:
  - 검증된 크리에이터와의 매칭
  - 투명한 성과 측정 및 ROI 분석
  - 간편한 캠페인 생성 및 관리
  - 효과적인 브랜드 인지도 향상
- **핵심 가치 제안**: AI 기반 크리에이터 매칭을 통한 마케팅 효율성 극대화

**마케팅크리에이터 (Marketing Creator)**

- **정의**: 자신의 팔로워 영향력(블로그, SNS, YouTube, TikTok 등)을 전문적인 마케팅 도구로 활용하여 수익을 창출하는 인플루언서 및 콘텐츠 제작자
- **핵심 특징**:
  - 팔로워와의 신뢰 관계를 기반으로 한 마케팅 영향력 보유
  - 콘텐츠 제작 및 커뮤니케이션 전문성
  - 브랜드 메시지를 자연스럽게 전달하는 능력
  - 다양한 플랫폼에서의 콘텐츠 운영 경험
- **주요 니즈**:
  - 안정적이고 지속가능한 수익 창출
  - 3단계 추천 시스템을 통한 패시브 인컴
  - 자유로운 콘텐츠 제작 환경
  - 개인 브랜딩 및 포트폴리오 구축 도구
- **핵심 가치 제안**: 팔로워 영향력의 수익화 및 전문 마케터로서의 성장 지원

**관리자**

- **정의**: 플랫폼 운영, 사용자 관리, AI 매칭 알고리즘 모니터링, 어뷰징 탐지 및 고객 지원 담당자
- **주요 역할**:
  - 플랫폼 품질 관리 및 사용자 경험 최적화
  - 캠페인 승인 및 가이드라인 준수 모니터링
  - 커뮤니티 관리 및 분쟁 해결

### 1.5. 기술 스택 (Next.js 15 + Supabase + Clerk)

본 프로젝트는 최신 Next.js 15 App Router를 기반으로 하며, Supabase를 백엔드로, Clerk를 인증 시스템으로 활용하여 서버 사이드 렌더링(SSR), 실시간 데이터베이스, 강력한 인증이 통합된 고성능 풀스택 웹 애플리케이션을 구축합니다.

#### 프론트엔드

- **프레임워크**: Next.js 15.1.3 (App Router, RSC 지원)
- **언어**: TypeScript 5.8.3
- **스타일링**: Tailwind CSS v4.2.0
- **UI 라이브러리**: Shadcn/ui (Radix UI 기반)
- **아이콘**: Lucide React v0.522.0
- **유효성 검증**: Zod v3.23.8
- **상태 관리**: Zustand v5.0.2
- **폼 처리**: React Hook Form v7.53.0

#### 인증 & 사용자 관리

- **인증 서비스**: Clerk v5.0+ (관리형 인증 서비스)
- **소셜 로그인**: 카카오 OAuth (Enhanced MVP에서 구현 예정)
- **사용자 메타데이터**: PostgreSQL profiles 테이블
- **권한 관리**: Row Level Security (RLS) 정책
- **세션 관리**: JWT + Refresh Token

#### 백엔드 & 인프라

- **BaaS**: Supabase v2.50.0
- **데이터베이스**: PostgreSQL (Supabase 내장)
- **스토리지**: Supabase Storage (이미지/파일 업로드)
- **실시간**: Supabase Realtime (WebSocket)
- **Edge Functions**: Deno 기반 서버리스 함수

#### 배포 & 모니터링

- **배포 플랫폼**: Vercel (Next.js 최적화)
- **버전 관리**: Git (GitHub)
- **환경**: 서버리스 환경
- **CDN**: Vercel Edge Network
- **모니터링**: Vercel Analytics + Supabase Metrics

#### 외부 API

- **AI 엔진**: Google Gemini API 1.5 Pro
- **결제**: 토스페이먼츠 API v2
- **본인인증**: 토스 1원 인증 API
- **이메일 발송**: Resend API v2.0
- **알림**: Web Push API + Email 알림 (Resend) + Supabase Edge Functions

## 2. 시스템 아키텍처

### 2.1. 도메인 구조

서비스의 역할 분리를 명확히 하고 확장성을 확보하기 위해 서브도메인 기반 아키텍처를 채택합니다.

#### 2.1.1. 메인 서비스 - 이중 타겟 공개페이지 시스템 (domain)

**목적**: 비즈니스와 크리에이터 각각을 타겟으로 하는 차별화된 공개페이지 제공 및 통합 인증 시스템

#### 2.1.1.1. 비즈니스 타겟 공개페이지 (기본 도메인)

**URL 구조**: `domain` (기본 경로)
**타겟 사용자**: 광고주, 마케팅 담당자, 중소기업 대표

**네비게이션 메뉴**:

- **홈** (`/`) - 비즈니스 타겟 메인 페이지
- **크리에이터** (`/creators`) - 크리에이터 영역으로 크로스 링크
- **서비스** (`/service`) - 비즈니스 대상 서비스 소개
- **요금제** (`/pricing`) - 비즈니스 요금제 및 플랜
- **문의하기** (`/contact`) - 비즈니스 문의 및 상담
- **로그인** (`/sign-in`) - 통합 로그인 페이지
- **무료로 시작하기** (`/sign-up/business`) - 비즈니스 회원가입

**핵심 메시지**:

- "AI 매칭으로 완벽한 크리에이터 찾기"
- 검증된 크리에이터 네트워크
- 투명한 성과 측정 및 ROI 분석
- 간편한 캠페인 생성 및 관리

**테마**: 비즈니스 테마 (블루-그린 계열, 전문적, 신뢰감)

#### 2.1.1.2. 크리에이터 타겟 공개페이지 (/creators)

**URL 구조**: `domain/creators/*`
**타겟 사용자**: 인플루언서, 콘텐츠 크리에이터, 마케팅크리에이터

**네비게이션 메뉴**:

- **홈** (`/creators`) - 크리에이터 타겟 메인 페이지
- **비즈니스** (`/`) - 비즈니스 영역으로 크로스 링크
- **서비스** (`/creators/service`) - 크리에이터 대상 서비스 소개
- **수익 계산기** (`/creators/calculator`) - 크리에이터 수익 시뮬레이터
- **로그인** (`/sign-in`) - 통합 로그인 페이지
- **무료로 시작하기** (`/sign-up/creator`) - 크리에이터 회원가입

**핵심 메시지**:

- "팔로워 영향력을 수익으로 전환하세요"
- 3단계 추천 시스템 (10% + 5% + 2%)
- 자유로운 페이지 빌더
- 안정적인 수익 구조

**테마**: 크리에이터 테마 (민트 그린-퍼플 계열, 창의적, 개성적)

#### 2.1.1.3. 공통 기능 및 시스템

**공유 페이지** (domain/[slug]):

- 크리에이터가 생성한 개인 랜딩 페이지
- 테마 커스터마이징 지원
- 방문자 추적 및 전환율 분석
- 소셜 미디어 연동

**통합 인증 시스템**:

- Clerk 기반 단일 로그인 시스템
- 역할 기반 대시보드 리다이렉션
- 카카오 OAuth 소셜 로그인
- 타겟별 회원가입 플로우 분리

**크로스 네비게이션 시스템**:

- 부드러운 테마 전환 효과
- 컨텍스트 유지 및 사용자 선택 기억
- 적절한 랜딩 페이지로 안내
- URL 파라미터로 이전 페이지 정보 유지

**기술적 구현**:

- Next.js 15 App Router 기반 파일 라우팅
- 동적 테마 시스템 (CSS 변수 + React Context)
- Supabase Database로 콘텐츠 관리
- Clerk 미들웨어를 통한 통합 인증
- 반응형 디자인 (모바일 우선)

#### 2.1.2. 크리에이터 대시보드 (crt.domain)

**목적**: 마케터/크리에이터를 위한 수익 창출 및 콘텐츠 관리 플랫폼

**주요 기능**:

- **대시보드 홈**:
  - 실시간 수익 현황 및 그래프
  - 진행 중인 캠페인 요약
  - 최근 활동 타임라인
  - AI 추천 캠페인 (Gemini API 활용)
- **캠페인 관리**:
  - 참여 가능한 캠페인 탐색 (AI 매칭 점수 표시)
  - 캠페인 참여 신청 및 승인 대기 목록
  - 미션 수행 및 증빙 자료 제출
  - 캠페인별 성과 분석 (클릭률, 전환율)
- **공유 페이지 빌더**:
  - 드래그 앤 드롭 블록 에디터
  - 실시간 프리뷰 및 반응형 편집
  - 테마 및 스타일 커스터마이징
  - 커스텀 도메인 연결 지원
- **수익 관리**:
  - 상세 수익 내역 (캠페인별, 추천별)
  - 출금 신청 및 이력 관리
  - 세금계산서 자동 발행
  - **3단계 추천 수익 추적**
    - **1단계 추천: 10%**
    - **2단계 추천: 5%**
    - **3단계 추천: 2%**
- **분석 도구**:
  - 트래픽 분석 (방문자, 페이지뷰, 체류시간)
  - 전환 퍼널 분석

**기술적 구현**:

- Zustand로 클라이언트 상태 관리
- Supabase Realtime으로 실시간 업데이트
- WebSocket을 통한 실시간 알림
- Chart.js로 데이터 시각화

#### 2.1.3. 비즈니스 대시보드 (biz.domain)

**목적**: 광고주/비즈니스를 위한 캠페인 생성 및 성과 관리 플랫폼

**주요 기능**:

- **캠페인 생성 마법사**:
  - 단계별 캠페인 설정 가이드
  - AI 기반 타겟 오디언스 추천
  - 예산 및 기간 최적화 제안
  - 캠페인 목표 설정 (인지도, 전환, 참여)
- **크리에이터 관리**:
  - AI 매칭 크리에이터 추천
  - 크리에이터 포트폴리오 열람
  - 직접 제안 및 협상 기능
  - 크리에이터 성과 평가 시스템
- **성과 분석**:
  - 실시간 캠페인 대시보드
  - ROI 및 ROAS 계산
  - 크리에이터별 성과 비교
  - 커스텀 리포트 생성
- **결제 및 정산**:
  - 캠페인 예산 충전 (토스페이먼츠)
  - 자동 정산 시스템
- **커뮤니케이션**:
  - 크리에이터와 실시간 채팅
  - 캠페인 피드백 수집
  - 공지사항 및 업데이트 알림

**기술적 구현**:

- Next.js Server Actions로 폼 처리
- Gemini API로 AI 추천 시스템
- 토스페이먼츠 SDK 통합
- Supabase Database Triggers로 실시간 동기화

#### 2.1.4. 관리자 대시보드 (adm.domain)

**목적**: 플랫폼 운영, 모니터링, 사용자 지원을 위한 통합 관리 시스템

**주요 기능**:

- **운영 대시보드**:
  - 플랫폼 핵심 지표 모니터링 (DAU, MAU, GMV)
  - 실시간 트랜잭션 로그
  - 시스템 상태 및 성능 지표
  - 알림 및 경고 시스템
- **사용자 관리**:
  - 사용자 검색 및 상세 정보
  - 역할 및 권한 관리 (Clerk Organizations)
  - 계정 정지 및 제재 관리
  - 본인인증 상태 확인
- **캠페인 승인**:
  - 캠페인 검토 대기열
  - AI 기반 위험도 평가
  - 승인/거절 및 피드백
  - 캠페인 가이드라인 위반 체크
- **어뷰징 관리**:
  - 실시간 이상 행동 탐지
  - 다중 계정 탐지 시스템
  - IP 및 디바이스 추적
  - 제재 이력 관리
- **고객 지원**:
  - 통합 고객 문의 관리
  - 템플릿 기반 응답 시스템
  - 에스컬레이션 프로세스
  - FAQ 및 도움말 관리

**기술적 구현**:

- Clerk Organizations & Roles 기반 권한 관리
- Supabase Dashboard 통합
- 실시간 모니터링 대시보드
- Supabase Edge Functions로 로그 집계

#### 2.1.5. 도메인 간 데이터 흐름

**인증 플로우**:

```
1. domain에서 Clerk Auth 로그인
2. JWT 토큰 자동 관리 (Clerk SDK)
3. 역할에 따라 서브도메인 리다이렉트
4. 서브도메인에서 토큰 검증 및 세션 유지
```

**데이터 동기화**:

- **Supabase Database**: 모든 도메인에서 공통 데이터 접근
- **Supabase Realtime**: 실시간 데이터 동기화
- **Edge Functions**: 도메인 간 API 호출 처리
- **캐시 전략**: Next.js의 fetch 캐싱 + Vercel KV

**보안 고려사항**:

- CORS 정책으로 도메인 간 접근 제어
- Supabase RLS로 데이터 접근 권한 관리
- Clerk의 세션 토큰 검증
- 환경 변수로 API 키 관리
- Vercel의 Rate Limiting 적용

#### 2.1.6. 기술적 구현 방안

**멀티 도메인 라우팅**:

```typescript
// lib/domain.ts
export function getDomainType(hostname: string) {
  if (hostname.includes('crt.')) return 'creator';
  if (hostname.includes('biz.')) return 'business';
  if (hostname.includes('adm.')) return 'admin';
  return 'main';
}

// app/layout.tsx에서 도메인별 레이아웃 적용
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const domainType = getDomainType(headers().get('host') || '');

  return (
    <html lang="ko">
      <body>
        <ClerkProvider>
          {domainType === 'creator' && <CreatorLayout>{children}</CreatorLayout>}
          {domainType === 'business' && <BusinessLayout>{children}</BusinessLayout>}
          {domainType === 'admin' && <AdminLayout>{children}</AdminLayout>}
          {domainType === 'main' && <MainLayout>{children}</MainLayout>}
        </ClerkProvider>
      </body>
    </html>
  );
}
```

**환경 설정**:

```typescript
// .env.local
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 도메인 설정
NEXT_PUBLIC_MAIN_DOMAIN=domain
NEXT_PUBLIC_CREATOR_DOMAIN=crt.domain
NEXT_PUBLIC_BUSINESS_DOMAIN=biz.domain
NEXT_PUBLIC_ADMIN_DOMAIN=adm.domain
```

**배포 전략**:

- Vercel의 도메인 별칭 기능 활용
- 각 서브도메인을 동일한 Next.js 앱으로 라우팅
- Clerk의 미들웨어를 통한 도메인별 인증 처리
- 환경 변수로 도메인별 설정 관리

### 2.2. 기술 아키텍처

#### 프레임워크

Next.js 15 App Router를 사용하여 서버 컴포넌트(RSC)와 클라이언트 컴포넌트를 적절히 분리한 현대적인 풀스택 애플리케이션을 구축합니다. Clerk를 통한 강력한 인증 시스템과 Supabase와의 통합으로 완전한 백엔드 기능을 제공합니다.

#### 프론트엔드

- **UI 프레임워크**: Next.js 15.1.3 (App Router, RSC)
- **언어**: TypeScript 5.8.3 (strict mode)
- **스타일링**: Tailwind CSS v4.2.0
- **UI 컴포넌트**: Shadcn/ui (Radix UI 기반)
- **상태 관리**: Zustand v5.0.2 (클라이언트 상태)
- **폼 처리**: React Hook Form + Zod 스키마 검증
- **아이콘**: Lucide React
- **차트**: Chart.js v4 + React Chartjs 2

#### 인증 시스템 (Clerk)

- **인증 서비스**: Clerk v5.15.0
- **세션 관리**: JWT 기반 자동 세션 관리
- **소셜 로그인**: 카카오 OAuth
- **사용자 메타데이터**: 역할 및 프로필 정보 저장
- **권한 관리**: Clerk Organizations & Roles

#### 백엔드 서비스 (Supabase)

- **데이터베이스**: PostgreSQL (Supabase 관리형)
- **실시간**: Supabase Realtime (WebSocket)
- **스토리지**: Supabase Storage (이미지/파일)
- **Edge Functions**: Deno 런타임 (서버리스)
- **API**: 자동 생성 REST API + GraphQL

#### 데이터 흐름

- **서버 컴포넌트**: Supabase 서버 클라이언트로 직접 데이터 페칭
- **클라이언트 컴포넌트**: Supabase 클라이언트 SDK + Clerk 토큰 사용
- **실시간 업데이트**: Supabase Realtime 구독
- **캐싱**: Next.js fetch 캐싱 + unstable_cache

#### 보안

- **인증**: Clerk Auth (Magic Link, OAuth)
- **권한**: Row Level Security (RLS) + Clerk 세션 검증
- **API 보안**: Clerk 토큰 + Supabase API 키 관리
- **CORS**: Next.js 미들웨어에서 처리

#### 외부 서비스

- **AI API**: Google Gemini API 1.5 Pro
- **결제**: 토스페이먼츠 API v2
- **본인인증**: 토스 1원 인증 API
- **이미지 CDN**: Supabase Storage CDN
- **푸시 알림**: Web Push API
- **이메일 발송**: Resend API v2.0

### 2.3. 이메일 시스템 아키텍처 (Resend 통합)

Resend 서비스를 활용하여 안정적이고 전문적인 이메일 발송 시스템을 구축합니다.

#### 2.3.1. 이메일 서비스 통합 설계

**Resend API 특징**:

- **현대적 이메일 API**: RESTful API와 SDK 제공
- **높은 전송률**: 99%+ 전송 성공률 보장
- **실시간 웹훅**: 이메일 상태 추적 및 피드백
- **템플릿 시스템**: React 기반 이메일 템플릿
- **분석 대시보드**: 전송 통계 및 성과 추적

**이메일 발송 아키텍처**:

```typescript
// Supabase Edge Function에서 Resend API 호출
export const sendEmail = async (to: string, template: EmailTemplate, data: EmailData) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const result = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to,
    subject: template.subject,
    react: template.component(data),
  });

  return result;
};
```

#### 2.3.2. 이메일 템플릿 시스템

**주요 이메일 템플릿**:

- **환영 이메일**: 회원가입 완료 시 발송
- **캠페인 알림**: 새로운 캠페인 매칭 시 발송
- **수익 정산**: 월별 수익 리포트 발송
- **보안 알림**: 로그인, 비밀번호 변경 등
- **마케팅**: 이벤트, 공지사항 등

**React 기반 템플릿 예시**:

```typescript
// components/emails/campaign-notification.tsx
export function CampaignNotificationEmail({
  userName,
  campaignTitle,
  reward
}: EmailProps) {
  return (
    <Html>
      <Head />
      <Body>
        <Container>
          <Heading>새로운 캠페인이 매칭되었습니다!</Heading>
          <Text>안녕하세요 {userName}님,</Text>
          <Text>
            '{campaignTitle}' 캠페인이 회원님과 매칭되었습니다.
            예상 수익: {reward.toLocaleString()}원
          </Text>
          <Button href="https://crt.cashup.kr/campaigns">
            캠페인 확인하기
          </Button>
        </Container>
      </Body>
    </Html>
  )
}
```

#### 2.3.3. 이메일 발송 시나리오

**실시간 알림 + 이메일 통합**:

1. **즉시 알림**: Supabase Realtime으로 브라우저 알림
2. **이메일 백업**: 사용자가 오프라인일 경우 이메일 발송
3. **개인화**: 사용자 이메일 설정에 따른 선택적 발송
4. **배치 처리**: 일일/주간 요약 이메일 스케줄링

**이메일 발송 트리거**:

- 캠페인 매칭 시
- 수익 정산 완료 시
- 중요한 보안 이벤트 발생 시
- 관리자 승인/거절 알림
- 마케팅 캠페인

#### 2.3.4. 환경 설정 및 보안

**환경 변수**:

```bash
# Resend Configuration
RESEND_API_KEY=re_xxxxxxxxx
RESEND_FROM_EMAIL=noreply@cashup.kr
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxx

# Email Settings
EMAIL_SUPPORT=support@cashup.kr
EMAIL_NOREPLY=noreply@cashup.kr
```

**보안 고려사항**:

- **SPF/DKIM 설정**: 도메인 인증 및 스팸 방지
- **웹훅 검증**: Resend 웹훅 서명 검증
- **개인정보 보호**: 이메일 주소 암호화 저장
- **구독 관리**: 이메일 수신 동의 관리

## 3. 상세 설계

### 3.1. 데이터베이스 스키마 (Supabase PostgreSQL + Clerk 통합)

Supabase PostgreSQL을 활용하여 관계형 데이터베이스 설계를 하며, Clerk의 사용자 시스템과 연동하여 완전한 타입 안전성을 보장합니다.

#### 3.1.1. Clerk 연동 사용자 시스템

**Clerk 사용자 메타데이터 구조**

```typescript
// Clerk에서 관리하는 사용자 메타데이터
interface ClerkUserMetadata {
  role: 'business' | 'creator' | 'admin';
  creditBalance: number;
  isIdentityVerified: boolean;
  referrerL1Id?: string;
  referrerL2Id?: string;
  referrerL3Id?: string;
}
```

**프로필 테이블 (Clerk ID 연동)**

```sql
CREATE TABLE profiles (
  id TEXT PRIMARY KEY, -- Clerk User ID
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'creator',
  credit_balance DECIMAL(10,2) DEFAULT 0,
  ci TEXT, -- 본인인증 CI
  is_identity_verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  referrer_l1_id TEXT, -- 1단계 추천인 (10%)
  referrer_l2_id TEXT, -- 2단계 추천인 (5%)
  referrer_l3_id TEXT, -- 3단계 추천인 (2%)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 역할 ENUM
CREATE TYPE user_role AS ENUM ('business', 'creator', 'admin');

-- RLS 정책 (Clerk 토큰 기반)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.jwt() ->> 'sub' = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.jwt() ->> 'sub' = id);
```

**크리에이터 KPI 테이블**

```sql
CREATE TABLE creator_kpis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  total_campaigns INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,4) DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_referrals_l1 INTEGER DEFAULT 0, -- 1단계 추천 수
  total_referrals_l2 INTEGER DEFAULT 0, -- 2단계 추천 수
  total_referrals_l3 INTEGER DEFAULT 0, -- 3단계 추천 수
  referral_earnings_l1 DECIMAL(10,2) DEFAULT 0, -- 1단계 추천 수익 (10%)
  referral_earnings_l2 DECIMAL(10,2) DEFAULT 0, -- 2단계 추천 수익 (5%)
  referral_earnings_l3 DECIMAL(10,2) DEFAULT 0, -- 3단계 추천 수익 (2%)
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**캠페인 테이블**

```sql
CREATE TABLE campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status campaign_status DEFAULT 'draft',
  reward DECIMAL(10,2) NOT NULL,
  budget DECIMAL(10,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  target_audience JSONB,
  requirements JSONB,
  category TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 캠페인 상태 ENUM
CREATE TYPE campaign_status AS ENUM (
  'draft', 'pending', 'active', 'paused', 'completed', 'cancelled'
);
```

**공유 페이지 테이블 (URL 구조 변경 반영)**

```sql
CREATE TABLE shared_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id TEXT REFERENCES profiles(id) NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- domain/[slug] 형태로 접근
  title TEXT NOT NULL,
  description TEXT,
  theme page_theme DEFAULT 'default',
  is_published BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  custom_css TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 페이지 테마 ENUM
CREATE TYPE page_theme AS ENUM ('default', 'dark', 'colorful', 'minimal');
```

#### 3.1.2. Clerk 통합 TypeScript 타입 정의

```typescript
// lib/database.types.ts
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string; // Clerk User ID
          email: string;
          name: string;
          role: 'business' | 'creator' | 'admin';
          credit_balance: number;
          ci: string | null;
          is_identity_verified: boolean;
          avatar_url: string | null;
          bio: string | null;
          phone: string | null;
          referrer_l1_id: string | null; // 1단계 추천인
          referrer_l2_id: string | null; // 2단계 추천인
          referrer_l3_id: string | null; // 3단계 추천인
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string; // Clerk User ID 필수
          email: string;
          name: string;
          role?: 'business' | 'creator' | 'admin';
          credit_balance?: number;
          ci?: string | null;
          is_identity_verified?: boolean;
          avatar_url?: string | null;
          bio?: string | null;
          phone?: string | null;
          referrer_l1_id?: string | null;
          referrer_l2_id?: string | null;
          referrer_l3_id?: string | null;
        };
        Update: {
          email?: string;
          name?: string;
          role?: 'business' | 'creator' | 'admin';
          credit_balance?: number;
          ci?: string | null;
          is_identity_verified?: boolean;
          avatar_url?: string | null;
          bio?: string | null;
          phone?: string | null;
          referrer_l1_id?: string | null;
          referrer_l2_id?: string | null;
          referrer_l3_id?: string | null;
          updated_at?: string;
        };
      };
      creator_kpis: {
        Row: {
          id: string;
          creator_id: string;
          total_earnings: number;
          total_campaigns: number;
          conversion_rate: number;
          average_rating: number;
          total_referrals_l1: number;
          total_referrals_l2: number;
          total_referrals_l3: number;
          referral_earnings_l1: number;
          referral_earnings_l2: number;
          referral_earnings_l3: number;
          last_calculated_at: string;
          created_at: string;
        };
      };
    };
  };
}

// 유틸리티 타입
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type CreatorKpis = Database['public']['Tables']['creator_kpis']['Row'];

// 추천 수익 구조 타입
export interface ReferralEarnings {
  level1: {
    percentage: 10;
    earnings: number;
    referrals: number;
  };
  level2: {
    percentage: 5;
    earnings: number;
    referrals: number;
  };
  level3: {
    percentage: 2;
    earnings: number;
    referrals: number;
  };
}
```

#### 3.1.3. Clerk + Supabase 통합 클라이언트

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';
import { useAuth } from '@clerk/nextjs';
import type { Database } from './database.types';

export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
};

// Clerk 토큰과 함께 사용하는 Supabase 클라이언트
export const useSupabaseWithAuth = () => {
  const { getToken } = useAuth();
  const supabase = createClient();

  const getAuthenticatedClient = async () => {
    const token = await getToken({ template: 'supabase' });
    if (token) {
      supabase.realtime.setAuth(token);
    }
    return supabase;
  };

  return { supabase, getAuthenticatedClient };
};

// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

export const createServerClient = async () => {
  const { getToken } = auth();
  const cookieStore = cookies();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server component에서는 cookie 설정 불가
          }
        },
      },
    },
  );

  // Clerk 토큰으로 인증
  const token = await getToken({ template: 'supabase' });
  if (token) {
    supabase.realtime.setAuth(token);
  }

  return supabase;
};
```

### 3.2. 어뷰징 방지 및 리스크 관리 시스템

플랫폼의 신뢰성을 위해 다층적 방어 체계를 구축합니다.

#### 3.2.1. 1계층: 계정 및 접근 제어 (사전 방어)

**Clerk 통합 본인인증**

```sql
-- 본인인증 테이블
CREATE TABLE identity_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id) NOT NULL, -- Clerk User ID
  verification_type TEXT NOT NULL, -- 'toss_auth', 'mobile', 'card'
  ci TEXT UNIQUE NOT NULL, -- 본인인증 CI (암호화)
  verification_data JSONB,
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

-- 디바이스 핑거프린트 테이블
CREATE TABLE device_fingerprints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id), -- Clerk User ID
  fingerprint_hash TEXT NOT NULL,
  user_agent TEXT,
  screen_resolution TEXT,
  timezone TEXT,
  language TEXT,
  ip_address INET,
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  usage_count INTEGER DEFAULT 1
);
```

#### 3.2.2. 2계층: 행동 패턴 분석 및 이상 탐지 (실시간 탐지)

**Clerk 웹훅을 활용한 사용자 동기화**

```typescript
// app/api/webhooks/clerk/route.ts
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';
import { Webhook } from 'svix';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as any;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', { status: 400 });
  }

  const supabase = await createServerClient();

  switch (evt.type) {
    case 'user.created':
      // 새 사용자 프로필 생성
      await supabase.from('profiles').insert({
        id: evt.data.id,
        email: evt.data.email_addresses[0].email_address,
        name: `${evt.data.first_name} ${evt.data.last_name}`,
        role: 'creator',
      });
      break;

    case 'user.updated':
      // 사용자 정보 업데이트
      await supabase
        .from('profiles')
        .update({
          email: evt.data.email_addresses[0].email_address,
          name: `${evt.data.first_name} ${evt.data.last_name}`,
        })
        .eq('id', evt.data.id);
      break;

    case 'user.deleted':
      // 사용자 삭제 (소프트 삭제)
      await supabase.from('profiles').update({ is_active: false }).eq('id', evt.data.id);
      break;
  }

  return new Response('', { status: 200 });
}
```

### 3.3. 프론트엔드 페이지 구성 (Next.js 15 App Router + Clerk)

#### 3.3.1. 라우팅 구조

Next.js 15 App Router와 Clerk 미들웨어를 활용한 이중 타겟 공개페이지 URL 구조를 구성합니다. 비즈니스와 크리에이터 각각을 위한 차별화된 공개페이지를 제공하며, 공유 페이지는 domain/[slug] 형태로 유지됩니다.

```
app/
├── (main)/                        # 이중 타겟 공개페이지 시스템 (domain)
│   ├── layout.tsx                 # 공통 레이아웃 (테마 시스템 포함)
│   │
│   # 비즈니스 타겟 영역
│   ├── page.tsx                   # 비즈니스 메인 페이지
│   ├── service/
│   │   └── page.tsx              # 비즈니스 서비스 소개
│   ├── pricing/
│   │   └── page.tsx              # 비즈니스 요금제
│   ├── contact/
│   │   └── page.tsx              # 비즈니스 문의하기
│   │
│   # 크리에이터 타겟 영역
│   ├── creators/
│   │   ├── layout.tsx            # 크리에이터 영역 레이아웃
│   │   ├── page.tsx              # 크리에이터 메인 페이지
│   │   ├── service/
│   │   │   └── page.tsx          # 크리에이터 서비스 소개
│   │   └── calculator/
│   │       └── page.tsx          # 크리에이터 수익 계산기
│   │
│   # 공통 기능
│   ├── [slug]/                    # 공유 페이지 (domain/[slug])
│   │   └── page.tsx              # 공유 페이지 렌더링
│   ├── sign-in/
│   │   └── [[...sign-in]]/
│   │       └── page.tsx          # 통합 로그인 페이지
│   └── sign-up/
│       ├── business/
│       │   └── page.tsx          # 비즈니스 회원가입
│       └── creator/
│           └── page.tsx          # 크리에이터 회원가입
├── (creator)/                     # 크리에이터 대시보드 (crt.domain)
│   ├── layout.tsx                # 크리에이터 레이아웃
│   ├── page.tsx                  # 대시보드 홈
│   ├── campaigns/
│   │   ├── page.tsx              # 참여 가능 캠페인
│   │   ├── active/
│   │   │   └── page.tsx          # 진행 중인 캠페인
│   │   └── [id]/
│   │       └── submit/
│   │           └── page.tsx      # 미션 제출
│   ├── earnings/
│   │   ├── page.tsx              # 수익 현황 (3단계 추천 수익 포함)
│   │   └── withdraw/
│   │       └── page.tsx          # 출금 신청
│   ├── pages/
│   │   ├── page.tsx              # 페이지 목록
│   │   ├── new/
│   │   │   └── page.tsx          # 새 페이지 생성
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx      # 페이지 편집
│   └── analytics/
│       └── page.tsx              # 성과 분석 (A/B 테스트 도구 제거)
├── (business)/                    # 비즈니스 대시보드 (biz.domain)
│   ├── layout.tsx                # 비즈니스 레이아웃
│   ├── page.tsx                  # 대시보드 홈
│   ├── campaigns/
│   │   ├── page.tsx              # 캠페인 목록
│   │   ├── new/
│   │   │   └── page.tsx          # 캠페인 생성 마법사
│   │   └── [id]/
│   │       ├── edit/
│   │       │   └── page.tsx      # 캠페인 수정
│   │       └── analytics/
│   │           └── page.tsx      # 캠페인 성과 분석
│   ├── creators/
│   │   ├── page.tsx              # 크리에이터 탐색
│   │   └── [id]/
│   │       └── page.tsx          # 크리에이터 프로필
│   └── billing/
│       └── page.tsx              # 결제 관리 (인보이스/환불 기능 제거)
├── (admin)/                       # 관리자 대시보드 (adm.domain)
│   ├── layout.tsx                # 관리자 레이아웃
│   ├── page.tsx                  # 운영 대시보드
│   ├── users/
│   │   ├── page.tsx              # 사용자 목록
│   │   └── [id]/
│   │       └── page.tsx          # 사용자 상세
│   ├── campaigns/
│   │   ├── pending/
│   │   │   └── page.tsx          # 승인 대기
│   │   └── reports/
│   │       └── page.tsx          # 신고 관리
│   ├── monitoring/
│   │   ├── abuse/
│   │   │   └── page.tsx          # 어뷰징 탐지
│   │   └── system/
│   │       └── page.tsx          # 시스템 모니터링
│   └── settings/
│       └── page.tsx              # 시스템 설정
├── api/                          # API 라우트
│   ├── webhooks/
│   │   ├── clerk/
│   │   │   └── route.ts          # Clerk 웹훅
│   │   ├── toss/
│   │   │   └── route.ts          # 토스페이먼츠 웹훅
│   │   └── supabase/
│   │       └── route.ts          # Supabase 웹훅
│   └── og/
│       └── route.tsx             # OG 이미지 생성 (제거)
├── globals.css                   # 글로벌 스타일
├── layout.tsx                    # 루트 레이아웃
└── middleware.ts                 # Clerk + 도메인 라우팅 미들웨어
```

#### 3.3.2. Clerk 통합 미들웨어

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/creator(.*)', '/business(.*)', '/admin(.*)']);

export default clerkMiddleware((auth, req) => {
  const hostname = req.headers.get('host') || '';
  const url = req.nextUrl.clone();

  // 서브도메인별 라우팅
  if (hostname.includes('crt.')) {
    if (!auth().userId && isProtectedRoute(req)) {
      return auth().redirectToSignIn();
    }
    url.pathname = `/creator${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  if (hostname.includes('biz.')) {
    if (!auth().userId && isProtectedRoute(req)) {
      return auth().redirectToSignIn();
    }
    url.pathname = `/business${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  if (hostname.includes('adm.')) {
    if (!auth().userId && isProtectedRoute(req)) {
      return auth().redirectToSignIn();
    }
    url.pathname = `/admin${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // 보호된 라우트 확인
  if (isProtectedRoute(req)) {
    auth().protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

#### 3.3.3. 이중 타겟 네비게이션 및 테마 시스템

**공통 레이아웃 컴포넌트**:

```typescript
// app/(main)/layout.tsx
import { DualTargetNavigation } from '@/components/navigation/dual-target-navigation'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { getDomainTarget } from '@/lib/utils/domain'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const target = getDomainTarget() // 'business' | 'creator'

  return (
    <ThemeProvider target={target}>
      <div className="min-h-screen">
        <DualTargetNavigation target={target} />
        <main>{children}</main>
        <CommonFooter />
      </div>
    </ThemeProvider>
  )
}
```

**이중 타겟 네비게이션 컴포넌트**:

```typescript
// components/navigation/dual-target-navigation.tsx
interface DualTargetNavigationProps {
  target: 'business' | 'creator';
  currentPath?: string;
}

const NAVIGATION_CONFIG = {
  business: {
    logo: 'Voosting for Business',
    theme: 'business-theme',
    menuItems: [
      { label: '홈', href: '/' },
      { label: '크리에이터', href: '/creators', crossLink: true },
      { label: '서비스', href: '/service' },
      { label: '요금제', href: '/pricing' },
      { label: '문의하기', href: '/contact' },
    ],
    authItems: [
      { label: '로그인', href: '/sign-in' },
      { label: '무료로 시작하기', href: '/sign-up/business', isPrimary: true },
    ],
  },
  creator: {
    logo: 'Voosting for Creators',
    theme: 'creator-theme',
    menuItems: [
      { label: '홈', href: '/creators' },
      { label: '비즈니스', href: '/', crossLink: true },
      { label: '서비스', href: '/creators/service' },
      { label: '수익 계산기', href: '/creators/calculator' },
    ],
    authItems: [
      { label: '로그인', href: '/sign-in' },
      { label: '무료로 시작하기', href: '/sign-up/creator', isPrimary: true },
    ],
  },
};
```

#### 3.3.4. 공유 페이지 라우트 (테마 지원)

```typescript
// app/(main)/[slug]/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { SharedPageRenderer } from '@/components/shared-page/renderer'

interface SharedPageProps {
  params: { slug: string }
}

export default async function SharedPage({ params }: SharedPageProps) {
  const supabase = await createServerClient()

  // 공유 페이지 데이터 조회 (테마 정보 포함)
  const { data: page, error } = await supabase
    .from('shared_pages')
    .select(`
      *,
      owner:profiles!shared_pages_owner_id_fkey(name, avatar_url),
      blocks:page_blocks(*),
      theme_settings
    `)
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single()

  if (error || !page) {
    notFound()
  }

  // 방문자 수 증가
  await supabase
    .from('shared_pages')
    .update({ view_count: page.view_count + 1 })
    .eq('id', page.id)

  return (
    <div className="min-h-screen" data-theme={page.theme_settings?.theme || 'default'}>
      <SharedPageRenderer
        page={page}
        blocks={page.blocks}
        owner={page.owner}
        themeSettings={page.theme_settings}
      />
    </div>
  )
}

// 개선된 메타데이터 (타겟별 브랜딩)
export async function generateMetadata({ params }: SharedPageProps) {
  const supabase = await createServerClient()

  const { data: page } = await supabase
    .from('shared_pages')
    .select('title, description, owner:profiles(name)')
    .eq('slug', params.slug)
    .single()

  return {
    title: page?.title || 'Voosting 공유 페이지',
    description: page?.description || `${page?.owner?.name}님의 Voosting 페이지입니다.`,
  }
}
```

### 3.4. 블록 에디터 상세 기능

크리에이터가 공유 페이지를 자유롭게 구성할 수 있도록 드래그 앤 드롭 방식의 강력한 블록 에디터를 제공합니다.

#### 3.4.1. Clerk 통합 블록 에디터

```typescript
// components/editor/block-editor.tsx
'use client'

import { useState, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { BlockToolbar } from './block-toolbar'
import { SortableBlock } from './sortable-block'
import { useBlockEditor } from '@/hooks/use-block-editor'

interface BlockEditorProps {
  pageId: string
  initialBlocks: PageBlock[]
}

export function BlockEditor({ pageId, initialBlocks }: BlockEditorProps) {
  const { user } = useUser()
  const { blocks, addBlock, updateBlock, deleteBlock, reorderBlocks } = useBlockEditor({
    pageId,
    initialBlocks,
    userId: user?.id
  })

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      reorderBlocks(active.id as string, over.id as string)
    }
  }, [reorderBlocks])

  if (!user) {
    return <div>로그인이 필요합니다.</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <BlockToolbar onAddBlock={addBlock} />

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {blocks.map((block) => (
              <SortableBlock
                key={block.id}
                block={block}
                onUpdate={updateBlock}
                onDelete={deleteBlock}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
```

### 3.5. 핵심 컴포넌트 설계

#### 3.5.1. 이중 타겟 공개페이지 컴포넌트

**DualTargetHeroSection 컴포넌트**:

```typescript
// components/sections/dual-target-hero-section.tsx
'use client'

import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/theme-context'

interface HeroSectionProps {
  target: 'business' | 'creator'
}

const HERO_CONTENT = {
  business: {
    title: "AI 매칭으로 완벽한 크리에이터 찾기",
    subtitle: "검증된 크리에이터 네트워크를 통해 브랜드 성장을 가속화하세요",
    features: [
      "투명한 성과 측정 및 ROI 분석",
      "간편한 캠페인 생성 및 관리",
      "AI 기반 크리에이터 매칭"
    ],
    cta: {
      primary: "캠페인 시작하기",
      secondary: "서비스 알아보기"
    },
    stats: [
      { label: "등록된 크리에이터", value: "10,000+" },
      { label: "성공한 캠페인", value: "2,500+" },
      { label: "평균 ROI", value: "320%" }
    ]
  },
  creator: {
    title: "팔로워 영향력을 수익으로 전환하세요",
    subtitle: "3단계 추천 시스템과 전문 도구로 마케팅크리에이터로 성장하세요",
    features: [
      "3단계 추천 시스템 (10% + 5% + 2%)",
      "자유로운 페이지 빌더",
      "안정적인 수익 구조"
    ],
    cta: {
      primary: "크리에이터 등록하기",
      secondary: "수익 계산해보기"
    },
    stats: [
      { label: "월평균 수익", value: "₩850,000" },
      { label: "활성 크리에이터", value: "8,500+" },
      { label: "추천 성공률", value: "94%" }
    ]
  }
}

export default function DualTargetHeroSection({ target }: HeroSectionProps) {
  const content = HERO_CONTENT[target]
  const { theme } = useTheme()

  return (
    <section className={`hero-section ${theme}`}>
      <div className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 text-primary">
            {content.title}
          </h1>
          <p className="text-xl text-secondary mb-8">
            {content.subtitle}
          </p>

          <div className="flex justify-center gap-4 mb-12">
            <Button variant="primary" size="lg">
              {content.cta.primary}
            </Button>
            <Button variant="secondary" size="lg">
              {content.cta.secondary}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {content.features.map((feature, index) => (
              <div key={index} className="feature-card">
                <p className="text-base font-medium">{feature}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="text-3xl font-bold text-accent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-secondary">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
```

**CrossNavigationButton 컴포넌트**:

```typescript
// components/navigation/cross-navigation-button.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowRight, Users, Building } from 'lucide-react'

interface CrossNavigationButtonProps {
  currentTarget: 'business' | 'creator'
  className?: string
}

const CROSS_NAVIGATION = {
  business: {
    label: '크리에이터',
    description: '크리에이터로 수익 창출하기',
    targetUrl: '/creators',
    icon: Users,
    theme: 'creator-preview'
  },
  creator: {
    label: '비즈니스',
    description: '광고주로 캠페인 시작하기',
    targetUrl: '/',
    icon: Building,
    theme: 'business-preview'
  }
}

export default function CrossNavigationButton({
  currentTarget,
  className
}: CrossNavigationButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()
  const crossNav = CROSS_NAVIGATION[currentTarget]
  const Icon = crossNav.icon

  const handleNavigation = () => {
    // 테마 전환 효과와 함께 네비게이션
    document.documentElement.classList.add('theme-transition')
    setTimeout(() => {
      router.push(crossNav.targetUrl)
    }, 150)
  }

  return (
    <Button
      variant="outline"
      className={`cross-nav-button ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleNavigation}
    >
      <Icon className="w-4 h-4 mr-2" />
      <div className="flex flex-col items-start">
        <span className="font-medium">{crossNav.label}</span>
        {isHovered && (
          <span className="text-xs text-muted-foreground">
            {crossNav.description}
          </span>
        )}
      </div>
      <ArrowRight className="w-4 h-4 ml-2" />
    </Button>
  )
}
```

**TargetThemeProvider 컴포넌트**:

```typescript
// components/theme/target-theme-provider.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface ThemeContextType {
  target: 'business' | 'creator'
  theme: string
  setTheme: (theme: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function TargetThemeProvider({
  children,
  initialTarget
}: {
  children: React.ReactNode
  initialTarget: 'business' | 'creator'
}) {
  const [target, setTarget] = useState(initialTarget)
  const [theme, setTheme] = useState(
    initialTarget === 'business' ? 'business-theme' : 'creator-theme'
  )

  useEffect(() => {
    // 타겟에 따른 테마 적용
    const themeClass = target === 'business' ? 'business-theme' : 'creator-theme'
    document.documentElement.setAttribute('data-target', target)
    document.documentElement.setAttribute('data-theme', themeClass)
    setTheme(themeClass)
  }, [target])

  return (
    <ThemeContext.Provider value={{ target, theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within TargetThemeProvider')
  }
  return context
}
```

#### 3.5.2. 크리에이터 수익 대시보드 (3단계 추천 수익)

```typescript
// components/creator/earnings-dashboard.tsx
'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useSupabaseWithAuth } from '@/lib/supabase/client'

export function EarningsDashboard() {
  const { user } = useUser()
  const { getAuthenticatedClient } = useSupabaseWithAuth()
  const [earnings, setEarnings] = useState({
    total: 0,
    campaign: 0,
    referral_l1: 0,
    referral_l2: 0,
    referral_l3: 0,
    referrals_count: {
      l1: 0,
      l2: 0,
      l3: 0
    }
  })

  useEffect(() => {
    if (user?.id) {
      loadEarningsData()
    }
  }, [user?.id])

  const loadEarningsData = async () => {
    const supabase = await getAuthenticatedClient()

    const { data: kpis } = await supabase
      .from('creator_kpis')
      .select('*')
      .eq('creator_id', user?.id)
      .single()

    if (kpis) {
      setEarnings({
        total: kpis.total_earnings,
        campaign: kpis.total_earnings - kpis.referral_earnings_l1 - kpis.referral_earnings_l2 - kpis.referral_earnings_l3,
        referral_l1: kpis.referral_earnings_l1,
        referral_l2: kpis.referral_earnings_l2,
        referral_l3: kpis.referral_earnings_l3,
        referrals_count: {
          l1: kpis.total_referrals_l1,
          l2: kpis.total_referrals_l2,
          l3: kpis.total_referrals_l3
        }
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* 총 수익 */}
      <Card>
        <CardHeader>
          <CardTitle>총 수익</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {earnings.total.toLocaleString()}원
          </div>
        </CardContent>
      </Card>

      {/* 수익 구성 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">캠페인 수익</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {earnings.campaign.toLocaleString()}원
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              1단계 추천 수익 (10%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {earnings.referral_l1.toLocaleString()}원
            </div>
            <div className="text-sm text-muted-foreground">
              {earnings.referrals_count.l1}명 추천
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              2단계 추천 수익 (5%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {earnings.referral_l2.toLocaleString()}원
            </div>
            <div className="text-sm text-muted-foreground">
              {earnings.referrals_count.l2}명 추천
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              3단계 추천 수익 (2%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {earnings.referral_l3.toLocaleString()}원
            </div>
            <div className="text-sm text-muted-foreground">
              {earnings.referrals_count.l3}명 추천
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 추천 네트워크 시각화 */}
      <Card>
        <CardHeader>
          <CardTitle>추천 네트워크</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">1단계 (10%)</span>
              <Progress
                value={(earnings.referrals_count.l1 / Math.max(earnings.referrals_count.l1, 1)) * 100}
                className="flex-1"
              />
              <span className="text-sm font-medium">{earnings.referrals_count.l1}명</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm">2단계 (5%)</span>
              <Progress
                value={(earnings.referrals_count.l2 / Math.max(earnings.referrals_count.l1, 1)) * 100}
                className="flex-1"
              />
              <span className="text-sm font-medium">{earnings.referrals_count.l2}명</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm">3단계 (2%)</span>
              <Progress
                value={(earnings.referrals_count.l3 / Math.max(earnings.referrals_count.l1, 1)) * 100}
                className="flex-1"
              />
              <span className="text-sm font-medium">{earnings.referrals_count.l3}명</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 3.6. 상태 관리 및 Hooks

#### 3.6.1. Clerk + Supabase 통합 훅

```typescript
// hooks/use-profile.ts
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSupabaseWithAuth } from '@/lib/supabase/client';
import type { Profile } from '@/lib/database.types';

export function useProfile() {
  const { user, isLoaded } = useUser();
  const { getAuthenticatedClient } = useSupabaseWithAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      loadProfile();
    } else if (isLoaded && !user) {
      setProfile(null);
      setLoading(false);
    }
  }, [isLoaded, user]);

  const loadProfile = async () => {
    if (!user?.id) return;

    try {
      const supabase = await getAuthenticatedClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user?.id) return;

    try {
      const supabase = await getAuthenticatedClient();
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (!error && data) {
        setProfile(data);
        return data;
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  return {
    profile,
    loading,
    updateProfile,
    refetch: loadProfile,
  };
}
```

### 3.7. 배포 및 환경 설정

#### 3.7.1. 환경 변수 관리

```typescript
// .env.local
# Clerk (카카오 OAuth 포함)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# 도메인 설정
NEXT_PUBLIC_MAIN_DOMAIN=domain
NEXT_PUBLIC_CREATOR_DOMAIN=crt.domain
NEXT_PUBLIC_BUSINESS_DOMAIN=biz.domain
NEXT_PUBLIC_ADMIN_DOMAIN=adm.domain

# 외부 서비스
GEMINI_API_KEY=AIza...

# 이메일 발송 (Resend)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@cashup.kr

TOSS_CLIENT_KEY=test_ck_...
TOSS_SECRET_KEY=test_sk_...

# lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
  CLERK_SECRET_KEY: z.string(),
  CLERK_WEBHOOK_SECRET: z.string(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  GEMINI_API_KEY: z.string(),
  RESEND_API_KEY: z.string(),
  RESEND_FROM_EMAIL: z.string().email(),
  TOSS_CLIENT_KEY: z.string(),
  TOSS_SECRET_KEY: z.string(),
})

export const env = envSchema.parse(process.env)
```

## 4. 이중 타겟 테마 시스템

### 4.1. 테마 아키텍처 개요

Voosting의 이중 타겟 테마 시스템은 비즈니스와 크리에이터 각각의 특성에 최적화된 디자인을 제공하면서도, 일관된 브랜드 아이덴티티를 유지합니다.

#### 4.1.1. 핵심 설계 원칙

- **타겟 최적화**: 각 사용자 그룹의 특성과 니즈에 맞춘 디자인
- **브랜드 일관성**: 모든 타겟에서 통일된 Voosting 브랜드 경험
- **유연한 전환**: 부드러운 타겟 간 전환 및 크로스 네비게이션
- **접근성 우선**: 모든 사용자를 위한 포용적 디자인

### 4.2. 타겟별 테마 정의

#### 4.2.1. 비즈니스 테마 (Business Theme)

**대상**: 광고주, 마케팅 담당자, 중소기업 대표
**디자인 컨셉**: 전문적, 신뢰감, 성과 중심

**컬러 팔레트**:

```css
/* 비즈니스 테마 CSS 변수 */
:root[data-target='business'] {
  --primary-color: #3b82f6; /* 전문적인 블루 */
  --secondary-color: #22c55e; /* 성공을 나타내는 그린 */
  --accent-color: #1e40af; /* 진한 블루 */
  --background-primary: #ffffff;
  --background-secondary: #f8fafc;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border-color: #e2e8f0;
}
```

**타이포그래피**:

- 헤드라인: 강력하고 임팩트 있는 폰트
- 본문: 가독성 높은 산세리프
- 메트릭/숫자: 모노스페이스 폰트로 데이터 강조

**UI 요소**:

- 날카로운 모서리 (4px 반경)
- 그라데이션 효과 최소화
- 데이터 시각화 중심
- 성과 지표 강조

#### 4.2.2. 크리에이터 테마 (Creator Theme)

**대상**: 인플루언서, 콘텐츠 크리에이터, 마케팅크리에이터
**디자인 컨셉**: 창의적, 개성적, 자유로움

**컬러 팔레트**:

```css
/* 크리에이터 테마 CSS 변수 */
:root[data-target='creator'] {
  --primary-color: #22c55e; /* 생동감 있는 그린 */
  --secondary-color: #8b5cf6; /* 창의적인 퍼플 */
  --accent-color: #059669; /* 진한 그린 */
  --background-primary: #ffffff;
  --background-secondary: #f0fdf4;
  --text-primary: #14532d;
  --text-secondary: #16a34a;
  --border-color: #bbf7d0;
}
```

**타이포그래피**:

- 헤드라인: 친근하고 접근 가능한 폰트
- 본문: 자연스럽고 읽기 편한 폰트
- 강조: 컬러풀한 하이라이트

**UI 요소**:

- 둥근 모서리 (12px 반경)
- 그라데이션 및 그림자 효과
- 일러스트레이션 중심
- 개성 표현 도구 강조

### 4.3. 테마 전환 시스템

#### 4.3.1. 동적 테마 전환

```typescript
// lib/theme/theme-switcher.ts
export class ThemeSwitcher {
  private static readonly TRANSITION_DURATION = 300;

  static async switchTarget(from: 'business' | 'creator', to: 'business' | 'creator') {
    // 전환 애니메이션 시작
    document.documentElement.classList.add('theme-transitioning');

    // CSS 변수 점진적 변경
    await this.animateThemeChange(from, to);

    // 테마 속성 업데이트
    document.documentElement.setAttribute('data-target', to);
    document.documentElement.setAttribute('data-theme', `${to}-theme`);

    // 전환 완료
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, this.TRANSITION_DURATION);
  }

  private static async animateThemeChange(
    from: 'business' | 'creator',
    to: 'business' | 'creator',
  ) {
    const fromTheme = THEME_CONFIGS[from];
    const toTheme = THEME_CONFIGS[to];

    // 컬러 값들을 점진적으로 변경
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 0.1;

        // 각 컬러 값 보간
        this.interpolateColors(fromTheme, toTheme, progress);

        if (progress >= 1) {
          clearInterval(interval);
          resolve(void 0);
        }
      }, 30);
    });
  }
}
```

#### 4.3.2. 크로스 네비게이션 UX

- **호버 프리뷰**: 타겟 전환 버튼에 마우스를 올리면 미리보기
- **부드러운 전환**: 300ms 애니메이션으로 자연스러운 테마 변경
- **컨텍스트 유지**: 사용자의 현재 위치와 상태 정보 보존
- **브레드크럼 업데이트**: 네비게이션 경로 실시간 반영

### 4.4. 공통 디자인 시스템

#### 4.4.1. 브랜드 아이덴티티

```css
/* 공통 브랜드 요소 */
:root {
  /* 로고 및 브랜딩 */
  --brand-logo-height: 32px;
  --brand-font-family: 'Pretendard Variable', sans-serif;

  /* 공통 스페이싱 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;

  /* 공통 애니메이션 */
  --transition-fast: 150ms ease;
  --transition-normal: 300ms ease;
  --transition-slow: 500ms ease;

  /* 공통 그림자 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

#### 4.4.2. 반응형 브레이크포인트

```css
/* 공통 반응형 브레이크포인트 */
:root {
  --breakpoint-sm: 640px; /* 모바일 */
  --breakpoint-md: 768px; /* 태블릿 */
  --breakpoint-lg: 1024px; /* 데스크톱 */
  --breakpoint-xl: 1280px; /* 대형 화면 */
}

/* 타겟별 반응형 조정 */
@media (max-width: 768px) {
  [data-target='business'] {
    --font-size-hero: 2.5rem;
    --spacing-section: 3rem;
  }

  [data-target='creator'] {
    --font-size-hero: 2.25rem;
    --spacing-section: 2.5rem;
  }
}
```

### 4.5. 컴포넌트 테마 적용

#### 4.5.1. 테마 인식 컴포넌트

```typescript
// components/ui/themed-button.tsx
interface ThemedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  target?: 'business' | 'creator' | 'auto'
}

export function ThemedButton({
  variant = 'primary',
  target = 'auto',
  className,
  children,
  ...props
}: ThemedButtonProps) {
  const { currentTarget } = useTheme()
  const appliedTarget = target === 'auto' ? currentTarget : target

  const variantClasses = {
    primary: `btn-primary-${appliedTarget}`,
    secondary: `btn-secondary-${appliedTarget}`,
    outline: `btn-outline-${appliedTarget}`
  }

  return (
    <button
      className={cn(
        'btn-base',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
```

#### 4.5.2. 테마별 컴포넌트 스타일

```css
/* 비즈니스 타겟 버튼 스타일 */
.btn-primary-business {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
  color: white;
  border-radius: 4px;
  font-weight: 600;
  box-shadow: var(--shadow-md);
  transition: var(--transition-fast);
}

.btn-primary-business:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

/* 크리에이터 타겟 버튼 스타일 */
.btn-primary-creator {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: white;
  border-radius: 12px;
  font-weight: 500;
  box-shadow: var(--shadow-sm);
  transition: var(--transition-normal);
}

.btn-primary-creator:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 25px rgba(34, 197, 94, 0.3);
}
```

### 4.6. 테마 관리 도구

#### 4.6.1. 테마 프리뷰 시스템

```typescript
// components/admin/theme-preview.tsx
export function ThemePreview({ target }: { target: 'business' | 'creator' }) {
  return (
    <div className={`theme-preview`} data-target={target}>
      <div className="preview-header">
        <div className="preview-logo">Voosting</div>
        <div className="preview-nav">
          <span>홈</span>
          <span>서비스</span>
          <span>로그인</span>
        </div>
      </div>

      <div className="preview-hero">
        <h1 className="preview-title">
          {target === 'business'
            ? 'AI 매칭으로 완벽한 크리에이터 찾기'
            : '팔로워 영향력을 수익으로 전환하세요'
          }
        </h1>
        <ThemedButton variant="primary" target={target}>
          {target === 'business' ? '캠페인 시작하기' : '크리에이터 등록하기'}
        </ThemedButton>
      </div>

      <div className="preview-features">
        <div className="feature-card">특징 1</div>
        <div className="feature-card">특징 2</div>
        <div className="feature-card">특징 3</div>
      </div>
    </div>
  )
}
```

#### 4.6.2. 테마 커스터마이징 도구

```typescript
// components/admin/theme-customizer.tsx
export function ThemeCustomizer() {
  const [customColors, setCustomColors] = useState({
    business: { ...DEFAULT_BUSINESS_COLORS },
    creator: { ...DEFAULT_CREATOR_COLORS }
  })

  const handleColorChange = (
    target: 'business' | 'creator',
    colorKey: string,
    value: string
  ) => {
    setCustomColors(prev => ({
      ...prev,
      [target]: {
        ...prev[target],
        [colorKey]: value
      }
    }))

    // 실시간 미리보기 적용
    applyCustomTheme(target, { [colorKey]: value })
  }

  return (
    <div className="theme-customizer">
      <Tabs defaultValue="business">
        <TabsList>
          <TabsTrigger value="business">비즈니스 테마</TabsTrigger>
          <TabsTrigger value="creator">크리에이터 테마</TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          <ColorCustomizer
            target="business"
            colors={customColors.business}
            onChange={handleColorChange}
          />
        </TabsContent>

        <TabsContent value="creator">
          <ColorCustomizer
            target="creator"
            colors={customColors.creator}
            onChange={handleColorChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

## 5. 개발 가이드라인

### 4.1. 코드 규칙

- **TypeScript**: strict 모드 활성화, Zod 스키마 검증 필수
- **ESLint**: Next.js 권장 설정 + Prettier 통합
- **컴포넌트**: 서버/클라이언트 컴포넌트 명확히 분리
- **인증**: Clerk 훅과 미들웨어 적극 활용
- **네이밍**: 파일명은 kebab-case, 컴포넌트명은 PascalCase
- **임포트**: 절대 경로 사용 (@/components, @/lib)

### 4.2. 디렉토리 구조

```
cashup/
├── app/                           # Next.js 15 App Router
│   ├── (main)/                   # 메인 도메인 라우트
│   ├── (creator)/                # 크리에이터 대시보드
│   ├── (business)/               # 비즈니스 대시보드
│   ├── (admin)/                  # 관리자 대시보드
│   ├── api/                      # API 라우트
│   ├── globals.css               # 글로벌 스타일
│   ├── layout.tsx                # 루트 레이아웃
│   └── middleware.ts             # Clerk + 도메인 미들웨어
├── components/                   # React 컴포넌트
│   ├── ui/                       # Shadcn/ui 기본 컴포넌트
│   ├── blocks/                   # 페이지 블록 컴포넌트
│   ├── forms/                    # 폼 컴포넌트
│   ├── charts/                   # 차트 컴포넌트 (A/B 테스트 제거)
│   └── shared-page/              # 공유 페이지 컴포넌트
├── hooks/                        # 커스텀 React Hooks
├── lib/                          # 유틸리티 및 설정
│   ├── supabase/                 # Supabase 클라이언트 (Clerk 통합)
│   ├── clerk/                    # Clerk 설정
│   ├── utils.ts                  # 공통 유틸리티
│   ├── validations.ts            # Zod 스키마
│   └── constants.ts              # 상수 정의
├── stores/                       # Zustand 스토어
├── types/                        # TypeScript 타입 정의
├── supabase/                     # Supabase 설정
│   ├── migrations/               # DB 마이그레이션
│   ├── functions/                # Edge Functions
│   └── config.toml               # Supabase 설정
├── public/                       # 정적 파일
├── tests/                        # 테스트 파일
├── package.json
├── next.config.js               # Next.js 설정
├── tailwind.config.ts           # Tailwind 설정
└── tsconfig.json                # TypeScript 설정
```

### 4.3. 테스팅 전략

- **단위 테스트**: Vitest를 사용한 컴포넌트 및 유틸리티 테스트
- **통합 테스트**: React Testing Library를 사용한 사용자 시나리오 테스트
- **E2E 테스트**: Playwright를 사용한 전체 플로우 테스트
- **인증 테스트**: Clerk 인증 플로우 테스트
- **Supabase 테스트**: 로컬 Supabase 환경에서 DB 테스트

## 5. 구현 로드맵

### 5.1. 1단계: 기반 구축 (1-2주)

- **Next.js 15 프로젝트 설정 및 기본 구조 구축**
- **Clerk 인증 시스템 설정 (카카오 OAuth 포함)**
- **Supabase 프로젝트 생성 및 초기 데이터베이스 스키마 설계**
- **Tailwind CSS v4 설정 및 Shadcn/ui 통합**
- **기본 UI 컴포넌트 개발 (Button, Card, Input 등)**

### 5.2. 2단계: 사용자 관리 및 인증 (2주)

- **Clerk와 Supabase 통합 인증 시스템 구현**
- **사용자 역할별 대시보드 라우팅 (middleware 활용)**
- **프로필 관리 시스템 구축 (Clerk 메타데이터 연동)**
- **토스 1원 인증 API 연동**
- **Row Level Security (RLS) + Clerk 토큰 검증 정책 설정**

### 5.3. 3단계: 핵심 데이터 모델 구축 (2-3주)

- **캠페인, 공유 페이지, 사용자 KPI 테이블 생성**
- **3단계 추천 시스템 데이터베이스 스키마 구현**
- **Supabase 마이그레이션 및 시드 데이터 구성**
- **TypeScript 타입 자동 생성 및 Clerk 통합**
- **Supabase Realtime 구독 시스템 구현**

### 5.4. 4단계: 핵심 기능 개발 (3-4주)

- **캠페인 CRUD 기능 (Server Actions 활용)**
- **드래그 앤 드롭 블록 에디터 구현**
- **공유 페이지 렌더링 (domain/[slug] 구조)**
- **AI 매칭 시스템 (Google Gemini API 연동)**
- **실시간 알림 시스템 (Supabase Realtime)**

### 5.5. 5단계: 추천 시스템 및 수익 관리 (2-3주)

- **3단계 추천 네트워크 구현 (1단계 10%, 2단계 5%, 3단계 2%)**
- **수익 계산 및 분배 로직 구현**
- **토스페이먼츠 API 통합 및 웹훅 처리**
- **출금 시스템 구축**
- **자동 정산 시스템 (Supabase Edge Functions + Cron)**

### 5.6. 6단계: 어뷰징 방지 및 보안 강화 (2주)

- **다층 방어 체계 구현 (IP 차단, 디바이스 핑거프린팅)**
- **Supabase Edge Functions를 활용한 실시간 이상 탐지**
- **관리자 모니터링 대시보드 구축**
- **사용자 신고 및 제재 시스템**
- **Clerk 보안 정책 강화**

### 5.7. 7단계: 성능 최적화 및 배포 (1-2주)

- **Next.js 성능 최적화 (ISR, Edge Functions 활용)**
- **Supabase 쿼리 최적화 및 인덱싱**
- **이미지 최적화 및 CDN 설정**
- **E2E 테스트 작성 및 CI/CD 파이프라인 구축**
- **Vercel 프로덕션 배포 및 도메인 설정**
- **Clerk + Supabase 운영 환경 설정**

### 5.8. 8단계: 고도화 및 운영 (지속적)

- **추천 네트워크 분석 도구 개발**
- **고급 분석 대시보드 개발**
- **모바일 반응형 최적화**
- **PWA 기능 추가**
- **다국어 지원 (i18n)**
- **성능 모니터링 및 최적화**

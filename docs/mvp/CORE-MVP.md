# Core MVP 8주 개발 계획

**문서 버전**: 1.0  
**작성일**: 2025년 7월 30일  
**개발 기간**: 8주 (2025.08.01 - 2025.09.26)  
**목표**: 핵심 비즈니스 모델 검증을 위한 최소 기능 구현

---

## 🎯 Core MVP 목표

### 비즈니스 검증 목표

**"캐쉬업이 실제로 작동하는 비즈니스 모델인가?"**

1. **사용자 획득 검증**: 크리에이터와 광고주가 실제로 가입하는가?
2. **매칭 검증**: 수동 매칭으로도 캠페인이 성사되는가?
3. **수익 창출 검증**: 실제 캠페인 수행 후 수익이 발생하는가?
4. **추천 효과 검증**: 1단계 추천만으로도 바이럴 효과가 있는가?

### 기술적 목표

- **안정성**: 99% 이상 가동률 달성
- **성능**: 페이지 로딩 3초 이내
- **사용성**: 직관적인 UI/UX로 학습 비용 최소화
- **확장성**: Enhanced MVP로 자연스럽게 확장 가능한 아키텍처

---

## 📋 핵심 기능 정의

### 🔐 1. 인증 및 사용자 관리 (Supabase Auth)

```yaml
필수 기능: ✅ 카카오 OAuth 소셜 로그인
  ✅ 이메일/비밀번호 로그인 (백업용)
  ✅ 사용자 프로필 관리 (이름, 프로필 사진, 소개)
  ✅ 역할 선택 (크리에이터/비즈니스)
  ✅ 추천 코드 시스템 (가입 시 추천인 설정)

기술 구현:
  - Supabase Auth 설정 및 카카오 OAuth 연동
  - PostgreSQL profiles 테이블
  - RLS (Row Level Security) 기본 정책
  - Next.js 15 미들웨어 인증 처리
```

### 🏠 2. 멀티도메인 라우팅

```yaml
도메인 구조:
  ✅ domain (메인): 랜딩 페이지, 공유 페이지
  ✅ crt.domain (크리에이터): 크리에이터 대시보드
  ✅ biz.domain (비즈니스): 비즈니스 대시보드

핵심 페이지:
  - 메인: 홈페이지, 로그인, 회원가입
  - 크리에이터: 대시보드, 캠페인 목록, 프로필 설정
  - 비즈니스: 대시보드, 캠페인 생성, 크리에이터 목록
```

### 📊 3. 기본 대시보드

```yaml
크리에이터 대시보드: ✅ 수익 현황 (총 수익, 이번 달 수익)
  ✅ 참여 중인 캠페인 목록
  ✅ 추천 현황 (추천 인원, 추천 수익)
  ✅ 프로필 수정

비즈니스 대시보드: ✅ 진행 중인 캠페인 현황
  ✅ 캠페인 성과 요약
  ✅ 크리에이터 신청 현황
  ✅ 예산 관리
```

### 🎯 4. 캠페인 시스템 (기본 버전)

```yaml
캠페인 생성 (비즈니스): ✅ 캠페인 제목, 설명, 카테고리
  ✅ 보상 금액 설정
  ✅ 캠페인 기간 설정
  ✅ 타겟 크리에이터 조건 (선택사항)
  ✅ 썸네일 이미지 업로드

캠페인 참여 (크리에이터): ✅ 사용 가능한 캠페인 목록 조회
  ✅ 캠페인 상세 정보 확인
  ✅ 참여 신청 (간단한 메시지)
  ✅ 참여 현황 추적

캠페인 관리: ✅ 참여 신청 승인/거절 (비즈니스)
  ✅ 미션 완료 보고 (크리에이터)
  ✅ 완료 승인 및 수익 지급 (수동)
```

### 📄 5. 공유 페이지 (정적 버전)

```yaml
기본 공유 페이지: ✅ domain/[slug] 형태 URL
  ✅ 크리에이터 프로필 표시
  ✅ 참여 중인 캠페인 목록
  ✅ 간단한 소개 텍스트
  ✅ 연락처 정보
  ✅ 추천 링크 (가입 유도)

관리 기능: ✅ 공유 페이지 활성화/비활성화
  ✅ 기본 템플릿 선택 (3가지)
  ✅ 메타데이터 설정 (제목, 설명)
  ✅ 방문자 수 추적
```

### 💰 6. 수익 관리 (수동 정산)

```yaml
수익 계산:
  ✅ 캠페인 수익 기록
  ✅ 1단계 추천 수익 (10%) 자동 계산
  ✅ 수익 내역 조회
  ✅ 총 수익 및 출금 가능 금액 표시

정산 관리:
  ✅ 출금 신청 (최소 금액: 10,000원)
  ✅ 출금 신청 내역 관리
  ✅ 관리자 승인 후 수동 송금
  ✅ 정산 완료 알림
```

### 🔗 7. 1단계 추천 시스템

```yaml
추천 가입: ✅ 추천 코드로 가입 시 추천 관계 설정
  ✅ 추천인과 피추천인 관계 데이터베이스 저장
  ✅ 추천 성공 시 알림

추천 수익: ✅ 피추천인의 캠페인 수익 발생 시
  ✅ 추천인에게 10% 수익 자동 지급
  ✅ 추천 수익 내역 별도 관리
  ✅ 추천 현황 대시보드
```

---

## 📅 8주 개발 일정

### Week 1-2: 프로젝트 기반 구축

```yaml
Week 1 (2025.08.01-08.07):
  🔧 개발 환경 설정:
    - Next.js 15 프로젝트 생성
    - TypeScript, Tailwind CSS, Shadcn/ui 설정
    - Supabase 프로젝트 생성 및 환경 변수 설정
    - Git 저장소 및 배포 환경 (Vercel) 설정

  🗄️ 데이터베이스 기초:
    - Supabase PostgreSQL 기본 스키마 설계
    - profiles, campaigns, earnings 테이블 생성
    - RLS 기본 정책 설정

Week 2 (2025.08.08-08.14):
  🔐 인증 시스템 구현:
    - Supabase Auth 설정
    - 카카오 OAuth 연동
    - 로그인/회원가입 페이지
    - 미들웨어 인증 처리
    - 기본 프로필 관리 기능
```

### Week 3-4: 멀티도메인 및 기본 UI

```yaml
Week 3 (2025.08.15-08.21):
  🏠 멀티도메인 라우팅:
    - 도메인별 라우팅 미들웨어
    - 메인, 크리에이터, 비즈니스 도메인 설정
    - 역할 기반 접근 제어
    - 기본 레이아웃 컴포넌트

Week 4 (2025.08.22-08.28):
  🎨 기본 UI 컴포넌트:
    - 대시보드 레이아웃
    - 네비게이션 컴포넌트
    - 카드, 버튼, 폼 컴포넌트
    - 반응형 디자인 기초
```

### Week 5-6: 캠페인 시스템

```yaml
Week 5 (2025.08.29-09.04):
  🎯 캠페인 CRUD:
    - 캠페인 생성 폼 (비즈니스)
    - 캠페인 목록 및 상세 페이지
    - 이미지 업로드 (Supabase Storage)
    - 캠페인 상태 관리

Week 6 (2025.09.05-09.11):
  👥 캠페인 참여 시스템:
    - 크리에이터 캠페인 목록
    - 참여 신청 기능
    - 비즈니스 신청 관리
    - 참여 현황 추적
```

### Week 7-8: 수익 및 추천 시스템

```yaml
Week 7 (2025.09.12-09.18):
  💰 수익 관리 시스템:
    - 수익 계산 로직
    - 수익 내역 페이지
    - 출금 신청 기능
    - 1단계 추천 수익 자동 계산

Week 8 (2025.09.19-09.26):
  📄 공유 페이지 & 마무리:
    - 정적 공유 페이지 생성
    - 추천 링크 시스템
    - 전체 기능 통합 테스트
    - 버그 수정 및 최적화
```

---

## 🗄️ 데이터베이스 스키마 (Core MVP)

### 핵심 테이블 구조

```sql
-- 사용자 프로필
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'creator', -- 'creator' | 'business'
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,

  -- 추천 시스템 (1단계만)
  referrer_id UUID REFERENCES profiles(id),
  referral_code TEXT UNIQUE NOT NULL DEFAULT generate_referral_code(),

  -- 크레딧 및 수익
  total_earnings DECIMAL(10,2) DEFAULT 0,
  referral_earnings DECIMAL(10,2) DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 캠페인
CREATE TABLE campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  reward DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'active', -- 'active' | 'paused' | 'completed'
  thumbnail_url TEXT,

  -- 기간
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 캠페인 참여
CREATE TABLE campaign_participations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) NOT NULL,
  creator_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected' | 'completed'
  application_message TEXT,

  -- 수익 정보
  earning_amount DECIMAL(10,2) DEFAULT 0,
  is_paid BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(campaign_id, creator_id)
);

-- 공유 페이지
CREATE TABLE shared_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  template TEXT DEFAULT 'basic', -- 'basic' | 'modern' | 'minimal'
  view_count INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 수익 내역
CREATE TABLE earnings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL, -- 'campaign' | 'referral'
  source_id UUID, -- campaign_id 또는 referrer_id
  description TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 출금 신청
CREATE TABLE withdrawal_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected' | 'completed'
  bank_account TEXT NOT NULL,
  admin_note TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);
```

### RLS 정책 (보안)

```sql
-- 프로필 접근 제어
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);

-- 캠페인 접근 제어
CREATE POLICY "Business users can manage own campaigns" ON campaigns
FOR ALL USING (auth.uid() = client_id);

CREATE POLICY "All users can view active campaigns" ON campaigns
FOR SELECT USING (status = 'active');

-- 참여 접근 제어
CREATE POLICY "Creators can view own participations" ON campaign_participations
FOR SELECT USING (auth.uid() = creator_id);

CREATE POLICY "Business can view participations for own campaigns" ON campaign_participations
FOR SELECT USING (
  auth.uid() IN (
    SELECT client_id FROM campaigns WHERE id = campaign_id
  )
);
```

---

## 🎨 UI/UX 설계

### 디자인 시스템

```yaml
컬러 팔레트:
  - Primary: Blue (#3B82F6)
  - Secondary: Green (#10B981)
  - Warning: Yellow (#F59E0B)
  - Danger: Red (#EF4444)
  - Neutral: Gray scale

타이포그래피:
  - 제목: Inter Bold
  - 본문: Inter Regular
  - UI: Inter Medium

컴포넌트:
  - Shadcn/ui 기반
  - 일관된 간격 (4px 단위)
  - 둥근 모서리 (8px)
  - 그림자 활용
```

### 주요 페이지 와이어프레임

#### 크리에이터 대시보드

```
┌─────────────────────────────────────┐
│ Header (Logo, Profile, Logout)      │
├─────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐│
│ │총 수익  │ │이번 달  │ │추천 수익││
│ │50,000원 │ │15,000원 │ │5,000원  ││
│ └─────────┘ └─────────┘ └─────────┘│
├─────────────────────────────────────┤
│ 참여 가능한 캠페인                    │
│ ┌─────────────────────────────────┐ │
│ │ [이미지] 제품 리뷰 캠페인          │ │
│ │ 보상: 30,000원 | 마감: 7일 남음   │ │
│ │ [참여 신청] 버튼                  │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ 진행 중인 캠페인                     │
│ ┌─────────────────────────────────┐ │
│ │ 브랜드 홍보 캠페인 - 진행 중       │ │
│ │ [미션 완료 보고] 버튼              │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### 비즈니스 대시보드

```
┌─────────────────────────────────────┐
│ Header (Logo, Profile, Logout)      │
├─────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐│
│ │활성 캠페인│ │총 지출  │ │참여자 수││
│ │3개      │ │150,000원│ │12명     ││
│ └─────────┘ └─────────┘ └─────────┘│
├─────────────────────────────────────┤
│ [새 캠페인 만들기] 버튼               │
├─────────────────────────────────────┤
│ 내 캠페인 목록                       │
│ ┌─────────────────────────────────┐ │
│ │ 제품 리뷰 캠페인                  │ │
│ │ 참여자: 5명 | 예산: 150,000원     │ │
│ │ [관리하기] 버튼                   │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 🔧 기술 구현 가이드

### 1. Supabase Auth 설정

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// 카카오 로그인
export async function signInWithKakao() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  return { data, error };
}
```

### 2. 멀티도메인 미들웨어

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl.clone();

  // 도메인별 라우팅
  if (hostname.includes('crt.')) {
    url.pathname = `/creator${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  if (hostname.includes('biz.')) {
    url.pathname = `/business${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
```

### 3. 캠페인 CRUD 예시

```typescript
// app/(business)/campaigns/create/page.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function CreateCampaignPage() {
  const [campaign, setCampaign] = useState({
    title: '',
    description: '',
    reward: 0,
    category: '',
    start_date: '',
    end_date: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { data, error } = await supabase
      .from('campaigns')
      .insert([campaign])
      .select()

    if (error) {
      console.error('Campaign creation failed:', error)
      return
    }

    // 성공 처리
    router.push('/campaigns')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="캠페인 제목"
        value={campaign.title}
        onChange={(e) => setCampaign({...campaign, title: e.target.value})}
        required
      />
      {/* 나머지 폼 필드들 */}
      <button type="submit">캠페인 생성</button>
    </form>
  )
}
```

---

## 📊 성공 지표 및 KPI

### 8주 후 목표 지표

```yaml
사용자 관련:
  ✅ 크리에이터 가입: 100명+
  ✅ 비즈니스 가입: 20명+
  ✅ 일일 활성 사용자: 30명+
  ✅ 사용자 리텐션 (7일): 40%+

기능 사용률:
  ✅ 캠페인 생성률: 60% (비즈니스 사용자 대비)
  ✅ 캠페인 참여율: 40% (크리에이터 대비)
  ✅ 공유 페이지 생성률: 70% (크리에이터 대비)
  ✅ 추천 가입률: 20% (전체 가입자 대비)

비즈니스 성과:
  ✅ 첫 수익 발생: 10건+
  ✅ 평균 캠페인 보상: 25,000원
  ✅ 추천 수익 비중: 15%+
  ✅ 사용자 만족도: NPS 30+

기술적 성과:
  ✅ 페이지 로딩 시간: <3초
  ✅ 서비스 가동률: >99
  ✅ API 응답 시간: <500ms
  ✅ 버그 리포트: <5건/주
```

### 측정 방법

```yaml
Analytics 도구:
  - Vercel Analytics: 페이지 성능 및 방문자 추적
  - Supabase Dashboard: 데이터베이스 성능 모니터링
  - 내장 추적: 사용자 행동 데이터 수집

주간 리뷰:
  - 매주 금요일 지표 검토
  - 목표 달성도 평가
  - 다음 주 우선순위 조정
```

---

## 🚨 위험 요소 및 대응

### 기술적 위험

```yaml
Supabase Auth 학습 곡선:
  - 위험도: 중간
  - 완화: 첫 2주에 집중 학습, 공식 문서 숙지
  - 백업: 필요 시 NextAuth.js 전환 준비

성능 이슈:
  - 위험도: 중간
  - 완화: 초기부터 최적화 고려, 점진적 부하 테스트
  - 백업: 캐싱 전략 및 DB 쿼리 최적화

카카오 OAuth 연동:
  - 위험도: 낮음
  - 완화: 개발 초기에 우선 구현 및 테스트
  - 백업: 이메일 로그인으로 임시 대체
```

### 비즈니스 위험

```yaml
사용자 확보 실패:
  - 위험도: 중간
  - 완화: MVP 출시 후 빠른 피드백 수집, 개선
  - 백업: 피벗 계획 준비

수익 모델 검증 실패:
  - 위험도: 중간
  - 완화: 다양한 보상 구조 테스트
  - 백업: 대안 수익 모델 연구
```

---

## 📋 Core MVP 체크리스트

### 개발 완료 체크리스트

```yaml
인증 시스템: □ Supabase Auth 설정 완료
  □ 카카오 OAuth 연동 완료
  □ 로그인/회원가입 페이지 완성
  □ 프로필 관리 기능 완성
  □ 역할 기반 접근 제어 완성

UI/UX: □ 반응형 레이아웃 완성
  □ 크리에이터 대시보드 완성
  □ 비즈니스 대시보드 완성
  □ 기본 컴포넌트 라이브러리 완성

캠페인 시스템: □ 캠페인 CRUD 완성
  □ 캠페인 참여 시스템 완성
  □ 이미지 업로드 기능 완성
  □ 캠페인 상태 관리 완성

수익 시스템: □ 수익 계산 로직 완성
  □ 1단계 추천 시스템 완성
  □ 출금 신청 기능 완성
  □ 수익 내역 조회 완성

공유 페이지: □ 정적 페이지 생성 완성
  □ 템플릿 시스템 완성
  □ 추천 링크 기능 완성
  □ 방문자 추적 완성
```

### 테스트 체크리스트

```yaml
기능 테스트: □ 회원가입/로그인 플로우 테스트
  □ 캠페인 생성/참여 플로우 테스트
  □ 수익 계산 및 출금 플로우 테스트
  □ 추천 시스템 테스트

성능 테스트: □ 페이지 로딩 속도 테스트
  □ 데이터베이스 쿼리 성능 테스트
  □ 이미지 업로드 성능 테스트

보안 테스트: □ RLS 정책 테스트
  □ 인증 권한 테스트
  □ SQL 인젝션 방지 테스트

사용성 테스트: □ 5명 이상 베타 테스터 피드백
  □ 모바일 사용성 테스트
  □ 접근성 기본 테스트
```

### 배포 준비 체크리스트

```yaml
환경 설정: □ 프로덕션 환경 변수 설정
  □ Supabase 프로덕션 프로젝트 설정
  □ 도메인 및 SSL 인증서 설정
  □ Vercel 배포 설정

문서화: □ API 문서 작성
  □ 사용자 가이드 작성
  □ 개발자 가이드 업데이트
  □ 이용약관 및 개인정보처리방침

운영 준비: □ 모니터링 시스템 설정
  □ 백업 시스템 설정
  □ 에러 추적 시스템 설정
  □ 고객 지원 채널 준비
```

---

## 🎯 다음 단계: Enhanced MVP

Core MVP 완료 후 바로 Enhanced MVP로 전환:

- **드래그앤드롭 페이지 빌더** 구현
- **Google Gemini AI 매칭** 시스템 추가
- **토스페이먼츠 연동** 자동 정산
- **실시간 알림** 시스템

상세한 Enhanced MVP 계획은 [ENHANCED-MVP.md](./ENHANCED-MVP.md) 참조

---

**승인 후 개발 시작일**: 2025년 8월 1일  
**Core MVP 완료 목표일**: 2025년 9월 26일

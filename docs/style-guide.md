# Voosting Design System & Style Guide

> 부스팅의 통합 디자인 시스템 가이드라인 v2.0

## 목차

1. [디자인 원칙](#디자인-원칙)
2. [도메인별 테마](#도메인별-테마)
3. [색상 시스템](#색상-시스템)
4. [타이포그래피](#타이포그래피)
5. [컴포넌트 라이브러리](#컴포넌트-라이브러리)
6. [레이아웃 시스템](#레이아웃-시스템)
7. [페이지별 가이드라인](#페이지별-가이드라인)
8. [반응형 디자인](#반응형-디자인)

---

## 디자인 원칙

### 핵심 가치
- **단순성**: 깔끔하고 명확한 인터페이스
- **접근성**: 모든 사용자가 쉽게 사용할 수 있는 디자인
- **일관성**: 도메인별 특색을 유지하면서도 통합된 브랜드 경험
- **성능**: 빠른 로딩과 부드러운 인터랙션

### 디자인 철학
- **크리에이터**: 밝고 활기찬 그린 톤의 친근한 디자인
- **비즈니스**: 신뢰감 있는 블루 톤의 전문적인 디자인
- **관리자**: 차분한 퍼플 톤의 효율적인 디자인
- **공통**: shadcn/ui 컴포넌트 기반의 일관된 UI/UX

---

## 도메인별 테마

### 🎨 크리에이터 도메인 (creator.voosting.app)

#### 테마 특성
- **Primary**: Green-600 (`#10b981`)
- **Secondary**: Emerald-600 (`#059669`)
- **Background**: 밝은 그린 그라데이션

#### 시각적 특징
- **Soft Gradients**: 부드러운 그린 계열 그라데이션
- **Rounded Elements**: 친근한 느낌의 둥근 모서리
- **Bright Tone**: 밝고 긍정적인 색상 팔레트
- **Subtle Shadows**: 가벼운 그림자 효과

#### 주요 컴포넌트 스타일
```css
/* Creator Button */
.creator-button {
  background: #10b981;
  hover:background: #059669;
}

/* Creator Card */
.creator-card {
  border: 1px solid rgb(16 185 129 / 0.2);
  background: rgb(16 185 129 / 0.05);
}
```

### 💼 비즈니스 도메인 (business.voosting.app)

#### 테마 특성
- **Primary**: Blue-600 (`#2563eb`)
- **Secondary**: Indigo-600 (`#4f46e5`)
- **Background**: 차분한 슬레이트 그라데이션

#### 시각적 특징
- **Professional Gradients**: 절제된 블루 계열 그라데이션
- **Clean Layout**: 깔끔하고 전문적인 레이아웃
- **Structured Content**: 체계적인 정보 구조
- **Professional Typography**: 가독성 높은 타이포그래피

#### 주요 컴포넌트 스타일
```css
/* Business Button */
.business-button {
  background: #2563eb;
  hover:background: #1d4ed8;
}

/* Business Card */
.business-card {
  border: 1px solid rgb(37 99 235 / 0.1);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}
```

### ⚙️ 관리자 도메인 (admin.voosting.app)

#### 테마 특성
- **Primary**: Purple-600 (`#9333ea`)
- **Secondary**: Violet-600 (`#7c3aed`)
- **Background**: 차분한 회색 배경

#### 시각적 특징
- **Minimal Design**: 최소한의 장식 요소
- **Functional Focus**: 기능성 중심의 인터페이스
- **Data Tables**: 효율적인 데이터 표시
- **Clear Hierarchy**: 명확한 정보 계층 구조

---

## 색상 시스템

### 기본 색상 (shadcn/ui 기반)

#### Light Mode
| 변수 | 값 | 용도 |
|------|-----|------|
| --background | 0 0% 100% | 배경색 |
| --foreground | 222.2 84% 4.9% | 전경색 |
| --card | 0 0% 100% | 카드 배경 |
| --primary | 222.2 47.4% 11.2% | 주요 액션 |
| --secondary | 210 40% 96.1% | 보조 액션 |
| --muted | 210 40% 96.1% | 비활성 상태 |
| --accent | 210 40% 96.1% | 강조 요소 |

#### Dark Mode
| 변수 | 값 | 용도 |
|------|-----|------|
| --background | 222.2 84% 4.9% | 배경색 |
| --foreground | 210 40% 98% | 전경색 |
| --card | 222.2 84% 4.9% | 카드 배경 |
| --primary | 210 40% 98% | 주요 액션 |
| --secondary | 217.2 32.6% 17.5% | 보조 액션 |
| --muted | 217.2 32.6% 17.5% | 비활성 상태 |
| --accent | 217.2 32.6% 17.5% | 강조 요소 |

### 시맨틱 컬러
| 색상 | Tailwind Class | 용도 |
|------|----------------|------|
| Success | green-600 | 성공 상태 |
| Warning | amber-600 | 경고 상태 |
| Error | red-600 | 오류 상태 |
| Info | blue-600 | 정보 표시 |

---

## 타이포그래피

### 폰트 패밀리
- **Primary**: system-ui, -apple-system, sans-serif
- **Monospace**: ui-monospace, monospace

### 타입 스케일 (Tailwind Classes)

| 레벨 | Class | 크기 | 용도 |
|------|-------|------|------|
| Display | text-6xl | 60px | 히어로 타이틀 |
| H1 | text-4xl md:text-5xl | 36-48px | 페이지 타이틀 |
| H2 | text-3xl | 30px | 섹션 타이틀 |
| H3 | text-2xl | 24px | 서브 타이틀 |
| Body | text-base | 16px | 본문 텍스트 |
| Small | text-sm | 14px | 보조 텍스트 |
| Caption | text-xs | 12px | 캡션/라벨 |

### 폰트 웨이트
- **Bold**: font-bold (700)
- **Semibold**: font-semibold (600)
- **Medium**: font-medium (500)
- **Regular**: font-normal (400)

---

## 컴포넌트 라이브러리

### shadcn/ui 기본 컴포넌트

#### Button
```tsx
// Variants
<Button>기본 버튼</Button>
<Button variant="secondary">보조 버튼</Button>
<Button variant="outline">윤곽선 버튼</Button>
<Button variant="ghost">고스트 버튼</Button>
<Button variant="destructive">삭제 버튼</Button>
<Button variant="link">링크 버튼</Button>

// Sizes
<Button size="sm">작은 버튼</Button>
<Button size="default">기본 버튼</Button>
<Button size="lg">큰 버튼</Button>
<Button size="icon"><Icon /></Button>
```

#### Card
```tsx
<Card>
  <CardHeader>
    <CardTitle>카드 타이틀</CardTitle>
    <CardDescription>카드 설명</CardDescription>
  </CardHeader>
  <CardContent>
    {/* 콘텐츠 */}
  </CardContent>
  <CardFooter>
    {/* 액션 버튼 */}
  </CardFooter>
</Card>
```

#### Badge
```tsx
<Badge>기본 배지</Badge>
<Badge variant="secondary">보조 배지</Badge>
<Badge variant="outline">윤곽선 배지</Badge>
<Badge variant="destructive">위험 배지</Badge>
```

#### Alert
```tsx
<Alert>
  <AlertTitle>알림 제목</AlertTitle>
  <AlertDescription>알림 내용</AlertDescription>
</Alert>
```

#### Progress
```tsx
<Progress value={60} className="h-2" />
```

#### Tabs
```tsx
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">탭 1</TabsTrigger>
    <TabsTrigger value="tab2">탭 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">탭 1 내용</TabsContent>
  <TabsContent value="tab2">탭 2 내용</TabsContent>
</Tabs>
```

---

## 레이아웃 시스템

### 표준 레이아웃 컴포넌트

#### Container
```tsx
import { Container } from '@/components/layout';

// Size variants
<Container size="sm">  {/* max-w-3xl */}
<Container size="md">  {/* max-w-5xl */}
<Container size="lg">  {/* max-w-6xl (default) */}
<Container size="xl">  {/* max-w-7xl */}
<Container size="full"> {/* max-w-full */}
```

#### Section
```tsx
import { Section } from '@/components/layout';

// Size variants
<Section size="sm">  {/* py-8 md:py-12 */}
<Section size="md">  {/* py-12 md:py-20 (default) */}
<Section size="lg">  {/* py-16 md:py-24 */}
<Section size="xl">  {/* py-20 md:py-32 */}
```

#### PageHeader
```tsx
import { PageHeader } from '@/components/layout';

<PageHeader 
  title="페이지 제목"
  description="페이지 설명"
>
  <Button>액션 버튼</Button>
</PageHeader>
```

### Grid System
```tsx
// 반응형 그리드
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* 그리드 아이템 */}
</div>
```

---

## 페이지별 가이드라인

### 공개 페이지 (Public Pages)

#### 메인 페이지
- **Hero**: 듀얼 타겟 탭 (비즈니스/크리에이터)
- **Features**: 3열 그리드의 기능 카드
- **Stats**: 숫자로 보여주는 신뢰도
- **CTA**: 명확한 액션 유도

#### 크리에이터 페이지
- **Hero**: 밝은 그린 톤의 배경
- **Process**: 3단계 시작 가이드
- **Referral**: 3단계 추천 시스템 시각화
- **Benefits**: 혜택 카드 그리드

#### 비즈니스 페이지
- **Hero**: 전문적인 블루 톤
- **Stats**: 4개의 핵심 지표
- **Features**: 6개의 주요 기능
- **ROI Calculator**: 탭 기반 계산기
- **Case Studies**: 성공 사례 카드

### 대시보드 (Dashboards)

#### 공통 요소
- **Sidebar**: 네비게이션 사이드바
- **Header**: 상단 헤더 바
- **Content Area**: 메인 콘텐츠 영역

#### 크리에이터 대시보드
- **색상**: 그린 계열 액센트
- **위젯**: 수익, 캠페인, 추천 현황
- **차트**: 밝은 색상의 차트

#### 비즈니스 대시보드
- **색상**: 블루 계열 액센트
- **위젯**: ROAS, 캠페인 성과, 크리에이터 현황
- **데이터 테이블**: 깔끔한 표 형식

#### 관리자 대시보드
- **색상**: 퍼플 계열 액센트
- **위젯**: 플랫폼 통계, 사용자 관리
- **관리 도구**: 효율적인 관리 인터페이스

---

## 반응형 디자인

### Breakpoints (Tailwind)
```css
/* Mobile First */
sm: 640px   /* 작은 태블릿 */
md: 768px   /* 태블릿 */
lg: 1024px  /* 데스크톱 */
xl: 1280px  /* 큰 데스크톱 */
2xl: 1536px /* 와이드 스크린 */
```

### 모바일 최적화
- **스택 레이아웃**: 세로 정렬
- **터치 친화적**: 최소 44px 터치 영역
- **간소화된 콘텐츠**: 핵심 정보만 표시
- **하단 고정 CTA**: 쉬운 액션 접근

### 태블릿 레이아웃
- **2열 그리드**: 효율적인 공간 활용
- **사이드바**: 접히는 사이드바
- **적응형 카드**: 크기 조정

### 데스크톱 향상
- **다중 열**: 3-4열 레이아웃
- **호버 효과**: 인터랙티브 요소
- **확장된 정보**: 상세 정보 표시

---

## 접근성 가이드라인

### 색상 대비
- **일반 텍스트**: WCAG AA 기준 (4.5:1)
- **큰 텍스트**: WCAG AA 기준 (3:1)
- **shadcn/ui 기본값 사용**

### 키보드 네비게이션
- **포커스 링**: 명확한 포커스 표시
- **탭 순서**: 논리적인 순서
- **스킵 링크**: 메인 콘텐츠로 바로가기

### 스크린 리더
- **의미 있는 라벨**: 모든 인터랙티브 요소
- **대체 텍스트**: 이미지와 아이콘
- **ARIA 라벨**: 적절한 사용

---

## 업데이트 로그

### v2.0 (2025.01)
- shadcn/ui 컴포넌트 전면 도입
- 복잡한 애니메이션 제거
- 깔끔하고 접근성 높은 디자인으로 전환
- 성능 최적화 중심 설계

### v1.0 (2025.01)
- 초기 디자인 시스템 구축

---

이 스타일 가이드는 부스팅 플랫폼의 일관되고 접근성 높은 사용자 경험을 위한 가이드라인입니다. 모든 디자인과 개발은 shadcn/ui 컴포넌트를 기반으로 하며, 성능과 사용성을 최우선으로 합니다.
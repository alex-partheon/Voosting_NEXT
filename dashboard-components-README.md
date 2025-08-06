# Dashboard Components Update

## 개요

Voosting 플랫폼의 공통 대시보드 컴포넌트를 업데이트하여 도메인별 네비게이션, Supabase Auth 통합, 한국어 현지화, 테마 시스템을 지원하도록 개선했습니다.

## 업데이트된 컴포넌트

### 1. AppSidebar (`src/components/app-sidebar.tsx`)

#### 주요 개선사항
- **도메인별 네비게이션**: creator, business, admin, main 도메인에 따라 다른 메뉴 구성
- **Supabase Auth 통합**: 사용자 프로필 정보 자동 로드
- **한국어 현지화**: 모든 메뉴 라벨을 한국어로 표시
- **동적 브랜딩**: 도메인에 따라 브랜드명과 URL 자동 설정

#### 사용법
```tsx
import { AppSidebar } from "@/components/app-sidebar"

// 도메인별 사이드바
<AppSidebar domain="creator" />
<AppSidebar domain="business" />
<AppSidebar domain="admin" />

// 자동 감지 (브라우저 hostname 기반)
<AppSidebar />
```

#### 도메인별 메뉴 구성

**Creator Domain:**
- 대시보드, 캠페인 참여, 콘텐츠 관리, 수익 내역, 추천 시스템
- 크리에이터 도구: 콘텐츠 템플릿, 성과 분석
- 소통: 메시지, 리뷰 관리

**Business Domain:**
- 대시보드, 캠페인 관리, 크리에이터 검색, 성과 분석, 결제 관리
- 마케팅 도구: 브랜드 관리, 타겟 분석
- 관계 관리: 크리에이터 관계, 협상 내역

**Admin Domain:**
- 대시보드, 사용자 관리, 캠페인 관리, 수익 분석, 수수료 정산
- 플랫폼 관리: 승인 대기, 신고 관리
- 시스템: 시스템 상태, 보안 설정

### 2. NavUser (`src/components/nav-user.tsx`)

#### 주요 개선사항
- **Supabase Auth 통합**: 실제 로그아웃 기능 구현
- **도메인별 메뉴**: 각 도메인에 특화된 메뉴 아이템
- **테마 설정**: 라이트/다크/시스템 모드 전환 서브메뉴
- **사용자 역할 표시**: 프로필에 역할 정보 표시
- **한국어 UI**: 모든 메뉴 아이템 한국어화

#### 사용법
```tsx
import { NavUser } from "@/components/nav-user"

<NavUser 
  user={{
    name: "사용자명",
    email: "user@example.com",
    avatar: "/avatar.jpg"
  }}
  domainType="creator"
/>
```

#### 기능
- **테마 전환**: 라이트/다크/시스템 모드
- **로그아웃**: Supabase Auth 세션 정리 후 로그인 페이지로 리다이렉트
- **프로필 관리**: 도메인별 프로필/설정 페이지 이동
- **알림 설정**: 알림 선호도 관리

### 3. SiteHeader (`src/components/site-header.tsx`)

#### 주요 개선사항
- **동적 브레드크럼**: 현재 경로 기반 자동 생성
- **검색 기능**: 데스크톱에서 전체 검색, 모바일에서 버튼
- **알림 시스템**: 알림 개수 표시 및 드롭다운 메뉴
- **테마 전환**: 헤더에서 바로 테마 변경
- **반응형 디자인**: 모바일에서 최적화된 UI

#### 사용법
```tsx
import { SiteHeader } from "@/components/site-header"

<SiteHeader 
  title="커스텀 제목"
  domain="creator"
  showSearch={true}
  showNotifications={true}
/>
```

#### 브레드크럼 생성 로직
- URL 경로를 분석하여 자동으로 브레드크럼 생성
- 도메인별 홈 페이지 설정
- 한국어 경로명 매핑
- 마지막 경로는 페이지로 표시 (링크 비활성화)

### 4. Layout 통합

각 도메인의 레이아웃 파일이 업데이트된 컴포넌트를 사용하도록 수정:

```tsx
// src/app/creator/layout.tsx
<SidebarProvider>
  <AppSidebar domain="creator" />
  <SidebarInset>
    <SiteHeader domain="creator" />
    <main>{children}</main>
  </SidebarInset>
</SidebarProvider>
```

## 기술 스택

### Dependencies
- **Supabase**: 인증 및 데이터베이스
- **next-themes**: 테마 관리
- **@tabler/icons-react**: 아이콘
- **@radix-ui**: UI 프리미티브
- **tailwindcss**: 스타일링

### Hooks 사용
- `useSupabase()`: 사용자 인증 상태 및 프로필
- `useTheme()`: 테마 설정 관리
- `useRouter()`: 네비게이션
- `useSidebar()`: 사이드바 상태

## 타입 안전성

### TypeScript 인터페이스
```typescript
// 도메인 타입
type DomainType = 'main' | 'creator' | 'business' | 'admin'

// 사용자 역할
type UserRole = 'creator' | 'business' | 'admin'

// 컴포넌트 Props
interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  domain?: DomainType
}

interface NavUserProps {
  user: {
    name: string
    email: string
    avatar: string
  }
  domainType?: DomainType
}
```

## 에러 처리

### 인증 에러
- 세션 만료 시 자동 로그인 페이지 리다이렉트
- 권한 부족 시 적절한 에러 메시지 표시

### 네트워크 에러
- 로그아웃 실패 시 콘솔 에러 로그 및 사용자 알림
- 프로필 로드 실패 시 기본값 사용

## 성능 최적화

### 메모이제이션
- `useMemo`로 데이터베이스 서비스 인스턴스 캐싱
- `useCallback`으로 이벤트 핸들러 최적화

### 레이지 로딩
- 도메인별 네비게이션 데이터 필요 시에만 생성
- 사용자 프로필 정보 캐싱

## 접근성 (a11y)

### 키보드 네비게이션
- 모든 메뉴 아이템 키보드 접근 가능
- 드롭다운 메뉴 ESC 키로 닫기

### 스크린 리더
- ARIA 라벨 적절히 설정
- 시맨틱 HTML 구조 사용

### 색상 대비
- 다크/라이트 모드 모두 WCAG 기준 충족
- 중요한 정보는 색상에만 의존하지 않음

## 테마 시스템 통합

### 도메인별 테마
- Creator: 민트 + 퍼플 (창의적, 활발한 느낌)
- Business: 블루 + 틸 (전문적, 신뢰감)
- Admin: 퍼플 + 그레이 (세련된, 관리적)

### CSS 변수
```css
/* 도메인별 커스텀 속성 */
[data-theme="creator"] {
  --primary: oklch(0.75 0.28 165);
  --secondary: oklch(0.65 0.32 280);
}
```

## 국제화 (i18n)

### 한국어 현지화
- 모든 UI 텍스트 한국어로 번역
- 날짜/시간 한국 표준 형식
- 브레드크럼 경로명 한국어 매핑

## 테스트 전략

### 단위 테스트
```typescript
// 컴포넌트 렌더링 테스트
describe('AppSidebar', () => {
  test('renders creator navigation for creator domain', () => {
    render(<AppSidebar domain="creator" />)
    expect(screen.getByText('캠페인 참여')).toBeInTheDocument()
  })
})
```

### 통합 테스트
- Supabase Auth 흐름 테스트
- 도메인별 네비게이션 테스트
- 테마 전환 테스트

## 배포 고려사항

### 환경 변수
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=your_site_url
```

### 도메인 설정
```bash
# /etc/hosts (로컬 개발)
127.0.0.1 creator.localhost
127.0.0.1 business.localhost  
127.0.0.1 admin.localhost
```

## 마이그레이션 가이드

### 기존 코드에서 업그레이드

1. **컴포넌트 import 업데이트**
```typescript
// Before
import { Sidebar } from "@/components/sidebar"

// After  
import { AppSidebar } from "@/components/app-sidebar"
```

2. **Props 업데이트**
```typescript
// Before
<Sidebar />

// After
<AppSidebar domain="creator" />
```

3. **Layout 통합**
```typescript
// 기존 layout 파일에 추가
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
```

## 문제 해결

### 자주 발생하는 이슈

1. **도메인 감지 실패**
   - 해결: `window.location.hostname` 확인
   - 대안: 명시적으로 `domain` prop 전달

2. **Supabase 세션 없음**
   - 해결: 환경 변수 확인
   - 대안: 로그인 페이지로 리다이렉트

3. **테마 적용 안됨**
   - 해결: `data-theme` 속성 확인
   - 대안: CSS 변수 수동 설정

## 향후 개선사항

### 계획된 기능
- [ ] 다국어 지원 (영어, 일본어)
- [ ] 알림 실시간 업데이트
- [ ] 키보드 단축키
- [ ] 사용자 설정 저장
- [ ] 메뉴 커스터마이징

### 성능 개선
- [ ] 가상화된 메뉴 리스트
- [ ] 이미지 최적화
- [ ] 코드 스플리팅
- [ ] 서비스 워커 캐싱

## 기여 가이드

### 코드 스타일
- TypeScript strict 모드 사용
- ESLint + Prettier 설정 준수
- 컴포넌트당 하나의 파일
- Props 인터페이스 명시적 정의

### 컴포넌트 네이밍
- PascalCase로 컴포넌트명
- kebab-case로 파일명
- 명확하고 설명적인 이름 사용

이 문서는 업데이트된 대시보드 컴포넌트의 사용법과 구현 세부사항을 포괄적으로 다룹니다. 추가 질문이나 개선사항이 있으면 언제든지 문의해 주세요.
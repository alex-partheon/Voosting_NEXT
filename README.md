# Voosting - AI 크리에이터 마케팅 플랫폼

크리에이터와 비즈니스를 연결하는 AI 기반 마케팅 플랫폼입니다. 3단계 추천 시스템과 성과 기반 캠페인 매칭을 통해 누구나 쉽게 마케팅 Creator로 활동할 수 있습니다.

## 🚀 주요 기능

- **멀티 도메인 아키텍처**: 크리에이터, 비즈니스, 관리자별 맞춤 대시보드
- **3단계 추천 시스템**: 10% → 5% → 2% 수익 분배 모델
- **AI 캠페인 매칭**: 팔로워와 브랜드를 지능적으로 연결
- **드래그앤드롭 페이지 빌더**: 코딩 없는 프로모션 페이지 제작
- **성과 기반 과금**: 실제 전환에 따른 투명한 수수료 시스템
- **실시간 성과 추적**: Supabase Realtime을 활용한 즉시 피드백

## 🛠 기술 스택

- **Frontend**: Next.js 15.4.4, React 19, TypeScript, Tailwind CSS v4
- **Authentication**: Clerk (이메일 + OAuth providers)
- **Database**: Supabase (PostgreSQL, Realtime, Storage)
- **Payment**: TossPayments (카드 결제 + 1원 인증)
- **Testing**: Jest (단위), Playwright (E2E)
- **Deployment**: Vercel

## 📋 사전 요구사항

- Node.js 18.17 이상
- npm 또는 yarn
- Supabase CLI
- Git

## 🚀 빠른 시작

### 1. 저장소 클론

```bash
git clone https://github.com/alex-partheon/cashup.git
cd cashup
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

```bash
cp .env.example .env.local
```

`.env.local` 파일을 편집하여 필요한 환경 변수를 설정하세요:

```env
# Clerk 인증 설정
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Supabase 설정 (데이터베이스 전용)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 사이트 URL
NEXT_PUBLIC_SITE_URL=http://localhost:3002
```

### 4. Supabase 로컬 개발 환경 설정

```bash
# Supabase CLI 설치 (macOS)
brew install supabase/tap/supabase

# 로컬 Supabase 시작
supabase start

# 데이터베이스 마이그레이션 실행
supabase db reset
```

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3002](http://localhost:3002)을 열어 결과를 확인하세요.

### 6. 로컬 개발 URL

- **메인 앱**: http://localhost:3002
- **크리에이터 대시보드**: http://creator.localhost:3002
- **비즈니스 대시보드**: http://business.localhost:3002
- **관리자 대시보드**: http://admin.localhost:3002
- **Supabase Studio**: http://localhost:54323

## 📁 프로젝트 구조

```
cashup/
├── src/
│   ├── app/                 # Next.js 15 App Router
│   │   ├── (main)/          # 메인 도메인 라우트
│   │   ├── (creator)/       # 크리에이터 대시보드
│   │   ├── (business)/      # 비즈니스 대시보드
│   │   ├── (admin)/         # 관리자 대시보드
│   │   ├── api/             # API 라우트
│   │   ├── sign-in/         # Clerk 로그인
│   │   └── sign-up/         # Clerk 회원가입
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── ui/              # Shadcn/ui 기본 컴포넌트
│   │   ├── forms/           # 폼 컴포넌트
│   │   └── blocks/          # 페이지 빌더 블록
│   ├── lib/                 # 유틸리티 및 설정
│   │   ├── clerk.ts         # Clerk 설정
│   │   └── env.ts           # 환경 변수 관리
│   ├── hooks/               # 커스텀 React 훅
│   ├── stores/              # Zustand 상태 관리
│   └── types/               # TypeScript 타입 정의
├── supabase/
│   ├── migrations/          # 데이터베이스 마이그레이션
│   ├── config.toml          # Supabase 설정
│   └── seed.sql             # 시드 데이터
├── docs/                    # 프로젝트 문서
│   ├── task1.md             # Core MVP 태스크 (89개)
│   ├── task2.md             # Enhanced MVP 태스크 (84개)
│   ├── task3.md             # Full Product 태스크 (48개)
│   ├── PRD.md               # 제품 요구사항 문서
│   └── theme.md             # 디자인 시스템
└── public/                  # 정적 파일
```

## 🔧 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린트 검사
npm run lint

# 타입 검사
npm run type-check

# 테스트 실행
npm run test

# E2E 테스트 실행
npm run test:e2e
```

## 🗄️ 데이터베이스 관리

```bash
# 새 마이그레이션 생성
supabase migration new migration_name

# 마이그레이션 적용
supabase db push

# 데이터베이스 리셋 (시드 데이터 포함)
supabase db reset

# 타입 생성
supabase gen types typescript --local > src/types/database.ts
```

## 🔐 인증 시스템

### 지원되는 인증 방법 (Clerk 기반)

- 이메일/비밀번호 인증 (구현 완료)
- OAuth 소셜 로그인 (추후 추가 예정)
- 매직 링크 (Clerk 기본 제공)

### 사용자 역할 (구현 예정)

- `creator`: 크리에이터 - 캠페인 참여 및 페이지 제작
- `business`: 비즈니스 - 캠페인 생성 및 관리
- `admin`: 관리자 - 플랫폼 운영 및 관리

## 💰 추천 시스템

3단계 추천 시스템으로 구성되어 있습니다:

- **레벨 1**: 직접 추천 (10% 커미션)
- **레벨 2**: 간접 추천 (5% 커미션)
- **레벨 3**: 3차 추천 (2% 커미션)

### 수익 예시 (월 기준)

- 5명 직접 추천 → 25만원 추가 수익
- 25명 2단계 네트워크 → 62만원 추가 수익
- 125명 3단계 네트워크 → 50만원 추가 수익
- **총 예상 추가 수익**: 137만원+

## 🌐 멀티 도메인 구조

### 공개 페이지

- `/` - 메인 랜딩 페이지 (비즈니스 타겟)
- `/creators` - 크리에이터 랜딩 페이지
- `/service` - 서비스 소개 페이지
- `/creators/service` - 크리에이터 서비스 페이지
- `/creators/calculator` - 수익 계산기

### 대시보드 (구현 예정)

- `creator.localhost:3002` - 크리에이터 대시보드
- `business.localhost:3002` - 비즈니스 대시보드
- `admin.localhost:3002` - 관리자 대시보드

## 📱 API 엔드포인트

### 인증

- `GET /api/profile` - 사용자 프로필 조회
- `PUT /api/profile` - 사용자 프로필 업데이트
- `POST /auth/signout` - 로그아웃

### 추천 시스템

- `GET /api/referrals` - 추천 정보 조회
- `POST /api/referrals/validate` - 추천 코드 검증

## 🧪 테스트

### 단위 테스트

```bash
npm run test
```

### E2E 테스트

```bash
npm run test:e2e
```

### 테스트 커버리지

```bash
npm run test:coverage
```

## 🚀 배포

### Vercel 배포

1. Vercel에 프로젝트 연결
2. 환경 변수 설정
3. 자동 배포 활성화

### 환경 변수 (프로덕션)

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_production_clerk_publishable_key
CLERK_SECRET_KEY=your_production_clerk_secret_key
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXT_PUBLIC_SITE_URL=https://voosting.com
```

## 📚 추가 리소스

- [프로젝트 문서](./docs/)
- [API 문서](./docs/api.md)
- [개발 가이드](./docs/development.md)
- [배포 가이드](./docs/deployment.md)

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 지원

문제가 있거나 질문이 있으시면 [Issues](https://github.com/alex-partheon/cashup/issues)를 통해 문의해 주세요.

---

**Voosting** - 크리에이터와 비즈니스를 연결하는 AI 마케팅 플랫폼 🚀

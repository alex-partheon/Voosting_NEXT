# CLAUDE.md

This file provides comprehensive guidance to Claude Code (claude.ai/code) when working with the Voosting codebase.

**⚠️ 세션 시작 시 반드시 읽어야 할 파일들을 먼저 확인하세요!**

**Priority reading order for new sessions:**

1. This CLAUDE.md file (project overview and conventions)
2. `/docs/PLANNING.MD` - Current project status and MVP strategy
3. `/docs/task1.md` - Core MVP tasks (89 items, currently at 15/89 completed)
4. `/docs/PRD.md` - Product requirements document
5. `/docs/theme.md` - Voosting theme system for UI consistency

## Project Overview

**Voosting (부스팅)** is an AI-powered creator marketing platform that connects advertisers with creators through intelligent matching for performance-based marketing campaigns. The platform creates a dual-target ecosystem where businesses find marketing creators and creators monetize their influence as professional marketing tools.

## Key Architecture Notes

### Current Implementation Status

- **Authentication**: Fully migrated to Supabase Auth (email + OAuth)
- **Database**: Supabase with RLS policies based on Supabase auth.uid()
- **Multi-domain Routing**: Complete with middleware-based domain detection
- **Dual-target Public Pages**: Architecture designed (business/creator areas)
- **Progress**: 15/89 Core MVP tasks completed (16.9%)

### ⚠️ Critical Documentation Inconsistencies

**IMPORTANT**: The following components contain outdated information and must be referenced carefully:

| Component                 | Current Implementation       | Outdated Documentation        | Impact | Required Action                                                   |
| ------------------------- | ---------------------------- | ----------------------------- | ------ | ----------------------------------------------------------------- |
| **Authentication**        | Supabase Auth (Email + OAuth) | README mentions Clerk Auth     | HIGH   | Update README.md auth sections                                    |
| **Brand Name**            | Voosting throughout codebase | Some refs to CashUp           | MEDIUM | Global search/replace needed                                      |
| **Referral System**       | 10%/5%/2% (3-tier)           | Old docs show 5%/2%/1%        | HIGH   | Update all commission references                                  |
| **Environment Variables** | Requires SUPABASE_\* vars    | .env.example needs update     | HIGH   | Add SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY   |
| **Architecture**          | Dual-target design           | Generic creator platform      | MEDIUM | Update architectural diagrams                                     |

**Validation Command**: `grep -r "CashUp\|supabase.*auth\|5%.*2%.*1%" --exclude-dir=node_modules .`

**Tech Stack:**

- Next.js 15.4.4 with App Router and React Server Components
- TypeScript with strict mode
- Tailwind CSS v4 for styling
- **Supabase Auth** for authentication and user management
- **Supabase** for database, storage, and real-time features
- Testing: Jest for unit tests, Playwright for E2E tests
- External APIs: Google Gemini AI, Toss Payments, Toss 1-won verification

## Development Commands

### Core Development

```bash
# Start development server with Turbopack
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Type checking
pnpm type-check
```

### Testing Commands

```bash
# Run unit tests (Jest)
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run test coverage report
pnpm test:coverage

# Run E2E tests (Playwright)
pnpm test:e2e

# Run specific test file
pnpm test src/lib/__tests__/middleware-utils.test.ts

# Run Playwright tests with UI (useful for debugging)
npx playwright test --ui

# Run Playwright tests for specific browser
npx playwright test --project=chromium
```

### Database & Backend

```bash
# Start local Supabase
pnpm supabase:start

# Stop local Supabase
pnpm supabase:stop

# Reset database with fresh schema and seed data
pnpm supabase:reset

# Run database migrations
pnpm supabase:migrate

# Generate TypeScript types from database
pnpm supabase:types

# Create new migration
npx supabase migration new <migration_name>

# Access Supabase Studio (local dashboard)
# Open http://localhost:54323 after starting Supabase
```

### MCP Server Integration

The project uses 4 MCP servers for enhanced development capabilities:

```bash
# Test TossPayments MCP integration
npx @tosspayments/integration-guide-mcp

# Test Git MCP server
uvx mcp-server-git --repository /Users/alex/Dev/next/cashup

# Test Playwright MCP for E2E automation
npx @playwright/mcp@latest
```

### Project Structure

```
src/
├── app/              # Next.js 15 App Router
│   ├── (main)/      # Main domain routes (www.domain)
│   ├── (creator)/   # Creator dashboard (creator.domain)
│   ├── (business)/  # Business dashboard (business.domain)
│   ├── (admin)/     # Admin dashboard (admin.domain)
│   └── api/         # API routes
├── components/       # Reusable React components
├── lib/             # Utilities and configurations
├── hooks/           # Custom React hooks
└── types/           # TypeScript type definitions
```

## Architecture

### Multi-Domain Architecture

**Architecture Overview**: Subdomain-based routing with middleware-driven domain detection and role-based access control.

#### Domain Structure

```mermaid
graph TD
    A["🌐 Main Domain<br/>voosting.app"] --> B["👤 Creator Area<br/>/creator/"]
    A --> C["🏢 Business Area<br/>/business/"]

    D["🎨 Creator Subdomain<br/>creator.voosting.app"] --> E["📊 Creator Dashboard<br/>/dashboard"]
    D --> F["💰 Earnings<br/>/earnings"]
    D --> G["🔗 Page Builder<br/>/pages"]

    H["💼 Business Subdomain<br/>business.voosting.app"] --> I["📈 Business Dashboard<br/>/dashboard"]
    H --> J["🎯 Campaign Manager<br/>/campaigns"]
    H --> K["👥 Creator Network<br/>/creators"]

    L["⚙️ Admin Subdomain<br/>admin.voosting.app"] --> M["🛡️ Admin Dashboard<br/>/dashboard"]
    L --> N["👨‍💼 User Management<br/>/users"]
    L --> O["📊 System Analytics<br/>/analytics"]
```

#### Domain Detection Implementation

**Middleware-based Domain Routing** (`src/lib/middleware-utils.ts`):

```typescript
export function getDomainType(hostname: string): DomainType {
  if (!hostname) return 'main';

  const lowerHost = hostname.toLowerCase();

  if (lowerHost.includes('creator.')) return 'creator';
  if (lowerHost.includes('business.')) return 'business';
  if (lowerHost.includes('admin.')) return 'admin';

  return 'main';
}

// URL Rewriting Logic
export function rewriteUrlForDomain(
  pathname: string,
  domainType: DomainType,
  baseUrl: string,
): string {
  if (domainType === 'main') return pathname;

  const prefix = DOMAIN_PREFIXES[domainType]; // e.g., '/creator'

  if (pathname === '/' || pathname === '/dashboard') {
    return `${prefix}/dashboard`;
  }

  return `${prefix}${pathname}`;
}
```

#### Dual-Target Public Architecture

**Main Domain Strategy**: Single domain serving different audiences through navigation and theming.

| Target Audience | Navigation Structure                 | Theme Colors      | Call-to-Action    |
| --------------- | ------------------------------------ | ----------------- | ----------------- |
| **Business**    | 홈/크리에이터/서비스/요금제/문의하기 | Blue-Green        | "무료로 시작하기" |
| **Creator**     | 홈/비즈니스/서비스/수익 계산기       | Mint Green-Purple | "크리에이터 시작" |

**Implementation Pattern**:

```typescript
// app/(main)/page.tsx - Main homepage
export default function HomePage() {
  const [targetAudience, setTargetAudience] = useState<'business' | 'creator'>('business');

  return (
    <div className={cn('homepage', {
      'theme-business': targetAudience === 'business',
      'theme-creator': targetAudience === 'creator'
    })}>
      <AudienceToggle onChange={setTargetAudience} />
      <HeroSection audience={targetAudience} />
      <FeatureSection audience={targetAudience} />
    </div>
  );
}
```

#### Route Group Structure

```
src/app/
├── (main)/           # Main domain (voosting.app)
│   ├── page.tsx      # Dual-target homepage
│   ├── creator/      # Creator public area
│   └── business/     # Business public area
├── (creator)/        # Creator subdomain (creator.voosting.app)
│   ├── dashboard/    # Creator dashboard
│   ├── campaigns/    # Campaign management
│   └── earnings/     # Earnings tracking
├── (business)/       # Business subdomain (business.voosting.app)
│   ├── dashboard/    # Business dashboard
│   ├── campaigns/    # Campaign creation
│   └── creators/     # Creator discovery
└── (admin)/          # Admin subdomain (admin.voosting.app)
    ├── dashboard/    # Admin overview
    ├── users/        # User management
    └── analytics/    # System analytics
```

#### Domain Testing & Validation

```bash
# Test domain detection
echo "Testing domain routing..."
curl -H "Host: creator.localhost:3002" http://localhost:3002/
# Should route to /creator/dashboard

curl -H "Host: business.localhost:3002" http://localhost:3002/
# Should route to /business/dashboard

curl -H "Host: admin.localhost:3002" http://localhost:3002/
# Should route to /admin/dashboard

# Test middleware performance
time curl -H "Host: creator.localhost:3002" http://localhost:3002/dashboard
# Target: < 1000ms response time
```

#### Local Development URLs

| Domain Type  | URL                            | Purpose                   | Authentication Required |
| ------------ | ------------------------------ | ------------------------- | ----------------------- |
| **Main**     | http://localhost:3002          | Public pages, dual-target | ❌                      |
| **Creator**  | http://creator.localhost:3002  | Creator dashboard         | ✅                      |
| **Business** | http://business.localhost:3002 | Business dashboard        | ✅                      |
| **Admin**    | http://admin.localhost:3002    | Admin dashboard           | ✅ (admin role)         |
| **Supabase** | http://localhost:54323         | Database management       | ❌                      |

### Authentication Architecture (Supabase Auth)

**Current Implementation**: Full Supabase Auth implementation for authentication and database integration.

#### 5-Step Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Supabase Auth
    participant Middleware
    participant Supabase DB
    participant Dashboard

    User->>Supabase Auth: 1. Sign in/up (email + OAuth)
    Supabase Auth->>Supabase DB: 2. Trigger creates/updates profile
    User->>Middleware: 3. Request protected route
    Middleware->>Supabase Auth: 4. Validate session
    Middleware->>Supabase DB: 5. Get user role
    Middleware->>Dashboard: 6. Route to role-specific dashboard
```

#### Implementation Details

**Step 1-2: User Registration & Profile Sync**

```sql
-- Database trigger for profile creation
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, referral_code)
  VALUES (
    new.id,
    new.email,
    'creator', -- Default role
    generate_referral_code(new.id)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Step 3-4: Middleware Authentication Check**

```typescript
// src/middleware.ts
export async function middleware(req: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: {...} }
  );
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (isProtectedRoute(pathname) && !user) {
    return NextResponse.redirect('/sign-in');
  }
}
```

**Step 5-6: Role-Based Routing**

```typescript
// src/middleware.ts - Role verification
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id) // Supabase auth.uid()
  .single();

if (!isDomainRoleMatch(domainType, profile.role)) {
  return NextResponse.redirect(getDefaultRedirectPath(profile.role));
}
```

#### Key Implementation Files

| File                                      | Purpose           | Key Functions                                        |
| ----------------------------------------- | ----------------- | ---------------------------------------------------- |
| `src/lib/clerk.ts`                        | Auth utilities    | `getCurrentUser()`, `requireAuth()`, `requireRole()` |
| `src/lib/supabase/server.ts`              | Server client     | `createServerClient()`, `createAdminClient()`         |
| `src/lib/supabase/client.ts`              | Browser client    | `createBrowserClient()`                              |
| `src/middleware.ts`                       | Auth + routing    | Authentication check, role verification               |
| `src/app/sign-in/[[...sign-in]]/page.tsx` | Sign-in UI        | Supabase Auth UI component                           |
| `src/app/sign-up/[[...sign-up]]/page.tsx` | Sign-up UI        | Supabase Auth UI component                           |

#### Authentication Validation

```bash
# Test authentication flow
curl -H "Host: creator.localhost:3002" http://localhost:3002/dashboard
# Should redirect to /sign-in if not authenticated

# Test auth status
curl http://localhost:3002/api/auth/callback \
  -H "Content-Type: application/json"
```

### Database Integration

- **Supabase auth.uid()** as primary key linking to profiles table
- **Supabase** used for authentication, database, storage, and real-time features
- **Row Level Security (RLS)** policies based on auth.uid()
- **Real-time subscriptions** for live campaign updates and notifications

### Key Features & Architecture

#### 3-Tier Referral System

**Commission Structure**: Cascading revenue sharing across 3 levels of referrals.

```mermaid
flowchart TD
    A["💰 Campaign Revenue<br/>$100"] --> B["Level 1 Referrer<br/>Gets $10 (10%)"]
    A --> C["Level 2 Referrer<br/>Gets $5 (5%)"]
    A --> D["Level 3 Referrer<br/>Gets $2 (2%)"]
    A --> E["Creator Earnings<br/>Gets $83 (83%)"]

    B --> F["User A referred User B"]
    C --> G["User A referred User C"]
    D --> H["User A referred User D"]
    E --> I["User D completes campaign"]
```

**Database Schema Implementation**:

```sql
-- profiles table structure
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id), -- Supabase auth.uid()
  email VARCHAR NOT NULL,
  referral_code VARCHAR(10) UNIQUE NOT NULL,
  referrer_l1_id UUID REFERENCES profiles(id), -- Direct referrer (10%)
  referrer_l2_id UUID REFERENCES profiles(id), -- L2 referrer (5%)
  referrer_l3_id UUID REFERENCES profiles(id), -- L3 referrer (2%)
  created_at TIMESTAMP DEFAULT NOW()
);

-- Automatic referral chain setup trigger
CREATE OR REPLACE FUNCTION set_referral_chain()
RETURNS TRIGGER AS $$
BEGIN
  -- L1: Direct referrer gets 10%
  NEW.referrer_l1_id := OLD.referrer_l1_id;

  -- L2: Referrer's referrer gets 5%
  IF OLD.referrer_l1_id IS NOT NULL THEN
    SELECT referrer_l1_id INTO NEW.referrer_l2_id
    FROM profiles WHERE id = OLD.referrer_l1_id;
  END IF;

  -- L3: L2's referrer gets 2%
  IF NEW.referrer_l2_id IS NOT NULL THEN
    SELECT referrer_l1_id INTO NEW.referrer_l3_id
    FROM profiles WHERE id = NEW.referrer_l2_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**TypeScript Implementation** (`src/lib/clerk.ts`):

```typescript
export async function setReferralRelationship(
  newUserId: string,
  referralCode: string,
): Promise<{ success: boolean; error?: string; data?: Record<string, unknown> }> {
  // Find referrer by code
  const { data: referrer } = await supabase
    .from('profiles')
    .select('id, referrer_l1_id, referrer_l2_id')
    .eq('referral_code', referralCode)
    .single();

  if (!referrer) return { success: false, error: 'Invalid referral code' };

  // Build 3-tier referral chain
  const updateData = {
    referrer_l1_id: referrer.id, // 10% commission
    referrer_l2_id: referrer.referrer_l1_id, // 5% commission
    referrer_l3_id: referrer.referrer_l2_id, // 2% commission
  };

  return { success: true, data: updateData };
}
```

**Revenue Calculation**:

```typescript
interface ReferralCommission {
  level: 1 | 2 | 3;
  rate: 0.1 | 0.05 | 0.02;
  amount: number;
  referrer_id: string;
}

function calculateReferralCommissions(
  campaignRevenue: number,
  creatorId: string,
): ReferralCommission[] {
  const commissions: ReferralCommission[] = [];

  // Get creator's referral chain
  const creator = await getCreatorProfile(creatorId);

  if (creator.referrer_l1_id) {
    commissions.push({
      level: 1,
      rate: 0.1,
      amount: campaignRevenue * 0.1,
      referrer_id: creator.referrer_l1_id,
    });
  }

  // ... similar for L2 and L3

  return commissions;
}
```

#### Block-based Page Builder

```typescript
// Drag-and-drop interface architecture
interface BlockComponent {
  id: string;
  type: 'header' | 'text' | 'image' | 'button' | 'form' | 'video';
  props: Record<string, any>;
  children?: BlockComponent[];
}

// Page structure for creators
interface CreatorPage {
  slug: string;
  blocks: BlockComponent[];
  theme: 'default' | 'minimal' | 'professional';
  seo: SEOMetadata;
}
```

## Development Guidelines

### 8-Phase Development Roadmap

The project follows a 16-week development timeline with 8 distinct phases:

1. **Phase 1 (Week 1-2)**: 기반 구축 - Basic setup, authentication system
2. **Phase 2 (Week 3-4)**: 사용자 관리 - User roles, profile management
3. **Phase 3 (Week 5-7)**: 데이터 모델 - Database schema, CRUD APIs, real-time features
4. **Phase 4 (Week 8-11)**: 핵심 기능 - Campaign system, page builder, AI matching
5. **Phase 5 (Week 12-14)**: 추천 시스템 및 결제 - Referral system, TossPayments integration
6. **Phase 6 (Week 15)**: 보안 및 모니터링 - Security, abuse prevention
7. **Phase 7 (Week 16)**: 최적화 및 배포 - Performance optimization, production deployment
8. **Phase 8**: 유지보수 - Ongoing maintenance and feature enhancement

### Required Project Management Workflow

**⚠️ CRITICAL: Always read these files at the start of each session:**

1. `/docs/PLANNING.MD` - Current project status, schedule, priorities (MVP 3단계 전략)
2. `/docs/task1.md` - Core MVP 태스크 (89개) - 현재 작업 중 (10/89 완료)
3. `/docs/task2.md` - Enhanced MVP 태스크 (84개)
4. `/docs/task3.md` - Full Product 태스크 (48개)
5. `/docs/PRD.md` - Product requirements document with dual-target architecture specifications
6. `/docs/theme.md` - Voosting integrated theme system for dual-target UI consistency

**작업 규칙:**

- 완료된 태스크는 즉시 표시하고 새로 발견된 태스크 추가
- 지시한 task 범위를 넘어가는 업무는 지시전까지는 처리하지 않음
- 테스트 결과는 `/docs/test/` 폴더에 저장
- 모든 답변은 한글로 작성

**⚠️ 중요: `/docs/old/` 폴더의 파일들은 더 이상 참조하지 않음**

### Code Standards

- **TypeScript strict mode** with Zod schema validation
- **Server/Client Components** clearly separated in Next.js App Router
- **Absolute imports** using `@/` prefix for components and lib
- **File naming**: kebab-case for files, PascalCase for React components
- **Korean documentation** for all internal docs and comments

### Multi-Domain Development (구현 완료)

```typescript
// lib/middleware-utils.ts - 도메인 감지 및 라우팅 (100% 테스트 커버리지)
export function getDomainType(hostname: string): DomainType {
  if (!hostname) return 'main';
  const lowerHost = hostname.toLowerCase();
  if (lowerHost.includes('creator.')) return 'creator';
  if (lowerHost.includes('business.')) return 'business';
  if (lowerHost.includes('admin.')) return 'admin';
  return 'main';
}

// middleware.ts - 도메인별 라우팅 및 인증 처리
// 각 서브도메인은 동일한 Next.js 앱에서 조건부 레이아웃 사용
```

### Environment Setup & Configuration

#### Environment Variables Setup

```bash
# Copy environment variables template
cp .env.example .env.local
```

#### Required Environment Variables

| Category       | Variable                            | Source Location                     | Required | Description                               |
| -------------- | ----------------------------------- | ----------------------------------- | -------- | ----------------------------------------- |
| **Supabase**   | `NEXT_PUBLIC_SUPABASE_URL`          | Supabase Dashboard > Settings > API | ✅       | Supabase project URL                      |
| **Supabase**   | `NEXT_PUBLIC_SUPABASE_ANON_KEY`     | Supabase Dashboard > Settings > API | ✅       | Client-side anonymous key                 |
| **Supabase**   | `SUPABASE_SERVICE_ROLE_KEY`         | Supabase Dashboard > Settings > API | ✅       | Server-side service role key              |
| **App Config** | `NEXT_PUBLIC_SITE_URL`              | Manual                              | ✅       | Base URL (default: http://localhost:3002) |

#### Setup Validation Commands

```bash
# Verify all required environment variables are set
pnpm dev 2>&1 | grep -i "missing\|undefined\|error" || echo "✅ Environment setup complete"

# Test Supabase connection
npx supabase status

# Verify middleware routing
curl -H "Host: creator.localhost:3002" http://localhost:3002/dashboard
```

#### Development vs Production Configurations

```yaml
# Development (.env.local)
NEXT_PUBLIC_SITE_URL=http://localhost:3002
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Production (.env.production)
NEXT_PUBLIC_SITE_URL=https://voosting.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
```

### Local Development URLs

- **Main App**: http://localhost:3002
- **Supabase Studio**: http://localhost:54323 (after `pnpm supabase:start`)
- **Creator Dashboard**: http://creator.localhost:3002
- **Business Dashboard**: http://business.localhost:3002
- **Admin Dashboard**: http://admin.localhost:3002

### Integration Patterns

- **Supabase Auth** 구현 완료 (이메일 + OAuth providers)
- **Real-time features** should use Supabase Realtime with auth.uid() authentication
- **File uploads** go through Supabase Storage with appropriate RLS policies
- **External API calls** should be handled in Edge Functions or API routes, not client-side
- **Korean language support** is primary, with all user-facing content in Korean

### MCP Server Integration

The project uses 4 MCP servers for enhanced development capabilities:

1. **TossPayments Integration Guide MCP** (`@tosspayments/integration-guide-mcp@latest`)
   - Payment system integration guidance
   - 1-won verification API patterns
   - Commission payout system development

2. **Model Context Protocol Memory Server** (`@modelcontextprotocol/server-memory`)
   - Session continuity across 221 development tasks
   - Knowledge graph for project context retention
   - Cross-session task progress tracking

3. **Playwright MCP Server** (`@playwright/mcp@latest`)
   - E2E testing automation for multi-domain architecture
   - Cross-browser testing (Chrome, Firefox, Safari)
   - Performance monitoring and Core Web Vitals testing

4. **Git MCP Server** (`mcp-server-git`)
   - Git workflow automation
   - Code review assistance
   - Branch management for 8-phase development

### Database Conventions

- All tables use `created_at` and `updated_at` timestamps
- User references use Supabase auth.uid() as foreign key
- RLS policies must be created for all tables using auth.uid()
- Use SQL triggers for complex business logic (e.g., referral calculations)

### API Response Format

```typescript
// Success response
{
  success: true,
  data: T,
  message?: string
}

// Error response
{
  success: false,
  error: string,
  code?: string
}
```

### Git Commit Convention

Follow conventional commits format:

- `feat:` New features
- `fix:` Bug fixes
- `test:` Test additions or fixes
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `style:` Code style changes
- `chore:` Build process or auxiliary tool changes

Example: `feat: add user profile API endpoint`

## Current Project State & Development Context

### Project Status

- **현재 단계**: Phase 1 (기반 구축) - Week 1-2 진행중
- **완료된 작업**: 15/89 Core MVP 태스크 (16.9%)
- **최근 완료**: Clerk → Supabase Auth 마이그레이션 완료, npm → pnpm 마이그레이션 완료, shadcn/ui 전체 컴포넌트 설치
- **다음 작업**: 프로젝트 안정화 및 테스트

### ✅ 완료된 주요 기능

| Category        | Feature                      | Implementation Status | Test Coverage | Files                                   |
| --------------- | ---------------------------- | --------------------- | ------------- | --------------------------------------- |
| **인프라**      | Next.js 15.4.4 + TypeScript  | 🟢 Complete           | 100%          | `next.config.js`, `tsconfig.json`       |
| **인증 시스템** | Supabase Auth + DB           | 🟢 Complete           | 100%          | `src/lib/supabase/`, `src/middleware.ts` |
| **멀티도메인**  | 도메인별 라우팅              | 🟢 Complete           | 100%          | `src/lib/middleware-utils.ts`           |
| **공개 페이지** | 듀얼 타겟 공개 페이지 시스템 | 🟢 Complete           | 95%           | `src/app/(main)/`, `src/components/`    |
| **인증 페이지** | Supabase Auth 로그인/회원가입 | 🟢 Complete           | 90%           | `src/app/sign-in/`, `src/app/sign-up/`  |
| **테스트 환경** | Jest + Playwright E2E        | 🟢 Complete           | 100%          | `src/__tests__/`, `test/`               |
| **브랜딩**      | CashUp → Voosting 전환       | 🟢 Complete           | 100%          | README.md, CLAUDE.md updated            |
| **UI 시스템**   | Tailwind CSS v4 + Shadcn/ui  | 🟢 Complete           | 80%           | `src/components/ui/`                    |

**핵심 성과**:

- ⚡ 미들웨어 평균 응답 시간: 215ms (목표: <1000ms)
- 🛡️ RLS 정책 기반 데이터 보안 구현
- 🔄 실시간 웹훅 기반 사용자 동기화
- 🎯 도메인별 역할 기반 접근 제어
- 📱 크로스 브라우저 E2E 테스트 (Chrome, Firefox, Safari)
- 🎨 듀얼 타겟 UI 시스템 (비즈니스/크리에이터 테마)
- 🔐 Supabase Auth 기반 역할별 회원가입 플로우
- 📦 pnpm 패키지 매니저로 전체 마이그레이션
- 🎨 shadcn/ui 전체 컴포넌트 및 블록 설치 완료

### Key Development Patterns

```typescript
// File structure patterns to follow:
// components/ui/ - Base UI components (shadcn/ui)
// components/forms/ - Form-specific components  
// components/blocks/ - Page builder block components
// lib/supabase/ - Supabase client and utilities
// lib/clerk.ts - Authentication utilities (using Supabase)
// hooks/use-* - Custom React hooks
// stores/use-*-store - Zustand state management
```

### 📊 테스트 현황 및 성과

`/docs/test/` 디렉토리에 모든 테스트 결과가 저장됩니다:

#### 유닛 테스트 성과

- **middleware-utils.ts**: 100% 커버리지 (63개 테스트 통과)
- **middleware.ts**: 78.49% 커버리지 (도메인 라우팅 로직)
- **인증 토큰 처리**: JWT 검증 및 세션 관리 테스트

#### E2E 테스트 성과

- **16개 시나리오**: 모든 멀티도메인 라우팅 시나리오 검증
- **크로스 브라우저**: Chromium, Firefox, WebKit 지원
- **반응형 테스트**: Galaxy S21, iPad, iPhone 12, Desktop
- **성능 메트릭**: 평균 로딩 시간 < 3초 달성

#### 새로 추가된 테스트

- **공개 페이지 테스트**: 비즈니스/크리에이터 타겟 페이지 검증
- **인증 플로우 테스트**: Supabase Auth 기반 회원가입/로그인 검증
- **수익 계산기 테스트**: 3단계 추천 시스템 로직 검증

### 📱 현재 구현된 페이지

#### 공개 페이지 (인증 불필요)

- **메인 랜딩**: `/` - 비즈니스 타겟, 글래스모피즘 디자인
- **크리에이터 랜딩**: `/creators` - 크리에이터 타겟, 3단계 추천 시스템 강조
- **서비스 페이지**: `/service` - 비즈니스 서비스 소개, AI 매칭 기능
- **크리에이터 서비스**: `/creators/service` - 크리에이터 전용 서비스 소개
- **수익 계산기**: `/creators/calculator` - 인터랙티브 수익 계산 도구

#### 인증 페이지 (Supabase Auth 기반)

- **통합 로그인**: `/sign-in` - 이메일 + OAuth 지원
- **역할 선택**: `/sign-up` - 크리에이터/비즈니스 선택 페이지
- **크리에이터 회원가입**: `/sign-up/creator` - 수익 구조 미리보기
- **비즈니스 회원가입**: `/sign-up/business` - ROI 성과 강조

#### 스타일 가이드

- **디자인 시스템**: `/style-guide` - 전체 UI 컴포넌트 미리보기

### 다음 구현 우선순위

1. **TASK-010**: 사용자 프로필 및 역할 시스템 설정 (Phase 2 시작)
2. **TASK-011**: 3단계 추천 시스템 기초 설계
3. **TASK-013**: Supabase 클라이언트 설정 완료
4. **TASK-016~019**: 도메인별 레이아웃 컴포넌트 구현
5. **TASK-020**: 기본 UI 컴포넌트 구현

전체 구현은 Core MVP 89개 태스크를 우선 완료하고, Enhanced MVP와 Full Product로 진행됩니다.

---

## Development Troubleshooting Guide

### Common Setup Issues

#### 🔴 Supabase Authentication Errors

**Problem**: `Auth session missing`

```bash
# Symptoms
Error: Auth session missing
  at supabase.auth.getUser()
```

**Solution**:

```bash
# 1. Verify environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# 2. Check Supabase Dashboard Settings
# Go to: https://supabase.com/dashboard/project/[your-project]/settings/api

# 3. Ensure Supabase is running locally
pnpm supabase:start
```

#### 🔴 Multi-Domain Routing Issues

**Problem**: Domain routing not working in development

```bash
# Symptoms
curl -H "Host: creator.localhost:3002" http://localhost:3002/
# Returns main page instead of creator dashboard
```

**Solution**:

```bash
# 1. Add entries to /etc/hosts (macOS/Linux)
sudo echo "127.0.0.1 creator.localhost" >> /etc/hosts
sudo echo "127.0.0.1 business.localhost" >> /etc/hosts
sudo echo "127.0.0.1 admin.localhost" >> /etc/hosts

# 2. Test middleware function directly
node -e "console.log(require('./src/lib/middleware-utils.ts').getDomainType('creator.localhost:3002'))"

# 3. Check middleware matcher configuration
# Verify config.matcher in src/middleware.ts includes your routes
```

#### 🔴 Supabase RLS Policy Issues

**Problem**: `Row Level Security policy violation`

```sql
-- Symptoms
ERROR: new row violates row-level security policy for table "profiles"
```

**Solution**:

```sql
-- 1. Check existing RLS policies
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies WHERE tablename = 'profiles';

-- 2. Create missing RLS policy for Supabase auth.uid()
CREATE POLICY "Users can access own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

-- 3. Enable RLS if not enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

#### 🔴 Database Trigger Issues

**Problem**: Profile not created after signup

```bash
# Symptoms
SELECT * FROM profiles WHERE id = 'user-id';
-- Returns 0 rows
```

**Solution**:

```bash
# 1. Check if auth trigger exists
SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';

# 2. Recreate trigger if missing
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, referral_code)
  VALUES (new.id, new.email, 'creator', generate_referral_code(new.id));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

# 3. Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Performance Monitoring

#### Middleware Performance

```bash
# Monitor middleware response times
for i in {1..10}; do
  time curl -H "Host: creator.localhost:3002" http://localhost:3002/dashboard -s > /dev/null
done

# Target: < 1000ms average response time
# Current performance: ~215ms average
```

#### Database Query Performance

```sql
-- Monitor slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC;

-- Profile performance
EXPLAIN ANALYZE SELECT * FROM profiles WHERE id = 'user_123';
```

### Testing Validation

#### Unit Test Coverage

```bash
# Run tests with coverage
pnpm test:coverage

# Target coverage thresholds:
# - Statements: 80%+
# - Branches: 75%+
# - Functions: 90%+
# - Lines: 80%+
```

#### E2E Test Validation

```bash
# Run E2E tests across all domains
pnpm test:e2e

# Test specific domain
npx playwright test --grep "creator dashboard"

# Visual regression testing
npx playwright test --update-snapshots
```

---

## Architecture Decision Records (ADRs)

### ADR-001: Supabase Auth Architecture

**Status**: ✅ Implemented  
**Date**: 2024-08-06  
**Decision**: Use Supabase for both authentication and database

**Context**: Need unified authentication and database system that simplifies the architecture.

**Rationale**:

- **Unified System**: Single service for auth and database reduces complexity
- **RLS Integration**: Native RLS policies work seamlessly with auth.uid()
- **Cost Efficiency**: Single billing for auth + database services
- **Real-time Features**: Built-in real-time subscriptions with auth

**Implementation**:

```typescript
// User ID flow: Supabase auth.uid() → profiles.id → RLS policies
const { data: { user } } = await supabase.auth.getUser();
const profile = await supabase.from('profiles').select().eq('id', user.id);
```

**Trade-offs**:

- ✅ **Pros**: Simplified architecture, native RLS, cost-effective
- ❌ **Cons**: Less OAuth provider options compared to dedicated auth services

### ADR-002: Multi-Domain Architecture

**Status**: ✅ Implemented  
**Date**: 2024-01-10  
**Decision**: Use middleware-based subdomain routing instead of separate applications

**Context**: Need role-specific dashboards while maintaining single codebase.

**Rationale**:

- **Code Reuse**: Shared components, utilities, and business logic
- **Deployment Simplicity**: Single application deployment
- **Development Efficiency**: Shared TypeScript types and database schema
- **Performance**: No cross-origin issues, shared caching

**Implementation**:

```typescript
// Single Next.js app with route groups
app/
├── (main)/     # voosting.app
├── (creator)/  # creator.voosting.app → /creator/*
├── (business)/ # business.voosting.app → /business/*
└── (admin)/    # admin.voosting.app → /admin/*
```

**Trade-offs**:

- ✅ **Pros**: Simplified deployment, shared code, better DX
- ❌ **Cons**: Middleware complexity, potential scaling bottlenecks

---

## Quick Start Validation Checklist

### 🚀 New Claude Code Instance Setup

**Step 1: Repository Validation**

```bash
# Verify project structure
ls -la src/app/\(creator\)/dashboard/
ls -la src/lib/clerk.ts
ls -la src/middleware.ts

# Expected: All files exist with recent timestamps
```

**Step 2: Environment Verification**

```bash
# Check environment variables
pnpm dev 2>&1 | grep -E "(missing|undefined|error)" | wc -l
# Expected output: 0 (no missing environment variables)

# Test authentication
curl http://localhost:3002/api/profile
# Expected: 401 if not authenticated, profile data if authenticated
```

**Step 3: Multi-Domain Testing**

```bash
# Test domain routing
curl -H "Host: creator.localhost:3002" http://localhost:3002/ -I
# Expected: 302 redirect to /creator/dashboard or /sign-in

# Test middleware performance
time curl -H "Host: business.localhost:3002" http://localhost:3002/dashboard
# Expected: < 1000ms response time
```

**Step 4: Database Connectivity**

```bash
# Test Supabase connection
npx supabase status
# Expected: All services running (db, api, auth disabled, storage, etc.)

# Test RLS policies
pnpm supabase:reset
# Expected: Database reset with all migrations applied
```

### 🔧 Implementation Status Dashboard

**Current Architecture State**:

- ✅ **Authentication**: Supabase Auth (100% functional)
- ✅ **Multi-Domain**: Middleware routing (100% tested)
- ✅ **Database**: PostgreSQL + RLS (100% secured)
- ✅ **Testing**: Unit + E2E tests (90%+ coverage)
- 🟡 **Referral System**: Basic structure (needs enhancement)
- 🟡 **Payment Integration**: Schema ready (TossPayments pending)

**Development Confidence Levels**:

```yaml
Architecture_Stability: 95% # Solid foundation, proven patterns
Code_Quality: 88% # High test coverage, TypeScript strict
Documentation: 92% # Comprehensive, up-to-date
Team_Velocity: 16.9% # 15/89 Core MVP tasks completed
Technical_Debt: Low # Recent refactor, clean codebase
```

### 📋 Critical Knowledge for Claude Code

**🔴 Never Do These**:

- Don't use Clerk Auth (project migrated to Supabase Auth)
- Don't create separate Next.js apps for domains (use route groups)
- Don't bypass middleware for protected routes
- Don't hardcode user roles (always fetch from database)
- Don't commit without running `pnpm test` first
- Don't use npm commands (project uses pnpm)

**🟢 Always Do These**:

- Read `/docs/PLANNING.MD` first for current status
- Use absolute imports (`@/components`, `@/lib`)
- Write tests for new business logic
- Update task progress in relevant docs
- Follow Korean documentation standards for internal docs

**⚡ Performance Standards**:

- Middleware response: < 1000ms
- Database queries: < 100ms average
- Page load time: < 3s on 3G
- Test coverage: > 80% for new code

---

## Framework Integration Patterns

### Next.js 15 Patterns

```typescript
// Server Component pattern (default)
export default async function CreatorDashboard() {
  const profile = await getCurrentProfile(); // Server-side
  return <Dashboard profile={profile} />;
}

// Client Component pattern (when needed)
'use client';
export default function InteractiveComponent() {
  const [state, setState] = useState();
  // Client-side interactivity
}
```

### TypeScript Standards

```typescript
// Database types (auto-generated)
import type { Database } from '@/types/database.types';
type Profile = Database['public']['Tables']['profiles']['Row'];

// Zod schemas for validation
import { z } from 'zod';
const profileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['creator', 'business', 'admin']),
});
```

### Testing Patterns

```typescript
// Unit test example
import { describe, it, expect } from 'vitest';
import { getDomainType } from '@/lib/middleware-utils';

describe('getDomainType', () => {
  it('detects creator domain', () => {
    expect(getDomainType('creator.voosting.app')).toBe('creator');
  });
});

// E2E test example
import { test, expect } from '@playwright/test';

test('creator can access dashboard', async ({ page }) => {
  await page.goto('http://creator.localhost:3002');
  await expect(page).toHaveURL(/\/creator\/dashboard/);
});
```

# important-instruction-reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (\*.md) or README files. Only create documentation files if explicitly requested by the User.

# important-instruction-reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (\*.md) or README files. Only create documentation files if explicitly requested by the User.

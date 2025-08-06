# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Voosting (부스팅)** is an AI-powered creator marketing platform that connects advertisers with creators through intelligent matching for performance-based marketing campaigns. The platform features a dual-target ecosystem where businesses find marketing creators and creators monetize their influence.

## Authentication Migration Notice

**⚠️ IMPORTANT: This project has migrated from Clerk to Supabase Auth**

The authentication system has been fully migrated to use Supabase's native authentication. Key changes:

- All Clerk references have been replaced with Supabase Auth
- User authentication flows through Supabase Auth UI and APIs
- Database triggers automatically create user profiles
- RLS policies use Supabase Auth user IDs

For migration details, see: `/docs/migration/phase8-completion-report.md`

## High-Level Architecture

### Multi-Domain Architecture

The platform uses subdomain-based routing with middleware-driven domain detection:

- **Main Domain** (`voosting.app`): Public pages with dual-target content
- **Creator Subdomain** (`creator.voosting.app`): Creator dashboard and tools
- **Business Subdomain** (`business.voosting.app`): Business campaign management
- **Admin Subdomain** (`admin.voosting.app`): Platform administration

Middleware automatically rewrites URLs based on the subdomain:

- `creator.domain.com/` → `/creator/dashboard`
- `business.domain.com/` → `/business/dashboard`
- `admin.domain.com/` → `/admin/dashboard`

### Supabase Full-Stack Integration

The project uses Supabase for:

- **Authentication**: Email/password and OAuth providers
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Real-time**: Live updates for campaigns and notifications
- **Storage**: File uploads with RLS policies
- **Database Triggers**: Automatic profile creation and referral chain management

### 3-Tier Referral System

Commission structure:

- **Level 1** (Direct referrer): 10%
- **Level 2** (Referrer's referrer): 5%
- **Level 3** (L2's referrer): 2%

Database triggers automatically calculate and maintain the referral chain.

## Tech Stack

- **Frontend**: Next.js 15.4.4, React 19, TypeScript 5.4
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **State Management**: Zustand, React Query
- **Testing**: Jest (unit tests), Playwright (E2E tests)
- **External APIs**: Google Gemini AI, Toss Payments
- **Development**: Turbopack, MCP servers for enhanced tooling

## Essential Commands

### Development

```bash
npm run dev              # Start dev server (port 3002)
npm run build            # Build for production
npm run lint             # Run ESLint
npm run type-check       # TypeScript validation
```

### Testing

```bash
npm run test             # Run unit tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run test:e2e         # Playwright E2E tests
npx playwright test --ui # Playwright UI mode
```

### Database (Supabase)

```bash
npm run supabase:start   # Start local Supabase
npm run supabase:stop    # Stop Supabase
npm run supabase:reset   # Reset database
npm run supabase:types   # Generate TypeScript types
npx supabase migration new <name>  # Create migration
```

### Test Data Management

```bash
npm run test:accounts:create  # Create test accounts
npm run test:data:create      # Create test data
npm run test:accounts:reset   # Reset test data
npm run test:accounts:verify  # Verify accounts
```

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── (public)/        # Public pages (dual-target)
│   ├── admin/           # Admin dashboard routes
│   ├── business/        # Business dashboard routes
│   ├── creator/         # Creator dashboard routes
│   ├── api/             # API endpoints
│   └── auth/            # Authentication pages
├── components/          # React components
│   ├── ui/              # shadcn/ui components
│   ├── forms/           # Form components
│   └── blocks/          # Page builder blocks
├── lib/                 # Core utilities
│   ├── supabase/        # Supabase clients
│   └── middleware-utils.ts  # Domain routing
├── hooks/               # React hooks
│   └── use-supabase.ts  # Main auth hook
└── types/               # TypeScript definitions
```

## Key Implementation Details

### Authentication Flow

1. User signs up/in via Supabase Auth
2. Database trigger creates profile automatically
3. Middleware validates session and checks role
4. User is routed to appropriate dashboard based on role

### Environment Variables

Required variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Server-side key
- `NEXT_PUBLIC_SITE_URL` - Application URL

### Local Development URLs

- Main app: http://localhost:3002
- Creator dashboard: http://creator.localhost:3002
- Business dashboard: http://business.localhost:3002
- Admin dashboard: http://admin.localhost:3002
- Supabase Studio: http://localhost:54323

Note: Add subdomain entries to `/etc/hosts` for local development:

```
127.0.0.1 creator.localhost
127.0.0.1 business.localhost
127.0.0.1 admin.localhost
```

## Current Development Status

- **Authentication System**: ✅ Migrated to Supabase Auth
- **Multi-domain Routing**: ✅ Fully implemented
- **Database & RLS**: ✅ Configured with triggers
- **UI Components**: ✅ Tailwind v4 + shadcn/ui
- **Referral System**: ✅ Implemented with 3-tier commission structure
- **Test Environment**: ✅ Complete test accounts and data setup
- **Payment Integration**: 🟡 Schema ready, integration pending

## Test Environment

### Test Accounts

The project includes a comprehensive test environment with pre-configured accounts:

- **6 Test Accounts**: 3 creators, 2 businesses, 1 admin
- **Referral Chain**: Complete 3-tier referral system testing
- **Test Data**: Sample campaigns, applications, and payments
- **Documentation**: `/docs/scripts/test-accounts.md`

### Test Account Management

```bash
npm run test:accounts:create  # Create all test accounts
npm run test:data:create      # Generate sample data
npm run test:accounts:verify  # Verify system integrity
npm run test:accounts:reset   # Clean up test data
```

### Test Account Credentials

All test accounts use the password: `TestPassword123!`

- `creator1@test.com` - Top-level creator (CRT001)
- `creator2@test.com` - L1 referral (CRT002)
- `creator3@test.com` - L2 referral (CRT003)
- `business1@test.com` - Business account (BIZ001)
- `business2@test.com` - Business account (BIZ002)
- `admin@test.com` - Admin account (ADM001)

## Code Standards

- TypeScript strict mode enabled
- Server/Client components clearly separated
- Absolute imports using `@/` prefix
- File naming: kebab-case for files, PascalCase for React components
- Korean language for user-facing content and internal documentation

## Common Tasks

### Adding a New Page

1. Create the page in appropriate route group
2. Add authentication check if needed
3. Apply theme using `data-theme` attribute
4. Use shadcn/ui components for consistency

### Working with Database

1. Always use typed Supabase client
2. Handle errors with proper user feedback
3. Use RLS policies for security
4. Test queries in Supabase Studio first

### Implementing Features

1. Check existing patterns in codebase
2. Use `useSupabase()` hook for auth state
3. Follow the established API response format
4. Write tests for business logic

## Troubleshooting

### Auth Issues

- Check Supabase environment variables
- Verify RLS policies are correct
- Ensure database triggers exist

### Routing Issues

- Verify middleware is running
- Check subdomain configuration
- Test with curl commands

### Database Issues

- Check RLS policies
- Verify user has correct role
- Test queries in Supabase Studio

For detailed migration information and architecture decisions, refer to the documentation in `/docs/migration/`.

## Tailwind CSS v4 설정 가이드

**⚠️ 중요: 이 프로젝트는 Tailwind CSS v4를 사용합니다**

### 패키지 버전 고정

다음 패키지 버전은 절대 변경하지 마세요:

```json
{
  "tailwind-merge": "^3.3.1",
  "tailwindcss": "4.0.6"
}
```

### v4 설정 방법

#### 1. PostCSS 설정 (postcss.config.mjs)

```javascript
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

#### 2. CSS 설정 (globals.css)

```css
@import "tailwindcss";

/* @theme 블록으로 테마 설정 */
@theme {
  --color-primary-50: #f0f9ff;
  --color-primary-500: #3b82f6;
  --color-primary-900: #1e3a8a;
  
  --font-display: "Pretendard", sans-serif;
  --breakpoint-3xl: 1920px;
}
```

#### 3. 주요 변경사항

- `tailwind.config.js` 파일이 더 이상 필요하지 않음
- `@tailwind base; @tailwind components; @tailwind utilities;` 대신 `@import "tailwindcss";` 사용
- `autoprefixer`와 `postcss-import`가 내장되어 별도 설치 불필요
- CSS 내에서 `@theme` 블록으로 직접 테마 설정 가능

#### 4. 마이그레이션 시 주의사항

- `ring` 유틸리티의 기본 색상이 `blue-500`에서 `currentColor`로 변경
- `container` 유틸리티의 `center`와 `padding` 옵션 제거
- prefix 설정 방식 변경 (`tw:` 형태)

#### 5. 자동 마이그레이션

```bash
npx @tailwindcss/upgrade
```

### shadcn/ui와의 호환성

shadcn/ui 컴포넌트는 Tailwind CSS v4와 완전 호환됩니다. 기존 컴포넌트 사용법은 동일하게 유지됩니다.

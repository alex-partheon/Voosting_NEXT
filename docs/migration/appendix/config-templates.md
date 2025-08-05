# 설정 파일 템플릿 모음

## 목차
1. [환경 변수 설정](#환경-변수-설정)
2. [Next.js 설정](#nextjs-설정)
3. [TypeScript 설정](#typescript-설정)
4. [테스트 설정](#테스트-설정)
5. [배포 설정](#배포-설정)

---

## 환경 변수 설정

### 1. 개발 환경 (.env.local)

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# 애플리케이션 설정
NEXT_PUBLIC_SITE_URL=http://localhost:3002
NEXT_PUBLIC_APP_NAME=Voosting
NEXT_PUBLIC_APP_VERSION=1.0.0

# OAuth 제공자 설정 (선택사항)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_GITHUB_CLIENT_ID=your-github-client-id

# 보안 설정
NEXTAUTH_SECRET=your-nextauth-secret-here
JWT_SECRET=your-jwt-secret-here

# 메일 서비스 설정 (선택사항)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# 개발 도구 설정
DEBUG_MODE=true
LOG_LEVEL=debug
ENABLE_QUERY_LOGGING=true

# 성능 모니터링
ENABLE_PERFORMANCE_MONITORING=true
PERFORMANCE_SAMPLE_RATE=1.0

# 기능 플래그
FEATURE_EMAIL_VERIFICATION=true
FEATURE_SOCIAL_LOGIN=true
FEATURE_PASSWORD_RESET=true
```

### 2. 프로덕션 환경 (.env.production)

```bash
# Supabase 설정 (프로덕션)
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-role-key-here

# 애플리케이션 설정
NEXT_PUBLIC_SITE_URL=https://voosting.app
NEXT_PUBLIC_APP_NAME=Voosting
NEXT_PUBLIC_APP_VERSION=1.0.0

# OAuth 제공자 설정
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-prod-google-client-id
NEXT_PUBLIC_GITHUB_CLIENT_ID=your-prod-github-client-id

# 보안 설정 (강화)
NEXTAUTH_SECRET=your-strong-production-secret-here
JWT_SECRET=your-strong-jwt-secret-here
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict

# 메일 서비스 설정
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key

# 프로덕션 최적화
DEBUG_MODE=false
LOG_LEVEL=warn
ENABLE_QUERY_LOGGING=false

# 성능 모니터링
ENABLE_PERFORMANCE_MONITORING=true
PERFORMANCE_SAMPLE_RATE=0.1

# 기능 플래그
FEATURE_EMAIL_VERIFICATION=true
FEATURE_SOCIAL_LOGIN=true
FEATURE_PASSWORD_RESET=true

# CDN 설정
NEXT_PUBLIC_CDN_URL=https://cdn.voosting.app

# 분석 도구
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn
```

### 3. 테스트 환경 (.env.test)

```bash
# Supabase 테스트 설정
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key
SUPABASE_SERVICE_ROLE_KEY=test-service-role-key

# 테스트 설정
NEXT_PUBLIC_SITE_URL=http://localhost:3002
NODE_ENV=test

# 테스트 데이터베이스
TEST_DATABASE_URL=postgresql://postgres:password@localhost:54322/test_db

# 모킹 설정
MOCK_EXTERNAL_APIS=true
SKIP_EMAIL_VERIFICATION=true

# 테스트 성능 설정
TEST_TIMEOUT=30000
JEST_TIMEOUT=10000
```

---

## Next.js 설정

### 1. next.config.js (완전한 설정)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 실험적 기능
  experimental: {
    // 서버 액션 활성화
    serverActions: true,
    // 서버 컴포넌트 외부 패키지 지원
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
    // 앱 디렉토리 활성화 (Next.js 13+)
    appDir: true,
    // 이미지 최적화
    optimizeCss: true,
    // 부분 사전 렌더링
    ppr: false
  },

  // 이미지 최적화 설정
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      }
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // 환경 변수 설정
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // 공개 런타임 설정
  publicRuntimeConfig: {
    siteName: 'Voosting',
    version: process.env.NEXT_PUBLIC_APP_VERSION,
  },

  // 서버 전용 런타임 설정
  serverRuntimeConfig: {
    secret: process.env.JWT_SECRET,
  },

  // 리다이렉트 설정
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/auth/signin',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/auth/signup',
        permanent: true,
      },
      {
        source: '/dashboard',
        destination: '/creator/dashboard',
        permanent: false,
      }
    ];
  },

  // 리라이트 설정 (API 프록시)
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
      // Supabase Edge Functions 프록시
      {
        source: '/api/edge/:path*',
        destination: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/:path*`,
      }
    ];
  },

  // 헤더 설정
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production' 
              ? 'https://voosting.app' 
              : '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          }
        ],
      }
    ];
  },

  // Webpack 설정 커스터마이징
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 개발 환경에서만 소스맵 생성
    if (dev) {
      config.devtool = 'eval-source-map';
    }

    // 번들 분석을 위한 설정
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      );
    }

    // 외부 라이브러리 최적화
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };

    return config;
  },

  // 컴파일러 최적화
  compiler: {
    // styled-components 지원
    styledComponents: true,
    // React 컴파일러 최적화
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 성능 최적화
  poweredByHeader: false,
  compress: true,
  generateEtags: true,

  // 국제화 설정
  i18n: {
    locales: ['ko', 'en'],
    defaultLocale: 'ko',
    localeDetection: true,
  },

  // 보안 헤더
  httpAgentOptions: {
    keepAlive: true,
  },

  // 개발 서버 설정
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },

  // 출력 설정
  output: 'standalone',
  distDir: '.next',
  cleanDistDir: true,
};

const path = require('path');

// 개발 환경에서 추가 설정
if (process.env.NODE_ENV === 'development') {
  nextConfig.experimental.forceSwcTransforms = true;
}

// 프로덕션 환경에서 추가 최적화
if (process.env.NODE_ENV === 'production') {
  nextConfig.compiler.removeConsole = {
    exclude: ['error', 'warn'],
  };
}

module.exports = nextConfig;
```

### 2. middleware.ts (완전한 미들웨어)

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/database.types';

// 설정 상수
const CONFIG = {
  // 보호된 경로 패턴
  PROTECTED_PATTERNS: [
    '/creator/dashboard',
    '/business/dashboard',
    '/admin/dashboard',
    '/api/protected',
    '/profile'
  ],
  
  // 인증된 사용자만 접근 불가 (로그인 페이지 등)
  AUTH_ONLY_PATTERNS: [
    '/auth/signin',
    '/auth/signup'
  ],
  
  // 역할 기반 경로 매핑
  ROLE_PATHS: {
    creator: '/creator',
    business: '/business', 
    admin: '/admin'
  } as const,
  
  // 기본 리다이렉션 경로
  DEFAULT_REDIRECTS: {
    creator: '/creator/dashboard',
    business: '/business/dashboard',
    admin: '/admin/dashboard'
  } as const,
  
  // 성능 설정
  CACHE_TTL: 5 * 60 * 1000, // 5분
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1초
};

// 도메인 타입 정의
type DomainType = 'main' | 'creator' | 'business' | 'admin';
type UserRole = keyof typeof CONFIG.DEFAULT_REDIRECTS;

// 유틸리티 함수들
const utils = {
  // 도메인 타입 감지
  getDomainType(hostname: string): DomainType {
    if (!hostname) return 'main';
    
    const lowerHost = hostname.toLowerCase();
    
    if (lowerHost.includes('creator.')) return 'creator';
    if (lowerHost.includes('business.')) return 'business';
    if (lowerHost.includes('admin.')) return 'admin';
    
    return 'main';
  },

  // 보호된 경로 확인
  isProtectedRoute(pathname: string): boolean {
    return CONFIG.PROTECTED_PATTERNS.some(pattern => 
      pathname.startsWith(pattern) || 
      pathname.match(new RegExp(pattern.replace('*', '.*')))
    );
  },

  // 인증 전용 경로 확인
  isAuthOnlyRoute(pathname: string): boolean {
    return CONFIG.AUTH_ONLY_PATTERNS.some(pattern => 
      pathname.startsWith(pattern)
    );
  },

  // 역할과 도메인 매칭 확인
  isDomainRoleMatch(domainType: DomainType, userRole: UserRole): boolean {
    if (domainType === 'main') return true;
    return domainType === userRole;
  },

  // URL 재작성
  rewriteUrlForDomain(pathname: string, domainType: DomainType): string {
    if (domainType === 'main') return pathname;

    const prefix = CONFIG.ROLE_PATHS[domainType as UserRole];
    if (!prefix) return pathname;

    if (pathname === '/' || pathname === '/dashboard') {
      return `${prefix}/dashboard`;
    }

    return `${prefix}${pathname}`;
  },

  // 에러 응답 생성
  createErrorResponse(error: string, request: NextRequest): NextResponse {
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('error', error);
    return NextResponse.redirect(url);
  },

  // 로깅 (개발 환경에서만)
  log(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Middleware] ${message}`, data || '');
    }
  }
};

// 세션 캐시 (메모리 기반)
class SessionCache {
  private cache = new Map<string, { session: any; timestamp: number }>();

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = (Date.now() - entry.timestamp) > CONFIG.CACHE_TTL;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.session;
  }

  set(key: string, session: any): void {
    this.cache.set(key, {
      session,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

const sessionCache = new SessionCache();

// 메인 미들웨어 함수
export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;

  // 기본 응답 생성
  const response = NextResponse.next();

  // 정적 파일과 API 라우트 제외
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return response;
  }

  try {
    utils.log('Processing request', { hostname, pathname });

    // Supabase 클라이언트 생성
    const supabase = createMiddlewareClient<Database>({ 
      req: request, 
      res: response 
    });

    // 도메인 타입 감지
    const domainType = utils.getDomainType(hostname);
    utils.log('Domain type detected', domainType);

    // URL 재작성 (서브도메인 → 경로 기반)
    if (domainType !== 'main') {
      const rewrittenPath = utils.rewriteUrlForDomain(pathname, domainType);
      
      if (rewrittenPath !== pathname) {
        utils.log('Rewriting URL', { from: pathname, to: rewrittenPath });
        const rewriteUrl = new URL(rewrittenPath, request.url);
        // 쿼리 파라미터 유지
        rewriteUrl.search = request.nextUrl.search;
        return NextResponse.rewrite(rewriteUrl);
      }
    }

    // 세션 캐시 확인
    const cacheKey = `session_${request.headers.get('user-agent')}`;
    let cachedSession = sessionCache.get(cacheKey);

    // 세션 확인 (캐시된 세션이 없는 경우만)
    let session = cachedSession;
    if (!session) {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        utils.log('Session error', error.message);
        if (utils.isProtectedRoute(pathname)) {
          return utils.createErrorResponse('session_error', request);
        }
        return response;
      }

      session = currentSession;
      
      // 세션 캐싱 (세션이 있는 경우만)
      if (session) {
        sessionCache.set(cacheKey, session);
      }
    }

    // 인증된 사용자가 인증 페이지 접근 시 리다이렉션
    if (session && utils.isAuthOnlyRoute(pathname)) {
      const profile = await getUserProfile(supabase, session.user.id);
      const redirectPath = profile ? 
        CONFIG.DEFAULT_REDIRECTS[profile.role as UserRole] || '/' : 
        '/auth/complete-profile';
      
      utils.log('Redirecting authenticated user', { from: pathname, to: redirectPath });
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // 보호된 경로가 아니면 바로 통과
    if (!utils.isProtectedRoute(pathname)) {
      const duration = Date.now() - startTime;
      utils.log('Request completed (unprotected)', { duration: `${duration}ms` });
      return response;
    }

    // 인증되지 않은 사용자 처리
    if (!session?.user) {
      utils.log('Unauthenticated user accessing protected route');
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('redirectedFrom', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // 사용자 프로필 및 역할 확인 (재시도 로직 포함)
    const profile = await getUserProfileWithRetry(supabase, session.user.id);

    if (!profile) {
      utils.log('Profile not found', session.user.id);
      return NextResponse.redirect(new URL('/auth/complete-profile', request.url));
    }

    // 도메인-역할 매칭 확인
    if (!utils.isDomainRoleMatch(domainType, profile.role as UserRole)) {
      const correctPath = CONFIG.DEFAULT_REDIRECTS[profile.role as UserRole];
      utils.log('Domain-role mismatch', { 
        domain: domainType, 
        role: profile.role, 
        redirectTo: correctPath 
      });
      return NextResponse.redirect(new URL(correctPath, request.url));
    }

    // 성능 로깅
    const duration = Date.now() - startTime;
    utils.log('Request completed (protected)', { 
      duration: `${duration}ms`,
      user: session.user.email,
      role: profile.role
    });

    // 응답 헤더에 사용자 정보 추가 (디버깅용)
    if (process.env.NODE_ENV === 'development') {
      response.headers.set('X-User-Role', profile.role);
      response.headers.set('X-User-ID', session.user.id);
      response.headers.set('X-Processing-Time', `${duration}ms`);
    }

    return response;

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[Middleware Error]', {
      error: error instanceof Error ? error.message : 'Unknown error',
      hostname,
      pathname,
      duration: `${duration}ms`
    });

    // 에러 시 세션 캐시 정리
    sessionCache.clear();

    // 보호된 경로에서 에러 발생 시 로그인 페이지로
    if (utils.isProtectedRoute(pathname)) {
      return utils.createErrorResponse('middleware_error', request);
    }

    return response;
  }
}

// 헬퍼 함수: 사용자 프로필 가져오기
async function getUserProfile(supabase: any, userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role, user_id')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    utils.log('Profile fetch error', error);
    return null;
  }
}

// 헬퍼 함수: 재시도 로직이 있는 프로필 가져오기
async function getUserProfileWithRetry(supabase: any, userId: string, attempts = 0): Promise<any> {
  try {
    return await getUserProfile(supabase, userId);
  } catch (error) {
    if (attempts < CONFIG.MAX_RETRY_ATTEMPTS) {
      utils.log(`Retrying profile fetch, attempt ${attempts + 1}`);
      await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
      return getUserProfileWithRetry(supabase, userId, attempts + 1);
    }
    throw error;
  }
}

// 미들웨어 매처 설정
export const config = {
  matcher: [
    /*
     * 다음을 제외한 모든 요청에 매칭:
     * - api (API routes)
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화)
     * - favicon.ico (파비콘)
     * - 파일 확장자가 있는 모든 파일
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
```

---

## TypeScript 설정

### 1. tsconfig.json (완전한 설정)

```json
{
  "compilerOptions": {
    // 기본 설정
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es6", "es2022"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,

    // Next.js 설정
    "plugins": [
      {
        "name": "next"
      }
    ],

    // 경로 설정
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/types/*": ["./src/types/*"],
      "@/styles/*": ["./src/styles/*"],
      "@/app/*": ["./src/app/*"],
      "@/public/*": ["./public/*"]
    },

    // 타입 체킹 강화
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "alwaysStrict": true,

    // 고급 설정
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": false,
    "noUncheckedIndexedAccess": true,
    "useUnknownInCatchVariables": true,

    // 데코레이터 지원
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,

    // 소스맵
    "sourceMap": true,
    "inlineSourceMap": false,
    "inlineSources": false,

    // 타입 정의 파일 생성
    "declaration": false,
    "declarationMap": false,

    // 출력 설정
    "removeComments": false,
    "importHelpers": true,
    "downlevelIteration": true,

    // 모듈 해석
    "allowSyntheticDefaultImports": true,
    "preserveSymlinks": true,

    // 성능 최적화
    "assumeChangesOnlyAffectDirectDependencies": true
  },

  // 포함할 파일
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    "src/**/*",
    "types/**/*"
  ],

  // 제외할 파일
  "exclude": [
    "node_modules",
    ".next",
    "out",
    "dist",
    "build",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    "coverage",
    "cypress",
    "playwright-report",
    "test-results"
  ],

  // TypeScript 프로젝트 참조 (모노레포용)
  "references": []
}
```

### 2. types/database.types.ts (Supabase 타입 정의)

```typescript
// Supabase CLI로 생성된 타입 정의를 확장
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'creator' | 'business' | 'admin'
          phone: string | null
          is_verified: boolean
          referral_code: string
          referrer_l1_id: string | null
          referrer_l2_id: string | null
          referrer_l3_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'creator' | 'business' | 'admin'
          phone?: string | null
          is_verified?: boolean
          referral_code: string
          referrer_l1_id?: string | null
          referrer_l2_id?: string | null
          referrer_l3_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'creator' | 'business' | 'admin'
          phone?: string | null
          is_verified?: boolean
          referral_code?: string
          referrer_l1_id?: string | null
          referrer_l2_id?: string | null
          referrer_l3_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referrer_l1_id_fkey"
            columns: ["referrer_l1_id"]
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "profiles_referrer_l2_id_fkey"
            columns: ["referrer_l2_id"]
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "profiles_referrer_l3_id_fkey"
            columns: ["referrer_l3_id"]
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      campaigns: {
        Row: {
          id: string
          business_id: string
          creator_id: string | null
          title: string
          description: string
          budget: number
          commission_rate: number
          status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
          start_date: string | null
          end_date: string | null
          target_audience: Json | null
          requirements: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          creator_id?: string | null
          title: string
          description: string
          budget: number
          commission_rate: number
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
          start_date?: string | null
          end_date?: string | null
          target_audience?: Json | null
          requirements?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          creator_id?: string | null
          title?: string
          description?: string
          budget?: number
          commission_rate?: number
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
          start_date?: string | null
          end_date?: string | null
          target_audience?: Json | null
          requirements?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_business_id_fkey"
            columns: ["business_id"]
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "campaigns_creator_id_fkey"
            columns: ["creator_id"]
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'creator' | 'business' | 'admin'
      campaign_status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// 편의성을 위한 타입 별칭
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// 구체적인 타입 정의
export type Profile = Tables<'profiles'>
export type Campaign = Tables<'campaigns'>
export type UserRole = Enums<'user_role'>
export type CampaignStatus = Enums<'campaign_status'>

// 확장 타입 정의
export interface ProfileWithReferrals extends Profile {
  referrer_l1?: Profile | null
  referrer_l2?: Profile | null
  referrer_l3?: Profile | null
  referrals?: Profile[]
}

export interface CampaignWithProfiles extends Campaign {
  business_profile?: Profile
  creator_profile?: Profile | null
}

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  code?: string
}

// 페이지네이션 타입
export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
  has_more: boolean
}

// 필터 타입
export interface ProfileFilters {
  role?: UserRole
  is_verified?: boolean
  search?: string
}

export interface CampaignFilters {
  status?: CampaignStatus
  business_id?: string
  creator_id?: string
  min_budget?: number
  max_budget?: number
  search?: string
}
```

---

## 테스트 설정

### 1. jest.config.js

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Next.js 앱의 경로
  dir: './',
})

// Jest에 추가할 커스텀 설정
const customJestConfig = {
  // 설정 환경
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',

  // 모듈 경로 매핑
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
  },

  // 테스트 파일 패턴
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
    '<rootDir>/tests/**/*.{js,jsx,ts,tsx}',
  ],

  // 제외할 파일/폴더
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/out/',
    '<rootDir>/dist/',
  ],

  // 커버리지 설정
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/*.spec.{js,jsx,ts,tsx}',
  ],

  // 커버리지 임계값
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // 변환 설정
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },

  // 모듈 파일 확장자
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // 테스트 타임아웃
  testTimeout: 10000,

  // 전역 설정
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },

  // 모킹 설정
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // 스냅샷 설정
  snapshotSerializers: ['jest-serializer-html'],

  // 리포터 설정
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './test-results',
        outputName: 'junit.xml',
      },
    ],
  ],
}

// createJestConfig는 next/jest가 비동기적으로 Next.js 설정을 로드할 수 있게 해줍니다
module.exports = createJestConfig(customJestConfig)
```

### 2. jest.setup.js

```javascript
// Testing Library
import '@testing-library/jest-dom'

// Supabase 모킹
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
      signInWithPassword: jest.fn(),
      signInWithOAuth: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      limit: jest.fn().mockReturnThis(),
    })),
  })),
  createServerComponentClient: jest.fn(),
  createMiddlewareClient: jest.fn(),
  createRouteHandlerClient: jest.fn(),
}))

// Next.js 라우터 모킹
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: jest.fn(() => ({})),
}))

// 환경 변수 모킹
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'

// 전역 모킹
global.fetch = jest.fn()
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// 윈도우 객체 모킹
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    hostname: 'localhost',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
  },
  writable: true,
})

// 로컬 스토리지 모킹
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// 세션 스토리지 모킹
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.sessionStorage = sessionStorageMock

// 콘솔 경고 억제 (테스트 중)
const originalConsoleError = console.error
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is no longer supported')
  ) {
    return
  }
  originalConsoleError.call(console, ...args)
}

// 테스트 전후 정리
beforeEach(() => {
  jest.clearAllMocks()
  localStorageMock.clear()
  sessionStorageMock.clear()
})

afterEach(() => {
  jest.restoreAllMocks()
})
```

### 3. playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test'

/**
 * 환경 변수에서 설정 읽기
 * https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  /* 병렬 테스트 설정 */
  fullyParallel: true,
  
  /* CI에서 실패한 테스트 재시도 금지 */
  forbidOnly: !!process.env.CI,
  
  /* CI에서만 재시도 */
  retries: process.env.CI ? 2 : 0,
  
  /* CI에서는 병렬 처리 제한 */
  workers: process.env.CI ? 1 : undefined,
  
  /* 리포터 설정 */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  
  /* 모든 테스트에 공통 설정 */
  use: {
    /* 실패한 테스트의 트레이스 수집 */
    trace: 'on-first-retry',
    
    /* 스크린샷 설정 */
    screenshot: 'only-on-failure',
    
    /* 비디오 설정 */
    video: 'retain-on-failure',
    
    /* 기본 URL */
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3002',
    
    /* 기본 타임아웃 */
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },

  /* 프로젝트 설정 (브라우저별) */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    /* 모바일 브라우저 테스트 */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    
    /* 태블릿 테스트 */
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] },
    },

    /* 브랜드별 Chromium 테스트 */
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],

  /* 로컬 개발 서버 설정 */
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3002',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  /* 글로벌 설정 */
  globalSetup: require.resolve('./tests/e2e/global-setup'),
  globalTeardown: require.resolve('./tests/e2e/global-teardown'),

  /* 출력 디렉토리 */
  outputDir: 'test-results/',

  /* 테스트 매칭 패턴 */
  testMatch: [
    '**/tests/e2e/**/*.spec.ts',
    '**/tests/e2e/**/*.test.ts',
  ],

  /* 무시할 파일 패턴 */
  testIgnore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/.next/**',
  ],

  /* 기대값 설정 */
  expect: {
    /* 스크린샷 비교 임계값 */
    threshold: 0.3,
    
    /* 애니메이션 비활성화 */
    toHaveScreenshot: { animations: 'disabled' },
    toMatchSnapshot: { animations: 'disabled' },
  },

  /* 메타데이터 */
  metadata: {
    'test-type': 'e2e',
    'framework': 'next.js',
    'auth-provider': 'supabase',
  },
})
```

---

## 배포 설정

### 1. Dockerfile (Next.js 최적화)

```dockerfile
# Base image for all stages
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN \
  if [ -f package-lock.json ]; then npm ci --only=production; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

# Build application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 2. docker-compose.yml (개발환경)

```yaml
version: '3.8'

services:
  # Next.js 애플리케이션
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: builder
    ports:
      - "3002:3000"
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    command: npm run dev
    networks:
      - voosting-network
    depends_on:
      - supabase

  # Supabase 로컬 환경
  supabase:
    image: supabase/postgres:15.1.0.117
    ports:
      - "54322:5432"
    environment:
      POSTGRES_PASSWORD: your-super-secret-and-long-postgres-password
      POSTGRES_DB: postgres
    volumes:
      - supabase_db_data:/var/lib/postgresql/data
    networks:
      - voosting-network

  # Redis (세션 캐싱용)
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - voosting-network

  # Nginx (리버스 프록시)
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - app
    networks:
      - voosting-network

networks:
  voosting-network:
    driver: bridge

volumes:
  supabase_db_data:
  redis_data:
```

### 3. GitHub Actions 워크플로우

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # 코드 품질 검사
  quality:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run TypeScript check
      run: npm run type-check

    - name: Run ESLint
      run: npm run lint

    - name: Run Prettier check
      run: npm run format:check

  # 테스트 실행
  test:
    runs-on: ubuntu-latest
    needs: quality
    
    strategy:
      matrix:
        node-version: [18, 20]

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run unit tests
      run: npm run test:coverage
      env:
        CI: true

    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella

  # E2E 테스트
  e2e:
    runs-on: ubuntu-latest
    needs: [quality, test]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Install Playwright browsers
      run: npx playwright install --with-deps

    - name: Start Supabase
      run: npx supabase start

    - name: Run E2E tests
      run: npm run test:e2e
      env:
        PLAYWRIGHT_TEST_BASE_URL: http://localhost:3002

    - name: Upload E2E results
      uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30

  # 보안 검사
  security:
    runs-on: ubuntu-latest
    needs: quality
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        scan-ref: '.'
        format: 'sarif'
        output: 'trivy-results.sarif'

    - name: Upload Trivy scan results
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: 'trivy-results.sarif'

  # Docker 이미지 빌드
  build:
    runs-on: ubuntu-latest
    needs: [test, e2e, security]
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    permissions:
      contents: read
      packages: write

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha

    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  # 프로덕션 배포
  deploy:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - name: Deploy to production
      run: |
        echo "Deploying to production..."
        # 실제 배포 스크립트 실행
        # 예: kubectl, docker-compose, AWS CLI 등
        
    - name: Notify deployment
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        channel: '#deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
      if: always()
```

이 설정 파일들은 Supabase Auth 마이그레이션을 위한 완전한 개발 환경을 제공하며, 프로덕션 배포까지 고려한 포괄적인 설정을 포함하고 있습니다.
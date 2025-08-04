# 서브도메인 로컬 테스트 가이드

Voosting은 역할별로 다른 서브도메인을 사용하는 멀티 도메인 아키텍처를 가지고 있습니다. 이 가이드는 로컬 개발 환경에서 서브도메인을 테스트하는 방법을 설명합니다.

## 서브도메인 구조

- **메인 도메인**: `localhost:3002` - 공개 페이지 및 통합 인증
- **크리에이터 대시보드**: `creator.localhost:3002` - 크리에이터 전용 기능
- **비즈니스 대시보드**: `business.localhost:3002` - 광고주 전용 기능
- **관리자 대시보드**: `admin.localhost:3002` - 플랫폼 관리 기능

## 로컬 환경 설정

### 1. hosts 파일 수정

#### macOS/Linux

```bash
sudo nano /etc/hosts
```

#### Windows

관리자 권한으로 메모장 실행 후:

```
C:\Windows\System32\drivers\etc\hosts
```

### 2. 다음 항목 추가

```
# CashUp 로컬 개발
127.0.0.1 localhost
127.0.0.1 crt.localhost
127.0.0.1 biz.localhost
127.0.0.1 adm.localhost
```

### 3. DNS 캐시 초기화

#### macOS

```bash
sudo dscacheutil -flushcache
```

#### Linux

```bash
sudo systemctl restart systemd-resolved
```

#### Windows

```cmd
ipconfig /flushdns
```

## Next.js 개발 서버 실행

```bash
# 개발 서버 시작 (포트 3002)
npm run dev

# 또는 포트 지정
PORT=3002 npm run dev
```

## 서브도메인 접속 테스트

개발 서버 실행 후 브라우저에서 다음 URL로 접속:

1. **메인 도메인**: http://localhost:3002
2. **크리에이터**: http://crt.localhost:3002
3. **비즈니스**: http://biz.localhost:3002
4. **관리자**: http://adm.localhost:3002

## 도메인 라우팅 동작 확인

### 1. 도메인 감지 확인

```typescript
// middleware.ts에서 로그 확인
console.log('Domain Type:', domainType);
console.log('Rewritten Path:', rewrittenPath);
```

### 2. URL 리라이팅 확인

- `crt.localhost:3002/` → `/creator/dashboard`
- `biz.localhost:3002/` → `/business/dashboard`
- `adm.localhost:3002/` → `/admin/dashboard`

### 3. 인증 후 리다이렉션

- 크리에이터로 로그인 → crt.localhost:3002로 자동 이동
- 비즈니스로 로그인 → biz.localhost:3002로 자동 이동
- 관리자로 로그인 → adm.localhost:3002로 자동 이동

## 테스트 시나리오

### 시나리오 1: 서브도메인 접속

1. `crt.localhost:3002` 접속
2. 로그인하지 않은 경우 → `/auth/signin`으로 리다이렉트
3. 로그인 후 → `/creator/dashboard`로 이동

### 시나리오 2: 잘못된 도메인 접속

1. 크리에이터가 `biz.localhost:3002` 접속
2. 자동으로 `crt.localhost:3002`로 리다이렉트

### 시나리오 3: API 경로 접근

1. 모든 도메인에서 `/api/*` 경로는 리라이팅 없이 접근 가능
2. 예: `crt.localhost:3002/api/profile`은 그대로 유지

## 테스트 명령어

```bash
# 유닛 테스트 실행
npm run test src/lib/__tests__/middleware-utils.test.ts

# 미들웨어 통합 테스트
npm run test:integration

# E2E 테스트 (Playwright)
npx playwright test tests/subdomain-routing.spec.ts
```

## 문제 해결

### 서브도메인이 작동하지 않는 경우

1. **hosts 파일 확인**

   ```bash
   cat /etc/hosts | grep localhost
   ```

2. **브라우저 캐시 삭제**
   - Chrome: 개발자 도구 → Network → Disable cache
   - 또는 시크릿 모드에서 테스트

3. **미들웨어 로그 확인**

   ```typescript
   // middleware.ts에 디버그 로그 추가
   console.log('Hostname:', hostname);
   console.log('Domain Type:', domainType);
   ```

4. **포트 충돌 확인**
   ```bash
   lsof -i :3002  # macOS/Linux
   netstat -ano | findstr :3002  # Windows
   ```

### CORS 문제 해결

서브도메인 간 API 호출 시 CORS 에러가 발생할 수 있습니다:

```typescript
// next.config.js에 CORS 헤더 추가
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*.localhost:3002' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
      ],
    },
  ];
}
```

## 프로덕션 배포 시 주의사항

1. **실제 도메인 DNS 설정 필요**
   - `cashup.kr` (메인)
   - `crt.cashup.kr` (크리에이터)
   - `biz.cashup.kr` (비즈니스)
   - `adm.cashup.kr` (관리자)

2. **환경 변수 설정**

   ```env
   NEXT_PUBLIC_DOMAIN_MAIN=cashup.kr
   NEXT_PUBLIC_DOMAIN_CREATOR=crt.cashup.kr
   NEXT_PUBLIC_DOMAIN_BUSINESS=biz.cashup.kr
   NEXT_PUBLIC_DOMAIN_ADMIN=adm.cashup.kr
   ```

3. **SSL 인증서**
   - 와일드카드 인증서 사용: `*.cashup.kr`
   - 또는 각 서브도메인별 인증서 발급

## 참고 자료

- [Next.js Middleware 문서](https://nextjs.org/docs/advanced-features/middleware)
- [URL Rewriting in Next.js](https://nextjs.org/docs/api-reference/next.config.js/rewrites)
- [Multi-tenant Architecture](https://vercel.com/guides/nextjs-multi-tenant-application)

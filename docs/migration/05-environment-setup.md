# 05. 환경 설정 및 Supabase 프로젝트 구성

## 1. 환경 변수 변경사항

### 1.1 Clerk → Supabase Auth 변수 매핑

| Clerk 변수 (삭제) | Supabase 변수 (추가) | 용도 |
|-------------------|---------------------|------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `NEXT_PUBLIC_SUPABASE_URL` | 클라이언트 API 접근 |
| `CLERK_SECRET_KEY` | `SUPABASE_SERVICE_ROLE_KEY` | 서버사이드 관리 |
| `CLERK_WEBHOOK_SECRET` | `SUPABASE_JWT_SECRET` | JWT 검증 |
| - | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 클라이언트 인증 |

### 1.2 새로운 환경 변수 구성

```bash
# .env.local (개발환경)
# ===================

# Supabase 기본 설정
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret

# OAuth 제공자 설정
SUPABASE_GOOGLE_CLIENT_ID=your_google_client_id
SUPABASE_GOOGLE_CLIENT_SECRET=your_google_client_secret
SUPABASE_KAKAO_CLIENT_ID=your_kakao_client_id
SUPABASE_KAKAO_CLIENT_SECRET=your_kakao_client_secret

# 앱 설정
NEXT_PUBLIC_SITE_URL=http://localhost:3002
SUPABASE_REDIRECT_URL=http://localhost:3002/auth/callback

# 이메일 설정
SUPABASE_SMTP_HOST=smtp.gmail.com
SUPABASE_SMTP_PORT=587
SUPABASE_SMTP_USER=your_email@gmail.com
SUPABASE_SMTP_PASS=your_app_password
```

```bash
# .env.production (프로덕션)
# ==========================

# Supabase 프로덕션 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
SUPABASE_JWT_SECRET=your_production_jwt_secret

# 프로덕션 도메인
NEXT_PUBLIC_SITE_URL=https://voosting.app
SUPABASE_REDIRECT_URL=https://voosting.app/auth/callback

# OAuth 프로덕션 설정
SUPABASE_GOOGLE_CLIENT_ID=your_production_google_client_id
SUPABASE_GOOGLE_CLIENT_SECRET=your_production_google_client_secret
SUPABASE_KAKAO_CLIENT_ID=your_production_kakao_client_id  
SUPABASE_KAKAO_CLIENT_SECRET=your_production_kakao_client_secret
```

### 1.3 보안 설정 가이드

```bash
# JWT 보안 강화
SUPABASE_JWT_EXPIRY=3600  # 1시간
SUPABASE_REFRESH_TOKEN_ROTATION=true
SUPABASE_PASSWORD_MIN_LENGTH=8
SUPABASE_ENABLE_EMAIL_CONFIRMATIONS=true

# 세션 보안
SUPABASE_ENABLE_PHONE_CONFIRMATIONS=false
SUPABASE_ENABLE_SIGNUP=true
SUPABASE_ENABLE_EXTERNAL_EMAIL_CONFIRMATIONS=true

# Rate Limiting
SUPABASE_RATE_LIMIT_EMAIL_SENT=4  # 4 emails per hour
SUPABASE_RATE_LIMIT_SMS_SENT=0    # SMS 비활성화
```

## 2. Supabase 프로젝트 설정

### 2.1 프로젝트 생성 및 기본 설정

```bash
# 1. Supabase 프로젝트 생성
npx supabase init

# 2. 새 프로젝트 링크 (기존 DB 연결)
npx supabase link --project-ref YOUR_PROJECT_REF

# 3. 설정 파일 생성
cat > supabase/config.toml << 'EOF'
[api]
enabled = true
port = 54321
schemas = ["public", "graphql_public"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[auth]
enabled = true
port = 9999
site_url = "http://localhost:3002"
additional_redirect_urls = [
  "http://creator.localhost:3002/auth/callback",
  "http://business.localhost:3002/auth/callback", 
  "http://admin.localhost:3002/auth/callback"
]
jwt_expiry = 3600
refresh_token_rotation_enabled = true
security_update_password_require_reauthentication = true
enable_signup = true
enable_email_confirmations = true
enable_sms_confirmations = false

[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = true
template = {}

[db]
port = 54322
shadow_port = 54320
major_version = 15

[storage]
enabled = true
port = 54324
file_size_limit = "50MiB"
EOF
```

### 2.2 Auth 설정 상세 구성

#### 2.2.1 이메일 템플릿 설정

```sql
-- 회원가입 확인 이메일 템플릿
UPDATE auth.email_templates 
SET 
  subject = '[Voosting] 이메일 인증을 완료해주세요',
  body = '
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Voosting 이메일 인증</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #059669; font-size: 32px; margin: 0;">Voosting</h1>
      <p style="color: #6b7280; margin: 8px 0 0;">AI 크리에이터 마케팅 플랫폼</p>
    </div>
    
    <div style="background: #f9fafb; border-radius: 12px; padding: 32px; margin-bottom: 32px;">
      <h2 style="color: #111827; margin: 0 0 16px;">이메일 인증을 완료해주세요</h2>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 24px;">
        Voosting에 가입해주셔서 감사합니다. 아래 버튼을 클릭하여 이메일 인증을 완료해주세요.
      </p>
      <a href="{{ .ConfirmationURL }}" 
         style="display: inline-block; background: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">
        이메일 인증하기
      </a>
    </div>
    
    <div style="text-align: center; color: #9ca3af; font-size: 14px;">
      <p>이 링크는 24시간 후 만료됩니다.</p>
      <p>© 2024 Voosting. All rights reserved.</p>
    </div>
  </div>
</body>
</html>'
WHERE template_name = 'confirm_signup';

-- 비밀번호 재설정 템플릿
UPDATE auth.email_templates 
SET 
  subject = '[Voosting] 비밀번호 재설정',
  body = '
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Voosting 비밀번호 재설정</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #059669; font-size: 32px; margin: 0;">Voosting</h1>
      <p style="color: #6b7280; margin: 8px 0 0;">AI 크리에이터 마케팅 플랫폼</p>
    </div>
    
    <div style="background: #f9fafb; border-radius: 12px; padding: 32px; margin-bottom: 32px;">
      <h2 style="color: #111827; margin: 0 0 16px;">비밀번호 재설정</h2>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 24px;">
        비밀번호 재설정을 요청하셨습니다. 아래 버튼을 클릭하여 새로운 비밀번호를 설정해주세요.
      </p>
      <a href="{{ .ConfirmationURL }}" 
         style="display: inline-block; background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">
        비밀번호 재설정하기
      </a>
    </div>
    
    <div style="text-align: center; color: #9ca3af; font-size: 14px;">
      <p>요청하지 않았다면 이 이메일을 무시하세요.</p>
      <p>이 링크는 1시간 후 만료됩니다.</p>
      <p>© 2024 Voosting. All rights reserved.</p>
    </div>
  </div>
</body>
</html>'
WHERE template_name = 'recovery';
```

#### 2.2.2 OAuth 제공자 설정

```bash
# Google OAuth 설정
npx supabase secrets set GOOGLE_CLIENT_ID=your_google_client_id
npx supabase secrets set GOOGLE_CLIENT_SECRET=your_google_client_secret

# Kakao OAuth 설정  
npx supabase secrets set KAKAO_CLIENT_ID=your_kakao_client_id
npx supabase secrets set KAKAO_CLIENT_SECRET=your_kakao_client_secret
```

```sql
-- OAuth 제공자 활성화
INSERT INTO auth.providers (name, enabled) VALUES 
('google', true),
('kakao', true)
ON CONFLICT (name) DO UPDATE SET enabled = EXCLUDED.enabled;

-- OAuth 설정 업데이트
UPDATE auth.config SET
  google_enabled = true,
  google_client_id = 'your_google_client_id',
  google_client_secret = 'your_google_client_secret',
  kakao_enabled = true,
  kakao_client_id = 'your_kakao_client_id', 
  kakao_client_secret = 'your_kakao_client_secret';
```

### 2.3 JWT 설정 최적화

```sql
-- JWT 설정 최적화
ALTER SYSTEM SET 
  jwt_secret = 'your-super-secret-jwt-token-with-at-least-32-characters',
  jwt_exp = 3600,  -- 1시간
  jwt_aud = 'authenticated',
  jwt_iss = 'supabase',
  jwt_role_claim_key = 'role';

-- JWT 클레임 커스터마이징
CREATE OR REPLACE FUNCTION auth.role()
RETURNS text
LANGUAGE sql STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'role',
    'anon'
  )::text;
$$;

-- 사용자 메타데이터 JWT 포함
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    current_setting('request.jwt.claims', true)::json->>'user_id'
  )::uuid;
$$;
```

### 2.4 보안 정책 강화

```sql
-- 비밀번호 정책 강화
ALTER SYSTEM SET password_encryption = 'scram-sha-256';

-- 세션 보안 강화
UPDATE auth.config SET
  password_min_length = 8,
  password_require_uppercase = true,
  password_require_lowercase = true, 
  password_require_numbers = true,
  password_require_symbols = false,
  disable_signup = false,
  enable_email_confirmations = true,
  email_confirm_changes = true,
  enable_phone_confirmations = false;

-- Rate Limiting 설정
CREATE TABLE IF NOT EXISTS auth.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  action text NOT NULL,
  count integer DEFAULT 1,
  window_start timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(identifier, action, window_start)
);

-- 이메일 발송 제한 (1시간에 4회)
CREATE OR REPLACE FUNCTION auth.check_email_rate_limit(user_email text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  email_count integer;
BEGIN
  SELECT COUNT(*) INTO email_count
  FROM auth.rate_limits
  WHERE identifier = user_email
    AND action = 'email_sent'
    AND window_start > now() - interval '1 hour';
    
  RETURN email_count < 4;
END;
$$;
```

## 3. 로컬 개발 환경 구성

### 3.1 Supabase CLI 설정

```bash
# Supabase CLI 설치
npm install -g supabase

# 프로젝트 초기화
supabase init

# 로컬 개발 서버 시작
supabase start

# 상태 확인 
supabase status

# 예상 출력:
#          API URL: http://localhost:54321
#           DB URL: postgresql://postgres:postgres@localhost:54322/postgres
#       Studio URL: http://localhost:54323
#      Inbucket URL: http://localhost:54324
#         anon key: your_anon_key
# service_role key: your_service_role_key
```

### 3.2 로컬 개발 서버 구성

```bash
# package.json scripts 업데이트
cat > package.json << 'EOF'
{
  "scripts": {
    "dev": "next dev --port 3002",
    "supabase:start": "supabase start",
    "supabase:stop": "supabase stop", 
    "supabase:reset": "supabase db reset",
    "supabase:migrate": "supabase db push",
    "supabase:types": "supabase gen types typescript --local > src/types/supabase.ts",
    "supabase:seed": "supabase seed",
    "auth:test": "npm run test -- src/lib/auth"
  }
}
EOF

# 개발 환경 시작 스크립트
cat > scripts/dev-start.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Voosting 개발 환경 시작..."

# Supabase 로컬 서버 시작
echo "📦 Supabase 서버 시작 중..."
supabase start

# 환경 변수 확인
echo "🔍 환경 변수 검증 중..."
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "❌ NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다."
  exit 1
fi

# 데이터베이스 마이그레이션
echo "🗄️ 데이터베이스 마이그레이션 실행 중..."
supabase db push

# 테스트 데이터 시드
echo "🌱 테스트 데이터 시드 중..."
supabase seed

# Next.js 개발 서버 시작
echo "⚡ Next.js 개발 서버 시작 중..."
npm run dev

echo "✅ 개발 환경 준비 완료!"
echo "📍 메인 앱: http://localhost:3002"
echo "📍 크리에이터: http://creator.localhost:3002" 
echo "📍 비즈니스: http://business.localhost:3002"
echo "📍 관리자: http://admin.localhost:3002"
echo "📍 Supabase Studio: http://localhost:54323"
EOF

chmod +x scripts/dev-start.sh
```

### 3.3 테스트 데이터 준비

```sql
-- supabase/seed.sql
-- 테스트 사용자 계정 생성

-- 관리자 계정
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@voosting.app',
  now(),
  now(),
  now()
);

INSERT INTO profiles (id, email, role, referral_code, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@voosting.app', 
  'admin',
  'ADMIN001',
  now()
);

-- 테스트 크리에이터 계정
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'creator@test.com',
  now(),
  now(),
  now()
);

INSERT INTO profiles (id, email, role, referral_code, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'creator@test.com',
  'creator',
  'TEST001',
  now()
);

-- 테스트 비즈니스 계정
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'business@test.com',
  now(),
  now(),
  now()
);

INSERT INTO profiles (id, email, role, referral_code, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'business@test.com',
  'business', 
  'BIZ001',
  now()
);

-- 3단계 추천 관계 테스트 데이터
-- L1 → L2 → L3 → L4 구조 생성
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'l1@test.com', now(), now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'l2@test.com', now(), now(), now()),
  ('33333333-3333-3333-3333-333333333333', 'l3@test.com', now(), now(), now()),
  ('44444444-4444-4444-4444-444444444444', 'l4@test.com', now(), now(), now());

INSERT INTO profiles (id, email, role, referral_code, referrer_l1_id, referrer_l2_id, referrer_l3_id, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'l1@test.com', 'creator', 'L1TEST', NULL, NULL, NULL, now()),
  ('22222222-2222-2222-2222-222222222222', 'l2@test.com', 'creator', 'L2TEST', '11111111-1111-1111-1111-111111111111', NULL, NULL, now()),
  ('33333333-3333-3333-3333-333333333333', 'l3@test.com', 'creator', 'L3TEST', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', NULL, now()),
  ('44444444-4444-4444-4444-444444444444', 'l4@test.com', 'creator', 'L4TEST', '33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', now());
```

## 4. 환경 검증 스크립트

### 4.1 종합 검증 스크립트

```bash
#!/bin/bash
# scripts/verify-auth-setup.sh

set -e

echo "🔍 Supabase Auth 환경 검증 시작..."

# 1. 환경 변수 검증
echo "📋 환경 변수 확인 중..."
required_vars=(
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY" 
  "SUPABASE_SERVICE_ROLE_KEY"
  "SUPABASE_JWT_SECRET"
)

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ $var 환경 변수가 설정되지 않았습니다."
    exit 1
  else
    echo "✅ $var 설정됨"
  fi
done

# 2. Supabase 연결 테스트
echo "🔌 Supabase 연결 테스트..."
curl -s "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  > /dev/null && echo "✅ Supabase API 연결 성공" || echo "❌ Supabase API 연결 실패"

# 3. Auth 설정 확인
echo "🔐 Auth 설정 확인..."
auth_status=$(curl -s "$NEXT_PUBLIC_SUPABASE_URL/auth/v1/settings" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY")

if echo "$auth_status" | grep -q "external"; then
  echo "✅ Auth 서비스 활성화됨"
else
  echo "❌ Auth 서비스 설정 오류"
  exit 1
fi

# 4. 데이터베이스 스키마 검증
echo "🗄️ 데이터베이스 스키마 검증..."
psql "$DATABASE_URL" -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public';" > /dev/null \
  && echo "✅ 데이터베이스 연결 성공" || echo "❌ 데이터베이스 연결 실패"

# 5. RLS 정책 확인
echo "🛡️ RLS 정책 확인..."
rls_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';")
if [ "$rls_count" -gt 0 ]; then
  echo "✅ RLS 정책 $rls_count개 활성화됨"
else
  echo "⚠️ RLS 정책이 설정되지 않았습니다."
fi

# 6. OAuth 제공자 확인
echo "🔑 OAuth 제공자 확인..."
if [ -n "$SUPABASE_GOOGLE_CLIENT_ID" ]; then
  echo "✅ Google OAuth 설정됨"
else
  echo "⚠️ Google OAuth 미설정"
fi

if [ -n "$SUPABASE_KAKAO_CLIENT_ID" ]; then
  echo "✅ Kakao OAuth 설정됨"
else
  echo "⚠️ Kakao OAuth 미설정"
fi

echo "🎉 환경 검증 완료!"
```

### 4.2 성능 테스트 스크립트

```bash
#!/bin/bash
# scripts/auth-performance-test.sh

echo "⚡ Auth 성능 테스트 시작..."

# JWT 검증 성능 테스트
echo "🔐 JWT 검증 성능 테스트 (100회)..."
start_time=$(date +%s%N)
for i in {1..100}; do
  curl -s "$NEXT_PUBLIC_SUPABASE_URL/auth/v1/user" \
    -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
    -H "Authorization: Bearer $TEST_JWT_TOKEN" > /dev/null
done
end_time=$(date +%s%N)
duration=$((($end_time - $start_time) / 1000000))
avg_time=$(($duration / 100))

echo "📊 평균 JWT 검증 시간: ${avg_time}ms"
if [ $avg_time -lt 100 ]; then
  echo "✅ 성능 목표 달성 (<100ms)"
else
  echo "⚠️ 성능 개선 필요 (목표: <100ms)"
fi

# 로그인 성능 테스트
echo "🔑 로그인 성능 테스트..."
login_start=$(date +%s%N)
curl -s -X POST "$NEXT_PUBLIC_SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "creator@test.com",
    "password": "testpassword123"
  }' > /dev/null
login_end=$(date +%s%N)
login_duration=$((($login_end - $login_start) / 1000000))

echo "📊 로그인 응답 시간: ${login_duration}ms"
if [ $login_duration -lt 500 ]; then
  echo "✅ 로그인 성능 목표 달성 (<500ms)"
else
  echo "⚠️ 로그인 성능 개선 필요 (목표: <500ms)"
fi

echo "🎯 성능 테스트 완료!"
```

chmod +x scripts/verify-auth-setup.sh
chmod +x scripts/auth-performance-test.sh

## 5. 최종 체크리스트

### 5.1 환경 설정 완료 체크리스트

- [ ] `.env.local` 파일에 모든 Supabase 환경 변수 설정
- [ ] Clerk 관련 환경 변수 제거
- [ ] `supabase/config.toml` 파일 생성 및 설정
- [ ] OAuth 제공자 (Google, Kakao) 설정
- [ ] JWT 설정 최적화
- [ ] 이메일 템플릿 커스터마이징
- [ ] Rate Limiting 설정
- [ ] 보안 정책 강화
- [ ] 로컬 개발 환경 구축
- [ ] 테스트 데이터 시드
- [ ] 검증 스크립트 실행

### 5.2 성능 목표

- **JWT 검증**: < 100ms 평균
- **로그인 응답**: < 500ms 평균  
- **회원가입 응답**: < 1000ms 평균
- **OAuth 리다이렉트**: < 2000ms 평균
- **이메일 발송**: < 3000ms 평균

### 5.3 보안 체크리스트

- [ ] JWT Secret 256bit 이상
- [ ] 비밀번호 정책 강화 (8자 이상, 대소문자, 숫자)
- [ ] Rate Limiting 활성화 (이메일: 4회/시간)
- [ ] RLS 정책 모든 테이블 적용
- [ ] OAuth 클라이언트 시크릿 환경 변수 보호
- [ ] HTTPS 리다이렉트 강제 (프로덕션)
- [ ] CORS 정책 최소 권한
- [ ] 이메일 확인 필수
- [ ] 세션 만료 정책 (1시간)
- [ ] 리프레시 토큰 로테이션

이제 `06-database-migration.md` 파일을 생성하여 데이터베이스 마이그레이션 가이드를 제공하겠습니다.
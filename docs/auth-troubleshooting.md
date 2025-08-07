# Supabase Auth 로그인 문제 해결 가이드

## 문제 상황
"Invalid login credentials" 에러가 발생하며 로그인이 되지 않는 문제

## 원인 분석

### 1. 근본 원인
- **Database error saving new user**: Supabase Auth에서 새 사용자를 생성할 수 없음
- **Database error creating new user**: Admin API로도 사용자 생성 실패
- 이는 Supabase 프로젝트의 데이터베이스 또는 Auth 설정 문제로 보임

### 2. 확인된 사항
- ✅ Supabase 연결은 정상 (URL과 키가 올바름)
- ✅ profiles 테이블은 존재함
- ❌ auth.users 테이블에 사용자를 생성할 수 없음
- ❌ 로컬 Supabase를 사용할 수 없음 (Docker 미설치)

## 해결 방법

### 방법 1: Supabase Dashboard에서 직접 계정 생성 (권장)

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 해당 프로젝트 선택
3. **Authentication** → **Users** 메뉴로 이동
4. **Invite user** 버튼 클릭
5. 다음 정보로 계정 생성:
   ```
   Email: creator1@test.com
   Password: testPassword123!
   ```
6. 생성 후 **Email confirmed** 체크박스 활성화
7. 나머지 테스트 계정도 동일하게 생성

### 방법 2: 새로운 Supabase 프로젝트 생성

현재 프로젝트에 문제가 있을 수 있으므로:

1. 새 Supabase 프로젝트 생성
2. `.env.local` 파일 업데이트:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=<새 프로젝트 URL>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<새 프로젝트 ANON KEY>
   SUPABASE_SERVICE_ROLE_KEY=<새 프로젝트 SERVICE KEY>
   ```
3. 데이터베이스 마이그레이션 실행:
   ```bash
   npx supabase db push
   ```

### 방법 3: Auth 트리거 및 정책 확인

Supabase SQL Editor에서 다음 실행:

```sql
-- 1. Auth 트리거 확인
SELECT * FROM pg_trigger WHERE tgname LIKE '%auth%';

-- 2. RLS 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- 3. Auth 스키마 권한 확인
SELECT * FROM information_schema.table_privileges 
WHERE table_schema = 'auth' AND table_name = 'users';

-- 4. 트리거 함수 재생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'creator'),
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 트리거 재생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 방법 4: 로컬 Supabase 설정 (Docker 필요)

Docker Desktop 설치 후:

```bash
# 1. Docker 설치 확인
docker --version

# 2. Supabase CLI 설치
brew install supabase/tap/supabase

# 3. 로컬 Supabase 시작
supabase start

# 4. 로컬 환경 변수 설정
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<로컬 ANON KEY>
```

## 테스트 계정 정보

성공적으로 생성되면 다음 계정 사용 가능:

| 이메일 | 비밀번호 | 역할 |
|--------|----------|------|
| creator1@test.com | testPassword123! | creator |
| creator2@test.com | testPassword123! | creator |
| business1@test.com | testPassword123! | business |
| business2@test.com | testPassword123! | business |
| admin@test.com | testPassword123! | admin |

## 생성된 스크립트 파일

프로젝트에 다음 유틸리티 스크립트가 추가되었습니다:

1. **`scripts/create-test-accounts.ts`**
   - Admin API로 테스트 계정 생성 (Service Role Key 필요)
   
2. **`scripts/reset-test-passwords.ts`**
   - 기존 계정의 비밀번호 리셋
   
3. **`scripts/test-auth.ts`**
   - 로그인 기능 테스트
   
4. **`scripts/signup-test-accounts.ts`**
   - 일반 회원가입 API로 계정 생성

사용 예:
```bash
# 인증 테스트
npx tsx scripts/test-auth.ts

# 계정 생성 (Admin 권한)
npx tsx scripts/create-test-accounts.ts

# 회원가입으로 계정 생성
npx tsx scripts/signup-test-accounts.ts
```

## 추가 디버깅

브라우저 콘솔에서 확인할 사항:
- Network 탭에서 Supabase API 호출 확인
- Console에서 에러 메시지 확인
- Application → Cookies에서 세션 쿠키 확인

## 권장 다음 단계

1. **즉시 해결**: Supabase Dashboard에서 수동으로 테스트 계정 생성
2. **장기 해결**: 새 Supabase 프로젝트로 마이그레이션 고려
3. **개발 환경**: Docker 설치 후 로컬 Supabase 사용

## 관련 파일
- `/src/app/sign-in/[[...sign-in]]/page.tsx` - 로그인 페이지
- `/src/lib/supabase/client.ts` - Supabase 클라이언트
- `/src/middleware.ts` - 인증 미들웨어
- `.env.local` - 환경 변수 설정
# Supabase Dashboard에서 수동으로 테스트 계정 생성하기

## 현재 상황
- ✅ Profiles 테이블에 테스트 계정 데이터 존재
- ❌ Auth.users 테이블에 해당 사용자 없음
- ❌ API로 사용자 생성 시 "Database error creating new user" 발생

## 해결 방법: Supabase Dashboard에서 직접 생성

### 1단계: Supabase Dashboard 접속
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택 (qcyksavfyzivprsjhuxn)

### 2단계: Authentication 섹션으로 이동
1. 왼쪽 메뉴에서 **Authentication** 클릭
2. **Users** 탭 선택

### 3단계: 테스트 계정 생성
각 계정마다 다음 단계 반복:

#### Creator1 계정
1. **Add user** → **Create new user** 클릭
2. 입력 정보:
   - Email: `creator1@test.com`
   - Password: `testPassword123!`
   - User metadata (JSON):
   ```json
   {
     "role": "creator",
     "full_name": "테스트 크리에이터1"
   }
   ```
3. **Auto Confirm Email** 체크 ✅
4. **Create user** 클릭

#### Creator2 계정
- Email: `creator2@test.com`
- Password: `testPassword123!`
- User metadata:
  ```json
  {
    "role": "creator",
    "full_name": "테스트 크리에이터2"
  }
  ```

#### Business1 계정
- Email: `business1@test.com`
- Password: `testPassword123!`
- User metadata:
  ```json
  {
    "role": "business",
    "full_name": "테스트 비즈니스1"
  }
  ```

#### Business2 계정
- Email: `business2@test.com`
- Password: `testPassword123!`
- User metadata:
  ```json
  {
    "role": "business",
    "full_name": "테스트 비즈니스2"
  }
  ```

#### Admin 계정
- Email: `admin@test.com`
- Password: `testPassword123!`
- User metadata:
  ```json
  {
    "role": "admin",
    "full_name": "테스트 관리자"
  }
  ```

### 4단계: 생성된 사용자 ID 확인
1. 각 사용자를 클릭하여 User ID 확인
2. 해당 ID를 메모

### 5단계: Profiles 테이블 업데이트 (필요한 경우)
SQL Editor에서 실행:

```sql
-- Auth.users ID와 profiles ID 매핑 업데이트
-- 예시: creator1@test.com 사용자
UPDATE profiles 
SET id = '실제_auth_user_id_여기에_붙여넣기'
WHERE email = 'creator1@test.com';

-- 모든 테스트 계정에 대해 반복
```

### 6단계: 프로필 동기화 확인
SQL Editor에서 실행:

```sql
-- Auth 사용자와 Profile 매핑 확인
SELECT 
  au.id as auth_id,
  au.email as auth_email,
  p.id as profile_id,
  p.email as profile_email,
  p.role
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE au.email IN (
  'creator1@test.com',
  'creator2@test.com',
  'business1@test.com',
  'business2@test.com',
  'admin@test.com'
);
```

## 테스트 계정 정보

| 이메일 | 비밀번호 | 역할 | 설명 |
|--------|----------|------|------|
| creator1@test.com | testPassword123! | creator | 테스트 크리에이터1 |
| creator2@test.com | testPassword123! | creator | 테스트 크리에이터2 |
| business1@test.com | testPassword123! | business | 테스트 비즈니스1 |
| business2@test.com | testPassword123! | business | 테스트 비즈니스2 |
| admin@test.com | testPassword123! | admin | 테스트 관리자 |

## 로그인 테스트
계정 생성 후 다음 명령으로 테스트:

```bash
npx tsx scripts/test-auth.ts
```

## 문제 해결
### "Database error" 계속 발생 시
1. **Supabase Dashboard → Settings → Database**
2. **Connection Pooling** 섹션 확인
3. **Pool Mode**: Transaction 또는 Session으로 설정
4. **Auth Schema Permissions** 확인

### RLS 정책 무한 재귀 문제
SQL Editor에서 실행:
```sql
-- 현재 RLS 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- 문제가 있는 정책 삭제 및 재생성
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 새로운 정책 생성
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

## 완료 후 확인
```bash
# 데이터베이스 상태 재확인
npx tsx scripts/check-database-status.ts

# 로그인 테스트
npx tsx scripts/test-auth.ts
```
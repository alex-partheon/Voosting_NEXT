# Supabase Auth 권한 문제 해결 가이드

## 🚨 현재 문제
- **오류**: "Database error creating new user"
- **원인**: Auth 스키마 권한 문제, 트리거 충돌, RLS 무한 재귀

## ✅ 해결 방법

### 1단계: Supabase Dashboard 접속
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택 (qcyksavfyzivprsjhuxn)
3. 왼쪽 메뉴에서 **SQL Editor** 클릭

### 2단계: SQL 수정 스크립트 실행
1. `scripts/fix-supabase-permissions.sql` 파일 내용 전체 복사
2. SQL Editor에 붙여넣기
3. **Run** 버튼 클릭

스크립트가 수행하는 작업:
- ✅ 중복/충돌 트리거 제거
- ✅ 개선된 함수 재생성
- ✅ RLS 무한 재귀 문제 해결
- ✅ 권한 설정 수정
- ✅ 테이블 구조 정리

### 3단계: 수정 결과 검증
```bash
# 검증 스크립트 실행
npx tsx scripts/verify-auth-fix.ts
```

예상 결과:
```
✅ 사용자 생성 API: 성공
✅ 프로필 자동 생성: 프로필이 자동으로 생성됨
✅ 추천 코드 유니크: 추천 코드가 유니크함
✅ RLS 무한 재귀: RLS 정책 정상 작동
```

### 4단계: 테스트 계정 생성
수정이 성공했다면 이제 API로 계정 생성 가능:

```bash
# 테스트 계정 생성
npx tsx scripts/create-test-accounts.ts

# 로그인 테스트
npx tsx scripts/test-auth.ts
```

## 🔧 수정 내용 상세

### 트리거 함수 개선
```sql
-- 기존: 에러 시 전체 실패
-- 개선: 에러 처리 및 복구
CREATE OR REPLACE FUNCTION handle_new_user()
...
EXCEPTION
    WHEN OTHERS THEN
        -- 에러가 발생해도 auth user 생성은 계속
        RETURN NEW;
```

### RLS 무한 재귀 해결
```sql
-- 기존: profiles 테이블 조회 → 무한 재귀
-- 개선: JWT에서 직접 role 확인
CREATE OR REPLACE FUNCTION is_admin()
...
    RETURN (SELECT auth.jwt() ->> 'role') = 'admin';
```

### 권한 문제 해결
```sql
-- supabase_auth_admin에 모든 필요 권한 부여
GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO supabase_auth_admin;
```

## 🔍 문제가 계속되는 경우

### Connection Pooling 설정 확인
1. Supabase Dashboard → Settings → Database
2. **Connection Pooling** 섹션
3. 다음 설정 확인:
   - Pool Mode: `Transaction`
   - Default Pool Size: `15`
   - Max Client Connections: `100`

### Database 재시작
1. Dashboard → Settings → Database
2. **Restart database** 버튼 클릭
3. 약 2-3분 대기

### 수동으로 테스트 계정 생성
SQL 수정 후에도 문제가 있다면:
1. Dashboard → Authentication → Users
2. **Add user** → **Create new user**
3. 각 테스트 계정 정보 입력
4. **Auto Confirm Email** 체크

## 📊 성공 기준

다음 명령들이 모두 성공해야 함:
```bash
# 1. 데이터베이스 상태 확인
pnpm run db:check
# → Auth 사용자와 Profiles 동기화 확인

# 2. 검증 스크립트
npx tsx scripts/verify-auth-fix.ts
# → 모든 테스트 통과

# 3. 계정 생성
npx tsx scripts/create-test-accounts.ts
# → 테스트 계정 생성 성공

# 4. 로그인 테스트
pnpm run auth:test
# → 로그인 성공
```

## 📝 테스트 계정 정보

성공적으로 생성된 테스트 계정:

| 이메일 | 비밀번호 | 역할 |
|--------|----------|------|
| creator1@test.com | testPassword123! | creator |
| creator2@test.com | testPassword123! | creator |
| business1@test.com | testPassword123! | business |
| business2@test.com | testPassword123! | business |
| admin@test.com | testPassword123! | admin |

## 🚀 다음 단계

1. 로컬 개발 서버 시작:
   ```bash
   pnpm dev
   ```

2. 브라우저에서 http://localhost:3002/sign-in 접속

3. 테스트 계정으로 로그인 테스트

4. 각 역할별 대시보드 접근 확인:
   - Creator: http://creator.localhost:3002/dashboard
   - Business: http://business.localhost:3002/dashboard
   - Admin: http://admin.localhost:3002/dashboard

## 💡 추가 팁

- SQL 스크립트는 여러 번 실행해도 안전 (IF EXISTS 사용)
- 트리거 함수는 에러가 발생해도 auth user 생성을 막지 않음
- RLS 정책은 JWT 토큰을 직접 확인하여 무한 재귀 방지
- 모든 권한 설정은 service_role > auth_admin > authenticated > anon 순서
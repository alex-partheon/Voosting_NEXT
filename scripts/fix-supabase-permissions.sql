-- =====================================================
-- Supabase Auth 권한 문제 해결 스크립트
-- 
-- 실행 방법:
-- 1. Supabase Dashboard → SQL Editor 접속
-- 2. 이 스크립트 전체를 복사하여 붙여넣기
-- 3. Run 버튼 클릭
-- =====================================================

-- =====================================================
-- STEP 1: 진단 - 현재 상태 확인
-- =====================================================

-- 현재 트리거 상태 확인
SELECT 
    'Current Triggers:' as info,
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid::regclass::text IN ('auth.users', 'public.profiles')
ORDER BY table_name, trigger_name;

-- 현재 함수 상태 확인
SELECT 
    'Current Functions:' as info,
    proname as function_name,
    pronamespace::regnamespace as schema
FROM pg_proc
WHERE proname IN ('handle_new_user', 'generate_referral_code', 'is_admin');

-- 현재 RLS 정책 확인
SELECT 
    'Current RLS Policies:' as info,
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- =====================================================
-- STEP 2: 기존 문제 요소 제거
-- =====================================================

-- 모든 기존 트리거 삭제
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users CASCADE;

-- 기존 함수들 삭제 (재생성을 위해)
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS generate_referral_code() CASCADE;
DROP FUNCTION IF EXISTS generate_referral_code(UUID) CASCADE;
DROP FUNCTION IF EXISTS is_admin() CASCADE;
DROP FUNCTION IF EXISTS get_user_role(UUID) CASCADE;
DROP FUNCTION IF EXISTS has_role(user_role) CASCADE;

-- 문제가 있는 RLS 정책 제거
DROP POLICY IF EXISTS "Admins have full profiles access" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins have full campaigns access" ON campaigns;
DROP POLICY IF EXISTS "Admins have full earnings access" ON earnings;

-- =====================================================
-- STEP 3: 개선된 함수 생성
-- =====================================================

-- 추천 코드 생성 함수 (충돌 방지 개선)
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT 
LANGUAGE plpgsql
AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
    code_exists BOOLEAN := TRUE;
    attempts INTEGER := 0;
BEGIN
    -- 유니크한 코드 생성 (최대 100회 시도)
    WHILE code_exists AND attempts < 100 LOOP
        result := '';
        -- 8자리 랜덤 코드 생성
        FOR i IN 1..8 LOOP
            result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
        END LOOP;
        
        -- 중복 확인
        SELECT EXISTS(
            SELECT 1 FROM profiles WHERE referral_code = result
        ) INTO code_exists;
        
        attempts := attempts + 1;
    END LOOP;
    
    -- 100회 시도 후에도 실패하면 타임스탬프 추가
    IF attempts >= 100 THEN
        result := result || '_' || extract(epoch from now())::text;
    END IF;
    
    RETURN result;
END;
$$;

-- Admin 체크 함수 (무한 재귀 방지)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
    -- JWT에서 직접 role 확인 (profiles 테이블 조회 없이)
    RETURN COALESCE(
        (SELECT auth.jwt() ->> 'role') = 'admin',
        FALSE
    );
END;
$$;

-- 사용자 역할 확인 함수
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- profiles 테이블에서 역할 조회
    SELECT role::TEXT INTO user_role
    FROM profiles
    WHERE id = user_id;
    
    RETURN COALESCE(user_role, 'creator');
END;
$$;

-- 역할 체크 함수
CREATE OR REPLACE FUNCTION has_role(required_role user_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
    RETURN (
        SELECT role = required_role
        FROM profiles
        WHERE id = auth.uid()
    );
END;
$$;

-- 프로필 생성 트리거 함수 (에러 처리 강화)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
    display_name_val TEXT;
    full_name_val TEXT;
    referral_code_val TEXT;
    referred_by TEXT;
BEGIN
    -- 이미 프로필이 존재하는지 확인
    IF EXISTS (SELECT 1 FROM profiles WHERE id = NEW.id) THEN
        RAISE NOTICE 'Profile already exists for user %', NEW.id;
        RETURN NEW;
    END IF;
    
    -- 메타데이터에서 값 추출
    user_role := COALESCE(
        NEW.raw_user_meta_data->>'role',
        NEW.raw_app_meta_data->>'role',
        'creator'
    );
    
    display_name_val := COALESCE(
        NEW.raw_user_meta_data->>'display_name',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );
    
    full_name_val := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        display_name_val
    );
    
    referred_by := NEW.raw_user_meta_data->>'referred_by';
    
    -- 추천 코드 생성
    referral_code_val := generate_referral_code();
    
    -- 프로필 생성
    INSERT INTO profiles (
        id,
        email,
        role,
        display_name,
        full_name,
        referral_code,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        user_role::user_role,
        display_name_val,
        full_name_val,
        referral_code_val,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW();
    
    -- 추천 관계 설정 (있는 경우)
    IF referred_by IS NOT NULL AND referred_by != '' THEN
        UPDATE profiles p1
        SET 
            referrer_l1_id = p2.id,
            referrer_l2_id = p2.referrer_l1_id,
            referrer_l3_id = p2.referrer_l2_id,
            updated_at = NOW()
        FROM profiles p2
        WHERE p1.id = NEW.id
        AND p2.referral_code = referred_by;
    END IF;
    
    RAISE NOTICE 'Profile created successfully for user %', NEW.email;
    RETURN NEW;
    
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint violation for user %, ignoring', NEW.email;
        RETURN NEW;
    WHEN OTHERS THEN
        RAISE LOG 'Error in handle_new_user for %: %', NEW.email, SQLERRM;
        -- 에러가 발생해도 auth user 생성은 계속 진행
        RETURN NEW;
END;
$$;

-- =====================================================
-- STEP 4: 트리거 재생성
-- =====================================================

-- Auth 사용자 생성 시 프로필 자동 생성 트리거
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- STEP 5: RLS 정책 재생성 (무한 재귀 방지)
-- =====================================================

-- Profiles 테이블 RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 프로필만 조회 가능
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT
    USING (
        auth.uid() = id 
        OR is_admin()
    );

-- 사용자는 자신의 프로필만 수정 가능
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE
    USING (
        auth.uid() = id
        OR is_admin()
    );

-- 새 프로필 생성은 트리거를 통해서만 (또는 admin)
CREATE POLICY "Profile creation via trigger or admin" ON profiles
    FOR INSERT
    WITH CHECK (
        auth.uid() = id
        OR is_admin()
    );

-- Admin은 프로필 삭제 가능
CREATE POLICY "Admins can delete profiles" ON profiles
    FOR DELETE
    USING (is_admin());

-- =====================================================
-- STEP 6: 권한 설정
-- =====================================================

-- supabase_auth_admin에 필요한 권한 부여
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO supabase_auth_admin;

-- anon과 authenticated 역할에 기본 권한 부여
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- authenticated 사용자는 profiles 테이블 수정 가능
GRANT INSERT, UPDATE ON profiles TO authenticated;

-- service_role은 모든 권한
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- =====================================================
-- STEP 7: 테이블 구조 확인 및 수정
-- =====================================================

-- display_name 컬럼이 없으면 추가
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- full_name 컬럼이 없으면 추가
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- display_name이 NULL인 경우 채우기
UPDATE profiles 
SET display_name = COALESCE(display_name, full_name, split_part(email, '@', 1))
WHERE display_name IS NULL;

-- =====================================================
-- STEP 8: 검증
-- =====================================================

-- 트리거 생성 확인
SELECT 
    'Triggers after fix:' as status,
    tgname as trigger_name,
    tgrelid::regclass as table_name
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- 함수 생성 확인
SELECT 
    'Functions after fix:' as status,
    proname as function_name,
    pronamespace::regnamespace as schema
FROM pg_proc
WHERE proname IN ('handle_new_user', 'generate_referral_code', 'is_admin')
ORDER BY function_name;

-- RLS 정책 확인
SELECT 
    'RLS Policies after fix:' as status,
    policyname,
    cmd
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- =====================================================
-- STEP 9: 테스트 사용자 생성
-- =====================================================

-- 테스트를 위한 임시 사용자 생성 (선택사항)
-- 주석을 해제하고 실행하면 테스트 사용자가 생성됩니다

/*
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    test_user_id := gen_random_uuid();
    
    -- Auth 사용자 생성 테스트
    INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_user_meta_data,
        created_at,
        updated_at,
        instance_id,
        aud,
        role
    ) VALUES (
        test_user_id,
        'test_' || extract(epoch from now())::text || '@example.com',
        crypt('testPassword123!', gen_salt('bf')),
        NOW(),
        '{"role": "creator", "full_name": "Test User"}'::jsonb,
        NOW(),
        NOW(),
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated'
    );
    
    -- 프로필이 자동 생성되었는지 확인
    IF EXISTS (SELECT 1 FROM profiles WHERE id = test_user_id) THEN
        RAISE NOTICE 'Success! Profile was created automatically for test user';
        
        -- 테스트 사용자 정리
        DELETE FROM auth.users WHERE id = test_user_id;
    ELSE
        RAISE WARNING 'Profile was not created automatically';
    END IF;
END $$;
*/

-- =====================================================
-- 완료 메시지
-- =====================================================
SELECT 
    '✅ Permission fix completed!' as status,
    'Now try creating users via API or Dashboard' as next_step;
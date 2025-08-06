-- Supabase Auth 테스트 계정 설정 스크립트
-- 주의: 이 스크립트는 개발/테스트 환경에서만 사용하세요.

-- 1. 테스트 계정 생성을 위한 함수 (Admin API로 실행)
-- Supabase Auth는 직접 SQL로 사용자를 생성할 수 없으므로, 
-- Admin API 또는 Dashboard를 통해 생성해야 합니다.

-- 2. 프로필 데이터 준비 (auth.users가 생성된 후 실행)
-- 아래 SQL은 auth.users가 이미 생성되었다고 가정합니다.

-- 크리에이터 1 프로필
INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    referral_code,
    referrer_l1_id,
    referrer_l2_id,
    referrer_l3_id,
    created_at,
    updated_at
) VALUES (
    -- creator1@test.com의 auth.uid
    (SELECT id FROM auth.users WHERE email = 'creator1@test.com'),
    'creator1@test.com',
    '크리에이터 1호',
    'creator',
    'CREATOR1',
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    referral_code = EXCLUDED.referral_code,
    updated_at = NOW();

-- 크리에이터 2 프로필 (creator1의 추천)
INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    referral_code,
    referrer_l1_id,
    referrer_l2_id,
    referrer_l3_id,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'creator2@test.com'),
    'creator2@test.com',
    '크리에이터 2호',
    'creator',
    -- 자동 생성 코드 (UUID 기반)
    'VT' || UPPER(SUBSTRING(REPLACE((SELECT id FROM auth.users WHERE email = 'creator2@test.com')::text, '-', ''), 1, 6)),
    (SELECT id FROM auth.users WHERE email = 'creator1@test.com'), -- L1
    NULL, -- L2
    NULL, -- L3
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    referral_code = EXCLUDED.referral_code,
    referrer_l1_id = EXCLUDED.referrer_l1_id,
    updated_at = NOW();

-- 크리에이터 3 프로필 (creator2의 추천)
INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    referral_code,
    referrer_l1_id,
    referrer_l2_id,
    referrer_l3_id,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'creator3@test.com'),
    'creator3@test.com',
    '크리에이터 3호',
    'creator',
    'VT' || UPPER(SUBSTRING(REPLACE((SELECT id FROM auth.users WHERE email = 'creator3@test.com')::text, '-', ''), 1, 6)),
    (SELECT id FROM auth.users WHERE email = 'creator2@test.com'), -- L1
    (SELECT id FROM auth.users WHERE email = 'creator1@test.com'), -- L2
    NULL, -- L3
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    referral_code = EXCLUDED.referral_code,
    referrer_l1_id = EXCLUDED.referrer_l1_id,
    referrer_l2_id = EXCLUDED.referrer_l2_id,
    updated_at = NOW();

-- 비즈니스 1 프로필
INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    referral_code,
    company_name,
    business_registration_number,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'business1@test.com'),
    'business1@test.com',
    '비즈니스 1호',
    'business',
    'VT' || UPPER(SUBSTRING(REPLACE((SELECT id FROM auth.users WHERE email = 'business1@test.com')::text, '-', ''), 1, 6)),
    '테스트 광고주 A',
    'BR-' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS'),
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    referral_code = EXCLUDED.referral_code,
    company_name = EXCLUDED.company_name,
    business_registration_number = EXCLUDED.business_registration_number,
    updated_at = NOW();

-- 비즈니스 2 프로필
INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    referral_code,
    company_name,
    business_registration_number,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'business2@test.com'),
    'business2@test.com',
    '비즈니스 2호',
    'business',
    'VT' || UPPER(SUBSTRING(REPLACE((SELECT id FROM auth.users WHERE email = 'business2@test.com')::text, '-', ''), 1, 6)),
    '테스트 광고주 B',
    'BR-' || TO_CHAR(NOW() + INTERVAL '1 second', 'YYYYMMDDHH24MISS'),
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    referral_code = EXCLUDED.referral_code,
    company_name = EXCLUDED.company_name,
    business_registration_number = EXCLUDED.business_registration_number,
    updated_at = NOW();

-- 관리자 프로필
INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    referral_code,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'admin@test.com'),
    'admin@test.com',
    '플랫폼 관리자',
    'admin',
    'ADMIN' || UPPER(SUBSTRING(REPLACE((SELECT id FROM auth.users WHERE email = 'admin@test.com')::text, '-', ''), 1, 4)),
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    referral_code = EXCLUDED.referral_code,
    updated_at = NOW();

-- 테스트 계정 확인
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.referral_code,
    p.referrer_l1_id,
    p.referrer_l2_id,
    p.company_name
FROM profiles p
WHERE p.email IN (
    'creator1@test.com',
    'creator2@test.com',
    'creator3@test.com',
    'business1@test.com',
    'business2@test.com',
    'admin@test.com'
)
ORDER BY p.created_at;
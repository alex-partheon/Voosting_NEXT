-- Clerk 기반 프로필 테이블 업데이트
-- Clerk User ID (string)를 기본 키로 사용하도록 변경

-- 1. 기존 profiles 테이블의 외래 키 제약조건 일시적으로 제거
ALTER TABLE referral_earnings DROP CONSTRAINT IF EXISTS referral_earnings_referrer_id_fkey;
ALTER TABLE referral_earnings DROP CONSTRAINT IF EXISTS referral_earnings_referred_id_fkey;
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_business_id_fkey;
ALTER TABLE campaign_applications DROP CONSTRAINT IF EXISTS campaign_applications_creator_id_fkey;
ALTER TABLE campaign_applications DROP CONSTRAINT IF EXISTS campaign_applications_reviewer_id_fkey;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_creator_id_fkey;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_business_id_fkey;

-- 2. profiles 테이블의 자기 참조 외래 키 제거
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_referrer_l1_id_fkey;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_referrer_l2_id_fkey;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_referrer_l3_id_fkey;

-- 3. auth.users 참조 제거
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 4. 3단계 추천 시스템 필드 커미션 비율 정확하게 업데이트
-- 함수: 추천 수익 계산 및 생성 (10% → 5% → 2%)
CREATE OR REPLACE FUNCTION create_referral_earnings(
    p_referred_id TEXT,  -- UUID에서 TEXT로 변경 (Clerk ID)
    p_amount DECIMAL(10,2),
    p_campaign_id UUID DEFAULT NULL,
    p_payment_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_profile RECORD;
    v_commission_rates DECIMAL[] := ARRAY[0.10, 0.05, 0.02]; -- 10%, 5%, 2%로 수정
BEGIN
    -- 추천받은 사용자의 프로필 조회
    SELECT referrer_l1_id, referrer_l2_id, referrer_l3_id
    INTO v_profile
    FROM profiles
    WHERE id = p_referred_id;
    
    -- 1단계 추천인 수익 생성 (10%)
    IF v_profile.referrer_l1_id IS NOT NULL THEN
        INSERT INTO referral_earnings (
            referrer_id, referred_id, level, commission_rate, amount, campaign_id, payment_id
        ) VALUES (
            v_profile.referrer_l1_id, p_referred_id, 1, 
            v_commission_rates[1], p_amount * v_commission_rates[1], 
            p_campaign_id, p_payment_id
        );
    END IF;
    
    -- 2단계 추천인 수익 생성 (5%)
    IF v_profile.referrer_l2_id IS NOT NULL THEN
        INSERT INTO referral_earnings (
            referrer_id, referred_id, level, commission_rate, amount, campaign_id, payment_id
        ) VALUES (
            v_profile.referrer_l2_id, p_referred_id, 2, 
            v_commission_rates[2], p_amount * v_commission_rates[2], 
            p_campaign_id, p_payment_id
        );
    END IF;
    
    -- 3단계 추천인 수익 생성 (2%)
    IF v_profile.referrer_l3_id IS NOT NULL THEN
        INSERT INTO referral_earnings (
            referrer_id, referred_id, level, commission_rate, amount, campaign_id, payment_id
        ) VALUES (
            v_profile.referrer_l3_id, p_referred_id, 3, 
            v_commission_rates[3], p_amount * v_commission_rates[3], 
            p_campaign_id, p_payment_id
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 5. 트리거 함수 업데이트 (Clerk ID 타입 변경 반영)
CREATE OR REPLACE FUNCTION trigger_create_referral_earnings()
RETURNS TRIGGER AS $$
BEGIN
    -- 결제가 완료 상태로 변경될 때만 실행
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        PERFORM create_referral_earnings(
            NEW.creator_id,
            NEW.commission_amount,
            NEW.campaign_id,
            NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. RLS 정책 업데이트 (Clerk User ID 사용)
-- 기존 정책 제거
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- 새로운 RLS 정책 생성 (Clerk JWT의 sub 클레임 사용)
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (
        id = auth.jwt() ->> 'sub'
    );

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (
        id = auth.jwt() ->> 'sub'
    );

CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

-- 7. 관련 테이블의 RLS 정책 업데이트
-- 추천 수익 정책
DROP POLICY IF EXISTS "Users can view their own referral earnings" ON referral_earnings;
DROP POLICY IF EXISTS "Admins can manage all referral earnings" ON referral_earnings;

CREATE POLICY "Users can view their own referral earnings" ON referral_earnings
    FOR SELECT USING (
        referrer_id = auth.jwt() ->> 'sub'
    );

CREATE POLICY "Admins can manage all referral earnings" ON referral_earnings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.jwt() ->> 'sub' AND role = 'admin'
        )
    );

-- 캠페인 정책
DROP POLICY IF EXISTS "Business users can manage their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "All users can view active campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admins can manage all campaigns" ON campaigns;

CREATE POLICY "Business users can manage their own campaigns" ON campaigns
    FOR ALL USING (
        business_id = auth.jwt() ->> 'sub'
    );

CREATE POLICY "All users can view active campaigns" ON campaigns
    FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage all campaigns" ON campaigns
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.jwt() ->> 'sub' AND role = 'admin'
        )
    );

-- 캠페인 신청 정책
DROP POLICY IF EXISTS "Creators can manage their own applications" ON campaign_applications;
DROP POLICY IF EXISTS "Business users can view applications for their campaigns" ON campaign_applications;
DROP POLICY IF EXISTS "Business users can update applications for their campaigns" ON campaign_applications;

CREATE POLICY "Creators can manage their own applications" ON campaign_applications
    FOR ALL USING (
        creator_id = auth.jwt() ->> 'sub'
    );

CREATE POLICY "Business users can view applications for their campaigns" ON campaign_applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM campaigns 
            WHERE id = campaign_id AND business_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Business users can update applications for their campaigns" ON campaign_applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM campaigns 
            WHERE id = campaign_id AND business_id = auth.jwt() ->> 'sub'
        )
    );

-- 결제 정책
DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
DROP POLICY IF EXISTS "Business users can create payments" ON payments;
DROP POLICY IF EXISTS "Admins can manage all payments" ON payments;

CREATE POLICY "Users can view their own payments" ON payments
    FOR SELECT USING (
        creator_id = auth.jwt() ->> 'sub' OR business_id = auth.jwt() ->> 'sub'
    );

CREATE POLICY "Business users can create payments" ON payments
    FOR INSERT WITH CHECK (
        business_id = auth.jwt() ->> 'sub'
    );

CREATE POLICY "Admins can manage all payments" ON payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.jwt() ->> 'sub' AND role = 'admin'
        )
    );

-- 8. 추천 코드 생성 함수 개선
CREATE OR REPLACE FUNCTION generate_unique_referral_code()
RETURNS TEXT AS $$
DECLARE
    v_code TEXT;
    v_exists BOOLEAN;
BEGIN
    LOOP
        -- 랜덤 8자리 코드 생성 (대문자 + 숫자)
        v_code := UPPER(
            SUBSTRING(MD5(RANDOM()::TEXT), 1, 4) || 
            SUBSTRING(MD5(RANDOM()::TEXT), 1, 4)
        );
        
        -- 중복 확인
        SELECT EXISTS(SELECT 1 FROM profiles WHERE referral_code = v_code) INTO v_exists;
        
        -- 중복이 아니면 반환
        IF NOT v_exists THEN
            RETURN v_code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 9. 프로필 생성 함수 (추천 코드 처리 포함)
CREATE OR REPLACE FUNCTION create_profile_with_referral(
    p_user_id TEXT,  -- Clerk User ID
    p_email TEXT,
    p_full_name TEXT DEFAULT NULL,
    p_role user_role DEFAULT 'creator',
    p_referral_code TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
    v_referrer_profile RECORD;
    v_new_referral_code TEXT;
    v_result TEXT;
BEGIN
    -- 고유한 추천 코드 생성
    v_new_referral_code := generate_unique_referral_code();
    
    -- 추천인 코드가 제공된 경우
    IF p_referral_code IS NOT NULL THEN
        -- 추천인 정보 조회
        SELECT id, referrer_l1_id, referrer_l2_id
        INTO v_referrer_profile
        FROM profiles
        WHERE referral_code = UPPER(p_referral_code);
        
        IF v_referrer_profile.id IS NOT NULL THEN
            -- 추천 체인 구성하여 프로필 생성
            INSERT INTO profiles (
                id, email, full_name, role, referral_code,
                referrer_l1_id, referrer_l2_id, referrer_l3_id,
                created_at, updated_at
            ) VALUES (
                p_user_id, p_email, p_full_name, p_role, v_new_referral_code,
                v_referrer_profile.id,
                v_referrer_profile.referrer_l1_id,
                v_referrer_profile.referrer_l2_id,
                NOW(), NOW()
            );
            
            v_result := 'Profile created with referral chain';
        ELSE
            -- 유효하지 않은 추천 코드인 경우 추천인 없이 생성
            INSERT INTO profiles (
                id, email, full_name, role, referral_code,
                created_at, updated_at
            ) VALUES (
                p_user_id, p_email, p_full_name, p_role, v_new_referral_code,
                NOW(), NOW()
            );
            
            v_result := 'Profile created without referral (invalid code)';
        END IF;
    ELSE
        -- 추천 코드 없이 프로필 생성
        INSERT INTO profiles (
            id, email, full_name, role, referral_code,
            created_at, updated_at
        ) VALUES (
            p_user_id, p_email, p_full_name, p_role, v_new_referral_code,
            NOW(), NOW()
        );
        
        v_result := 'Profile created without referral';
    END IF;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- 10. 관리자 프로필 생성 함수 업데이트
CREATE OR REPLACE FUNCTION create_admin_profile(
    p_user_id TEXT,  -- Clerk User ID
    p_email TEXT,
    p_full_name TEXT DEFAULT 'Admin User'
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO profiles (
        id, email, full_name, role, referral_code
    ) VALUES (
        p_user_id, p_email, p_full_name, 'admin', 
        'ADMIN' || UPPER(SUBSTRING(p_user_id, 1, 6))
    )
    ON CONFLICT (id) DO UPDATE SET
        role = 'admin',
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- 11. 뷰 재생성 (타입 변경 반영)
DROP VIEW IF EXISTS user_referral_stats;

CREATE VIEW user_referral_stats AS
SELECT 
    p.id,
    p.full_name,
    p.referral_code,
    COUNT(DISTINCT r1.id) as level1_referrals,
    COUNT(DISTINCT r2.id) as level2_referrals,
    COUNT(DISTINCT r3.id) as level3_referrals,
    COUNT(DISTINCT r1.id) + COUNT(DISTINCT r2.id) + COUNT(DISTINCT r3.id) as total_referrals,
    COALESCE(SUM(re.amount), 0) as total_earnings,
    COALESCE(SUM(CASE WHEN re.status = 'paid' THEN re.amount ELSE 0 END), 0) as paid_earnings,
    COALESCE(SUM(CASE WHEN re.status = 'pending' THEN re.amount ELSE 0 END), 0) as pending_earnings
FROM profiles p
LEFT JOIN profiles r1 ON r1.referrer_l1_id = p.id
LEFT JOIN profiles r2 ON r2.referrer_l2_id = p.id
LEFT JOIN profiles r3 ON r3.referrer_l3_id = p.id
LEFT JOIN referral_earnings re ON re.referrer_id = p.id
GROUP BY p.id, p.full_name, p.referral_code;

-- 12. 외래 키 제약조건 재생성 (TEXT 타입으로)
ALTER TABLE profiles 
    ADD CONSTRAINT profiles_referrer_l1_id_fkey 
    FOREIGN KEY (referrer_l1_id) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE profiles 
    ADD CONSTRAINT profiles_referrer_l2_id_fkey 
    FOREIGN KEY (referrer_l2_id) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE profiles 
    ADD CONSTRAINT profiles_referrer_l3_id_fkey 
    FOREIGN KEY (referrer_l3_id) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE referral_earnings 
    ADD CONSTRAINT referral_earnings_referrer_id_fkey 
    FOREIGN KEY (referrer_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE referral_earnings 
    ADD CONSTRAINT referral_earnings_referred_id_fkey 
    FOREIGN KEY (referred_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE campaigns 
    ADD CONSTRAINT campaigns_business_id_fkey 
    FOREIGN KEY (business_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE campaign_applications 
    ADD CONSTRAINT campaign_applications_creator_id_fkey 
    FOREIGN KEY (creator_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE campaign_applications 
    ADD CONSTRAINT campaign_applications_reviewer_id_fkey 
    FOREIGN KEY (reviewer_id) REFERENCES profiles(id);

ALTER TABLE payments 
    ADD CONSTRAINT payments_creator_id_fkey 
    FOREIGN KEY (creator_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE payments 
    ADD CONSTRAINT payments_business_id_fkey 
    FOREIGN KEY (business_id) REFERENCES profiles(id) ON DELETE CASCADE;
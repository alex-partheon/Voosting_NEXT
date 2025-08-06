-- Phase 4: Database Schema Update - 3-Tier Referral System Optimization
-- Optimize 3-tier referral system table structure and functions
-- Add performance indexes for referral queries
-- Update referral calculation functions for new UUID system

-- 1. Update referral commission rates to correct values (10%, 5%, 2%)
CREATE OR REPLACE FUNCTION create_referral_earnings(
    p_referred_id UUID,
    p_amount DECIMAL(10,2),
    p_campaign_id UUID DEFAULT NULL,
    p_payment_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_profile RECORD;
    v_commission_rates DECIMAL[] := ARRAY[0.10, 0.05, 0.02]; -- Updated: 10%, 5%, 2%
BEGIN
    -- Get referral chain for the referred user
    SELECT referrer_l1_id, referrer_l2_id, referrer_l3_id
    INTO v_profile
    FROM profiles
    WHERE id = p_referred_id;
    
    -- Level 1 referrer earns 10%
    IF v_profile.referrer_l1_id IS NOT NULL THEN
        INSERT INTO referral_earnings (
            referrer_id, referred_id, level, commission_rate, amount, campaign_id, payment_id
        ) VALUES (
            v_profile.referrer_l1_id, p_referred_id, 1, 
            v_commission_rates[1], p_amount * v_commission_rates[1], 
            p_campaign_id, p_payment_id
        );
    END IF;
    
    -- Level 2 referrer earns 5%
    IF v_profile.referrer_l2_id IS NOT NULL THEN
        INSERT INTO referral_earnings (
            referrer_id, referred_id, level, commission_rate, amount, campaign_id, payment_id
        ) VALUES (
            v_profile.referrer_l2_id, p_referred_id, 2, 
            v_commission_rates[2], p_amount * v_commission_rates[2], 
            p_campaign_id, p_payment_id
        );
    END IF;
    
    -- Level 3 referrer earns 2%
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

-- 2. Update trigger function for UUID compatibility
CREATE OR REPLACE FUNCTION trigger_create_referral_earnings()
RETURNS TRIGGER AS $$
BEGIN
    -- Only trigger when payment status changes to 'completed'
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
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

-- 3. Recreate trigger with new function
DROP TRIGGER IF EXISTS payments_create_referral_earnings ON payments;
CREATE TRIGGER payments_create_referral_earnings
    AFTER UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_create_referral_earnings();

-- 4. Update referral code generation function
CREATE OR REPLACE FUNCTION generate_referral_code(user_id UUID)
RETURNS VARCHAR(10) AS $$
DECLARE
    code VARCHAR(10);
    exists_count INTEGER;
    attempt_count INTEGER := 0;
    max_attempts INTEGER := 100;
BEGIN
    LOOP
        -- Generate 8-character code using user ID and timestamp
        code := UPPER(SUBSTRING(MD5(user_id::TEXT || EXTRACT(EPOCH FROM NOW())::TEXT || attempt_count::TEXT) FROM 1 FOR 8));
        
        -- Check for duplicates
        SELECT COUNT(*) INTO exists_count
        FROM profiles
        WHERE referral_code = code;
        
        -- Exit if unique code found
        IF exists_count = 0 THEN
            RETURN code;
        END IF;
        
        -- Prevent infinite loop
        attempt_count := attempt_count + 1;
        IF attempt_count >= max_attempts THEN
            RAISE EXCEPTION 'Unable to generate unique referral code after % attempts', max_attempts;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 5. Create function to set up referral relationships
CREATE OR REPLACE FUNCTION setup_referral_chain(
    new_user_id UUID,
    referral_code_input TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    referrer_record RECORD;
BEGIN
    -- Find the referrer by code
    SELECT id, referrer_l1_id, referrer_l2_id
    INTO referrer_record
    FROM profiles
    WHERE referral_code = UPPER(referral_code_input);

    -- Return false if referrer not found
    IF referrer_record.id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Update the new user's referral chain
    UPDATE profiles
    SET 
        referrer_l1_id = referrer_record.id,                    -- Direct referrer (10%)
        referrer_l2_id = referrer_record.referrer_l1_id,        -- L2 referrer (5%)
        referrer_l3_id = referrer_record.referrer_l2_id,        -- L3 referrer (2%)
        updated_at = NOW()
    WHERE id = new_user_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 6. Create comprehensive referral analytics view
DROP VIEW IF EXISTS user_referral_stats;
CREATE VIEW user_referral_stats AS
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.referral_code,
    p.role,
    
    -- Direct referral counts
    COUNT(DISTINCT r1.id) as level1_referrals,
    COUNT(DISTINCT r2.id) as level2_referrals,
    COUNT(DISTINCT r3.id) as level3_referrals,
    COUNT(DISTINCT r1.id) + COUNT(DISTINCT r2.id) + COUNT(DISTINCT r3.id) as total_referrals,
    
    -- Earnings breakdown
    COALESCE(SUM(CASE WHEN re.level = 1 THEN re.amount ELSE 0 END), 0) as level1_earnings,
    COALESCE(SUM(CASE WHEN re.level = 2 THEN re.amount ELSE 0 END), 0) as level2_earnings,
    COALESCE(SUM(CASE WHEN re.level = 3 THEN re.amount ELSE 0 END), 0) as level3_earnings,
    COALESCE(SUM(re.amount), 0) as total_earnings,
    
    -- Status breakdown
    COALESCE(SUM(CASE WHEN re.status = 'paid' THEN re.amount ELSE 0 END), 0) as paid_earnings,
    COALESCE(SUM(CASE WHEN re.status = 'pending' THEN re.amount ELSE 0 END), 0) as pending_earnings,
    
    -- Performance metrics
    CASE 
        WHEN COUNT(DISTINCT r1.id) = 0 THEN 0 
        ELSE COALESCE(SUM(CASE WHEN re.level = 1 THEN re.amount ELSE 0 END), 0) / COUNT(DISTINCT r1.id) 
    END as avg_earnings_per_referral,
    
    p.created_at,
    p.updated_at

FROM profiles p
LEFT JOIN profiles r1 ON r1.referrer_l1_id = p.id
LEFT JOIN profiles r2 ON r2.referrer_l2_id = p.id
LEFT JOIN profiles r3 ON r3.referrer_l3_id = p.id
LEFT JOIN referral_earnings re ON re.referrer_id = p.id
GROUP BY p.id, p.email, p.full_name, p.referral_code, p.role, p.created_at, p.updated_at;

-- 7. Create referral network depth view
CREATE VIEW referral_network_depth AS
WITH RECURSIVE referral_tree AS (
    -- Base case: users with no referrer (top level)
    SELECT 
        id,
        referral_code,
        full_name,
        referrer_l1_id,
        0 as depth,
        ARRAY[id] as path
    FROM profiles
    WHERE referrer_l1_id IS NULL
    
    UNION ALL
    
    -- Recursive case: users with referrers
    SELECT 
        p.id,
        p.referral_code,
        p.full_name,
        p.referrer_l1_id,
        rt.depth + 1,
        rt.path || p.id
    FROM profiles p
    JOIN referral_tree rt ON p.referrer_l1_id = rt.id
    WHERE NOT p.id = ANY(rt.path) -- Prevent cycles
)
SELECT 
    id,
    referral_code,
    full_name,
    depth,
    array_length(path, 1) as path_length
FROM referral_tree;

-- 8. Create performance indexes for referral queries
CREATE INDEX IF NOT EXISTS idx_referral_earnings_level ON referral_earnings(level);
CREATE INDEX IF NOT EXISTS idx_referral_earnings_status ON referral_earnings(status);
CREATE INDEX IF NOT EXISTS idx_referral_earnings_created_at ON referral_earnings(created_at);
CREATE INDEX IF NOT EXISTS idx_referral_earnings_amount ON referral_earnings(amount);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_referral_earnings_referrer_level ON referral_earnings(referrer_id, level);
CREATE INDEX IF NOT EXISTS idx_referral_earnings_referrer_status ON referral_earnings(referrer_id, status);
CREATE INDEX IF NOT EXISTS idx_profiles_referrer_composite ON profiles(referrer_l1_id, referrer_l2_id, referrer_l3_id);

-- 9. Create function to calculate total commission impact
CREATE OR REPLACE FUNCTION calculate_total_commission_impact(base_amount DECIMAL(10,2))
RETURNS TABLE(
    level INTEGER,
    commission_rate DECIMAL(5,2),
    commission_amount DECIMAL(10,2),
    remaining_amount DECIMAL(10,2)
) AS $$
DECLARE
    rates DECIMAL[] := ARRAY[0.10, 0.05, 0.02]; -- 10%, 5%, 2%
    remaining DECIMAL(10,2) := base_amount;
    i INTEGER;
BEGIN
    FOR i IN 1..3 LOOP
        level := i;
        commission_rate := rates[i];
        commission_amount := base_amount * rates[i];
        remaining := remaining - commission_amount;
        remaining_amount := remaining;
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 10. Create function for referral performance analytics
CREATE OR REPLACE FUNCTION get_referral_performance(user_id UUID, days INTEGER DEFAULT 30)
RETURNS TABLE(
    metric_name TEXT,
    metric_value DECIMAL(10,2),
    metric_description TEXT
) AS $$
BEGIN
    -- Total earnings in period
    RETURN QUERY
    SELECT 
        'total_earnings'::TEXT,
        COALESCE(SUM(amount), 0),
        'Total referral earnings in last ' || days || ' days'
    FROM referral_earnings
    WHERE referrer_id = user_id
    AND created_at >= NOW() - INTERVAL '1 day' * days;

    -- New referrals in period
    RETURN QUERY
    SELECT 
        'new_referrals'::TEXT,
        COUNT(*)::DECIMAL(10,2),
        'New referrals in last ' || days || ' days'
    FROM profiles
    WHERE referrer_l1_id = user_id
    AND created_at >= NOW() - INTERVAL '1 day' * days;

    -- Average earnings per referral
    RETURN QUERY
    SELECT 
        'avg_earnings_per_referral'::TEXT,
        CASE 
            WHEN COUNT(DISTINCT referred_id) = 0 THEN 0 
            ELSE SUM(amount) / COUNT(DISTINCT referred_id) 
        END,
        'Average earnings per referral'
    FROM referral_earnings
    WHERE referrer_id = user_id;

    -- Commission by level
    FOR level IN 1..3 LOOP
        RETURN QUERY
        SELECT 
            ('level_' || level || '_earnings')::TEXT,
            COALESCE(SUM(amount), 0),
            ('Level ' || level || ' referral earnings')::TEXT
        FROM referral_earnings
        WHERE referrer_id = user_id AND level = get_referral_performance.level;
    END LOOP;

END;
$$ LANGUAGE plpgsql;

-- 11. Create validation function for referral system integrity
CREATE OR REPLACE FUNCTION validate_referral_system()
RETURNS TABLE(check_name TEXT, status TEXT, details TEXT) AS $$
BEGIN
    -- Check for circular references
    RETURN QUERY
    SELECT 
        'Circular Reference Check'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'Profiles with circular referrals: ' || COUNT(*)::TEXT
    FROM profiles p
    WHERE p.id = p.referrer_l1_id 
       OR p.id = p.referrer_l2_id 
       OR p.id = p.referrer_l3_id;

    -- Check referral chain consistency
    RETURN QUERY
    SELECT 
        'Referral Chain Consistency'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'Inconsistent referral chains: ' || COUNT(*)::TEXT
    FROM profiles p
    LEFT JOIN profiles r1 ON p.referrer_l1_id = r1.id
    WHERE p.referrer_l2_id IS NOT NULL 
      AND p.referrer_l2_id != r1.referrer_l1_id;

    -- Check commission rate accuracy
    RETURN QUERY
    SELECT 
        'Commission Rate Accuracy'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'Incorrect commission rates: ' || COUNT(*)::TEXT
    FROM referral_earnings
    WHERE (level = 1 AND commission_rate != 0.10)
       OR (level = 2 AND commission_rate != 0.05)
       OR (level = 3 AND commission_rate != 0.02);

    -- Check referral code uniqueness
    RETURN QUERY
    SELECT 
        'Referral Code Uniqueness'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'Duplicate referral codes: ' || COUNT(*)::TEXT
    FROM (
        SELECT referral_code
        FROM profiles
        GROUP BY referral_code
        HAVING COUNT(*) > 1
    ) duplicates;

END;
$$ LANGUAGE plpgsql;

-- 12. Run validation
SELECT * FROM validate_referral_system();

-- 13. Update user migration mapping table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_migration_mapping') THEN
        -- Update mapping table to use UUID
        ALTER TABLE user_migration_mapping 
        ALTER COLUMN supabase_user_id TYPE UUID USING supabase_user_id::UUID;
        
        -- Add validation function for migration mapping
        CREATE OR REPLACE FUNCTION validate_migration_mapping()
        RETURNS TABLE(check_name TEXT, status TEXT, details TEXT) AS $$
        BEGIN
            RETURN QUERY
            SELECT 
                'Migration Mapping Completeness'::TEXT,
                CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
                'Profiles without migration mapping: ' || COUNT(*)::TEXT
            FROM profiles p
            LEFT JOIN user_migration_mapping umm ON p.id = umm.supabase_user_id
            WHERE umm.supabase_user_id IS NULL;
        END;
        $$ LANGUAGE plpgsql;
    END IF;
END $$;

COMMENT ON FUNCTION create_referral_earnings IS 'Updated to use correct commission rates: 10%, 5%, 2%';
COMMENT ON FUNCTION setup_referral_chain IS 'Sets up 3-tier referral chain for new users';
COMMENT ON VIEW user_referral_stats IS 'Comprehensive referral statistics with earnings breakdown';
COMMENT ON VIEW referral_network_depth IS 'Shows referral network depth and prevents circular references';
COMMENT ON FUNCTION get_referral_performance IS 'Returns referral performance metrics for a user';
COMMENT ON FUNCTION validate_referral_system IS 'Validates referral system integrity and consistency';
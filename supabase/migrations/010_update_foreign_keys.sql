-- Phase 4: Database Schema Update - Foreign Key Updates
-- Update all tables that reference profiles.id to use UUID
-- Ensure referential integrity is maintained

-- 1. Update referral_earnings table
-- First, add new UUID columns
ALTER TABLE referral_earnings ADD COLUMN new_referrer_id UUID;
ALTER TABLE referral_earnings ADD COLUMN new_referred_id UUID;

-- Update the new columns using the backup mapping
UPDATE referral_earnings re
SET 
    new_referrer_id = (SELECT id FROM profiles WHERE id::TEXT = re.referrer_id::TEXT),
    new_referred_id = (SELECT id FROM profiles WHERE id::TEXT = re.referred_id::TEXT);

-- Verify all mappings were successful
DO $$
DECLARE
    unmapped_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO unmapped_count
    FROM referral_earnings
    WHERE new_referrer_id IS NULL OR new_referred_id IS NULL;
    
    IF unmapped_count > 0 THEN
        RAISE EXCEPTION 'Found % unmapped referral earnings records', unmapped_count;
    END IF;
END $$;

-- Drop old columns and rename new ones
ALTER TABLE referral_earnings DROP COLUMN referrer_id;
ALTER TABLE referral_earnings DROP COLUMN referred_id;
ALTER TABLE referral_earnings RENAME COLUMN new_referrer_id TO referrer_id;
ALTER TABLE referral_earnings RENAME COLUMN new_referred_id TO referred_id;

-- Set NOT NULL constraints
ALTER TABLE referral_earnings ALTER COLUMN referrer_id SET NOT NULL;
ALTER TABLE referral_earnings ALTER COLUMN referred_id SET NOT NULL;

-- Recreate foreign key constraints
ALTER TABLE referral_earnings 
ADD CONSTRAINT referral_earnings_referrer_id_fkey 
FOREIGN KEY (referrer_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE referral_earnings 
ADD CONSTRAINT referral_earnings_referred_id_fkey 
FOREIGN KEY (referred_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 2. Update campaigns table
ALTER TABLE campaigns ADD COLUMN new_business_id UUID;

UPDATE campaigns c
SET new_business_id = (SELECT id FROM profiles WHERE id::TEXT = c.business_id::TEXT);

-- Verify mappings
DO $$
DECLARE
    unmapped_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO unmapped_count
    FROM campaigns
    WHERE new_business_id IS NULL;
    
    IF unmapped_count > 0 THEN
        RAISE EXCEPTION 'Found % unmapped campaigns records', unmapped_count;
    END IF;
END $$;

ALTER TABLE campaigns DROP COLUMN business_id;
ALTER TABLE campaigns RENAME COLUMN new_business_id TO business_id;
ALTER TABLE campaigns ALTER COLUMN business_id SET NOT NULL;

ALTER TABLE campaigns 
ADD CONSTRAINT campaigns_business_id_fkey 
FOREIGN KEY (business_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 3. Update campaign_applications table
ALTER TABLE campaign_applications ADD COLUMN new_creator_id UUID;
ALTER TABLE campaign_applications ADD COLUMN new_reviewer_id UUID;

UPDATE campaign_applications ca
SET 
    new_creator_id = (SELECT id FROM profiles WHERE id::TEXT = ca.creator_id::TEXT),
    new_reviewer_id = (SELECT id FROM profiles WHERE id::TEXT = ca.reviewer_id::TEXT);

-- Verify mappings (reviewer_id can be NULL)
DO $$
DECLARE
    unmapped_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO unmapped_count
    FROM campaign_applications
    WHERE new_creator_id IS NULL;
    
    IF unmapped_count > 0 THEN
        RAISE EXCEPTION 'Found % unmapped campaign_applications records', unmapped_count;
    END IF;
END $$;

ALTER TABLE campaign_applications DROP COLUMN creator_id;
ALTER TABLE campaign_applications DROP COLUMN reviewer_id;
ALTER TABLE campaign_applications RENAME COLUMN new_creator_id TO creator_id;
ALTER TABLE campaign_applications RENAME COLUMN new_reviewer_id TO reviewer_id;
ALTER TABLE campaign_applications ALTER COLUMN creator_id SET NOT NULL;

ALTER TABLE campaign_applications 
ADD CONSTRAINT campaign_applications_creator_id_fkey 
FOREIGN KEY (creator_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE campaign_applications 
ADD CONSTRAINT campaign_applications_reviewer_id_fkey 
FOREIGN KEY (reviewer_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- 4. Update payments table
ALTER TABLE payments ADD COLUMN new_creator_id UUID;
ALTER TABLE payments ADD COLUMN new_business_id UUID;

UPDATE payments p
SET 
    new_creator_id = (SELECT id FROM profiles WHERE id::TEXT = p.creator_id::TEXT),
    new_business_id = (SELECT id FROM profiles WHERE id::TEXT = p.business_id::TEXT);

-- Verify mappings
DO $$
DECLARE
    unmapped_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO unmapped_count
    FROM payments
    WHERE new_creator_id IS NULL OR new_business_id IS NULL;
    
    IF unmapped_count > 0 THEN
        RAISE EXCEPTION 'Found % unmapped payments records', unmapped_count;
    END IF;
END $$;

ALTER TABLE payments DROP COLUMN creator_id;
ALTER TABLE payments DROP COLUMN business_id;
ALTER TABLE payments RENAME COLUMN new_creator_id TO creator_id;
ALTER TABLE payments RENAME COLUMN new_business_id TO business_id;
ALTER TABLE payments ALTER COLUMN creator_id SET NOT NULL;
ALTER TABLE payments ALTER COLUMN business_id SET NOT NULL;

ALTER TABLE payments 
ADD CONSTRAINT payments_creator_id_fkey 
FOREIGN KEY (creator_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE payments 
ADD CONSTRAINT payments_business_id_fkey 
FOREIGN KEY (business_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 5. Update RLS policies for all related tables
-- Referral earnings policies
DROP POLICY IF EXISTS "Users can view their own referral earnings" ON referral_earnings;
DROP POLICY IF EXISTS "Admins can manage all referral earnings" ON referral_earnings;

CREATE POLICY "Users can view their own referral earnings" ON referral_earnings
    FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "Admins can manage all referral earnings" ON referral_earnings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Campaign policies
DROP POLICY IF EXISTS "Business users can manage their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "All users can view active campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admins can manage all campaigns" ON campaigns;

CREATE POLICY "Business users can manage their own campaigns" ON campaigns
    FOR ALL USING (auth.uid() = business_id);

CREATE POLICY "All users can view active campaigns" ON campaigns
    FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage all campaigns" ON campaigns
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Campaign applications policies
DROP POLICY IF EXISTS "Creators can manage their own applications" ON campaign_applications;
DROP POLICY IF EXISTS "Business users can view applications for their campaigns" ON campaign_applications;
DROP POLICY IF EXISTS "Business users can update applications for their campaigns" ON campaign_applications;

CREATE POLICY "Creators can manage their own applications" ON campaign_applications
    FOR ALL USING (auth.uid() = creator_id);

CREATE POLICY "Business users can view applications for their campaigns" ON campaign_applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM campaigns 
            WHERE id = campaign_id AND business_id = auth.uid()
        )
    );

CREATE POLICY "Business users can update applications for their campaigns" ON campaign_applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM campaigns 
            WHERE id = campaign_id AND business_id = auth.uid()
        )
    );

-- Payments policies
DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
DROP POLICY IF EXISTS "Business users can create payments" ON payments;
DROP POLICY IF EXISTS "Admins can manage all payments" ON payments;

CREATE POLICY "Users can view their own payments" ON payments
    FOR SELECT USING (auth.uid() = creator_id OR auth.uid() = business_id);

CREATE POLICY "Business users can create payments" ON payments
    FOR INSERT WITH CHECK (auth.uid() = business_id);

CREATE POLICY "Admins can manage all payments" ON payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 6. Update indexes for better performance
CREATE INDEX IF NOT EXISTS idx_referral_earnings_referrer_id ON referral_earnings(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_earnings_referred_id ON referral_earnings(referred_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_business_id ON campaigns(business_id);
CREATE INDEX IF NOT EXISTS idx_campaign_applications_creator_id ON campaign_applications(creator_id);
CREATE INDEX IF NOT EXISTS idx_campaign_applications_reviewer_id ON campaign_applications(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_payments_creator_id ON payments(creator_id);
CREATE INDEX IF NOT EXISTS idx_payments_business_id ON payments(business_id);

-- 7. Create validation function for foreign key integrity
CREATE OR REPLACE FUNCTION validate_foreign_key_integrity()
RETURNS TABLE(table_name TEXT, check_name TEXT, status TEXT, details TEXT) AS $$
BEGIN
    -- Check referral_earnings referential integrity
    RETURN QUERY
    SELECT 
        'referral_earnings'::TEXT,
        'Referrer ID Integrity'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'Orphaned referrer records: ' || COUNT(*)::TEXT
    FROM referral_earnings re
    LEFT JOIN profiles p ON re.referrer_id = p.id
    WHERE p.id IS NULL;

    RETURN QUERY
    SELECT 
        'referral_earnings'::TEXT,
        'Referred ID Integrity'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'Orphaned referred records: ' || COUNT(*)::TEXT
    FROM referral_earnings re
    LEFT JOIN profiles p ON re.referred_id = p.id
    WHERE p.id IS NULL;

    -- Check campaigns referential integrity
    RETURN QUERY
    SELECT 
        'campaigns'::TEXT,
        'Business ID Integrity'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'Orphaned business records: ' || COUNT(*)::TEXT
    FROM campaigns c
    LEFT JOIN profiles p ON c.business_id = p.id
    WHERE p.id IS NULL;

    -- Check campaign_applications referential integrity
    RETURN QUERY
    SELECT 
        'campaign_applications'::TEXT,
        'Creator ID Integrity'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'Orphaned creator records: ' || COUNT(*)::TEXT
    FROM campaign_applications ca
    LEFT JOIN profiles p ON ca.creator_id = p.id
    WHERE p.id IS NULL;

    -- Check payments referential integrity
    RETURN QUERY
    SELECT 
        'payments'::TEXT,
        'Creator ID Integrity'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'Orphaned creator records: ' || COUNT(*)::TEXT
    FROM payments pay
    LEFT JOIN profiles p ON pay.creator_id = p.id
    WHERE p.id IS NULL;

    RETURN QUERY
    SELECT 
        'payments'::TEXT,
        'Business ID Integrity'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'Orphaned business records: ' || COUNT(*)::TEXT
    FROM payments pay
    LEFT JOIN profiles p ON pay.business_id = p.id
    WHERE p.id IS NULL;

END;
$$ LANGUAGE plpgsql;

-- 8. Run validation
SELECT * FROM validate_foreign_key_integrity();

-- 9. Clean up backup table
DROP TABLE IF EXISTS profiles_backup;

COMMENT ON TABLE referral_earnings IS 'Updated to use UUID foreign keys referencing profiles(id)';
COMMENT ON TABLE campaigns IS 'Updated to use UUID foreign keys referencing profiles(id)';
COMMENT ON TABLE campaign_applications IS 'Updated to use UUID foreign keys referencing profiles(id)';
COMMENT ON TABLE payments IS 'Updated to use UUID foreign keys referencing profiles(id)';
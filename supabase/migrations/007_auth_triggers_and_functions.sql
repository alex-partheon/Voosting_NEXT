-- Migration: Supabase Auth Triggers and Functions
-- 
-- This migration creates triggers and functions for automatic profile creation
-- when users sign up through Supabase Auth
-- Created: 2025-01-05
-- Purpose: Phase 2 of Clerk → Supabase Auth migration

-- =========================================
-- 1. REFERRAL CODE GENERATION FUNCTION
-- =========================================

-- Function to generate unique referral codes
CREATE OR REPLACE FUNCTION generate_referral_code(user_id UUID DEFAULT NULL)
RETURNS VARCHAR(10)
LANGUAGE plpgsql
AS $$
DECLARE
  code VARCHAR(10);
  exists_count INTEGER;
  base_string TEXT;
BEGIN
  -- Use provided user_id or generate random base
  IF user_id IS NOT NULL THEN
    base_string := user_id::TEXT;
  ELSE
    base_string := gen_random_uuid()::TEXT;
  END IF;
  
  LOOP
    -- Generate 8-character uppercase code
    code := UPPER(SUBSTRING(MD5(base_string || EXTRACT(EPOCH FROM NOW())::TEXT) FROM 1 FOR 8));
    
    -- Check for duplicates
    SELECT COUNT(*) INTO exists_count
    FROM profiles
    WHERE referral_code = code;
    
    -- If unique, return the code
    IF exists_count = 0 THEN
      RETURN code;
    END IF;
    
    -- If duplicate, modify base_string for next iteration
    base_string := base_string || random()::TEXT;
  END LOOP;
END;
$$;

-- =========================================
-- 2. REFERRAL RELATIONSHIP FUNCTION
-- =========================================

-- Function to set up 3-tier referral relationships
CREATE OR REPLACE FUNCTION set_referral_relationship(
  new_user_id UUID,
  referral_code TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  referrer_record RECORD;
BEGIN
  -- Find the referrer by their referral code
  SELECT id, referrer_l1_id, referrer_l2_id
  INTO referrer_record
  FROM profiles
  WHERE profiles.referral_code = set_referral_relationship.referral_code;

  -- If referrer doesn't exist, return false
  IF referrer_record.id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Update the new user's referral chain (3-tier system)
  UPDATE profiles
  SET 
    referrer_l1_id = referrer_record.id,                    -- 1st tier (10%)
    referrer_l2_id = referrer_record.referrer_l1_id,        -- 2nd tier (5%)
    referrer_l3_id = referrer_record.referrer_l2_id,        -- 3rd tier (2%)
    updated_at = NOW()
  WHERE id = new_user_id;

  RETURN TRUE;
END;
$$;

-- =========================================
-- 3. AUTO PROFILE CREATION FUNCTION
-- =========================================

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_role TEXT := 'creator'; -- Default role
  display_name TEXT;
  referred_by TEXT;
  referral_code_generated TEXT;
BEGIN
  -- Extract user metadata
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'creator');
  display_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );
  referred_by := NEW.raw_user_meta_data->>'referred_by';

  -- Generate unique referral code
  referral_code_generated := generate_referral_code(NEW.id);

  -- Insert new profile
  INSERT INTO public.profiles (
    id,
    email,
    role,
    display_name,
    referral_code,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    user_role,
    display_name,
    referral_code_generated,
    NOW(),
    NOW()
  );

  -- Set up referral relationship if referred_by code is provided
  IF referred_by IS NOT NULL AND referred_by != '' THEN
    PERFORM set_referral_relationship(NEW.id, referred_by);
  END IF;

  RETURN NEW;
END;
$$;

-- =========================================
-- 4. PROFILE UPDATE TIMESTAMP FUNCTION
-- =========================================

-- Function to automatically update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- =========================================
-- 5. CREATE TRIGGERS
-- =========================================

-- Trigger for automatic profile creation on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger for updating 'updated_at' timestamp on profile changes
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for updating 'updated_at' timestamp on campaigns changes
DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for updating 'updated_at' timestamp on earnings changes
DROP TRIGGER IF EXISTS update_earnings_updated_at ON earnings;
CREATE TRIGGER update_earnings_updated_at
  BEFORE UPDATE ON earnings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- 6. EARNINGS CALCULATION FUNCTIONS
-- =========================================

-- Function to calculate referral earnings for a campaign completion
CREATE OR REPLACE FUNCTION calculate_referral_earnings(
  creator_id UUID,
  base_amount DECIMAL
)
RETURNS TABLE(
  level INTEGER,
  referrer_id UUID,
  amount DECIMAL
)
LANGUAGE plpgsql
AS $$
DECLARE
  creator_profile RECORD;
BEGIN
  -- Get creator's referral chain
  SELECT referrer_l1_id, referrer_l2_id, referrer_l3_id
  INTO creator_profile
  FROM profiles
  WHERE id = creator_id;

  -- Level 1 referrer (10%)
  IF creator_profile.referrer_l1_id IS NOT NULL THEN
    RETURN QUERY SELECT 1, creator_profile.referrer_l1_id, base_amount * 0.10;
  END IF;

  -- Level 2 referrer (5%)
  IF creator_profile.referrer_l2_id IS NOT NULL THEN
    RETURN QUERY SELECT 2, creator_profile.referrer_l2_id, base_amount * 0.05;
  END IF;

  -- Level 3 referrer (2%)
  IF creator_profile.referrer_l3_id IS NOT NULL THEN
    RETURN QUERY SELECT 3, creator_profile.referrer_l3_id, base_amount * 0.02;
  END IF;
END;
$$;

-- =========================================
-- 7. PROFILE VALIDATION FUNCTIONS
-- =========================================

-- Function to validate profile data
CREATE OR REPLACE FUNCTION validate_profile_data()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validate email format
  IF NEW.email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format: %', NEW.email;
  END IF;

  -- Validate role
  IF NEW.role NOT IN ('creator', 'business', 'admin') THEN
    RAISE EXCEPTION 'Invalid role: %. Must be creator, business, or admin', NEW.role;
  END IF;

  -- Validate referral code format (8 uppercase alphanumeric)
  IF NEW.referral_code !~* '^[A-Z0-9]{8}$' THEN
    RAISE EXCEPTION 'Invalid referral code format: %. Must be 8 uppercase alphanumeric characters', NEW.referral_code;
  END IF;

  -- Ensure display_name is not empty
  IF NEW.display_name IS NULL OR trim(NEW.display_name) = '' THEN
    NEW.display_name := split_part(NEW.email, '@', 1);
  END IF;

  RETURN NEW;
END;
$$;

-- Create validation trigger
DROP TRIGGER IF EXISTS validate_profile_before_insert_update ON profiles;
CREATE TRIGGER validate_profile_before_insert_update
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_profile_data();

-- =========================================
-- 8. GRANT PERMISSIONS
-- =========================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION generate_referral_code(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION set_referral_relationship(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_referral_earnings(UUID, DECIMAL) TO authenticated;

-- Grant usage on sequences (if any exist)
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =========================================
-- 9. VERIFICATION COMMENTS
-- =========================================

-- Manual verification queries (run these after migration):
-- 
-- 1. Test profile creation:
-- INSERT INTO auth.users (id, email, raw_user_meta_data) 
-- VALUES (gen_random_uuid(), 'test@example.com', '{"role": "creator", "display_name": "Test User"}');
--
-- 2. Verify profile was created:
-- SELECT * FROM profiles WHERE email = 'test@example.com';
--
-- 3. Test referral code generation:
-- SELECT generate_referral_code();
--
-- 4. Test referral relationship:
-- SELECT set_referral_relationship('user-id', 'REFCODE1');
--
-- 5. Test earnings calculation:
-- SELECT * FROM calculate_referral_earnings('creator-id', 100.00);

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile when a new user signs up via Supabase Auth';
COMMENT ON FUNCTION generate_referral_code(UUID) IS 'Generates a unique 8-character referral code for users';
COMMENT ON FUNCTION set_referral_relationship(UUID, TEXT) IS 'Sets up 3-tier referral relationships when users sign up with a referral code';
COMMENT ON FUNCTION calculate_referral_earnings(UUID, DECIMAL) IS 'Calculates referral earnings (10%, 5%, 2%) for a given creator and amount';
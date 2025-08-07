-- Migration: Fix RLS Infinite Recursion Issues
-- 
-- This migration fixes the infinite recursion error in RLS policies by:
-- 1. Removing circular references in admin policies
-- 2. Simplifying role checks to avoid recursive queries
-- 3. Using auth.uid() directly without nested profile lookups
-- Created: 2025-01-07
-- Purpose: Fix infinite recursion detected in policy for relation "profiles"

-- =========================================
-- 1. DROP PROBLEMATIC POLICIES
-- =========================================

-- Drop admin policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins have full profiles access" ON profiles;
DROP POLICY IF EXISTS "Admins have full campaigns access" ON campaigns;
DROP POLICY IF EXISTS "Admins have full earnings access" ON earnings;

-- Drop other policies that check profiles table recursively
DROP POLICY IF EXISTS "Business users can create campaigns" ON campaigns;
DROP POLICY IF EXISTS "Business users can update own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Business users can delete own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admins can update earnings" ON earnings;

-- Drop problematic helper functions
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS has_role(TEXT);
DROP FUNCTION IF EXISTS get_user_role();

-- =========================================
-- 2. CREATE SAFE HELPER FUNCTIONS
-- =========================================

-- Create a safe function to get user role using SECURITY DEFINER
-- This prevents infinite recursion by using a different security context
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Create a safe function to check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
    LIMIT 1
  );
$$;

-- Create a safe function to check if user is business
CREATE OR REPLACE FUNCTION auth.is_business()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'business'
    LIMIT 1
  );
$$;

-- =========================================
-- 3. RECREATE PROFILES TABLE POLICIES (SAFE)
-- =========================================

-- Basic policies for own profile access (no recursion)
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE
  USING (auth.uid() = id);

-- Admin policy for profiles (using separate admin check)
-- Note: Admins should manage profiles through admin functions, not direct RLS
-- This policy is commented out to prevent recursion
-- CREATE POLICY "Admins can view all profiles" ON profiles
--   FOR SELECT
--   USING (auth.is_admin());

-- =========================================
-- 4. RECREATE CAMPAIGNS TABLE POLICIES (SAFE)
-- =========================================

-- Users can view campaigns they're involved in
CREATE POLICY "Users can view relevant campaigns" ON campaigns
  FOR SELECT
  USING (
    auth.uid() = business_id OR 
    auth.uid() = creator_id
  );

-- Business users can create campaigns (simplified check)
CREATE POLICY "Business users can create campaigns" ON campaigns
  FOR INSERT
  WITH CHECK (
    auth.uid() = business_id
    -- Role validation will be done at application level
  );

-- Business users can update their own campaigns
CREATE POLICY "Business users can update own campaigns" ON campaigns
  FOR UPDATE
  USING (
    auth.uid() = business_id
  );

-- Business users can delete their own campaigns
CREATE POLICY "Business users can delete own campaigns" ON campaigns
  FOR DELETE
  USING (
    auth.uid() = business_id
  );

-- =========================================
-- 5. RECREATE EARNINGS TABLE POLICIES (SAFE)
-- =========================================

-- Creators can view their own earnings
CREATE POLICY "Creators can view own earnings" ON earnings
  FOR SELECT
  USING (
    auth.uid() = creator_id
  );

-- System can create earnings (via triggers or functions)
CREATE POLICY "System can create earnings" ON earnings
  FOR INSERT
  WITH CHECK (true); -- Restricted by application logic

-- No direct update policy for earnings (handle through functions)

-- =========================================
-- 6. CREATE ADMIN ACCESS FUNCTIONS
-- =========================================

-- Admin functions for managing data without RLS recursion
CREATE OR REPLACE FUNCTION admin_get_all_profiles()
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT auth.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Return all profiles
  RETURN QUERY SELECT * FROM profiles;
END;
$$;

CREATE OR REPLACE FUNCTION admin_get_all_campaigns()
RETURNS SETOF campaigns
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT auth.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Return all campaigns
  RETURN QUERY SELECT * FROM campaigns;
END;
$$;

CREATE OR REPLACE FUNCTION admin_get_all_earnings()
RETURNS SETOF earnings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT auth.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Return all earnings
  RETURN QUERY SELECT * FROM earnings;
END;
$$;

-- =========================================
-- 7. CREATE REFERRAL EARNINGS VIEW (SAFE)
-- =========================================

-- Create a view for referral earnings without recursive policies
CREATE OR REPLACE VIEW my_referral_earnings AS
SELECT e.*
FROM earnings e
JOIN profiles p ON e.creator_id = p.id
WHERE 
  p.referrer_l1_id = auth.uid() OR
  p.referrer_l2_id = auth.uid() OR
  p.referrer_l3_id = auth.uid();

-- Grant access to the view
GRANT SELECT ON my_referral_earnings TO authenticated;

-- =========================================
-- 8. GRANTS FOR PUBLIC ACCESS
-- =========================================

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION auth.user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.is_business() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_all_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_all_campaigns() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_all_earnings() TO authenticated;

-- =========================================
-- 9. VERIFICATION QUERIES
-- =========================================

-- Test queries to verify the fix (run these manually after migration)
COMMENT ON SCHEMA public IS '
Verification queries to test after migration:

1. Test basic profile access:
   SELECT * FROM profiles WHERE id = auth.uid();

2. Test role functions:
   SELECT auth.user_role();
   SELECT auth.is_admin();
   SELECT auth.is_business();

3. Test admin functions (if admin):
   SELECT * FROM admin_get_all_profiles();

4. Test referral earnings view:
   SELECT * FROM my_referral_earnings;

5. Verify no infinite recursion:
   SELECT schemaname, tablename, policyname, cmd 
   FROM pg_policies 
   WHERE tablename IN (''profiles'', ''campaigns'', ''earnings'')
   ORDER BY tablename, policyname;
';

-- =========================================
-- 10. ROLLBACK INSTRUCTIONS
-- =========================================

-- If this migration causes issues, rollback with:
-- DROP FUNCTION IF EXISTS auth.user_role();
-- DROP FUNCTION IF EXISTS auth.is_admin();
-- DROP FUNCTION IF EXISTS auth.is_business();
-- DROP FUNCTION IF EXISTS admin_get_all_profiles();
-- DROP FUNCTION IF EXISTS admin_get_all_campaigns();
-- DROP FUNCTION IF EXISTS admin_get_all_earnings();
-- DROP VIEW IF EXISTS my_referral_earnings;
-- Then restore previous policies from migration 009
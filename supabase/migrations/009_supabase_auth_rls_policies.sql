-- Migration: Update RLS policies for Supabase Auth transition
-- 
-- This migration replaces Clerk-based RLS policies with Supabase auth.uid() based policies
-- Created: 2025-01-05
-- Purpose: Phase 2 of Clerk → Supabase Auth migration

-- =========================================
-- 1. DROP EXISTING CLERK-BASED RLS POLICIES
-- =========================================

-- Drop existing profiles table policies
DROP POLICY IF EXISTS "Users can access own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Drop existing campaigns table policies
DROP POLICY IF EXISTS "Users can view own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can create campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can update own campaigns" ON campaigns;

-- Drop existing earnings table policies
DROP POLICY IF EXISTS "Users can view own earnings" ON earnings;
DROP POLICY IF EXISTS "Users can create earnings" ON earnings;

-- =========================================
-- 2. CREATE SUPABASE AUTH-BASED RLS POLICIES
-- =========================================

-- ===== PROFILES TABLE POLICIES =====

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Allow users to insert their own profile (triggered automatically)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE
  USING (auth.uid() = id);

-- ===== CAMPAIGNS TABLE POLICIES =====

-- Business users can view campaigns they created or are assigned to
CREATE POLICY "Users can view relevant campaigns" ON campaigns
  FOR SELECT
  USING (
    auth.uid() = business_id OR 
    auth.uid() = creator_id
  );

-- Business users can create campaigns
CREATE POLICY "Business users can create campaigns" ON campaigns
  FOR INSERT
  WITH CHECK (
    auth.uid() = business_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('business', 'admin')
    )
  );

-- Business users can update their own campaigns
CREATE POLICY "Business users can update own campaigns" ON campaigns
  FOR UPDATE
  USING (
    auth.uid() = business_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('business', 'admin')
    )
  );

-- Business users can delete their own campaigns
CREATE POLICY "Business users can delete own campaigns" ON campaigns
  FOR DELETE
  USING (
    auth.uid() = business_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('business', 'admin')
    )
  );

-- ===== EARNINGS TABLE POLICIES =====

-- Creators can view their own earnings
CREATE POLICY "Creators can view own earnings" ON earnings
  FOR SELECT
  USING (
    auth.uid() = creator_id OR
    -- Also allow viewing referral earnings
    auth.uid() IN (
      SELECT referrer_l1_id FROM profiles WHERE id = creator_id
      UNION
      SELECT referrer_l2_id FROM profiles WHERE id = creator_id  
      UNION
      SELECT referrer_l3_id FROM profiles WHERE id = creator_id
    )
  );

-- System can create earnings (via triggers or admin functions)
CREATE POLICY "System can create earnings" ON earnings
  FOR INSERT
  WITH CHECK (true); -- This will be restricted by application logic

-- Creators cannot update earnings directly (only system/admin)
CREATE POLICY "Admins can update earnings" ON earnings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ===== ADMIN POLICIES =====

-- Admins have full access to all tables
CREATE POLICY "Admins have full profiles access" ON profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins have full campaigns access" ON campaigns
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins have full earnings access" ON earnings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =========================================
-- 3. VERIFY RLS IS ENABLED
-- =========================================

-- Ensure RLS is enabled on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;

-- =========================================
-- 4. CREATE HELPER FUNCTIONS FOR RLS
-- =========================================

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Function to check if current user has specific role
CREATE OR REPLACE FUNCTION has_role(required_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = required_role
  );
END;
$$;

-- Function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'anonymous');
END;
$$;

-- =========================================
-- 5. GRANTS FOR PUBLIC ACCESS
-- =========================================

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION has_role(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role() TO authenticated;

-- =========================================
-- 6. VERIFICATION QUERIES
-- =========================================

-- Verify policies are created (these are comments for manual verification)
-- SELECT schemaname, tablename, policyname, cmd, qual
-- FROM pg_policies 
-- WHERE tablename IN ('profiles', 'campaigns', 'earnings')
-- ORDER BY tablename, policyname;

-- Test RLS functionality (run these manually after migration)
-- SELECT auth.uid(); -- Should return authenticated user's ID
-- SELECT * FROM profiles WHERE id = auth.uid(); -- Should return user's profile only
-- SELECT is_admin(); -- Should return true/false based on user role
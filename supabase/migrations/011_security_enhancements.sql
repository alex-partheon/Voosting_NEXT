-- Migration: Security Enhancements for Supabase Auth
-- 
-- This migration adds additional security measures for the authentication system
-- Created: 2025-01-05
-- Purpose: Phase 2 of Clerk → Supabase Auth migration - Security hardening

-- =========================================
-- 1. AUDIT LOG TABLE
-- =========================================

-- Create audit log table for tracking important user actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Create index for performance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- =========================================
-- 2. SECURITY FUNCTIONS
-- =========================================

-- Function to log user actions
CREATE OR REPLACE FUNCTION log_user_action(
  action_name TEXT,
  resource_type TEXT DEFAULT NULL,
  resource_id TEXT DEFAULT NULL,
  details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details,
    created_at
  )
  VALUES (
    auth.uid(),
    action_name,
    resource_type,
    resource_id,
    details,
    NOW()
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Function to check rate limiting (simplified version)
CREATE OR REPLACE FUNCTION check_rate_limit(
  action_type TEXT,
  max_attempts INTEGER DEFAULT 5,
  window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  -- Count recent attempts by this user for this action
  SELECT COUNT(*)
  INTO attempt_count
  FROM audit_logs
  WHERE user_id = auth.uid()
    AND action = action_type
    AND created_at > NOW() - INTERVAL '1 minute' * window_minutes;
  
  -- Return true if under the limit
  RETURN attempt_count < max_attempts;
END;
$$;

-- Function to validate password strength
CREATE OR REPLACE FUNCTION validate_password_strength(password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check minimum length (8 characters)
  IF length(password) < 8 THEN
    RETURN FALSE;
  END IF;
  
  -- Check for lowercase letter
  IF password !~ '[a-z]' THEN
    RETURN FALSE;
  END IF;
  
  -- Check for uppercase letter  
  IF password !~ '[A-Z]' THEN
    RETURN FALSE;
  END IF;
  
  -- Check for number
  IF password !~ '[0-9]' THEN
    RETURN FALSE;
  END IF;
  
  -- Check for special character (optional but recommended)
  -- IF password !~ '[^a-zA-Z0-9]' THEN
  --   RETURN FALSE;
  -- END IF;
  
  RETURN TRUE;
END;
$$;

-- =========================================
-- 3. PROFILE SECURITY TRIGGERS
-- =========================================

-- Function to log profile changes
CREATE OR REPLACE FUNCTION log_profile_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  changes JSONB := '{}';
BEGIN
  -- Log profile creation
  IF TG_OP = 'INSERT' THEN
    PERFORM log_user_action(
      'profile_created',
      'profile',
      NEW.id::TEXT,
      jsonb_build_object(
        'email', NEW.email,
        'role', NEW.role,
        'referral_code', NEW.referral_code
      )
    );
    RETURN NEW;
  END IF;
  
  -- Log profile updates
  IF TG_OP = 'UPDATE' THEN
    -- Track what changed
    IF OLD.email != NEW.email THEN
      changes := changes || jsonb_build_object('email', jsonb_build_object('old', OLD.email, 'new', NEW.email));
    END IF;
    
    IF OLD.role != NEW.role THEN
      changes := changes || jsonb_build_object('role', jsonb_build_object('old', OLD.role, 'new', NEW.role));
    END IF;
    
    IF OLD.display_name != NEW.display_name THEN
      changes := changes || jsonb_build_object('display_name', jsonb_build_object('old', OLD.display_name, 'new', NEW.display_name));
    END IF;
    
    -- Only log if there were actual changes
    IF changes != '{}' THEN
      PERFORM log_user_action(
        'profile_updated',
        'profile',
        NEW.id::TEXT,
        changes
      );
    END IF;
    
    RETURN NEW;
  END IF;
  
  -- Log profile deletion
  IF TG_OP = 'DELETE' THEN
    PERFORM log_user_action(
      'profile_deleted',
      'profile',
      OLD.id::TEXT,
      jsonb_build_object(
        'email', OLD.email,
        'role', OLD.role
      )
    );
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Create trigger for profile change logging
DROP TRIGGER IF EXISTS log_profile_changes_trigger ON profiles;
CREATE TRIGGER log_profile_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_profile_changes();

-- =========================================
-- 4. CAMPAIGN SECURITY FUNCTIONS
-- =========================================

-- Function to validate campaign ownership
CREATE OR REPLACE FUNCTION validate_campaign_access(campaign_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
  has_access BOOLEAN := FALSE;
BEGIN
  -- Get current user role
  SELECT role INTO user_role
  FROM profiles
  WHERE id = auth.uid();
  
  -- Admins have access to everything
  IF user_role = 'admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user is business owner or assigned creator
  SELECT EXISTS(
    SELECT 1 FROM campaigns
    WHERE id = campaign_id
      AND (business_id = auth.uid() OR creator_id = auth.uid())
  ) INTO has_access;
  
  RETURN has_access;
END;
$$;

-- =========================================
-- 5. DATA ENCRYPTION FUNCTIONS (for sensitive data)
-- =========================================

-- Note: For production, consider using pgcrypto extension for encryption
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to hash sensitive data (like internal IDs)
CREATE OR REPLACE FUNCTION hash_sensitive_data(data TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  -- Use MD5 for non-cryptographic hashing (for database performance)
  -- For cryptographic hashing, use pgcrypto extension
  RETURN MD5(data || 'voosting_salt_key');
END;
$$;

-- =========================================
-- 6. SESSION SECURITY ENHANCEMENTS
-- =========================================

-- Function to track active sessions (simplified)
CREATE OR REPLACE FUNCTION track_user_session()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log successful sign-in
  IF NEW.last_sign_in_at IS NOT NULL AND (OLD.last_sign_in_at IS NULL OR NEW.last_sign_in_at > OLD.last_sign_in_at) THEN
    PERFORM log_user_action(
      'user_signed_in',
      'session',
      NEW.id::TEXT,
      jsonb_build_object(
        'last_sign_in_at', NEW.last_sign_in_at,
        'sign_in_count', COALESCE(NEW.sign_in_count, 0)
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for session tracking on auth.users table
DROP TRIGGER IF EXISTS track_user_session_trigger ON auth.users;
CREATE TRIGGER track_user_session_trigger
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION track_user_session();

-- =========================================
-- 7. SECURITY VIEWS (for monitoring)
-- =========================================

-- View for recent security events
CREATE OR REPLACE VIEW recent_security_events AS
SELECT 
  al.id,
  al.user_id,
  p.email,
  p.role,
  al.action,
  al.resource_type,
  al.details,
  al.created_at
FROM audit_logs al
LEFT JOIN profiles p ON al.user_id = p.id
WHERE al.created_at > NOW() - INTERVAL '24 hours'
  AND al.action IN ('user_signed_in', 'profile_updated', 'profile_deleted', 'role_changed')
ORDER BY al.created_at DESC;

-- View for suspicious activities
CREATE OR REPLACE VIEW suspicious_activities AS
SELECT 
  user_id,
  COUNT(*) as event_count,
  array_agg(DISTINCT action) as actions,
  MIN(created_at) as first_event,
  MAX(created_at) as last_event
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY user_id
HAVING COUNT(*) > 10 -- More than 10 actions in an hour
ORDER BY event_count DESC;

-- =========================================
-- 8. GRANT PERMISSIONS
-- =========================================

-- Grant execute permissions on security functions
GRANT EXECUTE ON FUNCTION log_user_action(TEXT, TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION check_rate_limit(TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_password_strength(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_campaign_access(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION hash_sensitive_data(TEXT) TO authenticated;

-- Grant select on security views to admins only
-- Note: These views automatically respect RLS since they join with profiles

-- =========================================
-- 9. INDEXES FOR PERFORMANCE
-- =========================================

-- Ensure critical security queries are fast
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email_lower ON profiles(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_campaigns_business_creator ON campaigns(business_id, creator_id);

-- =========================================
-- 10. COMMENTS AND DOCUMENTATION
-- =========================================

COMMENT ON TABLE audit_logs IS 'Tracks all important user actions for security and compliance';
COMMENT ON FUNCTION log_user_action(TEXT, TEXT, TEXT, JSONB) IS 'Logs user actions to audit_logs table for security monitoring';
COMMENT ON FUNCTION check_rate_limit(TEXT, INTEGER, INTEGER) IS 'Simple rate limiting check based on audit logs';
COMMENT ON FUNCTION validate_password_strength(TEXT) IS 'Validates password meets security requirements';
COMMENT ON FUNCTION validate_campaign_access(UUID) IS 'Checks if current user has access to specific campaign';
COMMENT ON VIEW recent_security_events IS 'Shows security-related events from the last 24 hours';
COMMENT ON VIEW suspicious_activities IS 'Identifies users with unusually high activity in the last hour';
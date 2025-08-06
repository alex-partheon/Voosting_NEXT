-- Fix the handle_new_user trigger to use correct field names
-- The profiles table has 'full_name' but the trigger was trying to use 'display_name'

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_role TEXT := 'creator'; -- Default role
  full_name TEXT;
  referred_by TEXT;
  referral_code_generated TEXT;
BEGIN
  -- Extract user metadata
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'creator');
  full_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );
  referred_by := NEW.raw_user_meta_data->>'referred_by';

  -- Generate unique referral code
  referral_code_generated := generate_referral_code(NEW.id);

  -- Insert new profile with correct field names
  INSERT INTO public.profiles (
    id,
    email,
    role,
    full_name,  -- Changed from display_name to full_name
    referral_code,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    user_role::user_role,  -- Cast to enum type
    full_name,
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
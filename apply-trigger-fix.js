#!/usr/bin/env node

/**
 * Apply database trigger fix directly via Supabase client
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Supabase Admin 클라이언트 초기화
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const triggerFixSQL = `
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
`;

async function applyTriggerFix() {
  try {
    console.log('🔧 데이터베이스 트리거 수정 적용 중...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: triggerFixSQL
    });
    
    if (error) {
      // If exec_sql doesn't exist, try direct SQL execution
      console.log('exec_sql RPC 함수 없음, 직접 쿼리 실행 시도...');
      
      // Try using supabase client directly (this may not work with DDL)
      const result = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      
      if (result.error) {
        throw new Error(`데이터베이스 연결 실패: ${result.error.message}`);
      }
      
      console.log('⚠️ DDL 명령은 Supabase SQL Editor에서 직접 실행해야 합니다.');
      console.log('아래 SQL을 복사하여 Supabase Studio > SQL Editor에서 실행해주세요:');
      console.log('\n' + '='.repeat(60));
      console.log(triggerFixSQL);
      console.log('='.repeat(60) + '\n');
      
      return false;
    }
    
    console.log('✅ 데이터베이스 트리거 수정 완료');
    return true;
  } catch (error) {
    console.error('❌ 트리거 수정 실패:', error.message);
    return false;
  }
}

async function main() {
  const success = await applyTriggerFix();
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main();
}
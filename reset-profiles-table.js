#!/usr/bin/env node

/**
 * profiles 테이블 재설정
 * Clerk User ID (TEXT) 지원을 위한 테이블 재생성
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetTable() {
  try {
    console.log('🔧 profiles 테이블 재설정...\n');

    // 1. 기존 데이터 확인
    const { data: existingData, error: checkError } = await supabase
      .from('profiles')
      .select('count');

    if (!checkError) {
      console.log('📊 기존 테이블 존재 확인');
    }

    // 2. 테스트용 레코드로 스키마 확인
    console.log('🧪 Clerk User ID 형식으로 테스트 삽입...');
    
    const testData = {
      id: 'user_test123456789',  // Clerk User ID 형식
      email: 'schema-test@test.com',
      full_name: 'Schema Test',
      role: 'creator'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('profiles')
      .insert(testData)
      .select();

    if (insertError) {
      console.error('❌ 테스트 삽입 실패:', insertError.message);
      console.log('\n현재 profiles 테이블이 Clerk User ID를 지원하지 않습니다.');
      console.log('Supabase Dashboard에서 다음 SQL을 실행해주세요:\n');
      
      console.log(`
-- profiles 테이블 Clerk ID 지원 업데이트
DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'creator' CHECK (role IN ('creator', 'business', 'admin')),
  referral_code TEXT UNIQUE,
  referrer_l1_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  referrer_l2_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  referrer_l3_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  company_name TEXT,
  business_registration TEXT,
  creator_category TEXT[],
  follower_count INTEGER DEFAULT 0,
  engagement_rate DECIMAL(4,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 기본 정책
CREATE POLICY "Public profiles viewable" ON profiles FOR SELECT USING (true);

-- 인덱스
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX idx_profiles_role ON profiles(role);
      `);
      
      console.log('\nSupabase Dashboard URL: https://supabase.com/dashboard/project/' + 
                  process.env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0]);
      
      return false;
    }

    console.log('✅ Clerk User ID 형식 삽입 성공!');
    
    // 3. 테스트 데이터 정리
    await supabase
      .from('profiles')
      .delete()
      .eq('email', 'schema-test@test.com');

    console.log('✅ 테스트 데이터 정리 완료');
    console.log('\n🎉 profiles 테이블이 이미 Clerk User ID를 지원합니다!');
    
    return true;

  } catch (error) {
    console.error('❌ 테이블 재설정 실패:', error.message);
    return false;
  }
}

resetTable().then(success => {
  console.log(success ? '\n✅ 준비 완료' : '\n❌ 수동 설정 필요');
  process.exit(success ? 0 : 1);
});
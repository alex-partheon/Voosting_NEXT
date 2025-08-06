#!/usr/bin/env node

/**
 * Supabase 데이터베이스 스키마 확인
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  try {
    console.log('🔍 데이터베이스 스키마 확인 중...\n');

    // 1. profiles 테이블 구조 확인
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profilesError) {
      console.error('❌ profiles 테이블 조회 실패:', profilesError.message);
      
      // 테이블이 없는 경우 생성 시도
      if (profilesError.message.includes('relation "public.profiles" does not exist')) {
        console.log('📦 profiles 테이블이 존재하지 않습니다. 기본 테이블 생성 시도...');
        
        // 기본 profiles 테이블 생성
        const { error: createError } = await supabase.rpc('exec', {
          sql: `
            CREATE TABLE IF NOT EXISTS profiles (
              id TEXT PRIMARY KEY,
              email TEXT UNIQUE NOT NULL,
              full_name TEXT,
              role TEXT DEFAULT 'creator' CHECK (role IN ('creator', 'business', 'admin')),
              referral_code TEXT UNIQUE,
              referrer_l1_id TEXT REFERENCES profiles(id),
              referrer_l2_id TEXT REFERENCES profiles(id), 
              referrer_l3_id TEXT REFERENCES profiles(id),
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
            
            -- 인덱스 생성
            CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
            CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
            CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
          `
        });
        
        if (createError) {
          console.error('❌ 테이블 생성 실패:', createError.message);
        } else {
          console.log('✅ profiles 테이블 생성 완료');
        }
      }
    } else {
      console.log('✅ profiles 테이블 존재 확인');
      console.log('현재 레코드 수:', profiles.length);
    }

    // 2. 기본 관리자 계정 확인
    const { data: adminProfiles, error: adminError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin');

    if (adminError) {
      console.error('❌ 관리자 계정 조회 실패:', adminError.message);
    } else {
      console.log(`관리자 계정: ${adminProfiles.length}개`);
    }

    // 3. 테스트 계정 확인
    const testEmails = ['creator1@test.com', 'creator2@test.com', 'creator3@test.com', 'business1@test.com', 'business2@test.com', 'admin@test.com'];
    
    const { data: testAccounts, error: testError } = await supabase
      .from('profiles')
      .select('email, role, referral_code, created_at')
      .in('email', testEmails);

    if (testError) {
      console.error('❌ 테스트 계정 조회 실패:', testError.message);
    } else {
      console.log(`\n기존 테스트 계정: ${testAccounts.length}개`);
      testAccounts.forEach(account => {
        console.log(`  ${account.email} (${account.role}) - ${account.referral_code}`);
      });
    }

    // 4. 데이터베이스 연결 상태 확인
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.error('❌ 데이터베이스 연결 실패:', connectionError.message);
      return false;
    } else {
      console.log('\n✅ 데이터베이스 연결 성공');
      return true;
    }

  } catch (error) {
    console.error('❌ 스키마 확인 실패:', error.message);
    return false;
  }
}

checkSchema().then(success => {
  process.exit(success ? 0 : 1);
});
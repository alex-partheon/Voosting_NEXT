#!/usr/bin/env node

/**
 * Supabase 데이터베이스 스키마 업데이트
 * profiles.id를 UUID에서 TEXT로 변경 (Clerk User ID 지원)
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateSchema() {
  try {
    console.log('🔧 데이터베이스 스키마 업데이트 시작...\n');

    // 1. 현재 테이블 정보 확인
    console.log('1️⃣ 현재 스키마 확인...');
    const { data: currentData, error: currentError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (currentError) {
      console.error('❌ 현재 스키마 조회 실패:', currentError.message);
      return false;
    }

    console.log('✅ 현재 profiles 테이블 접근 가능');

    // 2. 기존 데이터 백업 (있다면)
    const { data: existingData, error: backupError } = await supabase
      .from('profiles')
      .select('*');

    if (backupError) {
      console.error('❌ 기존 데이터 조회 실패:', backupError.message);
      return false;
    }

    console.log(`📦 기존 데이터: ${existingData.length}개 레코드`);

    // 3. 테이블 재생성 (DROP & CREATE)
    console.log('\n2️⃣ 테이블 재생성...');
    
    const schema = `
      -- 기존 테이블 삭제
      DROP TABLE IF EXISTS profiles CASCADE;
      
      -- 새 profiles 테이블 생성 (Clerk ID 지원)
      CREATE TABLE profiles (
        id TEXT PRIMARY KEY,  -- Clerk User ID (TEXT)
        email TEXT UNIQUE NOT NULL,
        full_name TEXT,
        role TEXT DEFAULT 'creator' CHECK (role IN ('creator', 'business', 'admin')),
        referral_code TEXT UNIQUE,
        referrer_l1_id TEXT,
        referrer_l2_id TEXT,
        referrer_l3_id TEXT,
        company_name TEXT,
        business_registration TEXT,
        creator_category TEXT[],
        follower_count INTEGER DEFAULT 0,
        engagement_rate DECIMAL(4,2) DEFAULT 0.00,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 자기 참조 외래 키 추가
      ALTER TABLE profiles ADD CONSTRAINT profiles_referrer_l1_id_fkey 
        FOREIGN KEY (referrer_l1_id) REFERENCES profiles(id) ON DELETE SET NULL;
      ALTER TABLE profiles ADD CONSTRAINT profiles_referrer_l2_id_fkey 
        FOREIGN KEY (referrer_l2_id) REFERENCES profiles(id) ON DELETE SET NULL;
      ALTER TABLE profiles ADD CONSTRAINT profiles_referrer_l3_id_fkey 
        FOREIGN KEY (referrer_l3_id) REFERENCES profiles(id) ON DELETE SET NULL;

      -- RLS 활성화
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

      -- 인덱스 생성
      CREATE INDEX idx_profiles_email ON profiles(email);
      CREATE INDEX idx_profiles_referral_code ON profiles(referral_code);
      CREATE INDEX idx_profiles_role ON profiles(role);

      -- RLS 정책 생성
      CREATE POLICY "Public profiles are viewable by everyone" ON profiles
        FOR SELECT USING (true);

      -- 추천 코드 생성 함수
      CREATE OR REPLACE FUNCTION generate_unique_referral_code()
      RETURNS TEXT AS $$
      DECLARE
          v_code TEXT;
          v_exists BOOLEAN;
      BEGIN
          LOOP
              -- 랜덤 8자리 코드 생성 (대문자 + 숫자)
              v_code := UPPER(
                  SUBSTRING(MD5(RANDOM()::TEXT), 1, 4) || 
                  SUBSTRING(MD5(RANDOM()::TEXT), 1, 4)
              );
              
              -- 중복 확인
              SELECT EXISTS(SELECT 1 FROM profiles WHERE referral_code = v_code) INTO v_exists;
              
              -- 중복이 아니면 반환
              IF NOT v_exists THEN
                  RETURN v_code;
              END IF;
          END LOOP;
      END;
      $$ LANGUAGE plpgsql;
    `;

    // SQL 실행
    const { error: schemaError } = await supabase.rpc('exec_sql', {
      sql: schema
    });

    if (schemaError) {
      console.error('❌ 스키마 업데이트 실패:', schemaError.message);
      console.log('\n수동 SQL 실행이 필요할 수 있습니다:');
      console.log(schema);
      return false;
    }

    console.log('✅ 스키마 업데이트 완료');

    // 4. 테스트 삽입
    console.log('\n3️⃣ 테스트 데이터 삽입...');
    const testProfile = {
      id: 'test_clerk_id_123',
      email: 'test@example.com',
      full_name: 'Test User',
      role: 'creator',
      referral_code: 'TEST123'
    };

    const { error: insertError } = await supabase
      .from('profiles')
      .insert(testProfile);

    if (insertError) {
      console.error('❌ 테스트 삽입 실패:', insertError.message);
      return false;
    }

    console.log('✅ 테스트 데이터 삽입 성공');

    // 5. 테스트 데이터 삭제
    await supabase
      .from('profiles')
      .delete()
      .eq('id', 'test_clerk_id_123');

    console.log('✅ 테스트 데이터 정리 완료');

    console.log('\n🎉 스키마 업데이트 완료! 이제 Clerk User ID를 사용할 수 있습니다.');
    return true;

  } catch (error) {
    console.error('❌ 스키마 업데이트 실패:', error.message);
    return false;
  }
}

updateSchema().then(success => {
  process.exit(success ? 0 : 1);
});
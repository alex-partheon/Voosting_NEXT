#!/usr/bin/env node
/**
 * Supabase 사용자 목록 조회
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

// Service role 클라이언트 (Admin 권한)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function listUsers() {
  console.log('👥 Supabase 사용자 목록 조회...');
  
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ 사용자 목록 조회 실패:', error.message);
      return;
    }
    
    console.log(`\n📊 총 사용자 수: ${data.users.length}`);
    console.log('\n📋 사용자 목록:');
    
    data.users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   생성일: ${user.created_at}`);
      console.log(`   이메일 확인: ${user.email_confirmed_at ? '완료' : '미완료'}`);
      console.log(`   마지막 로그인: ${user.last_sign_in_at || '없음'}`);
    });
    
  } catch (err) {
    console.error('💥 예외 발생:', err.message);
  }
}

listUsers();
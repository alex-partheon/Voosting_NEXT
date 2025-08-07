#!/usr/bin/env node
/**
 * Supabase Auth 로그인 테스트 스크립트
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  console.log('🔐 Supabase Auth 로그인 테스트 시작...');
  console.log('📍 Supabase URL:', supabaseUrl);
  
  // 테스트 계정으로 로그인 시도
  const testEmail = 'creator1@test.com';
  console.log(`\n👤 테스트 계정: ${testEmail}`);
  console.log('⚠️  테스트 계정으로 로그인을 시도합니다.');
  
  // 테스트 계정 비밀번호 목록
  const testPasswords = [
    'TestPassword123!',
    'testPassword123!',
    'password123',
    'Password123!',
    'creator123',
    'test123'
  ];
  
  for (const password of testPasswords) {
    try {
      console.log(`\n🔑 비밀번호 테스트: ${password}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: password,
      });

      if (error) {
        console.log(`   ❌ 실패: ${error.message}`);
        continue;
      }

      if (data.user) {
        console.log('   ✅ 로그인 성공!');
        console.log('   👤 사용자 ID:', data.user.id);
        console.log('   📧 이메일:', data.user.email);
        console.log('   📅 생성일:', data.user.created_at);
        console.log('   🔑 세션:', data.session ? '있음' : '없음');
        
        // 로그아웃
        await supabase.auth.signOut();
        console.log('   🚪 로그아웃 완료');
        return;
      }
    } catch (err) {
      console.log(`   💥 예외 발생: ${err.message}`);
    }
  }
  
  console.log('\n❌ 모든 비밀번호 테스트 실패');
  console.log('💡 실제 비밀번호를 확인하거나 비밀번호 재설정이 필요합니다.');
}

testLogin();
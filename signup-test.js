#!/usr/bin/env node
/**
 * Supabase Auth 회원가입 및 로그인 테스트
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

const testAccount = {
  email: 'test-user@example.com',
  password: 'TestPassword123!'
};

async function testSignupAndLogin() {
  console.log('🔐 Supabase Auth 회원가입 및 로그인 테스트...');
  console.log('📍 Supabase URL:', supabaseUrl);
  
  try {
    // 1. 회원가입 시도
    console.log(`\n📝 회원가입 시도: ${testAccount.email}`);
    
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testAccount.email,
      password: testAccount.password,
    });

    if (signupError) {
      console.log(`   ⚠️  회원가입 실패: ${signupError.message}`);
      
      // 이미 존재하는 사용자일 수 있으므로 바로 로그인 시도
      if (signupError.message.includes('already registered')) {
        console.log('   💡 이미 등록된 사용자, 로그인 시도...');
      }
    } else {
      console.log('   ✅ 회원가입 성공!');
      if (signupData.user) {
        console.log('   👤 사용자 ID:', signupData.user.id);
        console.log('   📧 이메일:', signupData.user.email);
        console.log('   📧 이메일 확인 필요:', !signupData.user.email_confirmed_at);
      }
    }
    
    // 2. 로그인 시도
    console.log(`\n🔑 로그인 시도: ${testAccount.email}`);
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testAccount.email,
      password: testAccount.password,
    });

    if (loginError) {
      console.error(`   ❌ 로그인 실패: ${loginError.message}`);
      console.error(`   📊 에러 코드: ${loginError.status}`);
      
      if (loginError.message.includes('Email not confirmed')) {
        console.log('   💡 이메일 확인이 필요합니다.');
        console.log('   📧 이메일 확인을 건너뛰고 Admin API로 확인 처리...');
        
        // Admin API로 이메일 확인 처리 (Service Role 필요)
        // 여기서는 일단 스킵
      }
      return;
    }

    if (loginData.user) {
      console.log('   ✅ 로그인 성공!');
      console.log('   👤 사용자 ID:', loginData.user.id);
      console.log('   📧 이메일:', loginData.user.email);
      console.log('   📅 생성일:', loginData.user.created_at);
      console.log('   🔑 세션:', loginData.session ? '있음' : '없음');
      
      // 로그아웃
      await supabase.auth.signOut();
      console.log('   🚪 로그아웃 완료');
    }
    
  } catch (err) {
    console.error('💥 예외 발생:', err.message);
  }
}

testSignupAndLogin();
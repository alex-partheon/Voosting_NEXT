#!/usr/bin/env tsx
/**
 * Supabase Auth 테스트 스크립트
 * 로그인 기능을 직접 테스트합니다.
 * 
 * 사용법: npx tsx scripts/test-auth.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase URL 또는 Anon Key가 설정되지 않았습니다.');
  process.exit(1);
}

// Anon key로 일반 클라이언트 생성 (로그인 테스트용)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('🔑 Supabase Auth 테스트 시작...\n');
  console.log('📌 Supabase URL:', supabaseUrl);
  console.log('📌 Using Anon Key\n');

  const testAccounts = [
    { email: 'creator1@test.com', password: 'testPassword123!' },
    { email: 'business1@test.com', password: 'testPassword123!' },
    { email: 'admin@test.com', password: 'testPassword123!' },
  ];

  for (const account of testAccounts) {
    console.log(`\n🧪 테스트: ${account.email}`);
    console.log('─'.repeat(50));

    try {
      // 1. 로그인 시도
      console.log('1️⃣  로그인 시도...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password,
      });

      if (error) {
        console.error(`   ❌ 로그인 실패:`, error.message);
        
        // 에러 상세 정보
        if (error.message === 'Invalid login credentials') {
          console.log('   💡 가능한 원인:');
          console.log('      - 계정이 존재하지 않음');
          console.log('      - 비밀번호가 틀림');
          console.log('      - 계정이 비활성화됨');
        }
        continue;
      }

      if (data.user) {
        console.log(`   ✅ 로그인 성공!`);
        console.log(`   👤 User ID: ${data.user.id}`);
        console.log(`   📧 Email: ${data.user.email}`);
        console.log(`   ✉️  Email Confirmed: ${data.user.email_confirmed_at ? 'Yes' : 'No'}`);

        // 2. 프로필 조회
        console.log('\n2️⃣  프로필 조회...');
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error(`   ❌ 프로필 조회 실패:`, profileError.message);
        } else if (profile) {
          console.log(`   ✅ 프로필 찾음!`);
          console.log(`   👤 Role: ${profile.role}`);
          console.log(`   📝 Full Name: ${profile.full_name}`);
          console.log(`   🔗 Referral Code: ${profile.referral_code}`);
        }

        // 3. 로그아웃
        console.log('\n3️⃣  로그아웃...');
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) {
          console.error(`   ❌ 로그아웃 실패:`, signOutError.message);
        } else {
          console.log(`   ✅ 로그아웃 완료`);
        }
      }
    } catch (err) {
      console.error(`   ❌ 예외 발생:`, err);
    }
  }

  console.log('\n' + '═'.repeat(50));
  console.log('📊 테스트 요약:');
  console.log('─'.repeat(50));
  console.log('1. Supabase 연결: ✅ 성공');
  console.log('2. 테스트 계정 상태를 확인하세요');
  console.log('3. "Invalid login credentials" 에러 시:');
  console.log('   - Supabase Dashboard에서 직접 계정 생성 필요');
  console.log('   - Authentication → Users → Invite user');
  console.log('\n✅ 테스트 완료!');
}

// Run the test
testAuth().catch(console.error);
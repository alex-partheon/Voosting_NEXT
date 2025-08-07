#!/usr/bin/env tsx
/**
 * 테스트 계정 회원가입 스크립트
 * Supabase Auth signUp API를 사용하여 테스트 계정을 생성합니다.
 * 
 * 사용법: npx tsx scripts/signup-test-accounts.ts
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

// Anon key로 일반 클라이언트 생성 (회원가입용)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface TestAccount {
  email: string;
  password: string;
  role: 'creator' | 'business' | 'admin';
  full_name: string;
  referral_code: string;
}

const testAccounts: TestAccount[] = [
  {
    email: 'creator1@test.com',
    password: 'testPassword123!',
    role: 'creator',
    full_name: '테스트 크리에이터1',
    referral_code: 'CREATOR001',
  },
  {
    email: 'creator2@test.com',
    password: 'testPassword123!',
    role: 'creator',
    full_name: '테스트 크리에이터2',
    referral_code: 'CREATOR002',
  },
  {
    email: 'business1@test.com',
    password: 'testPassword123!',
    role: 'business',
    full_name: '테스트 비즈니스1',
    referral_code: 'BUSINESS001',
  },
  {
    email: 'business2@test.com',
    password: 'testPassword123!',
    role: 'business',
    full_name: '테스트 비즈니스2',
    referral_code: 'BUSINESS002',
  },
  {
    email: 'admin@test.com',
    password: 'testPassword123!',
    role: 'admin',
    full_name: '테스트 관리자',
    referral_code: 'ADMIN001',
  },
];

async function signupTestAccounts() {
  console.log('🚀 테스트 계정 회원가입 시작...\n');
  console.log('📌 Supabase URL:', supabaseUrl);
  console.log('📌 Using Anon Key for signup\n');

  for (const account of testAccounts) {
    console.log(`\n📝 회원가입 시도: ${account.email}`);
    console.log('─'.repeat(50));

    try {
      // 1. 회원가입
      console.log('1️⃣  회원가입 요청...');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: account.email,
        password: account.password,
        options: {
          data: {
            full_name: account.full_name,
            role: account.role,
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          console.log(`   ⚠️  이미 가입된 계정입니다.`);
          
          // 로그인 테스트
          console.log('2️⃣  로그인 테스트...');
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: account.email,
            password: account.password,
          });
          
          if (signInError) {
            console.error(`   ❌ 로그인 실패:`, signInError.message);
          } else if (signInData.user) {
            console.log(`   ✅ 로그인 성공! User ID: ${signInData.user.id}`);
            
            // 로그아웃
            await supabase.auth.signOut();
          }
        } else {
          console.error(`   ❌ 회원가입 실패:`, signUpError.message);
        }
        continue;
      }

      if (signUpData.user) {
        console.log(`   ✅ 회원가입 성공!`);
        console.log(`   👤 User ID: ${signUpData.user.id}`);
        console.log(`   📧 Email: ${signUpData.user.email}`);
        console.log(`   ✉️  Confirmation: ${signUpData.user.email_confirmed_at ? 'Confirmed' : 'Pending (check email)'}`);

        // 2. 프로필 생성 (트리거로 자동 생성되지 않은 경우)
        console.log('\n2️⃣  프로필 확인...');
        
        // 잠시 대기 (트리거 실행 시간)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', signUpData.user.id)
          .single();

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            console.log('   ℹ️  프로필이 없습니다. 생성 중...');
            
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: signUpData.user.id,
                email: account.email,
                role: account.role,
                full_name: account.full_name,
                referral_code: account.referral_code,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });

            if (insertError) {
              console.error(`   ❌ 프로필 생성 실패:`, insertError.message);
            } else {
              console.log(`   ✅ 프로필 생성 완료`);
            }
          } else {
            console.error(`   ❌ 프로필 조회 실패:`, profileError.message);
          }
        } else if (profile) {
          console.log(`   ✅ 프로필 확인됨`);
          console.log(`   👤 Role: ${profile.role}`);
          console.log(`   🔗 Referral Code: ${profile.referral_code}`);
        }

        // 3. 로그아웃
        console.log('\n3️⃣  로그아웃...');
        await supabase.auth.signOut();
        console.log(`   ✅ 로그아웃 완료`);
      }
    } catch (err) {
      console.error(`   ❌ 예외 발생:`, err);
    }
  }

  console.log('\n' + '═'.repeat(65));
  console.log('📊 테스트 계정 정보:');
  console.log('─'.repeat(65));
  console.log('이메일'.padEnd(30) + '비밀번호'.padEnd(20) + '역할');
  console.log('─'.repeat(65));
  for (const account of testAccounts) {
    console.log(
      `${account.email.padEnd(30)}${account.password.padEnd(20)}${account.role}`
    );
  }
  console.log('═'.repeat(65));
  console.log('\n✅ 회원가입 프로세스 완료!');
  console.log('📝 참고사항:');
  console.log('   - 이메일 확인이 필요한 경우 확인 메일을 체크하세요');
  console.log('   - 이미 가입된 계정은 로그인 테스트를 진행했습니다');
  console.log('   - 로그인 페이지에서 위 계정으로 접속 가능합니다');
}

// Run the script
signupTestAccounts().catch(console.error);
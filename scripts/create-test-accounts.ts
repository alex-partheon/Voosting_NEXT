#!/usr/bin/env tsx
/**
 * 테스트 계정 생성 스크립트
 * Supabase Auth에 테스트 사용자를 생성하고 profiles 테이블에 프로필을 설정합니다.
 * 
 * 사용법: npx tsx scripts/create-test-accounts.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase URL 또는 Service Role Key가 설정되지 않았습니다.');
  process.exit(1);
}

// Service role client로 admin 권한 사용
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface TestAccount {
  email: string;
  password: string;
  role: 'creator' | 'business' | 'admin';
  full_name: string;
  referral_code: string;
  referred_by?: string; // 추천인 이메일
}

const testAccounts: TestAccount[] = [
  {
    email: 'creator1@test.com',
    password: 'testPassword123!',
    role: 'creator',
    full_name: '크리에이터 1호',
    referral_code: 'CREATOR1',
  },
  {
    email: 'creator2@test.com',
    password: 'testPassword123!',
    role: 'creator',
    full_name: '크리에이터 2호',
    referral_code: 'CRT002',
    referred_by: 'creator1@test.com',
  },
  {
    email: 'creator3@test.com',
    password: 'testPassword123!',
    role: 'creator',
    full_name: '크리에이터 3호',
    referral_code: 'CRT003',
    referred_by: 'creator2@test.com',
  },
  {
    email: 'business1@test.com',
    password: 'testPassword123!',
    role: 'business',
    full_name: '비즈니스 1호',
    referral_code: 'BIZ001',
  },
  {
    email: 'business2@test.com',
    password: 'testPassword123!',
    role: 'business',
    full_name: '비즈니스 2호',
    referral_code: 'BIZ002',
  },
  {
    email: 'admin@test.com',
    password: 'testPassword123!',
    role: 'admin',
    full_name: '플랫폼 관리자',
    referral_code: 'ADM001',
  },
];

async function createTestAccounts() {
  console.log('🚀 테스트 계정 생성 시작...\n');

  // 추천인 ID를 저장할 맵
  const userIdMap = new Map<string, string>();

  for (const account of testAccounts) {
    try {
      console.log(`📝 계정 생성 중: ${account.email}`);

      // 1. 먼저 Auth에서 기존 사용자 확인
      const { data: users } = await supabase.auth.admin.listUsers();
      const existingUser = users?.users?.find(u => u.email === account.email);

      if (existingUser) {
        console.log(`   ⚠️  Auth에 이미 존재하는 계정입니다: ${account.email}`);
        // 비밀번호 업데이트
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          existingUser.id,
          {
            password: account.password,
            email_confirm: true,
          }
        );
        
        if (updateError) {
          console.error(`   ❌ 비밀번호 업데이트 실패:`, updateError.message);
        } else {
          console.log(`   ✅ 비밀번호 업데이트 완료`);
        }
        
        // 프로필 확인 및 생성
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', existingUser.id)
          .single();
          
        if (!profile) {
          // 추천인 ID 찾기
          let referredById = null;
          if (account.referred_by) {
            referredById = userIdMap.get(account.referred_by);
          }

          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: existingUser.id,
              email: account.email,
              role: account.role,
              full_name: account.full_name,
              referral_code: account.referral_code,
              referred_by: referredById,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            
          if (profileError) {
            console.error(`   ❌ 프로필 생성 실패:`, profileError.message);
          } else {
            console.log(`   ✅ 프로필 생성 완료`);
          }
        }
        
        // 사용자 ID를 맵에 저장
        userIdMap.set(account.email, existingUser.id);
        continue;
      }

      // 2. Auth 사용자 생성
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true, // 이메일 확인 자동 처리
        user_metadata: {
          full_name: account.full_name,
          role: account.role,
        },
      });

      if (authError) {
        // 이미 존재하는 사용자인 경우 프로필만 업데이트
        if (authError.message.includes('already been registered')) {
          console.log(`   ℹ️  Auth 사용자는 이미 존재합니다. 프로필을 업데이트합니다.`);
          
          // 기존 사용자 ID 가져오기
          const { data: users } = await supabase.auth.admin.listUsers();
          const existingUser = users?.users?.find(u => u.email === account.email);
          
          if (existingUser) {
            // 추천인 ID 찾기
            let referredById = null;
            if (account.referred_by) {
              referredById = userIdMap.get(account.referred_by);
            }

            // 프로필 업데이트 또는 생성
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({
                id: existingUser.id,
                email: account.email,
                role: account.role,
                full_name: account.full_name,
                referral_code: account.referral_code,
                referred_by: referredById,
                updated_at: new Date().toISOString(),
              }, {
                onConflict: 'id',
              });

            if (profileError) {
              console.error(`   ❌ 프로필 업데이트 실패:`, profileError.message);
            } else {
              console.log(`   ✅ 프로필 업데이트 완료`);
            }
            
            // 사용자 ID를 맵에 저장
            userIdMap.set(account.email, existingUser.id);
          }
        } else {
          console.error(`   ❌ Auth 사용자 생성 실패:`, authError.message);
        }
        continue;
      }

      if (authData?.user) {
        // 추천인 ID 찾기
        let referredById = null;
        if (account.referred_by) {
          referredById = userIdMap.get(account.referred_by);
        }

        // 3. Profile 생성
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: account.email,
            role: account.role,
            full_name: account.full_name,
            referral_code: account.referral_code,
            referred_by: referredById,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error(`   ❌ 프로필 생성 실패:`, profileError.message);
        } else {
          console.log(`   ✅ 계정 생성 완료`);
        }
        
        // 사용자 ID를 맵에 저장
        userIdMap.set(account.email, authData.user.id);
      }
    } catch (error) {
      console.error(`   ❌ 오류 발생:`, error);
    }
  }

  console.log('\n📊 테스트 계정 목록:');
  console.log('─'.repeat(60));
  for (const account of testAccounts) {
    console.log(`📧 ${account.email.padEnd(25)} | 🔑 ${account.password} | 👤 ${account.role}`);
  }
  console.log('─'.repeat(60));
  console.log('\n✅ 테스트 계정 생성 완료!');
}

// Run the script
createTestAccounts().catch(console.error);
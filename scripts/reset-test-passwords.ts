#!/usr/bin/env tsx
/**
 * 테스트 계정 비밀번호 리셋 스크립트
 * 기존 테스트 계정의 비밀번호를 재설정합니다.
 * 
 * 사용법: npx tsx scripts/reset-test-passwords.ts
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
  newPassword: string;
  role: 'creator' | 'business' | 'admin';
}

const testAccounts: TestAccount[] = [
  {
    email: 'creator1@test.com',
    newPassword: 'testPassword123!',
    role: 'creator',
  },
  {
    email: 'creator2@test.com',
    newPassword: 'testPassword123!',
    role: 'creator',
  },
  {
    email: 'business1@test.com',
    newPassword: 'testPassword123!',
    role: 'business',
  },
  {
    email: 'business2@test.com',
    newPassword: 'testPassword123!',
    role: 'business',
  },
  {
    email: 'admin@test.com',
    newPassword: 'testPassword123!',
    role: 'admin',
  },
];

async function resetTestPasswords() {
  console.log('🔑 테스트 계정 비밀번호 리셋 시작...\n');

  for (const account of testAccounts) {
    try {
      console.log(`🔒 비밀번호 리셋 중: ${account.email}`);

      // 1. 먼저 사용자 ID 찾기
      const { data: users, error: listError } = await supabase.auth.admin.listUsers();
      
      if (listError) {
        console.error(`   ❌ 사용자 목록 조회 실패:`, listError.message);
        continue;
      }

      const user = users?.users?.find(u => u.email === account.email);
      
      if (!user) {
        console.log(`   ⚠️  사용자를 찾을 수 없습니다: ${account.email}`);
        continue;
      }

      // 2. 비밀번호 업데이트
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        {
          password: account.newPassword,
          email_confirm: true, // 이메일 확인 상태 유지
        }
      );

      if (updateError) {
        console.error(`   ❌ 비밀번호 업데이트 실패:`, updateError.message);
        continue;
      }

      console.log(`   ✅ 비밀번호 리셋 완료`);
      
      // 3. 프로필이 있는지 확인하고 없으면 생성
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile) {
        console.log(`   📝 프로필 생성 중...`);
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: account.email,
            role: account.role,
            full_name: `테스트 ${account.role}`,
            referral_code: `${account.role.toUpperCase()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error(`   ⚠️  프로필 생성 실패:`, insertError.message);
        } else {
          console.log(`   ✅ 프로필 생성 완료`);
        }
      }
    } catch (error) {
      console.error(`   ❌ 오류 발생:`, error);
    }
  }

  console.log('\n📊 리셋된 테스트 계정 정보:');
  console.log('═'.repeat(65));
  console.log('이메일'.padEnd(30) + '비밀번호'.padEnd(20) + '역할');
  console.log('─'.repeat(65));
  for (const account of testAccounts) {
    console.log(
      `${account.email.padEnd(30)}${account.newPassword.padEnd(20)}${account.role}`
    );
  }
  console.log('═'.repeat(65));
  console.log('\n✅ 모든 테스트 계정의 비밀번호가 리셋되었습니다!');
  console.log('📝 로그인 페이지에서 위 계정으로 테스트할 수 있습니다.');
}

// Run the script
resetTestPasswords().catch(console.error);
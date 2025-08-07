#!/usr/bin/env node
/**
 * 나머지 테스트 계정 생성 스크립트
 * creator1@test.com을 제외한 나머지 계정들을 생성합니다.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase URL 또는 Service Role Key가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const remainingAccounts = [
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

async function createRemainingAccounts() {
  console.log('🚀 나머지 테스트 계정 생성 시작...\n');

  // 먼저 creator1의 ID를 가져옵니다
  const { data: users } = await supabase.auth.admin.listUsers();
  const creator1 = users?.users?.find(u => u.email === 'creator1@test.com');
  
  if (!creator1) {
    console.error('❌ creator1@test.com 계정을 찾을 수 없습니다.');
    return;
  }

  const userIdMap = new Map();
  userIdMap.set('creator1@test.com', creator1.id);

  for (const account of remainingAccounts) {
    try {
      console.log(`📝 계정 생성 중: ${account.email}`);

      // 기존 사용자 확인
      const existingUser = users?.users?.find(u => u.email === account.email);
      
      if (existingUser) {
        console.log(`   ⚠️  이미 존재하는 계정입니다: ${account.email}`);
        userIdMap.set(account.email, existingUser.id);
        continue;
      }

      // 추천인 ID 찾기
      let referredById = null;
      if (account.referred_by) {
        referredById = userIdMap.get(account.referred_by);
        if (!referredById) {
          console.log(`   ⚠️  추천인을 찾을 수 없습니다: ${account.referred_by}`);
        }
      }

      // Auth 사용자 생성
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: {
          full_name: account.full_name,
          role: account.role,
        },
      });

      if (authError) {
        console.error(`   ❌ Auth 사용자 생성 실패:`, authError.message);
        continue;
      }

      if (authData?.user) {
        // 프로필 생성
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
          userIdMap.set(account.email, authData.user.id);
        }
      }
    } catch (error) {
      console.error(`   ❌ 오류 발생:`, error.message);
    }
  }

  console.log('\n📊 생성된 계정 목록:');
  console.log('─'.repeat(60));
  for (const account of remainingAccounts) {
    console.log(`📧 ${account.email.padEnd(25)} | 🔑 ${account.password} | 👤 ${account.role}`);
  }
  console.log('─'.repeat(60));
  console.log('\n✅ 나머지 테스트 계정 생성 완료!');
}

createRemainingAccounts().catch(console.error);
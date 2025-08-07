#!/usr/bin/env node
/**
 * Supabase Admin API를 사용하여 테스트 계정 비밀번호 수정
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

const testAccounts = [
  'creator1@test.com',
  'creator2@test.com', 
  'creator3@test.com',
  'business1@test.com',
  'business2@test.com',
  'admin@test.com'
];

async function fixPasswords() {
  console.log('🔧 테스트 계정 비밀번호 수정 시작...');
  
  for (const email of testAccounts) {
    try {
      console.log(`🔑 ${email} 비밀번호 수정 중...`);
      
      // 사용자 조회
      const { data: users, error: listError } = await supabase.auth.admin.listUsers();
      
      if (listError) {
        console.error(`   ❌ 사용자 목록 조회 실패:`, listError.message);
        continue;
      }
      
      const user = users.users.find(u => u.email === email);
      
      if (!user) {
        console.log(`   ⚠️  사용자를 찾을 수 없음: ${email}`);
        continue;
      }
      
      // 비밀번호 업데이트
      const { data, error } = await supabase.auth.admin.updateUserById(
        user.id,
        {
          password: 'testPassword123!'
        }
      );
      
      if (error) {
        console.error(`   ❌ 비밀번호 업데이트 실패:`, error.message);
      } else {
        console.log(`   ✅ 비밀번호 업데이트 성공`);
      }
      
    } catch (err) {
      console.error(`   💥 예외 발생:`, err.message);
    }
  }
  
  console.log('\n🎉 비밀번호 수정 완료!');
  console.log('📝 모든 테스트 계정의 비밀번호: testPassword123!');
}

fixPasswords();
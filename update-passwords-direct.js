#!/usr/bin/env node
/**
 * bcrypt를 사용하여 비밀번호 해시를 직접 생성하고 데이터베이스 업데이트
 */

const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

// Service role 클라이언트
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const testEmails = [
  'creator1@test.com',
  'creator2@test.com', 
  'creator3@test.com',
  'business1@test.com',
  'business2@test.com',
  'admin@test.com'
];

const password = 'testPassword123!';

async function updatePasswordsDirectly() {
  console.log('🔐 비밀번호 해시 생성 및 직접 업데이트...');
  
  try {
    // bcrypt로 비밀번호 해시 생성 (Supabase 기본 설정: rounds=10)
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`🔑 생성된 해시: ${hashedPassword}`);
    
    for (const email of testEmails) {
      console.log(`\n📧 ${email} 업데이트 중...`);
      
      // 직접 SQL로 비밀번호 업데이트
      const { data, error } = await supabase.rpc('update_user_password', {
        user_email: email,
        new_password_hash: hashedPassword
      });
      
      if (error) {
        console.error(`   ❌ 업데이트 실패:`, error.message);
        
        // RPC가 없다면 직접 SQL 실행
        try {
          const { error: sqlError } = await supabase
            .from('auth.users')
            .update({ encrypted_password: hashedPassword })
            .eq('email', email);
            
          if (sqlError) {
            console.error(`   ❌ SQL 업데이트도 실패:`, sqlError.message);
          } else {
            console.log(`   ✅ SQL로 업데이트 성공`);
          }
        } catch (sqlErr) {
          console.error(`   💥 SQL 예외:`, sqlErr.message);
        }
      } else {
        console.log(`   ✅ RPC로 업데이트 성공`);
      }
    }
    
  } catch (err) {
    console.error('💥 예외 발생:', err.message);
  }
  
  console.log('\n🎉 비밀번호 업데이트 완료!');
  console.log(`📝 새 비밀번호: ${password}`);
}

updatePasswordsDirectly();
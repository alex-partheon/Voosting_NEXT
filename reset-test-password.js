require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function resetTestPassword() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
    return;
  }

  // Service Role 클라이언트 생성 (Admin 권한)
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('🔧 테스트 계정 비밀번호 재설정 시작...');
  
  const testAccounts = [
    { email: 'creator1@test.com', password: 'TestPassword123!' },
    { email: 'creator2@test.com', password: 'TestPassword123!' },
    { email: 'creator3@test.com', password: 'TestPassword123!' },
    { email: 'business1@test.com', password: 'TestPassword123!' },
    { email: 'business2@test.com', password: 'TestPassword123!' },
    { email: 'admin@test.com', password: 'TestPassword123!' }
  ];

  for (const account of testAccounts) {
    try {
      console.log(`\n🔄 ${account.email} 비밀번호 재설정 중...`);
      
      // Admin API를 사용하여 사용자 비밀번호 업데이트
      const { data, error } = await supabase.auth.admin.updateUserById(
        // 먼저 사용자 ID를 찾아야 함
        await getUserId(supabase, account.email),
        { password: account.password }
      );
      
      if (error) {
        console.error(`   ❌ 실패: ${error.message}`);
      } else {
        console.log(`   ✅ 성공: 비밀번호가 ${account.password}로 설정됨`);
      }
    } catch (err) {
      console.error(`   ❌ 오류: ${err.message}`);
    }
  }
  
  console.log('\n🎉 비밀번호 재설정 완료!');
}

async function getUserId(supabase, email) {
  const { data, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    throw new Error(`사용자 목록 조회 실패: ${error.message}`);
  }
  
  const user = data.users.find(u => u.email === email);
  if (!user) {
    throw new Error(`사용자를 찾을 수 없음: ${email}`);
  }
  
  return user.id;
}

resetTestPassword().catch(console.error);
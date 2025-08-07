require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function resetExistingPasswords() {
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

  console.log('🔧 기존 테스트 계정 비밀번호 재설정 시작...');
  
  const testUsers = [
    { id: 'd8eee43b-9aad-48c1-bfc2-bd77c9cc9c6d', email: 'creator1@test.com' },
    { id: '66587ca6-732c-41d4-b8cf-8e150585b1ed', email: 'creator2@test.com' },
    { id: 'ffaf0a56-987a-48eb-941d-0090851513ea', email: 'creator3@test.com' },
    { id: '5a32b8e3-0a49-410d-8e01-792a57928475', email: 'business1@test.com' },
    { id: 'efb5ff93-468d-42c8-a62e-231f8a862264', email: 'business2@test.com' },
    { id: '737cd321-2363-4d39-9583-59b021fd4cc3', email: 'admin@test.com' }
  ];
  
  const newPassword = 'TestPassword123!';
  
  try {
    for (const user of testUsers) {
      console.log(`\n🔑 ${user.email} 비밀번호 재설정 중...`);
      
      // 비밀번호 재설정
      const { data, error } = await supabase.auth.admin.updateUserById(
        user.id,
        { 
          password: newPassword,
          email_confirm: true
        }
      );
      
      if (error) {
        console.error(`❌ ${user.email} 비밀번호 재설정 실패:`, error.message);
        continue;
      }
      
      console.log(`✅ ${user.email} 비밀번호 재설정 성공`);
      
      // 로그인 테스트
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: newPassword
      });
      
      if (loginError) {
        console.error(`❌ ${user.email} 로그인 테스트 실패:`, loginError.message);
      } else {
        console.log(`✅ ${user.email} 로그인 테스트 성공`);
        await supabase.auth.signOut();
      }
    }
    
    console.log('\n🎉 모든 테스트 계정 비밀번호 재설정 완료!');
    console.log(`🔑 통일된 비밀번호: ${newPassword}`);
    
  } catch (err) {
    console.error('❌ 예상치 못한 오류:', err.message);
  }
}

resetExistingPasswords().catch(console.error);
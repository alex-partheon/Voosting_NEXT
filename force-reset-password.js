require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function forceResetPassword() {
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

  console.log('🔧 테스트 계정 비밀번호 강제 재설정 시작...');
  
  try {
    // creator1@test.com 계정의 사용자 ID 조회
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ 사용자 목록 조회 실패:', listError.message);
      return;
    }
    
    console.log(`📋 총 ${users.users.length}명의 사용자 발견`);
    
    const testUser = users.users.find(user => user.email === 'creator1@test.com');
    
    if (!testUser) {
      console.error('❌ creator1@test.com 사용자를 찾을 수 없습니다.');
      console.log('📋 존재하는 사용자들:');
      users.users.forEach(user => {
        console.log(`   - ${user.email} (ID: ${user.id})`);
      });
      return;
    }
    
    console.log(`✅ 사용자 발견: ${testUser.email} (ID: ${testUser.id})`);
    
    // 비밀번호 재설정
    const newPassword = 'NewTestPassword123!';
    const { data, error } = await supabase.auth.admin.updateUserById(
      testUser.id,
      { password: newPassword }
    );
    
    if (error) {
      console.error('❌ 비밀번호 재설정 실패:', error.message);
      return;
    }
    
    console.log(`✅ 비밀번호 재설정 성공!`);
    console.log(`🔑 새 비밀번호: ${newPassword}`);
    
    // 즉시 로그인 테스트
    console.log('\n🧪 로그인 테스트 시작...');
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'creator1@test.com',
      password: newPassword
    });
    
    if (loginError) {
      console.error('❌ 로그인 테스트 실패:', loginError.message);
    } else {
      console.log('✅ 로그인 테스트 성공!');
      console.log('👤 사용자 정보:', {
        id: loginData.user.id,
        email: loginData.user.email,
        created_at: loginData.user.created_at
      });
      
      // 로그아웃
      await supabase.auth.signOut();
      console.log('🚪 로그아웃 완료');
    }
    
  } catch (err) {
    console.error('❌ 예상치 못한 오류:', err.message);
  }
}

forceResetPassword().catch(console.error);
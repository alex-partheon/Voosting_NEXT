require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function createTestUsers() {
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

  console.log('👥 테스트 사용자 계정 생성 시작...');
  
  const testUsers = [
    {
      email: 'creator1@test.com',
      password: 'TestPassword123!',
      role: 'creator',
      full_name: 'Creator One',
      referral_code: 'CRT001'
    },
    {
      email: 'creator2@test.com', 
      password: 'TestPassword123!',
      role: 'creator',
      full_name: 'Creator Two',
      referral_code: 'CRT002',
      referred_by: 'CRT001'
    },
    {
      email: 'creator3@test.com',
      password: 'TestPassword123!', 
      role: 'creator',
      full_name: 'Creator Three',
      referral_code: 'CRT003',
      referred_by: 'CRT002'
    },
    {
      email: 'business1@test.com',
      password: 'TestPassword123!',
      role: 'business',
      full_name: 'Business One',
      referral_code: 'BIZ001'
    },
    {
      email: 'business2@test.com',
      password: 'TestPassword123!',
      role: 'business', 
      full_name: 'Business Two',
      referral_code: 'BIZ002'
    },
    {
      email: 'admin@test.com',
      password: 'TestPassword123!',
      role: 'admin',
      full_name: 'Admin User',
      referral_code: 'ADM001'
    }
  ];
  
  try {
    for (const user of testUsers) {
      console.log(`\n📝 사용자 생성 중: ${user.email}`);
      
      // 사용자 생성
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // 이메일 확인 건너뛰기
        user_metadata: {
          role: user.role,
          full_name: user.full_name,
          referral_code: user.referral_code,
          referred_by: user.referred_by || null
        }
      });
      
      if (error) {
        console.error(`❌ ${user.email} 생성 실패:`, error.message);
        continue;
      }
      
      console.log(`✅ ${user.email} 생성 성공 (ID: ${data.user.id})`);
      
      // 로그인 테스트
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });
      
      if (loginError) {
        console.error(`❌ ${user.email} 로그인 테스트 실패:`, loginError.message);
      } else {
        console.log(`✅ ${user.email} 로그인 테스트 성공`);
        await supabase.auth.signOut();
      }
    }
    
    console.log('\n🎉 모든 테스트 사용자 생성 완료!');
    
    // 최종 사용자 목록 확인
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (!listError) {
      console.log(`\n📋 총 ${users.users.length}명의 사용자 존재:`);
      users.users.forEach(user => {
        console.log(`   - ${user.email} (ID: ${user.id})`);
      });
    }
    
  } catch (err) {
    console.error('❌ 예상치 못한 오류:', err.message);
  }
}

createTestUsers().catch(console.error);
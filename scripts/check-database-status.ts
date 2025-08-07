#!/usr/bin/env tsx
/**
 * Supabase 데이터베이스 상태 종합 점검
 * Auth 설정, 트리거, RLS 정책 등을 확인합니다.
 * 
 * 사용법: npx tsx scripts/check-database-status.ts
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

async function checkDatabaseStatus() {
  console.log('🔍 Supabase 데이터베이스 종합 점검 시작...\n');
  console.log('📌 Supabase URL:', supabaseUrl);
  console.log('📌 Using Service Role Key\n');

  // 1. Auth 사용자 목록 확인
  console.log('\n1️⃣  Auth 사용자 확인');
  console.log('─'.repeat(50));
  try {
    const { data: users, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 10,
    });

    if (error) {
      console.error('❌ 사용자 목록 조회 실패:', error.message);
    } else {
      console.log(`✅ 총 ${users?.users?.length || 0}명의 사용자 존재`);
      users?.users?.forEach(user => {
        console.log(`   - ${user.email} (ID: ${user.id.substring(0, 8)}...)`);
        console.log(`     Created: ${new Date(user.created_at).toLocaleDateString()}`);
        console.log(`     Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
      });
    }
  } catch (err) {
    console.error('❌ 예외 발생:', err);
  }

  // 2. Profiles 테이블 확인
  console.log('\n2️⃣  Profiles 테이블 확인');
  console.log('─'.repeat(50));
  try {
    const { data: profiles, error, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: false })
      .limit(10);

    if (error) {
      console.error('❌ 프로필 조회 실패:', error.message);
    } else {
      console.log(`✅ 총 ${count || 0}개의 프로필 존재`);
      profiles?.forEach(profile => {
        console.log(`   - ${profile.email} (Role: ${profile.role})`);
        console.log(`     ID: ${profile.id.substring(0, 8)}...`);
        console.log(`     Referral: ${profile.referral_code || 'N/A'}`);
      });
    }
  } catch (err) {
    console.error('❌ 예외 발생:', err);
  }

  // 3. 테스트 계정 상태 확인
  console.log('\n3️⃣  테스트 계정 상태');
  console.log('─'.repeat(50));
  const testEmails = [
    'creator1@test.com',
    'creator2@test.com',
    'business1@test.com',
    'business2@test.com',
    'admin@test.com',
  ];

  for (const email of testEmails) {
    console.log(`\n🔍 확인 중: ${email}`);
    
    // Auth에서 확인
    const { data: users } = await supabase.auth.admin.listUsers();
    const authUser = users?.users?.find(u => u.email === email);
    
    if (authUser) {
      console.log(`   ✅ Auth: 존재 (ID: ${authUser.id.substring(0, 8)}...)`);
      console.log(`      Confirmed: ${authUser.email_confirmed_at ? 'Yes' : 'No'}`);
    } else {
      console.log(`   ❌ Auth: 존재하지 않음`);
    }
    
    // Profile에서 확인
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    if (profile) {
      console.log(`   ✅ Profile: 존재 (Role: ${profile.role})`);
    } else {
      console.log(`   ❌ Profile: 존재하지 않음`);
    }
  }

  // 4. Auth 설정 확인
  console.log('\n4️⃣  Auth 설정 확인');
  console.log('─'.repeat(50));
  try {
    // Auth 설정은 직접 확인할 수 없으므로 테스트 회원가입 시도
    const testEmail = `test_${Date.now()}@example.com`;
    const { data, error } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'testPassword123!',
      email_confirm: true,
    });

    if (error) {
      console.error('❌ 테스트 사용자 생성 실패:', error.message);
      if (error.message.includes('Database error')) {
        console.log('   ⚠️  데이터베이스 권한 문제가 있을 수 있습니다.');
        console.log('   💡 해결 방법:');
        console.log('      1. Supabase Dashboard → Settings → Database');
        console.log('      2. Connection Pooling 설정 확인');
        console.log('      3. Auth Schema 권한 확인');
      }
    } else if (data?.user) {
      console.log('✅ 테스트 사용자 생성 성공');
      
      // 생성된 테스트 사용자 삭제
      await supabase.auth.admin.deleteUser(data.user.id);
      console.log('   ✅ 테스트 사용자 삭제 완료');
    }
  } catch (err) {
    console.error('❌ Auth 설정 확인 실패:', err);
  }

  // 5. RLS 정책 확인 (SQL 쿼리로는 직접 확인 불가, 테스트로 확인)
  console.log('\n5️⃣  RLS 정책 테스트');
  console.log('─'.repeat(50));
  try {
    // Anon key로 테스트
    const anonClient = createClient(
      supabaseUrl!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data, error } = await anonClient
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.message.includes('row-level security')) {
        console.log('✅ RLS 정책이 활성화되어 있습니다.');
      } else {
        console.error('❌ RLS 테스트 실패:', error.message);
      }
    } else {
      console.log('⚠️  RLS 정책이 비활성화되어 있거나 너무 허용적입니다.');
    }
  } catch (err) {
    console.error('❌ RLS 테스트 실패:', err);
  }

  console.log('\n' + '═'.repeat(50));
  console.log('📊 점검 요약:');
  console.log('─'.repeat(50));
  console.log('1. Auth 사용자와 Profiles 동기화 확인 필요');
  console.log('2. 테스트 계정이 Auth에 없다면 Dashboard에서 생성 필요');
  console.log('3. "Database error" 발생 시 Supabase 프로젝트 설정 확인');
  console.log('4. RLS 정책이 올바르게 설정되어 있는지 확인');
  console.log('\n✅ 데이터베이스 점검 완료!');
}

// Run the check
checkDatabaseStatus().catch(console.error);
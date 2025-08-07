#!/usr/bin/env tsx
/**
 * Supabase Auth 권한 수정 검증 스크립트
 * SQL 수정 후 제대로 작동하는지 확인합니다.
 * 
 * 사용법: npx tsx scripts/verify-auth-fix.ts
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

interface TestResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

const results: TestResult[] = [];

async function addResult(test: string, status: TestResult['status'], message: string, details?: any) {
  results.push({ test, status, message, details });
  
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
  console.log(`${icon} ${test}`);
  console.log(`   ${message}`);
  if (details) {
    console.log(`   Details:`, details);
  }
}

async function verifyAuthFix() {
  console.log('🔍 Supabase Auth 권한 수정 검증 시작...\n');
  console.log('📌 Supabase URL:', supabaseUrl);
  console.log('📌 Using Service Role Key\n');

  // 1. 테스트용 사용자 생성 시도
  console.log('\n1️⃣  테스트 사용자 생성 테스트');
  console.log('─'.repeat(50));
  
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'testPassword123!';
  
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        role: 'creator',
        full_name: 'Test User',
        display_name: 'Tester',
      },
    });

    if (error) {
      await addResult(
        '사용자 생성 API',
        'fail',
        `여전히 오류 발생: ${error.message}`,
        error
      );
    } else if (data?.user) {
      await addResult(
        '사용자 생성 API',
        'pass',
        `성공! User ID: ${data.user.id}`,
        { email: testEmail, id: data.user.id }
      );

      // 2. 프로필 자동 생성 확인
      console.log('\n2️⃣  프로필 자동 생성 확인');
      console.log('─'.repeat(50));
      
      // 트리거 실행 시간을 위해 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        await addResult(
          '프로필 자동 생성',
          'fail',
          `프로필이 생성되지 않음: ${profileError.message}`,
          profileError
        );
      } else if (profile) {
        await addResult(
          '프로필 자동 생성',
          'pass',
          '프로필이 자동으로 생성됨',
          {
            email: profile.email,
            role: profile.role,
            referral_code: profile.referral_code,
            display_name: profile.display_name,
          }
        );
      }

      // 3. 추천 코드 유니크 확인
      console.log('\n3️⃣  추천 코드 유니크 확인');
      console.log('─'.repeat(50));
      
      if (profile?.referral_code) {
        const { data: duplicates, error: dupError } = await supabase
          .from('profiles')
          .select('email')
          .eq('referral_code', profile.referral_code);

        if (!dupError && duplicates) {
          if (duplicates.length === 1) {
            await addResult(
              '추천 코드 유니크',
              'pass',
              `추천 코드가 유니크함: ${profile.referral_code}`,
              { code: profile.referral_code }
            );
          } else {
            await addResult(
              '추천 코드 유니크',
              'fail',
              `추천 코드 중복 발견: ${duplicates.length}개`,
              { code: profile.referral_code, duplicates }
            );
          }
        }
      }

      // 4. 테스트 사용자 삭제
      console.log('\n4️⃣  테스트 사용자 정리');
      console.log('─'.repeat(50));
      
      const { error: deleteError } = await supabase.auth.admin.deleteUser(data.user.id);
      
      if (deleteError) {
        await addResult(
          '테스트 사용자 삭제',
          'warning',
          `삭제 실패: ${deleteError.message}`,
          { userId: data.user.id }
        );
      } else {
        await addResult(
          '테스트 사용자 삭제',
          'pass',
          '테스트 사용자 삭제 완료',
          { email: testEmail }
        );
      }
    }
  } catch (err: any) {
    await addResult(
      '사용자 생성 API',
      'fail',
      `예외 발생: ${err.message}`,
      err
    );
  }

  // 5. RLS 정책 테스트
  console.log('\n5️⃣  RLS 정책 무한 재귀 테스트');
  console.log('─'.repeat(50));
  
  try {
    // Anon 클라이언트로 테스트
    const anonClient = createClient(
      supabaseUrl!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data, error } = await anonClient
      .from('profiles')
      .select('id, email')
      .limit(1);
    
    if (error) {
      if (error.message.includes('infinite recursion')) {
        await addResult(
          'RLS 무한 재귀',
          'fail',
          '여전히 무한 재귀 문제 존재',
          error
        );
      } else if (error.message.includes('row-level security')) {
        await addResult(
          'RLS 무한 재귀',
          'pass',
          'RLS 정책 정상 작동 (무한 재귀 없음)',
          { message: 'RLS가 정상적으로 접근을 차단함' }
        );
      } else {
        await addResult(
          'RLS 무한 재귀',
          'warning',
          `다른 오류: ${error.message}`,
          error
        );
      }
    } else {
      await addResult(
        'RLS 무한 재귀',
        'warning',
        'RLS 정책이 너무 허용적일 수 있음',
        { recordsReturned: data?.length || 0 }
      );
    }
  } catch (err: any) {
    await addResult(
      'RLS 무한 재귀',
      'fail',
      `테스트 실패: ${err.message}`,
      err
    );
  }

  // 6. 기존 테스트 계정으로 로그인 테스트
  console.log('\n6️⃣  기존 테스트 계정 로그인 테스트');
  console.log('─'.repeat(50));
  
  const testAccounts = [
    { email: 'creator1@test.com', password: 'testPassword123!' },
    { email: 'business1@test.com', password: 'testPassword123!' },
  ];

  for (const account of testAccounts) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password,
      });

      if (error) {
        await addResult(
          `로그인: ${account.email}`,
          'warning',
          `로그인 실패: ${error.message}`,
          { email: account.email, error: error.message }
        );
      } else if (data?.user) {
        await addResult(
          `로그인: ${account.email}`,
          'pass',
          '로그인 성공',
          { email: account.email, userId: data.user.id }
        );
        
        // 로그아웃
        await supabase.auth.signOut();
      }
    } catch (err: any) {
      await addResult(
        `로그인: ${account.email}`,
        'fail',
        `예외 발생: ${err.message}`,
        err
      );
    }
  }

  // 결과 요약
  console.log('\n' + '═'.repeat(50));
  console.log('📊 검증 결과 요약');
  console.log('─'.repeat(50));
  
  const passCount = results.filter(r => r.status === 'pass').length;
  const failCount = results.filter(r => r.status === 'fail').length;
  const warnCount = results.filter(r => r.status === 'warning').length;
  
  console.log(`✅ 성공: ${passCount}개`);
  console.log(`❌ 실패: ${failCount}개`);
  console.log(`⚠️  경고: ${warnCount}개`);
  
  console.log('\n📋 상세 결과:');
  results.forEach(r => {
    const icon = r.status === 'pass' ? '✅' : r.status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${r.test}: ${r.message}`);
  });

  if (failCount === 0) {
    console.log('\n🎉 모든 주요 문제가 해결되었습니다!');
    console.log('테스트 계정을 생성할 수 있습니다.');
  } else {
    console.log('\n⚠️  아직 해결되지 않은 문제가 있습니다.');
    console.log('fix-supabase-permissions.sql을 다시 실행해보세요.');
  }
  
  console.log('\n✅ 검증 완료!');
}

// Run the verification
verifyAuthFix().catch(console.error);
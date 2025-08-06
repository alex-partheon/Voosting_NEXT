#!/usr/bin/env node

/**
 * Supabase 마이그레이션 순차 실행 스크립트
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase Admin 클라이언트 초기화
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const MIGRATIONS_DIR = './supabase/migrations';

/**
 * SQL 파일을 읽고 실행
 */
async function executeSQLFile(filename) {
  console.log(`🔄 실행 중: ${filename}`);
  
  try {
    const filePath = path.join(MIGRATIONS_DIR, filename);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // SQL을 세미콜론으로 분할하고 각각 실행
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
      .filter(s => s.toLowerCase() !== 'commit' && s.toLowerCase() !== 'begin');

    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', {
          sql: statement
        });
        
        if (error) {
          // exec_sql RPC가 없다면 다른 방법 시도
          console.log(`   ℹ️ RPC 방식 실패, 직접 실행 시도...`);
          throw new Error(`SQL 실행 실패: ${error.message}`);
        }
      }
    }
    
    console.log(`✅ 완료: ${filename}`);
    return true;
  } catch (error) {
    console.error(`❌ 실패: ${filename}`);
    console.error(`   오류: ${error.message}`);
    return false;
  }
}

/**
 * 특정 마이그레이션 파일 실행
 */
async function runMigration(filename) {
  console.log(`\n📂 마이그레이션 실행: ${filename}`);
  
  const filePath = path.join(MIGRATIONS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ 파일 없음: ${filename}`);
    return false;
  }
  
  const sql = fs.readFileSync(filePath, 'utf8');
  console.log(`\n--- SQL 내용 미리보기 ---`);
  console.log(sql.substring(0, 200) + '...');
  console.log(`--- 실행 계속 ---\n`);
  
  // 실제 환경에서는 Supabase Studio SQL Editor에서 실행하는 것을 권장
  console.log(`⚠️ 이 SQL을 Supabase Studio > SQL Editor에서 실행해주세요:`);
  console.log(`\n${'='.repeat(60)}`);
  console.log(sql);
  console.log(`${'='.repeat(60)}\n`);
  
  return true;
}

/**
 * 메인 실행 함수
 */
async function main() {
  const migrationFile = process.argv[2];
  
  if (!migrationFile) {
    console.log('사용법: node apply-migration.js <migration-file>');
    console.log('예시: node apply-migration.js 001_initial_schema.sql');
    process.exit(1);
  }
  
  console.log('🎯 Supabase 마이그레이션 실행기');
  console.log(`대상: ${migrationFile}`);
  
  const success = await runMigration(migrationFile);
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main();
}
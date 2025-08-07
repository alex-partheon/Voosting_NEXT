#!/usr/bin/env node
/**
 * Supabase MCP Server를 통한 데이터베이스 상태 점검
 * 
 * 사용법: node scripts/mcp-check-database.js
 */

const { spawn } = require('child_process');
const readline = require('readline');

// 환경 변수
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || 'sbp_197d4fbc4e2458c7fbdc5d8a4d84aca4bf9eb440';
const PROJECT_REF = 'qcyksavfyzivprsjhuxn';

// MCP Server 프로세스 시작
const mcp = spawn('npx', [
  '-y',
  '@supabase/mcp-server-supabase@latest',
  '--read-only',
  `--project-ref=${PROJECT_REF}`
], {
  env: {
    ...process.env,
    SUPABASE_ACCESS_TOKEN,
  },
  stdio: ['pipe', 'pipe', 'pipe']
});

// MCP 통신을 위한 JSON-RPC 메시지 생성
function createRequest(method, params = {}) {
  return JSON.stringify({
    jsonrpc: '2.0',
    method,
    params,
    id: Date.now()
  }) + '\n';
}

// MCP Server로 쿼리 실행
async function executeQuery(query) {
  return new Promise((resolve, reject) => {
    const request = createRequest('tools/execute', {
      name: 'query',
      arguments: { query }
    });

    mcp.stdin.write(request);

    const rl = readline.createInterface({
      input: mcp.stdout,
      crlfDelay: Infinity
    });

    rl.on('line', (line) => {
      try {
        const response = JSON.parse(line);
        if (response.id && response.result) {
          rl.close();
          resolve(response.result);
        } else if (response.error) {
          rl.close();
          reject(new Error(response.error.message));
        }
      } catch (e) {
        // JSON이 아닌 출력 무시
      }
    });

    setTimeout(() => {
      rl.close();
      reject(new Error('Query timeout'));
    }, 10000);
  });
}

// 데이터베이스 상태 점검
async function checkDatabaseStatus() {
  console.log('🔍 Supabase 데이터베이스 상태 점검 시작...\n');
  console.log('📌 Project Ref:', PROJECT_REF);
  console.log('📌 Using MCP Server\n');

  const checks = [
    {
      name: 'Auth 트리거 확인',
      query: `SELECT proname, prosrc FROM pg_proc WHERE proname = 'handle_new_user';`
    },
    {
      name: 'Profiles 테이블 RLS 정책',
      query: `SELECT schemaname, tablename, policyname, cmd, qual 
              FROM pg_policies WHERE tablename = 'profiles';`
    },
    {
      name: '기존 사용자 수',
      query: `SELECT COUNT(*) as user_count FROM auth.users;`
    },
    {
      name: '기존 프로필 수',
      query: `SELECT COUNT(*) as profile_count FROM profiles;`
    },
    {
      name: '최근 생성된 프로필',
      query: `SELECT id, email, role, created_at 
              FROM profiles 
              ORDER BY created_at DESC 
              LIMIT 5;`
    },
    {
      name: 'Auth 스키마 권한',
      query: `SELECT grantee, privilege_type 
              FROM information_schema.table_privileges 
              WHERE table_schema = 'auth' 
              AND table_name = 'users' 
              LIMIT 10;`
    }
  ];

  for (const check of checks) {
    console.log(`\n📊 ${check.name}`);
    console.log('─'.repeat(50));
    
    try {
      const result = await executeQuery(check.query);
      console.log('✅ 쿼리 성공');
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('❌ 쿼리 실패:', error.message);
    }
  }

  console.log('\n' + '═'.repeat(50));
  console.log('✅ 데이터베이스 상태 점검 완료!\n');

  // MCP Server 종료
  mcp.kill();
  process.exit(0);
}

// 에러 핸들링
mcp.on('error', (error) => {
  console.error('❌ MCP Server 시작 실패:', error.message);
  process.exit(1);
});

mcp.stderr.on('data', (data) => {
  const message = data.toString();
  if (message.includes('Error') || message.includes('error')) {
    console.error('❌ MCP Server 에러:', message);
  }
});

// 프로세스 시작 대기
setTimeout(() => {
  checkDatabaseStatus().catch(console.error);
}, 2000);
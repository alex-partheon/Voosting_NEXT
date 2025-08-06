#!/usr/bin/env node

/**
 * Clerk 사용자 목록 확인
 */

require('dotenv').config({ path: '.env.local' });
const { createClerkClient } = require('@clerk/clerk-sdk-node');

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

async function listUsers() {
  try {
    console.log('👥 Clerk 사용자 목록 조회...\n');

    // 모든 사용자 조회
    const users = await clerk.users.getUserList({
      limit: 20
    });

    console.log('응답 구조:', typeof users, Object.keys(users));
    
    // 응답이 배열인지 객체인지 확인
    const userList = Array.isArray(users) ? users : users.data || users;
    
    console.log(`총 사용자: ${userList.length}명\n`);

    if (userList.length === 0) {
      console.log('등록된 사용자가 없습니다.');
      return userList;
    }

    // 테스트 이메일 목록
    const testEmails = ['creator1@test.com', 'creator2@test.com', 'creator3@test.com', 'business1@test.com', 'business2@test.com', 'admin@test.com'];

    console.log('📋 전체 사용자:');
    userList.forEach((user, index) => {
      const email = user.emailAddresses[0]?.emailAddress || 'No email';
      const isTestAccount = testEmails.includes(email);
      const marker = isTestAccount ? '🧪' : '👤';
      
      console.log(`${marker} ${index + 1}. ${user.firstName} ${user.lastName} (${email})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   생성일: ${new Date(user.createdAt).toLocaleString()}`);
      console.log('');
    });

    // 테스트 계정만 필터링
    const testUsers = userList.filter(user => {
      const email = user.emailAddresses[0]?.emailAddress;
      return testEmails.includes(email);
    });

    if (testUsers.length > 0) {
      console.log('\n🧪 테스트 계정:');
      testUsers.forEach(user => {
        const email = user.emailAddresses[0]?.emailAddress;
        console.log(`- ${email}: ${user.id}`);
      });
    }

    return userList;

  } catch (error) {
    console.error('❌ 사용자 목록 조회 실패:', error.message);
    return [];
  }
}

listUsers().then(users => {
  console.log(`\n✅ 조회 완료: ${users.length}명`);
});
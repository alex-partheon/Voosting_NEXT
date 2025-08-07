/**
 * E2E 인증 테스트를 위한 설정 및 헬퍼 유틸리티
 * 
 * 이 파일은 인증 테스트에 필요한 데이터베이스 설정, 
 * 테스트 사용자 관리, 환경 초기화를 담당합니다.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/types/database.types';

// 테스트 환경용 Supabase 클라이언트
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export interface TestUser {
  email: string;
  password: string;
  role: 'creator' | 'business' | 'admin';
  profile?: {
    name?: string;
    company_name?: string;
    referral_code?: string;
  };
}

export const TEST_USERS: Record<string, TestUser> = {
  creator: {
    email: 'test-creator@voosting.app',
    password: 'TestPassword123!',
    role: 'creator',
    profile: {
      name: '테스트 크리에이터',
      referral_code: 'CREATOR123'
    }
  },
  business: {
    email: 'test-business@voosting.app', 
    password: 'TestPassword123!',
    role: 'business',
    profile: {
      name: '테스트 비즈니스',
      company_name: '테스트 회사'
    }
  },
  admin: {
    email: 'test-admin@voosting.app',
    password: 'TestPassword123!',
    role: 'admin',
    profile: {
      name: '테스트 관리자'
    }
  },
  unverified: {
    email: 'unverified@voosting.app',
    password: 'TestPassword123!',
    role: 'creator',
    profile: {
      name: '미인증 사용자'
    }
  }
};

export class AuthTestSetup {
  private supabase = supabaseAdmin;

  /**
   * 테스트 환경 초기화
   */
  async initializeTestEnvironment(): Promise<void> {
    console.log('🔧 테스트 환경 초기화 시작...');
    
    try {
      // 1. 기존 테스트 데이터 정리
      await this.cleanupTestData();
      
      // 2. 테스트 사용자 생성
      await this.createTestUsers();
      
      console.log('✅ 테스트 환경 초기화 완료');
    } catch (error) {
      console.error('❌ 테스트 환경 초기화 실패:', error);
      throw error;
    }
  }

  /**
   * 테스트 사용자 계정 생성
   */
  async createTestUsers(): Promise<void> {
    console.log('👥 테스트 사용자 생성 중...');

    for (const [key, user] of Object.entries(TEST_USERS)) {
      try {
        // Supabase Auth 사용자 생성
        const { data: authUser, error: authError } = await this.supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: key !== 'unverified', // unverified 사용자만 이메일 미인증 상태
          user_metadata: {
            role: user.role,
            name: user.profile?.name
          }
        });

        if (authError) {
          // 이미 존재하는 사용자인 경우 무시
          if (authError.message.includes('already registered')) {
            console.log(`⏭️ 사용자 이미 존재: ${user.email}`);
            continue;
          }
          throw authError;
        }

        if (authUser.user) {
          // 프로필 테이블에 사용자 정보 생성
          const { error: profileError } = await this.supabase
            .from('profiles')
            .upsert({
              id: authUser.user.id,
              email: user.email,
              role: user.role,
              name: user.profile?.name,
              company_name: user.profile?.company_name,
              referral_code: user.profile?.referral_code || `TEST${Date.now()}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (profileError) {
            console.warn(`⚠️ 프로필 생성 실패: ${user.email}`, profileError);
          } else {
            console.log(`✅ 테스트 사용자 생성: ${user.email} (${user.role})`);
          }
        }

      } catch (error) {
        console.error(`❌ 사용자 생성 실패: ${user.email}`, error);
        // 개별 사용자 생성 실패가 전체 테스트를 중단시키지 않도록 함
      }
    }
  }

  /**
   * 특정 테스트 사용자 삭제
   */
  async deleteTestUser(email: string): Promise<void> {
    try {
      // 1. Auth 사용자 조회
      const { data: users, error: listError } = await this.supabase.auth.admin.listUsers();
      
      if (listError) {
        throw listError;
      }

      const targetUser = users.users.find(u => u.email === email);
      
      if (targetUser) {
        // 2. 프로필 삭제 (cascade로 연관 데이터도 삭제됨)
        await this.supabase
          .from('profiles')
          .delete()
          .eq('id', targetUser.id);

        // 3. Auth 사용자 삭제
        await this.supabase.auth.admin.deleteUser(targetUser.id);
        
        console.log(`🗑️ 테스트 사용자 삭제: ${email}`);
      }
    } catch (error) {
      console.error(`❌ 사용자 삭제 실패: ${email}`, error);
    }
  }

  /**
   * 모든 테스트 데이터 정리
   */
  async cleanupTestData(): Promise<void> {
    console.log('🧹 테스트 데이터 정리 중...');

    try {
      // 1. 테스트 이메일 패턴으로 사용자 조회 후 삭제
      const testEmailPatterns = [
        '@voosting.app',
        'test-creator@',
        'test-business@',
        'test-admin@',
        'unverified@',
        'creator-test-',
        'business-test-'
      ];

      const { data: users, error: listError } = await this.supabase.auth.admin.listUsers();
      
      if (listError) {
        throw listError;
      }

      const testUsers = users.users.filter(user => 
        testEmailPatterns.some(pattern => user.email?.includes(pattern))
      );

      for (const user of testUsers) {
        if (user.email) {
          await this.deleteTestUser(user.email);
        }
      }

      // 2. 테스트 관련 캠페인, 페이지 등 데이터 정리
      await this.cleanupCampaignData();
      await this.cleanupPageData();

      console.log('✅ 테스트 데이터 정리 완료');

    } catch (error) {
      console.error('❌ 테스트 데이터 정리 실패:', error);
      // 정리 실패가 테스트 진행을 막지 않도록 오류를 삼킴
    }
  }

  /**
   * 테스트 캠페인 데이터 정리
   */
  private async cleanupCampaignData(): Promise<void> {
    try {
      // 테스트 캠페인 삭제
      await this.supabase
        .from('campaigns')
        .delete()
        .like('title', '%테스트%');

      console.log('🗑️ 테스트 캠페인 데이터 정리 완료');
    } catch (error) {
      console.warn('⚠️ 캠페인 데이터 정리 중 오류:', error);
    }
  }

  /**
   * 테스트 페이지 데이터 정리
   */
  private async cleanupPageData(): Promise<void> {
    try {
      // 테스트 페이지 삭제
      await this.supabase
        .from('creator_pages')
        .delete()
        .like('slug', '%test%');

      console.log('🗑️ 테스트 페이지 데이터 정리 완료');
    } catch (error) {
      console.warn('⚠️ 페이지 데이터 정리 중 오류:', error);
    }
  }

  /**
   * 데이터베이스 연결 상태 확인
   */
  async checkDatabaseConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (error) {
        console.error('❌ 데이터베이스 연결 실패:', error);
        return false;
      }

      console.log('✅ 데이터베이스 연결 정상');
      return true;
    } catch (error) {
      console.error('❌ 데이터베이스 연결 확인 중 오류:', error);
      return false;
    }
  }

  /**
   * 테스트 사용자로 로그인 토큰 생성
   */
  async generateTestToken(email: string): Promise<string | null> {
    try {
      const { data, error } = await this.supabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: {
          redirectTo: 'http://localhost:3002/dashboard'
        }
      });

      if (error || !data.properties?.action_link) {
        console.error('토큰 생성 실패:', error);
        return null;
      }

      // URL에서 토큰 추출
      const url = new URL(data.properties.action_link);
      return url.searchParams.get('token');

    } catch (error) {
      console.error('토큰 생성 중 오류:', error);
      return null;
    }
  }

  /**
   * 테스트 환경 검증
   */
  async validateTestEnvironment(): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      // 1. 데이터베이스 연결 확인
      const dbConnected = await this.checkDatabaseConnection();
      if (!dbConnected) {
        issues.push('데이터베이스 연결 실패');
      }

      // 2. 필요한 환경 변수 확인
      const requiredEnvVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY'
      ];

      for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
          issues.push(`환경 변수 누락: ${envVar}`);
        }
      }

      // 3. 테스트 사용자 존재 확인
      const { data: users } = await this.supabase.auth.admin.listUsers();
      const testUserEmails = Object.values(TEST_USERS).map(u => u.email);
      
      for (const email of testUserEmails) {
        const exists = users?.users.some(u => u.email === email);
        if (!exists) {
          issues.push(`테스트 사용자 누락: ${email}`);
        }
      }

      return {
        isValid: issues.length === 0,
        issues
      };

    } catch (error) {
      issues.push(`환경 검증 중 오류: ${error}`);
      return {
        isValid: false,
        issues
      };
    }
  }
}

// 전역 테스트 설정 인스턴스
export const authTestSetup = new AuthTestSetup();

/**
 * 테스트 실행 전 환경 설정
 * playwright.config.ts의 globalSetup에서 사용
 */
export async function globalSetup(): Promise<void> {
  console.log('🚀 E2E 테스트 글로벌 설정 시작...');
  
  try {
    await authTestSetup.initializeTestEnvironment();
    
    const validation = await authTestSetup.validateTestEnvironment();
    
    if (!validation.isValid) {
      console.error('❌ 테스트 환경 검증 실패:');
      validation.issues.forEach(issue => console.error(`  - ${issue}`));
      throw new Error('테스트 환경이 올바르게 설정되지 않았습니다.');
    }

    console.log('✅ E2E 테스트 환경 준비 완료');
    
  } catch (error) {
    console.error('❌ 글로벌 설정 실패:', error);
    process.exit(1);
  }
}

/**
 * 테스트 실행 후 정리
 * playwright.config.ts의 globalTeardown에서 사용
 */
export async function globalTeardown(): Promise<void> {
  console.log('🧹 E2E 테스트 글로벌 정리 시작...');
  
  try {
    await authTestSetup.cleanupTestData();
    console.log('✅ E2E 테스트 정리 완료');
  } catch (error) {
    console.error('❌ 글로벌 정리 실패:', error);
  }
}
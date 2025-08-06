/**
 * Supabase 서버 사이드 클라이언트
 * Next.js 서버 컴포넌트, Route Handler, 서버 액션에서 사용
 */

import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
// Removed Clerk dependency - using pure Supabase Auth
import { env } from '@/lib/env';
import type { Database } from '@/types/database.types';

/**
 * 서버 사이드 Supabase 클라이언트 생성
 * Clerk 인증과 통합되어 RLS 정책이 자동으로 적용됨
 */
export async function createServerClient() {
  const cookieStore = await cookies();

  const client = createSupabaseServerClient<Database>(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // 미들웨어에서는 쿠키 설정 불가 - 무시
            if (error instanceof Error && error.message.includes('cookies')) {
              return;
            }
            throw error;
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // 미들웨어에서는 쿠키 설정 불가 - 무시
            if (error instanceof Error && error.message.includes('cookies')) {
              return;
            }
            throw error;
          }
        },
      },
    }
  );

  return client;
}

/**
 * 관리자 권한이 필요한 서버 작업용 클라이언트
 * Service Role Key를 사용하여 RLS 정책을 우회
 */
export function createAdminClient() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations');
  }

  return createSupabaseServerClient<Database>(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        get() { return undefined; },
        set() {},
        remove() {},
      },
    }
  );
}

/**
 * 타입 안전한 데이터베이스 쿼리 헬퍼
 */
export class DatabaseService {
  private client: ReturnType<typeof createSupabaseServerClient<Database>>;

  constructor(client: ReturnType<typeof createSupabaseServerClient<Database>>) {
    this.client = client;
  }

  /**
   * 현재 사용자 프로필 조회
   */
  async getCurrentUserProfile() {
    const { data: { user } } = await this.client.auth.getUser();
    
    if (!user) {
      return { data: null, error: { message: 'Not authenticated' } };
    }

    return await this.client
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
  }

  /**
   * 사용자 프로필 업데이트
   */
  async updateUserProfile(updates: Partial<Database['public']['Tables']['profiles']['Update']>) {
    const { data: { user } } = await this.client.auth.getUser();
    
    if (!user) {
      return { data: null, error: { message: 'Not authenticated' } };
    }

    return await this.client
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();
  }

  /**
   * 사용자 프로필 생성 또는 업데이트
   */
  async upsertUserProfile(profileData: Database['public']['Tables']['profiles']['Insert']) {
    return await this.client
      .from('profiles')
      .upsert(profileData)
      .select()
      .single();
  }

  /**
   * 추천 관계 조회
   */
  async getReferralRelationships(userId: string) {
    return await this.client
      .from('profiles')
      .select(`
        id,
        referral_code,
        referrer_l1_id,
        referrer_l2_id,
        referrer_l3_id,
        referrer_l1:profiles!referrer_l1_id(id, full_name, email),
        referrer_l2:profiles!referrer_l2_id(id, full_name, email),
        referrer_l3:profiles!referrer_l3_id(id, full_name, email)
      `)
      .eq('id', userId)
      .single();
  }

  /**
   * 추천받은 사용자 목록 조회
   */
  async getReferredUsers(userId: string, level: 1 | 2 | 3 = 1) {
    const column = `referrer_l${level}_id`;
    
    return await this.client
      .from('profiles')
      .select('id, full_name, email, created_at')
      .eq(column, userId)
      .order('created_at', { ascending: false });
  }
}

/**
 * 서버 사이드에서 사용할 수 있는 데이터베이스 서비스 인스턴스 생성
 */
export async function createDatabaseService() {
  const client = await createServerClient();
  return new DatabaseService(client);
}

/**
 * 관리자용 데이터베이스 서비스 인스턴스 생성
 */
export function createAdminDatabaseService() {
  const client = createAdminClient();
  return new DatabaseService(client);
}

/**
 * RLS 정책에서 사용할 수 있는 헬퍼 함수들
 * Supabase Auth를 사용하므로 RLS는 자동으로 auth.uid()를 통해 처리됨
 */
export const rls = {
  /**
   * 현재 사용자 확인 (디버깅용)
   */
  async getCurrentUser(client: ReturnType<typeof createSupabaseServerClient<Database>>) {
    return await client.auth.getUser();
  },

  /**
   * 사용자 세션 확인 (디버깅용)
   */
  async getCurrentSession(client: ReturnType<typeof createSupabaseServerClient<Database>>) {
    return await client.auth.getSession();
  },
};

/**
 * 에러 핸들링 유틸리티
 */
export function handleSupabaseError(error: any) {
  console.error('Supabase error:', error);
  
  if (error.code === 'PGRST116') {
    return {
      message: 'Record not found',
      code: 'NOT_FOUND',
    };
  }
  
  if (error.code === 'PGRST301') {
    return {
      message: 'Unauthorized access',
      code: 'UNAUTHORIZED',
    };
  }
  
  return {
    message: error.message || 'An unexpected error occurred',
    code: error.code || 'UNKNOWN_ERROR',
  };
}

/**
 * 미들웨어에서 사용할 수 있는 간단한 클라이언트
 * 쿠키 설정이 제한적인 환경에서 사용
 */
export function createMiddlewareClient() {
  return createSupabaseServerClient<Database>(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          // 미들웨어에서는 읽기만 가능
          return undefined;
        },
        set() {
          // 미들웨어에서는 쿠키 설정 불가
        },
        remove() {
          // 미들웨어에서는 쿠키 설정 불가
        },
      },
    }
  );
}
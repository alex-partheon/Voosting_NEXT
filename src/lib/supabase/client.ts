/**
 * Supabase 클라이언트 사이드 클라이언트
 * 브라우저에서 사용되는 싱글톤 패턴 구현
 */

import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';
import { env } from '@/lib/env';
import type { Database } from '@/types/database.types';

/**
 * 브라우저 전용 Supabase 클라이언트 (싱글톤)
 */
let supabaseClient: ReturnType<typeof createSupabaseBrowserClient<Database>> | null = null;

/**
 * 브라우저 사이드 Supabase 클라이언트 생성 (싱글톤 패턴)
 * 실시간 구독과 자동 토큰 갱신을 지원
 */
export function createBrowserClient() {
  // 서버 사이드에서는 실행하지 않음
  if (typeof window === 'undefined') {
    throw new Error('createBrowserClient can only be used in browser environment');
  }

  // 이미 생성된 클라이언트가 있으면 재사용
  if (supabaseClient) {
    return supabaseClient;
  }

  // 새 클라이언트 생성
  supabaseClient = createSupabaseBrowserClient<Database>(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY
  );

  return supabaseClient;
}

/**
 * 현재 브라우저 클라이언트 인스턴스 반환
 * 없으면 새로 생성
 */
export function getSupabaseClient() {
  return createBrowserClient();
}

/**
 * 클라이언트 사이드에서 사용할 수 있는 데이터베이스 서비스
 */
export class ClientDatabaseService {
  private client: ReturnType<typeof createSupabaseBrowserClient<Database>>;

  constructor() {
    this.client = createBrowserClient();
  }

  /**
   * 현재 인증된 사용자 정보 가져오기
   */
  async getCurrentUser() {
    const { data: { user }, error } = await this.client.auth.getUser();
    
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    
    return user;
  }

  /**
   * 현재 사용자 프로필 조회
   */
  async getCurrentUserProfile() {
    const user = await this.getCurrentUser();
    
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
    const user = await this.getCurrentUser();
    
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
   * 실시간 구독 생성
   */
  createRealtimeSubscription<T = any>(
    table: keyof Database['public']['Tables'],
    filter?: string,
    callback?: (payload: any) => void
  ) {
    const subscription = this.client
      .channel(`realtime:${table}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table as string,
          filter: filter,
        },
        (payload) => {
          console.log('Realtime update:', payload);
          if (callback) {
            callback(payload);
          }
        }
      )
      .subscribe();

    return {
      subscription,
      unsubscribe: () => {
        this.client.removeChannel(subscription);
      },
    };
  }

  /**
   * 캠페인 실시간 구독
   */
  subscribeToCampaigns(userId: string, callback: (payload: any) => void) {
    return this.createRealtimeSubscription(
      'campaigns',
      `creator_id=eq.${userId}`,
      callback
    );
  }

  /**
   * 수익 실시간 구독
   */
  subscribeToEarnings(userId: string, callback: (payload: any) => void) {
    return this.createRealtimeSubscription(
      'referral_earnings',
      `user_id=eq.${userId}`,
      callback
    );
  }

  /**
   * 애플리케이션 실시간 구독
   */
  subscribeToApplications(userId: string, callback: (payload: any) => void) {
    return this.createRealtimeSubscription(
      'campaign_applications',
      `applicant_id=eq.${userId}`,
      callback
    );
  }

  /**
   * 파일 업로드
   */
  async uploadFile(
    bucket: string,
    path: string,
    file: File,
    options?: {
      cacheControl?: string;
      contentType?: string;
      upsert?: boolean;
    }
  ) {
    const { data, error } = await this.client.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: options?.cacheControl || '3600',
        contentType: options?.contentType || file.type,
        upsert: options?.upsert || false,
      });

    if (error) {
      console.error('File upload error:', error);
      return { data: null, error };
    }

    // 공개 URL 생성
    const { data: publicUrlData } = this.client.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      data: {
        ...data,
        publicUrl: publicUrlData.publicUrl,
      },
      error: null,
    };
  }

  /**
   * 파일 삭제
   */
  async deleteFile(bucket: string, paths: string[]) {
    return await this.client.storage
      .from(bucket)
      .remove(paths);
  }

  /**
   * 파일 목록 조회
   */
  async listFiles(bucket: string, folder?: string) {
    return await this.client.storage
      .from(bucket)
      .list(folder);
  }
}

/**
 * 클라이언트 사이드 데이터베이스 서비스 싱글톤 인스턴스
 */
let databaseService: ClientDatabaseService | null = null;

/**
 * 데이터베이스 서비스 인스턴스 반환
 */
export function getDatabaseService() {
  if (typeof window === 'undefined') {
    throw new Error('getDatabaseService can only be used in browser environment');
  }

  if (!databaseService) {
    databaseService = new ClientDatabaseService();
  }

  return databaseService;
}

/**
 * 에러 핸들링 유틸리티
 */
export function handleClientError(error: any) {
  console.error('Supabase client error:', error);
  
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
  
  if (error.message?.includes('JWT')) {
    return {
      message: 'Authentication session expired',
      code: 'AUTH_EXPIRED',
    };
  }
  
  return {
    message: error.message || 'An unexpected error occurred',
    code: error.code || 'UNKNOWN_ERROR',
  };
}

/**
 * 인증 상태 변경 리스너
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  const client = createBrowserClient();
  
  return client.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session);
    callback(event, session);
  });
}

/**
 * 세션 새로고침
 */
export async function refreshSession() {
  const client = createBrowserClient();
  
  const { data, error } = await client.auth.refreshSession();
  
  if (error) {
    console.error('Session refresh error:', error);
    return { data: null, error };
  }
  
  return { data, error: null };
}

/**
 * 현재 세션 가져오기
 */
export async function getSession() {
  const client = createBrowserClient();
  
  const { data: { session }, error } = await client.auth.getSession();
  
  if (error) {
    console.error('Get session error:', error);
    return { session: null, error };
  }
  
  return { session, error: null };
}

/**
 * 클라이언트 리셋 (테스트용)
 */
export function resetClient() {
  supabaseClient = null;
  databaseService = null;
}
/**
 * Supabase React Hook
 * 클라이언트 사이드에서 Supabase Auth와 데이터 관리
 * Migrated from Clerk to Supabase Auth
 */

'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { 
  createBrowserClient, 
  getDatabaseService, 
  onAuthStateChange,
  handleClientError,
  type ClientDatabaseService 
} from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

type UserProfile = Database['public']['Tables']['profiles']['Row'];
type UserRole = Database['public']['Enums']['user_role'];

interface UseSupabaseState {
  // 인증 상태
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  
  // 사용자 데이터
  profile: UserProfile | null;
  userRole: UserRole | null;
  
  // 에러 상태
  error: string | null;
  
  // 데이터베이스 서비스
  db: ClientDatabaseService;
  
  // 유틸리티 함수
  refreshProfile: () => Promise<void>;
  clearError: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  signOut: () => Promise<void>;
}

/**
 * Supabase Auth와 데이터베이스를 통합한 React Hook
 */
export function useSupabase(): UseSupabaseState {
  // 상태 관리
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // 데이터베이스 서비스 인스턴스 (메모이제이션)
  const db = useMemo(() => {
    try {
      return getDatabaseService();
    } catch (err) {
      console.error('Failed to create database service:', err);
      setError('Database service initialization failed');
      // 임시 객체 반환 (실제 사용 시 에러 발생)
      return {} as ClientDatabaseService;
    }
  }, []);

  // 프로필 새로고침 함수
  const refreshProfile = useCallback(async () => {
    if (!user?.id) {
      setProfile(null);
      return;
    }

    setIsLoadingProfile(true);
    setError(null);

    try {
      const { data: profileData, error: profileError } = await db.getCurrentUserProfile();

      if (profileError) {
        const errorInfo = handleClientError(profileError);
        setError(errorInfo.message);
        setProfile(null);
      } else {
        setProfile(profileData);
      }
    } catch (err) {
      console.error('Error refreshing profile:', err);
      setError('Failed to load user profile');
      setProfile(null);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [user?.id, db]);

  // 프로필 업데이트 함수
  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!user?.id) {
      setError('Not authenticated');
      return false;
    }

    setError(null);

    try {
      const { data, error: updateError } = await db.updateUserProfile(updates);

      if (updateError) {
        const errorInfo = handleClientError(updateError);
        setError(errorInfo.message);
        return false;
      }

      if (data) {
        setProfile(data);
      }

      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
      return false;
    }
  }, [user?.id, db]);

  // 로그아웃 함수
  const signOut = useCallback(async () => {
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        setError('Failed to sign out');
      } else {
        setUser(null);
        setProfile(null);
        setError(null);
      }
    } catch (err) {
      console.error('Sign out error:', err);
      setError('Failed to sign out');
    }
  }, []);

  // 에러 클리어 함수
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 사용자 세션 초기화 및 인증 상태 변경 감지
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const supabase = createBrowserClient();

    // 현재 세션 확인
    const getSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setError('Failed to get session');
          setUser(null);
        } else {
          setUser(session?.user || null);
        }
      } catch (err) {
        console.error('Session initialization error:', err);
        setError('Failed to initialize session');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // 실시간 인증 상태 변경 감지
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      console.log('Supabase auth state changed:', event, session);
      
      setUser(session?.user || null);
      
      if (event === 'SIGNED_IN' && session?.user) {
        // 로그인 시 프로필 로드
        setUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        // 로그아웃 시 상태 초기화
        setUser(null);
        setProfile(null);
        setError(null);
      }
    });

    return () => {
      subscription?.unsubscribe?.();
    };
  }, []);

  // 사용자 변경 시 프로필 새로고침
  useEffect(() => {
    if (user?.id) {
      refreshProfile();
    } else {
      setProfile(null);
      setError(null);
    }
  }, [user?.id, refreshProfile]);

  // 계산된 값들
  const isAuthenticated = !!user && !isLoading;
  const userRole = profile?.role || null;
  const finalIsLoading = isLoading || isLoadingProfile;

  return {
    // 인증 상태
    isLoading: finalIsLoading,
    isAuthenticated,
    user,
    
    // 사용자 데이터
    profile,
    userRole,
    
    // 에러 상태
    error,
    
    // 데이터베이스 서비스
    db,
    
    // 유틸리티 함수
    refreshProfile,
    clearError,
    updateProfile,
    signOut,
  };
}

/**
 * 특정 역할이 필요한 컴포넌트에서 사용하는 Hook
 */
export function useRequireRole(requiredRole: UserRole | UserRole[]) {
  const { userRole, isLoading, isAuthenticated } = useSupabase();
  
  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  const hasRequiredRole = userRole ? allowedRoles.includes(userRole) : false;
  
  return {
    isLoading,
    isAuthenticated,
    hasRequiredRole,
    userRole,
    canAccess: isAuthenticated && hasRequiredRole,
  };
}

/**
 * 실시간 구독을 관리하는 Hook
 */
export function useRealtimeSubscription<T = any>(
  table: keyof Database['public']['Tables'],
  filter?: string,
  deps: any[] = []
) {
  const { db, isAuthenticated } = useSupabase();
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setData([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // 실시간 구독 생성
    const { subscription, unsubscribe } = db.createRealtimeSubscription(
      table,
      filter,
      (payload) => {
        console.log(`Realtime update for ${table}:`, payload);
        
        // 페이로드에 따라 데이터 업데이트
        if (payload.eventType === 'INSERT') {
          setData(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setData(prev => 
            prev.map(item => 
              (item as any).id === payload.new.id ? payload.new : item
            )
          );
        } else if (payload.eventType === 'DELETE') {
          setData(prev => 
            prev.filter(item => (item as any).id !== payload.old.id)
          );
        }
      }
    );

    setIsLoading(false);

    // 클린업
    return () => {
      unsubscribe();
    };
  }, [isAuthenticated, table, filter, db, ...deps]);

  return {
    data,
    isLoading,
    setData, // 수동으로 데이터 설정 가능
  };
}

/**
 * 파일 업로드를 관리하는 Hook
 */
export function useFileUpload(bucket: string) {
  const { db } = useSupabase();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadFile = useCallback(async (
    file: File,
    path: string,
    options?: {
      cacheControl?: string;
      contentType?: string;
      upsert?: boolean;
    }
  ) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await db.uploadFile(bucket, path, file, options);
      
      if (result.error) {
        const errorInfo = handleClientError(result.error);
        setUploadError(errorInfo.message);
        return null;
      }
      
      return result.data;
    } catch (err) {
      console.error('File upload error:', err);
      setUploadError('Failed to upload file');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [db, bucket]);

  const deleteFile = useCallback(async (paths: string[]) => {
    setUploadError(null);

    try {
      const { error } = await db.deleteFile(bucket, paths);
      
      if (error) {
        const errorInfo = handleClientError(error);
        setUploadError(errorInfo.message);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('File delete error:', err);
      setUploadError('Failed to delete file');
      return false;
    }
  }, [db, bucket]);

  return {
    uploadFile,
    deleteFile,
    isUploading,
    uploadError,
    clearError: () => setUploadError(null),
  };
}
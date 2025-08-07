'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrowserClient, handleClientError } from '@/lib/supabase/client';
import { queryKeys } from '@/providers/query-provider';
import type { Tables, TablesUpdate } from '@/types/database.types';

type Profile = Tables<'profiles'>;
type ProfileUpdate = TablesUpdate<'profiles'>;

interface UpdateProfileVariables {
  updates: ProfileUpdate;
  userId?: string; // 관리자가 다른 사용자 프로필 수정 시 사용
}

/**
 * 프로필 업데이트 함수
 */
async function updateProfile({ 
  updates, 
  userId 
}: UpdateProfileVariables): Promise<Profile> {
  const supabase = createBrowserClient();

  // 대상 사용자 ID 결정
  let targetUserId = userId;
  
  if (!targetUserId) {
    // userId가 없으면 현재 로그인한 사용자
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      throw handleClientError(authError);
    }
    
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    targetUserId = user.id;
  } else {
    // 다른 사용자 프로필 수정 시 관리자 권한 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Not authenticated');
    }
    
    // 현재 사용자가 관리자인지 확인
    const { data: currentProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profileError || !currentProfile) {
      throw new Error('Failed to verify permissions');
    }
    
    // 관리자가 아니면서 다른 사용자 프로필 수정 시도
    if (currentProfile.role !== 'admin' && userId !== user.id) {
      throw new Error('Unauthorized: Admin access required to modify other users');
    }
  }

  // 프로필 업데이트
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', targetUserId)
    .select()
    .single();

  if (error) {
    throw handleClientError(error);
  }

  if (!data) {
    throw new Error('Failed to update profile');
  }

  return data;
}

/**
 * 프로필 업데이트 뮤테이션 훅
 * 
 * @example
 * ```tsx
 * function ProfileForm() {
 *   const updateProfile = useUpdateProfile();
 *   
 *   const handleSubmit = async (values) => {
 *     try {
 *       await updateProfile.mutateAsync({
 *         updates: {
 *           full_name: values.fullName,
 *           bio: values.bio,
 *           phone: values.phone,
 *         }
 *       });
 *       toast.success('Profile updated successfully');
 *     } catch (error) {
 *       toast.error('Failed to update profile');
 *     }
 *   };
 *   
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {updateProfile.isPending && <LoadingSpinner />}
 *       // ... form fields
 *     </form>
 *   );
 * }
 * ```
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    
    // Optimistic Update
    onMutate: async (variables) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: queryKeys.profile() });
      
      if (variables.userId) {
        await queryClient.cancelQueries({ 
          queryKey: queryKeys.profileDetail(variables.userId) 
        });
      }

      // 이전 데이터 스냅샷 저장
      const previousProfile = queryClient.getQueryData<Profile>(
        queryKeys.profile()
      );
      
      const previousUserProfile = variables.userId 
        ? queryClient.getQueryData<Profile>(
            queryKeys.profileDetail(variables.userId)
          )
        : null;

      // Optimistic Update 적용
      if (previousProfile && !variables.userId) {
        queryClient.setQueryData<Profile>(
          queryKeys.profile(),
          {
            ...previousProfile,
            ...variables.updates,
            updated_at: new Date().toISOString(),
          }
        );
      }

      if (previousUserProfile && variables.userId) {
        queryClient.setQueryData<Profile>(
          queryKeys.profileDetail(variables.userId),
          {
            ...previousUserProfile,
            ...variables.updates,
            updated_at: new Date().toISOString(),
          }
        );
      }

      // 롤백을 위한 이전 데이터 반환
      return { previousProfile, previousUserProfile };
    },

    // 에러 발생 시 롤백
    onError: (error, variables, context) => {
      console.error('Profile update error:', error);
      
      if (context?.previousProfile) {
        queryClient.setQueryData(queryKeys.profile(), context.previousProfile);
      }
      
      if (context?.previousUserProfile && variables.userId) {
        queryClient.setQueryData(
          queryKeys.profileDetail(variables.userId),
          context.previousUserProfile
        );
      }
    },

    // 성공 시 관련 쿼리 무효화
    onSuccess: (data, variables) => {
      // 프로필 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.profile() });
      
      if (variables.userId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.profileDetail(variables.userId) 
        });
      }

      // 대시보드 쿼리도 무효화 (프로필 정보 포함)
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
      
      // 역할이 변경된 경우 전체 앱 상태 갱신 필요
      if (variables.updates.role) {
        queryClient.clear(); // 모든 캐시 초기화
        window.location.reload(); // 페이지 새로고침으로 권한 재설정
      }
    },
  });
}

/**
 * 프로필 이미지 업데이트 전용 훅
 * 
 * @example
 * ```tsx
 * function AvatarUpload() {
 *   const updateAvatar = useUpdateProfileAvatar();
 *   
 *   const handleFileChange = async (file: File) => {
 *     try {
 *       await updateAvatar.mutateAsync({ file });
 *       toast.success('Avatar updated successfully');
 *     } catch (error) {
 *       toast.error('Failed to update avatar');
 *     }
 *   };
 *   
 *   return <FileInput onChange={handleFileChange} />;
 * }
 * ```
 */
export function useUpdateProfileAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, userId }: { file: File; userId?: string }) => {
      const supabase = createBrowserClient();
      
      // 현재 사용자 확인
      let targetUserId = userId;
      if (!targetUserId) {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) throw new Error('Not authenticated');
        targetUserId = user.id;
      }

      // 파일 업로드
      const fileName = `${targetUserId}-${Date.now()}.${file.name.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw handleClientError(uploadError);
      }

      // Public URL 생성
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(uploadData.path);

      // 프로필 업데이트
      const { data: profile, error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', targetUserId)
        .select()
        .single();

      if (updateError) {
        throw handleClientError(updateError);
      }

      return profile;
    },

    onSuccess: (data, variables) => {
      // 프로필 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.profile() });
      
      if (variables.userId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.profileDetail(variables.userId) 
        });
      }

      // 대시보드 쿼리도 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
    },
  });
}

/**
 * 크리에이터 카테고리 업데이트 훅
 */
export function useUpdateCreatorCategories() {
  const updateProfile = useUpdateProfile();

  return useMutation({
    mutationFn: async (categories: string[]) => {
      return updateProfile.mutateAsync({
        updates: {
          creator_category: categories,
        },
      });
    },
  });
}

/**
 * 비즈니스 정보 업데이트 훅
 */
export function useUpdateBusinessInfo() {
  const updateProfile = useUpdateProfile();

  return useMutation({
    mutationFn: async (businessInfo: {
      companyName?: string;
      businessRegistration?: string;
      website?: string;
      phone?: string;
    }) => {
      return updateProfile.mutateAsync({
        updates: {
          company_name: businessInfo.companyName,
          business_registration: businessInfo.businessRegistration,
          website: businessInfo.website,
          phone: businessInfo.phone,
        },
      });
    },
  });
}

/**
 * 소셜 링크 업데이트 훅
 */
export function useUpdateSocialLinks() {
  const updateProfile = useUpdateProfile();

  return useMutation({
    mutationFn: async (socialLinks: Record<string, string>) => {
      return updateProfile.mutateAsync({
        updates: {
          social_links: socialLinks,
        },
      });
    },
  });
}
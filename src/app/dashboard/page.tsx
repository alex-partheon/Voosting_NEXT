'use client';

import { useEffect, useState } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Supabase 클라이언트 (데이터베이스 전용)
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string | null;
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoaded) return;

      if (!user) {
        router.push('/sign-in');
        return;
      }

      try {
        // 프로필 정보 가져오기
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          setError('프로필 정보를 불러올 수 없습니다.');
          return;
        }

        setProfile(profileData);

        // 역할에 따라 적절한 대시보드로 리다이렉트
        if (profileData.role === 'creator') {
          router.push('/creator/dashboard');
          return;
        } else if (profileData.role === 'business') {
          router.push('/business/dashboard');
          return;
        } else if (profileData.role === 'admin') {
          router.push('/admin/dashboard');
          return;
        }
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoaded, user, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleRoleSelection = async (selectedRole: 'creator' | 'business' | 'admin') => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: selectedRole })
        .eq('id', profile.id);

      if (error) {
        setError('역할 업데이트 중 오류가 발생했습니다.');
        return;
      }

      // 역할에 따라 리다이렉트
      if (selectedRole === 'creator') {
        router.push('/creator/dashboard');
      } else if (selectedRole === 'business') {
        router.push('/business/dashboard');
      }
    } catch (err) {
      console.error('Role update error:', err);
      setError('역할 업데이트 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/sign-in')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            로그인 페이지로
          </button>
        </div>
      </div>
    );
  }

  // 역할이 설정되지 않은 경우 역할 선택 화면 표시
  if (profile && !profile.role) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">역할 선택</h1>
            <p className="text-gray-600">CashUp에서 어떤 역할로 활동하시겠습니까?</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => handleRoleSelection('creator')}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition-colors"
            >
              <h3 className="font-semibold text-gray-900 mb-1">크리에이터</h3>
              <p className="text-sm text-gray-600">
                브랜드와 협업하여 콘텐츠를 제작하고 수익을 창출합니다.
              </p>
            </button>

            <button
              onClick={() => handleRoleSelection('business')}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 text-left transition-colors"
            >
              <h3 className="font-semibold text-gray-900 mb-1">비즈니스</h3>
              <p className="text-sm text-gray-600">
                크리에이터와 협업하여 마케팅 캠페인을 진행합니다.
              </p>
            </button>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-200 text-center">
            <button onClick={handleSignOut} className="text-sm text-gray-500 hover:text-gray-700">
              로그아웃
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 기본 대시보드 (역할이 있지만 특정 대시보드로 리다이렉트되지 않은 경우)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">대시보드</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">안녕하세요, {profile?.full_name}님</span>
              <button
                onClick={handleSignOut}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">환영합니다!</h2>
          <p className="text-gray-600 mb-4">
            CashUp에 오신 것을 환영합니다. 아래 링크를 통해 원하는 기능을 이용해보세요.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/creator/dashboard')}
              className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
            >
              <h3 className="font-medium text-gray-900">크리에이터 대시보드</h3>
              <p className="text-sm text-gray-600 mt-1">크리에이터 기능을 이용해보세요</p>
            </button>

            <button
              onClick={() => router.push('/business/dashboard')}
              className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
            >
              <h3 className="font-medium text-gray-900">비즈니스 대시보드</h3>
              <p className="text-sm text-gray-600 mt-1">비즈니스 기능을 이용해보세요</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

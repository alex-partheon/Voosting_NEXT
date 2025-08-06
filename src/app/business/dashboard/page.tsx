'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';
import type { User } from '@supabase/supabase-js';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface CampaignStats {
  total_campaigns: number;
  active_campaigns: number;
  total_applications: number;
  total_spent: number;
}

export default function BusinessDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 현재 사용자 가져오기
        const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !currentUser) {
          router.push('/sign-in');
          return;
        }

        setUser(currentUser);

        // 프로필 정보 가져오기
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        if (profileError) {
          setError('프로필 정보를 불러올 수 없습니다.');
          return;
        }

        // 역할 확인
        if (profileData.role !== 'business') {
          router.push('/sign-in');
          return;
        }

        setProfile(profileData);

        // 캠페인 통계 가져오기 (추후 구현)
        setStats({
          total_campaigns: 0,
          active_campaigns: 0,
          total_applications: 0,
          total_spent: 0,
        });
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">비즈니스 대시보드</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {profile?.company_name || profile?.full_name || user?.email}
              </span>
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
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">전체 캠페인</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.total_campaigns || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">진행중 캠페인</p>
            <p className="text-2xl font-bold text-green-600">{stats?.active_campaigns || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">전체 지원자</p>
            <p className="text-2xl font-bold text-blue-600">{stats?.total_applications || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">총 지출</p>
            <p className="text-2xl font-bold text-gray-900">
              ₩{(stats?.total_spent || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* 캠페인 섹션 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">캠페인 관리</h2>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">아직 생성된 캠페인이 없습니다.</p>
            <button
              onClick={() => router.push('/business/campaigns/create')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              첫 캠페인 만들기
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
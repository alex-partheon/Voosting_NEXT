'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  referral_code: string;
  created_at: string | null;
}

interface ReferralStats {
  total_referrals: number | null;
  total_earnings: number | null;
  pending_earnings: number | null;
}

export default function CreatorDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
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
        if (profileData.role !== 'creator') {
          router.push('/sign-in');
          return;
        }

        setProfile(profileData);

        // 추천 통계 가져오기
        const { data: statsData, error: statsError } = await supabase
          .from('user_referral_stats')
          .select('*')
          .eq('user_id', currentUser.id)
          .single();

        if (!statsError && statsData) {
          setStats(statsData);
        }
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
              <h1 className="text-xl font-semibold text-gray-900">크리에이터 대시보드</h1>
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
        {/* 프로필 정보 카드 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">프로필 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">이메일</label>
              <p className="mt-1 text-sm text-gray-900">{profile?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">이름</label>
              <p className="mt-1 text-sm text-gray-900">{profile?.full_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">역할</label>
              <p className="mt-1 text-sm text-gray-900 capitalize">{profile?.role}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">추천 코드</label>
              <p className="mt-1 text-sm text-gray-900 font-mono">{profile?.referral_code}</p>
            </div>
          </div>
        </div>

        {/* 추천 통계 카드 */}
        {stats && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">추천 통계</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{stats.total_referrals || 0}</p>
                <p className="text-sm text-gray-600">총 추천 수</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  ₩{(stats.total_earnings || 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">총 수익</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  ₩{(stats.pending_earnings || 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">대기 중인 수익</p>
              </div>
            </div>
          </div>
        )}

        {/* 빠른 액션 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">빠른 액션</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
              <h3 className="font-medium text-gray-900">캠페인 찾기</h3>
              <p className="text-sm text-gray-600 mt-1">새로운 캠페인을 찾아보세요</p>
            </button>
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
              <h3 className="font-medium text-gray-900">내 지원서</h3>
              <p className="text-sm text-gray-600 mt-1">지원한 캠페인을 확인하세요</p>
            </button>
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
              <h3 className="font-medium text-gray-900">수익 관리</h3>
              <p className="text-sm text-gray-600 mt-1">수익 내역을 확인하세요</p>
            </button>
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
              <h3 className="font-medium text-gray-900">프로필 수정</h3>
              <p className="text-sm text-gray-600 mt-1">프로필 정보를 업데이트하세요</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

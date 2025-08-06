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
  created_at: string | null;
}

interface AdminStats {
  total_users: number;
  total_creators: number;
  total_businesses: number;
  total_campaigns: number;
  total_applications: number;
  total_earnings: number;
}

export default function AdminDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
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
        if (profileData.role !== 'admin') {
          router.push('/sign-in');
          return;
        }

        setProfile(profileData);

        // 관리자 통계 가져오기
        const [usersResult, campaignsResult, applicationsResult, earningsResult] =
          await Promise.all([
            supabase.from('profiles').select('id, role'),
            supabase.from('campaigns').select('id'),
            supabase.from('campaign_applications').select('id'),
            supabase.from('referral_earnings').select('amount'),
          ]);

        if (
          usersResult.data &&
          campaignsResult.data &&
          applicationsResult.data &&
          earningsResult.data
        ) {
          const users = usersResult.data;
          const totalUsers = users.length;
          const totalCreators = users.filter((u) => u.role === 'creator').length;
          const totalBusinesses = users.filter((u) => u.role === 'business').length;
          const totalCampaigns = campaignsResult.data.length;
          const totalApplications = applicationsResult.data.length;
          const totalEarnings = earningsResult.data.reduce((sum, e) => sum + (e.amount || 0), 0);

          setStats({
            total_users: totalUsers,
            total_creators: totalCreators,
            total_businesses: totalBusinesses,
            total_campaigns: totalCampaigns,
            total_applications: totalApplications,
            total_earnings: totalEarnings,
          });
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
              <h1 className="text-xl font-semibold text-gray-900">관리자 대시보드</h1>
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
        {/* 관리자 정보 카드 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">관리자 정보</h2>
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
              <label className="block text-sm font-medium text-gray-700">가입일</label>
              <p className="mt-1 text-sm text-gray-900">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString('ko-KR')
                  : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* 시스템 통계 카드 */}
        {stats && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">시스템 통계</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{stats.total_users}</p>
                <p className="text-sm text-gray-600">총 사용자</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{stats.total_creators}</p>
                <p className="text-sm text-gray-600">크리에이터</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{stats.total_businesses}</p>
                <p className="text-sm text-gray-600">비즈니스</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{stats.total_campaigns}</p>
                <p className="text-sm text-gray-600">총 캠페인</p>
              </div>
              <div className="text-center p-4 bg-pink-50 rounded-lg">
                <p className="text-2xl font-bold text-pink-600">{stats.total_applications}</p>
                <p className="text-sm text-gray-600">총 지원서</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  ₩{stats.total_earnings.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">총 수익</p>
              </div>
            </div>
          </div>
        )}

        {/* 관리 메뉴 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">관리 메뉴</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
              <h3 className="font-medium text-gray-900">사용자 관리</h3>
              <p className="text-sm text-gray-600 mt-1">사용자 계정을 관리하세요</p>
            </button>
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
              <h3 className="font-medium text-gray-900">캠페인 관리</h3>
              <p className="text-sm text-gray-600 mt-1">모든 캠페인을 관리하세요</p>
            </button>
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
              <h3 className="font-medium text-gray-900">분석 보고서</h3>
              <p className="text-sm text-gray-600 mt-1">시스템 분석을 확인하세요</p>
            </button>
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
              <h3 className="font-medium text-gray-900">시스템 설정</h3>
              <p className="text-sm text-gray-600 mt-1">시스템 설정을 관리하세요</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

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
  company_name?: string | null;
  business_registration_number?: string | null;
  created_at: string | null;
}

interface CampaignStats {
  total_campaigns: number;
  active_campaigns: number;
  total_applications: number;
  total_spent: number;
}

export default function BusinessDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<CampaignStats | null>(null);
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

        // 역할 확인
        if (profileData.role !== 'business') {
          router.push('/sign-in');
          return;
        }

        setProfile(profileData);

        // 캠페인 통계 가져오기
        const { data: campaignsData, error: campaignsError } = await supabase
          .from('campaigns')
          .select('id, status, budget')
          .eq('business_id', user.id);

        if (!campaignsError && campaignsData) {
          const totalCampaigns = campaignsData.length;
          const activeCampaigns = campaignsData.filter((c) => c.status === 'active').length;
          const totalSpent = campaignsData.reduce((sum, c) => sum + (c.budget || 0), 0);

          // 지원서 수 가져오기
          const { data: applicationsData } = await supabase
            .from('campaign_applications')
            .select('id')
            .in(
              'campaign_id',
              campaignsData.map((c) => c.id),
            );

          const totalApplications = applicationsData?.length || 0;

          setStats({
            total_campaigns: totalCampaigns,
            active_campaigns: activeCampaigns,
            total_applications: totalApplications,
            total_spent: totalSpent,
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
  }, [isLoaded, user, router]);

  const handleSignOut = async () => {
    await signOut();
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
          <h2 className="text-lg font-medium text-gray-900 mb-4">비즈니스 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">이메일</label>
              <p className="mt-1 text-sm text-gray-900">{profile?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">담당자명</label>
              <p className="mt-1 text-sm text-gray-900">{profile?.full_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">회사명</label>
              <p className="mt-1 text-sm text-gray-900">{profile?.company_name || '미설정'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">사업자등록번호</label>
              <p className="mt-1 text-sm text-gray-900">
                {profile?.business_registration_number || '미설정'}
              </p>
            </div>
          </div>
        </div>

        {/* 캠페인 통계 카드 */}
        {stats && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">캠페인 통계</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{stats.total_campaigns}</p>
                <p className="text-sm text-gray-600">총 캠페인 수</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{stats.active_campaigns}</p>
                <p className="text-sm text-gray-600">진행 중인 캠페인</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{stats.total_applications}</p>
                <p className="text-sm text-gray-600">총 지원서 수</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  ₩{stats.total_spent.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">총 예산</p>
              </div>
            </div>
          </div>
        )}

        {/* 빠른 액션 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">빠른 액션</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
              <h3 className="font-medium text-gray-900">새 캠페인 생성</h3>
              <p className="text-sm text-gray-600 mt-1">새로운 마케팅 캠페인을 시작하세요</p>
            </button>
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
              <h3 className="font-medium text-gray-900">캠페인 관리</h3>
              <p className="text-sm text-gray-600 mt-1">진행 중인 캠페인을 관리하세요</p>
            </button>
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
              <h3 className="font-medium text-gray-900">크리에이터 찾기</h3>
              <p className="text-sm text-gray-600 mt-1">적합한 크리에이터를 찾아보세요</p>
            </button>
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
              <h3 className="font-medium text-gray-900">분석 보고서</h3>
              <p className="text-sm text-gray-600 mt-1">캠페인 성과를 분석하세요</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

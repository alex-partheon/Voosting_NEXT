'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Building2, UserCircle, Loader2, Chrome } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null);
  const router = useRouter();

  useEffect(() => {
    setSupabase(createBrowserClient());
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    
    setLoading(true);
    setError('');

    try {
      console.log('로그인 시도:', { email, password: '***' });
      
      // 현재 세션 상태 확인
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('현재 세션:', sessionData);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('로그인 응답:', { data, error });

      if (error) {
        console.error('로그인 에러:', error);
        setError(error.message);
        return;
      }

      if (data.user) {
        console.log('로그인 성공:', data.user);
        
        // 세션 확인
        const { data: newSession } = await supabase.auth.getSession();
        console.log('새 세션:', newSession);
        
        // 사용자 프로필 확인
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
          
        console.log('프로필 조회:', { profile, profileError });
        
        // 역할에 따른 리다이렉트 (updated for unified dashboard)
        let redirectPath = '/dashboard';
        if (profile?.role) {
          switch (profile.role) {
            case 'creator':
            case 'business':
              redirectPath = '/dashboard'; // Unified dashboard
              break;
            case 'admin':
              redirectPath = '/admin/dashboard';
              break;
          }
        }
        
        console.log('리다이렉트 경로:', redirectPath);
        router.push(redirectPath);
      }
    } catch (err) {
      console.error('로그인 예외:', err);
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    if (!supabase) return;
    
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('OAuth 로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-600 via-violet-600 to-cyan-600 mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Voosting에 로그인</h1>
            <p className="text-lg text-gray-600 max-w-sm mx-auto">
              크리에이터와 비즈니스를 연결하는 AI 마케팅 플랫폼
            </p>
          </div>

          {/* Role indicators */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-violet-50 border border-emerald-200">
              <UserCircle className="w-6 h-6 text-emerald-600 mb-2" />
              <h3 className="font-semibold text-gray-900">크리에이터</h3>
              <p className="text-sm text-gray-600">영향력을 수익으로</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-emerald-50 border border-cyan-200">
              <Building2 className="w-6 h-6 text-cyan-600 mb-2" />
              <h3 className="font-semibold text-gray-900">비즈니스</h3>
              <p className="text-sm text-gray-600">성과 기반 마케팅</p>
            </div>
          </div>

          {/* Sign In Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSignIn} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  이메일
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-gray-700 to-gray-900 text-white font-medium rounded-lg hover:from-gray-800 hover:to-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    로그인 중...
                  </>
                ) : (
                  '로그인'
                )}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">또는</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={() => handleOAuthSignIn('google')}
                  disabled={loading}
                  className="w-full py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center font-medium text-gray-700"
                >
                  <Chrome className="w-5 h-5 mr-2" />
                  Google로 계속하기
                </button>
              </div>
            </div>
          </div>

          {/* Sign up prompt */}
          <div className="text-center space-y-2">
            <p className="text-gray-600">아직 계정이 없으신가요?</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/auth/sign-up/creator"
                className="inline-flex items-center justify-center px-6 py-2 rounded-full border-2 border-emerald-500 text-emerald-600 font-medium hover:bg-emerald-50 transition-colors"
              >
                크리에이터로 가입
              </Link>
              <Link
                href="/auth/sign-up/business"
                className="inline-flex items-center justify-center px-6 py-2 rounded-full border-2 border-cyan-500 text-cyan-600 font-medium hover:bg-cyan-50 transition-colors"
              >
                비즈니스로 가입
              </Link>
            </div>
          </div>

      {/* Back to home */}
      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>홈으로 돌아가기</span>
        </Link>
      </div>

      {/* Test Account Info (개발 환경에서만) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
          <p className="font-medium mb-2">테스트 계정:</p>
          <div className="space-y-1">
            <p>creator1@test.com (크리에이터)</p>
            <p>business1@test.com (비즈니스)</p>
            <p>admin@test.com (관리자)</p>
            <p className="mt-2">비밀번호: testPassword123!</p>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, CheckCircle, TrendingUp, Target, Shield, Clock, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';

const benefits = [
  {
    icon: Target,
    title: 'AI 기반 크리에이터 매칭',
    description: '브랜드에 최적화된 크리에이터를 자동으로 찾아드립니다',
  },
  {
    icon: TrendingUp,
    title: '성과 기반 과금',
    description: '실제 전환과 판매에 따라서만 비용을 지불합니다',
  },
  {
    icon: Shield,
    title: '성과 보장 제도',
    description: 'KPI 미달성 시 수수료를 환불해드립니다',
  },
  {
    icon: Clock,
    title: '24시간 전담 지원',
    description: '전문 매니저가 캠페인 전 과정을 지원합니다',
  },
];

export default function BusinessSignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createBrowserClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 비밀번호 확인
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.');
      setLoading(false);
      return;
    }

    try {
      // 회원가입
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'business',
            company_name: companyName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.user) {
        // 회원가입 성공 - 이메일 확인 안내 페이지로 이동
        router.push('/auth/verify-email?email=' + encodeURIComponent(email));
      }
    } catch (err) {
      setError('회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignUp = async (provider: 'google' | 'github') => {
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?role=business`,
        },
      });

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('OAuth 회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-emerald-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-gray-100 [mask-image:linear-gradient(to_bottom,white,transparent)]" />

      <div className="relative flex min-h-screen">
        {/* Back to home */}
        <Link
          href="/"
          className="absolute top-6 left-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors z-10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>홈으로</span>
        </Link>

        {/* Left side - Benefits */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative">
          <div className="max-w-lg space-y-8">
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 mb-6">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                비즈니스로 시작하기
              </h1>
              <p className="text-xl text-gray-600">
                AI가 찾아주는 최적의 크리에이터와 함께<br />
                성과 중심 마케팅을 시작하세요
              </p>
            </div>

            {/* ROI Showcase */}
            <div className="p-6 bg-white rounded-2xl shadow-lg border border-cyan-100">
              <h3 className="font-semibold text-gray-900 mb-4">평균 성과 지표</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-gradient-to-br from-cyan-50 to-emerald-50 rounded-lg">
                  <p className="text-3xl font-bold text-cyan-600">427%</p>
                  <p className="text-sm text-gray-600">평균 ROI</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-lg">
                  <p className="text-3xl font-bold text-emerald-600">3.2배</p>
                  <p className="text-sm text-gray-600">전환율 향상</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-cyan-50 to-emerald-50 rounded-lg">
                  <p className="text-3xl font-bold text-cyan-600">-67%</p>
                  <p className="text-sm text-gray-600">획득 비용 절감</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-lg">
                  <p className="text-3xl font-bold text-emerald-600">24시간</p>
                  <p className="text-sm text-gray-600">캠페인 시작</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center">
                * 2024년 1-6월 전체 캠페인 평균
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-100 to-emerald-100 flex items-center justify-center">
                      <benefit.icon className="w-5 h-5 text-cyan-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{benefit.title}</h4>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Sign Up Form */}
        <div className="flex-1 flex items-center justify-center px-4 lg:px-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">비즈니스 회원가입</h2>
                <p className="text-gray-600 mt-2">
                  성과 기반 마케팅을 시작하세요
                </p>
              </div>

              <form onSubmit={handleSignUp} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                    회사명
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    placeholder="(주)부스팅"
                  />
                </div>

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
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    placeholder="business@company.com"
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
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    placeholder="최소 8자 이상"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    비밀번호 확인
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    placeholder="비밀번호를 다시 입력하세요"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      회원가입 중...
                    </>
                  ) : (
                    '비즈니스로 시작하기'
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
                    onClick={() => handleOAuthSignUp('google')}
                    disabled={loading}
                    className="w-full py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center font-medium text-gray-700"
                  >
                    <img src="/google-icon.svg" alt="Google" className="w-5 h-5 mr-2" />
                    Google로 계속하기
                  </button>
                </div>
              </div>

              <p className="mt-6 text-center text-sm text-gray-600">
                이미 계정이 있으신가요?{' '}
                <Link href="/sign-in" className="text-cyan-600 hover:text-cyan-700 font-medium">
                  로그인
                </Link>
              </p>

              <p className="mt-4 text-xs text-gray-500 text-center">
                회원가입 시{' '}
                <Link href="/terms" className="underline">
                  이용약관
                </Link>
                과{' '}
                <Link href="/privacy" className="underline">
                  개인정보처리방침
                </Link>
                에 동의합니다.
              </p>
            </div>

            {/* Success Indicators */}
            <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-cyan-600 mr-1" />
                <span>무료 시작</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-cyan-600 mr-1" />
                <span>성과 보장</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-cyan-600 mr-1" />
                <span>전담 매니저</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-cyan-200 to-emerald-200 rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-emerald-200 to-cyan-200 rounded-full blur-3xl opacity-20" />
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  UserCircle,
  DollarSign,
  Users,
  Zap,
  TrendingUp,
  Gift,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';

const incomeStructure = [
  { level: '직접 캠페인', rate: '기본 수수료', example: '월 50만원~500만원' },
  { level: '1단계 추천', rate: '10%', example: '5명 추천 시 +25만원' },
  { level: '2단계 추천', rate: '5%', example: '25명 네트워크 시 +62만원' },
  { level: '3단계 추천', rate: '2%', example: '125명 네트워크 시 +50만원' },
];

const features = [
  {
    icon: DollarSign,
    title: '3단계 추천 수익',
    description: '평생 지속되는 패시브 인컴 창출',
  },
  {
    icon: Zap,
    title: '쉬운 페이지 제작',
    description: '드래그앤드롭으로 프로모션 페이지 제작',
  },
  {
    icon: TrendingUp,
    title: 'AI 캠페인 매칭',
    description: '팔로워에게 최적화된 캠페인 자동 추천',
  },
  {
    icon: Users,
    title: '실시간 성과 추적',
    description: '수익과 전환을 실시간으로 확인',
  },
];

export default function CreatorSignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient();

  useEffect(() => {
    // URL에서 추천 코드 가져오기
    const ref = searchParams.get('ref');
    if (ref) {
      setReferralCode(ref);
    }
  }, [searchParams]);

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
            role: 'creator',
            referral_code: referralCode || undefined,
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
          redirectTo: `${window.location.origin}/auth/callback?role=creator${referralCode ? `&ref=${referralCode}` : ''}`,
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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-emerald-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-gray-100 [mask-image:linear-gradient(to_bottom,white,transparent)]" />

      <div className="relative flex min-h-screen">
        {/* Left Panel - Features */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12">
          <Link
            href="/"
            className="absolute top-6 left-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>홈으로</span>
          </Link>

          <div className="max-w-xl">
            <div className="mb-8">
              <UserCircle className="w-12 h-12 text-emerald-600 mb-4" />
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                크리에이터로 시작하기
              </h1>
              <p className="text-xl text-gray-600">
                영향력을 수익으로 전환하고, 3단계 추천 수익으로 평생 패시브 인컴을 만들어보세요.
              </p>
            </div>

            {/* Income Structure */}
            <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg border border-emerald-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Gift className="w-5 h-5 mr-2 text-emerald-600" />
                수익 구조
              </h3>
              <div className="space-y-3">
                {incomeStructure.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-violet-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900">{item.level}</span>
                      {item.rate !== '기본 수수료' && (
                        <span className="ml-2 px-2 py-0.5 bg-emerald-600 text-white text-xs rounded-full">
                          {item.rate}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">{item.example}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-gray-600 text-center font-medium">
                💰 예시: 월 평균 <span className="text-emerald-600">187만원</span> 수익 가능
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="p-4 bg-white rounded-xl shadow-sm">
                  <feature.icon className="w-8 h-8 text-emerald-600 mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Sign Up Form */}
        <div className="flex-1 flex items-center justify-center px-4 lg:px-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">크리에이터 회원가입</h2>
                <p className="text-gray-600 mt-2">
                  지금 시작하고 첫 달부터 수익을 만들어보세요
                </p>
              </div>

              {referralCode && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-sm text-emerald-700">
                    추천 코드가 적용되었습니다: <span className="font-mono font-bold">{referralCode}</span>
                  </p>
                </div>
              )}

              <form onSubmit={handleSignUp} className="space-y-4">
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
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                    placeholder="creator@example.com"
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
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                    placeholder="비밀번호를 다시 입력하세요"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-violet-500 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-violet-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      회원가입 중...
                    </>
                  ) : (
                    '크리에이터로 시작하기'
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
                <Link href="/sign-in" className="text-emerald-600 hover:text-emerald-700 font-medium">
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
                <CheckCircle className="w-4 h-4 text-emerald-600 mr-1" />
                <span>수수료 무료</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-emerald-600 mr-1" />
                <span>1분 내 시작</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-emerald-600 mr-1" />
                <span>언제든 해지 가능</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-emerald-200 to-violet-200 rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-violet-200 to-emerald-200 rounded-full blur-3xl opacity-20" />
    </div>
  );
}
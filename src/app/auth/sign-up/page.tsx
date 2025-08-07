'use client';

import Link from 'next/link';
import { ArrowLeft, Sparkles, Building2, UserCircle, ArrowRight } from 'lucide-react';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-gray-100 [mask-image:linear-gradient(to_bottom,white,transparent)]" />

      <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
        {/* Back to home */}
        <Link
          href="/"
          className="absolute top-6 left-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>홈으로</span>
        </Link>

        <div className="w-full max-w-4xl space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
              Voosting과 함께 시작하세요
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              크리에이터와 비즈니스를 연결하는 AI 마케팅 플랫폼에서 당신의 역할을 선택하세요
            </p>
          </div>

          {/* Role selection cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Creator card */}
            <Link
              href="/sign-up/creator"
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-emerald-200"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-full bg-gradient-creator-target flex items-center justify-center">
                  <UserCircle className="w-7 h-7 text-white" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900">크리에이터로 시작하기</h2>

                <p className="text-gray-600">
                  팔로워를 수익으로 전환하고, 3단계 추천 시스템으로 패시브 인컴을 만드세요.
                </p>

                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />월 평균 85만원 추가
                    수익
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    10% → 5% → 2% 추천 수익
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    드래그앤드롭 페이지 빌더
                  </li>
                </ul>

                <div className="flex items-center gap-2 text-emerald-600 font-medium pt-2 group-hover:gap-3 transition-all">
                  <span>크리에이터 회원가입</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>

              {/* Hover gradient */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>

            {/* Business card */}
            <Link
              href="/sign-up/business"
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-cyan-200"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-full bg-gradient-business-target flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-white" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900">비즈니스로 시작하기</h2>

                <p className="text-gray-600">
                  AI가 찾아주는 최적의 크리에이터와 함께 성과 기반 마케팅을 시작하세요.
                </p>

                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    평균 ROI 320% 달성
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    성과 기반 과금 시스템
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    24시간 전담 매니저 지원
                  </li>
                </ul>

                <div className="flex items-center gap-2 text-cyan-600 font-medium pt-2 group-hover:gap-3 transition-all">
                  <span>비즈니스 회원가입</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>

              {/* Hover gradient */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </div>

          {/* Sign in prompt */}
          <div className="text-center">
            <p className="text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link
                href="/auth/sign-in"
                className="text-gray-900 hover:text-gray-700 font-medium underline"
              >
                로그인하기
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full blur-3xl opacity-20" />
    </div>
  );
}

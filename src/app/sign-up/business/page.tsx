import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';
import { ArrowLeft, Building2, CheckCircle, TrendingUp, Target, Shield, Clock } from 'lucide-react';

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
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-business-target mb-6">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold mb-4">
                성과 중심의
                <span className="text-gradient-business block">마케팅 혁신</span>
              </h2>
              <p className="text-lg text-gray-600">
                2,500개 이상의 브랜드가 Voosting과 함께 평균 320% ROI를 달성하고 있습니다.
              </p>
            </div>

            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-100 to-emerald-100 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t">
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span>무료 시작</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span>신용카드 불필요</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span>즉시 시작</span>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative element */}
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-cyan-200 to-emerald-200 rounded-full blur-3xl opacity-20" />
        </div>

        {/* Right side - SignUp form */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md space-y-6">
            {/* Mobile header */}
            <div className="lg:hidden text-center space-y-4 mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-business-target">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold">비즈니스 회원가입</h1>
              <p className="text-gray-600">성과 기반 마케팅으로 비즈니스를 성장시키세요</p>
            </div>

            {/* Desktop header */}
            <div className="hidden lg:block space-y-2 text-center">
              <h1 className="text-3xl font-bold text-gray-900">비즈니스 회원가입</h1>
              <p className="text-gray-600">무료로 시작하고 성과를 경험하세요</p>
            </div>

            {/* Clerk SignUp */}
            <div className="bg-white rounded-2xl shadow-xl p-1">
              <SignUp
                path="/sign-up/business"
                routing="path"
                signInUrl="/sign-in"
                redirectUrl="/dashboard"
                appearance={{
                  elements: {
                    rootBox: 'w-full',
                    card: 'shadow-none bg-transparent',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden',
                    socialButtonsBlockButton:
                      'rounded-lg border-gray-200 hover:bg-gray-50 transition-colors',
                    formButtonPrimary:
                      'bg-gradient-business-target hover:shadow-lg transition-all duration-200',
                    footerActionLink: 'text-cyan-600 hover:text-cyan-700 font-medium',
                    formFieldInput:
                      'rounded-lg border-gray-200 focus:border-cyan-400 focus:ring-cyan-400',
                    identityPreviewEditButton: 'text-cyan-600 hover:text-cyan-700',
                    formFieldLabel: 'text-gray-700 font-medium',
                  },
                  layout: {
                    socialButtonsPlacement: 'top',
                    socialButtonsVariant: 'blockButton',
                  },
                }}
              />
            </div>

            {/* Sign in prompt */}
            <div className="text-center">
              <p className="text-gray-600">
                이미 계정이 있으신가요?{' '}
                <Link href="/sign-in" className="text-cyan-600 hover:text-cyan-700 font-medium">
                  로그인하기
                </Link>
              </p>
            </div>

            {/* Mobile benefits */}
            <div className="lg:hidden pt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-gray-600">10,000+ 검증된 크리에이터</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-gray-600">평균 ROI 320% 달성</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-gray-600">24시간 전담 매니저 지원</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-cyan-200 to-emerald-200 rounded-full blur-3xl opacity-20" />
    </div>
  );
}

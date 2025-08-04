import { SignUp } from '@clerk/nextjs';
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
} from 'lucide-react';

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
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-emerald-50 overflow-hidden">
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

        {/* Left side - Income preview */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative">
          <div className="max-w-lg space-y-8">
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-creator-target mb-6">
                <UserCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold mb-4">
                당신의 영향력이
                <span className="text-gradient-creator block">수익이 됩니다</span>
              </h2>
              <p className="text-lg text-gray-600">
                8,500명의 크리에이터가 Voosting과 함께 월 평균 85만원의 추가 수익을 만들고 있습니다.
              </p>
            </div>

            {/* Income structure preview */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-violet-600" />
                수익 구조
              </h3>
              <div className="space-y-3">
                {incomeStructure.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-violet-50 to-emerald-50"
                  >
                    <div>
                      <span className="font-medium text-gray-900">{item.level}</span>
                      <span className="ml-2 text-sm text-gray-600">({item.rate})</span>
                    </div>
                    <span className="text-sm font-medium text-violet-600">{item.example}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t text-center">
                <p className="text-sm text-gray-600 mb-1">예상 총 월 수익</p>
                <p className="text-2xl font-bold text-gradient-creator">₩2,870,000+</p>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-3">
                  <feature.icon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{feature.title}</h4>
                    <p className="text-xs text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Decorative element */}
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-violet-200 to-emerald-200 rounded-full blur-3xl opacity-20" />
        </div>

        {/* Right side - SignUp form */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md space-y-6">
            {/* Mobile header */}
            <div className="lg:hidden text-center space-y-4 mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-creator-target">
                <UserCircle className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold">크리에이터 회원가입</h1>
              <p className="text-gray-600">팔로워를 수익으로 전환하는 첫 걸음</p>
            </div>

            {/* Desktop header */}
            <div className="hidden lg:block space-y-2 text-center">
              <h1 className="text-3xl font-bold text-gray-900">크리에이터 회원가입</h1>
              <p className="text-gray-600">지금 시작하고 수익을 만들어보세요</p>
            </div>

            {/* Clerk SignUp */}
            <div className="bg-white rounded-2xl shadow-xl p-1">
              <SignUp
                path="/sign-up/creator"
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
                      'bg-gradient-creator-target hover:shadow-lg transition-all duration-200',
                    footerActionLink: 'text-violet-600 hover:text-violet-700 font-medium',
                    formFieldInput:
                      'rounded-lg border-gray-200 focus:border-violet-400 focus:ring-violet-400',
                    identityPreviewEditButton: 'text-violet-600 hover:text-violet-700',
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
                <Link href="/sign-in" className="text-violet-600 hover:text-violet-700 font-medium">
                  로그인하기
                </Link>
              </p>
            </div>

            {/* Mobile benefits */}
            <div className="lg:hidden pt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-gray-600">3단계 추천 수익 시스템</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-gray-600">월 평균 85만원 추가 수익</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-gray-600">코딩 없는 페이지 제작</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-violet-200 to-emerald-200 rounded-full blur-3xl opacity-20" />
    </div>
  );
}

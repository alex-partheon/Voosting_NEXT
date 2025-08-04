'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  DollarSign,
  Users,
  Zap,
  CheckCircle,
  TrendingUp,
  Calculator,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const stats = [
  { value: '₩850K', label: '월 평균 수익' },
  { value: '8,500+', label: '활동 크리에이터' },
  { value: '15%', label: '평균 전환율' },
  { value: '3단계', label: '추천 보상' },
];

const features = [
  {
    icon: DollarSign,
    title: '3단계 추천 시스템',
    description: '당신이 초대한 크리에이터의 수익에서 10% → 5% → 2% 추가 수익을 얻으세요.',
    gradient: 'from-emerald-500 to-green-500',
  },
  {
    icon: Zap,
    title: '맞춤형 페이지 빌더',
    description: '드래그 앤 드롭으로 나만의 프로모션 페이지를 쉽게 만들어보세요.',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: TrendingUp,
    title: '실시간 수익 추적',
    description: '캠페인 성과와 수익을 실시간으로 확인하고 전략을 최적화하세요.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Users,
    title: 'AI 캠페인 매칭',
    description: '당신의 팔로워와 콘텐츠에 가장 적합한 캠페인을 AI가 찾아드립니다.',
    gradient: 'from-emerald-500 to-cyan-500',
  },
];

const incomeExamples = [
  {
    followers: '1만 팔로워',
    direct: '₩500,000',
    referral: '₩150,000',
    total: '₩650,000/월',
  },
  {
    followers: '5만 팔로워',
    direct: '₩2,500,000',
    referral: '₩750,000',
    total: '₩3,250,000/월',
  },
  {
    followers: '10만 팔로워',
    direct: '₩5,000,000',
    referral: '₩1,500,000',
    total: '₩6,500,000/월',
  },
];

export default function CreatorHomePage() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative section-padding section-spacing bg-gradient-to-br from-violet-50 via-white to-emerald-50">
        <div className="absolute inset-0 bg-grid-gray-100 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        <div className="container-max relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                팔로워를 수익으로 전환하세요
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                당신의 영향력을
                <span className="text-gradient-creator block mt-2">수익으로 만드세요</span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                3단계 추천 시스템으로 더 많은 수익을 만들고, AI가 찾아주는 최적의 캠페인으로
                성공하세요.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-gradient-creator-target text-white font-semibold hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  지금 시작하기
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/creators/calculator"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full border-2 border-gray-300 font-semibold hover:border-gray-400 transition-colors group"
                >
                  <Calculator className="w-5 h-5 mr-2" />
                  수익 계산하기
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl bg-white p-8">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gradient-creator mb-2">
                      10% + 5% + 2%
                    </div>
                    <div className="text-gray-600">3단계 추천 수익 구조</div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50">
                      <span className="font-medium">1단계 추천</span>
                      <span className="font-bold text-emerald-600">10% 수익</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-violet-50">
                      <span className="font-medium">2단계 추천</span>
                      <span className="font-bold text-violet-600">5% 수익</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50">
                      <span className="font-medium">3단계 추천</span>
                      <span className="font-bold text-purple-600">2% 수익</span>
                    </div>
                  </div>

                  <div className="text-center pt-4 border-t">
                    <div className="text-sm text-gray-600 mb-1">평균 월 추가 수익</div>
                    <div className="text-2xl font-bold">₩350,000+</div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-violet-200 to-purple-200 rounded-full blur-2xl opacity-60" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-emerald-200 to-green-200 rounded-full blur-2xl opacity-60" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding py-16 bg-gray-50">
        <div className="container-max">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-gradient-creator mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding section-spacing">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              크리에이터를 위한 <span className="text-gradient-creator">완벽한 도구</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              수익 창출부터 성장까지, 크리에이터의 성공을 위한 모든 것
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bento-card p-6 hover:scale-105 transition-transform duration-300"
              >
                <div
                  className={cn(
                    'w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4',
                    feature.gradient,
                  )}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>

                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Income Examples Section */}
      <section className="section-padding section-spacing bg-gradient-to-br from-gray-50 to-violet-50/30">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              예상 <span className="text-gradient-creator">수익 시뮬레이션</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              팔로워 규모에 따른 직접 수익과 추천 수익 예시
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {incomeExamples.map((example, index) => (
              <div
                key={index}
                className="bento-card p-6 text-center hover:scale-105 transition-transform duration-300"
              >
                <div className="text-lg font-semibold text-gray-700 mb-4">{example.followers}</div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">직접 수익</span>
                    <span className="font-medium">{example.direct}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">추천 수익</span>
                    <span className="font-medium text-violet-600">{example.referral}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-2xl font-bold text-gradient-creator">{example.total}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/creators/calculator"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-gradient-creator-target text-white font-semibold hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 group"
            >
              나의 예상 수익 계산하기
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding section-spacing bg-gradient-creator-target text-white">
        <div className="container-max text-center">
          <h2 className="text-4xl font-bold mb-4">지금 시작하고 수익을 만드세요</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            8,500명의 크리에이터가 이미 Voosting과 함께 성장하고 있습니다
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-emerald-600 font-semibold hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 group"
            >
              무료로 시작하기
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/creators/service"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full border-2 border-white text-white font-semibold hover:bg-white hover:text-emerald-600 transition-colors"
            >
              서비스 자세히 보기
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-8 text-sm opacity-80">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>무료 가입</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>수수료 없음</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>즉시 시작</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

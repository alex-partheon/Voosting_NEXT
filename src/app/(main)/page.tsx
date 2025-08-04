'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, Target, BarChart3, Shield, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const stats = [
  { value: '10,000+', label: '검증된 크리에이터' },
  { value: '2,500+', label: '성공적인 캠페인' },
  { value: '320%', label: '평균 ROI' },
  { value: '98%', label: '광고주 만족도' },
];

const features = [
  {
    icon: Sparkles,
    title: 'AI 매칭 시스템',
    description: '브랜드와 완벽하게 맞는 크리에이터를 AI가 자동으로 찾아드립니다.',
    gradient: 'from-cyan-500 to-emerald-500',
  },
  {
    icon: Target,
    title: '성과 기반 마케팅',
    description: '실제 전환과 판매 성과에 따른 합리적인 비용 구조를 제공합니다.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: BarChart3,
    title: '실시간 분석',
    description: '캠페인 성과를 실시간으로 추적하고 최적화할 수 있습니다.',
    gradient: 'from-teal-500 to-cyan-500',
  },
  {
    icon: Shield,
    title: '검증된 크리에이터',
    description: '엄격한 심사를 통과한 신뢰할 수 있는 크리에이터만 활동합니다.',
    gradient: 'from-cyan-500 to-blue-500',
  },
];

const processSteps = [
  {
    step: '01',
    title: '캠페인 생성',
    description: '브랜드 목표와 타겟 고객을 설정하고 캠페인을 생성하세요.',
  },
  {
    step: '02',
    title: 'AI 매칭',
    description: 'AI가 최적의 크리에이터를 자동으로 찾아 매칭해드립니다.',
  },
  {
    step: '03',
    title: '콘텐츠 제작',
    description: '크리에이터가 브랜드에 맞는 고품질 콘텐츠를 제작합니다.',
  },
  {
    step: '04',
    title: '성과 측정',
    description: '실시간으로 캠페인 성과를 확인하고 ROI를 측정하세요.',
  },
];

export default function BusinessHomePage() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative section-padding section-spacing bg-gradient-to-br from-cyan-50 via-white to-emerald-50">
        <div className="absolute inset-0 bg-grid-gray-100 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        <div className="container-max relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-100 text-cyan-700 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                AI가 찾아주는 완벽한 크리에이터
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                성과를 보장하는
                <span className="text-gradient-business block mt-2">크리에이터 마케팅</span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                AI 기반 매칭 시스템으로 브랜드에 가장 적합한 크리에이터를 찾고, 실제 판매 성과에
                따라 비용을 지불하세요.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-gradient-business-target text-white font-semibold hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  무료로 시작하기
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full border-2 border-gray-300 font-semibold hover:border-gray-400 transition-colors"
                >
                  요금제 보기
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl bg-white p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-business-target flex items-center justify-center">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">320% ROI</div>
                      <div className="text-gray-600">평균 캠페인 성과</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {['실시간 분석', '성과 기반 과금', 'AI 자동 매칭', '전담 매니저'].map(
                      (item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-cyan-200 to-emerald-200 rounded-full blur-2xl opacity-60" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full blur-2xl opacity-60" />
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
                <div className="text-4xl font-bold text-gradient-business mb-2">{stat.value}</div>
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
              왜 <span className="text-gradient-business">Voosting</span>인가?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              AI 기술과 데이터 분석을 통해 브랜드 마케팅의 새로운 기준을 제시합니다
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

                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section-padding section-spacing bg-gradient-to-br from-gray-50 to-cyan-50/30">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              간단한 <span className="text-gradient-business">4단계</span> 프로세스
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              복잡한 인플루언서 마케팅을 누구나 쉽게 시작할 수 있습니다
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-business-target text-white text-2xl font-bold mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>

                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full">
                    <ArrowRight className="w-6 h-6 text-cyan-400 -ml-3" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding section-spacing bg-gradient-business-target text-white">
        <div className="container-max text-center">
          <h2 className="text-4xl font-bold mb-4">지금 시작하고 매출을 성장시키세요</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            10,000개 이상의 검증된 크리에이터와 함께 브랜드의 성장을 경험하세요
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-cyan-600 font-semibold hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 group"
            >
              무료로 시작하기
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full border-2 border-white text-white font-semibold hover:bg-white hover:text-cyan-600 transition-colors"
            >
              전문가 상담받기
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-8 text-sm opacity-80">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>신용카드 불필요</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>언제든 취소 가능</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>24시간 고객지원</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

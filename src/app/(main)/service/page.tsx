'use client';

import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle,
  Zap,
  Target,
  BarChart,
  Users,
  Shield,
  Clock,
  HeadphonesIcon,
  Award,
} from 'lucide-react';

const serviceFeatures = [
  {
    icon: Zap,
    title: 'AI 기반 자동 매칭',
    description: '브랜드 특성과 타겟 고객을 분석하여 최적의 크리에이터를 자동으로 매칭합니다.',
    details: [
      '딥러닝 기반 크리에이터 분석',
      '팔로워 인구통계 매칭',
      '콘텐츠 스타일 분석',
      '과거 성과 데이터 활용',
    ],
  },
  {
    icon: Target,
    title: '성과 기반 과금',
    description: '실제 전환과 판매에 따라 비용을 지불하는 합리적인 과금 체계입니다.',
    details: ['CPA/CPS 기반 과금', '최소 보장 수수료', '투명한 비용 구조', '예산 설정 및 관리'],
  },
  {
    icon: BarChart,
    title: '실시간 성과 분석',
    description: '캠페인 성과를 실시간으로 추적하고 데이터 기반 의사결정을 지원합니다.',
    details: ['실시간 대시보드', '전환 추적 및 분석', 'ROI/ROAS 측정', '경쟁사 벤치마킹'],
  },
  {
    icon: Users,
    title: '검증된 크리에이터 풀',
    description: '엄격한 심사를 통과한 10,000+ 크리에이터가 활동하고 있습니다.',
    details: ['신원 및 팔로워 검증', '콘텐츠 품질 평가', '과거 성과 이력', '전문 분야별 분류'],
  },
];

const processFlow = [
  {
    title: '캠페인 설정',
    description: '브랜드 목표, 타겟 고객, 예산을 설정합니다.',
    duration: '5분',
  },
  {
    title: 'AI 매칭',
    description: 'AI가 최적의 크리에이터를 찾아 추천합니다.',
    duration: '즉시',
  },
  {
    title: '제안서 검토',
    description: '크리에이터의 제안서를 검토하고 선택합니다.',
    duration: '1-2일',
  },
  {
    title: '콘텐츠 제작',
    description: '크리에이터가 브랜드에 맞는 콘텐츠를 제작합니다.',
    duration: '3-7일',
  },
  {
    title: '성과 추적',
    description: '실시간으로 캠페인 성과를 모니터링합니다.',
    duration: '지속',
  },
];

const guarantees = [
  {
    icon: Shield,
    title: '성과 보장',
    description: '설정한 KPI를 달성하지 못하면 수수료를 환불해드립니다.',
  },
  {
    icon: Clock,
    title: '24시간 지원',
    description: '전담 매니저가 캠페인 전 과정을 24시간 지원합니다.',
  },
  {
    icon: HeadphonesIcon,
    title: '전문 컨설팅',
    description: '마케팅 전문가의 무료 컨설팅을 제공합니다.',
  },
  {
    icon: Award,
    title: '품질 보증',
    description: '모든 콘텐츠는 품질 검수 후 게시됩니다.',
  },
];

export default function ServicePage() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="section-padding section-spacing bg-gradient-to-br from-cyan-50 via-white to-emerald-50">
        <div className="container-max">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold">
              비즈니스를 위한
              <span className="text-gradient-business block mt-2">완벽한 마케팅 솔루션</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              AI 기술과 데이터 분석을 통해 브랜드에 가장 적합한 크리에이터를 찾고, 실제 성과에 따라
              비용을 지불하는 혁신적인 마케팅 플랫폼입니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
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
        </div>
      </section>

      {/* Service Features */}
      <section className="section-padding section-spacing">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">핵심 서비스 기능</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Voosting만의 차별화된 기능으로 마케팅 성과를 극대화하세요
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {serviceFeatures.map((feature, index) => (
              <div key={index} className="bento-card p-8">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-business-target flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Flow */}
      <section className="section-padding section-spacing bg-gray-50">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">간단한 시작 프로세스</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              복잡한 준비 없이 5분 만에 캠페인을 시작할 수 있습니다
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {processFlow.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-16 h-16 rounded-full bg-gradient-business-target flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                    <span className="text-sm text-cyan-600 font-medium">
                      소요시간: {step.duration}
                    </span>
                  </div>
                </div>
                {index < processFlow.length - 1 && (
                  <div className="w-0.5 h-8 bg-gray-300 ml-8 -mt-8 mb-8" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantees */}
      <section className="section-padding section-spacing">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Voosting 보장 제도</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              고객의 성공을 위해 4가지 보장 제도를 운영합니다
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {guarantees.map((guarantee, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-business-target flex items-center justify-center mx-auto mb-4">
                  <guarantee.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{guarantee.title}</h3>
                <p className="text-gray-600">{guarantee.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding section-spacing bg-gradient-business-target text-white">
        <div className="container-max text-center">
          <h2 className="text-4xl font-bold mb-4">지금 시작하고 성과를 경험하세요</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            2,500개 이상의 브랜드가 Voosting과 함께 성장하고 있습니다
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
        </div>
      </section>
    </div>
  );
}

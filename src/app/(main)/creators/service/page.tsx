'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle, DollarSign, Users, Zap, TrendingUp, Gift } from 'lucide-react';

const serviceFeatures = [
  {
    icon: DollarSign,
    title: '3단계 추천 수익 시스템',
    description: '당신이 초대한 크리에이터의 활동으로 지속적인 수익을 창출하세요.',
    details: [
      '1단계: 직접 추천 시 10% 수익',
      '2단계: 추천인의 추천 시 5% 수익',
      '3단계: 2단계의 추천 시 2% 수익',
      '평생 지속되는 패시브 인컴',
    ],
  },
  {
    icon: Zap,
    title: '드래그앤드롭 페이지 빌더',
    description: '코딩 없이 전문적인 프로모션 페이지를 만들 수 있습니다.',
    details: ['다양한 템플릿 제공', '모바일 최적화 자동화', 'SEO 최적화 지원', '실시간 미리보기'],
  },
  {
    icon: TrendingUp,
    title: '실시간 성과 분석',
    description: '캠페인 성과와 수익을 실시간으로 확인하고 전략을 개선하세요.',
    details: ['방문자 및 전환 추적', '수익 상세 분석', 'A/B 테스트 지원', '경쟁사 벤치마킹'],
  },
  {
    icon: Users,
    title: 'AI 캠페인 매칭',
    description: '팔로워 특성과 콘텐츠 스타일에 맞는 최적의 캠페인을 추천받으세요.',
    details: [
      '팔로워 인구통계 분석',
      '콘텐츠 카테고리 매칭',
      '브랜드 적합도 평가',
      '예상 수익 시뮬레이션',
    ],
  },
];

const revenueStructure = [
  {
    type: '직접 캠페인 수익',
    description: '참여한 캠페인의 성과에 따른 수익',
    rate: '기본 수수료 + 성과 보너스',
    example: '월 평균 ₩500,000 ~ ₩5,000,000',
  },
  {
    type: '1단계 추천 수익',
    description: '직접 초대한 크리에이터의 수익 10%',
    rate: '10%',
    example: '5명 추천 시 월 ₩250,000 추가',
  },
  {
    type: '2단계 추천 수익',
    description: '1단계가 초대한 크리에이터의 수익 5%',
    rate: '5%',
    example: '25명 네트워크 시 월 ₩625,000 추가',
  },
  {
    type: '3단계 추천 수익',
    description: '2단계가 초대한 크리에이터의 수익 2%',
    rate: '2%',
    example: '125명 네트워크 시 월 ₩500,000 추가',
  },
];

const successStories = [
  {
    name: '김OO 크리에이터',
    followers: '3.5만 팔로워',
    monthlyIncome: '₩3,200,000',
    referralIncome: '₩1,800,000',
    quote: '추천 수익으로 안정적인 수입이 생겼어요',
  },
  {
    name: '이OO 인플루언서',
    followers: '8만 팔로워',
    monthlyIncome: '₩6,500,000',
    referralIncome: '₩2,300,000',
    quote: '팔로워가 곧 자산이 되는 경험을 했습니다',
  },
  {
    name: '박OO 유튜버',
    followers: '15만 구독자',
    monthlyIncome: '₩12,000,000',
    referralIncome: '₩4,500,000',
    quote: '콘텐츠 제작에만 집중할 수 있게 되었어요',
  },
];

export default function CreatorServicePage() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="section-padding section-spacing bg-gradient-to-br from-violet-50 via-white to-emerald-50">
        <div className="container-max">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold">
              크리에이터를 위한
              <span className="text-gradient-creator block mt-2">완벽한 수익화 플랫폼</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              팔로워를 수익으로 전환하고, 3단계 추천 시스템으로 지속 가능한 수익을 만드세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-gradient-creator-target text-white font-semibold hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 group"
              >
                지금 시작하기
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/creators/calculator"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full border-2 border-gray-300 font-semibold hover:border-gray-400 transition-colors"
              >
                수익 계산하기
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
              크리에이터의 성공을 위해 설계된 강력한 도구들
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {serviceFeatures.map((feature, index) => (
              <div key={index} className="bento-card p-8">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-creator-target flex items-center justify-center flex-shrink-0">
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

      {/* Revenue Structure */}
      <section className="section-padding section-spacing bg-gradient-to-br from-gray-50 to-violet-50/30">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">수익 구조</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              다양한 수익원으로 안정적인 수입을 만들어보세요
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {revenueStructure.map((revenue, index) => (
              <div key={index} className="bento-card p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-creator-target flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{revenue.type}</h3>
                    <p className="text-gray-600 mb-3">{revenue.description}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-violet-600">수익률:</span>
                      <span className="text-sm font-bold">{revenue.rate}</span>
                    </div>
                    <div className="text-sm text-gray-500">예시: {revenue.example}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-violet-100 rounded-full">
              <Gift className="w-5 h-5 text-violet-600" />
              <span className="font-semibold text-violet-700">
                총 예상 월 수익: ₩2,875,000 이상 가능
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="section-padding section-spacing">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">성공 사례</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Voosting과 함께 성장한 크리에이터들의 이야기
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <div key={index} className="bento-card p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-creator-target mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl text-white font-bold">{story.name.charAt(0)}</span>
                </div>
                <h3 className="font-semibold mb-1">{story.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{story.followers}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">캠페인 수익</span>
                    <span className="font-medium">{story.monthlyIncome}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">추천 수익</span>
                    <span className="font-medium text-violet-600">{story.referralIncome}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 italic">&ldquo;{story.quote}&rdquo;</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding section-spacing bg-gradient-creator-target text-white">
        <div className="container-max text-center">
          <h2 className="text-4xl font-bold mb-4">당신의 영향력을 수익으로 만드세요</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            8,500명의 크리에이터가 이미 Voosting과 함께 성장하고 있습니다
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-emerald-600 font-semibold hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 group"
            >
              지금 시작하기
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/creators/calculator"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full border-2 border-white text-white font-semibold hover:bg-white hover:text-emerald-600 transition-colors"
            >
              예상 수익 계산하기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { Check, X, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Starter',
    description: '소규모 비즈니스를 위한 기본 플랜',
    price: '₩99,000',
    period: '/월',
    features: [
      { text: '월 5개 캠페인', included: true },
      { text: '기본 AI 매칭', included: true },
      { text: '실시간 대시보드', included: true },
      { text: '이메일 지원', included: true },
      { text: '전담 매니저', included: false },
      { text: '고급 분석 도구', included: false },
      { text: 'API 액세스', included: false },
    ],
    cta: '시작하기',
    popular: false,
  },
  {
    name: 'Professional',
    description: '성장하는 비즈니스를 위한 프로 플랜',
    price: '₩299,000',
    period: '/월',
    features: [
      { text: '월 20개 캠페인', included: true },
      { text: '고급 AI 매칭', included: true },
      { text: '실시간 대시보드', included: true },
      { text: '24/7 전화 지원', included: true },
      { text: '전담 매니저', included: true },
      { text: '고급 분석 도구', included: true },
      { text: 'API 액세스', included: false },
    ],
    cta: '시작하기',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: '대기업을 위한 맞춤형 솔루션',
    price: '맞춤 견적',
    period: '',
    features: [
      { text: '무제한 캠페인', included: true },
      { text: '엔터프라이즈 AI', included: true },
      { text: '맞춤형 대시보드', included: true },
      { text: '전담 지원팀', included: true },
      { text: '전담 매니저 팀', included: true },
      { text: '맞춤형 분석 도구', included: true },
      { text: 'API 무제한 액세스', included: true },
    ],
    cta: '상담 요청',
    popular: false,
  },
];

const faqs = [
  {
    question: '무료 체험이 가능한가요?',
    answer:
      '네, 모든 플랜은 14일 무료 체험이 가능합니다. 신용카드 등록 없이 바로 시작할 수 있습니다.',
  },
  {
    question: '플랜 변경이 가능한가요?',
    answer:
      '언제든지 플랜을 업그레이드하거나 다운그레이드할 수 있습니다. 변경사항은 다음 결제일부터 적용됩니다.',
  },
  {
    question: '성과 기반 수수료는 어떻게 책정되나요?',
    answer:
      '캠페인 유형과 목표에 따라 CPA는 5-15%, CPS는 10-20% 수준으로 책정됩니다. 자세한 내용은 상담을 통해 안내드립니다.',
  },
  {
    question: '환불 정책은 어떻게 되나요?',
    answer: '서비스에 만족하지 못하신 경우 30일 이내 전액 환불이 가능합니다.',
  },
];

export default function PricingPage() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="section-padding section-spacing bg-gradient-to-br from-cyan-50 via-white to-emerald-50">
        <div className="container-max">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold">
              합리적인 <span className="text-gradient-business">요금제</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              비즈니스 규모에 맞는 요금제를 선택하고 성과 기반 마케팅을 시작하세요
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="section-padding section-spacing">
        <div className="container-max">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={cn(
                  'relative rounded-3xl p-8 transition-all duration-300',
                  plan.popular
                    ? 'bento-card border-2 border-cyan-500 scale-105 shadow-2xl'
                    : 'bento-card hover:scale-105',
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-business-target text-white text-sm font-medium">
                      <Sparkles className="w-4 h-4" />
                      가장 인기 있는 플랜
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
                      )}
                      <span className={cn(feature.included ? 'text-gray-700' : 'text-gray-400')}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.name === 'Enterprise' ? '/contact' : '/sign-up'}
                  className={cn(
                    'block w-full text-center py-3 rounded-full font-semibold transition-all duration-200',
                    plan.popular
                      ? 'bg-gradient-business-target text-white hover:shadow-lg hover:-translate-y-0.5'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                  )}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600">
              모든 플랜은 <span className="font-semibold">14일 무료 체험</span>이 가능합니다
            </p>
          </div>
        </div>
      </section>

      {/* Additional Fees */}
      <section className="section-padding py-12 bg-gray-50">
        <div className="container-max">
          <div className="max-w-4xl mx-auto">
            <div className="bento-card p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">성과 기반 수수료</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-3">CPA (Cost Per Action)</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" />
                      회원가입: 5-10%
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" />앱 설치: 5-15%
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" />
                      이벤트 참여: 10-15%
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">CPS (Cost Per Sale)</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" />
                      일반 상품: 10-15%
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" />
                      고가 상품: 15-20%
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" />
                      구독 서비스: 20-25%
                    </li>
                  </ul>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-6 text-center">
                * 정확한 수수료는 캠페인 규모와 목표에 따라 협의 가능합니다
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding section-spacing">
        <div className="container-max">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">자주 묻는 질문</h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bento-card p-6">
                  <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding section-spacing bg-gradient-business-target text-white">
        <div className="container-max text-center">
          <h2 className="text-4xl font-bold mb-4">준비되셨나요?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            14일 무료 체험으로 Voosting의 강력한 기능을 경험해보세요
          </p>

          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-cyan-600 font-semibold hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 group"
          >
            무료로 시작하기
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}

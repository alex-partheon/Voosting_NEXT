'use client';

import Link from 'next/link';
import { ArrowRight, Calculator, Info } from 'lucide-react';
import { EarningsCalculator } from '@/components/calculator/earnings-calculator';

export default function CalculatorPage() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="section-padding section-spacing bg-gradient-to-br from-violet-50 via-white to-emerald-50">
        <div className="container-max">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium">
              <Calculator className="w-4 h-4" />
              예상 수익 계산기
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold">
              나의 예상 수익을
              <span className="text-gradient-creator block mt-2">계산해보세요</span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed">
              팔로워 수와 활동 계획을 입력하고, 직접 수익과 3단계 추천 수익을 포함한 총 예상 수익을
              확인하세요
            </p>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="section-padding section-spacing">
        <div className="container-max">
          <EarningsCalculator />
        </div>
      </section>

      {/* Info Section */}
      <section className="section-padding py-12 bg-gray-50">
        <div className="container-max">
          <div className="max-w-4xl mx-auto">
            <div className="bento-card p-8">
              <div className="flex items-start gap-3 mb-6">
                <Info className="w-6 h-6 text-violet-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">계산 방식 안내</h3>
                  <p className="text-gray-600">
                    본 계산기는 평균적인 데이터를 기반으로 예상 수익을 산출합니다. 실제 수익은
                    캠페인 종류, 콘텐츠 품질, 타겟 정확도 등에 따라 달라질 수 있습니다.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">직접 수익 계산 기준</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• 팔로워당 평균 단가: ₩50</li>
                    <li>• 참여율에 따른 실제 도달률 반영</li>
                    <li>• 캠페인별 최대 ₩500,000 한도</li>
                    <li>• 성과 보너스 별도</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">추천 수익 계산 기준</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• 추천인 평균 월 수익: ₩500,000</li>
                    <li>• 1단계: 수익의 10%</li>
                    <li>• 2단계: 수익의 5%</li>
                    <li>• 3단계: 수익의 2%</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding section-spacing bg-gradient-creator-target text-white">
        <div className="container-max text-center">
          <h2 className="text-4xl font-bold mb-4">계산 결과가 마음에 드시나요?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            지금 바로 시작하고 예상 수익을 현실로 만들어보세요
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
              href="/creators/service"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full border-2 border-white text-white font-semibold hover:bg-white hover:text-emerald-600 transition-colors"
            >
              서비스 자세히 보기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Users, DollarSign, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalculatorInputs {
  followers: number;
  engagementRate: number;
  campaignsPerMonth: number;
  referralL1: number;
  referralL2: number;
  referralL3: number;
}

interface CalculatedResults {
  directIncome: number;
  referralL1Income: number;
  referralL2Income: number;
  referralL3Income: number;
  totalMonthlyIncome: number;
  totalYearlyIncome: number;
}

export function EarningsCalculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    followers: 10000,
    engagementRate: 3,
    campaignsPerMonth: 4,
    referralL1: 5,
    referralL2: 25,
    referralL3: 125,
  });

  const [results, setResults] = useState<CalculatedResults>({
    directIncome: 0,
    referralL1Income: 0,
    referralL2Income: 0,
    referralL3Income: 0,
    totalMonthlyIncome: 0,
    totalYearlyIncome: 0,
  });

  // 수익 계산 로직
  useEffect(() => {
    // 직접 수익 계산 (팔로워수 * 참여율 * 캠페인수 * 단가)
    const avgCampaignPrice = Math.min(inputs.followers * 0.05, 500000); // 팔로워당 50원, 최대 50만원
    const directIncome =
      avgCampaignPrice * inputs.campaignsPerMonth * (inputs.engagementRate / 100);

    // 추천 수익 계산 (각 레벨의 평균 수익 * 인원수 * 수수료율)
    const avgReferralIncome = 500000; // 추천인 평균 월 수익
    const referralL1Income = inputs.referralL1 * avgReferralIncome * 0.1;
    const referralL2Income = inputs.referralL2 * avgReferralIncome * 0.05;
    const referralL3Income = inputs.referralL3 * avgReferralIncome * 0.02;

    const totalMonthlyIncome =
      directIncome + referralL1Income + referralL2Income + referralL3Income;
    const totalYearlyIncome = totalMonthlyIncome * 12;

    setResults({
      directIncome,
      referralL1Income,
      referralL2Income,
      referralL3Income,
      totalMonthlyIncome,
      totalYearlyIncome,
    });
  }, [inputs]);

  const handleInputChange = (field: keyof CalculatorInputs, value: number) => {
    setInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const presetFollowers = [5000, 10000, 50000, 100000, 500000];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* 입력 섹션 */}
        <div className="space-y-6">
          <div className="bento-card p-6">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Calculator className="w-6 h-6 text-violet-600" />
              기본 정보 입력
            </h3>

            {/* 팔로워 수 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">팔로워 수</label>
              <input
                type="number"
                value={inputs.followers}
                onChange={(e) => handleInputChange('followers', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              <div className="flex gap-2 mt-3">
                {presetFollowers.map((count) => (
                  <button
                    key={count}
                    onClick={() => handleInputChange('followers', count)}
                    className={cn(
                      'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                      inputs.followers === count
                        ? 'bg-violet-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                    )}
                  >
                    {count.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* 참여율 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                평균 참여율 (%)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={inputs.engagementRate}
                  onChange={(e) => handleInputChange('engagementRate', parseFloat(e.target.value))}
                  className="flex-1"
                />
                <span className="w-16 text-right font-medium">{inputs.engagementRate}%</span>
              </div>
            </div>

            {/* 월 캠페인 수 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                월 평균 캠페인 수
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={inputs.campaignsPerMonth}
                  onChange={(e) => handleInputChange('campaignsPerMonth', parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="w-16 text-right font-medium">{inputs.campaignsPerMonth}개</span>
              </div>
            </div>
          </div>

          <div className="bento-card p-6">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-emerald-600" />
              추천 네트워크
            </h3>

            {/* 1단계 추천 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                1단계 추천 (직접 추천)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={inputs.referralL1}
                  onChange={(e) => handleInputChange('referralL1', parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="w-16 text-right font-medium">{inputs.referralL1}명</span>
              </div>
            </div>

            {/* 2단계 추천 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                2단계 추천 (1단계가 추천)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="250"
                  step="5"
                  value={inputs.referralL2}
                  onChange={(e) => handleInputChange('referralL2', parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="w-16 text-right font-medium">{inputs.referralL2}명</span>
              </div>
            </div>

            {/* 3단계 추천 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                3단계 추천 (2단계가 추천)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="25"
                  value={inputs.referralL3}
                  onChange={(e) => handleInputChange('referralL3', parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="w-16 text-right font-medium">{inputs.referralL3}명</span>
              </div>
            </div>
          </div>
        </div>

        {/* 결과 섹션 */}
        <div className="space-y-6">
          <div className="bento-card p-6 bg-gradient-to-br from-violet-50 to-emerald-50">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <DollarSign className="w-6 h-6" />
              예상 수익
            </h3>

            {/* 월 수익 상세 */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <span className="text-gray-600">직접 캠페인 수익</span>
                <span className="font-semibold">{formatCurrency(results.directIncome)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <span className="text-gray-600">1단계 추천 수익 (10%)</span>
                <span className="font-semibold text-emerald-600">
                  {formatCurrency(results.referralL1Income)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <span className="text-gray-600">2단계 추천 수익 (5%)</span>
                <span className="font-semibold text-violet-600">
                  {formatCurrency(results.referralL2Income)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <span className="text-gray-600">3단계 추천 수익 (2%)</span>
                <span className="font-semibold text-purple-600">
                  {formatCurrency(results.referralL3Income)}
                </span>
              </div>
            </div>

            {/* 총 수익 */}
            <div className="border-t pt-6">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 mb-1">예상 월 수익</p>
                <p className="text-4xl font-bold text-gradient-creator">
                  {formatCurrency(results.totalMonthlyIncome)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">예상 연 수익</p>
                <p className="text-2xl font-semibold">
                  {formatCurrency(results.totalYearlyIncome)}
                </p>
              </div>
            </div>
          </div>

          {/* 수익 증대 팁 */}
          <div className="bento-card p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              수익 증대 팁
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <ChevronRight className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">추천 네트워크 확대</p>
                  <p className="text-sm text-gray-600">주변 크리에이터들을 적극적으로 초대하세요</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">참여율 향상</p>
                  <p className="text-sm text-gray-600">콘텐츠 품질을 개선하여 참여율을 높이세요</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">다양한 캠페인 참여</p>
                  <p className="text-sm text-gray-600">
                    다양한 브랜드의 캠페인에 참여하여 수익을 극대화하세요
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

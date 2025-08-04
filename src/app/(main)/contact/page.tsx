'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Building } from 'lucide-react';

const contactInfo = [
  {
    icon: Phone,
    title: '전화',
    content: '02-1234-5678',
    subContent: '평일 09:00 - 18:00',
  },
  {
    icon: Mail,
    title: '이메일',
    content: 'support@voosting.com',
    subContent: '24시간 접수 가능',
  },
  {
    icon: MapPin,
    title: '주소',
    content: '서울특별시 강남구 테헤란로 123',
    subContent: '부스팅빌딩 5층',
  },
  {
    icon: MessageSquare,
    title: '실시간 채팅',
    content: '우측 하단 채팅 버튼',
    subContent: '평일 09:00 - 22:00',
  },
];

const inquiryTypes = ['서비스 문의', '가격 문의', '기술 지원', '제휴 제안', '기타'];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    inquiryType: '서비스 문의',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 실제 구현 시 API 호출
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 시뮬레이션
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        inquiryType: '서비스 문의',
        message: '',
      });
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="section-padding section-spacing bg-gradient-to-br from-cyan-50 via-white to-emerald-50">
        <div className="container-max">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold">
              무엇을 <span className="text-gradient-business">도와드릴까요?</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Voosting 전문가들이 여러분의 비즈니스 성장을 위해 함께합니다
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="section-padding py-16 bg-gray-50">
        <div className="container-max">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <div key={index} className="bento-card p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-business-target flex items-center justify-center mx-auto mb-4">
                  <info.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">{info.title}</h3>
                <p className="text-gray-900 font-medium">{info.content}</p>
                <p className="text-sm text-gray-600">{info.subContent}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="section-padding section-spacing">
        <div className="container-max">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-12">
              {/* Form */}
              <div className="lg:col-span-3">
                <div className="bento-card p-8">
                  <h2 className="text-2xl font-bold mb-6">문의하기</h2>

                  {submitStatus === 'success' && (
                    <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-lg">
                      문의가 성공적으로 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.
                    </div>
                  )}

                  {submitStatus === 'error' && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
                      문의 접수 중 오류가 발생했습니다. 다시 시도해주세요.
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          이름 *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          이메일 *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="company"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          회사명
                        </label>
                        <input
                          type="text"
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          연락처
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="inquiryType"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        문의 유형 *
                      </label>
                      <select
                        id="inquiryType"
                        name="inquiryType"
                        required
                        value={formData.inquiryType}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      >
                        {inquiryTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        문의 내용 *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center px-6 py-3 rounded-full bg-gradient-business-target text-white font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        '전송 중...'
                      ) : (
                        <>
                          문의 전송
                          <Send className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Additional Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bento-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-6 h-6 text-cyan-600" />
                    <h3 className="text-lg font-semibold">운영 시간</h3>
                  </div>
                  <div className="space-y-2 text-gray-600">
                    <p>평일: 09:00 - 18:00</p>
                    <p>토요일: 10:00 - 16:00</p>
                    <p>일요일 및 공휴일: 휴무</p>
                  </div>
                </div>

                <div className="bento-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Building className="w-6 h-6 text-cyan-600" />
                    <h3 className="text-lg font-semibold">기업 정보</h3>
                  </div>
                  <div className="space-y-2 text-gray-600">
                    <p>주식회사 부스팅</p>
                    <p>대표이사: 홍길동</p>
                    <p>사업자등록번호: 123-45-67890</p>
                    <p>통신판매업신고: 2024-서울강남-1234</p>
                  </div>
                </div>

                <div className="bento-card p-6 bg-gradient-to-br from-cyan-50 to-emerald-50">
                  <h3 className="text-lg font-semibold mb-3">빠른 답변을 원하시나요?</h3>
                  <p className="text-gray-600 mb-4">
                    실시간 채팅 상담을 통해 즉시 답변을 받아보세요.
                  </p>
                  <button className="w-full px-4 py-2 bg-gradient-business-target text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200">
                    실시간 채팅 시작
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

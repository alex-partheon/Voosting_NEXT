import Link from 'next/link';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
  company: {
    title: '회사',
    links: [
      { label: '회사소개', href: '/about' },
      { label: '채용', href: '/careers' },
      { label: '블로그', href: '/blog' },
      { label: '언론보도', href: '/press' },
    ],
  },
  service: {
    title: '서비스',
    links: [
      { label: '비즈니스', href: '/' },
      { label: '크리에이터', href: '/creators' },
      { label: '요금제', href: '/pricing' },
      { label: 'API', href: '/api' },
    ],
  },
  support: {
    title: '지원',
    links: [
      { label: '도움말', href: '/help' },
      { label: 'FAQ', href: '/faq' },
      { label: '문의하기', href: '/contact' },
      { label: '파트너', href: '/partners' },
    ],
  },
  legal: {
    title: '법적고지',
    links: [
      { label: '이용약관', href: '/terms' },
      { label: '개인정보처리방침', href: '/privacy' },
      { label: '환불정책', href: '/refund' },
      { label: '저작권정책', href: '/copyright' },
    ],
  },
};

const socialLinks = [
  { icon: Facebook, href: 'https://facebook.com/voosting', label: 'Facebook' },
  { icon: Instagram, href: 'https://instagram.com/voosting', label: 'Instagram' },
  { icon: Twitter, href: 'https://twitter.com/voosting', label: 'Twitter' },
  { icon: Youtube, href: 'https://youtube.com/@voosting', label: 'Youtube' },
];

export function CommonFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container-max section-padding">
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {/* Company Info */}
            <div className="col-span-2 lg:col-span-2">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gradient-cash">Voosting</h3>
                <p className="mt-3 text-gray-600">
                  AI가 연결하는 크리에이터와 비즈니스의 성공적인 마케팅 파트너십
                </p>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>서울특별시 강남구 테헤란로 123 부스팅빌딩 5층</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>02-1234-5678</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span>support@voosting.com</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-3 mt-6">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5 text-gray-700" />
                  </a>
                ))}
              </div>
            </div>

            {/* Footer Links */}
            {Object.entries(footerLinks).map(([key, section]) => (
              <div key={key}>
                <h4 className="font-semibold text-gray-900 mb-4">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <div>© 2024 Voosting. All rights reserved.</div>
            <div className="flex items-center gap-6">
              <span>사업자등록번호: 123-45-67890</span>
              <span>통신판매업신고: 2024-서울강남-1234</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

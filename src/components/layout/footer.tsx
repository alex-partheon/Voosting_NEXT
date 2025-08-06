import Link from 'next/link';
import { 
  Facebook, Instagram, Twitter, Youtube, 
  Mail, Phone, MapPin 
} from 'lucide-react';

const footerLinks = {
  company: [
    { name: '회사 소개', href: '/about' },
    { name: '채용', href: '/careers' },
    { name: '뉴스', href: '/news' },
    { name: '블로그', href: '/blog' },
  ],
  service: [
    { name: '비즈니스', href: '/business' },
    { name: '크리에이터', href: '/creator' },
    { name: '요금제', href: '/business/pricing' },
    { name: 'API', href: '/api' },
  ],
  support: [
    { name: '도움말', href: '/help' },
    { name: '문의하기', href: '/business/contact' },
    { name: '이용약관', href: '/terms' },
    { name: '개인정보처리방침', href: '/privacy' },
  ],
  social: [
    { name: 'Facebook', href: '#', icon: Facebook },
    { name: 'Instagram', href: '#', icon: Instagram },
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'Youtube', href: '#', icon: Youtube },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-teal-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                부스팅
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI가 만드는 완벽한 매칭으로<br />
              새로운 마케팅 가치를 창출합니다
            </p>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@voosting.app</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>02-1234-5678</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>서울시 강남구 테헤란로 123</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              회사
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              서비스
            </h3>
            <ul className="space-y-2">
              {footerLinks.service.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              고객지원
            </h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2024 Voosting. All rights reserved.
            </p>
            <div className="flex gap-4">
              {footerLinks.social.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  <span className="sr-only">{social.name}</span>
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
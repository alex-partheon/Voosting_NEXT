'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/theme/theme-provider';
import { Menu, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  isButton?: boolean;
  isPrimary?: boolean;
}

const businessNavItems: NavItem[] = [
  { label: '홈', href: '/' },
  { label: '크리에이터', href: '/creators' },
  { label: '서비스', href: '/service' },
  { label: '요금제', href: '/pricing' },
  { label: '문의하기', href: '/contact' },
  { label: '로그인', href: '/sign-in' },
  { label: '무료로 시작하기', href: '/sign-up', isButton: true, isPrimary: true },
];

const creatorNavItems: NavItem[] = [
  { label: '홈', href: '/creators' },
  { label: '비즈니스', href: '/' },
  { label: '서비스', href: '/creators/service' },
  { label: '수익 계산기', href: '/creators/calculator' },
  { label: '로그인', href: '/sign-in' },
  { label: '무료로 시작하기', href: '/sign-up', isButton: true, isPrimary: true },
];

export function DualTargetNavigation() {
  const pathname = usePathname();
  const { target } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = target === 'creator' ? creatorNavItems : businessNavItems;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 모바일 메뉴 토글 시 body 스크롤 방지
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-lg' : 'bg-transparent',
      )}
    >
      <div className="container-max section-padding">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div
              className={cn(
                'text-2xl font-bold',
                target === 'creator' ? 'text-gradient-creator' : 'text-gradient-business',
              )}
            >
              Voosting
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'transition-all duration-200',
                  item.isButton
                    ? item.isPrimary
                      ? target === 'creator'
                        ? 'px-6 py-2.5 rounded-full bg-gradient-creator-target text-white font-medium hover:shadow-lg hover:-translate-y-0.5'
                        : 'px-6 py-2.5 rounded-full bg-gradient-business-target text-white font-medium hover:shadow-lg hover:-translate-y-0.5'
                      : 'px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400'
                    : cn(
                        'font-medium hover:opacity-80',
                        pathname === item.href
                          ? target === 'creator'
                            ? 'text-violet-600'
                            : 'text-cyan-600'
                          : isScrolled
                            ? 'text-gray-700'
                            : 'text-gray-800',
                      ),
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Target Switcher - Desktop */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => (window.location.href = '/')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                target === 'business'
                  ? 'bg-cyan-100 text-cyan-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              )}
            >
              비즈니스
            </button>
            <button
              onClick={() => (window.location.href = '/creators')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                target === 'creator'
                  ? 'bg-violet-100 text-violet-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              )}
            >
              크리에이터
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'lg:hidden fixed inset-x-0 top-16 bg-white shadow-xl transition-all duration-300 transform',
          isMobileMenuOpen
            ? 'translate-y-0 opacity-100'
            : '-translate-y-full opacity-0 pointer-events-none',
        )}
      >
        <div className="p-4 space-y-3">
          {/* Target Switcher - Mobile */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => {
                window.location.href = '/';
                setIsMobileMenuOpen(false);
              }}
              className={cn(
                'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                target === 'business' ? 'bg-cyan-100 text-cyan-700' : 'bg-gray-100 text-gray-600',
              )}
            >
              비즈니스
            </button>
            <button
              onClick={() => {
                window.location.href = '/creators';
                setIsMobileMenuOpen(false);
              }}
              className={cn(
                'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                target === 'creator'
                  ? 'bg-violet-100 text-violet-700'
                  : 'bg-gray-100 text-gray-600',
              )}
            >
              크리에이터
            </button>
          </div>

          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                'block transition-all duration-200',
                item.isButton
                  ? item.isPrimary
                    ? target === 'creator'
                      ? 'px-6 py-3 rounded-full bg-gradient-creator-target text-white font-medium text-center'
                      : 'px-6 py-3 rounded-full bg-gradient-business-target text-white font-medium text-center'
                    : 'px-4 py-3 rounded-lg border border-gray-300 text-center'
                  : cn(
                      'px-4 py-3 rounded-lg hover:bg-gray-50 flex items-center justify-between',
                      pathname === item.href
                        ? target === 'creator'
                          ? 'text-violet-600 bg-violet-50'
                          : 'text-cyan-600 bg-cyan-50'
                        : 'text-gray-700',
                    ),
              )}
            >
              <span>{item.label}</span>
              {!item.isButton && <ChevronRight className="w-4 h-4" />}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

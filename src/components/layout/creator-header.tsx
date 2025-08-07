'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Menu, X, Heart, Building2, 
  Sparkles, Calculator, MessageSquare 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: '홈', href: '/creator', icon: Heart },
  { name: '비즈니스', href: '/creator/business', icon: Building2 },
  { name: '서비스', href: '/creator/service', icon: Sparkles },
  { name: '수익 계산기', href: '/creator/calculator', icon: Calculator },
];

export function CreatorHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-mint-200/30 bg-white/80 backdrop-blur-xl dark:border-mint-800/30 dark:bg-gray-900/80">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/creator" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-mint-600 to-purple-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                부스팅
              </span>
              <span className="text-sm text-mint-600 dark:text-mint-400">
                크리에이터
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 text-sm font-medium transition-colors hover:text-mint-600 dark:hover:text-mint-400',
                  pathname === item.href
                    ? 'text-mint-600 dark:text-mint-400'
                    : 'text-gray-700 dark:text-gray-300'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex md:items-center md:gap-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/sign-in">로그인</Link>
            </Button>
            <Button asChild className="bg-mint-600 hover:bg-mint-700 text-white">
              <Link href="/auth/sign-up/creator">크리에이터 시작하기</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden"
          >
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium',
                    pathname === item.href
                      ? 'bg-mint-50 text-mint-600 dark:bg-mint-900/20 dark:text-mint-400'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
              <div className="mt-4 space-y-2 px-3">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/auth/sign-in">로그인</Link>
                </Button>
                <Button asChild className="w-full bg-mint-600 hover:bg-mint-700 text-white">
                  <Link href="/auth/sign-up/creator">크리에이터 시작하기</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </nav>
    </header>
  );
}
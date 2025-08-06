'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Menu, X, ChevronDown, Briefcase, Users, 
  BarChart3, CreditCard, MessageSquare 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: '홈', href: '/business', icon: Briefcase },
  { name: '크리에이터', href: '/business/creators', icon: Users },
  { name: '서비스', href: '/business/service', icon: BarChart3 },
  { name: '요금제', href: '/business/pricing', icon: CreditCard },
  { name: '문의하기', href: '/business/contact', icon: MessageSquare },
];

export function BusinessHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-blue-200/30 bg-white/80 backdrop-blur-xl dark:border-blue-800/30 dark:bg-gray-900/80">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/business" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-teal-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                부스팅
              </span>
              <span className="text-sm text-blue-600 dark:text-blue-400">
                비즈니스
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
                  'flex items-center gap-2 text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400',
                  pathname === item.href
                    ? 'text-blue-600 dark:text-blue-400'
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
              <Link href="/sign-in">로그인</Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/sign-up/business">무료로 시작하기</Link>
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
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
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
                  <Link href="/sign-in">로그인</Link>
                </Button>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href="/sign-up/business">무료로 시작하기</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </nav>
    </header>
  );
}
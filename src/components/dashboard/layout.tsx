'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChevronLeft,
  Home,
  BarChart3,
  Users,
  Settings,
  CreditCard,
  FileText,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Bell,
  Search
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType: 'business' | 'creator' | 'admin';
}

const navigationItems = {
  business: [
    { name: '대시보드', href: '/business/dashboard', icon: Home },
    { name: '캠페인', href: '/business/campaigns', icon: BarChart3 },
    { name: '크리에이터', href: '/business/creators', icon: Users },
    { name: '결제', href: '/business/billing', icon: CreditCard },
    { name: '리포트', href: '/business/reports', icon: FileText },
    { name: '설정', href: '/business/settings', icon: Settings },
  ],
  creator: [
    { name: '대시보드', href: '/creator/dashboard', icon: Home },
    { name: '캠페인', href: '/creator/campaigns', icon: BarChart3 },
    { name: '수익', href: '/creator/earnings', icon: CreditCard },
    { name: '페이지', href: '/creator/pages', icon: FileText },
    { name: '추천', href: '/creator/referrals', icon: Users },
    { name: '설정', href: '/creator/settings', icon: Settings },
  ],
  admin: [
    { name: '대시보드', href: '/admin/dashboard', icon: Home },
    { name: '사용자', href: '/admin/users', icon: Users },
    { name: '캠페인', href: '/admin/campaigns', icon: BarChart3 },
    { name: '결제', href: '/admin/payments', icon: CreditCard },
    { name: '리포트', href: '/admin/reports', icon: FileText },
    { name: '설정', href: '/admin/settings', icon: Settings },
  ],
};

export function DashboardLayout({ children, userType }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const navigation = navigationItems[userType];

  const themeClass = {
    business: 'business-theme',
    creator: 'creator-theme',
    admin: 'dashboard-theme',
  }[userType];

  return (
    <div className={cn('min-h-screen bg-gray-50 dark:bg-gray-900', themeClass)}>
      {/* Mobile menu button */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm dark:bg-gray-900 sm:px-6 lg:hidden">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-300 lg:hidden"
          onClick={() => setMobileMenuOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="flex-1 text-sm font-semibold leading-6 text-gray-900 dark:text-white">
          대시보드
        </div>
      </div>

      {/* Mobile sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/80" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900">
            <div className="flex h-16 items-center justify-between px-6">
              <span className="text-xl font-semibold text-gray-900 dark:text-white">
                부스팅
              </span>
              <button
                type="button"
                className="-m-2.5 p-2.5"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6 text-gray-700 dark:text-gray-300" aria-hidden="true" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7 px-6 pb-4">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={cn(
                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold',
                            pathname === item.href
                              ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                          )}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col" style={{ width: sidebarOpen ? '16rem' : '4rem' }}>
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex h-16 shrink-0 items-center justify-between">
            {sidebarOpen && (
              <span className="text-xl font-semibold text-gray-900 dark:text-white">
                부스팅
              </span>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="ml-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ChevronLeft className={cn('h-5 w-5 transition-transform', !sidebarOpen && 'rotate-180')} />
            </button>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold',
                          pathname === item.href
                            ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                        )}
                      >
                        <item.icon
                          className={cn(
                            'h-6 w-6 shrink-0',
                            pathname === item.href ? 'text-gray-900 dark:text-white' : 'text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'
                          )}
                          aria-hidden="true"
                        />
                        {sidebarOpen && item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto">
                <div className="-mx-2 space-y-1">
                  <Link
                    href="/support"
                    className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                  >
                    <HelpCircle className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                    {sidebarOpen && '도움말'}
                  </Link>
                  <button className="group flex w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white">
                    <LogOut className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                    {sidebarOpen && '로그아웃'}
                  </button>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className={cn('lg:transition-all lg:duration-300', sidebarOpen ? 'lg:pl-64' : 'lg:pl-16')}>
        {/* Top header */}
        <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:gap-x-6 sm:px-6 lg:px-8">
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <form className="relative flex flex-1" action="#" method="GET">
              <label htmlFor="search-field" className="sr-only">
                Search
              </label>
              <Search
                className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"
                aria-hidden="true"
              />
              <input
                id="search-field"
                className="block h-full w-full border-0 bg-transparent py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 dark:text-white dark:placeholder:text-gray-600 sm:text-sm"
                placeholder="검색..."
                type="search"
                name="search"
              />
            </form>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <span className="sr-only">View notifications</span>
                <Bell className="h-6 w-6" aria-hidden="true" />
              </button>
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200 dark:lg:bg-gray-700" aria-hidden="true" />
              <div className="relative">
                <button className="flex items-center gap-x-2 p-1.5 text-sm">
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700" />
                  <span className="hidden lg:flex lg:items-center">
                    <span className="ml-2 text-sm font-semibold leading-6 text-gray-900 dark:text-white" aria-hidden="true">
                      사용자
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
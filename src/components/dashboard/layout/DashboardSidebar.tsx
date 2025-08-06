'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  BarChart3,
  Users,
  FileText,
  Settings,
  HelpCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Zap,
  Database,
  Shield,
  PieChart,
  Folder
} from 'lucide-react';

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  theme?: 'purple' | 'dark' | 'light';
  domainType?: 'creator' | 'business' | 'admin' | 'main';
}

const navigationItems = {
  main: [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' },
    { icon: FileText, label: 'Projects', href: '/projects' },
    { icon: Users, label: 'Team', href: '/team' },
  ],
  creator: [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: FileText, label: 'My Pages', href: '/pages' },
    { icon: BarChart3, label: 'Earnings', href: '/earnings' },
    { icon: Users, label: 'Referrals', href: '/referrals' },
  ],
  business: [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: Zap, label: 'Campaigns', href: '/campaigns' },
    { icon: Users, label: 'Creators', href: '/creators' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  ],
  admin: [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: Users, label: 'Users', href: '/users' },
    { icon: Shield, label: 'Security', href: '/security' },
    { icon: Database, label: 'Database', href: '/database' },
  ],
};

const documentItems = [
  { icon: Folder, label: 'Data Library', href: '/library' },
  { icon: FileText, label: 'Reports', href: '/reports' },
  { icon: PieChart, label: 'Word Assistant', href: '/assistant' },
];

export function DashboardSidebar({ 
  collapsed, 
  onToggle, 
  theme = 'purple',
  domainType = 'main' 
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const themeClasses = {
    purple: 'bg-gradient-to-b from-[#6366f1] to-[#8b5cf6] text-white',
    dark: 'bg-gray-900 text-white',
    light: 'bg-white text-gray-900 border-r border-gray-200',
  };

  const navItems = navigationItems[domainType] || navigationItems.main;

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-full transition-all duration-300 z-40",
      collapsed ? "w-16" : "w-64",
      themeClasses[theme]
    )}>
      <div className="flex h-full flex-col">
        {/* Logo Section */}
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/" className={cn(
            "flex items-center gap-2 font-bold text-xl",
            collapsed && "justify-center"
          )}>
            {!collapsed ? (
              <>
                <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <span className="text-sm font-bold">V</span>
                </div>
                <span>Voosting</span>
              </>
            ) : (
              <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="text-sm font-bold">V</span>
              </div>
            )}
          </Link>
          <button
            onClick={onToggle}
            className={cn(
              "rounded-lg p-1.5 hover:bg-white/10 transition-colors",
              theme === 'light' && "hover:bg-gray-100"
            )}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Quick Create Button */}
        {!collapsed && (
          <div className="px-4 pb-4">
            <button className={cn(
              "w-full rounded-lg px-4 py-2.5 font-medium transition-all",
              "flex items-center justify-center gap-2",
              theme === 'purple' && "bg-white/20 hover:bg-white/30 text-white",
              theme === 'dark' && "bg-gray-800 hover:bg-gray-700 text-white",
              theme === 'light' && "bg-[#6366f1] hover:bg-[#5558e3] text-white"
            )}>
              <Plus size={20} />
              <span>Quick Create</span>
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  collapsed && "justify-center",
                  isActive ? (
                    theme === 'light' 
                      ? "bg-gray-100 text-gray-900" 
                      : "bg-white/20 text-white"
                  ) : (
                    theme === 'light'
                      ? "hover:bg-gray-50 text-gray-600"
                      : "hover:bg-white/10 text-white/80"
                  )
                )}
              >
                <item.icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}

          {/* Documents Section */}
          {!collapsed && (
            <>
              <div className="pt-4 pb-2">
                <h3 className={cn(
                  "px-3 text-xs font-semibold uppercase tracking-wider",
                  theme === 'light' ? "text-gray-500" : "text-white/60"
                )}>
                  Documents
                </h3>
              </div>
              {documentItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      isActive ? (
                        theme === 'light' 
                          ? "bg-gray-100 text-gray-900" 
                          : "bg-white/20 text-white"
                      ) : (
                        theme === 'light'
                          ? "hover:bg-gray-50 text-gray-600"
                          : "hover:bg-white/10 text-white/80"
                      )
                    )}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-white/20 p-2">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              collapsed && "justify-center",
              theme === 'light'
                ? "hover:bg-gray-50 text-gray-600"
                : "hover:bg-white/10 text-white/80"
            )}
          >
            <Settings size={20} />
            {!collapsed && <span>Settings</span>}
          </Link>
          <Link
            href="/help"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              collapsed && "justify-center",
              theme === 'light'
                ? "hover:bg-gray-50 text-gray-600"
                : "hover:bg-white/10 text-white/80"
            )}
          >
            <HelpCircle size={20} />
            {!collapsed && <span>Get Help</span>}
          </Link>
          <button
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              collapsed && "justify-center",
              theme === 'light'
                ? "hover:bg-gray-50 text-gray-600"
                : "hover:bg-white/10 text-white/80"
            )}
          >
            <Search size={20} />
            {!collapsed && <span>Search</span>}
          </button>
        </div>

        {/* User Section */}
        {!collapsed && (
          <div className={cn(
            "border-t p-4",
            theme === 'light' ? "border-gray-200" : "border-white/20"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium",
                theme === 'light' ? "bg-gray-200 text-gray-700" : "bg-white/20"
              )}>
                CN
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  user@example.com
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/supabase-auth-provider';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { 
  Github, 
  Download, 
  Crown,
  ChevronDown,
  Bell,
  Search,
  LogOut,
  User,
  Settings
} from 'lucide-react';

export function DashboardHeader() {
  const { user, profile, signOut } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        type: 'success',
        title: '로그아웃 완료',
        description: '안전하게 로그아웃되었습니다.',
      });
      router.push('/auth/sign-in');
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        type: 'error',
        title: '로그아웃 실패',
        description: '로그아웃 중 오류가 발생했습니다.',
      });
    }
  };

  const getUserInitial = () => {
    if (profile?.full_name) {
      return profile.full_name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    return profile?.full_name || user?.email?.split('@')[0] || 'User';
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200">
      <div className="flex h-full items-center justify-between px-6">
        {/* Left Section - Breadcrumb or Title */}
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-gray-900">대시보드</h1>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button 
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 hover:bg-gray-50 transition-colors"
            >
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                {getUserInitial()}
              </div>
              <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                {getUserDisplayName()}
              </span>
              <ChevronDown size={16} className="text-gray-500" />
            </button>

            {/* User Menu Dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <p className="text-xs text-gray-500 capitalize">{profile?.role || 'user'}</p>
                </div>
                
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    router.push('/profile');
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User size={16} />
                  프로필 설정
                </button>
                
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    router.push('/settings');
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Settings size={16} />
                  계정 설정
                </button>
                
                <div className="border-t border-gray-100 mt-1">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    로그아웃
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop for user menu */}
      {userMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </header>
  );
}
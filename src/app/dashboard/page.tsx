'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useDashboardStore } from '@/stores/dashboardStore';
import { useSecurityStore } from '@/stores/securityStore';
import { useProfile } from '@/hooks/use-profile';
import { DashboardShell } from './components/DashboardShell';
import { CreatorView } from './components/CreatorView';
import { BusinessView } from './components/BusinessView';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const { initializeDashboard } = useDashboardStore();
  const { logPageAccess, checkSessionTimeout } = useSecurityStore();
  const { data: profile, isLoading: profileLoading, error } = useProfile();

  // Security checks and logging
  useEffect(() => {
    if (user) {
      // Log page access
      logPageAccess('/dashboard', {
        userId: user.id,
        role: profile?.role,
        timestamp: new Date().toISOString(),
      });

      // Check session timeout
      const isTimeout = checkSessionTimeout();
      if (isTimeout) {
        router.push('/sign-in?reason=session-timeout');
        return;
      }

      // Initialize dashboard data
      if (profile) {
        initializeDashboard(profile.role);
      }
    }
  }, [user, profile, logPageAccess, checkSessionTimeout, initializeDashboard, router]);

  // Handle loading states
  if (authLoading || profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Handle errors
  if (error) {
    return (
      <div className="container mx-auto p-8">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load profile data. Please try refreshing the page or contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Handle missing profile
  if (!profile) {
    router.push('/onboarding');
    return null;
  }

  // Prevent admin access to regular dashboard
  if (profile.role === 'admin') {
    router.push('/admin-auth/sign-in');
    return null;
  }

  // Render role-based dashboard
  return (
    <DashboardShell userRole={profile.role}>
      {profile.role === 'creator' ? (
        <CreatorView profile={profile} />
      ) : profile.role === 'business' ? (
        <BusinessView profile={profile} />
      ) : (
        <div className="flex items-center justify-center h-full">
          <Alert variant="destructive">
            <AlertDescription>Invalid user role</AlertDescription>
          </Alert>
        </div>
      )}
    </DashboardShell>
  );
}
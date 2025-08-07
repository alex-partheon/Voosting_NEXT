import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Dashboard - Voosting',
  description: 'Manage your campaigns and earnings',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/auth/sign-in');
  }

  // Get user profile with role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    redirect('/onboarding');
  }

  // Reject admin users from regular dashboard
  if (profile.role === 'admin') {
    redirect('/admin-auth/sign-in');
  }

  // Check if account is suspended
  if (profile.status === 'suspended') {
    redirect('/account-suspended');
  }

  // Only allow creator and business roles
  if (!['creator', 'business'].includes(profile.role)) {
    redirect('/unauthorized');
  }

  return (
    <div className="min-h-screen bg-background">
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading dashboard...</p>
            </div>
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
  );
}
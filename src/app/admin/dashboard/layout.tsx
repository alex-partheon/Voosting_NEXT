import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Admin Dashboard - Voosting',
  description: 'System administration and monitoring',
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/admin-auth/sign-in');
  }

  // Get user profile with role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    redirect('/admin-auth/sign-in');
  }

  // Strictly enforce admin role
  if (profile.role !== 'admin') {
    // Log unauthorized access attempt
    await supabase.from('security_logs').insert({
      event_type: 'admin_unauthorized_access',
      user_id: user.id,
      details: {
        attempted_path: '/admin/dashboard',
        actual_role: profile.role,
        timestamp: new Date().toISOString(),
      },
    });
    
    redirect('/unauthorized');
  }

  // Check if admin account is active
  if (profile.status === 'suspended') {
    redirect('/account-suspended');
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {children}
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useSecurityStore } from '@/stores/securityStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { z } from 'zod';

const adminSignInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export default function AdminSignInPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const { logPageAccess, logSecurityEvent } = useSecurityStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);

  // Log page access and get IP
  useEffect(() => {
    const logAccess = async () => {
      const ip = await fetch('/api/ip').then(res => res.json()).catch(() => ({ ip: 'unknown' }));
      
      logPageAccess('/admin-auth/sign-in', {
        ip: ip.ip,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      });

      logSecurityEvent({
        type: 'admin_login_page_accessed',
        severity: 'info',
        details: {
          ip: ip.ip,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        },
      });
    };

    logAccess();
  }, [logPageAccess, logSecurityEvent]);

  // Block after too many attempts
  useEffect(() => {
    if (attemptCount >= 5) {
      setGeneralError('Too many failed attempts. Please contact system administrator.');
      logSecurityEvent({
        type: 'admin_login_blocked',
        severity: 'critical',
        details: {
          attemptCount,
          email: formData.email,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }, [attemptCount, formData.email, logSecurityEvent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Don't process if blocked
    if (attemptCount >= 5) return;

    setErrors({});
    setGeneralError(null);

    // Validate form
    try {
      adminSignInSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setIsLoading(true);

    try {
      // Create Supabase client
      const supabase = createBrowserClient();
      
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setAttemptCount(prev => prev + 1);
        setGeneralError(error.message);
        logSecurityEvent({
          type: 'admin_login_failed',
          severity: 'warning',
          details: {
            email: formData.email,
            error: error.message,
            attemptCount: attemptCount + 1,
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      if (!data.user) {
        setGeneralError('Authentication failed');
        return;
      }

      // Verify admin role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', data.user.id)
        .single();

      if (profile?.role !== 'admin') {
        await supabase.auth.signOut();
        setGeneralError('Unauthorized: Admin access only');
        logSecurityEvent({
          type: 'admin_login_unauthorized',
          severity: 'critical',
          details: {
            userId: data.user.id,
            email: formData.email,
            actualRole: profile?.role,
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      if (profile.status === 'suspended') {
        await supabase.auth.signOut();
        setGeneralError('Account suspended');
        return;
      }

      // Success - log and redirect
      setUser(data.user);
      
      const ip = await fetch('/api/ip').then(res => res.json()).catch(() => ({ ip: 'unknown' }));
      logSecurityEvent({
        type: 'admin_login_success',
        severity: 'info',
        details: {
          userId: data.user.id,
          email: formData.email,
          ip: ip.ip,
          timestamp: new Date().toISOString(),
        },
      });

      router.push('/admin/dashboard');
    } catch (error) {
      setGeneralError('An unexpected error occurred');
      console.error('Admin sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 backdrop-blur">
            <Shield className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Access</h1>
          <p className="mt-2 text-sm text-slate-400">
            Restricted area - All access attempts are logged
          </p>
        </div>

        <Card className="border-slate-700 bg-slate-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Sign In</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your admin credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {generalError && (
                <Alert variant="destructive" className="border-red-900 bg-red-950/50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{generalError}</AlertDescription>
                </Alert>
              )}

              {attemptCount > 2 && attemptCount < 5 && (
                <Alert className="border-yellow-900 bg-yellow-950/50">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <AlertDescription className="text-yellow-200">
                    Warning: {5 - attemptCount} attempts remaining
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">
                  Admin Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500"
                  placeholder="admin@voosting.app"
                  disabled={isLoading || attemptCount >= 5}
                />
                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500"
                  placeholder="••••••••"
                  disabled={isLoading || attemptCount >= 5}
                />
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={isLoading || attemptCount >= 5}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 rounded-lg border border-slate-700 bg-slate-800/30 p-3">
              <p className="text-xs text-slate-400">
                <strong className="text-slate-300">Security Notice:</strong> This is a restricted
                area. All login attempts are logged with IP address and timestamp. Unauthorized
                access attempts will be investigated.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
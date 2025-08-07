'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useSecurityStore } from '@/stores/securityStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  Users,
  Activity,
  AlertTriangle,
  Database,
  Settings,
  LogOut,
  RefreshCw,
  Lock,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Server,
  Cpu,
} from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalCampaigns: number;
  systemHealth: 'healthy' | 'degraded' | 'critical';
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  apiLatency: number;
}

interface SecurityLog {
  id: string;
  event_type: string;
  severity: 'info' | 'warning' | 'critical';
  user_id?: string;
  details: any;
  created_at: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const { user, signOut } = useAuthStore();
  const { logPageAccess, logSecurityEvent, checkSessionTimeout } = useSecurityStore();
  
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Security checks and logging
  useEffect(() => {
    if (user) {
      // Log admin dashboard access
      logPageAccess('/admin/dashboard', {
        userId: user.id,
        role: 'admin',
        timestamp: new Date().toISOString(),
      });

      logSecurityEvent({
        type: 'admin_dashboard_accessed',
        severity: 'info',
        details: {
          userId: user.id,
          timestamp: new Date().toISOString(),
        },
      });

      // Check session timeout
      const isTimeout = checkSessionTimeout();
      if (isTimeout) {
        handleSignOut();
      }
    }
  }, [user, logPageAccess, logSecurityEvent, checkSessionTimeout]);

  // Load system stats and logs
  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load system stats
      const [
        { count: totalUsers },
        { count: activeUsers },
        { count: suspendedUsers },
        { count: totalCampaigns },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'suspended'),
        supabase.from('campaigns').select('*', { count: 'exact', head: true }),
      ]);

      setSystemStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        suspendedUsers: suspendedUsers || 0,
        totalCampaigns: totalCampaigns || 0,
        systemHealth: 'healthy',
        cpuUsage: Math.random() * 30 + 20, // Mock data
        memoryUsage: Math.random() * 40 + 30, // Mock data
        diskUsage: Math.random() * 50 + 20, // Mock data
        apiLatency: Math.random() * 100 + 50, // Mock data
      });

      // Load recent security logs
      const { data: logs } = await supabase
        .from('security_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setSecurityLogs(logs || []);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    logSecurityEvent({
      type: 'admin_logout',
      severity: 'info',
      details: {
        userId: user?.id,
        timestamp: new Date().toISOString(),
      },
    });
    
    await signOut();
    router.push('/admin-auth/sign-in');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      default: return 'text-blue-500';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'critical': return 'bg-red-500';
      case 'degraded': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Admin Header */}
      <header className="border-b border-slate-800 bg-slate-950">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Shield className="h-6 w-6 text-red-500" />
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <Badge variant="outline" className="border-red-500 text-red-500">
              ADMIN ACCESS
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadDashboardData}
              className="text-slate-400 hover:text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <span className="text-xs text-slate-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-6">
        {/* System Health */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-slate-800 bg-slate-950/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">System Health</CardTitle>
              <Activity className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${getHealthColor(systemStats?.systemHealth || 'healthy')}`} />
                <span className="text-2xl font-bold capitalize text-white">
                  {systemStats?.systemHealth || 'Loading'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">All systems operational</p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-950/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Total Users</CardTitle>
              <Users className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatNumber(systemStats?.totalUsers || 0)}
              </div>
              <div className="flex items-center text-xs text-slate-500 mt-1">
                <span className="text-green-500">{systemStats?.activeUsers || 0} active</span>
                <span className="mx-2">•</span>
                <span className="text-red-500">{systemStats?.suspendedUsers || 0} suspended</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-950/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">API Latency</CardTitle>
              <Server className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {systemStats?.apiLatency?.toFixed(0) || 0}ms
              </div>
              <p className="text-xs text-slate-500 mt-1">Average response time</p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-950/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Total Campaigns</CardTitle>
              <Database className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatNumber(systemStats?.totalCampaigns || 0)}
              </div>
              <p className="text-xs text-slate-500 mt-1">Across all users</p>
            </CardContent>
          </Card>
        </div>

        {/* System Resources */}
        <Card className="border-slate-800 bg-slate-950/50">
          <CardHeader>
            <CardTitle className="text-white">System Resources</CardTitle>
            <CardDescription className="text-slate-400">
              Real-time resource utilization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">CPU Usage</span>
                <span className="text-white">{systemStats?.cpuUsage?.toFixed(1) || 0}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${systemStats?.cpuUsage || 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">Memory Usage</span>
                <span className="text-white">{systemStats?.memoryUsage?.toFixed(1) || 0}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{ width: `${systemStats?.memoryUsage || 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">Disk Usage</span>
                <span className="text-white">{systemStats?.diskUsage?.toFixed(1) || 0}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-purple-500 transition-all"
                  style={{ width: `${systemStats?.diskUsage || 0}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Logs */}
        <Card className="border-slate-800 bg-slate-950/50">
          <CardHeader>
            <CardTitle className="text-white">Security Logs</CardTitle>
            <CardDescription className="text-slate-400">
              Recent security events and access attempts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList className="bg-slate-800">
                <TabsTrigger value="all">All Events</TabsTrigger>
                <TabsTrigger value="critical">Critical</TabsTrigger>
                <TabsTrigger value="warning">Warnings</TabsTrigger>
                <TabsTrigger value="info">Info</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-2">
                {securityLogs.map((log) => (
                  <div key={log.id} className="flex items-start justify-between rounded-lg border border-slate-800 p-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`h-4 w-4 mt-0.5 ${getSeverityColor(log.severity)}`} />
                      <div>
                        <p className="text-sm font-medium text-white">{log.event_type}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={log.severity === 'critical' ? 'destructive' : log.severity === 'warning' ? 'outline' : 'secondary'}
                      className="text-xs"
                    >
                      {log.severity}
                    </Badge>
                  </div>
                )) || (
                  <div className="text-center text-slate-500 py-4">No security logs found</div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Button variant="outline" className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-white">
            <Users className="mr-2 h-4 w-4" />
            Manage Users
          </Button>
          <Button variant="outline" className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-white">
            <Settings className="mr-2 h-4 w-4" />
            System Settings
          </Button>
          <Button variant="outline" className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-white">
            <Database className="mr-2 h-4 w-4" />
            Database Management
          </Button>
        </div>
      </div>
    </div>
  );
}
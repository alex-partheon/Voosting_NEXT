'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCampaigns } from '@/hooks/use-campaigns';
import { useEarnings } from '@/hooks/use-earnings';
import { useDashboardStore } from '@/stores/dashboardStore';
import {
  DollarSign,
  TrendingUp,
  Users,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Eye,
  MousePointerClick,
  ChevronRight,
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import Link from 'next/link';

interface CreatorViewProps {
  profile: any;
}

export function CreatorView({ profile }: CreatorViewProps) {
  const { stats } = useDashboardStore();
  const { data: campaigns, isLoading: campaignsLoading } = useCampaigns();
  const { data: earnings, isLoading: earningsLoading } = useEarnings();

  // Calculate stats
  const totalEarnings = earnings?.total || 0;
  const monthlyEarnings = earnings?.monthly || 0;
  const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0;
  const completedCampaigns = campaigns?.filter(c => c.status === 'completed').length || 0;
  
  const earningsGrowth = useMemo(() => {
    if (!earnings?.lastMonth || earnings.lastMonth === 0) return 100;
    return ((monthlyEarnings - earnings.lastMonth) / earnings.lastMonth) * 100;
  }, [monthlyEarnings, earnings?.lastMonth]);

  const conversionRate = stats?.conversionRate || 3.2;
  const totalViews = stats?.totalViews || 0;
  const totalClicks = stats?.totalClicks || 0;

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl">
            Welcome back, {profile.display_name || profile.email.split('@')[0]}!
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your creator performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/campaigns/new">
              Create Campaign
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/pages">
              Edit Page
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime earnings from campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlyEarnings)}</div>
            <div className="flex items-center text-xs">
              {earningsGrowth > 0 ? (
                <>
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">+{earningsGrowth.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                  <span className="text-red-500">{earningsGrowth.toFixed(1)}%</span>
                </>
              )}
              <span className="ml-1 text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {completedCampaigns} completed this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Average across all campaigns
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
            <CardDescription>Your top performing campaigns this month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {campaignsLoading ? (
              <div className="text-center text-muted-foreground">Loading campaigns...</div>
            ) : campaigns?.slice(0, 3).map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">{campaign.title}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {formatNumber(campaign.views || 0)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MousePointerClick className="h-3 w-3" />
                      {formatNumber(campaign.clicks || 0)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(campaign.earnings || 0)}</p>
                  <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                    {campaign.status}
                  </Badge>
                </div>
              </div>
            )) || (
              <div className="text-center text-muted-foreground">No campaigns yet</div>
            )}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/campaigns">
                View All Campaigns
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Referral Program</CardTitle>
            <CardDescription>Earn more by inviting other creators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Level 1 Referrals</span>
                <span className="font-medium">{profile.referral_stats?.l1_count || 0}</span>
              </div>
              <Progress value={Math.min((profile.referral_stats?.l1_count || 0) * 10, 100)} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Level 2 Referrals</span>
                <span className="font-medium">{profile.referral_stats?.l2_count || 0}</span>
              </div>
              <Progress value={Math.min((profile.referral_stats?.l2_count || 0) * 20, 100)} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Level 3 Referrals</span>
                <span className="font-medium">{profile.referral_stats?.l3_count || 0}</span>
              </div>
              <Progress value={Math.min((profile.referral_stats?.l3_count || 0) * 33, 100)} />
            </div>
            <div className="rounded-lg bg-primary/10 p-3">
              <p className="text-sm font-medium">Your Referral Code</p>
              <code className="text-lg font-bold text-primary">
                {profile.referral_code || 'GENERATING...'}
              </code>
            </div>
            <Button className="w-full" asChild>
              <Link href="/dashboard/referrals">
                Manage Referrals
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest campaign updates and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentActivity?.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                </div>
                <time className="text-xs text-muted-foreground">
                  {activity.time}
                </time>
              </div>
            )) || (
              <div className="text-center text-muted-foreground">No recent activity</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
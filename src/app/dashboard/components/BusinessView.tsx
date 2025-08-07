'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCampaigns } from '@/hooks/use-campaigns';
import { useBusinessStats } from '@/hooks/use-business-stats';
import { useDashboardStore } from '@/stores/dashboardStore';
import {
  BarChart3,
  Users,
  Target,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  DollarSign,
  ChevronRight,
  Plus,
  Filter,
  Download,
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import Link from 'next/link';

interface BusinessViewProps {
  profile: any;
}

export function BusinessView({ profile }: BusinessViewProps) {
  const { stats } = useDashboardStore();
  const { data: campaigns, isLoading: campaignsLoading } = useCampaigns();
  const { data: businessStats, isLoading: statsLoading } = useBusinessStats();

  // Calculate metrics
  const totalSpend = businessStats?.totalSpend || 0;
  const monthlySpend = businessStats?.monthlySpend || 0;
  const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0;
  const totalCreators = businessStats?.totalCreators || 0;
  
  const roi = useMemo(() => {
    if (!businessStats?.revenue || totalSpend === 0) return 0;
    return ((businessStats.revenue - totalSpend) / totalSpend) * 100;
  }, [businessStats?.revenue, totalSpend]);

  const spendGrowth = useMemo(() => {
    if (!businessStats?.lastMonthSpend || businessStats.lastMonthSpend === 0) return 100;
    return ((monthlySpend - businessStats.lastMonthSpend) / businessStats.lastMonthSpend) * 100;
  }, [monthlySpend, businessStats?.lastMonthSpend]);

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl">
            Business Dashboard
          </h1>
          <p className="text-muted-foreground">
            {profile.company_name || profile.email.split('@')[0]} - Manage your marketing campaigns
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/campaigns/new">
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/creators">
              <Users className="mr-2 h-4 w-4" />
              Find Creators
            </Link>
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpend)}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime campaign investment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlySpend)}</div>
            <div className="flex items-center text-xs">
              {spendGrowth > 0 ? (
                <>
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">+{spendGrowth.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                  <span className="text-red-500">{spendGrowth.toFixed(1)}%</span>
                </>
              )}
              <span className="ml-1 text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roi.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Return on investment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Creators</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCreators}</div>
            <p className="text-xs text-muted-foreground">
              Across {activeCampaigns} campaigns
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Campaign Overview</CardTitle>
              <CardDescription>Manage and track your marketing campaigns</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="space-y-4">
            <TabsList>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="space-y-4">
              {campaignsLoading ? (
                <div className="text-center text-muted-foreground">Loading campaigns...</div>
              ) : campaigns?.filter(c => c.status === 'active').slice(0, 5).map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{campaign.title}</p>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {campaign.creator_count || 0} creators • Started {campaign.created_at}
                    </p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>Budget Used</span>
                        <span>{formatCurrency(campaign.spent || 0)} / {formatCurrency(campaign.budget || 0)}</span>
                      </div>
                      <Progress value={(campaign.spent || 0) / (campaign.budget || 1) * 100} />
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm text-muted-foreground">Performance</p>
                    <p className="text-lg font-semibold">{campaign.conversion_rate || 0}% CVR</p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(campaign.impressions || 0)} impressions
                    </p>
                  </div>
                </div>
              )) || (
                <div className="text-center text-muted-foreground">No active campaigns</div>
              )}
              
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/campaigns">
                  View All Campaigns
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              <div className="text-center text-muted-foreground py-8">
                No pending campaigns
              </div>
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              <div className="text-center text-muted-foreground py-8">
                No completed campaigns yet
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Analytics and Creators */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Creators</CardTitle>
            <CardDescription>Creators with the best conversion rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {businessStats?.topCreators?.slice(0, 5).map((creator, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{creator.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {creator.followers} followers
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{creator.conversion_rate}% CVR</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(creator.revenue)} revenue
                    </p>
                  </div>
                </div>
              )) || (
                <div className="text-center text-muted-foreground">No creator data yet</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/campaigns/new">
                <Target className="mr-2 h-4 w-4" />
                Create New Campaign
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/creators">
                <Users className="mr-2 h-4 w-4" />
                Browse Creators
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/reports">
                <BarChart3 className="mr-2 h-4 w-4" />
                Generate Report
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/billing">
                <DollarSign className="mr-2 h-4 w-4" />
                Billing & Payments
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
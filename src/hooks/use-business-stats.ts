'use client';

import { useQuery } from '@tanstack/react-query';
import { createBrowserClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export interface BusinessStats {
  totalSpend: number;
  monthlySpend: number;
  lastMonthSpend: number;
  totalCreators: number;
  revenue: number;
  topCreators: Array<{
    id: string;
    name: string;
    followers: number;
    conversion_rate: number;
    revenue: number;
  }>;
}

export function useBusinessStats() {
  const supabase = createBrowserClient();
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['business-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get campaigns for this business
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('*')
        .eq('business_id', user.id);

      // Calculate total spend
      const totalSpend = campaigns?.reduce((sum, c) => sum + (c.spent || 0), 0) || 0;

      // Calculate monthly spend (current month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlySpend = campaigns?.filter(c => {
        const date = new Date(c.created_at);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }).reduce((sum, c) => sum + (c.spent || 0), 0) || 0;

      // Calculate last month spend
      const lastMonthDate = new Date();
      lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
      const lastMonthSpend = campaigns?.filter(c => {
        const date = new Date(c.created_at);
        return date.getMonth() === lastMonthDate.getMonth() && 
               date.getFullYear() === lastMonthDate.getFullYear();
      }).reduce((sum, c) => sum + (c.spent || 0), 0) || 0;

      // Get unique creators count
      const creatorIds = new Set(campaigns?.map(c => c.creator_id).filter(Boolean));
      const totalCreators = creatorIds.size;

      // Calculate revenue (mock data for now)
      const revenue = totalSpend * 2.5; // Mock 2.5x ROI

      // Mock top creators data
      const topCreators = [
        {
          id: '1',
          name: '김유튜버',
          followers: 250000,
          conversion_rate: 4.2,
          revenue: 1500000,
        },
        {
          id: '2',
          name: '이인스타',
          followers: 180000,
          conversion_rate: 3.8,
          revenue: 1200000,
        },
        {
          id: '3',
          name: '박틱톡',
          followers: 320000,
          conversion_rate: 3.5,
          revenue: 980000,
        },
        {
          id: '4',
          name: '최블로거',
          followers: 95000,
          conversion_rate: 5.1,
          revenue: 750000,
        },
        {
          id: '5',
          name: '정트위치',
          followers: 120000,
          conversion_rate: 3.2,
          revenue: 650000,
        },
      ];

      return {
        totalSpend,
        monthlySpend,
        lastMonthSpend,
        totalCreators,
        revenue,
        topCreators,
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // 1 minute
  });
}
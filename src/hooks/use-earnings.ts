'use client';

import { useQuery } from '@tanstack/react-query';
import { createBrowserClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export interface Earnings {
  total: number;
  monthly: number;
  lastMonth: number;
  pending: number;
  available: number;
  breakdown: {
    campaigns: number;
    referrals: {
      l1: number;
      l2: number;
      l3: number;
    };
  };
}

export function useEarnings() {
  const supabase = createBrowserClient();
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['earnings', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get earnings from database
      const { data: earningsData, error } = await supabase
        .from('earnings')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching earnings:', error);
        return null;
      }

      // Calculate totals
      const total = earningsData?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
      
      // Calculate monthly earnings (current month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthly = earningsData?.filter(e => {
        const date = new Date(e.created_at);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }).reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

      // Calculate last month earnings
      const lastMonthDate = new Date();
      lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
      const lastMonth = earningsData?.filter(e => {
        const date = new Date(e.created_at);
        return date.getMonth() === lastMonthDate.getMonth() && 
               date.getFullYear() === lastMonthDate.getFullYear();
      }).reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

      // Calculate pending and available
      const pending = earningsData?.filter(e => e.status === 'pending')
        .reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
      const available = earningsData?.filter(e => e.status === 'available')
        .reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

      // Calculate breakdown
      const campaigns = earningsData?.filter(e => e.type === 'campaign')
        .reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
      const l1 = earningsData?.filter(e => e.type === 'referral_l1')
        .reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
      const l2 = earningsData?.filter(e => e.type === 'referral_l2')
        .reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
      const l3 = earningsData?.filter(e => e.type === 'referral_l3')
        .reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

      return {
        total,
        monthly,
        lastMonth,
        pending,
        available,
        breakdown: {
          campaigns,
          referrals: { l1, l2, l3 }
        }
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // 1 minute
  });
}
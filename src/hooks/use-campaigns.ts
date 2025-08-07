'use client';

import { useQuery } from '@tanstack/react-query';
import { createBrowserClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export interface Campaign {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'pending' | 'completed' | 'cancelled';
  budget?: number;
  spent?: number;
  created_at: string;
  updated_at?: string;
  creator_count?: number;
  views?: number;
  clicks?: number;
  conversions?: number;
  conversion_rate?: number;
  earnings?: number;
  impressions?: number;
}

export function useCampaigns() {
  const supabase = createBrowserClient();
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['campaigns', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get user profile to determine role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile) return [];

      // Fetch campaigns based on role
      let query = supabase.from('campaigns').select('*');
      
      if (profile.role === 'creator') {
        // For creators, get campaigns they're participating in
        query = query.eq('creator_id', user.id);
      } else if (profile.role === 'business') {
        // For businesses, get their created campaigns
        query = query.eq('business_id', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching campaigns:', error);
        return [];
      }

      // Mock additional data for now
      return (data || []).map(campaign => ({
        ...campaign,
        creator_count: Math.floor(Math.random() * 20) + 1,
        views: Math.floor(Math.random() * 10000),
        clicks: Math.floor(Math.random() * 1000),
        conversions: Math.floor(Math.random() * 100),
        conversion_rate: Math.random() * 10,
        earnings: Math.random() * 50000,
        impressions: Math.floor(Math.random() * 50000),
      }));
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // 30 seconds
  });
}
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '12.2.12 (cd3cf9e)';
  };
  public: {
    Tables: {
      campaign_applications: {
        Row: {
          applied_at: string | null;
          campaign_id: string;
          creator_id: string;
          id: string;
          message: string | null;
          portfolio_links: Json | null;
          review_notes: string | null;
          reviewed_at: string | null;
          reviewer_id: string | null;
          status: Database['public']['Enums']['application_status'];
        };
        Insert: {
          applied_at?: string | null;
          campaign_id: string;
          creator_id: string;
          id?: string;
          message?: string | null;
          portfolio_links?: Json | null;
          review_notes?: string | null;
          reviewed_at?: string | null;
          reviewer_id?: string | null;
          status?: Database['public']['Enums']['application_status'];
        };
        Update: {
          applied_at?: string | null;
          campaign_id?: string;
          creator_id?: string;
          id?: string;
          message?: string | null;
          portfolio_links?: Json | null;
          review_notes?: string | null;
          reviewed_at?: string | null;
          reviewer_id?: string | null;
          status?: Database['public']['Enums']['application_status'];
        };
        Relationships: [
          {
            foreignKeyName: 'campaign_applications_campaign_id_fkey';
            columns: ['campaign_id'];
            isOneToOne: false;
            referencedRelation: 'campaigns';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'campaign_applications_creator_id_fkey';
            columns: ['creator_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'campaign_applications_creator_id_fkey';
            columns: ['creator_id'];
            isOneToOne: false;
            referencedRelation: 'user_referral_stats';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'campaign_applications_reviewer_id_fkey';
            columns: ['reviewer_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'campaign_applications_reviewer_id_fkey';
            columns: ['reviewer_id'];
            isOneToOne: false;
            referencedRelation: 'user_referral_stats';
            referencedColumns: ['id'];
          },
        ];
      };
      campaigns: {
        Row: {
          budget: number | null;
          business_id: string;
          commission_rate: number | null;
          created_at: string | null;
          description: string | null;
          end_date: string | null;
          id: string;
          requirements: Json | null;
          start_date: string | null;
          status: Database['public']['Enums']['campaign_status'];
          title: string;
          updated_at: string | null;
        };
        Insert: {
          budget?: number | null;
          business_id: string;
          commission_rate?: number | null;
          created_at?: string | null;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          requirements?: Json | null;
          start_date?: string | null;
          status?: Database['public']['Enums']['campaign_status'];
          title: string;
          updated_at?: string | null;
        };
        Update: {
          budget?: number | null;
          business_id?: string;
          commission_rate?: number | null;
          created_at?: string | null;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          requirements?: Json | null;
          start_date?: string | null;
          status?: Database['public']['Enums']['campaign_status'];
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'campaigns_business_id_fkey';
            columns: ['business_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'campaigns_business_id_fkey';
            columns: ['business_id'];
            isOneToOne: false;
            referencedRelation: 'user_referral_stats';
            referencedColumns: ['id'];
          },
        ];
      };
      payments: {
        Row: {
          amount: number;
          business_id: string;
          campaign_id: string;
          commission_amount: number;
          completed_at: string | null;
          created_at: string | null;
          creator_id: string;
          id: string;
          payment_method: string | null;
          status: Database['public']['Enums']['payment_status'];
          transaction_id: string | null;
        };
        Insert: {
          amount: number;
          business_id: string;
          campaign_id: string;
          commission_amount: number;
          completed_at?: string | null;
          created_at?: string | null;
          creator_id: string;
          id?: string;
          payment_method?: string | null;
          status?: Database['public']['Enums']['payment_status'];
          transaction_id?: string | null;
        };
        Update: {
          amount?: number;
          business_id?: string;
          campaign_id?: string;
          commission_amount?: number;
          completed_at?: string | null;
          created_at?: string | null;
          creator_id?: string;
          id?: string;
          payment_method?: string | null;
          status?: Database['public']['Enums']['payment_status'];
          transaction_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'payments_business_id_fkey';
            columns: ['business_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payments_business_id_fkey';
            columns: ['business_id'];
            isOneToOne: false;
            referencedRelation: 'user_referral_stats';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payments_campaign_id_fkey';
            columns: ['campaign_id'];
            isOneToOne: false;
            referencedRelation: 'campaigns';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payments_creator_id_fkey';
            columns: ['creator_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payments_creator_id_fkey';
            columns: ['creator_id'];
            isOneToOne: false;
            referencedRelation: 'user_referral_stats';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          business_registration: string | null;
          company_name: string | null;
          created_at: string | null;
          creator_category: string[] | null;
          email: string;
          engagement_rate: number | null;
          follower_count: number | null;
          full_name: string | null;
          id: string;
          phone: string | null;
          referral_code: string;
          referrer_l1_id: string | null;
          referrer_l2_id: string | null;
          referrer_l3_id: string | null;
          role: Database['public']['Enums']['user_role'];
          social_links: Json | null;
          updated_at: string | null;
          website: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          business_registration?: string | null;
          company_name?: string | null;
          created_at?: string | null;
          creator_category?: string[] | null;
          email: string;
          engagement_rate?: number | null;
          follower_count?: number | null;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          referral_code: string;
          referrer_l1_id?: string | null;
          referrer_l2_id?: string | null;
          referrer_l3_id?: string | null;
          role?: Database['public']['Enums']['user_role'];
          social_links?: Json | null;
          updated_at?: string | null;
          website?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          business_registration?: string | null;
          company_name?: string | null;
          created_at?: string | null;
          creator_category?: string[] | null;
          email?: string;
          engagement_rate?: number | null;
          follower_count?: number | null;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          referral_code?: string;
          referrer_l1_id?: string | null;
          referrer_l2_id?: string | null;
          referrer_l3_id?: string | null;
          role?: Database['public']['Enums']['user_role'];
          social_links?: Json | null;
          updated_at?: string | null;
          website?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_referrer_l1_id_fkey';
            columns: ['referrer_l1_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'profiles_referrer_l1_id_fkey';
            columns: ['referrer_l1_id'];
            isOneToOne: false;
            referencedRelation: 'user_referral_stats';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'profiles_referrer_l2_id_fkey';
            columns: ['referrer_l2_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'profiles_referrer_l2_id_fkey';
            columns: ['referrer_l2_id'];
            isOneToOne: false;
            referencedRelation: 'user_referral_stats';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'profiles_referrer_l3_id_fkey';
            columns: ['referrer_l3_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'profiles_referrer_l3_id_fkey';
            columns: ['referrer_l3_id'];
            isOneToOne: false;
            referencedRelation: 'user_referral_stats';
            referencedColumns: ['id'];
          },
        ];
      };
      referral_earnings: {
        Row: {
          amount: number;
          campaign_id: string | null;
          commission_rate: number;
          created_at: string | null;
          id: string;
          level: number;
          paid_at: string | null;
          payment_id: string | null;
          referred_id: string;
          referrer_id: string;
          status: string;
        };
        Insert: {
          amount: number;
          campaign_id?: string | null;
          commission_rate: number;
          created_at?: string | null;
          id?: string;
          level: number;
          paid_at?: string | null;
          payment_id?: string | null;
          referred_id: string;
          referrer_id: string;
          status?: string;
        };
        Update: {
          amount?: number;
          campaign_id?: string | null;
          commission_rate?: number;
          created_at?: string | null;
          id?: string;
          level?: number;
          paid_at?: string | null;
          payment_id?: string | null;
          referred_id?: string;
          referrer_id?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'referral_earnings_referred_id_fkey';
            columns: ['referred_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'referral_earnings_referred_id_fkey';
            columns: ['referred_id'];
            isOneToOne: false;
            referencedRelation: 'user_referral_stats';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'referral_earnings_referrer_id_fkey';
            columns: ['referrer_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'referral_earnings_referrer_id_fkey';
            columns: ['referrer_id'];
            isOneToOne: false;
            referencedRelation: 'user_referral_stats';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      user_referral_stats: {
        Row: {
          full_name: string | null;
          id: string | null;
          level1_referrals: number | null;
          level2_referrals: number | null;
          level3_referrals: number | null;
          paid_earnings: number | null;
          pending_earnings: number | null;
          referral_code: string | null;
          total_earnings: number | null;
          total_referrals: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      create_admin_profile: {
        Args: { p_user_id: string; p_email: string; p_full_name?: string };
        Returns: undefined;
      };
      create_profile_with_referral: {
        Args: {
          p_user_id: string;
          p_email: string;
          p_full_name?: string;
          p_role?: Database['public']['Enums']['user_role'];
          p_referral_code?: string;
        };
        Returns: string;
      };
      create_referral_earnings: {
        Args: {
          p_referred_id: string;
          p_amount: number;
          p_campaign_id?: string;
          p_payment_id?: string;
        };
        Returns: undefined;
      };
      generate_referral_code: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      application_status: 'pending' | 'approved' | 'rejected' | 'completed';
      campaign_status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
      payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
      user_role: 'creator' | 'business' | 'admin';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      application_status: ['pending', 'approved', 'rejected', 'completed'],
      campaign_status: ['draft', 'active', 'paused', 'completed', 'cancelled'],
      payment_status: ['pending', 'completed', 'failed', 'refunded'],
      user_role: ['creator', 'business', 'admin'],
    },
  },
} as const;

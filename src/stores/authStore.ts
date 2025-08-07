import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createBrowserClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// Type definitions based on database schema
type UserRole = Exclude<Database['public']['Enums']['user_role'], 'admin'>; // Exclude admin for security
type Profile = Database['public']['Tables']['profiles']['Row'];

// User type without admin-specific fields
export interface User {
  id: string;
  email: string;
  role: UserRole;
  profile?: Partial<Profile>;
  supabaseUser?: SupabaseUser; // Original Supabase user object
}

// Auth state interface
interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastActivity: number | null;
  
  // Actions
  setUser: (user: User | null) => void;
  updateProfile: (profile: Partial<Profile>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateActivity: () => void;
  clearAuth: () => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  
  // Computed
  isCreator: () => boolean;
  isBusiness: () => boolean;
}

// Regular user session timeout (7 days in milliseconds)
const REGULAR_SESSION_TIMEOUT = 7 * 24 * 60 * 60 * 1000;

// Create auth store with persistence (excluding sensitive data)
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      lastActivity: null,
      
      // Set user and authentication state
      setUser: (user) => {
        // Security check: Prevent admin role from being set in regular auth store
        if (user && (user.role as string) === 'admin') {
          console.error('Admin users should use admin-specific auth store');
          return;
        }
        
        set({
          user,
          isAuthenticated: !!user,
          error: null,
          lastActivity: user ? Date.now() : null,
        });
      },
      
      // Update user profile
      updateProfile: (profile) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              profile: {
                ...currentUser.profile,
                ...profile,
              },
            },
            lastActivity: Date.now(),
          });
        }
      },
      
      // Set loading state
      setLoading: (loading) => set({ isLoading: loading }),
      
      // Set error state
      setError: (error) => set({ error }),
      
      // Update last activity timestamp
      updateActivity: () => {
        const user = get().user;
        if (user) {
          set({ lastActivity: Date.now() });
        }
      },
      
      // Clear authentication state
      clearAuth: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
          lastActivity: null,
        });
      },
      
      // Check if user is creator
      isCreator: () => {
        const user = get().user;
        return user?.role === 'creator';
      },
      
      // Check if user is business
      isBusiness: () => {
        const user = get().user;
        return user?.role === 'business';
      },
      
      // Login with Supabase
      login: async (email: string, password: string) => {
        const { setLoading, setError, setUser } = get();
        setLoading(true);
        setError(null);
        
        try {
          const supabase = createBrowserClient();
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) throw error;
          
          if (data.user) {
            // Get user profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();
            
            setUser({
              id: data.user.id,
              email: data.user.email!,
              role: profile?.role || 'creator',
              profile: profile || undefined,
              supabaseUser: data.user,
            });
          }
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Login failed');
          throw error;
        } finally {
          setLoading(false);
        }
      },
      
      // Logout with Supabase
      logout: async () => {
        const { setLoading, setError, clearAuth } = get();
        setLoading(true);
        setError(null);
        
        try {
          const supabase = createBrowserClient();
          const { error } = await supabase.auth.signOut();
          
          if (error) throw error;
          
          clearAuth();
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Logout failed');
          throw error;
        } finally {
          setLoading(false);
        }
      },
      
      // Check authentication status
      checkAuth: async () => {
        const { setLoading, setError, setUser, clearAuth } = get();
        setLoading(true);
        setError(null);
        
        try {
          const supabase = createBrowserClient();
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            // Get user profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();
            
            setUser({
              id: user.id,
              email: user.email!,
              role: profile?.role || 'creator',
              profile: profile || undefined,
              supabaseUser: user,
            });
          } else {
            clearAuth();
          }
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Auth check failed');
          clearAuth();
        } finally {
          setLoading(false);
        }
      },
    }),
    {
      name: 'auth-storage',
      // Only persist non-sensitive data
      partialize: (state) => ({
        // Only store user ID and role for quick checks
        user: state.user ? { 
          id: state.user.id, 
          email: state.user.email,
          role: state.user.role 
        } : null,
        lastActivity: state.lastActivity,
      }),
      // Check session timeout on rehydration
      onRehydrateStorage: () => (state) => {
        if (state && state.lastActivity) {
          const timeSinceActivity = Date.now() - state.lastActivity;
          
          // Clear session if timeout exceeded
          if (timeSinceActivity > REGULAR_SESSION_TIMEOUT) {
            state.clearAuth();
          }
        }
      },
    }
  )
);

// Helper function to check if session is expired
export const isSessionExpired = (): boolean => {
  const { lastActivity } = useAuthStore.getState();
  
  if (!lastActivity) return true;
  
  const timeSinceActivity = Date.now() - lastActivity;
  return timeSinceActivity > REGULAR_SESSION_TIMEOUT;
};

// Helper function to refresh user data from backend
export const refreshUserData = async (): Promise<void> => {
  const { checkAuth } = useAuthStore.getState();
  await checkAuth();
};

// Initialize auth listener
if (typeof window !== 'undefined') {
  const supabase = createBrowserClient();
  
  // Listen for auth state changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    const { setUser, clearAuth } = useAuthStore.getState();
    
    if (event === 'SIGNED_IN' && session?.user) {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      setUser({
        id: session.user.id,
        email: session.user.email!,
        role: profile?.role || 'creator',
        profile: profile || undefined,
        supabaseUser: session.user,
      });
    } else if (event === 'SIGNED_OUT') {
      clearAuth();
    }
  });
}
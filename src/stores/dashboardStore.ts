import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Dashboard view types
export type DashboardView = 
  | 'overview'
  | 'campaigns'
  | 'earnings'
  | 'creators'
  | 'analytics'
  | 'settings'
  | 'profile'
  | 'referrals'
  | 'payments';

// Sidebar state
export interface SidebarState {
  isOpen: boolean;
  isMobile: boolean;
  isPinned: boolean;
}

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  timestamp: number;
  read: boolean;
}

// Dashboard filters
export interface DashboardFilters {
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  status?: string[];
  category?: string[];
  search?: string;
}

// Dashboard UI state interface
interface DashboardState {
  // View state
  currentView: DashboardView;
  previousView: DashboardView | null;
  viewHistory: DashboardView[];
  
  // Sidebar state
  sidebar: SidebarState;
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  
  // Filters and preferences
  filters: DashboardFilters;
  viewPreferences: Record<DashboardView, any>;
  
  // UI state
  isFullscreen: boolean;
  theme: 'light' | 'dark' | 'system';
  locale: 'ko' | 'en';
  
  // Actions
  setView: (view: DashboardView) => void;
  goBack: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setSidebarPinned: (isPinned: boolean) => void;
  setMobileView: (isMobile: boolean) => void;
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Filter actions
  setFilters: (filters: Partial<DashboardFilters>) => void;
  resetFilters: () => void;
  setViewPreference: (view: DashboardView, preferences: any) => void;
  
  // UI actions
  toggleFullscreen: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLocale: (locale: 'ko' | 'en') => void;
  resetDashboard: () => void;
  
  // Dashboard initialization
  initializeDashboard: (role: 'creator' | 'business') => void;
}

// Maximum notifications to keep in memory
const MAX_NOTIFICATIONS = 50;

// Maximum view history to maintain
const MAX_VIEW_HISTORY = 10;

// Create dashboard store with partial persistence
export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentView: 'overview',
      previousView: null,
      viewHistory: ['overview'],
      
      sidebar: {
        isOpen: true,
        isMobile: false,
        isPinned: true,
      },
      
      notifications: [],
      unreadCount: 0,
      
      filters: {
        dateRange: {
          from: null,
          to: null,
        },
      },
      
      viewPreferences: {},
      isFullscreen: false,
      theme: 'system',
      locale: 'ko',
      
      // View navigation
      setView: (view) => {
        const current = get().currentView;
        const history = [...get().viewHistory];
        
        // Add to history if different from current
        if (current !== view) {
          history.push(view);
          
          // Limit history size
          if (history.length > MAX_VIEW_HISTORY) {
            history.shift();
          }
          
          set({
            currentView: view,
            previousView: current,
            viewHistory: history,
          });
        }
      },
      
      // Navigate back
      goBack: () => {
        const history = [...get().viewHistory];
        
        if (history.length > 1) {
          history.pop(); // Remove current view
          const previous = history[history.length - 1];
          
          set({
            currentView: previous,
            previousView: get().currentView,
            viewHistory: history,
          });
        }
      },
      
      // Sidebar controls
      toggleSidebar: () => {
        set((state) => ({
          sidebar: {
            ...state.sidebar,
            isOpen: !state.sidebar.isOpen,
          },
        }));
      },
      
      setSidebarOpen: (isOpen) => {
        set((state) => ({
          sidebar: {
            ...state.sidebar,
            isOpen,
          },
        }));
      },
      
      setSidebarPinned: (isPinned) => {
        set((state) => ({
          sidebar: {
            ...state.sidebar,
            isPinned,
          },
        }));
      },
      
      setMobileView: (isMobile) => {
        set((state) => ({
          sidebar: {
            ...state.sidebar,
            isMobile,
            isOpen: isMobile ? false : state.sidebar.isOpen,
          },
        }));
      },
      
      // Notification management
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif-${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
          read: false,
        };
        
        set((state) => {
          const notifications = [newNotification, ...state.notifications];
          
          // Limit notifications
          if (notifications.length > MAX_NOTIFICATIONS) {
            notifications.pop();
          }
          
          return {
            notifications,
            unreadCount: state.unreadCount + 1,
          };
        });
      },
      
      markNotificationRead: (id) => {
        set((state) => {
          const notifications = state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          );
          
          const unreadCount = notifications.filter((n) => !n.read).length;
          
          return { notifications, unreadCount };
        });
      },
      
      markAllNotificationsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },
      
      removeNotification: (id) => {
        set((state) => {
          const notifications = state.notifications.filter((n) => n.id !== id);
          const unreadCount = notifications.filter((n) => !n.read).length;
          
          return { notifications, unreadCount };
        });
      },
      
      clearNotifications: () => {
        set({ notifications: [], unreadCount: 0 });
      },
      
      // Filter management
      setFilters: (filters) => {
        set((state) => ({
          filters: {
            ...state.filters,
            ...filters,
          },
        }));
      },
      
      resetFilters: () => {
        set({
          filters: {
            dateRange: {
              from: null,
              to: null,
            },
          },
        });
      },
      
      setViewPreference: (view, preferences) => {
        set((state) => ({
          viewPreferences: {
            ...state.viewPreferences,
            [view]: preferences,
          },
        }));
      },
      
      // UI controls
      toggleFullscreen: () => {
        set((state) => ({ isFullscreen: !state.isFullscreen }));
      },
      
      setTheme: (theme) => {
        set({ theme });
      },
      
      setLocale: (locale) => {
        set({ locale });
      },
      
      // Reset dashboard to initial state
      resetDashboard: () => {
        set({
          currentView: 'overview',
          previousView: null,
          viewHistory: ['overview'],
          sidebar: {
            isOpen: true,
            isMobile: false,
            isPinned: true,
          },
          filters: {
            dateRange: {
              from: null,
              to: null,
            },
          },
          isFullscreen: false,
        });
      },
      
      // Initialize dashboard for specific role
      initializeDashboard: (role: 'creator' | 'business') => {
        const availableViews = getRoleViews(role);
        const defaultView = availableViews[0] || 'overview';
        
        set({
          currentView: defaultView,
          previousView: null,
          viewHistory: [defaultView],
          sidebar: {
            isOpen: true,
            isMobile: false,
            isPinned: true,
          },
          notifications: [],
          unreadCount: 0,
          filters: {
            dateRange: {
              from: null,
              to: null,
            },
          },
          isFullscreen: false,
        });
        
        // Add welcome notification
        get().addNotification({
          type: 'info',
          title: '환영합니다!',
          message: role === 'creator' 
            ? '크리에이터 대시보드에 오신 것을 환영합니다.' 
            : '비즈니스 대시보드에 오신 것을 환영합니다.',
        });
      },
    }),
    {
      name: 'dashboard-storage',
      // Only persist UI preferences, not transient state
      partialize: (state) => ({
        theme: state.theme,
        locale: state.locale,
        sidebar: {
          isPinned: state.sidebar.isPinned,
        },
        viewPreferences: state.viewPreferences,
      }),
    }
  )
);

// Helper to get role-specific views
export const getRoleViews = (role: 'creator' | 'business'): DashboardView[] => {
  if (role === 'creator') {
    return ['overview', 'campaigns', 'earnings', 'referrals', 'profile', 'settings'];
  }
  
  if (role === 'business') {
    return ['overview', 'campaigns', 'creators', 'analytics', 'payments', 'settings'];
  }
  
  return ['overview', 'settings'];
};

// Helper to check if view is available for role
export const isViewAvailable = (view: DashboardView, role: 'creator' | 'business'): boolean => {
  const availableViews = getRoleViews(role);
  return availableViews.includes(view);
};
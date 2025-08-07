/**
 * Zustand Store Exports
 * 
 * This file consolidates all store exports and provides initialization utilities.
 * 
 * Security Notes:
 * - Admin authentication is handled separately in securityStore
 * - No admin data is persisted to localStorage
 * - Session timeouts: Admin = 30 min, Regular users = 7 days
 * - All stores implement proper cleanup methods
 */

// Export individual stores
export { useAuthStore, isSessionExpired, refreshUserData } from './authStore';
export type { User } from './authStore';

export { 
  useDashboardStore, 
  getRoleViews, 
  isViewAvailable 
} from './dashboardStore';
export type { 
  DashboardView, 
  SidebarState, 
  Notification, 
  DashboardFilters 
} from './dashboardStore';

export { 
  useSecurityStore,
  isAdminSession,
  hasAdminPermission,
  getSessionTimeRemaining,
  getSecurityStatus
} from './securityStore';
export type { 
  AdminUser, 
  SecurityEvent, 
  SecurityEventType, 
  SessionState 
} from './securityStore';

// Store initialization utilities
import { useAuthStore } from './authStore';
import { useDashboardStore } from './dashboardStore';
import { useSecurityStore } from './securityStore';

/**
 * Initialize all stores with default values
 * Called on app initialization
 */
export const initializeStores = () => {
  // Check for expired sessions on initialization
  const authStore = useAuthStore.getState();
  const securityStore = useSecurityStore.getState();
  
  // Check regular user session
  if (authStore.user && isSessionExpired()) {
    console.log('Regular user session expired, clearing auth');
    authStore.clearAuth();
  }
  
  // Check admin session (admin sessions are never persisted, so this is mainly for runtime checks)
  if (securityStore.adminUser && securityStore.checkSessionExpiry()) {
    console.log('Admin session expired, clearing admin auth');
    securityStore.clearAdminSession();
  }
  
  // Initialize dashboard based on viewport
  if (typeof window !== 'undefined') {
    const dashboardStore = useDashboardStore.getState();
    const isMobile = window.innerWidth < 768;
    dashboardStore.setMobileView(isMobile);
    
    // Listen for viewport changes
    window.addEventListener('resize', () => {
      const isMobileView = window.innerWidth < 768;
      dashboardStore.setMobileView(isMobileView);
    });
  }
};

/**
 * Reset all stores to initial state
 * Used for logout or critical errors
 */
export const resetAllStores = () => {
  const authStore = useAuthStore.getState();
  const dashboardStore = useDashboardStore.getState();
  const securityStore = useSecurityStore.getState();
  
  // Clear all authentication
  authStore.clearAuth();
  securityStore.clearAdminSession();
  
  // Reset dashboard to defaults
  dashboardStore.resetDashboard();
  
  // Clear security events for privacy
  securityStore.clearSecurityEvents();
  
  console.log('All stores have been reset');
};

/**
 * Get combined auth status
 * Returns the current authentication state across all stores
 */
export const getAuthStatus = () => {
  const authStore = useAuthStore.getState();
  const securityStore = useSecurityStore.getState();
  
  return {
    isAuthenticated: authStore.isAuthenticated || securityStore.isAdminAuthenticated,
    isAdmin: securityStore.isAdminAuthenticated,
    isCreator: authStore.isCreator(),
    isBusiness: authStore.isBusiness(),
    user: authStore.user,
    adminUser: securityStore.adminUser,
    sessionActive: securityStore.session.isActive,
  };
};

/**
 * Handle user login
 * Sets up appropriate stores based on user role
 */
export const handleUserLogin = async (
  userId: string,
  email: string,
  role: 'creator' | 'business' | 'admin',
  profile?: any,
  ipAddress?: string,
  userAgent?: string
) => {
  const authStore = useAuthStore.getState();
  const securityStore = useSecurityStore.getState();
  const dashboardStore = useDashboardStore.getState();
  
  // Clear any existing sessions first
  resetAllStores();
  
  if (role === 'admin') {
    // Handle admin login through security store
    securityStore.setAdminUser({
      id: userId,
      email,
      role: 'admin',
      permissions: profile?.permissions || [],
      lastLogin: Date.now(),
      sessionStarted: Date.now(),
    });
    
    // Set dashboard to admin view
    dashboardStore.setView('overview');
  } else {
    // Handle regular user login
    authStore.setUser({
      id: userId,
      email,
      role,
      profile,
    });
    
    // Start regular session
    securityStore.startSession(ipAddress, userAgent);
    
    // Set appropriate dashboard view
    dashboardStore.setView('overview');
  }
  
  // Log successful login
  securityStore.recordLoginAttempt(true, userId);
};

/**
 * Handle user logout
 * Cleans up all stores appropriately
 */
export const handleUserLogout = () => {
  const securityStore = useSecurityStore.getState();
  const authStore = useAuthStore.getState();
  
  // Log logout event before clearing
  const userId = authStore.user?.id || securityStore.adminUser?.id;
  if (userId) {
    securityStore.logSecurityEvent({
      type: 'logout',
      userId,
    });
  }
  
  // Reset all stores
  resetAllStores();
};

/**
 * Monitor session health
 * Returns true if session is healthy, false if action needed
 */
export const isSessionHealthy = (): boolean => {
  const authStore = useAuthStore.getState();
  const securityStore = useSecurityStore.getState();
  
  // Check if any session exists
  if (!authStore.isAuthenticated && !securityStore.isAdminAuthenticated) {
    return false;
  }
  
  // Check session expiry
  if (securityStore.checkSessionExpiry()) {
    return false;
  }
  
  // Check if regular session expired
  if (authStore.isAuthenticated && isSessionExpired()) {
    return false;
  }
  
  // Check if account is locked
  if (securityStore.isLocked) {
    return false;
  }
  
  // Check idle timeout for admin
  if (securityStore.adminUser && securityStore.isSessionIdle()) {
    return false;
  }
  
  return true;
};

// Auto-initialize stores when module loads (client-side only)
if (typeof window !== 'undefined') {
  initializeStores();
}
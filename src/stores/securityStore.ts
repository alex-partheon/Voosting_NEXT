import { create } from 'zustand';
import type { Database } from '@/types/database.types';

// Admin user type (separated for security)
export interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
  permissions: string[];
  lastLogin: number;
  sessionStarted: number;
}

// Security event types
export type SecurityEventType = 
  | 'login_attempt'
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'session_expired'
  | 'permission_denied'
  | 'suspicious_activity'
  | 'admin_action';

// Security event
export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  timestamp: number;
}

// Session state
export interface SessionState {
  isActive: boolean;
  startedAt: number | null;
  lastActivity: number | null;
  expiresAt: number | null;
  ipAddress?: string;
  userAgent?: string;
}

// Security state interface
interface SecurityState {
  // Admin state (never persisted to localStorage)
  adminUser: AdminUser | null;
  isAdminAuthenticated: boolean;
  
  // Session management
  session: SessionState;
  sessionTimeout: number; // in milliseconds
  
  // Security monitoring
  events: SecurityEvent[];
  failedLoginAttempts: number;
  isLocked: boolean;
  lockoutEndTime: number | null;
  
  // Activity tracking
  lastActivityTime: number | null;
  idleTime: number;
  
  // Actions
  setAdminUser: (user: AdminUser | null) => void;
  updateAdminActivity: () => void;
  clearAdminSession: () => void;
  
  // Session actions
  startSession: (ipAddress?: string, userAgent?: string) => void;
  endSession: () => void;
  updateSessionActivity: () => void;
  checkSessionExpiry: () => boolean;
  
  // Security event actions
  logSecurityEvent: (event: Omit<SecurityEvent, 'id' | 'timestamp'>) => void;
  clearSecurityEvents: () => void;
  logPageAccess: (path: string, metadata?: Record<string, any>) => void;
  
  // Login attempt tracking
  recordLoginAttempt: (success: boolean, userId?: string) => void;
  resetFailedAttempts: () => void;
  checkAccountLockout: () => boolean;
  
  // Idle time management
  updateIdleTime: () => void;
  resetIdleTime: () => void;
  isSessionIdle: () => boolean;
  
  // Session timeout check
  checkSessionTimeout: () => boolean;
}

// Security constants
const ADMIN_SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const REGULAR_SESSION_TIMEOUT = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes for admin
const MAX_SECURITY_EVENTS = 100;

// Create security store (NO persistence for security data)
export const useSecurityStore = create<SecurityState>((set, get) => ({
  // Initial state
  adminUser: null,
  isAdminAuthenticated: false,
  
  session: {
    isActive: false,
    startedAt: null,
    lastActivity: null,
    expiresAt: null,
  },
  
  sessionTimeout: REGULAR_SESSION_TIMEOUT,
  events: [],
  failedLoginAttempts: 0,
  isLocked: false,
  lockoutEndTime: null,
  lastActivityTime: null,
  idleTime: 0,
  
  // Admin user management (CRITICAL: Never persist admin data)
  setAdminUser: (user) => {
    if (user) {
      const now = Date.now();
      const expiresAt = now + ADMIN_SESSION_TIMEOUT;
      
      set({
        adminUser: {
          ...user,
          sessionStarted: now,
        },
        isAdminAuthenticated: true,
        sessionTimeout: ADMIN_SESSION_TIMEOUT,
        session: {
          isActive: true,
          startedAt: now,
          lastActivity: now,
          expiresAt,
        },
        lastActivityTime: now,
        failedLoginAttempts: 0,
        isLocked: false,
        lockoutEndTime: null,
      });
      
      // Log admin login
      get().logSecurityEvent({
        type: 'login_success',
        userId: user.id,
        details: { role: 'admin' },
      });
    } else {
      get().clearAdminSession();
    }
  },
  
  // Update admin activity
  updateAdminActivity: () => {
    const adminUser = get().adminUser;
    if (adminUser) {
      const now = Date.now();
      const expiresAt = now + ADMIN_SESSION_TIMEOUT;
      
      set((state) => ({
        lastActivityTime: now,
        idleTime: 0,
        session: {
          ...state.session,
          lastActivity: now,
          expiresAt,
        },
      }));
    }
  },
  
  // Clear admin session (CRITICAL: Complete cleanup)
  clearAdminSession: () => {
    const adminUser = get().adminUser;
    
    if (adminUser) {
      // Log logout event before clearing
      get().logSecurityEvent({
        type: 'logout',
        userId: adminUser.id,
        details: { role: 'admin' },
      });
    }
    
    set({
      adminUser: null,
      isAdminAuthenticated: false,
      session: {
        isActive: false,
        startedAt: null,
        lastActivity: null,
        expiresAt: null,
      },
      sessionTimeout: REGULAR_SESSION_TIMEOUT,
      lastActivityTime: null,
      idleTime: 0,
    });
  },
  
  // Session management
  startSession: (ipAddress, userAgent) => {
    const now = Date.now();
    const timeout = get().adminUser ? ADMIN_SESSION_TIMEOUT : REGULAR_SESSION_TIMEOUT;
    
    set({
      session: {
        isActive: true,
        startedAt: now,
        lastActivity: now,
        expiresAt: now + timeout,
        ipAddress,
        userAgent,
      },
      lastActivityTime: now,
      idleTime: 0,
    });
  },
  
  endSession: () => {
    set({
      session: {
        isActive: false,
        startedAt: null,
        lastActivity: null,
        expiresAt: null,
      },
      lastActivityTime: null,
      idleTime: 0,
    });
    
    // Clear admin if present
    if (get().adminUser) {
      get().clearAdminSession();
    }
  },
  
  updateSessionActivity: () => {
    const session = get().session;
    if (session.isActive) {
      const now = Date.now();
      const timeout = get().adminUser ? ADMIN_SESSION_TIMEOUT : REGULAR_SESSION_TIMEOUT;
      
      set({
        session: {
          ...session,
          lastActivity: now,
          expiresAt: now + timeout,
        },
        lastActivityTime: now,
        idleTime: 0,
      });
    }
  },
  
  checkSessionExpiry: () => {
    const { session, adminUser } = get();
    
    if (!session.isActive || !session.expiresAt) {
      return true;
    }
    
    const now = Date.now();
    const isExpired = now > session.expiresAt;
    
    if (isExpired) {
      get().logSecurityEvent({
        type: 'session_expired',
        userId: adminUser?.id,
        details: { 
          role: adminUser ? 'admin' : 'user',
          sessionDuration: session.startedAt ? now - session.startedAt : 0,
        },
      });
      
      get().endSession();
    }
    
    return isExpired;
  },
  
  // Security event logging
  logSecurityEvent: (event) => {
    const newEvent: SecurityEvent = {
      ...event,
      id: `sec-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    };
    
    set((state) => {
      let events = [newEvent, ...state.events];
      
      // Limit event history
      if (events.length > MAX_SECURITY_EVENTS) {
        events = events.slice(0, MAX_SECURITY_EVENTS);
      }
      
      return { events };
    });
    
    // For suspicious activity, trigger additional security measures
    if (event.type === 'suspicious_activity') {
      console.warn('Suspicious activity detected:', event);
      // Could trigger additional security measures here
    }
  },
  
  clearSecurityEvents: () => {
    set({ events: [] });
  },
  
  // Log page access event
  logPageAccess: (path, metadata) => {
    const { adminUser } = get();
    
    get().logSecurityEvent({
      type: 'admin_action',
      userId: adminUser?.id,
      details: {
        action: 'page_access',
        path,
        ...metadata,
      },
    });
  },
  
  // Login attempt tracking
  recordLoginAttempt: (success, userId) => {
    if (success) {
      set({
        failedLoginAttempts: 0,
        isLocked: false,
        lockoutEndTime: null,
      });
      
      get().logSecurityEvent({
        type: 'login_success',
        userId,
      });
    } else {
      const attempts = get().failedLoginAttempts + 1;
      const isLocked = attempts >= MAX_LOGIN_ATTEMPTS;
      
      set({
        failedLoginAttempts: attempts,
        isLocked,
        lockoutEndTime: isLocked ? Date.now() + LOCKOUT_DURATION : null,
      });
      
      get().logSecurityEvent({
        type: 'login_failure',
        userId,
        details: { 
          attempts,
          locked: isLocked,
        },
      });
      
      if (isLocked) {
        get().logSecurityEvent({
          type: 'suspicious_activity',
          userId,
          details: { 
            reason: 'account_locked',
            attempts,
          },
        });
      }
    }
  },
  
  resetFailedAttempts: () => {
    set({
      failedLoginAttempts: 0,
      isLocked: false,
      lockoutEndTime: null,
    });
  },
  
  checkAccountLockout: () => {
    const { isLocked, lockoutEndTime } = get();
    
    if (!isLocked) return false;
    
    if (lockoutEndTime && Date.now() > lockoutEndTime) {
      get().resetFailedAttempts();
      return false;
    }
    
    return true;
  },
  
  // Idle time management
  updateIdleTime: () => {
    const lastActivity = get().lastActivityTime;
    
    if (lastActivity) {
      const idleTime = Date.now() - lastActivity;
      set({ idleTime });
      
      // Check if session should timeout due to inactivity
      if (get().adminUser && idleTime > IDLE_TIMEOUT) {
        get().logSecurityEvent({
          type: 'session_expired',
          userId: get().adminUser?.id,
          details: { 
            reason: 'idle_timeout',
            idleTime,
          },
        });
        
        get().clearAdminSession();
      }
    }
  },
  
  resetIdleTime: () => {
    set({ 
      idleTime: 0,
      lastActivityTime: Date.now(),
    });
  },
  
  isSessionIdle: () => {
    const { idleTime, adminUser } = get();
    const timeout = adminUser ? IDLE_TIMEOUT : REGULAR_SESSION_TIMEOUT;
    
    return idleTime > timeout;
  },
  
  // Check if session has timed out
  checkSessionTimeout: () => {
    const { session, adminUser, idleTime } = get();
    
    // Check expiry time
    if (get().checkSessionExpiry()) {
      return true;
    }
    
    // Check idle timeout for admin
    if (adminUser && idleTime > IDLE_TIMEOUT) {
      get().logSecurityEvent({
        type: 'session_expired',
        userId: adminUser.id,
        details: {
          reason: 'idle_timeout',
          idleTime,
        },
      });
      
      get().clearAdminSession();
      return true;
    }
    
    // Check regular session timeout
    if (!adminUser && session.isActive && session.lastActivity) {
      const timeSinceActivity = Date.now() - session.lastActivity;
      if (timeSinceActivity > REGULAR_SESSION_TIMEOUT) {
        get().logSecurityEvent({
          type: 'session_expired',
          details: {
            reason: 'session_timeout',
            duration: timeSinceActivity,
          },
        });
        
        get().endSession();
        return true;
      }
    }
    
    return false;
  },
}));

// Security monitoring interval (check every minute)
if (typeof window !== 'undefined') {
  setInterval(() => {
    const store = useSecurityStore.getState();
    
    // Check session expiry
    store.checkSessionExpiry();
    
    // Update idle time
    store.updateIdleTime();
    
    // Check account lockout expiry
    if (store.isLocked) {
      store.checkAccountLockout();
    }
  }, 60 * 1000); // Every minute
  
  // Track user activity for idle detection
  const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
  
  activityEvents.forEach((event) => {
    window.addEventListener(event, () => {
      const store = useSecurityStore.getState();
      
      if (store.session.isActive) {
        store.resetIdleTime();
        
        // Update admin activity if admin user
        if (store.adminUser) {
          store.updateAdminActivity();
        }
      }
    });
  });
}

// Helper functions for security checks
export const isAdminSession = (): boolean => {
  const { adminUser, isAdminAuthenticated } = useSecurityStore.getState();
  return !!(adminUser && isAdminAuthenticated);
};

export const hasAdminPermission = (permission: string): boolean => {
  const { adminUser } = useSecurityStore.getState();
  return adminUser?.permissions?.includes(permission) ?? false;
};

export const getSessionTimeRemaining = (): number => {
  const { session } = useSecurityStore.getState();
  
  if (!session.isActive || !session.expiresAt) {
    return 0;
  }
  
  const remaining = session.expiresAt - Date.now();
  return Math.max(0, remaining);
};

export const getSecurityStatus = () => {
  const store = useSecurityStore.getState();
  
  return {
    isLocked: store.isLocked,
    lockoutTimeRemaining: store.lockoutEndTime 
      ? Math.max(0, store.lockoutEndTime - Date.now()) 
      : 0,
    failedAttempts: store.failedLoginAttempts,
    sessionActive: store.session.isActive,
    sessionTimeRemaining: getSessionTimeRemaining(),
    isAdmin: isAdminSession(),
    idleTime: store.idleTime,
  };
};
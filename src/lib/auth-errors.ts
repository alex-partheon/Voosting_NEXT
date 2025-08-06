import { AuthError } from '@supabase/supabase-js'

export function getAuthErrorMessage(error: AuthError | Error): string {
  if (error instanceof AuthError) {
    switch (error.message) {
      case 'Invalid login credentials':
        return '이메일 또는 비밀번호가 올바르지 않습니다.'
      case 'Email not confirmed':
        return '이메일 인증이 완료되지 않았습니다.'
      case 'User already registered':
        return '이미 가입된 이메일 주소입니다.'
      case 'Password should be at least 8 characters':
        return '비밀번호는 8자 이상이어야 합니다.'
      case 'Unable to validate email address: invalid format':
        return '올바른 이메일 형식이 아닙니다.'
      case 'Signup is disabled':
        return '현재 회원가입이 중단되었습니다.'
      case 'Invalid email or password':
        return '이메일 또는 비밀번호가 올바르지 않습니다.'
      case 'Email address not authorized':
        return '승인되지 않은 이메일 주소입니다.'
      case 'User not found':
        return '존재하지 않는 사용자입니다.'
      case 'Auth session missing':
        return '로그인 세션이 만료되었습니다.'
      case 'JWT expired':
        return '인증 토큰이 만료되었습니다.'
      case 'Invalid token':
        return '유효하지 않은 인증 토큰입니다.'
      case 'Signup requires a valid password':
        return '유효한 비밀번호를 입력해주세요.'
      case 'Password is too weak':
        return '비밀번호가 너무 약합니다. 더 강한 비밀번호를 사용해주세요.'
      case 'Email link is invalid or has expired':
        return '이메일 링크가 유효하지 않거나 만료되었습니다.'
      case 'Token has expired or is invalid':
        return '토큰이 만료되었거나 유효하지 않습니다.'
      case 'OAuth error':
        return 'OAuth 로그인 중 오류가 발생했습니다.'
      case 'Invalid refresh token':
        return '세션 갱신에 실패했습니다. 다시 로그인해주세요.'
      case 'Email rate limit exceeded':
        return '이메일 발송 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
      case 'SMS rate limit exceeded':
        return 'SMS 발송 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
      case 'Captcha verification failed':
        return '보안 인증에 실패했습니다. 다시 시도해주세요.'
      case 'Database connection error':
        return '데이터베이스 연결 오류가 발생했습니다.'
      case 'Service temporarily unavailable':
        return '서비스가 일시적으로 이용할 수 없습니다.'
      default:
        return error.message
    }
  }
  
  return error.message || '알 수 없는 오류가 발생했습니다.'
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError
}

export function handleAuthRedirect(error: AuthError, currentPath: string) {
  switch (error.message) {
    case 'Auth session missing':
    case 'JWT expired':
    case 'Invalid token':
    case 'Invalid refresh token':
      return `/auth/sign-in?redirectTo=${encodeURIComponent(currentPath)}`
    case 'Email not confirmed':
      return '/auth/verify-email'
    case 'User not found':
      return '/auth/sign-up'
    case 'Email address not authorized':
      return '/auth/error?type=unauthorized'
    case 'Signup is disabled':
      return '/auth/error?type=signup_disabled'
    case 'Service temporarily unavailable':
      return '/auth/error?type=service_unavailable'
    default:
      return '/auth/error'
  }
}

// 에러 타입별 분류
export enum AuthErrorType {
  INVALID_CREDENTIALS = 'invalid_credentials',
  EMAIL_NOT_CONFIRMED = 'email_not_confirmed',
  USER_EXISTS = 'user_exists',
  USER_NOT_FOUND = 'user_not_found',
  SESSION_EXPIRED = 'session_expired',
  INVALID_TOKEN = 'invalid_token',
  WEAK_PASSWORD = 'weak_password',
  RATE_LIMITED = 'rate_limited',
  OAUTH_ERROR = 'oauth_error',
  NETWORK_ERROR = 'network_error',
  SERVICE_ERROR = 'service_error',
  UNKNOWN_ERROR = 'unknown_error',
}

export function categorizeAuthError(error: AuthError | Error): AuthErrorType {
  if (error instanceof AuthError) {
    switch (error.message) {
      case 'Invalid login credentials':
      case 'Invalid email or password':
        return AuthErrorType.INVALID_CREDENTIALS
      case 'Email not confirmed':
        return AuthErrorType.EMAIL_NOT_CONFIRMED
      case 'User already registered':
        return AuthErrorType.USER_EXISTS
      case 'User not found':
        return AuthErrorType.USER_NOT_FOUND
      case 'Auth session missing':
      case 'JWT expired':
        return AuthErrorType.SESSION_EXPIRED
      case 'Invalid token':
      case 'Token has expired or is invalid':
      case 'Invalid refresh token':
        return AuthErrorType.INVALID_TOKEN
      case 'Password is too weak':
      case 'Password should be at least 8 characters':
        return AuthErrorType.WEAK_PASSWORD
      case 'Email rate limit exceeded':
      case 'SMS rate limit exceeded':
        return AuthErrorType.RATE_LIMITED
      case 'OAuth error':
        return AuthErrorType.OAUTH_ERROR
      case 'Database connection error':
      case 'Service temporarily unavailable':
        return AuthErrorType.SERVICE_ERROR
      default:
        return AuthErrorType.UNKNOWN_ERROR
    }
  }
  
  // 네트워크 에러 체크
  if (error.message.includes('fetch') || error.message.includes('network')) {
    return AuthErrorType.NETWORK_ERROR
  }
  
  return AuthErrorType.UNKNOWN_ERROR
}

// 에러 심각도 분류
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export function getErrorSeverity(errorType: AuthErrorType): ErrorSeverity {
  switch (errorType) {
    case AuthErrorType.INVALID_CREDENTIALS:
    case AuthErrorType.EMAIL_NOT_CONFIRMED:
    case AuthErrorType.WEAK_PASSWORD:
      return ErrorSeverity.LOW
    case AuthErrorType.USER_EXISTS:
    case AuthErrorType.USER_NOT_FOUND:
    case AuthErrorType.OAUTH_ERROR:
      return ErrorSeverity.MEDIUM
    case AuthErrorType.SESSION_EXPIRED:
    case AuthErrorType.INVALID_TOKEN:
    case AuthErrorType.RATE_LIMITED:
      return ErrorSeverity.HIGH
    case AuthErrorType.NETWORK_ERROR:
    case AuthErrorType.SERVICE_ERROR:
    case AuthErrorType.UNKNOWN_ERROR:
      return ErrorSeverity.CRITICAL
    default:
      return ErrorSeverity.MEDIUM
  }
}

// 에러 복구 제안
export function getErrorRecoveryAction(errorType: AuthErrorType): string {
  switch (errorType) {
    case AuthErrorType.INVALID_CREDENTIALS:
      return '이메일과 비밀번호를 다시 확인해주세요.'
    case AuthErrorType.EMAIL_NOT_CONFIRMED:
      return '이메일 인증을 완료해주세요.'
    case AuthErrorType.USER_EXISTS:
      return '로그인을 시도하거나 다른 이메일을 사용해주세요.'
    case AuthErrorType.USER_NOT_FOUND:
      return '회원가입을 먼저 진행해주세요.'
    case AuthErrorType.SESSION_EXPIRED:
      return '다시 로그인해주세요.'
    case AuthErrorType.INVALID_TOKEN:
      return '페이지를 새로고침하고 다시 시도해주세요.'
    case AuthErrorType.WEAK_PASSWORD:
      return '더 강한 비밀번호를 사용해주세요.'
    case AuthErrorType.RATE_LIMITED:
      return '잠시 후 다시 시도해주세요.'
    case AuthErrorType.OAUTH_ERROR:
      return 'OAuth 설정을 확인하거나 다른 로그인 방법을 시도해주세요.'
    case AuthErrorType.NETWORK_ERROR:
      return '인터넷 연결을 확인하고 다시 시도해주세요.'
    case AuthErrorType.SERVICE_ERROR:
      return '서비스가 일시적으로 불안정합니다. 잠시 후 다시 시도해주세요.'
    case AuthErrorType.UNKNOWN_ERROR:
      return '문제가 지속되면 고객 지원팀에 문의해주세요.'
    default:
      return '다시 시도해주세요.'
  }
}

// 통합 에러 핸들러
export interface ProcessedAuthError {
  message: string
  type: AuthErrorType
  severity: ErrorSeverity
  recoveryAction: string
  redirectPath?: string
  shouldRetry: boolean
}

export function processAuthError(
  error: AuthError | Error, 
  currentPath?: string
): ProcessedAuthError {
  const message = getAuthErrorMessage(error)
  const type = categorizeAuthError(error)
  const severity = getErrorSeverity(type)
  const recoveryAction = getErrorRecoveryAction(type)
  
  let redirectPath: string | undefined
  let shouldRetry = false
  
  if (isAuthError(error)) {
    redirectPath = handleAuthRedirect(error, currentPath || '/')
  }
  
  // 재시도 가능한 에러 타입
  if ([
    AuthErrorType.NETWORK_ERROR,
    AuthErrorType.SERVICE_ERROR,
    AuthErrorType.RATE_LIMITED,
  ].includes(type)) {
    shouldRetry = true
  }
  
  return {
    message,
    type,
    severity,
    recoveryAction,
    redirectPath,
    shouldRetry,
  }
}

// 로깅 유틸리티
export function logAuthError(error: ProcessedAuthError, context?: Record<string, any>) {
  const logData = {
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      type: error.type,
      severity: error.severity,
    },
    context,
  }
  
  // 개발 환경에서는 콘솔에 출력
  if (process.env.NODE_ENV === 'development') {
    console.error('Auth Error:', logData)
  }
  
  // 프로덕션 환경에서는 외부 로깅 서비스로 전송
  if (process.env.NODE_ENV === 'production' && error.severity === ErrorSeverity.CRITICAL) {
    // 예: Sentry, LogRocket 등으로 전송
    // sendToLoggingService(logData)
  }
}
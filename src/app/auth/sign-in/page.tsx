import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/login-form'

function SignInPageContent() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <LoginForm />
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <SignInPageContent />
    </Suspense>
  )
}

export const metadata = {
  title: '로그인 - Voosting',
  description: 'Voosting 계정에 로그인하세요',
}
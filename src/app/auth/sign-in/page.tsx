'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/components/ui/toast'

function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createBrowserClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      toast({
        type: 'success',
        title: '로그인 성공',
        description: '대시보드로 이동합니다.',
      })
      router.push(redirectTo)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '로그인에 실패했습니다.'
      setError(errorMessage)
      toast({
        type: 'error',
        title: '로그인 실패',
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'github' | 'kakao') => {
    try {
      const supabase = createBrowserClient()
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider === 'kakao' ? 'kakao' : provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`
        }
      })
      
      if (error) throw error
      
      if (data.url) {
        toast({
          type: 'info',
          title: 'OAuth 로그인',
          description: `${provider} 인증 페이지로 이동합니다.`,
        })
        window.location.href = data.url
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'OAuth 로그인에 실패했습니다.'
      setError(errorMessage)
      toast({
        type: 'error',
        title: 'OAuth 로그인 실패',
        description: errorMessage,
      })
    }
  }

  return (
    <div className="min-h-screen bg-[hsl(240_9.0909%_97.8431%)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft size={16} />
          홈으로 돌아가기
        </Link>

        {/* Sign in card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white font-bold text-xl mb-4">
              V
            </div>
            <h1 className="text-2xl font-bold text-gray-900">다시 오신 것을 환영합니다</h1>
            <p className="text-sm text-gray-600 mt-2">
              계정에 로그인하여 계속하세요
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => handleOAuthSignIn('google')}
              disabled={loading}
            >
              Google로 로그인
            </Button>
            
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => handleOAuthSignIn('github')}
              disabled={loading}
            >
              GitHub로 로그인
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t bg-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">
                또는
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                이메일
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <Label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                비밀번호
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
                required
                disabled={loading}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full rounded-lg bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              disabled={loading}
            >
              {loading ? '로그인 중...' : '로그인'}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            계정이 없으신가요?{' '}
            <Link href="/auth/sign-up" className="font-medium text-[#6366f1] hover:text-[#5558e3]">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  )
}
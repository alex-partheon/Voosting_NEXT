'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserCircle, Building2 } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/components/ui/toast'

function SignUpForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState<'creator' | 'business'>('creator')
  const [referralCode, setReferralCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // URL 파라미터에서 역할 정보를 가져와서 설정
  useEffect(() => {
    const roleParam = searchParams.get('role')
    if (roleParam === 'creator' || roleParam === 'business') {
      setRole(roleParam)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      const errorMessage = '비밀번호가 일치하지 않습니다.'
      setError(errorMessage)
      toast({
        type: 'error',
        title: '입력 오류',
        description: errorMessage,
      })
      setLoading(false)
      return
    }

    if (password.length < 8) {
      const errorMessage = '비밀번호는 8자 이상이어야 합니다.'
      setError(errorMessage)
      toast({
        type: 'error',
        title: '입력 오류',
        description: errorMessage,
      })
      setLoading(false)
      return
    }

    try {
      const supabase = createBrowserClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            full_name: displayName || email.split('@')[0],
            referred_by: referralCode || undefined,
          }
        }
      })
      
      if (error) throw error
      
      toast({
        type: 'success',
        title: '회원가입 완료',
        description: '이메일 인증을 완료해주세요.',
      })
      setSuccess(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '회원가입에 실패했습니다.'
      setError(errorMessage)
      toast({
        type: 'error',
        title: '회원가입 실패',
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignUp = async (provider: 'google' | 'github' | 'kakao') => {
    try {
      const supabase = createBrowserClient()
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider === 'kakao' ? 'kakao' : provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            role: role
          }
        }
      })
      
      if (error) throw error
      
      if (data.url) {
        toast({
          type: 'info',
          title: 'OAuth 회원가입',
          description: `${provider} 인증 페이지로 이동합니다.`,
        })
        window.location.href = data.url
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'OAuth 회원가입에 실패했습니다.'
      setError(errorMessage)
      toast({
        type: 'error',
        title: 'OAuth 회원가입 실패',
        description: errorMessage,
      })
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[hsl(240_9.0909%_97.8431%)] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white font-bold text-xl mb-4">
                V
              </div>
              <h1 className="text-2xl font-bold text-gray-900">회원가입 완료</h1>
              <p className="text-sm text-gray-600 mt-2">
                이메일 인증을 완료하여 계정을 활성화하세요
              </p>
            </div>

            <Alert className="mb-6">
              <AlertDescription>
                {email}로 인증 이메일을 발송했습니다. 
                이메일의 링크를 클릭하여 회원가입을 완료하세요.
              </AlertDescription>
            </Alert>
            
            <Button 
              className="w-full rounded-lg bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              onClick={() => router.push('/auth/sign-in')}
            >
              로그인 페이지로 이동
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const roleColor = role === 'creator' ? 'from-emerald-500 to-violet-500' : 'from-cyan-500 to-emerald-500'
  const _roleIcon = role === 'creator' ? UserCircle : Building2

  return (
    <div className="min-h-screen bg-[hsl(240_9.0909%_97.8431%)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Link 
          href="/sign-up"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft size={16} />
          역할 선택으로 돌아가기
        </Link>

        {/* Sign up card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${roleColor} text-white font-bold text-xl mb-4`}>
              {role === 'creator' ? <UserCircle size={20} /> : <Building2 size={20} />}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {role === 'creator' ? '크리에이터 회원가입' : '비즈니스 회원가입'}
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              {role === 'creator' 
                ? '3단계 추천 시스템으로 패시브 인컴을 시작하세요' 
                : '성과 기반 마케팅으로 비즈니스를 성장시키세요'
              }
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
              onClick={() => handleOAuthSignUp('google')}
              disabled={loading}
            >
              Google로 회원가입
            </Button>
            
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => handleOAuthSignUp('github')}
              disabled={loading}
            >
              GitHub로 회원가입
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
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                계정 유형
              </Label>
              <RadioGroup value={role} onValueChange={(value) => setRole(value as 'creator' | 'business')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="creator" id="creator" />
                  <Label htmlFor="creator" className="text-sm text-gray-700">크리에이터 (수익 창출)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="business" id="business" />
                  <Label htmlFor="business" className="text-sm text-gray-700">비즈니스 (광고 집행)</Label>
                </div>
              </RadioGroup>
            </div>

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
                htmlFor="displayName" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                표시 이름 (선택)
              </Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
                disabled={loading}
                placeholder="비워두면 이메일 앞부분을 사용합니다"
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
                minLength={8}
              />
            </div>

            <div>
              <Label 
                htmlFor="confirmPassword" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                비밀번호 확인
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label 
                htmlFor="referralCode" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                추천 코드 (선택)
              </Label>
              <Input
                id="referralCode"
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
                disabled={loading}
                placeholder="추천인의 코드를 입력하세요"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full rounded-lg bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              disabled={loading}
            >
              {loading ? '회원가입 중...' : '회원가입'}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link href="/auth/sign-in" className="font-medium text-[#6366f1] hover:text-[#5558e3]">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpForm />
    </Suspense>
  )
}
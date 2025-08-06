'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { createBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/components/ui/toast'
import { UserCircle, Building2 } from 'lucide-react'

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
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
    const roleParam = searchParams?.get('role')
    if (roleParam === 'creator' || roleParam === 'business') {
      setRole(roleParam)
    }
    
    const referralParam = searchParams?.get('ref')
    if (referralParam) {
      setReferralCode(referralParam)
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
      const errorMessage = '비밀번호는 최소 8자 이상이어야 합니다.'
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
      
      // 회원가입
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            role: role,
            referral_code: referralCode || null,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (signUpError) throw signUpError
      
      if (data.user && !data.user.email_confirmed_at) {
        setSuccess(true)
        toast({
          type: 'success',
          title: '회원가입 완료',
          description: '이메일 인증 링크를 확인해주세요.',
        })
      } else if (data.user) {
        toast({
          type: 'success',
          title: '회원가입 완료',
          description: '로그인되었습니다.',
        })
        router.push('/dashboard')
      }
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

  const handleOAuthSignUp = async (provider: 'google' | 'github') => {
    try {
      const supabase = createBrowserClient()
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?role=${role}&referral_code=${referralCode}`
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
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="overflow-hidden p-0">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white font-bold text-xl">
                ✓
              </div>
              <h1 className="text-2xl font-bold">이메일을 확인해주세요</h1>
              <p className="text-muted-foreground text-balance">
                <strong>{email}</strong>로 인증 링크를 보내드렸습니다.<br />
                이메일을 확인하고 링크를 클릭하여 계정을 활성화해주세요.
              </p>
              <div className="pt-4">
                <Link href="/auth/sign-in">
                  <Button variant="outline">로그인 페이지로 이동</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white font-bold text-xl mb-4">
                  V
                </div>
                <h1 className="text-2xl font-bold">Voosting에 가입하세요</h1>
                <p className="text-muted-foreground text-balance">
                  AI 기반 크리에이터 마케팅 플랫폼을 시작하세요
                </p>
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {/* 역할 선택 */}
              <div className="grid gap-3">
                <Label>가입 유형을 선택하세요</Label>
                <RadioGroup value={role} onValueChange={(value: 'creator' | 'business') => setRole(value)}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="creator" id="creator" />
                    <UserCircle className="w-4 h-4 text-muted-foreground" />
                    <Label htmlFor="creator" className="flex-1 cursor-pointer">
                      <div className="font-medium">크리에이터</div>
                      <div className="text-sm text-muted-foreground">콘텐츠 제작 및 마케팅 참여</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="business" id="business" />
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <Label htmlFor="business" className="flex-1 cursor-pointer">
                      <div className="font-medium">비즈니스</div>
                      <div className="text-sm text-muted-foreground">마케팅 캠페인 생성 및 관리</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="displayName">이름</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="홍길동"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@voosting.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="password">비밀번호</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="최소 8자 이상"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  disabled={loading}
                />
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="비밀번호를 다시 입력하세요"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                  disabled={loading}
                />
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="referralCode">추천인 코드 (선택사항)</Label>
                <Input 
                  id="referralCode" 
                  type="text" 
                  placeholder="추천인 코드를 입력하세요"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  disabled={loading}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '가입 중...' : '계정 만들기'}
              </Button>
              
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  또는 계속하기
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  type="button" 
                  className="w-full"
                  onClick={() => handleOAuthSignUp('google')}
                  disabled={loading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Google로 가입</span>
                </Button>
                <Button 
                  variant="outline" 
                  type="button" 
                  className="w-full"
                  onClick={() => handleOAuthSignUp('github')}
                  disabled={loading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4">
                    <path
                      d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">GitHub로 가입</span>
                </Button>
              </div>
              
              <div className="text-center text-sm">
                이미 계정이 있으신가요?{" "}
                <Link href="/auth/sign-in" className="underline underline-offset-4">
                  로그인
                </Link>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-white text-2xl font-bold">
                  V
                </div>
                <h2 className="text-xl font-semibold text-foreground">크리에이터와 비즈니스를 연결</h2>
                <p className="text-muted-foreground text-sm max-w-xs">
                  AI 기반 매칭으로 최적의 파트너를 찾고, 성과 중심의 마케팅 캠페인을 시작하세요.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center">
                    <UserCircle className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <div className="text-xs font-medium">크리에이터</div>
                    <div className="text-xs text-muted-foreground">콘텐츠 제작</div>
                  </div>
                  <div className="text-center">
                    <Building2 className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <div className="text-xs font-medium">비즈니스</div>
                    <div className="text-xs text-muted-foreground">마케팅 캠페인</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground text-center text-xs text-balance">
        계속 진행하면 <Link href="/terms" className="underline underline-offset-4 hover:text-primary">서비스 약관</Link>과{" "}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">개인정보 처리방침</Link>에 동의하는 것으로 간주됩니다.
      </div>
    </div>
  )
}
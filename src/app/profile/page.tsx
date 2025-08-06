'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/hooks/use-supabase'
import { createBrowserClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, User, Mail, Shield } from 'lucide-react'
import Link from 'next/link'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

function ProfilePage() {
  const { user, isAuthenticated, db, profile: userProfile } = useSupabase()
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Initialize displayName from userProfile
  useEffect(() => {
    if (userProfile?.full_name) {
      setDisplayName(userProfile.full_name)
    }
  }, [userProfile])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const { error } = await db.updateUserProfile({ full_name: displayName })

      if (error) throw error

      toast({
        type: 'success',
        title: '프로필 업데이트 완료',
        description: '프로필 정보가 성공적으로 업데이트되었습니다.',
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '프로필 업데이트에 실패했습니다.'
      setError(errorMessage)
      toast({
        type: 'error',
        title: '프로필 업데이트 실패',
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!user?.email) return

    try {
      const supabase = createBrowserClient()
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      toast({
        type: 'success',
        title: '비밀번호 재설정 이메일 발송',
        description: '이메일을 확인하여 비밀번호를 재설정하세요.',
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '비밀번호 재설정에 실패했습니다.'
      toast({
        type: 'error',
        title: '비밀번호 재설정 실패',
        description: errorMessage,
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Back button */}
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft size={16} />
          대시보드로 돌아가기
        </Link>

        <div className="space-y-6">
          {/* Profile Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} />
                프로필 정보
              </CardTitle>
              <CardDescription>
                계정 정보를 확인하고 수정할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail size={16} />
                    이메일
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    이메일은 변경할 수 없습니다.
                  </p>
                </div>

                <div>
                  <Label htmlFor="displayName">표시 이름</Label>
                  <Input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="표시할 이름을 입력하세요"
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Shield size={16} />
                    역할
                  </Label>
                  <Input
                    type="text"
                    value={userProfile?.role === 'creator' ? '크리에이터' : userProfile?.role === 'business' ? '비즈니스' : '사용자'}
                    disabled
                    className="bg-gray-50 capitalize"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    역할은 변경할 수 없습니다.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? '업데이트 중...' : '프로필 업데이트'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield size={20} />
                보안 설정
              </CardTitle>
              <CardDescription>
                계정 보안을 관리하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">비밀번호 변경</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    비밀번호를 변경하려면 이메일로 재설정 링크를 받으세요.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={handleChangePassword}
                    className="w-full"
                  >
                    비밀번호 재설정 이메일 보내기
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>계정 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">사용자 ID</p>
                  <p className="font-mono text-xs bg-gray-100 p-2 rounded">
                    {user?.id}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">가입일</p>
                  <p>{userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString('ko-KR') : '-'}</p>
                </div>
                <div>
                  <p className="text-gray-600">추천 코드</p>
                  <p className="font-mono text-sm bg-blue-50 text-blue-800 p-2 rounded">
                    {userProfile?.referral_code || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">이메일 인증</p>
                  <p className={user?.email_confirmed_at ? 'text-green-600' : 'text-orange-600'}>
                    {user?.email_confirmed_at ? '인증됨' : '미인증'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePageWithAuth() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  )
}
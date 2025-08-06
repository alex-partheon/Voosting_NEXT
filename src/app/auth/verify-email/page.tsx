'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Mail, ArrowLeft } from 'lucide-react';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-gray-100 [mask-image:linear-gradient(to_bottom,white,transparent)]" />

      <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
        {/* Back to home */}
        <Link
          href="/"
          className="absolute top-6 left-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>홈으로</span>
        </Link>

        <div className="w-full max-w-md space-y-8">
          {/* Success Icon */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">이메일을 확인해주세요!</h1>
            
            <p className="text-gray-600 mb-6">
              {email ? (
                <>
                  <span className="font-medium text-gray-900">{email}</span>로<br />
                  확인 링크를 보내드렸습니다.
                </>
              ) : (
                '등록하신 이메일로 확인 링크를 보내드렸습니다.'
              )}
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700 font-medium mb-2">다음 단계:</p>
              <ol className="text-sm text-gray-600 text-left space-y-1 list-decimal list-inside">
                <li>이메일 수신함을 확인하세요</li>
                <li>Voosting에서 보낸 이메일을 찾으세요</li>
                <li>확인 링크를 클릭하세요</li>
                <li>계정 설정을 완료하세요</li>
              </ol>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                이메일이 오지 않았나요?
              </p>
              
              <div className="text-sm text-gray-500">
                <p>• 스팸 폴더를 확인해주세요</p>
                <p>• 올바른 이메일 주소를 입력했는지 확인해주세요</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                다른 이메일로 가입하시겠습니까?{' '}
                <Link href="/sign-up" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  다시 가입하기
                </Link>
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-center text-sm text-gray-600">
            <p>문제가 계속되면 support@voosting.app으로 문의해주세요</p>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-emerald-200 to-gray-300 rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-gray-300 to-emerald-200 rounded-full blur-3xl opacity-20" />
    </div>
  );
}
import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Building2, UserCircle } from 'lucide-react';

export default function SignInPage() {
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
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Voosting에 로그인</h1>
            <p className="text-lg text-gray-600 max-w-sm mx-auto">
              크리에이터와 비즈니스를 연결하는 AI 마케팅 플랫폼
            </p>
          </div>

          {/* Role indicators */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-violet-50 border border-emerald-200">
              <UserCircle className="w-6 h-6 text-emerald-600 mb-2" />
              <h3 className="font-semibold text-gray-900">크리에이터</h3>
              <p className="text-sm text-gray-600">영향력을 수익으로</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-emerald-50 border border-cyan-200">
              <Building2 className="w-6 h-6 text-cyan-600 mb-2" />
              <h3 className="font-semibold text-gray-900">비즈니스</h3>
              <p className="text-sm text-gray-600">성과 기반 마케팅</p>
            </div>
          </div>

          {/* Clerk SignIn */}
          <div className="bg-white rounded-2xl shadow-xl p-1">
            <SignIn
              path="/sign-in"
              routing="path"
              signUpUrl="/sign-up"
              redirectUrl="/dashboard"
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'shadow-none bg-transparent',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  socialButtonsBlockButton:
                    'rounded-lg border-gray-200 hover:bg-gray-50 transition-colors',
                  formButtonPrimary:
                    'bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black transition-all duration-200',
                  footerActionLink: 'text-gray-600 hover:text-gray-900 font-medium',
                  formFieldInput:
                    'rounded-lg border-gray-200 focus:border-gray-400 focus:ring-gray-400',
                  identityPreviewEditButton: 'text-gray-600 hover:text-gray-900',
                  formFieldLabel: 'text-gray-700 font-medium',
                },
                layout: {
                  socialButtonsPlacement: 'top',
                  socialButtonsVariant: 'blockButton',
                },
              }}
            />
          </div>

          {/* Sign up prompt */}
          <div className="text-center space-y-2">
            <p className="text-gray-600">아직 계정이 없으신가요?</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/sign-up/creator"
                className="inline-flex items-center justify-center px-6 py-2 rounded-full border-2 border-emerald-500 text-emerald-600 font-medium hover:bg-emerald-50 transition-colors"
              >
                크리에이터로 가입
              </Link>
              <Link
                href="/sign-up/business"
                className="inline-flex items-center justify-center px-6 py-2 rounded-full border-2 border-cyan-500 text-cyan-600 font-medium hover:bg-cyan-50 transition-colors"
              >
                비즈니스로 가입
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full blur-3xl opacity-20" />
    </div>
  );
}

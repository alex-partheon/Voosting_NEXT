import { ThemeProvider } from '@/components/theme/theme-provider';

export const metadata = {
  title: 'Voosting - 로그인 & 회원가입',
  description: 'AI 기반 크리에이터 마케팅 플랫폼 Voosting에서 창작자와 비즈니스를 연결하세요.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        {/* Auth Header */}
        <header className="absolute top-0 left-0 right-0 z-10 p-6">
          <div className="flex items-center justify-center">
            <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="text-2xl font-bold bg-gradient-to-r from-cyan-600 via-violet-600 to-cyan-600 bg-clip-text text-transparent">
                Voosting
              </div>
            </a>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex min-h-screen items-center justify-center p-4 pt-24">
          <div className="w-full max-w-md">
            {children}
          </div>
        </main>

        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-cyan-200/20 to-violet-200/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-violet-200/20 to-cyan-200/20 rounded-full blur-3xl" />
        </div>
      </div>
    </ThemeProvider>
  );
}
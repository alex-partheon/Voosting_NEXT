import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ban, Mail, Phone, MessageCircle } from 'lucide-react';

export default function AccountSuspendedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Ban className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">계정이 일시 정지되었습니다</CardTitle>
          <CardDescription>
            귀하의 계정이 일시적으로 정지되었습니다.
            자세한 내용은 고객 지원팀에 문의해 주세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
            <p className="text-sm font-medium text-amber-900">
              계정 정지 사유
            </p>
            <p className="mt-1 text-sm text-amber-700">
              서비스 이용 약관 위반 또는 비정상적인 활동이 감지되었습니다.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-sm">문의하기</h3>
            
            <a
              href="mailto:support@voosting.app"
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-gray-50 transition-colors"
            >
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">이메일</p>
                <p className="text-xs text-gray-500">support@voosting.app</p>
              </div>
            </a>

            <a
              href="tel:1588-0000"
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-gray-50 transition-colors"
            >
              <Phone className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">전화</p>
                <p className="text-xs text-gray-500">1588-0000</p>
              </div>
            </a>

            <a
              href="/contact"
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-gray-50 transition-colors"
            >
              <MessageCircle className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">온라인 문의</p>
                <p className="text-xs text-gray-500">24시간 이내 답변</p>
              </div>
            </a>
          </div>

          <div className="pt-4">
            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                홈으로 돌아가기
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
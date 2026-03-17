import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CalendarDays, CheckCircle, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-blue-600">ReserveOS</span>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">로그인</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">무료 시작하기</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="max-w-5xl mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            예약 관리, 이제 쉽게
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
            링크 하나로 고객이 직접 예약하고, 사장님은 한눈에 관리하세요.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Button size="lg" asChild>
              <Link href="/signup">지금 시작하기 →</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/demo-shop">데모 예약 페이지</Link>
            </Button>
          </div>
        </section>

        <section className="bg-gray-50 py-16">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <CalendarDays className="h-10 w-10 text-blue-500 mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">간편한 온라인 예약</h3>
                <p className="text-gray-500 text-sm">
                  고객이 날짜와 시간을 직접 선택해 예약하면, 실시간으로 확인하세요.
                </p>
              </div>
              <div className="text-center">
                <Users className="h-10 w-10 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">고객 관리</h3>
                <p className="text-gray-500 text-sm">
                  예약 이력과 고객 정보를 한곳에서 관리하고 메모를 남기세요.
                </p>
              </div>
              <div className="text-center">
                <CheckCircle className="h-10 w-10 text-purple-500 mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">이메일 자동 알림</h3>
                <p className="text-gray-500 text-sm">
                  예약 완료/취소 시 고객과 사장님에게 자동으로 이메일이 발송됩니다.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

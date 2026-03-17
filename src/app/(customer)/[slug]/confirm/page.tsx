'use client'

import { use, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatTime, formatDuration, formatPrice } from '@/lib/format'
import { CheckCircle } from 'lucide-react'

interface ReservationData {
  reservation: { reservationNo: string; date: string; startTime: string; endTime: string; status: string }
  customer: { name: string; phone: string }
  service: { name: string; duration: number; price: number }
}

export default function ConfirmPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const searchParams = useSearchParams()
  const reservationNo = searchParams.get('no')

  const [data, setData] = useState<ReservationData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!reservationNo) return
    // 예약번호만 있으면 조회 가능하도록 별도 엔드포인트 사용 (전화번호 불필요)
    // confirm 페이지는 예약 직후 리다이렉트이므로 session storage에서 phone 가져옴
    const phone = sessionStorage.getItem('booking_phone') ?? ''
    fetch(`/api/reservations/lookup?reservation_no=${reservationNo}&phone=${phone}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [reservationNo])

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 space-y-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="text-center mb-6">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-3" />
        <h1 className="text-2xl font-bold">예약이 완료되었습니다!</h1>
        <p className="text-gray-500 mt-1">예약 확인 및 관리는 아래에서 가능합니다</p>
      </div>

      {data ? (
        <Card className="mb-6">
          <CardContent className="p-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">예약번호</span>
              <span className="font-mono font-bold text-blue-700">{data.reservation.reservationNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">서비스</span>
              <span>{data.service.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">일시</span>
              <span>{formatDate(data.reservation.date)} {formatTime(data.reservation.startTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">소요시간</span>
              <span>{formatDuration(data.service.duration)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">금액</span>
              <span className="font-semibold">{formatPrice(data.service.price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">예약자</span>
              <span>{data.customer.name} ({data.customer.phone})</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardContent className="p-5 text-center text-gray-500">
            <p className="font-mono font-bold text-blue-700 text-lg mb-1">{reservationNo}</p>
            <p className="text-sm">위 예약번호를 저장해두세요</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <Button variant="outline" className="w-full" nativeButton={false} render={<Link href={`/${slug}/lookup`} />}>예약 조회/취소</Button>
        <Button variant="ghost" className="w-full" nativeButton={false} render={<Link href={`/${slug}`} />}>처음으로</Button>
      </div>
    </div>
  )
}

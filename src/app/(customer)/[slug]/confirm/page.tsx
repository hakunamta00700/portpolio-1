'use client'

import { use, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatTime, formatDuration, formatPrice } from '@/lib/format'
import { CheckCircle2, Calendar, Clock, CreditCard, User, Hash } from 'lucide-react'

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
    const phone = sessionStorage.getItem('booking_phone') ?? ''
    fetch(`/api/reservations/lookup?reservation_no=${reservationNo}&phone=${phone}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [reservationNo])

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 space-y-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-10">
        {/* Success banner */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl px-6 py-8 text-center text-white shadow-lg shadow-blue-200 mb-5">
          <CheckCircle2 className="h-14 w-14 mx-auto mb-3 opacity-90" />
          <h1 className="text-2xl font-bold">예약 완료!</h1>
          <p className="text-blue-100 text-sm mt-1">예약이 성공적으로 접수되었습니다</p>
          {reservationNo && (
            <div className="mt-4 bg-white/15 rounded-xl px-4 py-2 inline-block">
              <p className="text-xs text-blue-100 mb-0.5">예약번호</p>
              <p className="font-mono font-bold text-lg tracking-wider">{reservationNo}</p>
            </div>
          )}
        </div>

        {/* Detail card */}
        {data ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-5">
            <div className="px-5 py-3.5 border-b border-gray-50">
              <h2 className="text-sm font-semibold text-gray-700">예약 상세</h2>
            </div>
            <div className="px-5 py-1 divide-y divide-gray-50">
              <div className="flex items-center gap-3 py-3">
                <Hash className="h-4 w-4 text-gray-400 shrink-0" />
                <div className="flex flex-1 justify-between gap-2">
                  <span className="text-sm text-gray-500">서비스</span>
                  <span className="text-sm font-medium text-gray-900">{data.service.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 py-3">
                <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                <div className="flex flex-1 justify-between gap-2">
                  <span className="text-sm text-gray-500">일시</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(data.reservation.date)} {formatTime(data.reservation.startTime)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 py-3">
                <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                <div className="flex flex-1 justify-between gap-2">
                  <span className="text-sm text-gray-500">소요시간</span>
                  <span className="text-sm font-medium text-gray-900">{formatDuration(data.service.duration)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 py-3">
                <CreditCard className="h-4 w-4 text-gray-400 shrink-0" />
                <div className="flex flex-1 justify-between gap-2">
                  <span className="text-sm text-gray-500">금액</span>
                  <span className="text-sm font-bold text-blue-600">{formatPrice(data.service.price)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 py-3">
                <User className="h-4 w-4 text-gray-400 shrink-0" />
                <div className="flex flex-1 justify-between gap-2">
                  <span className="text-sm text-gray-500">예약자</span>
                  <span className="text-sm font-medium text-gray-900">
                    {data.customer.name} · {data.customer.phone}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center mb-5">
            <p className="text-xs text-gray-400 mb-1">예약번호를 저장해두세요</p>
            <p className="font-mono font-bold text-blue-700 text-lg">{reservationNo}</p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2.5">
          <Button
            variant="outline"
            className="w-full"
            nativeButton={false}
            render={<Link href={`/${slug}/lookup`} />}
          >
            예약 조회 / 취소
          </Button>
          <Button
            variant="ghost"
            className="w-full text-gray-500"
            nativeButton={false}
            render={<Link href={`/${slug}`} />}
          >
            처음으로
          </Button>
        </div>
      </div>
    </div>
  )
}

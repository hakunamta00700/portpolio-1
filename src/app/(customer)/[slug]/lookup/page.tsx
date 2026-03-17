'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatusBadge } from '@/components/status-badge'
import { formatDate, formatTime, formatDuration, formatPrice } from '@/lib/format'
import { toast } from 'sonner'
import type { ReservationStatus } from '@/types'
import { ChevronLeft, Search, Calendar, Clock, CreditCard, User } from 'lucide-react'

const lookupSchema = z.object({
  reservationNo: z.string().min(1, '예약번호를 입력해주세요'),
  phone: z.string().min(10, '연락처를 입력해주세요'),
})

type LookupForm = z.infer<typeof lookupSchema>

interface ReservationData {
  reservation: {
    id: string
    reservationNo: string
    date: string
    startTime: string
    status: string
    customerMemo: string | null
  }
  customer: { name: string; phone: string }
  service: { name: string; duration: number; price: number }
}

export default function LookupPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [result, setResult] = useState<ReservationData | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [phone, setPhone] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LookupForm>({
    resolver: zodResolver(lookupSchema),
  })

  async function onLookup(data: LookupForm) {
    setResult(null)
    setPhone(data.phone)
    const res = await fetch(
      `/api/reservations/lookup?reservation_no=${encodeURIComponent(data.reservationNo)}&phone=${encodeURIComponent(data.phone)}`
    )
    const json = await res.json()
    if (!res.ok) {
      toast.error(json.error ?? '예약을 찾을 수 없습니다')
      return
    }
    setResult(json)
  }

  async function handleCancel() {
    if (!result || !phone) return
    if (!confirm('예약을 취소하시겠습니까?')) return
    setCancelling(true)
    const res = await fetch(`/api/reservations/${result.reservation.reservationNo}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    setCancelling(false)
    const json = await res.json()
    if (res.ok) {
      toast.success('예약이 취소되었습니다')
      setResult((prev) => prev ? { ...prev, reservation: { ...prev.reservation, status: 'cancelled' } } : null)
    } else {
      toast.error(json.error ?? '취소에 실패했습니다')
    }
  }

  const canCancel = result && ['pending', 'confirmed'].includes(result.reservation.status)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-400" />
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href={`/${slug}`} className="text-gray-400 hover:text-gray-600 transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-bold text-gray-900">예약 조회 / 취소</h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
        {/* Lookup form */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-blue-500" />
              <h2 className="text-sm font-semibold text-gray-800">예약 조회</h2>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">예약번호와 예약 시 입력한 연락처를 입력하세요</p>
          </div>
          <form onSubmit={handleSubmit(onLookup)} className="px-5 py-4 space-y-3.5">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-600">예약번호</Label>
              <Input
                placeholder="RSV-20240101-XXXX"
                className="font-mono"
                {...register('reservationNo')}
              />
              {errors.reservationNo && (
                <p className="text-xs text-red-500">{errors.reservationNo.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-600">예약자 연락처</Label>
              <Input placeholder="010-0000-0000" {...register('phone')} />
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? '조회 중...' : '조회하기'}
            </Button>
          </form>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Status header */}
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <span className="font-mono text-sm font-bold text-blue-700">
                {result.reservation.reservationNo}
              </span>
              <StatusBadge status={result.reservation.status as ReservationStatus} />
            </div>

            {/* Details */}
            <div className="px-5 py-1 divide-y divide-gray-50">
              <div className="flex items-center gap-3 py-3">
                <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                <div className="flex flex-1 justify-between gap-2">
                  <span className="text-sm text-gray-500">일시</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(result.reservation.date)} {formatTime(result.reservation.startTime)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 py-3">
                <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                <div className="flex flex-1 justify-between gap-2">
                  <span className="text-sm text-gray-500">서비스</span>
                  <span className="text-sm font-medium text-gray-900">{result.service.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 py-3">
                <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                <div className="flex flex-1 justify-between gap-2">
                  <span className="text-sm text-gray-500">소요시간</span>
                  <span className="text-sm font-medium text-gray-900">{formatDuration(result.service.duration)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 py-3">
                <CreditCard className="h-4 w-4 text-gray-400 shrink-0" />
                <div className="flex flex-1 justify-between gap-2">
                  <span className="text-sm text-gray-500">금액</span>
                  <span className="text-sm font-bold text-blue-600">{formatPrice(result.service.price)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 py-3">
                <User className="h-4 w-4 text-gray-400 shrink-0" />
                <div className="flex flex-1 justify-between gap-2">
                  <span className="text-sm text-gray-500">예약자</span>
                  <span className="text-sm font-medium text-gray-900">{result.customer.name}</span>
                </div>
              </div>
            </div>

            {canCancel && (
              <div className="px-5 pb-4 pt-2">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling ? '취소 중...' : '예약 취소하기'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

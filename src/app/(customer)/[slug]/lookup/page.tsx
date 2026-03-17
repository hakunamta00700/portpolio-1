'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/status-badge'
import { formatDate, formatTime, formatDuration, formatPrice } from '@/lib/format'
import { toast } from 'sonner'
import type { ReservationStatus } from '@/types'
import { ChevronLeft } from 'lucide-react'

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
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Link href={`/${slug}`} className="text-gray-400 hover:text-gray-600">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold">예약 조회/취소</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">예약 조회</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onLookup)} className="space-y-3">
              <div className="space-y-1">
                <Label>예약번호</Label>
                <Input placeholder="RSV-20240101-XXXX" {...register('reservationNo')} />
                {errors.reservationNo && <p className="text-sm text-red-500">{errors.reservationNo.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>예약자 연락처</Label>
                <Input placeholder="010-0000-0000" {...register('phone')} />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? '조회 중...' : '조회'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-blue-700 font-bold">{result.reservation.reservationNo}</span>
                <StatusBadge status={result.reservation.status as ReservationStatus} />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">서비스</span>
                  <span>{result.service.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">일시</span>
                  <span>{formatDate(result.reservation.date)} {formatTime(result.reservation.startTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">소요/금액</span>
                  <span>{formatDuration(result.service.duration)} / {formatPrice(result.service.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">예약자</span>
                  <span>{result.customer.name}</span>
                </div>
              </div>
              {canCancel && (
                <Button
                  variant="destructive"
                  className="w-full mt-2"
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling ? '취소 중...' : '예약 취소'}
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

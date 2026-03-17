'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TodayTimeline } from '@/components/reservations/today-timeline'
import { ReservationDetailModal } from '@/components/reservations/reservation-detail-modal'
import { formatDate } from '@/lib/format'
import { CalendarDays, CheckCircle, Clock, XCircle } from 'lucide-react'

interface ReservationRow {
  reservation: {
    id: string
    date: string
    startTime: string
    endTime: string
    status: string
    customerMemo?: string | null
    ownerMemo?: string | null
    cancelReason?: string | null
  }
  customer: { name: string; phone: string; email?: string | null }
  service: { name: string; duration: number; price: number }
}

export default function DashboardPage() {
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [todayItems, setTodayItems] = useState<ReservationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [redirectOnboard, setRedirectOnboard] = useState(false)

  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    fetch('/api/businesses')
      .then((r) => r.json())
      .then(async (data) => {
        if (!data[0]) {
          setRedirectOnboard(true)
          return
        }
        const biz = data[0]
        setBusinessId(biz.id)
        const res = await fetch(`/api/businesses/${biz.id}/reservations?date=${today}&limit=100`)
        const items = await res.json()
        setTodayItems(items)
      })
      .finally(() => setLoading(false))
  }, [today])

  useEffect(() => {
    if (redirectOnboard) {
      window.location.href = '/onboarding'
    }
  }, [redirectOnboard])

  const selectedItem = selectedId ? todayItems.find((i) => i.reservation.id === selectedId) : null

  const pending = todayItems.filter((i) => i.reservation.status === 'pending').length
  const confirmed = todayItems.filter((i) => i.reservation.status === 'confirmed').length
  const completed = todayItems.filter((i) => i.reservation.status === 'completed').length
  const cancelled = todayItems.filter((i) => i.reservation.status === 'cancelled').length

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-60" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">대시보드</h1>
        <p className="text-gray-500 text-sm mt-1">오늘 {formatDate(today)} 예약 현황</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CalendarDays className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{todayItems.length}</p>
              <p className="text-xs text-gray-500">전체</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{pending}</p>
              <p className="text-xs text-gray-500">대기중</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{confirmed + completed}</p>
              <p className="text-xs text-gray-500">확정/완료</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-400" />
            <div>
              <p className="text-2xl font-bold">{cancelled}</p>
              <p className="text-xs text-gray-500">취소</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">오늘 예약 타임라인</CardTitle>
        </CardHeader>
        <CardContent>
          <TodayTimeline items={todayItems} onSelect={setSelectedId} />
        </CardContent>
      </Card>

      {selectedItem && businessId && (
        <ReservationDetailModal
          businessId={businessId}
          item={selectedItem}
          onClose={() => setSelectedId(null)}
          onUpdated={(updated) => {
            setTodayItems((prev) =>
              prev.map((i) =>
                i.reservation.id === selectedItem.reservation.id
                  ? { ...i, reservation: { ...i.reservation, ...updated } }
                  : i
              )
            )
          }}
        />
      )}
    </div>
  )
}

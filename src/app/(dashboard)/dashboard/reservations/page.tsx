'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ReservationCard } from '@/components/reservations/reservation-card'
import { ReservationDetailModal } from '@/components/reservations/reservation-detail-modal'
import { STATUS_LABELS, type ReservationStatus } from '@/types'

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

export default function ReservationsPage() {
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [items, setItems] = useState<ReservationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filterDate, setFilterDate] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const fetchReservations = useCallback(
    async (bizId: string) => {
      const params = new URLSearchParams()
      if (filterDate) params.set('date', filterDate)
      if (filterStatus && filterStatus !== 'all') params.set('status', filterStatus)
      params.set('limit', '50')

      const res = await fetch(`/api/businesses/${bizId}/reservations?${params}`)
      const data = await res.json()
      setItems(data)
    },
    [filterDate, filterStatus]
  )

  useEffect(() => {
    fetch('/api/businesses')
      .then((r) => r.json())
      .then((data) => {
        if (data[0]) {
          setBusinessId(data[0].id)
          return fetchReservations(data[0].id)
        }
      })
      .finally(() => setLoading(false))
  }, [fetchReservations])

  const selectedItem = selectedId ? items.find((i) => i.reservation.id === selectedId) : null

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-40" />
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">예약 관리</h1>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <Input
          type="date"
          className="w-44"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v ?? '')}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="전체 상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {(Object.entries(STATUS_LABELS) as [ReservationStatus, string][]).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => { setFilterDate(''); setFilterStatus('') }}
        >
          초기화
        </Button>
      </div>

      <div className="space-y-3">
        {items.length === 0 && (
          <p className="text-gray-500 text-center py-12">예약이 없습니다</p>
        )}
        {items.map((item) => (
          <ReservationCard
            key={item.reservation.id}
            {...item}
            onClick={() => setSelectedId(item.reservation.id)}
          />
        ))}
      </div>

      {selectedItem && businessId && (
        <ReservationDetailModal
          businessId={businessId}
          item={selectedItem}
          onClose={() => setSelectedId(null)}
          onUpdated={(updated) => {
            setItems((prev) =>
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

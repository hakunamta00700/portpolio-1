'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge } from '@/components/status-badge'
import { formatDate, formatTime, formatDuration, formatPrice } from '@/lib/format'
import { STATUS_LABELS, type ReservationStatus } from '@/types'
import { toast } from 'sonner'
import { X } from 'lucide-react'

const ALLOWED_TRANSITIONS: Record<ReservationStatus, ReservationStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'no_show', 'cancelled'],
  completed: [],
  no_show: [],
  cancelled: [],
}

interface ReservationDetailModalProps {
  businessId: string
  item: {
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
  onClose: () => void
  onUpdated: (updated: { status: string; ownerMemo?: string | null }) => void
}

export function ReservationDetailModal({
  businessId,
  item,
  onClose,
  onUpdated,
}: ReservationDetailModalProps) {
  const { reservation, customer, service } = item
  const status = reservation.status as ReservationStatus
  const allowed = ALLOWED_TRANSITIONS[status] ?? []

  const [newStatus, setNewStatus] = useState<ReservationStatus | ''>('')
  const [ownerMemo, setOwnerMemo] = useState(reservation.ownerMemo ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const body: Record<string, string> = {}
    if (newStatus) body.status = newStatus
    if (ownerMemo !== (reservation.ownerMemo ?? '')) body.ownerMemo = ownerMemo

    const res = await fetch(
      `/api/businesses/${businessId}/reservations/${reservation.id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus || status, ...body }),
      }
    )
    setSaving(false)
    if (res.ok) {
      toast.success('예약이 업데이트되었습니다')
      onUpdated({ status: newStatus || status, ownerMemo })
      onClose()
    } else {
      toast.error('업데이트에 실패했습니다')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-lg font-bold mb-4">예약 상세</h2>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">상태</span>
            <StatusBadge status={status} />
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">고객명</span>
            <span>{customer.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">연락처</span>
            <span>{customer.phone}</span>
          </div>
          {customer.email && (
            <div className="flex justify-between">
              <span className="text-gray-500">이메일</span>
              <span>{customer.email}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">서비스</span>
            <span>{service.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">일시</span>
            <span>
              {formatDate(reservation.date)} {formatTime(reservation.startTime)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">소요/금액</span>
            <span>{formatDuration(service.duration)} / {formatPrice(service.price)}</span>
          </div>
          {reservation.customerMemo && (
            <div>
              <span className="text-gray-500">고객 요청</span>
              <p className="mt-1 text-gray-700 italic">"{reservation.customerMemo}"</p>
            </div>
          )}
        </div>

        <div className="mt-4 space-y-3">
          {allowed.length > 0 && (
            <div className="space-y-1">
              <Label>상태 변경</Label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as ReservationStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="현재 상태 유지" />
                </SelectTrigger>
                <SelectContent>
                  {allowed.map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1">
            <Label>사장님 메모</Label>
            <Textarea
              value={ownerMemo}
              onChange={(e) => setOwnerMemo(e.target.value)}
              placeholder="내부 메모 (고객에게 표시되지 않음)"
              rows={2}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>닫기</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? '저장 중...' : '저장'}
          </Button>
        </div>
      </div>
    </div>
  )
}

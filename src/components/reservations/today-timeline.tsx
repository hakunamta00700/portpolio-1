'use client'

import { StatusBadge } from '@/components/status-badge'
import { formatTime, formatDuration } from '@/lib/format'
import type { ReservationStatus } from '@/types'

interface TimelineItem {
  reservation: {
    id: string
    startTime: string
    endTime: string
    status: string
  }
  customer: { name: string; phone: string }
  service: { name: string; duration: number }
}

interface TodayTimelineProps {
  items: TimelineItem[]
  onSelect?: (id: string) => void
}

export function TodayTimeline({ items, onSelect }: TodayTimelineProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        오늘 예약이 없습니다
      </div>
    )
  }

  const sorted = [...items].sort((a, b) =>
    a.reservation.startTime.localeCompare(b.reservation.startTime)
  )

  return (
    <div className="space-y-2">
      {sorted.map(({ reservation, customer, service }) => (
        <button
          key={reservation.id}
          onClick={() => onSelect?.(reservation.id)}
          className="w-full text-left flex items-center gap-4 p-3 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
        >
          <div className="w-20 text-sm font-mono text-gray-600">
            {formatTime(reservation.startTime)}
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">{customer.name}</div>
            <div className="text-xs text-gray-500">
              {service.name} · {formatDuration(service.duration)}
            </div>
          </div>
          <StatusBadge status={reservation.status as ReservationStatus} />
        </button>
      ))}
    </div>
  )
}

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/status-badge'
import { formatDate, formatTime, formatDuration, formatPrice } from '@/lib/format'
import type { ReservationStatus } from '@/types'

interface ReservationCardProps {
  reservation: {
    id: string
    date: string
    startTime: string
    endTime: string
    status: string
    customerMemo?: string | null
  }
  customer: { name: string; phone: string; email?: string | null }
  service: { name: string; duration: number; price: number }
  onClick?: () => void
}

export function ReservationCard({ reservation, customer, service, onClick }: ReservationCardProps) {
  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">{customer.name}</span>
              <span className="text-sm text-gray-500">{customer.phone}</span>
            </div>
            <p className="text-sm text-gray-600">
              {service.name} · {formatDuration(service.duration)} · {formatPrice(service.price)}
            </p>
            <p className="text-sm text-gray-600 mt-0.5">
              {formatDate(reservation.date)} {formatTime(reservation.startTime)} ~ {formatTime(reservation.endTime)}
            </p>
            {reservation.customerMemo && (
              <p className="text-sm text-gray-400 mt-1 italic">"{reservation.customerMemo}"</p>
            )}
          </div>
          <StatusBadge status={reservation.status as ReservationStatus} />
        </div>
      </CardContent>
    </Card>
  )
}

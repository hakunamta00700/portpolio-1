'use client'

import { Card, CardContent } from '@/components/ui/card'
import { formatPrice, formatDuration } from '@/lib/format'
import { Clock, ChevronRight } from 'lucide-react'

interface ServiceCardProps {
  service: {
    id: string
    name: string
    description?: string | null
    duration: number
    price: number
  }
  onSelect?: (id: string) => void
}

export function ServiceCard({ service, onSelect }: ServiceCardProps) {
  return (
    <Card
      className="hover:shadow-md hover:border-blue-200 transition-all duration-150 cursor-pointer group"
      onClick={() => onSelect?.(service.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {service.name}
            </h3>
            {service.description && (
              <p className="text-xs text-gray-500 mt-0.5 truncate">{service.description}</p>
            )}
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-500">
              <Clock className="h-3.5 w-3.5 text-gray-400" />
              <span>{formatDuration(service.duration)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right">
              <span className="text-base font-bold text-blue-600">{formatPrice(service.price)}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-400 transition-colors" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

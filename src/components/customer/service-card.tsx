import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice, formatDuration } from '@/lib/format'
import { Clock, DollarSign } from 'lucide-react'

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
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold">{service.name}</h3>
          {service.description && (
            <p className="text-sm text-gray-500 mt-0.5">{service.description}</p>
          )}
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(service.duration)}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" />
              {formatPrice(service.price)}
            </span>
          </div>
        </div>
        <Button size="sm" onClick={() => onSelect?.(service.id)}>
          예약
        </Button>
      </CardContent>
    </Card>
  )
}

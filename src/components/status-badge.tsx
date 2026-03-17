import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { STATUS_LABELS, STATUS_COLORS, type ReservationStatus } from '@/types'

interface StatusBadgeProps {
  status: ReservationStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(STATUS_COLORS[status], 'border-0 font-medium', className)}
    >
      {STATUS_LABELS[status]}
    </Badge>
  )
}

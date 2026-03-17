'use client'

import { cn } from '@/lib/utils'
import { formatTime } from '@/lib/format'

interface TimeSlot {
  time: string
  available: boolean
}

interface TimeSlotPickerProps {
  slots: TimeSlot[]
  selectedTime?: string
  onSelect: (time: string) => void
  loading?: boolean
}

export function TimeSlotPicker({ slots, selectedTime, onSelect, loading }: TimeSlotPickerProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-gray-100 animate-pulse" />
        ))}
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <p className="text-center text-gray-400 py-6">예약 가능한 시간이 없습니다</p>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {slots.map((slot) => (
        <button
          key={slot.time}
          disabled={!slot.available}
          onClick={() => slot.available && onSelect(slot.time)}
          className={cn(
            'h-10 rounded-lg text-sm font-medium border transition-colors',
            slot.available
              ? selectedTime === slot.time
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600'
              : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through'
          )}
        >
          {formatTime(slot.time)}
        </button>
      ))}
    </div>
  )
}

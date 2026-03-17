'use client'

import { Calendar } from '@/components/ui/calendar'

interface DatePickerProps {
  selected?: Date
  onSelect: (date: Date) => void
  maxAdvanceDays?: number
  blockedDates?: string[]
}

export function BookingDatePicker({ selected, onSelect, maxAdvanceDays = 30, blockedDates = [] }: DatePickerProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const maxDate = new Date(today)
  maxDate.setDate(maxDate.getDate() + maxAdvanceDays)

  const blockedSet = new Set(blockedDates)

  return (
    <Calendar
      mode="single"
      selected={selected}
      onSelect={(d) => d && onSelect(d)}
      disabled={(d) => {
        const ds = d.toISOString().slice(0, 10)
        return d < today || d > maxDate || blockedSet.has(ds)
      }}
      modifiers={{ blocked: blockedDates.map((d) => new Date(d)) }}
      modifiersClassNames={{ blocked: 'bg-red-50 text-red-400 line-through' }}
      className="rounded-lg border bg-white mx-auto"
    />
  )
}

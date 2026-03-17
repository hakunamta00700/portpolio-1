'use client'

import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { formatDateShort } from '@/lib/format'

interface BlockedDatePickerProps {
  blockedDates: string[]  // 'YYYY-MM-DD'[]
  onAdd: (date: string) => void
  onRemove: (date: string) => void
}

export function BlockedDatePicker({ blockedDates, onAdd, onRemove }: BlockedDatePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()

  function handleAdd() {
    if (!selectedDate) return
    const dateStr = selectedDate.toISOString().slice(0, 10)
    if (!blockedDates.includes(dateStr)) {
      onAdd(dateStr)
    }
    setSelectedDate(undefined)
  }

  const blockedSet = new Set(blockedDates)

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
          modifiers={{ blocked: blockedDates.map((d) => new Date(d)) }}
          modifiersClassNames={{ blocked: 'bg-red-100 text-red-700 rounded-full' }}
          className="rounded-lg border"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">휴무일 목록</span>
            <Button
              size="sm"
              disabled={!selectedDate || blockedSet.has(selectedDate?.toISOString().slice(0, 10) ?? '')}
              onClick={handleAdd}
            >
              추가
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {blockedDates.length === 0 && (
              <p className="text-sm text-gray-400">등록된 휴무일이 없습니다</p>
            )}
            {blockedDates.sort().map((date) => (
              <Badge key={date} variant="outline" className="flex items-center gap-1 py-1">
                {formatDateShort(date)}
                <button
                  onClick={() => onRemove(date)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

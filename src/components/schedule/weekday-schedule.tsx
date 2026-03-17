'use client'

import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

export interface ScheduleItem {
  dayOfWeek: number
  isOpen: boolean
  openTime: string
  closeTime: string
  breakStart?: string | null
  breakEnd?: string | null
}

interface WeekdayScheduleProps {
  schedules: ScheduleItem[]
  onChange: (schedules: ScheduleItem[]) => void
}

export function WeekdaySchedule({ schedules, onChange }: WeekdayScheduleProps) {
  function update(dayOfWeek: number, patch: Partial<ScheduleItem>) {
    onChange(
      schedules.map((s) =>
        s.dayOfWeek === dayOfWeek ? { ...s, ...patch } : s
      )
    )
  }

  const getSchedule = (day: number): ScheduleItem =>
    schedules.find((s) => s.dayOfWeek === day) ?? {
      dayOfWeek: day,
      isOpen: day !== 0,
      openTime: '09:00',
      closeTime: '18:00',
    }

  return (
    <div className="space-y-3">
      {[0, 1, 2, 3, 4, 5, 6].map((day) => {
        const s = getSchedule(day)
        return (
          <div key={day} className="flex items-start gap-4 p-3 rounded-lg border bg-white">
            <div className="flex items-center gap-2 w-16 pt-1">
              <Switch
                checked={s.isOpen}
                onCheckedChange={(v) => update(day, { isOpen: v })}
              />
              <span className="text-sm font-medium w-4">{DAY_LABELS[day]}</span>
            </div>
            {s.isOpen ? (
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-gray-500 w-16">영업시간</Label>
                  <Input
                    type="time"
                    className="w-32 h-8 text-sm"
                    value={s.openTime}
                    onChange={(e) => update(day, { openTime: e.target.value })}
                  />
                  <span className="text-gray-400">~</span>
                  <Input
                    type="time"
                    className="w-32 h-8 text-sm"
                    value={s.closeTime}
                    onChange={(e) => update(day, { closeTime: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-gray-500 w-16">휴식시간</Label>
                  <Input
                    type="time"
                    className="w-32 h-8 text-sm"
                    value={s.breakStart ?? ''}
                    placeholder="없음"
                    onChange={(e) => update(day, { breakStart: e.target.value || null })}
                  />
                  <span className="text-gray-400">~</span>
                  <Input
                    type="time"
                    className="w-32 h-8 text-sm"
                    value={s.breakEnd ?? ''}
                    placeholder="없음"
                    onChange={(e) => update(day, { breakEnd: e.target.value || null })}
                  />
                </div>
              </div>
            ) : (
              <span className="text-sm text-gray-400 pt-1">휴무</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

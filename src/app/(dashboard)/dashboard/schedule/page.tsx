'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { WeekdaySchedule, type ScheduleItem } from '@/components/schedule/weekday-schedule'
import { BlockedDatePicker } from '@/components/schedule/blocked-date-picker'
import { toast } from 'sonner'

const DEFAULT_SCHEDULES: ScheduleItem[] = [0, 1, 2, 3, 4, 5, 6].map((day) => ({
  dayOfWeek: day,
  isOpen: day !== 0,
  openTime: '09:00',
  closeTime: '18:00',
  breakStart: null,
  breakEnd: null,
}))

export default function SchedulePage() {
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [schedules, setSchedules] = useState<ScheduleItem[]>(DEFAULT_SCHEDULES)
  const [blockedDates, setBlockedDates] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/businesses')
      .then((r) => r.json())
      .then(async (data) => {
        const biz = data[0]
        if (!biz) return
        setBusinessId(biz.id)

        const [sched, blocked] = await Promise.all([
          fetch(`/api/businesses/${biz.id}/schedules`).then((r) => r.json()),
          fetch(`/api/businesses/${biz.id}/blocked-dates`).then((r) => r.json()),
        ])
        if (sched.length > 0) setSchedules(sched)
        setBlockedDates(blocked.map((b: { date: string }) => b.date))
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleSaveSchedules() {
    if (!businessId) return
    setSaving(true)
    const res = await fetch(`/api/businesses/${businessId}/schedules`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schedules }),
    })
    setSaving(false)
    if (res.ok) toast.success('영업시간이 저장되었습니다')
    else toast.error('저장에 실패했습니다')
  }

  async function handleAddBlockedDate(date: string) {
    if (!businessId) return
    const res = await fetch(`/api/businesses/${businessId}/blocked-dates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date }),
    })
    if (res.ok) {
      setBlockedDates((prev) => [...prev, date])
      toast.success('휴무일이 등록되었습니다')
    } else {
      toast.error('등록에 실패했습니다')
    }
  }

  async function handleRemoveBlockedDate(date: string) {
    if (!businessId) return
    const res = await fetch(`/api/businesses/${businessId}/blocked-dates/${date}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      setBlockedDates((prev) => prev.filter((d) => d !== date))
      toast.success('휴무일이 삭제되었습니다')
    } else {
      toast.error('삭제에 실패했습니다')
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">영업시간 관리</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">정기 영업시간</CardTitle>
            <Button size="sm" onClick={handleSaveSchedules} disabled={saving}>
              {saving ? '저장 중...' : '저장'}
            </Button>
          </CardHeader>
          <CardContent>
            <WeekdaySchedule schedules={schedules} onChange={setSchedules} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">휴무일 설정</CardTitle>
          </CardHeader>
          <CardContent>
            <BlockedDatePicker
              blockedDates={blockedDates}
              onAdd={handleAddBlockedDate}
              onRemove={handleRemoveBlockedDate}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

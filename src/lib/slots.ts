/**
 * 슬롯 계산 순수 함수
 * 영업시간 + 휴무일 + 기존예약 → 가능 슬롯 배열
 */

export interface ScheduleInfo {
  isOpen: boolean
  openTime: string    // 'HH:MM'
  closeTime: string   // 'HH:MM'
  breakStart?: string | null
  breakEnd?: string | null
}

export interface ExistingReservation {
  startTime: string   // 'HH:MM'
  endTime: string     // 'HH:MM'
  status: string
}

export interface SlotOptions {
  schedule: ScheduleInfo
  serviceDuration: number    // 분
  slotDuration: number       // 업체 슬롯 단위 (분)
  existingReservations: ExistingReservation[]
  isBlockedDate: boolean
  minAdvanceHours: number
  date: string               // 'YYYY-MM-DD'
}

/** 'HH:MM' → 분 */
function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/** 분 → 'HH:MM' */
function toTimeStr(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function calculateSlots(opts: SlotOptions): { time: string; available: boolean }[] {
  const { schedule, serviceDuration, slotDuration, existingReservations, isBlockedDate, minAdvanceHours, date } = opts

  if (!schedule.isOpen || isBlockedDate) return []

  const openMin = toMinutes(schedule.openTime)
  const closeMin = toMinutes(schedule.closeTime)
  const breakStartMin = schedule.breakStart ? toMinutes(schedule.breakStart) : null
  const breakEndMin = schedule.breakEnd ? toMinutes(schedule.breakEnd) : null

  // 현재 시각 기준 minAdvanceHours 이전 슬롯 제외
  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const nowMinutes = date === todayStr
    ? now.getHours() * 60 + now.getMinutes() + minAdvanceHours * 60
    : 0

  const activeReservations = existingReservations.filter(
    (r) => r.status === 'pending' || r.status === 'confirmed'
  )

  const slots: { time: string; available: boolean }[] = []

  for (let start = openMin; start + serviceDuration <= closeMin; start += slotDuration) {
    const end = start + serviceDuration

    // 최소 예약 전 시간 제한
    if (start < nowMinutes) continue

    // 브레이크 타임과 겹치면 제외
    if (breakStartMin !== null && breakEndMin !== null) {
      if (start < breakEndMin && end > breakStartMin) continue
    }

    // 기존 예약과 겹치는지 확인
    const overlapping = activeReservations.some((r) => {
      const rStart = toMinutes(r.startTime)
      const rEnd = toMinutes(r.endTime)
      return start < rEnd && end > rStart
    })

    slots.push({ time: toTimeStr(start), available: !overlapping })
  }

  return slots
}

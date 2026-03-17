import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getBusinessById } from '@/lib/db/queries/businesses'
import { getServiceById } from '@/lib/db/queries/services'
import { createReservation, getReservationsByDate } from '@/lib/db/queries/reservations'
import { getSchedulesByBusiness, getBlockedDatesByBusiness } from '@/lib/db/queries/schedules'
import { calculateSlots } from '@/lib/slots'
import { generateReservationNo } from '@/lib/reservation-no'

const schema = z.object({
  businessId: z.string(),
  serviceId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  customer: z.object({
    name: z.string().min(2),
    phone: z.string().min(10),
    email: z.string().email().optional().or(z.literal('')),
    memo: z.string().optional(),
  }),
})

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { businessId, serviceId, date, startTime, customer } = parsed.data

  const [business, service] = await Promise.all([
    getBusinessById(businessId),
    getServiceById(serviceId),
  ])

  if (!business || !business.isActive)
    return NextResponse.json({ error: '업체를 찾을 수 없습니다' }, { status: 404 })
  if (!service || service.businessId !== businessId || !service.isActive)
    return NextResponse.json({ error: '서비스를 찾을 수 없습니다' }, { status: 404 })

  // 동시성 제어: 슬롯 재검증
  const targetDate = new Date(date)
  const dayOfWeek = targetDate.getDay()

  const [schedules, blockedDates, existingReservations] = await Promise.all([
    getSchedulesByBusiness(businessId),
    getBlockedDatesByBusiness(businessId),
    getReservationsByDate(businessId, date),
  ])

  const schedule = schedules.find((s) => s.dayOfWeek === dayOfWeek)
  if (!schedule) return NextResponse.json({ error: '해당 날짜는 영업일이 아닙니다' }, { status: 400 })

  const isBlockedDate = blockedDates.some((b) => b.date === date)
  const slots = calculateSlots({
    schedule,
    serviceDuration: service.duration,
    slotDuration: business.slotDuration,
    existingReservations,
    isBlockedDate,
    minAdvanceHours: business.minAdvanceHours,
    date,
  })

  const slot = slots.find((s) => s.time === startTime)
  if (!slot || !slot.available) {
    return NextResponse.json({ error: '선택한 시간에 예약이 불가능합니다' }, { status: 409 })
  }

  const endTime = addMinutes(startTime, service.duration)
  const reservationNo = generateReservationNo()

  const reservation = await createReservation(
    {
      name: customer.name,
      phone: customer.phone,
      email: customer.email || undefined,
      memo: customer.memo,
    },
    {
      reservationNo,
      businessId,
      serviceId,
      date,
      startTime,
      endTime,
      customerMemo: customer.memo,
    }
  )

  return NextResponse.json({ reservationNo: reservation.reservationNo }, { status: 201 })
}

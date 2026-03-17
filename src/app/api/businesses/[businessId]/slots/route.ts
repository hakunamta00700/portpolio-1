import { NextRequest, NextResponse } from 'next/server'
import { getBusinessById } from '@/lib/db/queries/businesses'
import { getServiceById } from '@/lib/db/queries/services'
import { getSchedulesByBusiness, getBlockedDatesByBusiness } from '@/lib/db/queries/schedules'
import { getReservationsByDate } from '@/lib/db/queries/reservations'
import { calculateSlots } from '@/lib/slots'

export async function GET(req: NextRequest, { params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params
  const { searchParams } = new URL(req.url)

  const date = searchParams.get('date')
  const serviceId = searchParams.get('service_id')

  if (!date || !serviceId) {
    return NextResponse.json({ error: 'date와 service_id 파라미터가 필요합니다' }, { status: 400 })
  }

  const [business, service] = await Promise.all([
    getBusinessById(businessId),
    getServiceById(serviceId),
  ])

  if (!business || !business.isActive)
    return NextResponse.json({ error: '업체를 찾을 수 없습니다' }, { status: 404 })
  if (!service || service.businessId !== businessId || !service.isActive)
    return NextResponse.json({ error: '서비스를 찾을 수 없습니다' }, { status: 404 })

  const targetDate = new Date(date)
  const dayOfWeek = targetDate.getDay()

  const [schedules, blockedDates, existingReservations] = await Promise.all([
    getSchedulesByBusiness(businessId),
    getBlockedDatesByBusiness(businessId),
    getReservationsByDate(businessId, date),
  ])

  const schedule = schedules.find((s) => s.dayOfWeek === dayOfWeek) ?? {
    isOpen: false,
    openTime: '09:00',
    closeTime: '18:00',
    breakStart: null,
    breakEnd: null,
  }

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

  return NextResponse.json(slots)
}

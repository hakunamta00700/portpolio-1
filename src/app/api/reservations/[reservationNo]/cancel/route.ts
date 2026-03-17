import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getReservationByNo, updateReservationStatus } from '@/lib/db/queries/reservations'
import { getBusinessById } from '@/lib/db/queries/businesses'

const schema = z.object({
  phone: z.string(),
  reason: z.string().optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ reservationNo: string }> }
) {
  const { reservationNo } = await params
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: '입력값이 올바르지 않습니다' }, { status: 400 })

  const row = await getReservationByNo(reservationNo)
  if (!row) return NextResponse.json({ error: '예약을 찾을 수 없습니다' }, { status: 404 })

  if (row.customer.phone !== parsed.data.phone) {
    return NextResponse.json({ error: '전화번호가 일치하지 않습니다' }, { status: 403 })
  }

  const { reservation } = row

  if (!['pending', 'confirmed'].includes(reservation.status)) {
    return NextResponse.json({ error: '취소할 수 없는 예약 상태입니다' }, { status: 400 })
  }

  // 취소 정책 검증
  const business = await getBusinessById(reservation.businessId)
  if (business) {
    const reservationDateTime = new Date(`${reservation.date}T${reservation.startTime}:00`)
    const now = new Date()
    const hoursDiff = (reservationDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursDiff < business.cancelPolicyHours) {
      return NextResponse.json(
        { error: `예약 ${business.cancelPolicyHours}시간 전까지만 취소 가능합니다` },
        { status: 400 }
      )
    }
  }

  await updateReservationStatus(reservation.id, 'cancelled', { cancelReason: parsed.data.reason })
  return NextResponse.json({ ok: true })
}

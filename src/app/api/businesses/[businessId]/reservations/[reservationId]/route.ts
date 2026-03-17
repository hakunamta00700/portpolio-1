import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { getBusinessById } from '@/lib/db/queries/businesses'
import { getReservationById, updateReservationStatus } from '@/lib/db/queries/reservations'
import { sendEmail } from '@/lib/email/send'
import { bookingCancelledHtml } from '@/lib/email/templates/booking-cancelled'

const updateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'no_show', 'cancelled']),
  ownerMemo: z.string().optional(),
  cancelReason: z.string().optional(),
})

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ businessId: string; reservationId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { businessId, reservationId } = await params
  const business = await getBusinessById(businessId)
  if (!business || business.ownerId !== session.user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const row = await getReservationById(reservationId)
  if (!row || row.reservation.businessId !== businessId)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })

  const updated = await updateReservationStatus(reservationId, parsed.data.status, {
    ownerMemo: parsed.data.ownerMemo,
    cancelReason: parsed.data.cancelReason,
  })

  // 취소 시 고객 이메일 알림
  if (parsed.data.status === 'cancelled' && row.customer.email) {
    const d = row.reservation.date
    const dateFormatted = `${d.slice(0, 4)}년 ${parseInt(d.slice(5, 7))}월 ${parseInt(d.slice(8, 10))}일`
    sendEmail({
      to: row.customer.email,
      subject: `[ReserveOS] 예약이 취소되었습니다 - ${row.reservation.reservationNo}`,
      html: bookingCancelledHtml({
        customerName: row.customer.name,
        businessName: business.name,
        serviceName: row.service.name,
        date: dateFormatted,
        startTime: row.reservation.startTime,
        reservationNo: row.reservation.reservationNo,
        cancelReason: parsed.data.cancelReason,
      }),
      reservationId,
      template: 'booking_cancelled',
    }).catch(console.error)
  }

  return NextResponse.json(updated)
}

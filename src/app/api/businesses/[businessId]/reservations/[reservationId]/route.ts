import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { getBusinessById } from '@/lib/db/queries/businesses'
import { getReservationById, updateReservationStatus } from '@/lib/db/queries/reservations'

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
  return NextResponse.json(updated)
}

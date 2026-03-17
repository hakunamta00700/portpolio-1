import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getBusinessById } from '@/lib/db/queries/businesses'
import { getReservationsByBusiness } from '@/lib/db/queries/reservations'

export async function GET(req: NextRequest, { params }: { params: Promise<{ businessId: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { businessId } = await params
  const business = await getBusinessById(businessId)
  if (!business || business.ownerId !== session.user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') ?? undefined
  const status = searchParams.get('status') ?? undefined
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '20')

  const reservations = await getReservationsByBusiness(businessId, { date, status, page, limit })
  return NextResponse.json(reservations)
}

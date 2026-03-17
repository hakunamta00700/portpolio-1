import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getBusinessById } from '@/lib/db/queries/businesses'
import { getReservationStats } from '@/lib/db/queries/reservations'

export async function GET(req: NextRequest, { params }: { params: Promise<{ businessId: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { businessId } = await params
  const business = await getBusinessById(businessId)
  if (!business || business.ownerId !== session.user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from') ?? new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
  const to = searchParams.get('to') ?? new Date().toISOString().slice(0, 10)

  const stats = await getReservationStats(businessId, from, to)
  return NextResponse.json(stats)
}

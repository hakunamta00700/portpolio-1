import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { getBusinessById } from '@/lib/db/queries/businesses'
import { getBlockedDatesByBusiness, addBlockedDate } from '@/lib/db/queries/schedules'

async function checkOwner(businessId: string, userId: string) {
  const business = await getBusinessById(businessId)
  if (!business || business.ownerId !== userId) return null
  return business
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ businessId: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { businessId } = await params
  if (!await checkOwner(businessId, session.user.id))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const dates = await getBlockedDatesByBusiness(businessId)
  return NextResponse.json(dates)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ businessId: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { businessId } = await params
  if (!await checkOwner(businessId, session.user.id))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), reason: z.string().optional() }).safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: '날짜 형식이 올바르지 않습니다' }, { status: 400 })

  const blocked = await addBlockedDate(businessId, parsed.data.date, parsed.data.reason)
  return NextResponse.json(blocked, { status: 201 })
}

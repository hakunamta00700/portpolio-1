import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { getBusinessById } from '@/lib/db/queries/businesses'
import { getSchedulesByBusiness, upsertSchedules } from '@/lib/db/queries/schedules'

const scheduleItemSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  isOpen: z.boolean(),
  openTime: z.string().regex(/^\d{2}:\d{2}$/),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/),
  breakStart: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  breakEnd: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
})

const updateSchema = z.object({
  schedules: z.array(scheduleItemSchema),
})

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

  const schedules = await getSchedulesByBusiness(businessId)
  return NextResponse.json(schedules)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ businessId: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { businessId } = await params
  if (!await checkOwner(businessId, session.user.id))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  await upsertSchedules(businessId, parsed.data.schedules)
  const updated = await getSchedulesByBusiness(businessId)
  return NextResponse.json(updated)
}

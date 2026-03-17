import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { getBusinessById, updateBusiness, deactivateBusiness } from '@/lib/db/queries/businesses'

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  category: z.string().optional(),
  slotDuration: z.number().int().min(15).optional(),
  maxAdvanceDays: z.number().int().min(1).optional(),
  minAdvanceHours: z.number().int().min(0).optional(),
  cancelPolicyHours: z.number().int().min(0).optional(),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ businessId: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { businessId } = await params
  const business = await getBusinessById(businessId)
  if (!business) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (business.ownerId !== session.user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const updated = await updateBusiness(businessId, parsed.data)
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ businessId: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { businessId } = await params
  const business = await getBusinessById(businessId)
  if (!business) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (business.ownerId !== session.user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await deactivateBusiness(businessId)
  return NextResponse.json({ ok: true })
}

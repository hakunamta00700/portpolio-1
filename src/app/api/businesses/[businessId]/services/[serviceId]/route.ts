import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { getBusinessById } from '@/lib/db/queries/businesses'
import { getServiceById, updateService, deleteService } from '@/lib/db/queries/services'

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  duration: z.number().int().min(10).optional(),
  price: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
})

async function checkOwner(businessId: string, userId: string) {
  const business = await getBusinessById(businessId)
  if (!business || business.ownerId !== userId) return null
  return business
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ businessId: string; serviceId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { businessId, serviceId } = await params
  if (!await checkOwner(businessId, session.user.id))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const service = await getServiceById(serviceId)
  if (!service || service.businessId !== businessId)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const updated = await updateService(serviceId, parsed.data)
  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ businessId: string; serviceId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { businessId, serviceId } = await params
  if (!await checkOwner(businessId, session.user.id))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const service = await getServiceById(serviceId)
  if (!service || service.businessId !== businessId)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await deleteService(serviceId)
  return NextResponse.json({ ok: true })
}

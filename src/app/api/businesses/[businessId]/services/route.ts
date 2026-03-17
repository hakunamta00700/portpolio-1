import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { getBusinessById } from '@/lib/db/queries/businesses'
import { getServicesByBusiness, createService } from '@/lib/db/queries/services'

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  duration: z.number().int().min(10),
  price: z.number().int().min(0),
  sortOrder: z.number().int().optional(),
})

async function checkOwner(businessId: string, userId: string) {
  const business = await getBusinessById(businessId)
  if (!business) return null
  if (business.ownerId !== userId) return null
  return business
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ businessId: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { businessId } = await params
  const business = await checkOwner(businessId, session.user.id)
  if (!business) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const services = await getServicesByBusiness(businessId)
  return NextResponse.json(services)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ businessId: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { businessId } = await params
  const business = await checkOwner(businessId, session.user.id)
  if (!business) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const service = await createService({ ...parsed.data, businessId })
  return NextResponse.json(service, { status: 201 })
}

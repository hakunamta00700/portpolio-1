import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getBusinessById } from '@/lib/db/queries/businesses'
import { removeBlockedDate } from '@/lib/db/queries/schedules'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ businessId: string; date: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { businessId, date } = await params
  const business = await getBusinessById(businessId)
  if (!business || business.ownerId !== session.user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await removeBlockedDate(businessId, date)
  return NextResponse.json({ ok: true })
}

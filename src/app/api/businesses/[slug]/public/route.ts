import { NextRequest, NextResponse } from 'next/server'
import { getBusinessBySlug } from '@/lib/db/queries/businesses'
import { getActiveServicesByBusiness } from '@/lib/db/queries/services'
import { getSchedulesByBusiness } from '@/lib/db/queries/schedules'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const business = await getBusinessBySlug(slug)

  if (!business || !business.isActive) {
    return NextResponse.json({ error: '업체를 찾을 수 없습니다' }, { status: 404 })
  }

  const [services, schedules] = await Promise.all([
    getActiveServicesByBusiness(business.id),
    getSchedulesByBusiness(business.id),
  ])

  return NextResponse.json({ business, services, schedules })
}

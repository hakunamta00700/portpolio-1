import { NextRequest, NextResponse } from 'next/server'
import { getReservationByNo } from '@/lib/db/queries/reservations'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const reservationNo = searchParams.get('reservation_no')
  const phone = searchParams.get('phone')

  if (!reservationNo || !phone) {
    return NextResponse.json({ error: '예약번호와 전화번호가 필요합니다' }, { status: 400 })
  }

  const row = await getReservationByNo(reservationNo)

  if (!row) {
    return NextResponse.json({ error: '예약을 찾을 수 없습니다' }, { status: 404 })
  }

  if (row.customer.phone !== phone) {
    return NextResponse.json({ error: '전화번호가 일치하지 않습니다' }, { status: 404 })
  }

  return NextResponse.json(row)
}

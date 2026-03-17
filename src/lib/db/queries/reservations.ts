import { getEM } from '@/lib/db'
import {
  ReservationSchema, CustomerSchema, ServiceSchema,
  type Reservation, type Customer, type Service,
  type NewReservation, type NewCustomer,
} from '@/lib/db/entities'

type ReservationRow = { reservation: Reservation; customer: Customer; service: Service }

async function attachRelations(em: Awaited<ReturnType<typeof getEM>>, rows: Reservation[]): Promise<ReservationRow[]> {
  if (rows.length === 0) return []
  const customerIds = [...new Set(rows.map(r => r.customerId))]
  const serviceIds  = [...new Set(rows.map(r => r.serviceId))]
  const [customers, services] = await Promise.all([
    em.find(CustomerSchema, { id: { $in: customerIds } }),
    em.find(ServiceSchema,  { id: { $in: serviceIds }  }),
  ])
  const customerMap = Object.fromEntries(customers.map(c => [c.id, c]))
  const serviceMap  = Object.fromEntries(services.map(s => [s.id, s]))
  return rows.map(r => ({
    reservation: r,
    customer: customerMap[r.customerId],
    service:  serviceMap[r.serviceId],
  }))
}

export async function getReservationsByBusiness(
  businessId: string,
  options?: { date?: string; status?: string; page?: number; limit?: number }
): Promise<ReservationRow[]> {
  const em = await getEM()
  const { page = 1, limit = 20 } = options ?? {}

  const where: Record<string, unknown> = { businessId }
  if (options?.date)   where.date   = options.date
  if (options?.status) where.status = options.status

  const rows = await em.find(ReservationSchema, where, {
    orderBy: { date: 'DESC', startTime: 'DESC' },
    limit,
    offset: (page - 1) * limit,
  })
  return attachRelations(em, rows)
}

export async function getReservationById(id: string): Promise<ReservationRow | null> {
  const em = await getEM()
  const reservation = await em.findOne(ReservationSchema, { id })
  if (!reservation) return null
  const [rows] = await Promise.all([attachRelations(em, [reservation])])
  return rows[0]
}

export async function getReservationByNo(reservationNo: string): Promise<ReservationRow | null> {
  const em = await getEM()
  const reservation = await em.findOne(ReservationSchema, { reservationNo })
  if (!reservation) return null
  const rows = await attachRelations(em, [reservation])
  return rows[0]
}

export async function getReservationsByDate(businessId: string, date: string): Promise<Reservation[]> {
  const em = await getEM()
  return em.find(ReservationSchema, {
    businessId,
    date,
    status: { $in: ['pending', 'confirmed'] },
  })
}

export async function createReservation(
  customerData: NewCustomer,
  reservationData: Omit<NewReservation, 'customerId'>
): Promise<Reservation> {
  const em = await getEM()
  let customer = await em.findOne(CustomerSchema, { phone: customerData.phone, name: customerData.name })
  if (!customer) {
    customer = em.create(CustomerSchema, customerData)
    await em.persistAndFlush(customer)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reservation = em.create(ReservationSchema, { ...reservationData, customerId: customer.id } as any)
  await em.persistAndFlush(reservation)
  return reservation
}

export async function updateReservationStatus(
  id: string,
  status: string,
  extra?: { ownerMemo?: string; cancelReason?: string }
): Promise<Reservation | null> {
  const em = await getEM()
  const reservation = await em.findOne(ReservationSchema, { id })
  if (!reservation) return null
  em.assign(reservation, {
    status,
    ...(status === 'cancelled' ? { cancelledAt: new Date().toISOString() } : {}),
    ...(extra?.ownerMemo    !== undefined ? { ownerMemo:    extra.ownerMemo    } : {}),
    ...(extra?.cancelReason !== undefined ? { cancelReason: extra.cancelReason } : {}),
  })
  await em.flush()
  return reservation
}

export async function getReservationStats(businessId: string, from: string, to: string) {
  const em = await getEM()
  const all = await em.find(ReservationSchema, { businessId })
  const rows = all.filter(r => r.date >= from && r.date <= to)

  const serviceIds = [...new Set(rows.map(r => r.serviceId))]
  const services   = await em.find(ServiceSchema, { id: { $in: serviceIds } })
  const serviceMap = Object.fromEntries(services.map(s => [s.id, s]))

  const total     = rows.length
  const confirmed = rows.filter(r => ['confirmed', 'completed'].includes(r.status)).length
  const cancelled = rows.filter(r => r.status === 'cancelled').length
  const revenue   = rows
    .filter(r => r.status === 'completed')
    .reduce((sum, r) => sum + (serviceMap[r.serviceId]?.price ?? 0), 0)

  const serviceCount: Record<string, { name: string; count: number }> = {}
  for (const r of rows) {
    const sid = r.serviceId
    if (!serviceCount[sid]) serviceCount[sid] = { name: serviceMap[sid]?.name ?? '', count: 0 }
    serviceCount[sid].count++
  }
  const popularServices = Object.values(serviceCount).sort((a, b) => b.count - a.count).slice(0, 5)

  return { total, confirmed, cancelled, revenue, popularServices }
}

import { eq, and, desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { reservations, customers, services, type NewReservation, type NewCustomer } from '@/lib/db/schema'

export async function getReservationsByBusiness(
  businessId: string,
  options?: { date?: string; status?: string; page?: number; limit?: number }
) {
  const { page = 1, limit = 20 } = options ?? {}
  const offset = (page - 1) * limit

  let rows = await db
    .select({
      reservation: reservations,
      customer: customers,
      service: services,
    })
    .from(reservations)
    .innerJoin(customers, eq(reservations.customerId, customers.id))
    .innerJoin(services, eq(reservations.serviceId, services.id))
    .where(eq(reservations.businessId, businessId))
    .orderBy(desc(reservations.date), desc(reservations.startTime))

  if (options?.date) {
    rows = rows.filter((r) => r.reservation.date === options.date)
  }
  if (options?.status) {
    rows = rows.filter((r) => r.reservation.status === options.status)
  }

  return rows.slice(offset, offset + limit)
}

export async function getReservationById(id: string) {
  return db
    .select({
      reservation: reservations,
      customer: customers,
      service: services,
    })
    .from(reservations)
    .innerJoin(customers, eq(reservations.customerId, customers.id))
    .innerJoin(services, eq(reservations.serviceId, services.id))
    .where(eq(reservations.id, id))
    .limit(1)
    .then((r) => r[0] ?? null)
}

export async function getReservationByNo(reservationNo: string) {
  return db
    .select({
      reservation: reservations,
      customer: customers,
      service: services,
    })
    .from(reservations)
    .innerJoin(customers, eq(reservations.customerId, customers.id))
    .innerJoin(services, eq(reservations.serviceId, services.id))
    .where(eq(reservations.reservationNo, reservationNo))
    .limit(1)
    .then((r) => r[0] ?? null)
}

export async function getReservationsByDate(businessId: string, date: string) {
  return db
    .select()
    .from(reservations)
    .where(and(eq(reservations.businessId, businessId), eq(reservations.date, date)))
    .then((rows) => rows.filter((r) => r.status === 'pending' || r.status === 'confirmed'))
}

export async function createReservation(
  customerData: NewCustomer,
  reservationData: Omit<NewReservation, 'customerId'>
) {
  // upsert customer by phone
  let customer = await db
    .select()
    .from(customers)
    .where(and(eq(customers.phone, customerData.phone), eq(customers.name, customerData.name)))
    .limit(1)
    .then((r) => r[0] ?? null)

  if (!customer) {
    customer = await db.insert(customers).values(customerData).returning().then((r) => r[0])
  }

  return db
    .insert(reservations)
    .values({ ...reservationData, customerId: customer.id })
    .returning()
    .then((r) => r[0])
}

export async function updateReservationStatus(
  id: string,
  status: string,
  extra?: { ownerMemo?: string; cancelReason?: string }
) {
  const now = new Date().toISOString()
  return db
    .update(reservations)
    .set({
      status,
      updatedAt: now,
      ...(status === 'cancelled' ? { cancelledAt: now } : {}),
      ...(extra?.ownerMemo !== undefined ? { ownerMemo: extra.ownerMemo } : {}),
      ...(extra?.cancelReason !== undefined ? { cancelReason: extra.cancelReason } : {}),
    })
    .where(eq(reservations.id, id))
    .returning()
    .then((r) => r[0])
}

export async function getReservationStats(businessId: string, from: string, to: string) {
  const rows = await db
    .select({
      reservation: reservations,
      service: services,
    })
    .from(reservations)
    .innerJoin(services, eq(reservations.serviceId, services.id))
    .where(eq(reservations.businessId, businessId))
    .then((rows) =>
      rows.filter((r) => r.reservation.date >= from && r.reservation.date <= to)
    )

  const total = rows.length
  const confirmed = rows.filter((r) => ['confirmed', 'completed'].includes(r.reservation.status)).length
  const cancelled = rows.filter((r) => r.reservation.status === 'cancelled').length
  const revenue = rows
    .filter((r) => r.reservation.status === 'completed')
    .reduce((sum, r) => sum + r.service.price, 0)

  const serviceCount: Record<string, { name: string; count: number }> = {}
  for (const r of rows) {
    const sid = r.service.id
    if (!serviceCount[sid]) serviceCount[sid] = { name: r.service.name, count: 0 }
    serviceCount[sid].count++
  }
  const popularServices = Object.values(serviceCount).sort((a, b) => b.count - a.count).slice(0, 5)

  return { total, confirmed, cancelled, revenue, popularServices }
}

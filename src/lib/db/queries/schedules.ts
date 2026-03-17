import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { businessSchedules, blockedDates } from '@/lib/db/schema'

export async function getSchedulesByBusiness(businessId: string) {
  return db
    .select()
    .from(businessSchedules)
    .where(eq(businessSchedules.businessId, businessId))
    .orderBy(businessSchedules.dayOfWeek)
}

export async function upsertSchedules(
  businessId: string,
  schedules: Array<{
    dayOfWeek: number
    isOpen: boolean
    openTime: string
    closeTime: string
    breakStart?: string | null
    breakEnd?: string | null
  }>
) {
  const now = new Date().toISOString()
  for (const s of schedules) {
    const existing = await db
      .select()
      .from(businessSchedules)
      .where(eq(businessSchedules.businessId, businessId))
      .then((rows) => rows.find((r) => r.dayOfWeek === s.dayOfWeek))

    if (existing) {
      await db
        .update(businessSchedules)
        .set({ ...s, updatedAt: now })
        .where(eq(businessSchedules.id, existing.id))
    } else {
      await db.insert(businessSchedules).values({ businessId, ...s })
    }
  }
}

export async function getBlockedDatesByBusiness(businessId: string) {
  return db
    .select()
    .from(blockedDates)
    .where(eq(blockedDates.businessId, businessId))
}

export async function addBlockedDate(businessId: string, date: string, reason?: string) {
  return db
    .insert(blockedDates)
    .values({ businessId, date, reason })
    .returning()
    .then((r) => r[0])
}

export async function removeBlockedDate(businessId: string, date: string) {
  const rows = await db
    .select()
    .from(blockedDates)
    .where(eq(blockedDates.businessId, businessId))
    .then((rows) => rows.filter((r) => r.date === date))

  for (const row of rows) {
    await db.delete(blockedDates).where(eq(blockedDates.id, row.id))
  }
}

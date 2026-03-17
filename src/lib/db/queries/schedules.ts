import { getEM } from '@/lib/db'
import { BusinessScheduleSchema, BlockedDateSchema, type BusinessSchedule, type BlockedDate } from '@/lib/db/entities'

export async function getSchedulesByBusiness(businessId: string): Promise<BusinessSchedule[]> {
  const em = await getEM()
  return em.find(BusinessScheduleSchema, { businessId }, { orderBy: { dayOfWeek: 'ASC' } })
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
): Promise<void> {
  const em = await getEM()
  for (const s of schedules) {
    const existing = await em.findOne(BusinessScheduleSchema, { businessId, dayOfWeek: s.dayOfWeek })
    if (existing) {
      em.assign(existing, s)
    } else {
      em.persist(em.create(BusinessScheduleSchema, { businessId, ...s }))
    }
  }
  await em.flush()
}

export async function getBlockedDatesByBusiness(businessId: string): Promise<BlockedDate[]> {
  const em = await getEM()
  return em.find(BlockedDateSchema, { businessId })
}

export async function addBlockedDate(businessId: string, date: string, reason?: string): Promise<BlockedDate> {
  const em = await getEM()
  const blocked = em.create(BlockedDateSchema, { businessId, date, reason: reason ?? null })
  await em.persistAndFlush(blocked)
  return blocked
}

export async function removeBlockedDate(businessId: string, date: string): Promise<void> {
  const em = await getEM()
  const rows = await em.find(BlockedDateSchema, { businessId, date })
  await em.removeAndFlush(rows)
}

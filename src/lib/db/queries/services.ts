import { eq, asc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { services, type NewService } from '@/lib/db/schema'

export async function getServicesByBusiness(businessId: string) {
  return db
    .select()
    .from(services)
    .where(eq(services.businessId, businessId))
    .orderBy(asc(services.sortOrder))
}

export async function getActiveServicesByBusiness(businessId: string) {
  return db
    .select()
    .from(services)
    .where(eq(services.businessId, businessId))
    .orderBy(asc(services.sortOrder))
    .then((rows) => rows.filter((s) => s.isActive))
}

export async function getServiceById(id: string) {
  return db.select().from(services).where(eq(services.id, id)).limit(1).then((r) => r[0] ?? null)
}

export async function createService(data: NewService) {
  return db.insert(services).values(data).returning().then((r) => r[0])
}

export async function updateService(id: string, data: Partial<NewService>) {
  return db
    .update(services)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(services.id, id))
    .returning()
    .then((r) => r[0])
}

export async function deleteService(id: string) {
  return db.delete(services).where(eq(services.id, id))
}

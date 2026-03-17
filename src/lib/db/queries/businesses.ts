import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { businesses, type NewBusiness } from '@/lib/db/schema'

export async function getBusinessesByOwner(ownerId: string) {
  return db.select().from(businesses).where(eq(businesses.ownerId, ownerId))
}

export async function getBusinessById(id: string) {
  return db.select().from(businesses).where(eq(businesses.id, id)).limit(1).then((r) => r[0] ?? null)
}

export async function getBusinessBySlug(slug: string) {
  return db.select().from(businesses).where(eq(businesses.slug, slug)).limit(1).then((r) => r[0] ?? null)
}

export async function createBusiness(data: NewBusiness) {
  return db.insert(businesses).values(data).returning().then((r) => r[0])
}

export async function updateBusiness(id: string, data: Partial<NewBusiness>) {
  return db
    .update(businesses)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(businesses.id, id))
    .returning()
    .then((r) => r[0])
}

export async function deactivateBusiness(id: string) {
  return db
    .update(businesses)
    .set({ isActive: false, updatedAt: new Date().toISOString() })
    .where(eq(businesses.id, id))
    .returning()
    .then((r) => r[0])
}

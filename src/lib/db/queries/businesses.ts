import { getEM } from '@/lib/db'
import { BusinessSchema, type Business, type NewBusiness } from '@/lib/db/entities'

export async function getBusinessesByOwner(ownerId: string): Promise<Business[]> {
  const em = await getEM()
  return em.find(BusinessSchema, { ownerId })
}

export async function getBusinessById(id: string): Promise<Business | null> {
  const em = await getEM()
  return em.findOne(BusinessSchema, { id })
}

export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  const em = await getEM()
  return em.findOne(BusinessSchema, { slug })
}

export async function createBusiness(data: NewBusiness): Promise<Business> {
  const em = await getEM()
  const business = em.create(BusinessSchema, data)
  await em.persistAndFlush(business)
  return business
}

export async function updateBusiness(id: string, data: Partial<NewBusiness>): Promise<Business | null> {
  const em = await getEM()
  const business = await em.findOne(BusinessSchema, { id })
  if (!business) return null
  em.assign(business, data)
  await em.flush()
  return business
}

export async function deactivateBusiness(id: string): Promise<Business | null> {
  const em = await getEM()
  const business = await em.findOne(BusinessSchema, { id })
  if (!business) return null
  em.assign(business, { isActive: false })
  await em.flush()
  return business
}

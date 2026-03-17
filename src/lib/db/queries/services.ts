import { getEM } from '@/lib/db'
import { ServiceSchema, type Service, type NewService } from '@/lib/db/entities'

export async function getServicesByBusiness(businessId: string): Promise<Service[]> {
  const em = await getEM()
  return em.find(ServiceSchema, { businessId }, { orderBy: { sortOrder: 'ASC' } })
}

export async function getActiveServicesByBusiness(businessId: string): Promise<Service[]> {
  const em = await getEM()
  return em.find(ServiceSchema, { businessId, isActive: true }, { orderBy: { sortOrder: 'ASC' } })
}

export async function getServiceById(id: string): Promise<Service | null> {
  const em = await getEM()
  return em.findOne(ServiceSchema, { id })
}

export async function createService(data: NewService): Promise<Service> {
  const em = await getEM()
  const service = em.create(ServiceSchema, data)
  await em.persistAndFlush(service)
  return service
}

export async function updateService(id: string, data: Partial<NewService>): Promise<Service | null> {
  const em = await getEM()
  const service = await em.findOne(ServiceSchema, { id })
  if (!service) return null
  em.assign(service, data)
  await em.flush()
  return service
}

export async function deleteService(id: string): Promise<void> {
  const em = await getEM()
  const service = await em.findOne(ServiceSchema, { id })
  if (service) await em.removeAndFlush(service)
}

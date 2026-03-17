import { getEM } from '@/lib/db'
import { UserSchema, type User, type NewUser } from '@/lib/db/entities'

export async function getUserByEmail(email: string): Promise<User | null> {
  const em = await getEM()
  return em.findOne(UserSchema, { email })
}

export async function getUserById(id: string): Promise<User | null> {
  const em = await getEM()
  return em.findOne(UserSchema, { id })
}

export async function createUser(data: NewUser): Promise<User> {
  const em = await getEM()
  const user = em.create(UserSchema, data)
  await em.persistAndFlush(user)
  return user
}

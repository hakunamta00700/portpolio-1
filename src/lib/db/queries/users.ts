import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users, type NewUser } from '@/lib/db/schema'

export async function getUserByEmail(email: string) {
  return db.select().from(users).where(eq(users.email, email)).limit(1).then((r) => r[0] ?? null)
}

export async function getUserById(id: string) {
  return db.select().from(users).where(eq(users.id, id)).limit(1).then((r) => r[0] ?? null)
}

export async function createUser(data: NewUser) {
  return db.insert(users).values(data).returning().then((r) => r[0])
}

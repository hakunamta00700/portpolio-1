import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { getUserByEmail, createUser } from '@/lib/db/queries/users'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: '입력값이 올바르지 않습니다' }, { status: 400 })
  }

  const { name, email, phone, password } = parsed.data

  const existing = await getUserByEmail(email)
  if (existing) {
    return NextResponse.json({ error: '이미 사용 중인 이메일입니다' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await createUser({ name, email, phone, passwordHash })

  return NextResponse.json({ id: user.id }, { status: 201 })
}

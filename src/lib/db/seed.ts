import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())

import { db } from './index'
import { users, businesses, businessSchedules, services } from './schema'
import bcrypt from 'bcryptjs'

async function seed() {
  console.log('🌱 Seeding database...')

  const [user] = await db.insert(users).values({
    email: 'demo@reserveos.kr',
    passwordHash: await bcrypt.hash('demo1234', 10),
    name: '홍길동',
    phone: '010-1234-5678',
  }).returning()

  console.log('✅ User created:', user.email)

  const [business] = await db.insert(businesses).values({
    ownerId: user.id,
    slug: 'demo-hairshop',
    name: '홍길동 헤어샵',
    description: '청담동 감성 헤어샵',
    address: '서울시 강남구 청담동 123',
    phone: '02-1234-5678',
    category: 'hairshop',
    slotDuration: 30,
  }).returning()

  console.log('✅ Business created:', business.slug)

  await db.insert(services).values([
    { businessId: business.id, name: '커트', duration: 30, price: 25000, sortOrder: 1 },
    { businessId: business.id, name: '펌', duration: 90, price: 80000, sortOrder: 2 },
    { businessId: business.id, name: '염색', duration: 60, price: 60000, sortOrder: 3 },
  ])

  console.log('✅ Services created')

  // 월~토 영업 (일 휴무), 수요일 점심 휴식
  await db.insert(businessSchedules).values(
    [0, 1, 2, 3, 4, 5, 6].map(day => ({
      businessId: business.id,
      dayOfWeek: day,
      isOpen: day !== 0,
      openTime: '09:00',
      closeTime: '18:00',
      breakStart: day === 3 ? '12:00' : null,
      breakEnd:   day === 3 ? '13:00' : null,
    }))
  )

  console.log('✅ Schedules created')
  console.log('🎉 Seed complete!')
  console.log('')
  console.log('  로그인 계정:')
  console.log('  Email   : demo@reserveos.kr')
  console.log('  Password: demo1234')
  console.log('  예약 페이지: http://localhost:3001/demo-hairshop')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})

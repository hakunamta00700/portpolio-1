# 개발환경 설정 가이드

## 1. 사전 요구사항

Docker 불필요. Node.js만 있으면 됩니다.

| 도구 | 버전 | 설치 확인 |
|------|------|-----------|
| Node.js | 20.x LTS | `node -v` |
| Git | 최신 | `git -v` |

---

## 2. 프로젝트 초기 설정

### 2.1 프로젝트 생성

```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

### 2.2 주요 패키지 설치

```bash
# UI 컴포넌트
npx shadcn@latest init
npx shadcn@latest add button card calendar input label select textarea badge

# ORM + DB 드라이버
npm install drizzle-orm better-sqlite3 postgres
npm install @types/better-sqlite3 --save-dev
npm install drizzle-kit --save-dev    # 마이그레이션 CLI

# Supabase 클라이언트 (운영환경 Storage/직접 쿼리용)
npm install @supabase/supabase-js

# 인증
npm install next-auth bcryptjs
npm install @types/bcryptjs --save-dev

# 유틸
npm install date-fns
npm install zod
npm install react-hook-form @hookform/resolvers

# 이메일
npm install resend

# 아이콘
npm install lucide-react
```

---

## 3. SQLite 개발환경 설정

### 3.1 `.env.local` (개발환경 환경변수)

```bash
# .env.local - Git에 커밋하지 않음!

# SQLite 파일 경로 (프로젝트 루트 기준)
DATABASE_URL=file:./dev.db

# 인증 (NextAuth.js)
NEXTAUTH_SECRET=dev-super-secret-key-change-in-production
NEXTAUTH_URL=http://localhost:3000

# 앱 URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (개발 시 미사용 - 운영환경에서만 설정)
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
# SUPABASE_SERVICE_ROLE_KEY=

# 이메일 (개발 시 Mailtrap 등 테스트 서버 사용)
RESEND_API_KEY=re_dev_dummy_key
SMTP_FROM=noreply@reserveos.kr
```

### 3.2 `.env.example` (Git에 커밋)

```bash
# 개발환경 (SQLite)
DATABASE_URL=file:./dev.db

# 운영환경 (Supabase PostgreSQL) - 배포 시 아래로 교체
# DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres

# 인증
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# 앱 URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (운영환경)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# 이메일
RESEND_API_KEY=
SMTP_FROM=noreply@reserveos.kr
```

---

## 4. Drizzle ORM 설정

Drizzle ORM은 **단일 스키마 파일**로 SQLite(개발)와 PostgreSQL(운영) 모두를 지원합니다.
환경별로 드라이버만 교체하면 쿼리 코드는 그대로 재사용됩니다.

### 4.1 `drizzle.config.ts`

```typescript
// drizzle.config.ts (프로젝트 루트)
import type { Config } from 'drizzle-kit'

const isSQLite = process.env.DATABASE_URL?.startsWith('file:')

export default {
  schema: './src/lib/db/schema.ts',
  out: './src/lib/db/migrations',
  dialect: isSQLite ? 'sqlite' : 'postgresql',
  dbCredentials: isSQLite
    ? { url: process.env.DATABASE_URL! }
    : { url: process.env.DATABASE_URL! },
} satisfies Config
```

### 4.2 `src/lib/db/schema.ts` (공통 스키마)

SQLite와 PostgreSQL의 타입 차이를 Drizzle이 처리합니다.
스키마는 하나로 공유하되, 빌드 시 환경에 맞는 드라이버가 선택됩니다.

```typescript
// src/lib/db/schema.ts
import { sql } from 'drizzle-orm'
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { pgTable, uuid, varchar, text as pgText, boolean, integer as pgInt, timestamp, time, date, smallint } from 'drizzle-orm/pg-core'

// 환경에 따라 테이블 정의 선택
const isSQLite = process.env.DATABASE_URL?.startsWith('file:')

// ─── SQLite 스키마 (개발환경) ───────────────────────────────
export const usersSQLite = sqliteTable('users', {
  id:           text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email:        text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  name:         text('name').notNull(),
  phone:        text('phone'),
  role:         text('role').notNull().default('owner'),
  createdAt:    text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt:    text('updated_at').notNull().default(sql`(datetime('now'))`),
})

export const businessesSQLite = sqliteTable('businesses', {
  id:               text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  ownerId:          text('owner_id').notNull().references(() => usersSQLite.id),
  slug:             text('slug').notNull().unique(),
  name:             text('name').notNull(),
  description:      text('description'),
  address:          text('address'),
  phone:            text('phone'),
  logoUrl:          text('logo_url'),
  coverImageUrl:    text('cover_image_url'),
  category:         text('category'),
  isActive:         integer('is_active', { mode: 'boolean' }).notNull().default(true),
  slotDuration:     integer('slot_duration').notNull().default(30),
  maxAdvanceDays:   integer('max_advance_days').notNull().default(30),
  minAdvanceHours:  integer('min_advance_hours').notNull().default(1),
  cancelPolicyHours: integer('cancel_policy_hours').notNull().default(24),
  createdAt:        text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt:        text('updated_at').notNull().default(sql`(datetime('now'))`),
})

// services, schedules, reservations 등 동일한 패턴으로 정의
// (전체 스키마는 실제 구현 시 작성)

// ─── PostgreSQL 스키마 (운영환경) - Supabase ────────────────
// drizzle-kit generate 시 자동 생성, 별도 파일로 분리 권장
// src/lib/db/schema.pg.ts 로 분리하여 관리
```

> **실용적 접근**: 스키마 파일을 두 벌 관리하는 대신,
> 개발 초기에는 SQLite 스키마만 작성하고, 운영 배포 전에 PostgreSQL 스키마를 생성합니다.
> `drizzle-kit generate`가 마이그레이션 SQL을 자동 생성해줍니다.

### 4.3 `src/lib/db/index.ts` (DB 클라이언트 - 서버사이드 전용)

> **주의**: 이 파일은 `'use client'` 컴포넌트에서 절대 import하지 마세요.
> `SUPABASE_SERVICE_ROLE_KEY`가 클라이언트 번들에 노출됩니다.

```typescript
// src/lib/db/index.ts
import { drizzle as drizzleSQLite } from 'drizzle-orm/better-sqlite3'
import { drizzle as drizzlePG } from 'drizzle-orm/postgres-js'
import Database from 'better-sqlite3'
import postgres from 'postgres'
import * as sqliteSchema from './schema'

const isSQLite = process.env.DATABASE_URL?.startsWith('file:')

function createDb() {
  if (isSQLite) {
    // 개발환경: SQLite 파일 DB
    const sqlite = new Database(process.env.DATABASE_URL!.replace('file:', ''))
    return drizzleSQLite(sqlite, { schema: sqliteSchema })
  } else {
    // 운영환경: Supabase PostgreSQL (연결 풀링)
    const client = postgres(process.env.DATABASE_URL!, { max: 1 })
    return drizzlePG(client, { schema: sqliteSchema })
  }
}

// 싱글톤 (서버리스 환경에서 연결 재사용)
declare global {
  // eslint-disable-next-line no-var
  var _db: ReturnType<typeof createDb> | undefined
}

export const db = globalThis._db ?? createDb()
if (process.env.NODE_ENV !== 'production') globalThis._db = db
```

### 4.4 쿼리 예시

Drizzle은 SQLite/PostgreSQL 동일한 API를 사용합니다.

```typescript
// src/lib/db/queries/reservations.ts
import { db } from '../index'
import { reservations, services, customers } from '../schema'
import { eq, and } from 'drizzle-orm'

export async function getReservationsByDate(businessId: string, date: string) {
  return db
    .select()
    .from(reservations)
    .innerJoin(services, eq(reservations.serviceId, services.id))
    .innerJoin(customers, eq(reservations.customerId, customers.id))
    .where(
      and(
        eq(reservations.businessId, businessId),
        eq(reservations.date, date)
      )
    )
    .orderBy(reservations.startTime)
}
```

---

## 5. 마이그레이션

### 5.1 초기 테이블 생성 (최초 1회)

```bash
# 스키마 변경사항으로 마이그레이션 파일 생성
npx drizzle-kit generate

# 마이그레이션 적용 (dev.db 파일 생성 및 테이블 초기화)
npx drizzle-kit migrate
```

### 5.2 스키마 변경 시

```bash
# 1. schema.ts 파일 수정
# 2. 마이그레이션 파일 생성
npx drizzle-kit generate

# 3. 적용
npx drizzle-kit migrate
```

### 5.3 Drizzle Studio (DB GUI)

```bash
# 브라우저 기반 DB 뷰어 실행 (TablePlus 대체)
npx drizzle-kit studio
# → https://local.drizzle.studio 에서 확인
```

### 5.4 `package.json` scripts 추가

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "db:seed": "npx tsx src/lib/db/seed.ts"
  }
}
```

---

## 6. 개발 시작 명령어

### 6.1 최초 설정

```bash
# 1. 저장소 클론
git clone <repository-url>
cd portpolio_1

# 2. 의존성 설치
npm install

# 3. 환경변수 파일 생성
cp .env.example .env.local
# DATABASE_URL=file:./dev.db 확인

# 4. DB 테이블 생성 (dev.db 자동 생성)
npm run db:migrate

# 5. 개발 서버 실행
npm run dev
# → http://localhost:3000
```

### 6.2 일반 개발 시작

```bash
npm run dev
```

끝. Docker, 데몬 프로세스 없음.

### 6.3 DB 초기화

```bash
# dev.db 파일 삭제 후 재생성
rm dev.db
npm run db:migrate
npm run db:seed   # 테스트 데이터 삽입 (선택)
```

---

## 7. Seed 데이터

```typescript
// src/lib/db/seed.ts
import { db } from './index'
import { users, businesses, businessSchedules, services } from './schema'
import bcrypt from 'bcryptjs'

async function seed() {
  console.log('Seeding...')

  const [user] = await db.insert(users).values({
    email: 'demo@reserveos.kr',
    passwordHash: await bcrypt.hash('demo1234', 10),
    name: '홍길동',
  }).returning()

  const [business] = await db.insert(businesses).values({
    ownerId: user.id,
    slug: 'demo-hairshop',
    name: '홍길동 헤어샵',
    category: 'hairshop',
    slotDuration: 30,
  }).returning()

  await db.insert(services).values([
    { businessId: business.id, name: '커트', duration: 30, price: 25000 },
    { businessId: business.id, name: '펌', duration: 90, price: 80000 },
  ])

  // 월~토 영업 (일 휴무)
  await db.insert(businessSchedules).values(
    [0,1,2,3,4,5,6].map(day => ({
      businessId: business.id,
      dayOfWeek: day,
      isOpen: day !== 0,
      openTime: '09:00',
      closeTime: '18:00',
    }))
  )

  console.log('Seed 완료!')
  process.exit(0)
}

seed().catch(console.error)
```

---

## 8. 개발 도구

| 도구 | 용도 |
|------|------|
| Drizzle Studio (`npm run db:studio`) | SQLite/PostgreSQL GUI - 별도 설치 불필요 |
| Postman / Insomnia | API 테스트 |
| React DevTools | React 컴포넌트 디버깅 |
| Mailtrap | 개발환경 이메일 테스트 (실제 발송 없이 확인) |

---

## 9. .gitignore 추가 항목

```
# 환경변수
.env
.env.local
.env.*.local

# SQLite DB 파일 (개발용)
dev.db
dev.db-shm
dev.db-wal

# Next.js
.next/
out/

# Node
node_modules/

# OS
.DS_Store
Thumbs.db
```

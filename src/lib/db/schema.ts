import { sql } from 'drizzle-orm'
import {
  sqliteTable,
  text,
  integer,
} from 'drizzle-orm/sqlite-core'

// ─── users (사장님 계정) ────────────────────────────────────────
export const users = sqliteTable('users', {
  id:           text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email:        text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  name:         text('name').notNull(),
  phone:        text('phone'),
  role:         text('role').notNull().default('owner'),
  createdAt:    text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt:    text('updated_at').notNull().default(sql`(datetime('now'))`),
})

// ─── businesses (업체) ─────────────────────────────────────────
export const businesses = sqliteTable('businesses', {
  id:                text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  ownerId:           text('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  slug:              text('slug').notNull().unique(),
  name:              text('name').notNull(),
  description:       text('description'),
  address:           text('address'),
  phone:             text('phone'),
  logoUrl:           text('logo_url'),
  coverImageUrl:     text('cover_image_url'),
  category:          text('category'),  // cafe | restaurant | hairshop | nail | skincare | other
  isActive:          integer('is_active', { mode: 'boolean' }).notNull().default(true),
  slotDuration:      integer('slot_duration').notNull().default(30),   // 분 단위
  maxAdvanceDays:    integer('max_advance_days').notNull().default(30),
  minAdvanceHours:   integer('min_advance_hours').notNull().default(1),
  cancelPolicyHours: integer('cancel_policy_hours').notNull().default(24),
  createdAt:         text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt:         text('updated_at').notNull().default(sql`(datetime('now'))`),
})

// ─── services (서비스/메뉴) ────────────────────────────────────
export const services = sqliteTable('services', {
  id:          text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  businessId:  text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  name:        text('name').notNull(),
  description: text('description'),
  duration:    integer('duration').notNull(),  // 소요시간 (분)
  price:       integer('price').notNull().default(0),
  isActive:    integer('is_active', { mode: 'boolean' }).notNull().default(true),
  sortOrder:   integer('sort_order').notNull().default(0),
  createdAt:   text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt:   text('updated_at').notNull().default(sql`(datetime('now'))`),
})

// ─── business_schedules (정기 영업시간) ────────────────────────
export const businessSchedules = sqliteTable('business_schedules', {
  id:          text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  businessId:  text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  dayOfWeek:   integer('day_of_week').notNull(),  // 0:일 1:월 ... 6:토
  isOpen:      integer('is_open', { mode: 'boolean' }).notNull().default(true),
  openTime:    text('open_time').notNull().default('09:00'),   // 'HH:MM'
  closeTime:   text('close_time').notNull().default('18:00'),
  breakStart:  text('break_start'),
  breakEnd:    text('break_end'),
  createdAt:   text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt:   text('updated_at').notNull().default(sql`(datetime('now'))`),
})

// ─── blocked_dates (휴무일) ────────────────────────────────────
export const blockedDates = sqliteTable('blocked_dates', {
  id:          text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  businessId:  text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  date:        text('date').notNull(),  // 'YYYY-MM-DD'
  reason:      text('reason'),
  createdAt:   text('created_at').notNull().default(sql`(datetime('now'))`),
})

// ─── customers (예약 고객) ─────────────────────────────────────
export const customers = sqliteTable('customers', {
  id:        text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name:      text('name').notNull(),
  phone:     text('phone').notNull(),
  email:     text('email'),
  memo:      text('memo'),  // 사장님 메모
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
})

// ─── reservations (예약) ───────────────────────────────────────
export const reservations = sqliteTable('reservations', {
  id:            text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  reservationNo: text('reservation_no').notNull().unique(),
  businessId:    text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  serviceId:     text('service_id').notNull().references(() => services.id),
  customerId:    text('customer_id').notNull().references(() => customers.id),
  date:          text('date').notNull(),        // 'YYYY-MM-DD'
  startTime:     text('start_time').notNull(),  // 'HH:MM'
  endTime:       text('end_time').notNull(),    // 'HH:MM'
  // 상태 전이: pending → confirmed → completed | no_show
  //           pending → cancelled
  //           confirmed → cancelled (cancel_policy_hours 이내)
  status:        text('status').notNull().default('pending'),
  customerMemo:  text('customer_memo'),
  ownerMemo:     text('owner_memo'),
  cancelledAt:   text('cancelled_at'),
  cancelReason:  text('cancel_reason'),
  createdAt:     text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt:     text('updated_at').notNull().default(sql`(datetime('now'))`),
})

// ─── notifications (알림 발송 이력) ────────────────────────────
export const notifications = sqliteTable('notifications', {
  id:            text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  reservationId: text('reservation_id').notNull().references(() => reservations.id, { onDelete: 'cascade' }),
  type:          text('type').notNull(),       // email | sms | kakao
  recipient:     text('recipient').notNull(),
  template:      text('template').notNull(),   // booking_confirmed | booking_cancelled | reminder
  status:        text('status').notNull().default('pending'),  // pending | sent | failed
  sentAt:        text('sent_at'),
  errorMessage:  text('error_message'),
  createdAt:     text('created_at').notNull().default(sql`(datetime('now'))`),
})

// ─── TypeScript 타입 추출 ──────────────────────────────────────
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Business = typeof businesses.$inferSelect
export type NewBusiness = typeof businesses.$inferInsert
export type Service = typeof services.$inferSelect
export type NewService = typeof services.$inferInsert
export type BusinessSchedule = typeof businessSchedules.$inferSelect
export type BlockedDate = typeof blockedDates.$inferSelect
export type Customer = typeof customers.$inferSelect
export type NewCustomer = typeof customers.$inferInsert
export type Reservation = typeof reservations.$inferSelect
export type NewReservation = typeof reservations.$inferInsert

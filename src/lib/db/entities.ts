import { EntitySchema, OptionalProps } from '@mikro-orm/core'

// ─── User ────────────────────────────────────────────────────────
export interface User {
  [OptionalProps]?: 'id' | 'passwordHash' | 'phone' | 'role' | 'createdAt' | 'updatedAt'
  id: string
  email: string
  passwordHash: string | null
  name: string
  phone: string | null
  role: string
  createdAt: string
  updatedAt: string
}

export const UserSchema = new EntitySchema<User>({
  name: 'User',
  tableName: 'users',
  properties: {
    id:           { type: 'string', primary: true, onCreate: () => crypto.randomUUID() },
    email:        { type: 'string', unique: true },
    passwordHash: { type: 'string', nullable: true, fieldName: 'password_hash' },
    name:         { type: 'string' },
    phone:        { type: 'string', nullable: true },
    role:         { type: 'string', default: 'owner', onCreate: () => 'owner' },
    createdAt:    { type: 'string', fieldName: 'created_at', onCreate: () => new Date().toISOString() },
    updatedAt:    { type: 'string', fieldName: 'updated_at', onCreate: () => new Date().toISOString(), onUpdate: () => new Date().toISOString() },
  },
})

// ─── Business ────────────────────────────────────────────────────
export interface Business {
  [OptionalProps]?: 'id' | 'description' | 'address' | 'phone' | 'logoUrl' | 'coverImageUrl' | 'category' | 'isActive' | 'slotDuration' | 'maxAdvanceDays' | 'minAdvanceHours' | 'cancelPolicyHours' | 'createdAt' | 'updatedAt'
  id: string
  ownerId: string
  slug: string
  name: string
  description: string | null
  address: string | null
  phone: string | null
  logoUrl: string | null
  coverImageUrl: string | null
  category: string | null
  isActive: boolean
  slotDuration: number
  maxAdvanceDays: number
  minAdvanceHours: number
  cancelPolicyHours: number
  createdAt: string
  updatedAt: string
}

export const BusinessSchema = new EntitySchema<Business>({
  name: 'Business',
  tableName: 'businesses',
  properties: {
    id:                { type: 'string', primary: true, onCreate: () => crypto.randomUUID() },
    ownerId:           { type: 'string', fieldName: 'owner_id' },
    slug:              { type: 'string', unique: true },
    name:              { type: 'string' },
    description:       { type: 'string', nullable: true },
    address:           { type: 'string', nullable: true },
    phone:             { type: 'string', nullable: true },
    logoUrl:           { type: 'string', nullable: true, fieldName: 'logo_url' },
    coverImageUrl:     { type: 'string', nullable: true, fieldName: 'cover_image_url' },
    category:          { type: 'string', nullable: true },
    isActive:          { type: 'boolean', fieldName: 'is_active', default: true, onCreate: () => true },
    slotDuration:      { type: 'integer', fieldName: 'slot_duration', default: 30, onCreate: () => 30 },
    maxAdvanceDays:    { type: 'integer', fieldName: 'max_advance_days', default: 30, onCreate: () => 30 },
    minAdvanceHours:   { type: 'integer', fieldName: 'min_advance_hours', default: 1, onCreate: () => 1 },
    cancelPolicyHours: { type: 'integer', fieldName: 'cancel_policy_hours', default: 24, onCreate: () => 24 },
    createdAt:         { type: 'string', fieldName: 'created_at', onCreate: () => new Date().toISOString() },
    updatedAt:         { type: 'string', fieldName: 'updated_at', onCreate: () => new Date().toISOString(), onUpdate: () => new Date().toISOString() },
  },
})

// ─── Service ─────────────────────────────────────────────────────
export interface Service {
  [OptionalProps]?: 'id' | 'description' | 'price' | 'isActive' | 'sortOrder' | 'createdAt' | 'updatedAt'
  id: string
  businessId: string
  name: string
  description: string | null
  duration: number
  price: number
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export const ServiceSchema = new EntitySchema<Service>({
  name: 'Service',
  tableName: 'services',
  properties: {
    id:          { type: 'string', primary: true, onCreate: () => crypto.randomUUID() },
    businessId:  { type: 'string', fieldName: 'business_id' },
    name:        { type: 'string' },
    description: { type: 'string', nullable: true },
    duration:    { type: 'integer' },
    price:       { type: 'integer', default: 0, onCreate: () => 0 },
    isActive:    { type: 'boolean', fieldName: 'is_active', default: true, onCreate: () => true },
    sortOrder:   { type: 'integer', fieldName: 'sort_order', default: 0, onCreate: () => 0 },
    createdAt:   { type: 'string', fieldName: 'created_at', onCreate: () => new Date().toISOString() },
    updatedAt:   { type: 'string', fieldName: 'updated_at', onCreate: () => new Date().toISOString(), onUpdate: () => new Date().toISOString() },
  },
})

// ─── BusinessSchedule ────────────────────────────────────────────
export interface BusinessSchedule {
  [OptionalProps]?: 'id' | 'isOpen' | 'openTime' | 'closeTime' | 'breakStart' | 'breakEnd' | 'createdAt' | 'updatedAt'
  id: string
  businessId: string
  dayOfWeek: number
  isOpen: boolean
  openTime: string
  closeTime: string
  breakStart: string | null
  breakEnd: string | null
  createdAt: string
  updatedAt: string
}

export const BusinessScheduleSchema = new EntitySchema<BusinessSchedule>({
  name: 'BusinessSchedule',
  tableName: 'business_schedules',
  properties: {
    id:         { type: 'string', primary: true, onCreate: () => crypto.randomUUID() },
    businessId: { type: 'string', fieldName: 'business_id' },
    dayOfWeek:  { type: 'integer', fieldName: 'day_of_week' },
    isOpen:     { type: 'boolean', fieldName: 'is_open', default: true, onCreate: () => true },
    openTime:   { type: 'string', fieldName: 'open_time', default: '09:00', onCreate: () => '09:00' },
    closeTime:  { type: 'string', fieldName: 'close_time', default: '18:00', onCreate: () => '18:00' },
    breakStart: { type: 'string', nullable: true, fieldName: 'break_start' },
    breakEnd:   { type: 'string', nullable: true, fieldName: 'break_end' },
    createdAt:  { type: 'string', fieldName: 'created_at', onCreate: () => new Date().toISOString() },
    updatedAt:  { type: 'string', fieldName: 'updated_at', onCreate: () => new Date().toISOString(), onUpdate: () => new Date().toISOString() },
  },
})

// ─── BlockedDate ─────────────────────────────────────────────────
export interface BlockedDate {
  [OptionalProps]?: 'id' | 'reason' | 'createdAt'
  id: string
  businessId: string
  date: string
  reason: string | null
  createdAt: string
}

export const BlockedDateSchema = new EntitySchema<BlockedDate>({
  name: 'BlockedDate',
  tableName: 'blocked_dates',
  properties: {
    id:         { type: 'string', primary: true, onCreate: () => crypto.randomUUID() },
    businessId: { type: 'string', fieldName: 'business_id' },
    date:       { type: 'string' },
    reason:     { type: 'string', nullable: true },
    createdAt:  { type: 'string', fieldName: 'created_at', onCreate: () => new Date().toISOString() },
  },
})

// ─── Customer ────────────────────────────────────────────────────
export interface Customer {
  [OptionalProps]?: 'id' | 'email' | 'memo' | 'createdAt' | 'updatedAt'
  id: string
  name: string
  phone: string
  email: string | null
  memo: string | null
  createdAt: string
  updatedAt: string
}

export const CustomerSchema = new EntitySchema<Customer>({
  name: 'Customer',
  tableName: 'customers',
  properties: {
    id:        { type: 'string', primary: true, onCreate: () => crypto.randomUUID() },
    name:      { type: 'string' },
    phone:     { type: 'string' },
    email:     { type: 'string', nullable: true },
    memo:      { type: 'string', nullable: true },
    createdAt: { type: 'string', fieldName: 'created_at', onCreate: () => new Date().toISOString() },
    updatedAt: { type: 'string', fieldName: 'updated_at', onCreate: () => new Date().toISOString(), onUpdate: () => new Date().toISOString() },
  },
})

// ─── Reservation ─────────────────────────────────────────────────
export interface Reservation {
  [OptionalProps]?: 'id' | 'status' | 'customerMemo' | 'ownerMemo' | 'cancelledAt' | 'cancelReason' | 'createdAt' | 'updatedAt'
  id: string
  reservationNo: string
  businessId: string
  serviceId: string
  customerId: string
  date: string
  startTime: string
  endTime: string
  status: string
  customerMemo: string | null
  ownerMemo: string | null
  cancelledAt: string | null
  cancelReason: string | null
  createdAt: string
  updatedAt: string
}

export const ReservationSchema = new EntitySchema<Reservation>({
  name: 'Reservation',
  tableName: 'reservations',
  properties: {
    id:            { type: 'string', primary: true, onCreate: () => crypto.randomUUID() },
    reservationNo: { type: 'string', unique: true, fieldName: 'reservation_no' },
    businessId:    { type: 'string', fieldName: 'business_id' },
    serviceId:     { type: 'string', fieldName: 'service_id' },
    customerId:    { type: 'string', fieldName: 'customer_id' },
    date:          { type: 'string' },
    startTime:     { type: 'string', fieldName: 'start_time' },
    endTime:       { type: 'string', fieldName: 'end_time' },
    status:        { type: 'string', default: 'pending', onCreate: () => 'pending' },
    customerMemo:  { type: 'string', nullable: true, fieldName: 'customer_memo' },
    ownerMemo:     { type: 'string', nullable: true, fieldName: 'owner_memo' },
    cancelledAt:   { type: 'string', nullable: true, fieldName: 'cancelled_at' },
    cancelReason:  { type: 'string', nullable: true, fieldName: 'cancel_reason' },
    createdAt:     { type: 'string', fieldName: 'created_at', onCreate: () => new Date().toISOString() },
    updatedAt:     { type: 'string', fieldName: 'updated_at', onCreate: () => new Date().toISOString(), onUpdate: () => new Date().toISOString() },
  },
})

// ─── Notification ────────────────────────────────────────────────
export interface Notification {
  [OptionalProps]?: 'id' | 'status' | 'sentAt' | 'errorMessage' | 'createdAt'
  id: string
  reservationId: string
  type: string
  recipient: string
  template: string
  status: string
  sentAt: string | null
  errorMessage: string | null
  createdAt: string
}

export const NotificationSchema = new EntitySchema<Notification>({
  name: 'Notification',
  tableName: 'notifications',
  properties: {
    id:            { type: 'string', primary: true, onCreate: () => crypto.randomUUID() },
    reservationId: { type: 'string', fieldName: 'reservation_id' },
    type:          { type: 'string' },
    recipient:     { type: 'string' },
    template:      { type: 'string' },
    status:        { type: 'string', default: 'pending', onCreate: () => 'pending' },
    sentAt:        { type: 'string', nullable: true, fieldName: 'sent_at' },
    errorMessage:  { type: 'string', nullable: true, fieldName: 'error_message' },
    createdAt:     { type: 'string', fieldName: 'created_at', onCreate: () => new Date().toISOString() },
  },
})

// ─── 입력 타입 (API / 쿼리 함수용) ──────────────────────────
import type { RequiredEntityData } from '@mikro-orm/core'
export type NewUser        = RequiredEntityData<User>
export type NewBusiness    = RequiredEntityData<Business>
export type NewService     = RequiredEntityData<Service>
export type NewCustomer    = RequiredEntityData<Customer>
export type NewReservation = RequiredEntityData<Reservation>

// ─── 엔티티 목록 (ORM 설정용) ─────────────────────────────────
export const entities = [
  UserSchema,
  BusinessSchema,
  ServiceSchema,
  BusinessScheduleSchema,
  BlockedDateSchema,
  CustomerSchema,
  ReservationSchema,
  NotificationSchema,
]

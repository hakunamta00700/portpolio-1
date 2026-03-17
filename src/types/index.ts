export type ReservationStatus = 'pending' | 'confirmed' | 'completed' | 'no_show' | 'cancelled'

export type BusinessCategory =
  | 'cafe'
  | 'restaurant'
  | 'hairshop'
  | 'nail'
  | 'skincare'
  | 'other'

export const CATEGORY_LABELS: Record<BusinessCategory, string> = {
  cafe: '카페',
  restaurant: '식당',
  hairshop: '미용실',
  nail: '네일샵',
  skincare: '피부관리',
  other: '기타',
}

export const STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: '대기중',
  confirmed: '확정',
  completed: '완료',
  no_show: '노쇼',
  cancelled: '취소',
}

export const STATUS_COLORS: Record<ReservationStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  no_show: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
}

export interface TimeSlot {
  time: string    // 'HH:MM'
  available: boolean
}

export interface BookingStep {
  step: 1 | 2 | 3
  serviceId?: string
  date?: string
  time?: string
}

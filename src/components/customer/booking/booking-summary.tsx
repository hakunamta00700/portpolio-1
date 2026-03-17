import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { formatDate, formatTime, formatDuration, formatPrice } from '@/lib/format'
import { Calendar, Clock, CreditCard, User, Phone, Mail, MessageSquare } from 'lucide-react'

interface BookingSummaryProps {
  service: { name: string; duration: number; price: number }
  date: string
  time: string
  customer: { name: string; phone: string; email?: string; memo?: string }
  onConfirm: () => void
  onBack: () => void
  isSubmitting?: boolean
}

function Row({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="text-gray-400 mt-0.5 shrink-0">{icon}</div>
      <div className="flex-1 flex justify-between gap-2">
        <span className="text-sm text-gray-500">{label}</span>
        <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
      </div>
    </div>
  )
}

export function BookingSummary({
  service,
  date,
  time,
  customer,
  onConfirm,
  onBack,
  isSubmitting,
}: BookingSummaryProps) {
  return (
    <div className="space-y-4">
      {/* Service details */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
          <h3 className="text-sm font-semibold text-blue-800">예약 서비스</h3>
        </div>
        <div className="px-4 divide-y divide-gray-50">
          <Row icon={<Calendar className="h-4 w-4" />} label="서비스" value={service.name} />
          <Row
            icon={<Calendar className="h-4 w-4" />}
            label="일시"
            value={`${formatDate(date)} ${formatTime(time)}`}
          />
          <Row icon={<Clock className="h-4 w-4" />} label="소요시간" value={formatDuration(service.duration)} />
          <Row
            icon={<CreditCard className="h-4 w-4" />}
            label="금액"
            value={
              <span className="text-base font-bold text-blue-600">{formatPrice(service.price)}</span>
            }
          />
        </div>
      </div>

      {/* Customer details */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">예약자 정보</h3>
        </div>
        <div className="px-4 divide-y divide-gray-50">
          <Row icon={<User className="h-4 w-4" />} label="이름" value={customer.name} />
          <Row icon={<Phone className="h-4 w-4" />} label="연락처" value={customer.phone} />
          {customer.email && (
            <Row icon={<Mail className="h-4 w-4" />} label="이메일" value={customer.email} />
          )}
          {customer.memo && (
            <Row icon={<MessageSquare className="h-4 w-4" />} label="요청사항" value={customer.memo} />
          )}
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 px-4">
        예약 내용을 확인 후 예약을 확정해주세요
      </p>

      <div className="flex gap-2.5 pt-1">
        <Button variant="outline" className="flex-1" onClick={onBack}>이전</Button>
        <Button className="flex-1" onClick={onConfirm} disabled={isSubmitting}>
          {isSubmitting ? '예약 중...' : '예약 확정'}
        </Button>
      </div>
    </div>
  )
}

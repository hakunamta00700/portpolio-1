import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatDate, formatTime, formatDuration, formatPrice } from '@/lib/format'

interface BookingSummaryProps {
  service: { name: string; duration: number; price: number }
  date: string
  time: string
  customer: { name: string; phone: string; email?: string; memo?: string }
  onConfirm: () => void
  onBack: () => void
  isSubmitting?: boolean
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
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold text-sm text-gray-500">예약 내용</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">서비스</span>
              <span className="font-medium">{service.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">일시</span>
              <span className="font-medium">{formatDate(date)} {formatTime(time)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">소요시간</span>
              <span>{formatDuration(service.duration)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">금액</span>
              <span className="font-semibold text-blue-600">{formatPrice(service.price)}</span>
            </div>
          </div>
          <Separator />
          <h3 className="font-semibold text-sm text-gray-500">예약자 정보</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">이름</span>
              <span>{customer.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">연락처</span>
              <span>{customer.phone}</span>
            </div>
            {customer.email && (
              <div className="flex justify-between">
                <span className="text-gray-500">이메일</span>
                <span>{customer.email}</span>
              </div>
            )}
            {customer.memo && (
              <div>
                <span className="text-gray-500">요청사항</span>
                <p className="mt-1 text-gray-700">{customer.memo}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onBack}>이전</Button>
        <Button className="flex-1" onClick={onConfirm} disabled={isSubmitting}>
          {isSubmitting ? '예약 중...' : '예약 확정'}
        </Button>
      </div>
    </div>
  )
}

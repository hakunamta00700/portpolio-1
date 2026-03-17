'use client'

import { useEffect, useState, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { StepIndicator } from '@/components/customer/booking/step-indicator'
import { BookingDatePicker } from '@/components/customer/booking/date-picker'
import { TimeSlotPicker } from '@/components/customer/booking/time-slot-picker'
import { CustomerForm, type CustomerFormData } from '@/components/customer/booking/customer-form'
import { BookingSummary } from '@/components/customer/booking/booking-summary'
import { BusinessHeader } from '@/components/customer/business-header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { formatDateShort } from '@/lib/format'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

interface BusinessData {
  business: {
    id: string
    name: string
    description: string | null
    address: string | null
    phone: string | null
    category: string | null
    maxAdvanceDays: number
  }
  services: { id: string; name: string; description: string | null; duration: number; price: number }[]
}

interface TimeSlot { time: string; available: boolean }

export default function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceIdParam = searchParams.get('service')

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [bizData, setBizData] = useState<BusinessData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedServiceId, setSelectedServiceId] = useState(serviceIdParam ?? '')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState('')
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [customerData, setCustomerData] = useState<CustomerFormData | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch(`/api/public/${slug}`)
      .then((r) => r.json())
      .then(setBizData)
      .catch(() => router.push('/'))
      .finally(() => setLoading(false))
  }, [slug, router])

  useEffect(() => {
    if (!selectedDate || !selectedServiceId || !bizData) return
    setSlotsLoading(true)
    const dateStr = selectedDate.toISOString().slice(0, 10)
    fetch(`/api/businesses/${bizData.business.id}/slots?date=${dateStr}&service_id=${selectedServiceId}`)
      .then((r) => r.json())
      .then(setSlots)
      .finally(() => setSlotsLoading(false))
  }, [selectedDate, selectedServiceId, bizData])

  const selectedService = bizData?.services.find((s) => s.id === selectedServiceId)

  async function handleConfirm() {
    if (!bizData || !selectedDate || !selectedTime || !customerData || !selectedService) return
    setSubmitting(true)

    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessId: bizData.business.id,
        serviceId: selectedServiceId,
        date: selectedDate.toISOString().slice(0, 10),
        startTime: selectedTime,
        customer: customerData,
      }),
    })

    setSubmitting(false)
    const json = await res.json()

    if (res.ok) {
      router.push(`/${slug}/confirm?no=${json.reservationNo}`)
    } else {
      toast.error(json.error ?? '예약에 실패했습니다')
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4 max-w-xl mx-auto">
        <Skeleton className="h-24" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!bizData) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessHeader business={bizData.business} />

      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <Link href={`/${slug}`} className="text-gray-400 hover:text-gray-600">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h2 className="font-semibold">예약하기</h2>
          {selectedService && (
            <span className="text-sm text-blue-600 ml-1">- {selectedService.name}</span>
          )}
        </div>

        <StepIndicator currentStep={step} />

        {step === 1 && (
          <div className="space-y-4">
            <BookingDatePicker
              selected={selectedDate ?? undefined}
              onSelect={(d) => { setSelectedDate(d); setSelectedTime('') }}
              maxAdvanceDays={bizData.business.maxAdvanceDays}
            />
            {selectedDate && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  {formatDateShort(selectedDate.toISOString().slice(0, 10))} 예약 가능 시간
                </p>
                <TimeSlotPicker
                  slots={slots}
                  selectedTime={selectedTime}
                  onSelect={setSelectedTime}
                  loading={slotsLoading}
                />
              </div>
            )}
            <Button
              className="w-full"
              disabled={!selectedDate || !selectedTime}
              onClick={() => setStep(2)}
            >
              다음
            </Button>
          </div>
        )}

        {step === 2 && (
          <CustomerForm
            onSubmit={(data) => { setCustomerData(data); setStep(3) }}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && customerData && selectedDate && selectedService && (
          <BookingSummary
            service={selectedService}
            date={selectedDate.toISOString().slice(0, 10)}
            time={selectedTime}
            customer={customerData}
            onConfirm={handleConfirm}
            onBack={() => setStep(2)}
            isSubmitting={submitting}
          />
        )}
      </div>
    </div>
  )
}

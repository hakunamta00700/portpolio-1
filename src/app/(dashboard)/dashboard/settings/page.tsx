'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CATEGORY_LABELS, type BusinessCategory } from '@/types'
import { toast } from 'sonner'

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  category: z.string().optional(),
  slotDuration: z.coerce.number().int().min(15),
  maxAdvanceDays: z.coerce.number().int().min(1),
  minAdvanceHours: z.coerce.number().int().min(0),
  cancelPolicyHours: z.coerce.number().int().min(0),
})

type FormData = z.infer<typeof schema>

export default function SettingsPage() {
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    fetch('/api/businesses')
      .then((r) => r.json())
      .then((data) => {
        const biz = data[0]
        if (biz) {
          setBusinessId(biz.id)
          reset({
            name: biz.name,
            description: biz.description ?? '',
            address: biz.address ?? '',
            phone: biz.phone ?? '',
            category: biz.category ?? '',
            slotDuration: biz.slotDuration,
            maxAdvanceDays: biz.maxAdvanceDays,
            minAdvanceHours: biz.minAdvanceHours,
            cancelPolicyHours: biz.cancelPolicyHours,
          })
        }
        setLoading(false)
      })
  }, [reset])

  async function onSubmit(data: FormData) {
    if (!businessId) return
    const res = await fetch(`/api/businesses/${businessId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      toast.success('업체 정보가 저장되었습니다')
    } else {
      toast.error('저장에 실패했습니다')
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">업체 설정</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">기본 정보</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>업체명</Label>
              <Input {...register('name')} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>카테고리</Label>
              <Select onValueChange={(v) => setValue('category', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(CATEGORY_LABELS) as [BusinessCategory, string][]).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>업체 소개</Label>
              <Textarea {...register('description')} />
            </div>
            <div className="space-y-1">
              <Label>주소</Label>
              <Input {...register('address')} />
            </div>
            <div className="space-y-1">
              <Label>연락처</Label>
              <Input {...register('phone')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">예약 정책</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>슬롯 단위 (분)</Label>
                <Input type="number" {...register('slotDuration')} />
                {errors.slotDuration && <p className="text-sm text-red-500">{errors.slotDuration.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>최대 예약 가능 일수</Label>
                <Input type="number" {...register('maxAdvanceDays')} />
              </div>
              <div className="space-y-1">
                <Label>최소 예약 전 시간</Label>
                <Input type="number" {...register('minAdvanceHours')} />
              </div>
              <div className="space-y-1">
                <Label>취소 정책 시간</Label>
                <Input type="number" {...register('cancelPolicyHours')} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '저장 중...' : '저장'}
        </Button>
      </form>
    </div>
  )
}

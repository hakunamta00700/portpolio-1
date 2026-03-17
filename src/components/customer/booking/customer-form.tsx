'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const schema = z.object({
  name: z.string().min(2, '이름은 2자 이상 입력해주세요'),
  phone: z.string().min(10, '올바른 연락처를 입력해주세요').regex(/^[0-9-]+$/, '숫자와 - 만 입력 가능합니다'),
  email: z.string().email('올바른 이메일 형식이 아닙니다').optional().or(z.literal('')),
  memo: z.string().optional(),
})

export type CustomerFormData = z.infer<typeof schema>

interface CustomerFormProps {
  onSubmit: (data: CustomerFormData) => void
  onBack: () => void
  isSubmitting?: boolean
}

export function CustomerForm({ onSubmit, onBack, isSubmitting }: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({ resolver: zodResolver(schema) })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label>이름 *</Label>
        <Input placeholder="홍길동" {...register('name')} />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>
      <div className="space-y-1">
        <Label>연락처 *</Label>
        <Input placeholder="010-0000-0000" {...register('phone')} />
        {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
      </div>
      <div className="space-y-1">
        <Label>이메일 (선택 - 예약 확인 메일 발송)</Label>
        <Input type="email" placeholder="example@email.com" {...register('email')} />
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>
      <div className="space-y-1">
        <Label>요청사항 (선택)</Label>
        <Textarea placeholder="특별 요청사항이 있으시면 입력해주세요" {...register('memo')} rows={2} />
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
          이전
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? '예약 중...' : '다음'}
        </Button>
      </div>
    </form>
  )
}

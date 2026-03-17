'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const schema = z.object({
  name: z.string().min(1, '서비스명을 입력해주세요'),
  description: z.string().optional(),
  duration: z.coerce.number().int().min(10, '최소 10분 이상'),
  price: z.coerce.number().int().min(0, '0 이상'),
})

export type ServiceFormData = z.infer<typeof schema>

interface ServiceFormProps {
  initialData?: Partial<ServiceFormData>
  onSubmit: (data: ServiceFormData) => Promise<void>
  onCancel: () => void
  title?: string
}

export function ServiceForm({ initialData, onSubmit, onCancel, title = '서비스 추가' }: ServiceFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (initialData) reset(initialData)
  }, [initialData, reset])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>서비스명 *</Label>
            <Input placeholder="컷트, 파마, 젤네일..." {...register('name')} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>설명 (선택)</Label>
            <Textarea placeholder="서비스 설명을 입력해주세요" {...register('description')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>소요 시간 (분) *</Label>
              <Input type="number" placeholder="60" {...register('duration')} />
              {errors.duration && <p className="text-sm text-red-500">{errors.duration.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>가격 (원) *</Label>
              <Input type="number" placeholder="30000" {...register('price')} />
              {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '저장 중...' : '저장'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

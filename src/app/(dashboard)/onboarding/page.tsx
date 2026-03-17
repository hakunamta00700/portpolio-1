'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CATEGORY_LABELS, type BusinessCategory } from '@/types'

const schema = z.object({
  name: z.string().min(2, '업체명은 2자 이상 입력해주세요'),
  slug: z
    .string()
    .min(2, 'URL 주소는 2자 이상 입력해주세요')
    .regex(/^[a-z0-9-]+$/, '영소문자, 숫자, 하이픈(-)만 사용 가능합니다'),
  category: z.string().min(1, '카테고리를 선택해주세요'),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function OnboardingPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setError('')
    const res = await fetch('/api/businesses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) {
      setError(json.error ?? '업체 등록에 실패했습니다')
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">업체 등록</CardTitle>
          <CardDescription>예약을 받을 업체 정보를 등록해주세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">업체명 *</Label>
              <Input id="name" placeholder="홍길동 헤어샵" {...register('name')} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="slug">예약 페이지 URL *</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 whitespace-nowrap">reserveos.kr/</span>
                <Input id="slug" placeholder="my-hairshop" {...register('slug')} />
              </div>
              {errors.slug && <p className="text-sm text-red-500">{errors.slug.message}</p>}
            </div>

            <div className="space-y-1">
              <Label>카테고리 *</Label>
              <Select onValueChange={(v) => setValue('category', String(v ?? ''))}>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(CATEGORY_LABELS) as [BusinessCategory, string][]).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="description">업체 소개 (선택)</Label>
              <Textarea id="description" placeholder="업체를 간단히 소개해주세요" {...register('description')} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="address">주소 (선택)</Label>
              <Input id="address" placeholder="서울시 강남구..." {...register('address')} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone">업체 연락처 (선택)</Label>
              <Input id="phone" placeholder="02-0000-0000" {...register('phone')} />
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? '등록 중...' : '업체 등록 완료'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

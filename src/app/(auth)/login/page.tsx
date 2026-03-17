'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const loginSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
})

type LoginForm = z.infer<typeof loginSchema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered')
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginForm) {
    setError('')
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (result?.error) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">로그인</CardTitle>
        <CardDescription>사장님 계정으로 로그인하세요</CardDescription>
      </CardHeader>
      <CardContent>
        {registered && (
          <p className="mb-4 text-sm text-green-600 bg-green-50 rounded p-2 text-center">
            회원가입이 완료되었습니다. 로그인해주세요.
          </p>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" type="email" placeholder="owner@example.com" {...register('email')} />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">비밀번호</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? '로그인 중...' : '로그인'}
          </Button>

          <p className="text-center text-sm text-gray-600">
            계정이 없으신가요?{' '}
            <Link href="/signup" className="text-blue-600 hover:underline">
              회원가입
            </Link>
          </p>

          <p className="text-center text-xs text-gray-400">
            데모: demo@reserveos.kr / demo1234
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <LoginForm />
    </Suspense>
  )
}

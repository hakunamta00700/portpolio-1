'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-200 mb-4">오류</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">문제가 발생했습니다</h2>
        <p className="text-gray-500 mb-8">
          잠시 후 다시 시도해주세요.
          {error.digest && (
            <span className="block text-xs text-gray-400 mt-1">오류 코드: {error.digest}</span>
          )}
        </p>
        <Button onClick={reset}>다시 시도</Button>
      </div>
    </div>
  )
}

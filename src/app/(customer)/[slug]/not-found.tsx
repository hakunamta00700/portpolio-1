import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function SlugNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-300 mb-2">404</h1>
        <p className="text-xl font-semibold text-gray-700 mb-1">업체를 찾을 수 없습니다</p>
        <p className="text-gray-500 mb-6">URL 주소를 다시 확인해주세요</p>
        <Button render={<Link href="/" />}>홈으로</Button>
      </div>
    </div>
  )
}

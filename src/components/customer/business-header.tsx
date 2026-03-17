import { MapPin, Phone } from 'lucide-react'
import { CATEGORY_LABELS, type BusinessCategory } from '@/types'

interface BusinessHeaderProps {
  business: {
    name: string
    description?: string | null
    address?: string | null
    phone?: string | null
    category?: string | null
  }
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

export function BusinessHeader({ business }: BusinessHeaderProps) {
  return (
    <div className="bg-white border-b">
      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold shrink-0">
            {business.name[0]}
          </div>
          <div>
            <h1 className="text-xl font-bold">{business.name}</h1>
            {business.category && (
              <p className="text-sm text-blue-600 mt-0.5">
                {CATEGORY_LABELS[business.category as BusinessCategory] ?? business.category}
              </p>
            )}
            {business.description && (
              <p className="text-sm text-gray-600 mt-1">{business.description}</p>
            )}
            <div className="flex flex-col gap-1 mt-2">
              {business.address && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {business.address}
                </div>
              )}
              {business.phone && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Phone className="h-3.5 w-3.5" />
                  {business.phone}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

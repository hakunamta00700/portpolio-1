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

export function BusinessHeader({ business }: BusinessHeaderProps) {
  return (
    <div className="bg-white shadow-sm">
      {/* Accent banner */}
      <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-400" />

      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="flex items-start gap-4">
          <div className="h-18 w-18 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shrink-0 shadow-md">
            {business.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-xl font-bold text-gray-900 leading-tight">{business.name}</h1>
              {business.category && (
                <span className="shrink-0 text-xs bg-blue-50 text-blue-700 font-medium px-2.5 py-1 rounded-full border border-blue-100">
                  {CATEGORY_LABELS[business.category as BusinessCategory] ?? business.category}
                </span>
              )}
            </div>
            {business.description && (
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">{business.description}</p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5">
              {business.address && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <span>{business.address}</span>
                </div>
              )}
              {business.phone && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <span>{business.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

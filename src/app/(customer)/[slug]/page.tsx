import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getBusinessBySlug } from '@/lib/db/queries/businesses'
import { getActiveServicesByBusiness } from '@/lib/db/queries/services'
import { BusinessHeader } from '@/components/customer/business-header'
import { ServiceCard } from '@/components/customer/service-card'
import { CalendarSearch, Scissors } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function BusinessPage({ params }: Props) {
  const { slug } = await params
  const business = await getBusinessBySlug(slug)

  if (!business || !business.isActive) notFound()

  const services = await getActiveServicesByBusiness(business.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessHeader business={business} />

      <div className="max-w-xl mx-auto px-4 py-6">
        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Scissors className="h-4 w-4 text-blue-500" />
            <h2 className="text-base font-semibold text-gray-800">서비스 선택</h2>
            {services.length > 0 && (
              <span className="text-xs bg-gray-100 text-gray-500 font-medium px-2 py-0.5 rounded-full">
                {services.length}
              </span>
            )}
          </div>
          <Link
            href={`/${slug}/lookup`}
            className="text-xs text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 font-medium"
          >
            <CalendarSearch className="h-3.5 w-3.5" />
            예약 조회/취소
          </Link>
        </div>

        {services.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 py-16 text-center">
            <p className="text-gray-400 text-sm">등록된 서비스가 없습니다</p>
          </div>
        ) : (
          <ServiceListClient slug={slug} services={services.map(s => ({
            id: s.id,
            name: s.name,
            description: s.description,
            duration: s.duration,
            price: s.price,
          }))} />
        )}

        <p className="text-center text-xs text-gray-400 mt-8">
          원하는 서비스를 선택하면 예약을 진행할 수 있습니다
        </p>
      </div>
    </div>
  )
}

function ServiceListClient({
  slug,
  services,
}: {
  slug: string
  services: {
    id: string
    name: string
    description: string | null
    duration: number
    price: number
  }[]
}) {
  return (
    <div className="space-y-2.5">
      {services.map((service) => (
        <Link key={service.id} href={`/${slug}/book?service=${service.id}`}>
          <ServiceCard service={service} />
        </Link>
      ))}
    </div>
  )
}

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getBusinessBySlug } from '@/lib/db/queries/businesses'
import { getActiveServicesByBusiness } from '@/lib/db/queries/services'
import { BusinessHeader } from '@/components/customer/business-header'
import { ServiceCard } from '@/components/customer/service-card'
import { CalendarSearch } from 'lucide-react'

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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">서비스</h2>
          <Link
            href={`/${slug}/lookup`}
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            <CalendarSearch className="h-4 w-4" />
            예약 조회
          </Link>
        </div>

        {services.length === 0 ? (
          <p className="text-gray-500 text-center py-12">등록된 서비스가 없습니다</p>
        ) : (
          <ServiceListClient slug={slug} services={services} />
        )}
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
    <div className="space-y-3">
      {services.map((service) => (
        <Link key={service.id} href={`/${slug}/book?service=${service.id}`}>
          <ServiceCard service={service} />
        </Link>
      ))}
    </div>
  )
}

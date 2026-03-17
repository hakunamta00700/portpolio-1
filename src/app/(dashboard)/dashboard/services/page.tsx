'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ServiceForm, type ServiceFormData } from '@/components/services/service-form'
import { formatPrice, formatDuration } from '@/lib/format'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'

type Service = {
  id: string
  name: string
  description: string | null
  duration: number
  price: number
  isActive: boolean
  sortOrder: number
}

export default function ServicesPage() {
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  useEffect(() => {
    fetch('/api/businesses')
      .then((r) => r.json())
      .then((data) => {
        const biz = data[0]
        if (biz) {
          setBusinessId(biz.id)
          return fetch(`/api/businesses/${biz.id}/services`).then((r) => r.json())
        }
        return []
      })
      .then(setServices)
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate(data: ServiceFormData) {
    const res = await fetch(`/api/businesses/${businessId}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const newService = await res.json()
      setServices((prev) => [...prev, newService])
      setShowForm(false)
      toast.success('서비스가 추가되었습니다')
    } else {
      toast.error('서비스 추가에 실패했습니다')
    }
  }

  async function handleUpdate(data: ServiceFormData) {
    if (!editingService) return
    const res = await fetch(`/api/businesses/${businessId}/services/${editingService.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const updated = await res.json()
      setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
      setEditingService(null)
      toast.success('서비스가 수정되었습니다')
    } else {
      toast.error('서비스 수정에 실패했습니다')
    }
  }

  async function handleDelete(service: Service) {
    if (!confirm(`'${service.name}' 서비스를 삭제할까요?`)) return
    const res = await fetch(`/api/businesses/${businessId}/services/${service.id}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      setServices((prev) => prev.filter((s) => s.id !== service.id))
      toast.success('서비스가 삭제되었습니다')
    } else {
      toast.error('삭제에 실패했습니다')
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-40" />
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">서비스 관리</h1>
        {!showForm && !editingService && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            서비스 추가
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <ServiceForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      <div className="space-y-3">
        {services.length === 0 && !showForm && (
          <p className="text-gray-500 text-center py-12">등록된 서비스가 없습니다</p>
        )}
        {services.map((service) => (
          <div key={service.id}>
            {editingService?.id === service.id ? (
              <ServiceForm
                title="서비스 수정"
                initialData={service}
                onSubmit={handleUpdate}
                onCancel={() => setEditingService(null)}
              />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{service.name}</span>
                      {!service.isActive && (
                        <Badge variant="outline" className="text-gray-400">비활성</Badge>
                      )}
                    </div>
                    {service.description && (
                      <p className="text-sm text-gray-500 mt-0.5">{service.description}</p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDuration(service.duration)} · {formatPrice(service.price)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingService(service)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(service)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

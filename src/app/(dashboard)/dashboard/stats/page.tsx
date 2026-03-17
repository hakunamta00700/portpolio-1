'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/lib/format'
import { TrendingUp, CalendarDays, CheckCircle, XCircle } from 'lucide-react'

interface Stats {
  total: number
  confirmed: number
  cancelled: number
  revenue: number
  popularServices: { name: string; count: number }[]
}

export default function StatsPage() {
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const [from, setFrom] = useState(
    new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  )
  const [to, setTo] = useState(now.toISOString().slice(0, 10))

  async function fetchStats(bizId: string) {
    setLoading(true)
    const res = await fetch(`/api/businesses/${bizId}/stats?from=${from}&to=${to}`)
    const data = await res.json()
    setStats(data)
    setLoading(false)
  }

  useEffect(() => {
    fetch('/api/businesses')
      .then((r) => r.json())
      .then((data) => {
        if (data[0]) {
          setBusinessId(data[0].id)
          fetchStats(data[0].id)
        } else {
          setLoading(false)
        }
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">통계</h1>

      <div className="flex flex-wrap gap-3 items-end mb-6">
        <div className="space-y-1">
          <Label>시작일</Label>
          <Input type="date" className="w-40" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>종료일</Label>
          <Input type="date" className="w-40" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <Button onClick={() => businessId && fetchStats(businessId)}>조회</Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : stats ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <CalendarDays className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-gray-500">총 예약</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.confirmed}</p>
                  <p className="text-xs text-gray-500">확정/완료</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <XCircle className="h-8 w-8 text-red-400" />
                <div>
                  <p className="text-2xl font-bold">{stats.cancelled}</p>
                  <p className="text-xs text-gray-500">취소</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-lg font-bold">{formatPrice(stats.revenue)}</p>
                  <p className="text-xs text-gray-500">매출</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {stats.popularServices.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">인기 서비스</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.popularServices.map((s, i) => (
                    <div key={s.name} className="flex items-center gap-3">
                      <span className="text-sm text-gray-400 w-4">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span>{s.name}</span>
                          <span className="text-gray-500">{s.count}건</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full mt-1">
                          <div
                            className="h-1.5 bg-blue-500 rounded-full"
                            style={{
                              width: `${Math.round((s.count / (stats.popularServices[0]?.count || 1)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-12">데이터가 없습니다</p>
      )}
    </div>
  )
}

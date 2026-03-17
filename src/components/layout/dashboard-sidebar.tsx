'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  CalendarDays,
  Scissors,
  Clock,
  BarChart2,
  Settings,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', label: '홈', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/reservations', label: '예약 관리', icon: CalendarDays },
  { href: '/dashboard/services', label: '서비스 관리', icon: Scissors },
  { href: '/dashboard/schedule', label: '영업시간', icon: Clock },
  { href: '/dashboard/stats', label: '통계', icon: BarChart2 },
  { href: '/dashboard/settings', label: '업체 설정', icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 border-r bg-white min-h-screen hidden md:block">
      <div className="p-4">
        <Link href="/" className="text-lg font-bold text-blue-600">
          ReserveOS
        </Link>
      </div>
      <nav className="px-2 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

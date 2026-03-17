import { Toaster } from '@/components/ui/sonner'

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
      <Toaster />
    </div>
  )
}

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import SessionProvider from '@/components/session-provider'

export default async function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return <SessionProvider session={session}>{children}</SessionProvider>
}

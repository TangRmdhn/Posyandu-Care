import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppHeader } from '@/components/shared/AppHeader'
import { BottomNavBar } from '@/components/shared/BottomNavBar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let role = user.app_metadata?.role as string | undefined
  if (!role) {
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    role = profile?.role ?? undefined
  }
  const navRole = (role ?? 'ortu') as 'ortu' | 'kader' | 'bidan'

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative">
      <AppHeader />
      <main className="pt-[48px] pb-16 min-h-screen">{children}</main>
      <BottomNavBar role={navRole} />
    </div>
  )
}

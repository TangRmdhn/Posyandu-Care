import { redirect } from 'next/navigation'
import { AppHeader } from '@/components/shared/AppHeader'
import { BottomNavBar } from '@/components/shared/BottomNavBar'
import { getCurrentUserWithRole, type Role } from '@/lib/auth/role'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, role } = await getCurrentUserWithRole()
  if (!user) redirect('/login')

  const navRole = (role ?? 'ortu') as Role
  const wide = navRole === 'admin' || navRole === 'bidan'

  return (
    <div className={`min-h-screen bg-gray-50 mx-auto relative ${wide ? 'max-w-md lg:max-w-3xl' : 'max-w-md'}`}>
      <AppHeader wide={wide} />
      <main className="pt-[48px] pb-16 min-h-screen">{children}</main>
      <BottomNavBar role={navRole} />
    </div>
  )
}

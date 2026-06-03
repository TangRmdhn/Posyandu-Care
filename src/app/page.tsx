import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const ROLE_DASHBOARDS: Record<string, string> = {
  ortu: '/ortu', kader: '/kader', bidan: '/bidan',
}

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  const role = user.app_metadata?.role as string
  redirect(ROLE_DASHBOARDS[role] ?? '/login')
}

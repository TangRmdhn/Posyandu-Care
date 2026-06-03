import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const ROLE_DASHBOARDS: Record<string, string> = {
  ortu: '/ortu', kader: '/kader', bidan: '/bidan',
}

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  let role = user.app_metadata?.role as string | undefined
  if (!role) {
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    role = profile?.role ?? undefined
  }
  redirect(ROLE_DASHBOARDS[role ?? ''] ?? '/ortu')
}

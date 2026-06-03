import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/shared/LogoutButton'

const ROLE_LABEL: Record<string, string> = {
  ortu: 'Orang Tua', kader: 'Kader', bidan: 'Bidan Desa',
}

export async function ProfilPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles').select('nama, email, role').eq('id', user!.id).single()

  const role = (user?.app_metadata?.role as string) ?? profile?.role ?? ''

  return (
    <div className="px-4 py-6 space-y-4">
      <div className="bg-white rounded-card p-5 shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-brand-light flex items-center justify-center
                        text-brand-blue font-bold text-xl">
          {(profile?.nama ?? user?.email ?? '?').slice(0, 1).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{profile?.nama || 'Pengguna'}</p>
          <p className="text-xs text-gray-400">{profile?.email ?? user?.email}</p>
          <span className="inline-block mt-1 text-[11px] bg-brand-light text-brand-blue px-2 py-0.5 rounded-full">
            {ROLE_LABEL[role] ?? role}
          </span>
        </div>
      </div>

      <LogoutButton />
    </div>
  )
}

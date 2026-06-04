import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

export type Role = 'ortu' | 'kader' | 'bidan' | 'admin'

export const ROLE_HOME: Record<Role, string> = {
  ortu: '/ortu',
  kader: '/kader',
  bidan: '/bidan',
  admin: '/admin',
}

/**
 * Single source of truth for "who is this and what can they do".
 * JWT app_metadata.role first (staff), falling back to the profiles table
 * (self-registered ortu only have it there). Used by the dashboard layout,
 * server components, and API routes so the logic isn't duplicated.
 */
export async function getCurrentUserWithRole(): Promise<{ user: User | null; role: Role | null }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, role: null }

  let role = (user.app_metadata?.role as Role | undefined) ?? undefined
  if (!role) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    role = (profile?.role as Role | undefined) ?? undefined
  }
  return { user, role: role ?? null }
}

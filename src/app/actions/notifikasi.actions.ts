'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/** Mark all of the current parent's notifications as read. */
export async function markAllNotifikasiRead(): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('notifikasi').update({ dibaca: true }).eq('id_ortu', user.id).eq('dibaca', false)
  revalidatePath('/ortu/notifikasi')
}

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserWithRole } from '@/lib/auth/role'

/** IMM-2: staff record a vaccine dose for a child (idempotent per vaccine). */
export async function recordImunisasi(formData: FormData): Promise<void> {
  const { user, role } = await getCurrentUserWithRole()
  if (!user || (role !== 'kader' && role !== 'bidan' && role !== 'admin')) return

  const id_anak = String(formData.get('id_anak') ?? '')
  const id_jenis = String(formData.get('id_jenis') ?? '')
  const tgl_pemberian = String(formData.get('tgl_pemberian') || new Date().toISOString().split('T')[0])
  if (!id_anak || !id_jenis) return

  const supabase = createClient()
  await supabase
    .from('imunisasi_anak')
    .upsert(
      { id_anak, id_jenis, tgl_pemberian, id_pemberi: user.id },
      { onConflict: 'id_anak,id_jenis' }
    )

  revalidatePath(`/kader/anak/${id_anak}`)
  revalidatePath(`/ortu/anak/${id_anak}`)
}

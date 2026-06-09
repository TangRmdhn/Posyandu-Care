'use server'

import { createClient } from '@/lib/supabase/server'
import { registerAnakSchema } from '@/lib/validations/anak.schema'
import { logAudit } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const CONSENT_VERSION = 'v1-2026'

export interface RegisterAnakState {
  error: string | null
}

/**
 * Single validated write path for child registration (INT-1).
 * Used with React `useFormState` from the register page — the client no longer
 * inserts directly; all validation + the uniqueness check happen server-side.
 */
export async function registerAnak(
  _prev: RegisterAnakState,
  formData: FormData
): Promise<RegisterAnakState> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const rawData = {
    nama_anak: formData.get('nama_anak') as string,
    nik: formData.get('nik') as string,
    tgl_lahir: formData.get('tgl_lahir') as string,
    tempat_lahir: formData.get('tempat_lahir') as string,
    jenis_kelamin: formData.get('jenis_kelamin') as string,
    rt: formData.get('rt') as string,
    rw: formData.get('rw') as string,
  }

  const result = registerAnakSchema.safeParse(rawData)
  if (!result.success) {
    const firstErr = Object.values(result.error.flatten().fieldErrors)[0]?.[0]
    return { error: firstErr ?? 'Data tidak valid. Periksa kembali isian Anda.' }
  }

  if (formData.get('consent') !== 'on') {
    return { error: 'Anda harus menyetujui pemrosesan data kesehatan anak.' }
  }

  // VR-02: NIK must be unique
  const { data: existing } = await supabase
    .from('anak')
    .select('id')
    .eq('nik', result.data.nik)
    .maybeSingle()

  if (existing) {
    return { error: 'NIK ini sudah terdaftar di sistem.' }
  }

  const { data: inserted, error } = await supabase
    .from('anak')
    .insert({ ...result.data, id_ortu: user.id })
    .select('id')
    .single()

  if (error) return { error: error.message }

  await supabase.from('consent').insert({
    id_ortu: user.id,
    id_anak: inserted.id,
    notice_version: CONSENT_VERSION,
    granted: true,
  })

  await logAudit({
    actor_id: user.id,
    actor_role: 'ortu',
    action: 'insert',
    entity: 'anak',
    entity_id: inserted.id,
    diff: { nama_anak: result.data.nama_anak },
  })

  revalidatePath('/ortu')
  redirect('/ortu')
}

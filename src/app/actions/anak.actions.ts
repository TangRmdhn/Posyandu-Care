'use server'

import { createClient } from '@/lib/supabase/server'
import { registerAnakSchema } from '@/lib/validations/anak.schema'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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

  // VR-02: NIK must be unique
  const { data: existing } = await supabase
    .from('anak')
    .select('id')
    .eq('nik', result.data.nik)
    .maybeSingle()

  if (existing) {
    return { error: 'NIK ini sudah terdaftar di sistem.' }
  }

  const { error } = await supabase
    .from('anak')
    .insert({ ...result.data, id_ortu: user.id })

  if (error) return { error: error.message }

  revalidatePath('/ortu')
  redirect('/ortu')
}

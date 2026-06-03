'use server'

import { createClient } from '@/lib/supabase/server'
import { registerAnakSchema } from '@/lib/validations/anak.schema'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function registerAnak(formData: FormData) {
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
    return { error: result.error.flatten().fieldErrors }
  }

  // VR-02: Check if NIK already registered
  const { data: existing } = await supabase
    .from('anak')
    .select('id')
    .eq('nik', result.data.nik)
    .maybeSingle()

  if (existing) {
    return { error: { nik: ['This child is already registered in the system.'] } }
  }

  const { error } = await supabase
    .from('anak')
    .insert({ ...result.data, id_ortu: user.id })

  if (error) return { error: { _form: [error.message] } }

  revalidatePath('/ortu')
  redirect('/ortu')
}

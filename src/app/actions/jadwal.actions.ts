'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserWithRole } from '@/lib/auth/role'
import { jadwalSchema, JADWAL_STATUSES, type JadwalStatus } from '@/lib/validations/jadwal.schema'

export interface JadwalState {
  error: string | null
  ok?: boolean
}

async function requireStaff() {
  const { user, role } = await getCurrentUserWithRole()
  if (!user || (role !== 'admin' && role !== 'bidan')) return null
  return user
}

export async function createJadwal(_prev: JadwalState, formData: FormData): Promise<JadwalState> {
  const user = await requireStaff()
  if (!user) return { error: 'Tidak diizinkan.' }

  const parsed = jadwalSchema.safeParse({
    tgl_pelaksanaan: formData.get('tgl_pelaksanaan'),
    jam: formData.get('jam'),
    lokasi: formData.get('lokasi'),
    kuota: formData.get('kuota'),
    catatan: formData.get('catatan') || undefined,
  })
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0]
    return { error: first ?? 'Data tidak valid.' }
  }

  const supabase = createClient()
  const { error } = await supabase.from('jadwal').insert({ ...parsed.data, created_by: user.id })
  if (error) return { error: error.message }

  revalidatePath('/admin/jadwal')
  return { error: null, ok: true }
}

export async function setJadwalStatus(formData: FormData): Promise<void> {
  const user = await requireStaff()
  if (!user) return

  const id = String(formData.get('id') ?? '')
  const status = String(formData.get('status') ?? '') as JadwalStatus
  if (!id || !JADWAL_STATUSES.includes(status)) return

  const supabase = createClient()
  await supabase.from('jadwal').update({ status }).eq('id', id)
  revalidatePath('/admin/jadwal')
}

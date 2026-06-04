'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getCurrentUserWithRole } from '@/lib/auth/role'
import { createAdminClient } from '@/lib/supabase/admin'

const assignSchema = z.object({
  email: z.string().email('Email tidak valid'),
  nama: z.string().min(2, 'Nama wajib diisi'),
  role: z.enum(['kader', 'bidan']),
})

export interface AssignState {
  error: string | null
  ok?: boolean
}

async function findUserByEmail(admin: NonNullable<ReturnType<typeof createAdminClient>>, email: string) {
  const target = email.toLowerCase()
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw new Error(error.message)
    const found = data.users.find((u) => u.email?.toLowerCase() === target)
    if (found) return found
    if (data.users.length < 200) break
  }
  return null
}

/** ADM-3: grant a registered user the kader/bidan role + create their staff row. */
export async function assignStaffRole(_prev: AssignState, formData: FormData): Promise<AssignState> {
  const { role } = await getCurrentUserWithRole()
  if (role !== 'admin') return { error: 'Tidak diizinkan.' }

  const parsed = assignSchema.safeParse({
    email: formData.get('email'),
    nama: formData.get('nama'),
    role: formData.get('role'),
  })
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0]
    return { error: first ?? 'Data tidak valid.' }
  }

  const admin = createAdminClient()
  if (!admin) return { error: 'Konfigurasi server tidak lengkap (service role key tidak ada).' }

  let target
  try {
    target = await findUserByEmail(admin, parsed.data.email)
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Gagal mencari pengguna.' }
  }
  if (!target) {
    return { error: 'Pengguna dengan email ini belum terdaftar. Minta mereka mendaftar terlebih dahulu.' }
  }

  const { error: updErr } = await admin.auth.admin.updateUserById(target.id, {
    app_metadata: { ...target.app_metadata, role: parsed.data.role },
  })
  if (updErr) return { error: updErr.message }

  // Keep profiles.role in sync (get_my_role fallback reads it).
  await admin.from('profiles').update({ role: parsed.data.role, nama: parsed.data.nama }).eq('id', target.id)

  if (parsed.data.role === 'kader') {
    await admin.from('kader').upsert({ id: target.id, nama_kader: parsed.data.nama, email: target.email ?? '' })
  } else {
    await admin.from('bidan_desa').upsert({ id: target.id, nama_bidan: parsed.data.nama, email: target.email ?? '' })
  }

  revalidatePath('/admin/pengguna')
  return { error: null, ok: true }
}

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserWithRole } from '@/lib/auth/role'
import { artikelSchema, slugify } from '@/lib/validations/artikel.schema'

export interface ArtikelState {
  error: string | null
  ok?: boolean
}

async function requireAdmin() {
  const { user, role } = await getCurrentUserWithRole()
  return role === 'admin' ? user : null
}

export async function createArtikel(_prev: ArtikelState, formData: FormData): Promise<ArtikelState> {
  const user = await requireAdmin()
  if (!user) return { error: 'Tidak diizinkan.' }

  const parsed = artikelSchema.safeParse({
    judul: formData.get('judul'),
    ringkasan: formData.get('ringkasan') || undefined,
    konten: formData.get('konten'),
    kategori: formData.get('kategori') || undefined,
  })
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0]
    return { error: first ?? 'Data tidak valid.' }
  }

  const slug = `${slugify(parsed.data.judul)}-${Date.now().toString(36).slice(-4)}`
  const supabase = createClient()
  const { error } = await supabase.from('artikel').insert({
    ...parsed.data,
    slug,
    published: formData.get('published') === 'on',
    created_by: user.id,
  })
  if (error) return { error: error.message }

  revalidatePath('/admin/edukasi')
  revalidatePath('/ortu/edukasi')
  return { error: null, ok: true }
}

export async function toggleArtikelPublish(formData: FormData): Promise<void> {
  if (!(await requireAdmin())) return
  const id = String(formData.get('id') ?? '')
  const published = formData.get('published') === 'true'
  if (!id) return
  const supabase = createClient()
  await supabase.from('artikel').update({ published, updated_at: new Date().toISOString() }).eq('id', id)
  revalidatePath('/admin/edukasi')
  revalidatePath('/ortu/edukasi')
}

export async function deleteArtikel(formData: FormData): Promise<void> {
  if (!(await requireAdmin())) return
  const id = String(formData.get('id') ?? '')
  if (!id) return
  const supabase = createClient()
  await supabase.from('artikel').delete().eq('id', id)
  revalidatePath('/admin/edukasi')
  revalidatePath('/ortu/edukasi')
}

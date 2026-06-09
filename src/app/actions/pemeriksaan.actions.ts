'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserWithRole } from '@/lib/auth/role'
import { calculateNutritionalStatus } from '@/lib/zscore'
import { logAudit } from '@/lib/audit'

export interface EditMeasurementState {
  error: string | null
  ok?: boolean
}

const schema = z.object({
  id: z.string().uuid(),
  berat_badan: z.coerce.number().min(0.5, 'Berat tidak wajar').max(50, 'Berat tidak wajar'),
  tinggi_badan: z.coerce.number().min(30, 'Tinggi tidak wajar').max(150, 'Tinggi tidak wajar'),
})

/** KAD-1: kader/admin correct a measurement before bidan validation (audited). */
export async function updatePemeriksaan(
  _prev: EditMeasurementState,
  formData: FormData
): Promise<EditMeasurementState> {
  const { user, role } = await getCurrentUserWithRole()
  if (!user || (role !== 'kader' && role !== 'admin')) return { error: 'Tidak diizinkan.' }

  const parsed = schema.safeParse({
    id: formData.get('id'),
    berat_badan: formData.get('berat_badan'),
    tinggi_badan: formData.get('tinggi_badan'),
  })
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0]
    return { error: first ?? 'Data tidak valid.' }
  }

  const supabase = createClient()
  const { data: pem } = await supabase
    .from('pemeriksaan')
    .select('id, id_anak, is_validated, anak ( tgl_lahir, jenis_kelamin )')
    .eq('id', parsed.data.id)
    .single()

  if (!pem) return { error: 'Data pemeriksaan tidak ditemukan.' }
  if (pem.is_validated) return { error: 'Sudah divalidasi bidan, tidak bisa diubah.' }

  const anakJoin = pem.anak as unknown as { tgl_lahir: string; jenis_kelamin: string } | { tgl_lahir: string; jenis_kelamin: string }[]
  const anak = Array.isArray(anakJoin) ? anakJoin[0] : anakJoin
  if (!anak) return { error: 'Data anak tidak ditemukan.' }

  const z = calculateNutritionalStatus({
    berat_badan: parsed.data.berat_badan,
    tinggi_badan: parsed.data.tinggi_badan,
    tgl_lahir: anak.tgl_lahir,
    jenis_kelamin: anak.jenis_kelamin as 'L' | 'P',
  })

  const { error } = await supabase
    .from('pemeriksaan')
    .update({
      berat_badan: parsed.data.berat_badan,
      tinggi_badan: parsed.data.tinggi_badan,
      ...z,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq('id', parsed.data.id)

  if (error) return { error: error.message }

  await logAudit({
    actor_id: user.id,
    actor_role: role,
    action: 'update',
    entity: 'pemeriksaan',
    entity_id: parsed.data.id,
    diff: { berat_badan: parsed.data.berat_badan, tinggi_badan: parsed.data.tinggi_badan },
  })

  revalidatePath(`/kader/anak/${pem.id_anak}`)
  return { error: null, ok: true }
}

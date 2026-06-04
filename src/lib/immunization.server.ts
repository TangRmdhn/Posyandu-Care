import { createClient } from '@/lib/supabase/server'
import { deriveImmunizationStatus, type ImmunizationRow } from './immunization'

/** Load the active vaccine schedule + a child's records and build the status rows. */
export async function loadImmunizationRows(idAnak: string, tglLahir: string): Promise<ImmunizationRow[]> {
  const supabase = createClient()
  const [{ data: schedule }, { data: given }] = await Promise.all([
    supabase
      .from('imunisasi_jenis')
      .select('id, kode, nama, dosis_ke, usia_bulan_rekomendasi, urutan')
      .eq('aktif', true),
    supabase.from('imunisasi_anak').select('id_jenis, tgl_pemberian').eq('id_anak', idAnak),
  ])
  return deriveImmunizationStatus(tglLahir, schedule ?? [], given ?? [])
}

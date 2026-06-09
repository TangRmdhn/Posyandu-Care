import { createClient } from '@/lib/supabase/server'
import { ChildBiodataCard } from '@/components/kader/ChildBiodataCard'
import { HealthStatsCard } from '@/components/ortu/HealthStatsCard'
import { ImmunizationList } from '@/components/shared/ImmunizationList'
import { EditMeasurementForm } from '@/components/kader/EditMeasurementForm'
import { loadImmunizationRows } from '@/lib/immunization.server'
import { formatDate, getAgeString } from '@/lib/utils'
import { notFound } from 'next/navigation'

export default async function KaderAnakDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: anak } = await supabase
    .from('anak')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!anak) notFound()

  const imunisasiRows = await loadImmunizationRows(anak.id, anak.tgl_lahir)

  const { data: latest } = await supabase
    .from('pemeriksaan')
    .select('*')
    .eq('id_anak', params.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return (
    <div className="py-6 space-y-4">
      <div className="flex items-center gap-3 px-4">
        <a href="/kader" className="text-brand-blue">←</a>
        <h2 className="text-base font-semibold text-gray-900">Biodata Anak</h2>
      </div>

      <ChildBiodataCard
        namaAnak={anak.nama_anak}
        nik={anak.nik}
        jenisKelamin={anak.jenis_kelamin as 'L' | 'P'}
        tempatLahir={anak.tempat_lahir}
        tanggalLahir={formatDate(anak.tgl_lahir)}
        usiaLabel={getAgeString(anak.tgl_lahir)}
        rt={anak.rt}
        rw={anak.rw}
        fotoUrl={anak.foto_url}
      />

      {latest && (
        <HealthStatsCard
          beratBadan={latest.berat_badan}
          tinggiBadan={latest.tinggi_badan}
          lila={latest.lingkar_lengan_atas}
          lingkarKepala={latest.lingkar_kepala}
        />
      )}

      {latest && !latest.is_validated && (
        <EditMeasurementForm id={latest.id} beratBadan={latest.berat_badan} tinggiBadan={latest.tinggi_badan} />
      )}

      <ImmunizationList rows={imunisasiRows} canRecord idAnak={anak.id} />
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AlertFilterChip } from '@/components/bidan/AlertFilterChip'
import { PatientRiskCard } from '@/components/bidan/PatientRiskCard'
import { CardSkeleton } from '@/components/shared/CardSkeleton'

interface AnakRef {
  id: string
  nama_anak: string
  tgl_lahir: string
  jenis_kelamin: string
}

interface Row {
  id: string
  status_gizi: string | null
  berat_badan: number | null
  lingkar_lengan_atas: number | null
  is_validated: boolean | null
  anak: AnakRef | null
}

export default function BidanDashboardPage() {
  const supabase = createClient()
  const [filter, setFilter] = useState('semua')
  const [patients, setPatients] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPatients() {
      setLoading(true)
      let query = supabase
        .from('pemeriksaan')
        .select(`
          id, status_gizi, berat_badan, lingkar_lengan_atas, is_validated,
          anak ( id, nama_anak, tgl_lahir, jenis_kelamin )
        `)
        .is('is_validated', false)
        .order('created_at', { ascending: false })

      if (filter !== 'semua') {
        query = query.eq('status_gizi', filter)
      }

      const { data } = await query
      setPatients((data as unknown as Row[]) ?? [])
      setLoading(false)
    }
    fetchPatients()
  }, [filter])

  return (
    <div className="py-6 space-y-4">
      <AlertFilterChip activeFilter={filter} onChange={setFilter} />

      <div className="space-y-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
          : patients.map((item) => (
              <PatientRiskCard
                key={item.id}
                id={item.anak?.id ?? ''}
                namaAnak={item.anak?.nama_anak ?? '-'}
                tglLahir={item.anak?.tgl_lahir}
                jenisKelamin={(item.anak?.jenis_kelamin ?? 'L') as 'L' | 'P'}
                statusGizi={item.status_gizi ?? 'Belum Diperiksa'}
                beratBadan={item.berat_badan}
                lila={item.lingkar_lengan_atas}
                butuhRujukan={['Gizi Buruk', 'Stunting'].includes(item.status_gizi ?? '')}
              />
            ))}

        {!loading && patients.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            Tidak ada data pasien yang perlu ditindaklanjuti
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { ScheduleListCard } from '@/components/ortu/ScheduleListCard'
import { ReservationSuccessCard } from '@/components/ortu/ReservationSuccessCard'

interface Jadwal {
  id: string
  tgl_pelaksanaan: string
  jam: string
  lokasi: string
  kuota: number
  kuota_terisi: number
}

interface Anak {
  id: string
  nama_anak: string
}

export default function ReservasiPage() {
  const supabase = createClient()
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([])
  const [anakList, setAnakList] = useState<Anak[]>([])
  const [selectedAnak, setSelectedAnak] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ lokasi: string; no: number } | null>(null)

  useEffect(() => {
    async function load() {
      const today = new Date().toISOString().split('T')[0]
      const { data: { user } } = await supabase.auth.getUser()
      const [{ data: jadwal }, { data: anak }] = await Promise.all([
        supabase.from('jadwal').select('*')
          .gte('tgl_pelaksanaan', today)
          .order('tgl_pelaksanaan', { ascending: true })
          .order('jam', { ascending: true }),
        supabase.from('anak').select('id, nama_anak').eq('id_ortu', user!.id),
      ])
      setJadwalList(jadwal ?? [])
      setAnakList(anak ?? [])
      if (anak && anak.length > 0) setSelectedAnak(anak[0].id)
    }
    load()
  }, [])

  const handlePilih = async (id_jadwal: string) => {
    setError(null)
    if (!selectedAnak) { setError('Pilih anak terlebih dahulu.'); return }
    const res = await fetch('/api/reservasi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_anak: selectedAnak, id_jadwal }),
    })
    const d = await res.json()
    if (!res.ok) { setError(typeof d.error === 'string' ? d.error : 'Gagal membuat reservasi.'); return }
    const jadwal = jadwalList.find(j => j.id === id_jadwal)
    setSuccess({ lokasi: jadwal?.lokasi ?? 'Posyandu', no: d.reservasi.no_antrean })
  }

  if (success) {
    return (
      <div className="px-4 py-6">
        <ReservationSuccessCard namaPosyandu={success.lokasi} noAntrean={success.no} />
      </div>
    )
  }

  return (
    <div className="px-4 py-6 space-y-4">
      <h2 className="text-base font-semibold text-gray-900">Pilih Jadwal Imunisasi</h2>

      <div>
        <label className="text-xs text-gray-500 block mb-1">Pilih Anak</label>
        <select
          value={selectedAnak}
          onChange={e => setSelectedAnak(e.target.value)}
          className="w-full border border-gray-300 rounded-btn px-3 py-2.5 text-sm bg-white
                     focus:outline-none focus:ring-2 focus:ring-brand-blue"
        >
          {anakList.length === 0 && <option value="">Belum ada anak terdaftar</option>}
          {anakList.map(a => <option key={a.id} value={a.id}>{a.nama_anak}</option>)}
        </select>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div>
        {jadwalList.map(j => (
          <ScheduleListCard
            key={j.id}
            id={j.id}
            tanggal={formatDate(j.tgl_pelaksanaan)}
            jam={`${j.jam} WIB`}
            lokasi={j.lokasi}
            kuota={j.kuota}
            kuotaTerisi={j.kuota_terisi}
            onPilih={handlePilih}
          />
        ))}
        {jadwalList.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">Belum ada jadwal tersedia.</p>
        )}
      </div>
    </div>
  )
}

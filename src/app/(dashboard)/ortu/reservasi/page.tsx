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

interface MyReservasi {
  id: string
  status: string
  no_antrean: number | null
  anak: { nama_anak: string } | null
  jadwal: { tgl_pelaksanaan: string; jam: string; lokasi: string } | null
}

const CANCELLABLE = ['pending', 'reviewed', 'verified']

export default function ReservasiPage() {
  const supabase = createClient()
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([])
  const [anakList, setAnakList] = useState<Anak[]>([])
  const [myRes, setMyRes] = useState<MyReservasi[]>([])
  const [selectedAnak, setSelectedAnak] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ lokasi: string; no: number } | null>(null)

  async function loadData() {
    const today = new Date().toISOString().split('T')[0]
    const { data: { user } } = await supabase.auth.getUser()
    const [{ data: jadwal }, { data: anak }, resRes] = await Promise.all([
      supabase.from('jadwal').select('*')
        .gte('tgl_pelaksanaan', today)
        .eq('status', 'open')
        .order('tgl_pelaksanaan', { ascending: true })
        .order('jam', { ascending: true }),
      supabase.from('anak').select('id, nama_anak').eq('id_ortu', user!.id),
      fetch('/api/reservasi').then((r) => r.json()),
    ])
    setJadwalList(jadwal ?? [])
    setAnakList(anak ?? [])
    setMyRes(resRes?.data ?? [])
    if (anak && anak.length > 0) setSelectedAnak((prev) => prev || anak[0].id)
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCancel = async (id: string) => {
    setError(null)
    const res = await fetch('/api/reservasi', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'cancelled' }),
    })
    if (!res.ok) {
      const d = await res.json()
      setError(typeof d.error === 'string' ? d.error : 'Gagal membatalkan reservasi.')
      return
    }
    await loadData()
  }

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

      {myRes.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[13px] font-semibold text-gray-700">Reservasi Saya</h3>
          {myRes.map((r) => (
            <div key={r.id} className="bg-white rounded-card border border-gray-100 shadow-sm p-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate">
                  {r.anak?.nama_anak ?? 'Anak'} · {r.jadwal ? formatDate(r.jadwal.tgl_pelaksanaan) : '-'}
                </p>
                <p className="text-[10px] text-gray-400">
                  {r.jadwal?.lokasi} · No. antrean {r.no_antrean ?? '-'} · {r.status}
                </p>
              </div>
              {CANCELLABLE.includes(r.status) && (
                <button
                  onClick={() => handleCancel(r.id)}
                  className="text-[11px] px-2.5 py-1 rounded-md border border-red-200 text-red-600 hover:bg-red-50 flex-shrink-0"
                >
                  Batalkan
                </button>
              )}
            </div>
          ))}
        </div>
      )}

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

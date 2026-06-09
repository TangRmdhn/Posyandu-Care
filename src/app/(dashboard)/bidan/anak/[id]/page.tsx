'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircleIcon } from 'lucide-react'
import { HealthStatsCard } from '@/components/ortu/HealthStatsCard'
import { GrowthChart } from '@/components/ortu/GrowthChart'
import { getAgeString, formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface Anak {
  id: string
  nama_anak: string
  tgl_lahir: string
  jenis_kelamin: string
}

interface Pemeriksaan {
  id: string
  tgl_pemeriksaan: string
  berat_badan: number | null
  tinggi_badan: number | null
  lingkar_lengan_atas: number | null
  lingkar_kepala: number | null
  status_bb_u: string | null
  status_tb_u: string | null
  status_bb_tb: string | null
  is_validated: boolean | null
  updated_at: string | null
}

export default function BidanAnakDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const [anak, setAnak] = useState<Anak | null>(null)
  const [history, setHistory] = useState<Pemeriksaan[]>([])
  const [saranMedis, setSaranMedis] = useState('')
  const [bantuanMedis, setBantuanMedis] = useState('')
  const [rujukan, setRujukan] = useState(false)
  const [rujukanAlasan, setRujukanAlasan] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const [{ data: anakData }, { data: pemList }] = await Promise.all([
        supabase.from('anak').select('id, nama_anak, tgl_lahir, jenis_kelamin').eq('id', params.id).single(),
        supabase.from('pemeriksaan').select('*').eq('id_anak', params.id).order('tgl_pemeriksaan', { ascending: true }),
      ])
      setAnak(anakData as Anak)
      setHistory((pemList as Pemeriksaan[]) ?? [])
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const latest = history[history.length - 1]
  const pending = [...history].reverse().find((p) => !p.is_validated) ?? latest

  const handleValidate = async () => {
    if (!pending?.id || saranMedis.trim().length < 10) {
      setError('Saran medis minimal 10 karakter.')
      return
    }
    if (rujukan && rujukanAlasan.trim().length < 3) {
      setError('Isi alasan rujukan.')
      return
    }
    setIsSubmitting(true)
    setError(null)

    const response = await fetch('/api/pemeriksaan', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_pemeriksaan: pending.id,
        saran_medis: saranMedis,
        pemberian_bantuan_medis: bantuanMedis || undefined,
        rujukan,
        rujukan_alasan: rujukan ? rujukanAlasan : undefined,
      }),
    })

    if (!response.ok) {
      const result = await response.json()
      setError(typeof result.error === 'string' ? result.error : 'Gagal menyimpan. Coba lagi.')
      setIsSubmitting(false)
      return
    }
    router.push('/bidan')
    router.refresh()
  }

  if (!anak) return <div className="px-4 py-6 text-sm text-gray-400">Memuat...</div>

  const measurements = history.map((p) => ({
    tgl_pemeriksaan: p.tgl_pemeriksaan,
    berat_badan: p.berat_badan,
    tinggi_badan: p.tinggi_badan,
  }))

  return (
    <div className="py-6 space-y-4">
      <div className="mx-4 bg-white rounded-card p-4 shadow-sm border border-gray-100 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center text-brand-blue font-bold text-lg">
          {anak.nama_anak.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{anak.nama_anak}</p>
          <p className="text-xs text-gray-400">
            {getAgeString(anak.tgl_lahir)} · {anak.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
          </p>
        </div>
      </div>

      {latest && (
        <div className="mx-4">
          <HealthStatsCard
            beratBadan={latest.berat_badan}
            tinggiBadan={latest.tinggi_badan}
            lila={latest.lingkar_lengan_atas}
            lingkarKepala={latest.lingkar_kepala}
          />
        </div>
      )}

      {latest && (latest.status_bb_u || latest.status_tb_u || latest.status_bb_tb) && (
        <div className="mx-4 bg-white rounded-card p-4 shadow-sm border border-gray-100 space-y-1">
          <p className="text-[13px] font-semibold text-gray-700 mb-1">Status Gizi (WHO)</p>
          {latest.status_bb_u && <p className="text-xs text-gray-600">BB/U: <span className="font-medium">{latest.status_bb_u}</span></p>}
          {latest.status_tb_u && <p className="text-xs text-gray-600">TB/U: <span className="font-medium">{latest.status_tb_u}</span></p>}
          {latest.status_bb_tb && <p className="text-xs text-gray-600">BB/TB: <span className="font-medium">{latest.status_bb_tb}</span></p>}
          {latest.updated_at && <p className="text-[10px] text-gray-400 mt-1">Terakhir diperbarui {formatDate(latest.updated_at)}</p>}
        </div>
      )}

      {measurements.length > 0 && (
        <GrowthChart sex={anak.jenis_kelamin as 'L' | 'P'} tglLahir={anak.tgl_lahir} measurements={measurements} />
      )}

      <div className="mx-4 bg-white rounded-card p-4 shadow-sm border border-gray-100">
        <p className="text-[13px] font-semibold text-gray-700 mb-2">Riwayat Pengukuran</p>
        <div className="space-y-2">
          {history.map((p) => (
            <div key={p.id} className="text-xs text-gray-600 flex justify-between border-b border-gray-100 last:border-0 pb-1">
              <span>{formatDate(p.tgl_pemeriksaan)}</span>
              <span>{p.berat_badan ?? '-'}kg · {p.tinggi_badan ?? '-'}cm</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-4 bg-white rounded-card p-4 shadow-sm border border-gray-100 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">Pemberian Bantuan</span>
          <span className="text-xs text-gray-400">Obat/Vitamin/Vaksin</span>
        </div>
        <textarea
          value={bantuanMedis}
          onChange={(e) => setBantuanMedis(e.target.value)}
          placeholder="Contoh: Vitamin A 200.000 IU..."
          rows={2}
          className="w-full border border-gray-200 rounded-btn px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
        />

        <label htmlFor="saran" className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">Saran Medis</span>
          <span className="text-red-400 text-xs">*wajib</span>
        </label>
        <textarea
          id="saran"
          value={saranMedis}
          onChange={(e) => setSaranMedis(e.target.value)}
          placeholder="Saran kesehatan, pola makan, jadwal imunisasi..."
          rows={3}
          className="w-full border border-gray-200 rounded-btn px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
        />

        <label className="flex items-center gap-2 pt-1">
          <input type="checkbox" checked={rujukan} onChange={(e) => setRujukan(e.target.checked)} className="w-4 h-4" />
          <span className="text-sm font-medium text-gray-700">Rujuk ke Puskesmas</span>
        </label>
        {rujukan && (
          <textarea
            value={rujukanAlasan}
            onChange={(e) => setRujukanAlasan(e.target.value)}
            placeholder="Alasan rujukan (mis. gizi buruk, perlu pemeriksaan lanjutan)..."
            rows={2}
            aria-label="Alasan rujukan"
            className="w-full border border-red-200 rounded-btn px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
          />
        )}
      </div>

      {error && <p role="alert" className="mx-4 text-xs text-red-500 bg-red-50 p-3 rounded-btn">{error}</p>}

      <div className="mx-4">
        <button
          onClick={handleValidate}
          disabled={isSubmitting || saranMedis.trim().length < 10}
          className="w-full text-white rounded-btn py-3 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ backgroundColor: '#00897B', height: '52px' }}
        >
          <CheckCircleIcon className="w-4 h-4" />
          {isSubmitting ? 'Menyimpan...' : 'Validasi & Kirim'}
        </button>
      </div>
    </div>
  )
}

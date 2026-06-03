'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircleIcon } from 'lucide-react'
import { HealthStatsCard } from '@/components/ortu/HealthStatsCard'
import { getAgeString } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface Anak {
  nama_anak: string
  tgl_lahir: string
  jenis_kelamin: string
}

interface Pemeriksaan {
  id: string
  berat_badan: number | null
  tinggi_badan: number | null
  lingkar_lengan_atas: number | null
  lingkar_kepala: number | null
}

export default function BidanAnakDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const [anak, setAnak] = useState<Anak | null>(null)
  const [pemeriksaan, setPemeriksaan] = useState<Pemeriksaan | null>(null)
  const [saranMedis, setSaranMedis] = useState('')
  const [bantuanMedis, setBantuanMedis] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: anakData } = await supabase
        .from('anak').select('*').eq('id', params.id).single()
      const { data: pemData } = await supabase
        .from('pemeriksaan').select('*')
        .eq('id_anak', params.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      setAnak(anakData as Anak)
      setPemeriksaan(pemData as Pemeriksaan)
    }
    load()
  }, [params.id])

  const handleValidate = async () => {
    if (!pemeriksaan?.id || saranMedis.trim().length < 10) {
      setError('Saran medis minimal 10 karakter.')
      return
    }
    setIsSubmitting(true)
    setError(null)

    const response = await fetch('/api/pemeriksaan', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_pemeriksaan: pemeriksaan.id,
        saran_medis: saranMedis,
        pemberian_bantuan_medis: bantuanMedis || undefined,
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

  if (!anak) return <div className="px-4 py-6 text-sm text-gray-400">Loading...</div>

  return (
    <div className="px-4 py-6 space-y-4">
      <div className="bg-white rounded-card p-4 shadow-sm border border-gray-100 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center
                        text-brand-blue font-bold text-lg">
          {anak.nama_anak.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{anak.nama_anak}</p>
          <p className="text-xs text-gray-400">
            {getAgeString(anak.tgl_lahir)} · {anak.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
          </p>
        </div>
      </div>

      {pemeriksaan && (
        <HealthStatsCard
          beratBadan={pemeriksaan.berat_badan}
          tinggiBadan={pemeriksaan.tinggi_badan}
          lila={pemeriksaan.lingkar_lengan_atas}
          lingkarKepala={pemeriksaan.lingkar_kepala}
        />
      )}

      <div className="bg-white rounded-card p-4 shadow-sm border border-gray-100 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">Pemberian Bantuan</span>
          <span className="text-xs text-gray-400">Obat/Vitamin/Vaksin</span>
        </div>
        <textarea
          value={bantuanMedis}
          onChange={(e) => setBantuanMedis(e.target.value)}
          placeholder="Contoh: Vitamin A 200.000 IU, Imunisasi MR..."
          rows={2}
          className="w-full border border-gray-200 rounded-btn px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
        />

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">Saran Medis</span>
          <span className="text-red-400 text-xs">*wajib diisi</span>
        </div>
        <textarea
          value={saranMedis}
          onChange={(e) => setSaranMedis(e.target.value)}
          placeholder="Masukkan saran kesehatan, pola konsumsi terbaik, atau jadwal imunisasi..."
          rows={3}
          className="w-full border border-gray-200 rounded-btn px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
        />
      </div>

      {error && <p className="text-xs text-red-500 bg-red-50 p-3 rounded-btn">{error}</p>}

      <button
        onClick={handleValidate}
        disabled={isSubmitting || saranMedis.trim().length < 10}
        className="w-full text-white rounded-btn py-3 text-sm font-medium flex items-center
                   justify-center gap-2 disabled:opacity-50"
        style={{ backgroundColor: '#00897B', height: '52px' }}
      >
        <CheckCircleIcon className="w-4 h-4" />
        {isSubmitting ? 'Menyimpan...' : 'Validasi & Kirim'}
      </button>
    </div>
  )
}

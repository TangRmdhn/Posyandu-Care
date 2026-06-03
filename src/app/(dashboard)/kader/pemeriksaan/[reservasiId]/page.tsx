'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SaveIcon } from 'lucide-react'

interface MeasurementField {
  name: string
  label: string
  unit: string
  min: number
  max: number
}

const FIELDS: MeasurementField[] = [
  { name: 'berat_badan',         label: 'Berat Badan',         unit: 'kg', min: 0.5, max: 50  },
  { name: 'tinggi_badan',        label: 'Tinggi Badan',        unit: 'cm', min: 30,  max: 150 },
  { name: 'lingkar_lengan_atas', label: 'Lingkar Lengan Atas', unit: 'cm', min: 5,   max: 40  },
  { name: 'lingkar_kepala',      label: 'Lingkar Kepala',      unit: 'cm', min: 20,  max: 70  },
]

export default function PemeriksaanFormPage({ params }: { params: { reservasiId: string } }) {
  const router = useRouter()
  const [values, setValues] = useState<Record<string, string>>({
    berat_badan: '', tinggi_badan: '', lingkar_lengan_atas: '', lingkar_kepala: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    const response = await fetch('/api/pemeriksaan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_reservasi: params.reservasiId,
        berat_badan: parseFloat(values.berat_badan),
        tinggi_badan: parseFloat(values.tinggi_badan),
        lingkar_lengan_atas: values.lingkar_lengan_atas ? parseFloat(values.lingkar_lengan_atas) : undefined,
        lingkar_kepala: values.lingkar_kepala ? parseFloat(values.lingkar_kepala) : undefined,
      }),
    })

    const result = await response.json()
    if (!response.ok) {
      setError(typeof result.error === 'string' ? result.error : 'Terjadi kesalahan. Coba lagi.')
      setIsSubmitting(false)
      return
    }
    router.push('/kader')
    router.refresh()
  }

  return (
    <div className="px-4 py-6 space-y-4">
      <h2 className="text-base font-semibold text-gray-900">Input Pemeriksaan</h2>

      <div
        className="flex gap-2 items-start"
        style={{ backgroundColor: '#E8F0FB', borderRadius: '8px', padding: '12px' }}
      >
        <div className="w-5 h-5 rounded-full bg-brand-blue flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-white font-bold" style={{ fontSize: '11px' }}>i</span>
        </div>
        <p className="text-brand-blue leading-relaxed" style={{ fontSize: '12px' }}>
          Pastikan timbangan terkalibrasi dan anak tidak menggunakan alas kaki saat pengukuran.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map(({ name, label, unit, min, max }) => (
          <div key={name}>
            <label className="text-gray-400 block mb-1.5" style={{ fontSize: '13px' }}>{label}</label>
            <div className="flex items-center gap-2">
              <input
                type="number" step="0.1" min={min} max={max}
                value={values[name]}
                onChange={(e) => setValues(prev => ({ ...prev, [name]: e.target.value }))}
                placeholder="0.0"
                className="flex-1 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                style={{ backgroundColor: '#F2F2F2', borderRadius: '8px', padding: '10px 12px', fontSize: '16px', width: '100%' }}
              />
              <span className="text-gray-500 text-sm font-medium w-6 flex-shrink-0">{unit}</span>
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-red-500 bg-red-50 rounded-box p-3" style={{ fontSize: '12px' }}>{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !values.berat_badan || !values.tinggi_badan}
        className="w-full bg-brand-blue text-white font-medium flex items-center justify-center
                   gap-2 disabled:opacity-50 transition-opacity"
        style={{ borderRadius: '8px', fontSize: '15px', height: '52px' }}
      >
        <SaveIcon className="w-4 h-4" />
        {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
      </button>
    </div>
  )
}

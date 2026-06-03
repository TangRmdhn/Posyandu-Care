import Link from 'next/link'
import { getAgeInMonths } from '@/lib/zscore'

interface PatientRiskCardProps {
  id: string
  namaAnak: string
  tglLahir?: string | null
  jenisKelamin: 'L' | 'P'
  statusGizi: string
  beratBadan?: number | null
  lila?: number | null
  butuhRujukan?: boolean
}

export function PatientRiskCard({
  id, namaAnak, tglLahir, jenisKelamin,
  statusGizi, lila, butuhRujukan,
}: PatientRiskCardProps) {
  const isHighRisk = ['Gizi Buruk', 'Resiko Tinggi', 'Stunting'].includes(statusGizi)
  const usiaBulan = tglLahir ? getAgeInMonths(tglLahir) : 0

  return (
    <div className="bg-white rounded-card shadow-sm border border-gray-100 p-4 mx-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center
                        flex-shrink-0 text-brand-blue font-semibold text-sm">
          {namaAnak.slice(0, 2).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900 truncate" style={{ fontSize: '14px' }}>
              {namaAnak}
            </span>
            <span
              className="text-white flex-shrink-0"
              style={{
                backgroundColor: isHighRisk ? '#D32F2F' : '#4CAF50',
                fontSize: '11px',
                fontWeight: 500,
                borderRadius: '4px',
                padding: '3px 8px',
              }}
            >
              {isHighRisk ? 'RESIKO TINGGI' : 'GIZI BAIK'}
            </span>
          </div>

          <p className="text-gray-400 mt-0.5" style={{ fontSize: '13px' }}>
            {usiaBulan} Bln · {jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3">
        <div>
          <p className="text-gray-400" style={{ fontSize: '11px' }}>BB/UMUR</p>
          <p className="font-bold mt-0.5" style={{ fontSize: '13px', color: isHighRisk ? '#D32F2F' : '#1F2937' }}>
            {statusGizi}
          </p>
        </div>
        {lila != null && (
          <div>
            <p className="text-gray-400" style={{ fontSize: '11px' }}>LILA</p>
            <p className="font-bold mt-0.5" style={{ fontSize: '13px', color: isHighRisk ? '#D32F2F' : '#1F2937' }}>
              {lila} cm
            </p>
          </div>
        )}
      </div>

      {butuhRujukan && (
        <div className="flex items-center gap-1 mt-2">
          <span className="text-red-500" style={{ fontSize: '12px' }}>⚠</span>
          <span className="text-red-500 font-medium" style={{ fontSize: '12px' }}>Butuh Rujukan</span>
        </div>
      )}

      <div className="flex justify-end mt-3">
        <Link href={`/bidan/anak/${id}`}>
          <button
            className="bg-brand-blue text-white font-medium"
            style={{ borderRadius: '6px', padding: '8px 14px', fontSize: '13px' }}
          >
            Buat Tindakan →
          </button>
        </Link>
      </div>
    </div>
  )
}

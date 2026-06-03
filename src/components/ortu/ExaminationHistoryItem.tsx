interface ExaminationHistoryItemProps {
  tanggal: string
  beratBadan: number
  tinggiBadan: number
  lila?: number | null
  lingkarKepala?: number | null
  saranMedis?: string | null
  isLast?: boolean
}

export function ExaminationHistoryItem({
  tanggal, beratBadan, tinggiBadan, lila, lingkarKepala, saranMedis, isLast,
}: ExaminationHistoryItemProps) {
  return (
    <div className={`flex items-start gap-3 py-3 ${!isLast ? 'border-b border-gray-100' : ''}`}>
      <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center flex-shrink-0">
        <span style={{ fontSize: '14px' }}>📋</span>
      </div>

      <div className="flex-1">
        <p className="font-medium text-gray-700" style={{ fontSize: '13px' }}>{tanggal}</p>
        <p className="text-gray-400 mt-0.5" style={{ fontSize: '13px' }}>
          {beratBadan}kg · {tinggiBadan}cm
          {lila ? ` · LILA ${lila}cm` : ''}
          {lingkarKepala ? ` · Lkr.Kepala ${lingkarKepala}cm` : ''}
        </p>

        {saranMedis && (
          <div className="mt-2 bg-white border-l-4 border-brand-blue pl-3 py-2 rounded-r-box">
            <div className="flex items-center gap-1.5 mb-1">
              <span style={{ fontSize: '12px' }}>🩺</span>
              <span className="text-gray-500" style={{ fontSize: '13px', fontWeight: 500 }}>
                Saran Medis
              </span>
            </div>
            <p className="text-gray-600 leading-relaxed" style={{ fontSize: '13px' }}>
              {saranMedis}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

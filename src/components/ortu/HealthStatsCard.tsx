interface HealthStatsCardProps {
  beratBadan?: number | null
  tinggiBadan?: number | null
  lila?: number | null
  lingkarKepala?: number | null
}

export function HealthStatsCard({ beratBadan, tinggiBadan, lila, lingkarKepala }: HealthStatsCardProps) {
  const metrics = [
    { label: 'Berat', value: beratBadan, unit: 'kg' },
    { label: 'Tinggi', value: tinggiBadan, unit: 'cm' },
    { label: 'LILA', value: lila, unit: 'cm' },
    { label: 'Lkr. Kepala', value: lingkarKepala, unit: 'cm' },
  ]

  return (
    <div className="bg-white rounded-card shadow-sm border border-gray-100 p-4 mx-4">
      <div className="grid grid-cols-4 gap-2">
        {metrics.map(({ label, value, unit }) => (
          <div key={label} className="text-center">
            <p className="font-bold text-gray-900" style={{ fontSize: '18px', lineHeight: '1.2' }}>
              {value != null ? value : <span className="text-gray-300 text-sm">-</span>}
            </p>
            <p className="text-gray-400 mt-0.5" style={{ fontSize: '11px' }}>{unit}</p>
            <p className="text-gray-500 mt-0.5" style={{ fontSize: '11px' }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

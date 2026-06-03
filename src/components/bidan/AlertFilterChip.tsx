'use client'

const FILTERS = [
  { value: 'semua',      label: 'SEMUA' },
  { value: 'Gizi Buruk', label: 'MALNUTRISI' },
  { value: 'Stunting',   label: 'STUNTING' },
  { value: 'Gizi Baik',  label: 'GIZI BAIK' },
]

export function AlertFilterChip({
  activeFilter,
  onChange,
}: {
  activeFilter: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex gap-2 px-4 overflow-x-auto scrollbar-none pb-1">
      {FILTERS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`flex-shrink-0 font-medium transition-colors
                      ${activeFilter === value
                        ? 'bg-brand-blue text-white border border-brand-blue'
                        : 'bg-white text-gray-500 border border-gray-300'}`}
          style={{ borderRadius: '14px', padding: '5px 12px', fontSize: '12px' }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

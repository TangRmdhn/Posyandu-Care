interface ScheduleListCardProps {
  id: string
  tanggal: string
  jam: string
  lokasi: string
  kuota: number
  kuotaTerisi: number
  onPilih: (id: string) => void
}

export function ScheduleListCard({
  id, tanggal, jam, lokasi, kuota, kuotaTerisi, onPilih,
}: ScheduleListCardProps) {
  const sisaKuota = kuota - kuotaTerisi
  const isFull = sisaKuota <= 0

  return (
    <div className={`bg-white rounded-card border shadow-sm p-4
                    ${isFull ? 'border-gray-200 opacity-60' : 'border-gray-100'}`}
         style={{ marginBottom: '8px' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-[14px] font-bold text-gray-900">{tanggal}</p>
          <p className="text-[12px] text-gray-400 mt-0.5">Kuota : {sisaKuota}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[11px] text-gray-400">📍</span>
            <p className="text-[12px] text-gray-500">{lokasi}</p>
          </div>
          <p className="text-[12px] text-gray-400 mt-0.5">🕐 {jam}</p>
        </div>

        {isFull ? (
          <button
            disabled
            className="bg-gray-200 text-gray-400 text-xs font-medium
                       px-4 py-1.5 rounded-btn flex-shrink-0"
          >
            Penuh
          </button>
        ) : (
          <button
            onClick={() => onPilih(id)}
            className="bg-brand-blue text-white text-xs font-medium
                       px-4 py-1.5 rounded-btn flex-shrink-0 hover:bg-brand-blue/90"
          >
            Pilih
          </button>
        )}
      </div>
    </div>
  )
}

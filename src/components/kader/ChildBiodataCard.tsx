interface ChildBiodataCardProps {
  namaAnak: string
  nik: string
  jenisKelamin: 'L' | 'P'
  tempatLahir: string
  tanggalLahir: string
  usiaLabel: string
  rt: string
  rw: string
  fotoUrl?: string | null
}

export function ChildBiodataCard({
  namaAnak, nik, jenisKelamin, tempatLahir,
  tanggalLahir, usiaLabel, rt, rw, fotoUrl,
}: ChildBiodataCardProps) {
  return (
    <div className="bg-white rounded-card border border-gray-100 shadow-sm mx-4 overflow-hidden">
      <div className="flex items-center gap-3 p-[14px] border-b border-gray-100">
        <div
          className="rounded-full bg-brand-light flex items-center justify-center
                     text-brand-blue font-bold overflow-hidden flex-shrink-0"
          style={{ width: '52px', height: '52px' }}
        >
          {fotoUrl
            ? <img src={fotoUrl} alt={namaAnak} className="w-full h-full object-cover" />
            : <span style={{ fontSize: '20px' }}>{namaAnak.slice(0, 1)}</span>
          }
        </div>
        <div>
          <p className="text-gray-900" style={{ fontSize: '18px', fontWeight: 500 }}>{namaAnak}</p>
          <p className="text-gray-400 mt-0.5" style={{ fontSize: '13px' }}>
            {jenisKelamin === 'L' ? '♂ Laki-laki' : '♀ Perempuan'}
          </p>
        </div>
      </div>

      <div className="p-[14px] space-y-4">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <span style={{ fontSize: '13px' }}>🪪</span>
            <p className="font-semibold text-gray-700 uppercase tracking-wide" style={{ fontSize: '11px' }}>
              Identitas Pokok
            </p>
          </div>
          <p className="text-gray-900 font-mono" style={{ fontSize: '14px' }}>{nik}</p>
          <p className="text-gray-500 mt-1" style={{ fontSize: '13px' }}>
            {jenisKelamin === 'L' ? '✓ Laki-laki' : '✓ Perempuan'}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <span style={{ fontSize: '13px' }}>📅</span>
            <p className="font-semibold text-gray-700 uppercase tracking-wide" style={{ fontSize: '11px' }}>
              Data Kelahiran
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-gray-400" style={{ fontSize: '11px' }}>Tempat Lahir</p>
              <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 500 }}>{tempatLahir}</p>
            </div>
            <div>
              <p className="text-gray-400" style={{ fontSize: '11px' }}>Tanggal Lahir</p>
              <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 500 }}>{tanggalLahir}</p>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-gray-400" style={{ fontSize: '11px' }}>Usia Saat Ini</p>
            <p className="font-bold text-brand-teal" style={{ fontSize: '16px' }}>{usiaLabel}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[{ label: 'RT', value: rt.padStart(3, '0') }, { label: 'RW', value: rw.padStart(3, '0') }]
            .map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-box border border-gray-200 p-3 text-center">
                <p className="text-gray-400" style={{ fontSize: '11px' }}>{label}</p>
                <p className="text-gray-900 font-bold" style={{ fontSize: '14px' }}>{value}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

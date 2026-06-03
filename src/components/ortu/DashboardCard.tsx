import Link from 'next/link'

interface DashboardCardProps {
  namaOrtu: string
  namaAnak: string
  usiaLabel: string
  usiaSubLabel: string
  fotoUrl?: string | null
  anakId: string
}

export function DashboardCard({
  namaOrtu, namaAnak, usiaLabel, usiaSubLabel, fotoUrl, anakId,
}: DashboardCardProps) {
  return (
    <div className="px-4 pt-4 space-y-3">
      <div>
        <p className="text-xs text-gray-500">SELAMAT PAGI,</p>
        <p className="text-lg font-bold text-gray-900">Halo, {namaOrtu}</p>
      </div>

      <Link href={`/ortu/anak/${anakId}`}>
        <div className="bg-white rounded-card shadow-sm border border-gray-100
                        flex items-center gap-3 p-3">
          <div className="relative flex-shrink-0">
            {fotoUrl ? (
              <img src={fotoUrl} alt={namaAnak}
                   className="w-11 h-11 rounded-full object-cover" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-brand-light flex items-center
                              justify-center text-brand-blue font-bold text-base">
                {namaAnak.slice(0, 1)}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full
                             bg-green-400 border-2 border-white" />
          </div>

          <div className="flex-1">
            <p className="text-[14px] font-semibold text-gray-900 leading-tight">{namaAnak}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[11px] text-gray-400">Profil Anak</span>
              <span className="text-[11px] text-gray-300">·</span>
              <span className="text-[11px] text-gray-500">{usiaLabel}</span>
              <span className="text-[11px] text-gray-500">{usiaSubLabel}</span>
            </div>
          </div>

          <span className="text-gray-400 text-sm">›</span>
        </div>
      </Link>

      <Link href="/ortu/reservasi">
        <button
          className="w-full bg-brand-teal text-white rounded-btn text-[14px] font-medium
                     flex items-center justify-center gap-2 py-3"
        >
          <span className="text-lg leading-none">⊕</span>
          Buat Reservasi
        </button>
      </Link>
    </div>
  )
}

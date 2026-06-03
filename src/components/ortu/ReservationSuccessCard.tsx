interface ReservationSuccessCardProps {
  namaPosyandu: string
  noAntrean: number
}

export function ReservationSuccessCard({ namaPosyandu, noAntrean }: ReservationSuccessCardProps) {
  return (
    <div
      className="rounded-card p-6 text-white text-center"
      style={{ backgroundColor: '#1A73C1' }}
    >
      <p className="text-sm opacity-80 mb-2">Reservasi Berhasil</p>
      <p className="font-bold leading-tight" style={{ fontSize: '28px' }}>
        {namaPosyandu}
      </p>
      <div className="mt-4 bg-white/20 rounded-xl py-4 px-8 inline-block">
        <p className="text-xs opacity-80 mb-1">Nomor Antrean</p>
        <p className="font-bold tracking-widest" style={{ fontSize: '28px' }}>
          {String(noAntrean).padStart(3, '0')}
        </p>
      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

type AnakRef = { nama_anak: string; rt: string; rw: string } | null

export default async function KaderDashboardPage() {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: antrean } = await supabase
    .from('reservasi')
    .select(`
      id,
      no_antrean,
      status,
      anak ( id, nama_anak, rt, rw, foto_url ),
      jadwal!inner ( tgl_pelaksanaan, jam, lokasi )
    `)
    .eq('jadwal.tgl_pelaksanaan', today)
    .in('status', ['pending', 'reviewed'])
    .order('no_antrean', { ascending: true })

  const totalBalita = antrean?.length ?? 0
  const menunggu = antrean?.filter(a => a.status === 'pending').length ?? 0

  return (
    <div className="px-4 py-6 space-y-4">
      <div className="bg-brand-blue rounded-card p-4 text-white">
        <p className="font-semibold text-base">Selamat Pagi!</p>
        <p className="text-sm opacity-90">Hari ini ada pelaksanaan Posyandu</p>
      </div>

      <div className="bg-white rounded-card p-4 shadow-sm border border-gray-100">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[28px] font-bold text-gray-900">{totalBalita}</p>
            <p className="text-xs text-gray-500">Total Balita</p>
            <p className="text-xs text-green-600 font-medium">Hadir hari ini</p>
          </div>
          <div>
            <p className="text-[28px] font-bold text-gray-900">{menunggu}</p>
            <p className="text-xs text-gray-500">Antrean Menunggu</p>
          </div>
        </div>
      </div>

      <h3 className="text-sm font-semibold text-gray-700">Antrean Hari Ini</h3>
      <div className="space-y-2">
        {antrean?.map((item) => {
          const anak = item.anak as AnakRef
          return (
            <div key={item.id}
              className="bg-white rounded-card px-4 py-3 shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-light rounded-full flex items-center justify-center
                              text-brand-blue font-bold text-sm flex-shrink-0">
                {item.no_antrean}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">{anak?.nama_anak ?? '-'}</p>
                <p className="text-xs text-gray-400">RT {anak?.rt} / RW {anak?.rw}</p>
              </div>
              <Link href={`/kader/pemeriksaan/${item.id}`}>
                <button className="bg-brand-blue text-white text-xs px-3 py-1.5 rounded-btn">Pilih</button>
              </Link>
            </div>
          )
        })}

        {(!antrean || antrean.length === 0) && (
          <div className="text-center py-8 text-gray-400 text-sm">Belum ada antrean untuk hari ini</div>
        )}
      </div>
    </div>
  )
}

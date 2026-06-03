import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

type AnakRef = { nama_anak: string; rt: string; rw: string } | null

export default async function KaderAntreanPage() {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: antrean } = await supabase
    .from('reservasi')
    .select(`
      id, no_antrean, status,
      anak ( id, nama_anak, rt, rw ),
      jadwal!inner ( tgl_pelaksanaan )
    `)
    .eq('jadwal.tgl_pelaksanaan', today)
    .order('no_antrean', { ascending: true })

  return (
    <div className="px-4 py-6 space-y-3">
      <h2 className="text-base font-semibold text-gray-900">Antrean Hari Ini</h2>
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
              <p className="text-xs text-gray-400">RT {anak?.rt} / RW {anak?.rw} · {item.status}</p>
            </div>
            <Link href={`/kader/pemeriksaan/${item.id}`}>
              <button className="bg-brand-blue text-white text-xs px-3 py-1.5 rounded-btn">Periksa</button>
            </Link>
          </div>
        )
      })}
      {(!antrean || antrean.length === 0) && (
        <p className="text-center text-sm text-gray-400 py-8">Belum ada antrean.</p>
      )}
    </div>
  )
}

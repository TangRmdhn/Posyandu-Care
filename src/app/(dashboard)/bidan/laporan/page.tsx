import { createClient } from '@/lib/supabase/server'
import { getStatusColor } from '@/lib/utils'

export default async function BidanLaporanPage() {
  const supabase = createClient()

  const { data: pemeriksaan } = await supabase
    .from('pemeriksaan')
    .select('status_gizi')

  const counts: Record<string, number> = {}
  for (const p of pemeriksaan ?? []) {
    const s = p.status_gizi ?? 'Belum Diperiksa'
    counts[s] = (counts[s] ?? 0) + 1
  }
  const total = pemeriksaan?.length ?? 0

  return (
    <div className="px-4 py-6 space-y-4">
      <h2 className="text-base font-semibold text-gray-900">Laporan Status Gizi</h2>

      <div className="bg-white rounded-card p-4 shadow-sm border border-gray-100">
        <p className="text-[28px] font-bold text-gray-900">{total}</p>
        <p className="text-xs text-gray-500">Total Pemeriksaan</p>
      </div>

      <div className="space-y-2">
        {Object.entries(counts).map(([status, n]) => (
          <div key={status}
            className="bg-white rounded-card px-4 py-3 shadow-sm border border-gray-100 flex items-center justify-between">
            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(status)}`}>{status}</span>
            <span className="font-bold text-gray-900">{n}</span>
          </div>
        ))}
        {total === 0 && <p className="text-center text-sm text-gray-400 py-8">Belum ada data.</p>}
      </div>
    </div>
  )
}

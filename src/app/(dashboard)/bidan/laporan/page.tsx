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

  // Immunization coverage: doses given per vaccine vs registered children.
  const [{ count: childCount }, { data: vaccines }, { data: given }] = await Promise.all([
    supabase.from('anak').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('imunisasi_jenis').select('id, nama, urutan').eq('aktif', true).order('urutan'),
    supabase.from('imunisasi_anak').select('id_jenis'),
  ])
  const givenPerJenis = new Map<string, number>()
  for (const g of given ?? []) givenPerJenis.set(g.id_jenis, (givenPerJenis.get(g.id_jenis) ?? 0) + 1)
  const totalChildren = childCount ?? 0

  return (
    <div className="px-4 py-6 space-y-4">
      <h2 className="text-base font-semibold text-gray-900">Laporan Status Gizi</h2>

      <form action="/api/laporan/export" method="get" className="bg-white rounded-card p-4 shadow-sm border border-gray-100 space-y-3">
        <p className="text-[13px] font-semibold text-gray-700">Ekspor ke Puskesmas (CSV)</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="from" className="text-xs text-gray-500 block mb-1">Dari tanggal</label>
            <input id="from" name="from" type="date" className="w-full border border-gray-300 rounded-btn px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="to" className="text-xs text-gray-500 block mb-1">Sampai tanggal</label>
            <input id="to" name="to" type="date" className="w-full border border-gray-300 rounded-btn px-3 py-2 text-sm" />
          </div>
        </div>
        <button type="submit" className="w-full bg-brand-teal text-white rounded-btn py-2.5 text-sm font-medium">Unduh CSV</button>
        <p className="text-[10px] text-gray-400">Kosongkan tanggal untuk mengekspor semua data.</p>
      </form>

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

      <section className="space-y-2">
        <h3 className="text-[13px] font-semibold text-gray-700">Cakupan Imunisasi ({totalChildren} anak)</h3>
        {(vaccines ?? []).map((v) => {
          const n = givenPerJenis.get(v.id) ?? 0
          const pct = totalChildren > 0 ? Math.round((n / totalChildren) * 100) : 0
          return (
            <div key={v.id} className="bg-white rounded-card px-4 py-2.5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-700">{v.nama}</span>
                <span className="text-xs font-medium text-gray-900">{pct}% ({n})</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-teal" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
        {totalChildren === 0 && <p className="text-xs text-gray-400">Belum ada anak terdaftar.</p>}
      </section>
    </div>
  )
}

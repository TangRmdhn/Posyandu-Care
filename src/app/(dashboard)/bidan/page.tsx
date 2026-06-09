import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PatientRiskCard } from '@/components/bidan/PatientRiskCard'

const PAGE_SIZE = 20
const STATUSES = ['Gizi Buruk', 'Gizi Kurang', 'Stunting', 'Resiko Tinggi', 'Gizi Baik']

interface AnakRef {
  id: string
  nama_anak: string
  tgl_lahir: string
  jenis_kelamin: string
}
interface Row {
  id: string
  status_gizi: string | null
  berat_badan: number | null
  lingkar_lengan_atas: number | null
  rujukan: boolean | null
  anak: AnakRef | null
}

export default async function BidanDashboardPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; page?: string }
}) {
  const supabase = createClient()
  const q = (searchParams.q ?? '').trim()
  const status = searchParams.status ?? ''
  const page = Math.max(1, Number(searchParams.page ?? '1') || 1)
  const from = (page - 1) * PAGE_SIZE

  let query = supabase
    .from('pemeriksaan')
    .select(
      'id, status_gizi, berat_badan, lingkar_lengan_atas, rujukan, anak!inner ( id, nama_anak, tgl_lahir, jenis_kelamin )',
      { count: 'exact' }
    )
    .is('is_validated', false)
    .order('created_at', { ascending: false })
    .range(from, from + PAGE_SIZE - 1)

  if (status) query = query.eq('status_gizi', status)
  if (q) query = query.ilike('anak.nama_anak', `%${q}%`)

  const { data, count } = await query
  const rows = (data as unknown as Row[]) ?? []
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE))

  const linkFor = (params: Record<string, string | number>) => {
    const sp = new URLSearchParams()
    if (q) sp.set('q', q)
    if (status) sp.set('status', status)
    for (const [k, v] of Object.entries(params)) sp.set(k, String(v))
    return `/bidan?${sp.toString()}`
  }

  return (
    <div className="py-6 space-y-4 px-4">
      <h2 className="text-base font-semibold text-gray-900">Pasien Perlu Validasi</h2>

      <form action="/bidan" method="get" className="flex gap-2">
        {status && <input type="hidden" name="status" value={status} />}
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari nama anak..."
          aria-label="Cari nama anak"
          className="flex-1 border border-gray-300 rounded-btn px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
        />
        <button type="submit" className="bg-brand-teal text-white rounded-btn px-4 text-sm">Cari</button>
      </form>

      <div className="flex gap-1.5 flex-wrap" role="group" aria-label="Filter status">
        <Link href={linkFor({ page: 1, status: '' })}
          className={`text-[11px] px-2.5 py-1 rounded-full border ${!status ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-gray-600 border-gray-200'}`}>
          Semua
        </Link>
        {STATUSES.map((s) => (
          <Link key={s} href={linkFor({ page: 1, status: s })}
            className={`text-[11px] px-2.5 py-1 rounded-full border ${status === s ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-gray-600 border-gray-200'}`}>
            {s}
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        {rows.map((item) => (
          <PatientRiskCard
            key={item.id}
            id={item.anak?.id ?? ''}
            namaAnak={item.anak?.nama_anak ?? '-'}
            tglLahir={item.anak?.tgl_lahir}
            jenisKelamin={(item.anak?.jenis_kelamin ?? 'L') as 'L' | 'P'}
            statusGizi={item.status_gizi ?? 'Belum Diperiksa'}
            beratBadan={item.berat_badan}
            lila={item.lingkar_lengan_atas}
            butuhRujukan={item.rujukan ?? ['Gizi Buruk', 'Stunting'].includes(item.status_gizi ?? '')}
          />
        ))}
        {rows.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">Tidak ada data pasien yang perlu ditindaklanjuti</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          {page > 1
            ? <Link href={linkFor({ page: page - 1 })} className="text-xs text-brand-blue">← Sebelumnya</Link>
            : <span />}
          <span className="text-xs text-gray-400">Hal {page} / {totalPages}</span>
          {page < totalPages
            ? <Link href={linkFor({ page: page + 1 })} className="text-xs text-brand-blue">Berikutnya →</Link>
            : <span />}
        </div>
      )}
    </div>
  )
}

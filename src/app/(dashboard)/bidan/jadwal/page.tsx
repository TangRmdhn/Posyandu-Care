import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserWithRole } from '@/lib/auth/role'
import { formatDate } from '@/lib/utils'
import { CreateJadwalForm } from '@/components/admin/CreateJadwalForm'
import { setJadwalStatus } from '@/app/actions/jadwal.actions'

const STATUS_LABEL: Record<string, string> = {
  open: 'Dibuka', closed: 'Ditutup', done: 'Selesai', cancelled: 'Dibatalkan',
}
const STATUS_TONE: Record<string, string> = {
  open: 'bg-green-100 text-green-700',
  closed: 'bg-amber-100 text-amber-700',
  done: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
}
const ACTIONS: { status: string; label: string }[] = [
  { status: 'open', label: 'Buka' },
  { status: 'closed', label: 'Tutup' },
  { status: 'done', label: 'Selesai' },
  { status: 'cancelled', label: 'Batal' },
]

export default async function BidanJadwalPage() {
  const { role } = await getCurrentUserWithRole()
  if (role !== 'admin' && role !== 'bidan') redirect('/login')

  const supabase = createClient()
  const { data: list } = await supabase
    .from('jadwal')
    .select('*')
    .order('tgl_pelaksanaan', { ascending: false })
    .order('jam', { ascending: true })

  return (
    <div className="px-4 py-6 space-y-4">
      <h2 className="text-base font-semibold text-gray-900">Jadwal Vaksin & Posyandu</h2>

      <CreateJadwalForm />

      <div className="space-y-3">
        {(list ?? []).map((j) => (
          <div key={j.id} className="bg-white rounded-card border border-gray-100 shadow-sm p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">{formatDate(j.tgl_pelaksanaan)} · {j.jam} WIB</p>
                <p className="text-xs text-gray-500">{j.lokasi}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Kuota {j.kuota_terisi}/{j.kuota}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_TONE[j.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {STATUS_LABEL[j.status] ?? j.status}
              </span>
            </div>
            <div className="flex gap-1.5 mt-3 flex-wrap">
              {ACTIONS.filter((a) => a.status !== j.status).map((a) => (
                <form key={a.status} action={setJadwalStatus}>
                  <input type="hidden" name="id" value={j.id} />
                  <input type="hidden" name="status" value={a.status} />
                  <button type="submit" className="text-[11px] px-2.5 py-1 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50">
                    {a.label}
                  </button>
                </form>
              ))}
            </div>
          </div>
        ))}
        {(!list || list.length === 0) && (
          <p className="text-center text-sm text-gray-400 py-8">Belum ada jadwal.</p>
        )}
      </div>
    </div>
  )
}

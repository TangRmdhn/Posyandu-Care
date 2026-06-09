import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { markAllNotifikasiRead } from '@/app/actions/notifikasi.actions'

const TONE: Record<string, string> = {
  sesi: 'border-l-brand-blue',
  imunisasi: 'border-l-red-400',
  hasil: 'border-l-green-500',
  umum: 'border-l-gray-300',
}

export default async function NotifikasiPage() {
  const supabase = createClient()
  const { data: list } = await supabase
    .from('notifikasi')
    .select('id, judul, pesan, tipe, dibaca, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  const hasUnread = (list ?? []).some((n) => !n.dibaca)

  return (
    <div className="px-4 py-6 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Notifikasi</h2>
        {hasUnread && (
          <form action={markAllNotifikasiRead}>
            <button type="submit" className="text-xs text-brand-blue">Tandai sudah dibaca</button>
          </form>
        )}
      </div>

      {(list ?? []).map((n) => (
        <div key={n.id}
          className={`bg-white rounded-card p-3 shadow-sm border border-gray-100 border-l-4 ${TONE[n.tipe] ?? 'border-l-gray-300'} ${n.dibaca ? 'opacity-70' : ''}`}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-800">{n.judul}</p>
            {!n.dibaca && <span className="w-2 h-2 rounded-full bg-brand-blue" aria-label="Belum dibaca" />}
          </div>
          <p className="text-xs text-gray-600 mt-0.5">{n.pesan}</p>
          {n.created_at && <p className="text-[10px] text-gray-400 mt-1">{formatDate(n.created_at)}</p>}
        </div>
      ))}
      {(!list || list.length === 0) && (
        <p className="text-center text-sm text-gray-400 py-8">Belum ada notifikasi.</p>
      )}
    </div>
  )
}

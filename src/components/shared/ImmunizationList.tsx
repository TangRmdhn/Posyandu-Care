import { recordImunisasi } from '@/app/actions/imunisasi.actions'
import { immunizationSummary, type ImmunizationRow, type ImmunizationStatus } from '@/lib/immunization'
import { formatDate } from '@/lib/utils'

const TONE: Record<ImmunizationStatus, string> = {
  done: 'bg-green-100 text-green-700',
  upcoming: 'bg-blue-100 text-blue-700',
  overdue: 'bg-red-100 text-red-700',
}
const LABEL: Record<ImmunizationStatus, string> = {
  done: 'Sudah',
  upcoming: 'Akan datang',
  overdue: 'Terlambat',
}

export function ImmunizationList({
  rows,
  canRecord,
  idAnak,
}: {
  rows: ImmunizationRow[]
  canRecord: boolean
  idAnak: string
}) {
  const s = immunizationSummary(rows)

  return (
    <div className="bg-white rounded-card border border-gray-100 shadow-sm p-4 mx-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-semibold text-gray-700">Imunisasi</p>
        <p className="text-[10px] text-gray-400">
          {s.done} sudah · {s.upcoming} akan datang · {s.overdue} terlambat
        </p>
      </div>

      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.jenis.id} className="flex items-center justify-between gap-2 border-b border-gray-100 last:border-0 pb-2 last:pb-0">
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">{r.jenis.nama}</p>
              <p className="text-[10px] text-gray-400">
                {r.status === 'done' && r.givenDate ? `Diberikan ${formatDate(r.givenDate)}` : `Jadwal ${formatDate(r.dueDate)}`}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${TONE[r.status]}`}>{LABEL[r.status]}</span>
              {canRecord && r.status !== 'done' && (
                <form action={recordImunisasi}>
                  <input type="hidden" name="id_anak" value={idAnak} />
                  <input type="hidden" name="id_jenis" value={r.jenis.id} />
                  <button type="submit" className="text-[10px] px-2 py-1 rounded-md bg-brand-teal text-white">Catat</button>
                </form>
              )}
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="text-xs text-gray-400">Jadwal imunisasi belum tersedia.</p>}
      </div>
    </div>
  )
}

/** Immunization scheduling helpers (pure). Drives the parent card + kader checklist. */

export interface VaccineSchedule {
  id: string
  kode: string
  nama: string
  dosis_ke: number
  usia_bulan_rekomendasi: number
  urutan: number
}

export interface VaccineGiven {
  id_jenis: string
  tgl_pemberian: string
}

export type ImmunizationStatus = 'done' | 'upcoming' | 'overdue'

export interface ImmunizationRow {
  jenis: VaccineSchedule
  status: ImmunizationStatus
  /** ISO date the dose is due (birth + recommended age). */
  dueDate: string
  /** ISO date the dose was given, when status === 'done'. */
  givenDate?: string
}

function addMonths(iso: string, months: number): Date {
  const d = new Date(iso)
  d.setMonth(d.getMonth() + months)
  return d
}

/**
 * Build the per-vaccine immunization view for one child: done / upcoming / overdue,
 * with due dates derived from birth date + recommended age.
 */
export function deriveImmunizationStatus(
  tglLahir: string,
  schedule: VaccineSchedule[],
  given: VaccineGiven[],
  now: Date = new Date()
): ImmunizationRow[] {
  const givenMap = new Map(given.map((g) => [g.id_jenis, g.tgl_pemberian]))
  const today = new Date(now.toISOString().split('T')[0])

  return [...schedule]
    .sort((a, b) => a.urutan - b.urutan)
    .map((jenis) => {
      const givenDate = givenMap.get(jenis.id)
      const due = addMonths(tglLahir, jenis.usia_bulan_rekomendasi)
      const dueDate = due.toISOString().split('T')[0]
      if (givenDate) return { jenis, status: 'done' as const, dueDate, givenDate }
      const status: ImmunizationStatus = due <= today ? 'overdue' : 'upcoming'
      return { jenis, status, dueDate }
    })
}

export function immunizationSummary(rows: ImmunizationRow[]) {
  return {
    done: rows.filter((r) => r.status === 'done').length,
    upcoming: rows.filter((r) => r.status === 'upcoming').length,
    overdue: rows.filter((r) => r.status === 'overdue').length,
    total: rows.length,
  }
}

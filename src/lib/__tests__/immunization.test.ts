import { describe, it, expect } from 'vitest'
import { deriveImmunizationStatus, immunizationSummary, type VaccineSchedule } from '../immunization'

const schedule: VaccineSchedule[] = [
  { id: 'a', kode: 'HB0', nama: 'Hepatitis B', dosis_ke: 1, usia_bulan_rekomendasi: 0, urutan: 1 },
  { id: 'b', kode: 'MR9', nama: 'Campak-Rubella', dosis_ke: 1, usia_bulan_rekomendasi: 9, urutan: 2 },
]

describe('deriveImmunizationStatus', () => {
  const now = new Date('2026-06-01')

  it('marks a not-yet-due vaccine as upcoming', () => {
    const rows = deriveImmunizationStatus('2026-05-01', schedule, [], now) // ~1 month old
    expect(rows.find((r) => r.jenis.kode === 'MR9')?.status).toBe('upcoming')
  })

  it('marks a past-due vaccine as overdue', () => {
    const rows = deriveImmunizationStatus('2024-06-01', schedule, [], now) // 2 years old
    expect(rows.find((r) => r.jenis.kode === 'MR9')?.status).toBe('overdue')
  })

  it('marks a recorded vaccine as done with its date', () => {
    const rows = deriveImmunizationStatus(
      '2026-05-01',
      schedule,
      [{ id_jenis: 'a', tgl_pemberian: '2026-05-02' }],
      now
    )
    const hb0 = rows.find((r) => r.jenis.kode === 'HB0')
    expect(hb0?.status).toBe('done')
    expect(hb0?.givenDate).toBe('2026-05-02')
  })

  it('orders rows by urutan', () => {
    const rows = deriveImmunizationStatus('2026-05-01', schedule, [], now)
    expect(rows.map((r) => r.jenis.kode)).toEqual(['HB0', 'MR9'])
  })

  it('summary counts add up', () => {
    const rows = deriveImmunizationStatus('2024-06-01', schedule, [{ id_jenis: 'a', tgl_pemberian: '2024-06-02' }], now)
    const s = immunizationSummary(rows)
    expect(s.total).toBe(2)
    expect(s.done + s.upcoming + s.overdue).toBe(2)
  })
})

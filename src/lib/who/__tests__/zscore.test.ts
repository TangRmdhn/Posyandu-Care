import { describe, it, expect } from 'vitest'
import { zFromLMS, valueFromZ } from '../lms'
import { lookupLMS } from '../loadTable'
import { WFA, HFA, WFL, WFH } from '../tables'
import { assessGrowth } from '../index'
import { classifyIndicator } from '../classify'
import type { WhoTable } from '../types'
import sdLines from './fixtures/who_sd_lines.json'

const ALL_TABLES: WhoTable[] = [WFA.L, WFA.P, HFA.L, HFA.P, WFL.L, WFL.P, WFH.L, WFH.P]

describe('zFromLMS / valueFromZ core', () => {
  it('value at the median gives z = 0', () => {
    for (const t of ALL_TABLES) {
      for (const [, l, m, s] of t.rows) {
        expect(zFromLMS(m, { l, m, s })).toBeCloseTo(0, 9)
      }
    }
  })

  it('valueFromZ and zFromLMS round-trip within ±3 SD', () => {
    for (const t of ALL_TABLES) {
      for (const [, l, m, s] of t.rows) {
        for (const z of [-3, -2, -1, -0.5, 0, 0.5, 1, 2, 3]) {
          const x = valueFromZ(z, { l, m, s })
          expect(zFromLMS(x, { l, m, s })).toBeCloseTo(z, 6)
        }
      }
    }
  })

  it('handles L = 0 (log) branch', () => {
    const lms = { l: 0, m: 50, s: 0.04 }
    expect(zFromLMS(50, lms)).toBeCloseTo(0, 9)
    const x = valueFromZ(1.5, lms)
    expect(zFromLMS(x, lms)).toBeCloseTo(1.5, 9)
  })
})

describe('matches WHO published −3..+3 SD reference lines', () => {
  // WHO publishes its SD lines rounded to 1 decimal; allow that rounding slack.
  // WHO publishes its SD lines rounded to 1 decimal; allow that rounding slack.
  // (The reverse direction — z from a 1-dp-rounded value — is intentionally not
  // asserted: rounding amplifies to ~0.25 z at the skewed tails. The round-trip
  // test above already pins zFromLMS↔valueFromZ to ±1e-6.)
  it('valueFromZ reproduces WHO published SD values within rounding', () => {
    for (const f of sdLines as any[]) {
      for (const [z, published] of Object.entries(f.sd)) {
        const got = valueFromZ(Number(z), f.lms)
        expect(Math.abs(got - (published as number))).toBeLessThanOrEqual(0.06)
      }
    }
  })
})

describe('extreme-tail clamp (WHO Anthro behaviour)', () => {
  const lms = lookupLMS(WFA.L, 0).lms // boy birth: L=0.3487, M=3.3464, S=0.14602

  it('is continuous at z = 3', () => {
    const at3 = valueFromZ(3, lms)
    expect(zFromLMS(at3, lms)).toBeCloseTo(3, 6)
    const justOver = zFromLMS(at3 + 1e-6, lms)
    expect(justOver).toBeGreaterThan(3)
    expect(justOver).toBeLessThan(3.01)
  })

  it('is continuous at z = -3 and monotonic into the tail', () => {
    const atNeg3 = valueFromZ(-3, lms)
    expect(zFromLMS(atNeg3, lms)).toBeCloseTo(-3, 6)
    const lower = zFromLMS(atNeg3 - 0.5, lms)
    const higher = zFromLMS(atNeg3 - 0.1, lms)
    expect(lower).toBeLessThan(higher)
    expect(higher).toBeLessThan(-3)
  })
})

describe('assessGrowth integration', () => {
  it('a boy at birth measuring the median weight is normal weight-for-age', () => {
    const r = assessGrowth({ berat_badan: 3.3464, jenis_kelamin: 'L', ageMonths: 0 })
    expect(r.bb_u.z).toBeCloseTo(0, 2)
    expect(r.bb_u.status?.label).toBe('Berat Badan Normal')
  })

  it('uses weight-for-LENGTH below 24m and weight-for-HEIGHT at/above 24m', () => {
    const below = assessGrowth({ berat_badan: 12, tinggi_badan: 87, jenis_kelamin: 'L', ageMonths: 23 })
    const atOrAbove = assessGrowth({ berat_badan: 12, tinggi_badan: 87, jenis_kelamin: 'L', ageMonths: 25 })
    expect(below.bb_tb.z).not.toBeNull()
    expect(atOrAbove.bb_tb.z).not.toBeNull()
    // different reference tables → different z for the same weight/height
    expect(below.bb_tb.z).not.toBeCloseTo(atOrAbove.bb_tb.z as number, 3)
  })

  it('applies the 0.7cm length/height correction only when needed', () => {
    // <24m measured standing → +0.7cm added before lookup
    const corrected = assessGrowth({ berat_badan: 12, tinggi_badan: 87, jenis_kelamin: 'L', ageMonths: 12, measuredLying: false })
    const asIs = assessGrowth({ berat_badan: 12, tinggi_badan: 87.7, jenis_kelamin: 'L', ageMonths: 12 })
    expect(corrected.tb_u.z).toBeCloseTo(asIs.tb_u.z as number, 6)
  })

  it('returns null indicators when height is absent', () => {
    const r = assessGrowth({ berat_badan: 9, jenis_kelamin: 'P', ageMonths: 10 })
    expect(r.tb_u.z).toBeNull()
    expect(r.bb_tb.z).toBeNull()
    expect(r.bb_u.z).not.toBeNull()
  })
})

describe('classifyIndicator — Kemenkes / Permenkes 2/2020 cutoffs', () => {
  it('tb_u (stunting) bands', () => {
    expect(classifyIndicator('tb_u', -3.5)?.label).toBe('Sangat Pendek')
    expect(classifyIndicator('tb_u', -2.5)?.label).toBe('Pendek')
    expect(classifyIndicator('tb_u', 0)?.label).toBe('Normal')
    expect(classifyIndicator('tb_u', 3.5)?.label).toBe('Tinggi')
  })

  it('bb_u (underweight) bands', () => {
    expect(classifyIndicator('bb_u', -3.5)?.label).toBe('Berat Badan Sangat Kurang')
    expect(classifyIndicator('bb_u', -2.5)?.label).toBe('Berat Badan Kurang')
    expect(classifyIndicator('bb_u', 0)?.label).toBe('Berat Badan Normal')
    expect(classifyIndicator('bb_u', 2)?.label).toBe('Risiko Berat Badan Lebih')
  })

  it('bb_tb (wasting/overweight) bands', () => {
    expect(classifyIndicator('bb_tb', -3.5)?.label).toBe('Gizi Buruk')
    expect(classifyIndicator('bb_tb', -2.5)?.label).toBe('Gizi Kurang')
    expect(classifyIndicator('bb_tb', 0)?.label).toBe('Gizi Baik')
    expect(classifyIndicator('bb_tb', 1.5)?.label).toBe('Risiko Gizi Lebih')
    expect(classifyIndicator('bb_tb', 2.5)?.label).toBe('Gizi Lebih')
    expect(classifyIndicator('bb_tb', 3.5)?.label).toBe('Obesitas')
  })

  it('returns null for null/NaN z', () => {
    expect(classifyIndicator('bb_u', null)).toBeNull()
    expect(classifyIndicator('bb_u', NaN)).toBeNull()
  })
})

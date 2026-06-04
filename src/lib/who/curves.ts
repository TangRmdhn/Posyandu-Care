import { valueFromZ } from './lms'
import { lookupLMS } from './loadTable'
import { WFA, HFA, WFL, WFH } from './tables'
import type { Sex } from './types'

/** One x-position with the −3 / −2 / median / +2 / +3 reference values. */
export interface Band {
  x: number
  n3: number
  n2: number
  m: number
  p2: number
  p3: number
}

const round2 = (n: number) => Math.round(n * 100) / 100

function bandsFromTable(
  table: typeof WFA.L,
  fromX: number,
  toX: number,
  step: number
): Band[] {
  const out: Band[] = []
  for (let x = fromX; x <= toX + 1e-9; x += step) {
    const { lms } = lookupLMS(table, x)
    out.push({
      x: round2(x),
      n3: round2(valueFromZ(-3, lms)),
      n2: round2(valueFromZ(-2, lms)),
      m: round2(valueFromZ(0, lms)),
      p2: round2(valueFromZ(2, lms)),
      p3: round2(valueFromZ(3, lms)),
    })
  }
  return out
}

/** WHO bands over age (months) for weight-for-age or height-for-age. */
export function ageBands(
  indicator: 'bb_u' | 'tb_u',
  sex: Sex,
  fromMonth: number,
  toMonth: number
): Band[] {
  const table = indicator === 'bb_u' ? WFA[sex] : HFA[sex]
  return bandsFromTable(table, Math.max(0, Math.floor(fromMonth)), Math.min(60, Math.ceil(toMonth)), 1)
}

/** WHO bands over length/height (cm) for weight-for-length (<24m) or weight-for-height (≥24m). */
export function lengthBands(sex: Sex, useHeight: boolean, fromCm: number, toCm: number): Band[] {
  const table = useHeight ? WFH[sex] : WFL[sex]
  const lo = useHeight ? 65 : 45
  const hi = useHeight ? 120 : 110
  return bandsFromTable(table, Math.max(lo, Math.floor(fromCm)), Math.min(hi, Math.ceil(toCm)), 1)
}

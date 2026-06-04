import type { LMS, WhoTable } from './types'

export interface Lookup {
  lms: LMS
  /** True when x fell outside the table range and was clamped to the nearest row. */
  outOfRange: boolean
}

/**
 * Look up LMS parameters for value `x` in a WHO table, linearly interpolating
 * L, M, S between bracketing rows. WHO Anthro interpolates by day; we work at
 * month / 0.5-cm granularity, which is accurate enough for v1 (documented choice).
 *
 * Out-of-range `x` is clamped to the nearest edge row and flagged.
 */
export function lookupLMS(table: WhoTable, x: number): Lookup {
  const { rows } = table
  const first = rows[0]
  const last = rows[rows.length - 1]

  if (x <= first[0]) return { lms: { l: first[1], m: first[2], s: first[3] }, outOfRange: x < first[0] }
  if (x >= last[0]) return { lms: { l: last[1], m: last[2], s: last[3] }, outOfRange: x > last[0] }

  // binary search for the bracketing pair [lo, hi] with lo[0] <= x <= hi[0]
  let lo = 0
  let hi = rows.length - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (rows[mid][0] <= x) lo = mid
    else hi = mid
  }

  const a = rows[lo]
  const b = rows[hi]
  if (a[0] === x) return { lms: { l: a[1], m: a[2], s: a[3] }, outOfRange: false }

  const t = (x - a[0]) / (b[0] - a[0])
  return {
    lms: {
      l: a[1] + (b[1] - a[1]) * t,
      m: a[2] + (b[2] - a[2]) * t,
      s: a[3] + (b[3] - a[3]) * t,
    },
    outOfRange: false,
  }
}

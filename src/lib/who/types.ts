/** Shared types for the WHO Child Growth Standards engine. */

export type Sex = 'L' | 'P'

/** Box-Cox LMS parameters at a given age/length point. */
export interface LMS {
  l: number
  m: number
  s: number
}

/** A normalized WHO reference table (see scripts/build-who-tables.mjs). */
export interface WhoTable {
  /** 'month' for age-indexed tables, 'cm' for length/height-indexed tables. */
  indexedBy: 'month' | 'cm'
  source: string
  /** Sorted rows of [x, L, M, S]. */
  rows: [number, number, number, number][]
}

/** Indicator codes used across the app. */
export type IndicatorCode = 'bb_u' | 'tb_u' | 'bb_tb'

/** Per-indicator computation result. */
export interface IndicatorResult {
  /** Z-score (extreme-tail-clamped) or null when not computable. */
  z: number | null
  /** True when the lookup value fell outside the WHO table range (clamped). */
  outOfRange: boolean
}

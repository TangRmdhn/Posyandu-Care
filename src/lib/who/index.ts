import type { IndicatorResult, Sex } from './types'
import { zFromLMS } from './lms'
import { lookupLMS } from './loadTable'
import { WFA, HFA, WFL, WFH } from './tables'
import {
  classifyIndicator,
  headlineStatus,
  type NutritionalStatus,
  type StatusLabel,
} from './classify'

const DAYS_PER_MONTH = 30.4375

/** Completed calendar months (KMS-style) — for display. */
export function getAgeInMonths(tglLahir: string, at: Date = new Date()): number {
  const b = new Date(tglLahir)
  let months = (at.getFullYear() - b.getFullYear()) * 12 + (at.getMonth() - b.getMonth())
  if (at.getDate() < b.getDate()) months--
  return Math.max(0, months)
}

/** Fractional age in months (days / 30.4375) — for table interpolation. */
function ageMonthsPrecise(tglLahir: string, at: Date): number {
  const days = (at.getTime() - new Date(tglLahir).getTime()) / 86_400_000
  return Math.max(0, days / DAYS_PER_MONTH)
}

const round2 = (n: number) => Math.round(n * 100) / 100

/**
 * Reconcile a length/height measurement with the WHO age cutoff (24 months).
 * WHO uses lying length < 24m and standing height ≥ 24m; if the wrong one was
 * measured, apply the standard 0.7 cm correction. `measuredLying === undefined`
 * means "measured per protocol" — no correction.
 */
function correctLengthHeight(ageMonths: number, measured: number, measuredLying?: boolean): number {
  if (measuredLying === undefined) return measured
  if (ageMonths < 24 && measuredLying === false) return measured + 0.7 // standing → length
  if (ageMonths >= 24 && measuredLying === true) return measured - 0.7 // lying → height
  return measured
}

export interface GrowthInput {
  berat_badan: number
  tinggi_badan?: number | null
  jenis_kelamin: Sex
  /** ISO birth date; ignored when `ageMonths` is given. */
  tgl_lahir?: string
  /** Overrides `tgl_lahir`; useful for tests and precise callers. */
  ageMonths?: number
  /** true = length (lying), false = height (standing); undefined = per protocol. */
  measuredLying?: boolean
  /** Measurement date (defaults to now). */
  at?: Date
}

export interface IndicatorAssessment extends IndicatorResult {
  status: StatusLabel | null
}

export interface GrowthAssessment {
  ageMonths: number
  bb_u: IndicatorAssessment
  tb_u: IndicatorAssessment
  bb_tb: IndicatorAssessment
  headline: NutritionalStatus
}

/**
 * Full WHO growth assessment: Z-scores + per-indicator Kemenkes status for
 * weight-for-age, height-for-age (stunting), weight-for-height (wasting).
 * Pure and deterministic — safe to run on the server or offline on the client.
 */
export function assessGrowth(input: GrowthInput): GrowthAssessment {
  const { berat_badan, jenis_kelamin: sex, measuredLying } = input
  const at = input.at ?? new Date()
  const age =
    input.ageMonths ?? (input.tgl_lahir ? ageMonthsPrecise(input.tgl_lahir, at) : 0)
  const tinggi = input.tinggi_badan ?? null

  // BB/U — weight-for-age
  const wfa = lookupLMS(WFA[sex], age)
  const zBbU = round2(zFromLMS(berat_badan, wfa.lms))
  const bb_u: IndicatorAssessment = {
    z: zBbU,
    outOfRange: wfa.outOfRange,
    status: classifyIndicator('bb_u', zBbU),
  }

  let tb_u: IndicatorAssessment = { z: null, outOfRange: false, status: null }
  let bb_tb: IndicatorAssessment = { z: null, outOfRange: false, status: null }

  if (tinggi !== null && tinggi > 0) {
    const refLen = correctLengthHeight(age, tinggi, measuredLying)

    // TB/U (PB/U) — height/length-for-age (stunting)
    const hfa = lookupLMS(HFA[sex], age)
    const zTbU = round2(zFromLMS(refLen, hfa.lms))
    tb_u = { z: zTbU, outOfRange: hfa.outOfRange, status: classifyIndicator('tb_u', zTbU) }

    // BB/TB (BB/PB) — weight-for-length (<24m) or weight-for-height (≥24m)
    const wf = lookupLMS(age < 24 ? WFL[sex] : WFH[sex], refLen)
    const zBbTb = round2(zFromLMS(berat_badan, wf.lms))
    bb_tb = { z: zBbTb, outOfRange: wf.outOfRange, status: classifyIndicator('bb_tb', zBbTb) }
  }

  return {
    ageMonths: age,
    bb_u,
    tb_u,
    bb_tb,
    headline: headlineStatus(bb_u.z, tb_u.z, bb_tb.z),
  }
}

// ---------------------------------------------------------------------------
// Legacy drop-in API — preserves the shape api/pemeriksaan + api/zscore expect.
// ---------------------------------------------------------------------------

export interface ZScoreResult {
  zscore_bb_u: number
  zscore_tb_u: number
  zscore_bb_tb: number
  status_gizi: NutritionalStatus
}

export function calculateNutritionalStatus(params: {
  berat_badan: number
  tinggi_badan: number
  tgl_lahir: string
  jenis_kelamin: 'L' | 'P'
}): ZScoreResult {
  const a = assessGrowth(params)
  return {
    zscore_bb_u: a.bb_u.z ?? 0,
    zscore_tb_u: a.tb_u.z ?? 0,
    zscore_bb_tb: a.bb_tb.z ?? 0,
    status_gizi: a.headline,
  }
}

export { headlineStatus, classifyIndicator } from './classify'
export type { NutritionalStatus, StatusLabel, StatusTone } from './classify'
export { zFromLMS, valueFromZ } from './lms'
export { lookupLMS } from './loadTable'
export { WFA, HFA, WFL, WFH } from './tables'
export type { Sex, LMS, IndicatorCode } from './types'

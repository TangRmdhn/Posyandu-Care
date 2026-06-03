/**
 * WHO Z-Score calculation for nutritional status assessment.
 * Based on WHO Child Growth Standards (2006).
 * Simplified LMS method. For production, import the full WHO reference tables.
 */

export type NutritionalStatus =
  | 'Gizi Baik'
  | 'Gizi Kurang'
  | 'Gizi Buruk'
  | 'Stunting'
  | 'Resiko Tinggi'

export interface ZScoreResult {
  zscore_bb_u: number
  zscore_tb_u: number
  zscore_bb_tb: number
  status_gizi: NutritionalStatus
}

export function getAgeInMonths(tglLahir: string): number {
  const birthDate = new Date(tglLahir)
  const today = new Date()
  const months =
    (today.getFullYear() - birthDate.getFullYear()) * 12 +
    (today.getMonth() - birthDate.getMonth())
  return Math.max(0, months)
}

/**
 * Z = (X - Median) / SD
 */
export function calculateZScore(
  measuredValue: number,
  median: number,
  sd: number
): number {
  return parseFloat(((measuredValue - median) / sd).toFixed(2))
}

export function classifyNutritionalStatus(
  zscore_bb_u: number,
  zscore_tb_u: number,
  zscore_bb_tb: number
): NutritionalStatus {
  if (zscore_bb_u < -3) return 'Gizi Buruk'
  if (zscore_bb_u < -2) return 'Gizi Kurang'
  if (zscore_tb_u < -2) return 'Stunting'
  if (zscore_bb_tb > 2) return 'Resiko Tinggi'
  return 'Gizi Baik'
}

export function calculateNutritionalStatus(params: {
  berat_badan: number
  tinggi_badan: number
  tgl_lahir: string
  jenis_kelamin: 'L' | 'P'
}): ZScoreResult {
  const { berat_badan, tinggi_badan, jenis_kelamin } = params

  // TODO: Replace with actual WHO reference table lookup based on ageInMonths + sex
  const ref = {
    bb_u: { median: jenis_kelamin === 'L' ? 9.6 : 8.9, sd: 1.1 },
    tb_u: { median: jenis_kelamin === 'L' ? 75.7 : 74.0, sd: 2.6 },
    bb_tb: { median: jenis_kelamin === 'L' ? 9.6 : 9.0, sd: 0.9 },
  }

  const zscore_bb_u = calculateZScore(berat_badan, ref.bb_u.median, ref.bb_u.sd)
  const zscore_tb_u = calculateZScore(tinggi_badan, ref.tb_u.median, ref.tb_u.sd)
  const zscore_bb_tb = calculateZScore(berat_badan, ref.bb_tb.median, ref.bb_tb.sd)

  return {
    zscore_bb_u,
    zscore_tb_u,
    zscore_bb_tb,
    status_gizi: classifyNutritionalStatus(zscore_bb_u, zscore_tb_u, zscore_bb_tb),
  }
}

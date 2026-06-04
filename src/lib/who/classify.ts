import type { IndicatorCode } from './types'

/** Visual tone for status chips (color + icon decided in UI, never color alone). */
export type StatusTone = 'good' | 'warn' | 'danger' | 'info'

export interface StatusLabel {
  label: string
  tone: StatusTone
}

/**
 * Per-indicator nutritional status from a Z-score, per Kemenkes / Permenkes No. 2 Tahun 2020.
 * Cutoffs are inclusive on the lower bound of each "normal" band, matching the regulation tables.
 */
export function classifyIndicator(code: IndicatorCode, z: number | null): StatusLabel | null {
  if (z === null || Number.isNaN(z)) return null

  switch (code) {
    // Tinggi/Panjang Badan menurut Umur — stunting
    case 'tb_u':
      if (z < -3) return { label: 'Sangat Pendek', tone: 'danger' }
      if (z < -2) return { label: 'Pendek', tone: 'warn' }
      if (z <= 3) return { label: 'Normal', tone: 'good' }
      return { label: 'Tinggi', tone: 'info' }

    // Berat Badan menurut Umur — underweight
    case 'bb_u':
      if (z < -3) return { label: 'Berat Badan Sangat Kurang', tone: 'danger' }
      if (z < -2) return { label: 'Berat Badan Kurang', tone: 'warn' }
      if (z <= 1) return { label: 'Berat Badan Normal', tone: 'good' }
      return { label: 'Risiko Berat Badan Lebih', tone: 'warn' }

    // Berat Badan menurut Tinggi/Panjang Badan — wasting / gizi
    case 'bb_tb':
      if (z < -3) return { label: 'Gizi Buruk', tone: 'danger' }
      if (z < -2) return { label: 'Gizi Kurang', tone: 'warn' }
      if (z <= 1) return { label: 'Gizi Baik', tone: 'good' }
      if (z <= 2) return { label: 'Risiko Gizi Lebih', tone: 'warn' }
      if (z <= 3) return { label: 'Gizi Lebih', tone: 'warn' }
      return { label: 'Obesitas', tone: 'danger' }
  }
}

/** Legacy headline union kept for backward compatibility with existing UI/DB. */
export type NutritionalStatus =
  | 'Gizi Baik'
  | 'Gizi Kurang'
  | 'Gizi Buruk'
  | 'Stunting'
  | 'Resiko Tinggi'

/**
 * Worst-case headline for list views, mapped onto the legacy union.
 * Prefers the most clinically urgent signal across the three indicators.
 */
export function headlineStatus(
  zBbU: number | null,
  zTbU: number | null,
  zBbTb: number | null
): NutritionalStatus {
  if ((zBbTb !== null && zBbTb < -3) || (zBbU !== null && zBbU < -3)) return 'Gizi Buruk'
  if ((zBbTb !== null && zBbTb < -2) || (zBbU !== null && zBbU < -2)) return 'Gizi Kurang'
  if (zTbU !== null && zTbU < -2) return 'Stunting'
  if ((zBbTb !== null && zBbTb > 2) || (zBbU !== null && zBbU > 1)) return 'Resiko Tinggi'
  return 'Gizi Baik'
}

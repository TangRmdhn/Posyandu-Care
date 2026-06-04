/**
 * Nutritional-status assessment — WHO Child Growth Standards (2006), LMS method.
 *
 * This file is now a thin compatibility layer over the real engine in
 * `src/lib/who/`. It keeps the historical public surface (`getAgeInMonths`,
 * `calculateNutritionalStatus`, `NutritionalStatus`, `ZScoreResult`) so existing
 * imports from `@/lib/zscore` keep working. New code should import from
 * `@/lib/who` directly (e.g. `assessGrowth` for per-indicator detail).
 */

export {
  getAgeInMonths,
  calculateNutritionalStatus,
  assessGrowth,
  headlineStatus,
  classifyIndicator,
} from './who'

export type {
  ZScoreResult,
  GrowthInput,
  GrowthAssessment,
  IndicatorAssessment,
  NutritionalStatus,
  StatusLabel,
  StatusTone,
} from './who'

import { headlineStatus } from './who'
import type { NutritionalStatus } from './who'

/**
 * @deprecated Use `headlineStatus` from `@/lib/who`. Kept for backward compatibility.
 */
export function classifyNutritionalStatus(
  zscore_bb_u: number,
  zscore_tb_u: number,
  zscore_bb_tb: number
): NutritionalStatus {
  return headlineStatus(zscore_bb_u, zscore_tb_u, zscore_bb_tb)
}

/**
 * @deprecated Plain mean/SD Z-score — NOT WHO-correct for skewed indicators.
 * Use the LMS engine (`assessGrowth` / `zFromLMS`) instead.
 */
export function calculateZScore(measuredValue: number, median: number, sd: number): number {
  return parseFloat(((measuredValue - median) / sd).toFixed(2))
}

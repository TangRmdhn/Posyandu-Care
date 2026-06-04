import type { LMS } from './types'

/**
 * Z-score from a measured value and LMS parameters (WHO LMS / Box-Cox method).
 *
 *   L ≠ 0:  Z = ((X / M)^L − 1) / (L · S)
 *   L = 0:  Z = ln(X / M) / S
 *
 * Extreme tails (|Z| > 3) are adjusted the same way WHO Anthro / igrowup does,
 * so output matches the tools health workers compare against.
 */
export function zFromLMS(x: number, { l, m, s }: LMS): number {
  const z = l === 0 ? Math.log(x / m) / s : (Math.pow(x / m, l) - 1) / (l * s)

  if (z > 3) {
    const sd3 = valueFromZ(3, { l, m, s })
    const sd2 = valueFromZ(2, { l, m, s })
    return 3 + (x - sd3) / (sd3 - sd2)
  }
  if (z < -3) {
    const sd3 = valueFromZ(-3, { l, m, s })
    const sd2 = valueFromZ(-2, { l, m, s })
    return -3 + (x - sd3) / (sd2 - sd3)
  }
  return z
}

/**
 * Inverse of zFromLMS: the measured value at a given Z-score.
 *
 *   L ≠ 0:  X = M · (1 + L·S·Z)^(1/L)
 *   L = 0:  X = M · e^(S·Z)
 *
 * Used to reconstruct the −3 / −2 / median / +2 / +3 reference bands for charts.
 */
export function valueFromZ(z: number, { l, m, s }: LMS): number {
  return l === 0 ? m * Math.exp(s * z) : m * Math.pow(1 + l * s * z, 1 / l)
}

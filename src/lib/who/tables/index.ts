import type { Sex, WhoTable } from '../types'

import wfaBoys from './wfa_boys.json'
import wfaGirls from './wfa_girls.json'
import hfaBoys from './hfa_boys.json'
import hfaGirls from './hfa_girls.json'
import wflBoys from './wfl_boys.json'
import wflGirls from './wfl_girls.json'
import wfhBoys from './wfh_boys.json'
import wfhGirls from './wfh_girls.json'

/** weight-for-age (kg by month, 0–60) */
export const WFA: Record<Sex, WhoTable> = { L: wfaBoys as WhoTable, P: wfaGirls as WhoTable }
/** length/height-for-age (cm by month, 0–60; height basis from 24m) */
export const HFA: Record<Sex, WhoTable> = { L: hfaBoys as WhoTable, P: hfaGirls as WhoTable }
/** weight-for-length (kg by length cm, 45–110; ages < 24m) */
export const WFL: Record<Sex, WhoTable> = { L: wflBoys as WhoTable, P: wflGirls as WhoTable }
/** weight-for-height (kg by height cm, 65–120; ages ≥ 24m) */
export const WFH: Record<Sex, WhoTable> = { L: wfhBoys as WhoTable, P: wfhGirls as WhoTable }

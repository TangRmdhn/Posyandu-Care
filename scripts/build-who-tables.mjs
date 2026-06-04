// Normalizes raw WHO LMS JSON (from pygrowup, MIT — WHO Child Growth Standards 2006)
// into compact typed tables under src/lib/who/tables/.
// Each output: { indexedBy: 'month'|'cm', rows: [[x, L, M, S], ...] }
// Run: node scripts/build-who-tables.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const RAW = join(__dirname, 'who-raw')
const OUT = join(__dirname, '..', 'src', 'lib', 'who', 'tables')
mkdirSync(OUT, { recursive: true })

// source file -> { out, indexedBy, key }
const MAP = [
  { src: 'wfa_boys_0_5_zscores.json',  out: 'wfa_boys.json',  by: 'month', key: 'Month' },
  { src: 'wfa_girls_0_5_zscores.json', out: 'wfa_girls.json', by: 'month', key: 'Month' },
  { src: 'lhfa_boys_0_5_zscores.json', out: 'hfa_boys.json',  by: 'month', key: 'Month' },
  { src: 'lhfa_girls_0_5_zscores.json',out: 'hfa_girls.json', by: 'month', key: 'Month' },
  { src: 'wfl_boys_0_2_zscores.json',  out: 'wfl_boys.json',  by: 'cm',    key: 'Length' },
  { src: 'wfl_girls_0_2_zscores.json', out: 'wfl_girls.json', by: 'cm',    key: 'Length' },
  { src: 'wfh_boys_2_5_zscores.json',  out: 'wfh_boys.json',  by: 'cm',    key: 'Height' },
  { src: 'wfh_girls_2_5_zscores.json', out: 'wfh_girls.json', by: 'cm',    key: 'Height' },
]

const num = (v) => {
  const n = Number(v)
  if (!Number.isFinite(n)) throw new Error(`non-numeric value: ${v}`)
  return n
}

// Accumulates WHO's own published −3..+3 SD reference lines so tests can verify
// valueFromZ reproduces them (an external anchor, not hand-typed numbers).
const sdFixture = []
const SD_COLS = { '-3': 'SD3neg', '-2': 'SD2neg', '-1': 'SD1neg', '0': 'SD0', '1': 'SD1', '2': 'SD2', '3': 'SD3' }

for (const m of MAP) {
  const raw = JSON.parse(readFileSync(join(RAW, m.src), 'utf8'))
  // detect index key (some files may use a different label)
  const sample = raw[0]
  let key = m.key
  if (!(key in sample)) {
    key = Object.keys(sample).find((k) => !['L', 'M', 'S'].includes(k) && !k.startsWith('SD'))
    if (!key) throw new Error(`no index key in ${m.src}`)
  }
  const mapped = raw.map((r) => [num(r[key]), num(r.L), num(r.M), num(r.S)])
  // stable sort by x; dedupe keeping LAST occurrence.
  // For height/length-for-age the file lists length(0-24mo) then height(24-60mo);
  // at the x=24 boundary the height row must win (WHO switches to standing height at 24mo).
  mapped.sort((a, b) => a[0] - b[0])
  const deduped = []
  for (const row of mapped) {
    if (deduped.length && deduped[deduped.length - 1][0] === row[0]) deduped[deduped.length - 1] = row
    else deduped.push(row)
  }
  const json = { indexedBy: m.by, source: 'WHO Child Growth Standards 2006 (via pygrowup, MIT)', rows: deduped }
  writeFileSync(join(OUT, m.out), JSON.stringify(json))
  console.log(`${m.out}: ${deduped.length} rows, ${m.by} ${deduped[0][0]}..${deduped[deduped.length - 1][0]}`)

  // sample rows for the SD-line fixture (first, last, and a few interior, deduped by x)
  const table = m.out.replace('.json', '')
  const lastIdx = raw.length - 1
  const idxs = [...new Set([0, Math.floor(raw.length / 4), Math.floor(raw.length / 2), Math.floor((3 * raw.length) / 4), lastIdx])]
  for (const i of idxs) {
    const r = raw[i]
    if (!(key in r) || r.SD0 === undefined) continue
    const sd = {}
    for (const [z, col] of Object.entries(SD_COLS)) sd[z] = num(r[col])
    sdFixture.push({ table, indexedBy: m.by, x: num(r[key]), lms: { l: num(r.L), m: num(r.M), s: num(r.S) }, sd })
  }
}

const FIX_DIR = join(__dirname, '..', 'src', 'lib', 'who', '__tests__', 'fixtures')
mkdirSync(FIX_DIR, { recursive: true })
writeFileSync(join(FIX_DIR, 'who_sd_lines.json'), JSON.stringify(sdFixture, null, 0))
console.log(`fixture: ${sdFixture.length} SD-line samples`)
console.log('done')

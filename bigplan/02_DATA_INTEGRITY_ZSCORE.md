# 02 — Data Integrity: Z-Scores, Growth Curves, Immunization

This is the most important document in the folder. The system's core job is to tell a parent and a midwife whether a child is growing normally. **Right now it can get that wrong.** Fix this first.

---

## 1. The problem, precisely

`src/lib/zscore.ts` computes `Z = (X − Median) / SD` using a **single hardcoded** median/SD per sex:

```ts
const ref = {
  bb_u: { median: jenis_kelamin === 'L' ? 9.6 : 8.9, sd: 1.1 },
  tb_u: { median: jenis_kelamin === 'L' ? 75.7 : 74.0, sd: 2.6 },
  bb_tb: { median: jenis_kelamin === 'L' ? 9.6 : 9.0, sd: 0.9 },
}
```

Three things are wrong:
1. **Age is ignored.** WHO references are indexed by age in months (BB/U, TB/U) or by length/height (BB/PB, BB/TB). `getAgeInMonths()` is computed and thrown away.
2. **The normal-distribution shortcut is invalid for skewed indicators.** WHO uses the **LMS method** (Box-Cox power, median, coefficient of variation), not a plain mean/SD, because weight distributions are skewed.
3. **The classification thresholds are incomplete/loose** vs. the Kemenkes/WHO cutoffs.

---

## 2. The correct approach — WHO LMS method

WHO Child Growth Standards (0–60 months) publish, for each indicator, per sex, per age (or per length/height), three parameters: **L** (Box-Cox power), **M** (median), **S** (coefficient of variation).

The Z-score for a measured value `X`:

```
if L ≠ 0:  Z = ((X / M)^L − 1) / (L · S)
if L = 0:  Z = ln(X / M) / S
```

Then, because WHO caps extreme tails, **constrain |Z| > 3** using the WHO "extreme value" adjustment:

```
if Z > 3:   Z = 3 + (X − SD3pos) / (SD3pos − SD2pos)
if Z < -3:  Z = -3 + (X − SD3neg) / (SD2neg − SD3neg)
   where SDnpos/neg are values at ±n SD reconstructed from L,M,S
```

This is the algorithm used by WHO Anthro and `igrowup`. It must be implemented exactly — health workers will compare against the KMS/Anthro output.

### Indicators to support
| Code | Indicator | Index by | Used for |
|------|-----------|----------|----------|
| `bb_u` | Berat Badan / Umur (weight-for-age) | age (months) | underweight |
| `tb_u` / `pb_u` | Tinggi (Panjang) Badan / Umur (height/length-for-age) | age (months) | **stunting** |
| `bb_tb` / `bb_pb` | Berat Badan / Tinggi (Panjang) Badan (weight-for-height/length) | height/length (cm) | **wasting / gizi buruk** |
| `imt_u` (opt.) | IMT / Umur (BMI-for-age) | age (months) | overweight |

> **Length vs height rule:** WHO uses *length* (lying) for children < 24 months and *height* (standing) for ≥ 24 months, with a 0.7 cm correction when the wrong one is measured. The cadre form should capture which was measured. Match WHO Anthro behavior.

---

## 3. Implementation plan

### 3.1 Get the reference data
- Source the official WHO LMS tables (boys + girls):
  - weight-for-age 0–60m, length/height-for-age 0–60m, weight-for-length 45–110 cm, weight-for-height 65–120 cm, BMI-for-age 0–60m.
- Ship them as **static JSON** under `src/lib/who/` (e.g. `wfa_boys.json`), keyed by age (or length) with `{ L, M, S }`. These are public-domain reference tables; bundle them, don't fetch at runtime.
- Total size is small (a few hundred KB); fine to import on the server.

### 3.2 New module structure
```
src/lib/who/
  tables/                       # raw WHO LMS JSON (boys/girls × indicator)
  loadTable.ts                  # typed loader + interpolation between integer ages
  zscore.ts                     # lms() core: zFromLMS(value, L, M, S) + extreme-tail clamp
  classify.ts                   # Kemenkes/WHO cutoffs → status label
  index.ts                      # calculateNutritionalStatus(...) public API (drop-in replacement)
```
- `loadTable.ts` interpolates linearly on L, M, S when the exact age/length isn't a table row (WHO Anthro interpolates by day; month-granularity is acceptable for v1, document the choice).
- Keep the existing public function name `calculateNutritionalStatus` so `api/pemeriksaan` and `api/zscore` keep working — swap the internals.

### 3.3 Classification (align to Kemenkes 2020 / Permenkes 2/2020 cutoffs)
| Indicator | Z range | Label |
|-----------|---------|-------|
| TB/U (or PB/U) | < −3 | Sangat Pendek (severely stunted) |
| | −3 to < −2 | Pendek (stunted) |
| | −2 to +3 | Normal |
| | > +3 | Tinggi |
| BB/U | < −3 | Berat badan sangat kurang |
| | −3 to < −2 | Berat badan kurang |
| | −2 to +1 | Berat badan normal |
| | > +1 | Risiko BB lebih |
| BB/TB (or BB/PB) | < −3 | Gizi buruk (severely wasted) |
| | −3 to < −2 | Gizi kurang (wasted) |
| | −2 to +1 | Gizi baik (normal) |
| | +1 to +2 | Risiko gizi lebih |
| | +2 to +3 | Gizi lebih (overweight) |
| | > +3 | Obesitas |

> Keep the **per-indicator** labels (don't collapse into one ambiguous `status_gizi`). The DB already has separate `zscore_bb_u/tb_u/bb_tb` columns; add per-indicator status columns (see `04`). The "headline" status shown in lists can be the worst-case flag.

### 3.4 Tests (non-negotiable for this module)
- Unit-test `zFromLMS` against hand-verified WHO values.
- Golden tests: feed known (age, sex, weight, height) cases and assert the Z-scores match WHO Anthro output within ±0.01.
- Edge cases: age 0, age 60m boundary, length/height switch at 24m, extreme tails (clamp), missing height (BB/U only).
- This is the one module where a bug is a safety incident. CI must run these. See `08`.

### 3.5 Where calculation happens
- **Server-side only** (`api/pemeriksaan` already does this). Never trust a client-sent status. Persist `zscore_*` + per-indicator status at insert time so historical records are stable even if tables are revised.
- `api/zscore` (currently public, unauthenticated) → authenticate, or remove it if only used internally.

---

## 4. Growth charts (KMS-style)

Replace the dummy `normal`/`trenNaik` lines with real WHO curves.

### What to plot
For the selected indicator (default BB/U for parents, but offer TB/U for stunting and BB/TB for wasting):
- **The child's actual measurements over time** (one point per `pemeriksaan`).
- **WHO reference bands**: the −3, −2, median, +2, +3 lines for that child's sex across the age range. These come straight from the LMS tables (z=n → value via inverse LMS).
- Shade the normal band (−2…+2) green; flag zones red/yellow.

### Implementation
```
src/lib/who/curves.ts        # valueFromZ(z, L, M, S) → reconstruct band values per age
src/components/growth/GrowthChart.tsx   # multi-line Recharts: child + 5 reference lines
```
- `valueFromZ` is the inverse of `zFromLMS`: `X = M · (1 + L·S·Z)^(1/L)` (or `M·e^(S·Z)` when L=0).
- Fetch the child's `pemeriksaan` history (server component), compute age at each, map to chart points.
- Add an indicator toggle (BB/U · TB/U · BB/TB). Show the child's latest Z + label beside the chart.
- Accessibility: don't rely on color alone — label the bands and the latest point.

### Result
A parent sees their child's dots tracking inside or drifting out of the green band — the same mental model as the paper KMS card. A midwife sees a real trajectory, not a decoration.

---

## 5. Immunization tracking (new core feature)

A Posyandu without immunization records is missing its main job. Add it.

### 5.1 Reference schedule
Encode the Indonesian immunization schedule (Kemenkes / IDAI) as reference data: vaccine, dose number, recommended age, min interval. Examples (illustrative — verify against the current Kemenkes schedule before shipping):

| Vaccine | Doses | Recommended age |
|---------|-------|-----------------|
| Hepatitis B (HB-0) | 1 | < 24 hours |
| BCG, Polio (OPV-0) | 1 | 1 month |
| DPT-HB-Hib, Polio, PCV, Rotavirus | series | 2, 3, 4 months |
| Campak-Rubella (MR) | 1 | 9 months |
| DPT-HB-Hib booster, MR booster | boosters | 18 months |
| (school-age boosters out of Posyandu scope) | | |

Store as `imunisasi_jenis` (see `04` for schema). Keep it data-driven so the schedule can be updated without code changes (admin-editable later).

### 5.2 Per-child records
- `imunisasi_anak`: which child got which vaccine, when, by whom, batch/lot optional.
- Derive **"next due"** per child: for each vaccine in the schedule not yet recorded, compute due date from birth date + recommended age. Surface overdue in red.

### 5.3 UX
- *Parent:* immunization card per child — done (with date) vs upcoming vs overdue.
- *Cadre/Bidan:* during a visit, a checklist of due vaccines to record.
- *Reports:* coverage % per vaccine per session/area → feeds `07`.

This unblocks reminders (`07`) and meaningful reports.

---

## 6. Acceptance criteria for this doc

- [ ] Z-scores for a battery of test cases match WHO Anthro within ±0.01, verified by automated tests.
- [ ] Length/height rule and extreme-tail clamp implemented.
- [ ] Per-indicator status labels match Kemenkes cutoffs.
- [ ] Growth chart plots the child's real points against real WHO −3…+3 bands, indicator-switchable.
- [ ] Status is computed server-side and persisted at write time.
- [ ] Immunization schedule encoded, per-child records storable, "next due" derivable.

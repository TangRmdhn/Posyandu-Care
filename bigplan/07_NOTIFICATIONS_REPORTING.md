# 07 — Notifications, Reporting & Content

Three things that turn a data-entry app into something a Posyandu and its Puskesmas actually rely on: reminders that bring families in, reports that satisfy the higher-ups, and real education content.

---

## 1. Reminders & notifications

### Why
Posyandu attendance and immunization timeliness depend on reminders. A parent who forgets the monthly session or a due vaccine is the core problem this can solve.

### Channels (in priority order for Indonesia)
1. **WhatsApp** — by far the dominant channel. Use a provider (e.g. WhatsApp Business API via a gateway like Twilio/Fonnte/Wablas — pick one with template-message support). Templates must be pre-approved.
2. **Email** — fallback / for staff (e.g. Resend, or Supabase's SMTP). Cheap, good for reports.
3. **In-app + Web Push** — for installed PWA users (`06`); free.
4. **SMS** — last-resort fallback (costs money; only if WA unavailable).

### What to send
| Trigger | To | When |
|---------|----|----|
| Upcoming session reminder | parents with a booking | H-1 and morning-of |
| Immunization due/overdue | parents | a few days before due date; weekly while overdue |
| Reservation confirmed | parent | on booking |
| Measurement result + advice ready | parent | when bidan validates |
| Session opened | parents in the area | when admin opens a `jadwal` |
| Daily queue summary | kader | morning of session |

### How
- A **scheduled job** (Vercel Cron / Supabase scheduled function) runs daily, queries due reminders, sends via the provider, records delivery in a `notifikasi`/`notif_log` table (idempotent — don't double-send).
- Respect consent and a per-user notification preference (opt-out).
- Keep templates in the DB (admin-editable) so wording can change without deploys.
- Start simple: in-app + email first (free, no approval friction), add WhatsApp once a provider account is set up.

> **Effort/risk note:** WhatsApp Business API requires a business account + template approval + per-message cost. Plan a 1–2 week lead time for that. Don't block P2 on it — ship in-app/email reminders first.

---

## 2. Reporting & export to Puskesmas

### Why
The midwife/coordinator must report to the Puskesmas: how many children attended, the gizi-status breakdown, stunting/wasting counts, immunization coverage. Today `laporan` exists as a table but the UI only shows live counts and nothing is exportable.

### Reports to produce
| Report | Contents | Format |
|--------|----------|--------|
| Per-session report | attendance, per-child measurements + status, referrals, immunizations given | PDF + CSV |
| Monthly recap | totals, gizi-status breakdown, stunting/wasting %, BB/U trend, coverage per vaccine | PDF + CSV |
| Stunting/wasting line list | children flagged, by RT/RW, for follow-up | CSV |
| Immunization coverage | % per vaccine, overdue list | PDF + CSV |

### How
- Compute aggregates **server-side** (server action / route handler) from `pemeriksaan` + `imunisasi_anak` + `reservasi`, scoped by `jadwal`/date range/area.
- **CSV:** stream from the server (trivial, universally accepted by Puskesmas spreadsheets).
- **PDF:** render server-side (e.g. React-PDF / a headless renderer) with the Posyandu header, date, signatures block.
- Persist generated reports in `laporan.summary_json` for reproducibility + an audit trail of what was reported.
- Gate behind bidan/admin RLS (`04`).
- Use the **corrected WHO status** (`02`) — reports are the most visible place a wrong Z-score would do damage.

### Charts in-app (for the staff dashboard)
- Stunting rate over time (line), gizi-status distribution (bar/pie), coverage gauges. Recharts is already in.
- These are read models over the same aggregates; cache where sensible.

---

## 3. Education content (replace the 3 hardcoded stubs)

### Today
`ortu/edukasi/page.tsx` hardcodes three titles with no detail pages, no source, no images.

### Plan
- Back education with the `artikel` table (`04`), managed by Admin (`05`).
- Categories: Gizi, Imunisasi, Stunting, ASI/MPASI, Tumbuh Kembang, Kesehatan Ibu.
- List + detail pages; markdown content; optional image; search/filter by category.
- **Contextual education:** when a child is flagged stunted/wasted, surface the relevant articles to the parent on the result screen ("what this means / what to do").
- Seed with vetted content (ideally sourced/adapted from Kemenkes/IDAI materials — cite sources; don't invent medical guidance).
- Keep it offline-cacheable (`06`) so parents can read without signal.

---

## 4. Acceptance criteria
- [ ] Parents get session + immunization reminders (in-app/email at minimum; WhatsApp when provider is live), idempotently, with opt-out.
- [ ] Bidan/admin can export a per-session and a monthly report as PDF and CSV that the Puskesmas accepts.
- [ ] Reports use corrected WHO status and are persisted for reproducibility.
- [ ] Education content is admin-managed, categorized, has detail pages, and is surfaced contextually on flagged results.

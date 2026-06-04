# 05 — Features by Role

What each user can do today, what's missing, and what to build. A new **Admin** role is introduced because today schedules and content can only be managed via raw SQL — which means the system can't run without a developer.

Roles: `ortu` (parent) · `kader` (cadre) · `bidan` (midwife) · **`admin`** (new: coordinator/Puskesmas staff).

---

## 1. Ortu (Parent)

### Today
- Register/login; add child (raw client insert, photo upload dead); see child cards; book a slot; view a (fake) growth chart; read 3 hardcoded articles.

### Gaps
- Photo upload doesn't work. Growth chart is fake. No immunization view. Can't cancel/reschedule a booking. Can't edit child biodata. Can't reset password. No reminders.

### Build
| Feature | Notes | Phase |
|---------|-------|-------|
| Working child photo upload | Storage upload → `foto_url`, EXIF-stripped, private bucket (`03`) | P0 |
| Real growth chart per child | Child points vs WHO bands, indicator toggle (`02`) | P0 |
| Edit child biodata | Through validated server action; audit (`03`,`08`) | P1 |
| Immunization card | Done / upcoming / overdue per child (`02`,`04`) | P1 |
| Cancel / reschedule reservation | Quota rolls back via trigger (`04`) | P1 |
| Reservation status timeline | pending → reviewed → verified, with midwife advice shown | P1 |
| Read real education content | Categorized, detail pages, admin-managed (`07`) | P2 |
| Account self-service | Password reset, change phone/email | P2 |
| Multi-child management | Already supported; add clear switcher | P2 |
| Notifications inbox | Session + immunization reminders (`07`) | P2 |

### Key parent journey to nail
"Is my child OK, and what do I do next?" → dashboard shows latest status per indicator (plain language), next session, next immunization due, and the midwife's advice from the last visit. One screen, no jargon.

---

## 2. Kader (Cadre — volunteer, often older, in the field)

### Today
- See today's queue (filtered to today's `jadwal`); open a reservation; submit anthropometry (BB, TB, LILA, LK) → server computes status.

### Gaps
- Can't record immunizations. Can't edit a measurement after submit (typos are permanent). No per-child history while measuring. Can't search/find a child not in today's queue (walk-ins). Reads `kader` table that has no RLS policy (profile page may break). No offline support — a dropped connection mid-session loses entry.

### Build
| Feature | Notes | Phase |
|---------|-------|-------|
| Fix kader profile read | RLS policy on `kader` (`04`) | P0 |
| Length/height capture | Record whether measured lying/standing (`02`,`04`) | P0 |
| Edit/correct measurement | Before bidan validation; audited (`03`) | P1 |
| Record immunization | Checklist of due vaccines for the child (`02`,`04`) | P1 |
| Walk-in / add to queue | Find child by NIK/name, create on-the-spot reservation | P1 |
| Per-child mini-history | Last few measurements + trend while at the table | P1 |
| Offline-tolerant entry | Queue measurements locally, sync on reconnect (`06`) | P2 |
| Big-touch, large-text field UI | Optimized for older volunteers, gloved hands (`06`) | P2 |

### Field-reality constraints (drive the UX)
- Patchy connectivity → offline entry is not optional for a real Posyandu.
- Older volunteers → large targets, large text, minimal typing, confirmations.
- Speed → measure many children fast; the form should be 3 taps + numbers.

---

## 3. Bidan (Midwife — clinically accountable)

### Today
- Client-side dashboard listing unvalidated `pemeriksaan`, filter by status; add advice via PATCH → validates. Laporan page shows status-gizi counts.

### Gaps
- No pagination/search (grows unbounded, client-fetched). No per-child longitudinal view. No referral workflow (referral to Puskesmas is just free text). Laporan can't be exported. Reads `bidan_desa`/`laporan` tables lacking RLS policies. No immunization coverage view.

### Build
| Feature | Notes | Phase |
|---------|-------|-------|
| Fix bidan/laporan reads | RLS policies (`04`) | P0 |
| Paginated + searchable case list | Server-side, filters by status/area/date | P1 |
| Per-child clinical view | Full growth curves + measurement + immunization history (`02`) | P1 |
| Structured referral | Mark "rujuk Puskesmas", reason, status; not just free text | P1 |
| Report export to Puskesmas | PDF + CSV, per session + monthly (`07`) | P1 |
| Immunization coverage view | % per vaccine per area/session (`02`,`07`) | P2 |
| Validation audit | Who validated what, when (`03`) | P1 |

### Clinical-trust requirement
Because the midwife signs off on referrals, the data she sees **must** be the corrected WHO-based status (`02`) with a visible "last edited by/at" and the ability to see the raw measurements. No black-box labels.

---

## 4. Admin (NEW — coordinator / Puskesmas)

There is currently no in-app way to create a schedule or manage content. This role makes the system self-sufficient.

### Build
| Feature | Notes | Phase |
|---------|-------|-------|
| Role + `/admin` routing | Middleware update; `profiles.role='admin'` (`04`) | P1 |
| Schedule (jadwal) management | Create/edit/close sessions, set quota, location, recurring monthly (`04`) | P1 |
| User management | Approve/assign roles to kader & bidan (set `app_metadata.role`); deactivate | P1 |
| Education content CMS | CRUD `artikel`, publish/unpublish (`04`,`07`) | P2 |
| Immunization schedule editor | Edit `imunisasi_jenis` without code changes (`04`) | P2 |
| Org/area config | Posyandu name, RW coverage, branding | P2 |
| Audit-log viewer | Review sensitive-data access (`03`) | P3 |
| Aggregate dashboards | Trends, coverage, stunting rate over time (`07`) | P3 |

> **Role assignment problem to solve:** today there's no clean way to set `app_metadata.role` for new kader/bidan (plan says "via Auth admin panel / SQL"). Admin user management should call a server-side admin endpoint (service role) to set the role claim + create the `kader`/`bidan_desa` row in one transaction. This also fixes the root cause behind the `get_my_role` JWT/profiles split (`04`).

---

## 5. Cross-cutting workflow fixes

- **Single validated write path** (`03`, `08`): every create/update goes through a server action/handler with Zod + authorization + audit. Remove raw client inserts (register page first).
- **Consistent role read**: pick JWT-claim-first with profiles fallback, in one helper used by middleware, layout, and API routes (today the logic is duplicated and was the source of the login loop).
- **Status as data, not strings scattered in components**: centralize status labels/colors/cutoffs in one module (used by `02` classify + UI).
- **Empty/loading/error states** for every list and form (`06`).

---

## 6. Acceptance criteria
- [ ] Every role can complete its core journey without SQL or developer help.
- [ ] Admin can open next month's session and assign a new kader entirely in-app.
- [ ] Cadre can record an immunization and correct a mistyped weight.
- [ ] Parent sees real status, real chart, real next-immunization, and can manage bookings.
- [ ] Midwife can export a report the Puskesmas accepts and issue a structured referral.

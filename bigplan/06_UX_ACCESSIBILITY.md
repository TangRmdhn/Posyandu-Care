# 06 — UX, Accessibility & Offline

"Useful for all kinds of user" is mostly this document. The current UI is a clean **phone-only** mockup. Real users include midwives on laptops, volunteer cadres in their 50s–60s on cheap Android phones in low-signal halls, and parents with low digital literacy. Design for the edges and the middle takes care of itself.

---

## 1. Responsive — stop forcing everyone into a phone

**Today:** `(dashboard)/layout.tsx` wraps everything in `max-w-md mx-auto`. A bidan or admin on a 15" laptop gets a 448px column with a mobile bottom-nav. That's broken for data-heavy roles.

**Plan:**
- Keep **mobile-first** for `ortu` and `kader-in-field` (their reality is a phone).
- Give `bidan` and `admin` a **real desktop layout**: sidebar nav (not bottom bar), wider content, **tables** with sortable columns, multi-column dashboards.
- Make the layout **role-aware and breakpoint-aware**: bottom-nav on small screens, sidebar on `lg+`. Don't cap width globally; cap per-content where it helps readability.
- Forms reflow to multi-column on wide screens; lists become tables.

---

## 2. Accessibility (WCAG 2.1 AA target)

Current issues: emoji used as icons (📷, ←, ✓), color-only status chips, some inputs lack programmatic labels, no focus management, tap targets vary.

**Plan:**
- **Semantic + labelled:** every input has a `<label htmlFor>`; buttons have accessible names; use real `<button>`/`<a>`, not clickable divs.
- **Icons:** replace emoji with `lucide-react` icons that are already a dependency; mark decorative ones `aria-hidden`, give meaningful ones `aria-label`.
- **Color is never the only signal:** status chips get an icon + text, not just background color (color-blind + low-vision).
- **Contrast:** audit brand colors against AA (4.5:1 for text). Fix the light-gray-on-white labels (`text-gray-400` on small text fails).
- **Focus:** visible focus rings (don't remove outlines); manage focus on route change and modal open; logical tab order.
- **Touch targets:** ≥ 44×44px everywhere (some current buttons are smaller).
- **Screen-reader copy:** Indonesian `aria-label`s; announce async results (toast with `role="status"`).
- **Forms:** errors associated to fields via `aria-describedby`; don't surface raw error strings (current pattern) — friendly Indonesian messages.

---

## 3. Inclusive mode for elderly / low-literacy users

A volunteer cadre or grandparent caregiver may struggle with small text and dense screens.

**Plan:**
- **Large-text / high-contrast toggle** (persisted), scaling base font and spacing — beyond the OS setting, in-app and obvious.
- **Plain-language copy:** short sentences, avoid clinical jargon in parent-facing screens; explain "stunting", "Z-score" in tooltips/help.
- **Icon + label** for primary actions; avoid relying on memory.
- **Confirmations** for destructive/important actions (cancel booking, submit measurement).
- Consider **simple illustrations** for status (a clear "growing well / needs attention" visual) alongside the chart.

---

## 4. Design system (consolidate the inline styles)

Today styling is a mix of Tailwind utilities and inline `style={{...}}` with magic numbers (`#E8F0FB`, `borderRadius:'8px'`, fixed heights). That's hard to keep consistent and accessible.

**Plan:**
- Adopt **shadcn/ui** (already in the original plan, not yet used) for accessible primitives: Button, Input, Select, Dialog, Toast, Tabs, Table, Skeleton.
- Move brand colors/spacing/radii into Tailwind theme tokens; delete inline `style` hacks.
- Standard components: `<StatusBadge>`, `<EmptyState>`, `<ErrorState>`, `<PageHeader>`, `<FormField>` — reused everywhere.
- Centralize copy/strings (eases future i18n even if Indonesian-only now).

---

## 5. States — every screen handles all of them

Several pages only render the happy path. Standardize:
- **Loading:** skeletons (a `CardSkeleton` already exists — use it everywhere; add table/skeleton variants).
- **Empty:** friendly empty states with a clear next action (the ortu dashboard does this well — replicate the pattern).
- **Error:** retas friendly message + retry, not a raw Supabase error string.
- **Offline:** detect and show a banner; queue actions (see §6).

---

## 6. PWA + offline (critical for field use)

Posyandu sessions run in community halls with weak/no signal. A cadre mid-measurement who loses connection must not lose data.

**Plan:**
- **PWA:** installable, app icon, splash, `manifest.json`; cache the app shell with a service worker (e.g. via `next-pwa` or a hand-rolled SW) so it loads offline.
- **Offline data entry:** measurement (and immunization) entries written to **IndexedDB** when offline, with an outbox that **syncs on reconnect**. Show per-entry sync state (pending/synced/failed).
- **Deterministic offline Z-score:** because the WHO engine (`02`) is pure/local, status can be computed offline too — no server round-trip needed to show the cadre the result immediately.
- **Conflict handling:** server is source of truth; on sync, validate again server-side (don't trust client status).
- **Cache reference data** (WHO tables are bundled; `imunisasi_jenis`, today's queue) for offline read.
- Friendly **offline page** for hard navigation failures.

> Offline is **P2** (effort L) but it's the difference between "works in a demo" and "works in the hall." Prioritize for the kader role specifically.

---

## 7. Performance (perceived + real)
- Prefer **Server Components** for data-heavy reads (bidan dashboard currently client-fetches everything — move to server with pagination, `04` indexes help).
- Image optimization via `next/image` (configure Supabase domain, `03`).
- Code-split heavy bits (Recharts) so the parent dashboard isn't blocked.
- Keep bundles small for cheap phones; measure with Lighthouse (mobile, throttled).

---

## 8. Acceptance criteria
- [ ] Bidan/admin get a usable desktop layout; ortu/kader keep mobile-first.
- [ ] Lighthouse a11y ≥ 95 on key pages; manual screen-reader pass on core journeys.
- [ ] Large-text/high-contrast mode works and persists.
- [ ] No emoji-as-icon; no color-only status; all inputs labelled.
- [ ] App installs as a PWA; a cadre can record measurements offline and they sync on reconnect.
- [ ] Every list/form has loading, empty, error, and offline states.

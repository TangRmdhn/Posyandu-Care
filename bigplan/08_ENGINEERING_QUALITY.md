# 08 — Engineering Quality

The codebase has no tests, no CI gate beyond the build, no monitoring, and inconsistent write paths. For a health system that's not acceptable past a demo. This is the reliability layer.

---

## 1. Testing

### Priority order (test what's risky first)
1. **WHO Z-score engine (`02`)** — highest risk. Unit + golden tests vs WHO Anthro reference values (±0.01). A regression here is a safety incident. This is the reason to have tests at all.
2. **Validators** (Zod schemas) — NIK format, ranges, required fields.
3. **Business logic** — quota increment/decrement on reserve/cancel; "next due" immunization derivation; classification cutoffs.
4. **API routes + RLS** — integration tests hitting routes with each role; assert a parent can't read another family's child (RLS is the security boundary — test it).
5. **E2E happy paths** — Playwright, one per role: ortu books → kader measures → bidan validates → ortu sees result.

### Stack
- **Vitest** for unit/integration (fast, TS-native).
- **Playwright** for e2e against a seeded Supabase branch/local stack.
- Test data via Supabase local dev (`supabase start`) or a dedicated test project/branch — never against production.
- Coverage target: high on `lib/who/*` and validators; pragmatic elsewhere.

---

## 2. CI/CD

**Today:** Vercel auto-builds on push; that's the only gate.

**Plan (GitHub Actions or Vercel-native checks):**
- On PR: `typecheck` (`tsc --noEmit`) + `lint` (`next lint`) + `test` (Vitest) + build. All must pass to merge.
- E2E on PR (or nightly if slow) against a preview deploy.
- **Preview deploy per PR** (Vercel already supports this) for manual QA.
- Run `supabase db lint` / capture `get_advisors` in CI after migrations so new DDL can't silently reintroduce RLS/security findings.
- Block deploy to production on red.
- Conventional-commit enforcement is already a project rule — keep it.

---

## 3. Error handling & resilience

- **Error boundaries:** add `error.tsx`, `not-found.tsx`, `global-error.tsx`, and a friendly offline page (`06`).
- **No raw error strings to users** (current pattern leaks Supabase messages). Map to friendly Indonesian copy; log the detail server-side.
- **Consistent API errors:** a standard `{ error, code }` shape; the pemeriksaan route's "first field error" pattern is okay but standardize across all routes.
- **Idempotency** where it matters (reservation create, notification send).
- **Graceful auth failures:** the recent "ortu login loop" shows this is fragile — centralize the role-resolution logic (one helper for middleware/layout/API), and add a regression test.

---

## 4. Monitoring & observability

- **Error monitoring:** Sentry (client + server) — capture exceptions, source-mapped, with role/route context (no PII).
- **Structured logging** on API routes/server actions: who, what, outcome (feeds the audit log too, `03`).
- **Uptime + cron health:** an external uptime check; alert if the reminder cron fails (silent reminder failure = missed visits).
- **Supabase advisors in CI** (above) as continuous security/perf monitoring.
- **Web vitals** to Vercel Analytics (free tier) to watch real-device performance.

---

## 5. Code structure / refactor (pay down before piling on features)

Observed smells: duplicated role-resolution, raw client inserts bypassing the server action, inline `style={{}}` magic numbers, scattered status strings/colors, client-fetching where server components fit.

**Plan (low-risk, high-leverage):**
- **One write path:** server actions/handlers + Zod for every mutation (`03`,`05`). Delete the raw client insert in the register page (route it through `registerAnak`, which already exists and is correct).
- **One role helper:** `getCurrentUserWithRole()` used by middleware, dashboard layout, and API routes.
- **One status module:** cutoffs + labels + colors live with the classifier (`02`); UI imports from it.
- **Design tokens + shadcn primitives** (`06`); remove inline styles.
- **Typed Supabase calls everywhere** using the generated `Database` type (mostly there; the bidan dashboard casts `as unknown as Row[]` — fix the query typing instead).
- Apply the `clean-code` skill's guidance for new modules (small functions, clear names, boundaries) — especially the WHO engine.

> Sequencing: do the **write-path** and **role-helper** refactors in Phase 0/1 (cheap now, expensive later). Defer cosmetic refactors behind tests (Phase 3) so they're safe.

---

## 6. Security in the pipeline
- Dependabot/renovate for dependency updates (note: `lucide-react ^1.17.0` and some pins look unusual — audit versions).
- `npm audit` / Snyk in CI.
- Secret scanning on the repo; never commit `.env.local` (already a rule).
- The `security-review` skill on PRs that touch auth/RLS/API.

---

## 7. Acceptance criteria
- [ ] WHO engine + validators + quota logic covered by passing automated tests; RLS isolation tested.
- [ ] CI gates merges on typecheck + lint + test + build; advisors checked after migrations.
- [ ] Error boundaries + friendly errors in place; no raw DB errors shown to users.
- [ ] Sentry capturing errors; cron health alerting; web vitals tracked.
- [ ] Single validated write path and single role-resolution helper; inline-style/status-string duplication removed.

# Posyandu-Care

Web-based Maternal & Child Health Monitoring system. Next.js 14 (App Router) + Supabase + Vercel.

## Workflow Rules

- **Commit every important update.** Each meaningful change (new feature, page, fix, config) must be committed so progress is tracked. Use clear conventional-commit messages (`feat:`, `fix:`, `chore:`, `docs:`).
- Push to `origin` (https://github.com/TangRmdhn/Posyandu-Care.git) after committing.
- Never commit `.env.local` (contains Supabase keys).

## Stack

- Frontend: Next.js 14, TypeScript, Tailwind, Recharts
- Backend: Next.js Route Handlers + Server Actions
- DB/Auth/Storage: Supabase (project ref `leemynhujnwjugsivtyb`)
- Hosting: Vercel

## Roles

`ortu` (parent) → `/ortu`, `kader` (cadre) → `/kader`, `bidan` (midwife) → `/bidan`. Enforced by `src/middleware.ts` reading `app_metadata.role`.

## Plan

Full implementation plan in `plan/PART_00`–`PART_06`.

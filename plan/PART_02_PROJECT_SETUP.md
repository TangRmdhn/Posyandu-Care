# Posyandu-Care Implementation Plan
## PART 02 — Project Setup: Repo, Supabase & Vercel CI/CD

---

## 1. Prerequisites

Make sure you have the following installed locally:

```bash
node --version     # >= 18.x
npm --version      # >= 9.x
git --version      # Any recent version
```

Accounts needed (all free):
- [supabase.com](https://supabase.com) — database & auth
- [vercel.com](https://vercel.com) — hosting
- GitLab (already exists) or [github.com](https://github.com) — source control

---

## 2. Initialize the Next.js Project

```bash
# Bootstrap Next.js 14 with TypeScript, Tailwind, App Router, ESLint
npx create-next-app@latest posyandu-care \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd posyandu-care
```

> **Important:** When prompted, select **Yes** for `src/` directory and `@/*` import alias.

---

## 3. Install Core Dependencies

```bash
# Supabase client
npm install @supabase/supabase-js @supabase/ssr

# Forms & validation
npm install react-hook-form zod @hookform/resolvers

# Charts (KIA growth chart)
npm install recharts

# Utility
npm install clsx tailwind-merge date-fns

# shadcn/ui CLI (run separately per component)
npx shadcn-ui@latest init
```

When running `shadcn-ui init`, use these settings:
```
Would you like to use TypeScript? → Yes
Which style would you like to use? → Default
Which color would you like to use as base color? → Slate
Where is your global CSS file? → src/app/globals.css
Would you like to use CSS variables for colors? → Yes
Where is your tailwind.config.ts located? → tailwind.config.ts
Configure the import alias for components? → @/components
Configure the import alias for utils? → @/lib/utils
Are you using React Server Components? → Yes
```

### Install required shadcn/ui components

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add select
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add skeleton
```

---

## 4. Supabase Project Setup

### 4.1 Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in:
   - **Name:** `posyandu-care`
   - **Database Password:** Save this securely
   - **Region:** Southeast Asia (Singapore) — closest to Indonesia
4. Wait ~2 minutes for provisioning

### 4.2 Get API Keys

Navigate to **Project Settings > API**. Copy:

| Key | Variable Name | Used In |
|-----|--------------|---------|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` | Client & Server |
| `anon` public key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client-side (browser) |
| `service_role` secret key | `SUPABASE_SERVICE_ROLE_KEY` | Server-side only (never expose to browser) |

### 4.3 Run the Database Schema

1. Go to **SQL Editor > New Query**
2. Paste the entire SQL from `PART_01_DATABASE.md` section 3
3. Click **Run** (Ctrl+Enter)
4. Verify tables appear under **Table Editor**

### 4.4 Set Up Storage Bucket

1. Go to **Storage > New Bucket**
2. Name: `child-photos`, toggle **Public bucket** ON
3. Run the storage policies SQL from `PART_01_DATABASE.md` section 7

---

## 5. Environment Variables

### 5.1 Local `.env.local`

Create this file in the project root (never commit to Git):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Add `.env.local` to `.gitignore` (it's already there by default in Next.js).

### 5.2 `.env.example` (Commit This)

Create this file so teammates know what env vars are needed:

```env
# Supabase — get from supabase.com/dashboard > Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

---

## 6. Supabase Client Setup

### 6.1 Browser Client (`src/lib/supabase/client.ts`)

Used in Client Components (`'use client'`):

```typescript
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 6.2 Server Client (`src/lib/supabase/server.ts`)

Used in Server Components, Route Handlers, and Server Actions:

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database.types'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll called from Server Component — safe to ignore
          }
        },
      },
    }
  )
}
```

### 6.3 Middleware Helper (`src/lib/supabase/middleware.ts`)

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  return { supabaseResponse, user }
}
```

---

## 7. Middleware — Role-Based Routing (`src/middleware.ts`)

```typescript
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const PUBLIC_ROUTES = ['/login', '/register']

const ROLE_DASHBOARDS: Record<string, string> = {
  ortu:   '/ortu',
  kader:  '/kader',
  bidan:  '/bidan',
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { supabaseResponse, user } = await updateSession(request)

  // Allow public routes without auth
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    if (user) {
      // Already logged in — redirect to their dashboard
      const role = user.app_metadata?.role as string
      const dashboard = ROLE_DASHBOARDS[role] ?? '/login'
      return NextResponse.redirect(new URL(dashboard, request.url))
    }
    return supabaseResponse
  }

  // Protected route — require authentication
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Enforce role-based access
  const role = user.app_metadata?.role as string
  const allowedPrefix = ROLE_DASHBOARDS[role]

  if (allowedPrefix && !pathname.startsWith(allowedPrefix) && pathname !== '/') {
    return NextResponse.redirect(new URL(allowedPrefix, request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## 8. Generate TypeScript Types from Supabase

Run this after the database schema is fully applied:

```bash
# Install Supabase CLI
npm install -g supabase

# Login with your Supabase account
supabase login

# Generate types — replace YOUR_PROJECT_ID with your actual project ref
# (found in Supabase Dashboard > Project Settings > General)
supabase gen types typescript \
  --project-id YOUR_PROJECT_ID \
  --schema public \
  > src/types/database.types.ts
```

---

## 9. Connect Repository to Vercel

### 9.1 Push to GitLab/GitHub

```bash
# If using existing GitLab repo
git remote add origin https://gitlab.com/daniel24-png-group/rpl_2026.git
git checkout -b main
git add .
git commit -m "chore: initial Next.js setup with Supabase"
git push -u origin main
```

### 9.2 Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Connect GitLab/GitHub account if not connected
4. Select the `posyandu-care` repository
5. Vercel auto-detects Next.js — no build config changes needed
6. Under **Environment Variables**, add all three variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
7. Click **Deploy**

Every `git push` to `main` will now trigger an automatic redeploy on Vercel.

### 9.3 Configure Supabase Redirect URLs

In Supabase Dashboard, go to **Authentication > URL Configuration**:

| Setting | Value |
|---------|-------|
| Site URL | `https://posyandu-care.vercel.app` |
| Redirect URLs | `https://posyandu-care.vercel.app/**` and `http://localhost:3000/**` |

---

## 10. Development Workflow

```bash
# Start local dev server
npm run dev
# → http://localhost:3000

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Re-generate Supabase types after schema changes
supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts

# Deploy manually (optional — Vercel deploys on push automatically)
vercel --prod
```

---

## 11. Recommended VSCode Extensions

Add `.vscode/extensions.json` to the repo:

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "Prisma.prisma"
  ]
}
```

And `.vscode/settings.json` for consistent formatting:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "non-relative"
}
```

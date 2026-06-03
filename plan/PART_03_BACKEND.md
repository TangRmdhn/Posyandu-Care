# Posyandu-Care Implementation Plan
## PART 03 — Backend: API Routes, Server Actions & Business Logic

---

## 1. Overview

The backend is built entirely within **Next.js Route Handlers** (`/app/api/*`) and **Server Actions**. No separate Express/FastAPI server is needed. All database operations use the **Supabase Server Client** with the user's authenticated session — so RLS policies are automatically applied.

Key business logic modules:
- WHO Z-Score calculation for nutritional status
- Reservation quota enforcement
- Role assignment on registration
- Nutritional status classification

---

## 2. Zod Validation Schemas

### `src/lib/validations/auth.schema.ts`

```typescript
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const registerOrangTuaSchema = z.object({
  nama: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email format'),
  no_hp: z.string().regex(/^[0-9]{10,13}$/, 'Invalid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterOrangTuaInput = z.infer<typeof registerOrangTuaSchema>
```

### `src/lib/validations/anak.schema.ts`

```typescript
import { z } from 'zod'

export const registerAnakSchema = z.object({
  nama_anak: z.string().min(2, 'Child name is required'),
  nik: z.string().length(16, 'NIK must be exactly 16 digits').regex(/^\d+$/, 'NIK must be numeric'),
  tgl_lahir: z.string().refine(
    (val) => {
      const date = new Date(val)
      return date <= new Date() // VR-03: date cannot be in the future
    },
    'Date of birth cannot be in the future'
  ),
  tempat_lahir: z.string().min(2, 'Place of birth is required'),
  jenis_kelamin: z.enum(['L', 'P'], { required_error: 'Gender is required' }),
  rt: z.string().min(1, 'RT is required'),
  rw: z.string().min(1, 'RW is required'),
})

export type RegisterAnakInput = z.infer<typeof registerAnakSchema>
```

### `src/lib/validations/pemeriksaan.schema.ts`

```typescript
import { z } from 'zod'

export const pemeriksaanSchema = z.object({
  id_anak: z.string().uuid(),
  id_reservasi: z.string().uuid().optional(),
  berat_badan: z
    .number()
    .min(0.5, 'Weight seems too low — please verify')    // VR-01
    .max(50, 'Weight seems too high — please verify'),   // VR-01
  tinggi_badan: z
    .number()
    .min(30, 'Height seems too low — please verify')    // VR-02
    .max(150, 'Height seems too high — please verify'), // VR-02
  lingkar_kepala: z.number().min(20).max(70).optional(),
  lingkar_lengan_atas: z.number().min(5).max(40).optional(),
})

export const saranMedisSchema = z.object({
  id_pemeriksaan: z.string().uuid(),
  saran_medis: z.string().min(10, 'Medical advice must be at least 10 characters'),
  pemberian_bantuan_medis: z.string().optional(),
})

export type PemeriksaanInput = z.infer<typeof pemeriksaanSchema>
export type SaranMedisInput = z.infer<typeof saranMedisSchema>
```

---

## 3. WHO Z-Score Algorithm (`src/lib/zscore.ts`)

The Z-Score is used to calculate nutritional status per WHO Child Growth Standards.

```typescript
/**
 * WHO Z-Score calculation for nutritional status assessment.
 * Based on WHO Child Growth Standards (2006).
 *
 * Simplified LMS method for Weight-for-Age (0-60 months).
 * For production, import the full WHO reference tables.
 */

export type NutritionalStatus =
  | 'Gizi Baik'
  | 'Gizi Kurang'
  | 'Gizi Buruk'
  | 'Stunting'
  | 'Resiko Tinggi'

export interface ZScoreResult {
  zscore_bb_u: number   // Weight-for-Age
  zscore_tb_u: number   // Height-for-Age
  zscore_bb_tb: number  // Weight-for-Height
  status_gizi: NutritionalStatus
}

/**
 * Calculate age in months from date of birth
 */
export function getAgeInMonths(tglLahir: string): number {
  const birthDate = new Date(tglLahir)
  const today = new Date()
  const months =
    (today.getFullYear() - birthDate.getFullYear()) * 12 +
    (today.getMonth() - birthDate.getMonth())
  return Math.max(0, months)
}

/**
 * Simplified Z-Score calculation using WHO median and SD reference values.
 * Formula: Z = (X - Median) / SD
 * where X = measured value, Median and SD come from WHO reference tables.
 *
 * NOTE: In a real implementation, load the full WHO reference tables from:
 * https://www.who.int/tools/child-growth-standards/standards
 * and look up the exact L, M, S values for the child's age and sex.
 */
export function calculateZScore(
  measuredValue: number,
  median: number,
  sd: number
): number {
  return parseFloat(((measuredValue - median) / sd).toFixed(2))
}

/**
 * Classify nutritional status based on Z-Score thresholds (WHO standard).
 *
 * Weight-for-Age (BB/U):
 *   >= -2 SD       → Gizi Baik (normal)
 *   < -2 to -3 SD  → Gizi Kurang (moderate underweight)
 *   < -3 SD        → Gizi Buruk (severe underweight)
 *
 * Height-for-Age (TB/U):
 *   < -2 SD        → Stunting
 *
 * Weight-for-Height (BB/TB):
 *   > +2 SD        → Resiko Tinggi (overweight)
 */
export function classifyNutritionalStatus(
  zscore_bb_u: number,
  zscore_tb_u: number,
  zscore_bb_tb: number
): NutritionalStatus {
  if (zscore_bb_u < -3) return 'Gizi Buruk'
  if (zscore_bb_u < -2) return 'Gizi Kurang'
  if (zscore_tb_u < -2) return 'Stunting'
  if (zscore_bb_tb > 2) return 'Resiko Tinggi'
  return 'Gizi Baik'
}

/**
 * Full calculation pipeline.
 * WHO reference values here are example placeholders for a 12-month male child.
 * Replace with lookup from full reference tables based on ageInMonths + sex.
 */
export function calculateNutritionalStatus(params: {
  berat_badan: number
  tinggi_badan: number
  tgl_lahir: string
  jenis_kelamin: 'L' | 'P'
}): ZScoreResult {
  const { berat_badan, tinggi_badan, tgl_lahir, jenis_kelamin } = params
  const ageMonths = getAgeInMonths(tgl_lahir)

  // TODO: Replace with actual WHO reference table lookup
  // Example values for demonstration (12-month median/SD)
  const ref = {
    bb_u: { median: jenis_kelamin === 'L' ? 9.6 : 8.9, sd: 1.1 },
    tb_u: { median: jenis_kelamin === 'L' ? 75.7 : 74.0, sd: 2.6 },
    bb_tb: { median: jenis_kelamin === 'L' ? 9.6 : 9.0, sd: 0.9 },
  }

  const zscore_bb_u = calculateZScore(berat_badan, ref.bb_u.median, ref.bb_u.sd)
  const zscore_tb_u = calculateZScore(tinggi_badan, ref.tb_u.median, ref.tb_u.sd)
  const zscore_bb_tb = calculateZScore(berat_badan, ref.bb_tb.median, ref.bb_tb.sd)

  return {
    zscore_bb_u,
    zscore_tb_u,
    zscore_bb_tb,
    status_gizi: classifyNutritionalStatus(zscore_bb_u, zscore_tb_u, zscore_bb_tb),
  }
}
```

---

## 4. API Route Handlers

### 4.1 Authentication — `src/app/api/auth/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { registerOrangTuaSchema } from '@/lib/validations/auth.schema'

// POST /api/auth — register new ortu account
export async function POST(request: NextRequest) {
  const body = await request.json()

  const result = registerOrangTuaSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { email, password, nama, no_hp } = result.data
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nama, no_hp },
      // Role is set via admin SDK or Supabase dashboard in app_metadata
      // For self-registration, default role is 'ortu'
    },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Update profiles table with phone number
  if (data.user) {
    await supabase
      .from('profiles')
      .update({ no_hp })
      .eq('id', data.user.id)
  }

  return NextResponse.json({ success: true, userId: data.user?.id }, { status: 201 })
}
```

### 4.2 Reservasi — `src/app/api/reservasi/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const reservasiSchema = z.object({
  id_anak: z.string().uuid(),
  id_jadwal: z.string().uuid(),
})

// POST /api/reservasi — create a new reservation
export async function POST(request: NextRequest) {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const result = reservasiSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const { id_anak, id_jadwal } = result.data

  // VR-01: Check if quota is full
  const { data: jadwal } = await supabase
    .from('jadwal')
    .select('kuota, kuota_terisi')
    .eq('id', id_jadwal)
    .single()

  if (!jadwal) {
    return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
  }

  if (jadwal.kuota_terisi >= jadwal.kuota) {
    return NextResponse.json(
      { error: 'Slot is full. Please choose another time.' },   // VR-01
      { status: 409 }
    )
  }

  // VR-02: Check if child already has a reservation on this schedule
  const { data: existing } = await supabase
    .from('reservasi')
    .select('id')
    .eq('id_anak', id_anak)
    .eq('id_jadwal', id_jadwal)
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { error: 'This child is already registered for this schedule.' },  // VR-02
      { status: 409 }
    )
  }

  // Create reservation (trigger auto-assigns no_antrean and increments kuota_terisi)
  const { data: reservasi, error } = await supabase
    .from('reservasi')
    .insert({
      id_ortu: user.id,
      id_anak,
      id_jadwal,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, reservasi }, { status: 201 })
}

// GET /api/reservasi — list reservations for the current user
export async function GET(request: NextRequest) {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('reservasi')
    .select(`
      *,
      anak ( nama_anak, tgl_lahir, jenis_kelamin ),
      jadwal ( tgl_pelaksanaan, jam, lokasi, kuota )
    `)
    .eq('id_ortu', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
```

### 4.3 Pemeriksaan — `src/app/api/pemeriksaan/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { pemeriksaanSchema, saranMedisSchema } from '@/lib/validations/pemeriksaan.schema'
import { calculateNutritionalStatus } from '@/lib/zscore'

// POST /api/pemeriksaan — Kader submits anthropometry data
export async function POST(request: NextRequest) {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // RLS enforces kader-only access, but double-check role
  if (user.app_metadata?.role !== 'kader') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const result = pemeriksaanSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const { id_anak, id_reservasi, berat_badan, tinggi_badan, lingkar_kepala, lingkar_lengan_atas } = result.data

  // Fetch child data for Z-Score calculation
  const { data: anak } = await supabase
    .from('anak')
    .select('tgl_lahir, jenis_kelamin')
    .eq('id', id_anak)
    .single()

  if (!anak) {
    return NextResponse.json({ error: 'Child not found' }, { status: 404 })
  }

  // Calculate nutritional status
  const zscoreResult = calculateNutritionalStatus({
    berat_badan,
    tinggi_badan,
    tgl_lahir: anak.tgl_lahir,
    jenis_kelamin: anak.jenis_kelamin as 'L' | 'P',
  })

  const { data: pemeriksaan, error } = await supabase
    .from('pemeriksaan')
    .insert({
      id_anak,
      id_reservasi: id_reservasi ?? null,
      id_kader: user.id,
      berat_badan,
      tinggi_badan,
      lingkar_kepala: lingkar_kepala ?? null,
      lingkar_lengan_atas: lingkar_lengan_atas ?? null,
      ...zscoreResult,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, pemeriksaan }, { status: 201 })
}

// PATCH /api/pemeriksaan — Bidan submits medical advice
export async function PATCH(request: NextRequest) {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.app_metadata?.role !== 'bidan') {
    return NextResponse.json({ error: 'Forbidden — only Bidan can add medical advice' }, { status: 403 })
  }

  const body = await request.json()
  const result = saranMedisSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const { id_pemeriksaan, saran_medis, pemberian_bantuan_medis } = result.data

  const { data, error } = await supabase
    .from('pemeriksaan')
    .update({
      saran_medis,
      pemberian_bantuan_medis: pemberian_bantuan_medis ?? null,
      id_bidan: user.id,
      is_validated: true,
      validated_at: new Date().toISOString(),
    })
    .eq('id', id_pemeriksaan)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}
```

### 4.4 Z-Score API — `src/app/api/zscore/route.ts`

Endpoint to calculate Z-Score on-demand (e.g., live preview in Kader form):

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { calculateNutritionalStatus } from '@/lib/zscore'
import { z } from 'zod'

const schema = z.object({
  berat_badan: z.number(),
  tinggi_badan: z.number(),
  tgl_lahir: z.string(),
  jenis_kelamin: z.enum(['L', 'P']),
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const result = schema.safeParse(body)

  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const zscoreResult = calculateNutritionalStatus(result.data)
  return NextResponse.json(zscoreResult)
}
```

---

## 5. Server Actions (Alternative to Route Handlers)

For simpler mutations, use Next.js Server Actions directly in components:

```typescript
// src/app/actions/anak.actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { registerAnakSchema } from '@/lib/validations/anak.schema'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function registerAnak(formData: FormData) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const rawData = {
    nama_anak: formData.get('nama_anak') as string,
    nik: formData.get('nik') as string,
    tgl_lahir: formData.get('tgl_lahir') as string,
    tempat_lahir: formData.get('tempat_lahir') as string,
    jenis_kelamin: formData.get('jenis_kelamin') as string,
    rt: formData.get('rt') as string,
    rw: formData.get('rw') as string,
  }

  const result = registerAnakSchema.safeParse(rawData)
  if (!result.success) {
    return { error: result.error.flatten().fieldErrors }
  }

  // VR-02: Check if NIK already registered
  const { data: existing } = await supabase
    .from('anak')
    .select('id')
    .eq('nik', result.data.nik)
    .maybeSingle()

  if (existing) {
    return { error: { nik: ['This child is already registered in the system.'] } }
  }

  const { error } = await supabase
    .from('anak')
    .insert({ ...result.data, id_ortu: user.id })

  if (error) return { error: { _form: [error.message] } }

  revalidatePath('/ortu')
  redirect('/ortu')
}
```

---

## 6. Shared Utility Functions (`src/lib/utils.ts`)

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, differenceInMonths } from 'date-fns'

// shadcn/ui utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date for display: "25 Desember 2023"
export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), 'dd MMMM yyyy')
}

// Get age as string: "2 Tahun 5 Bulan"
export function getAgeString(tglLahir: string): string {
  const months = differenceInMonths(new Date(), new Date(tglLahir))
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  if (years === 0) return `${remainingMonths} Bulan`
  if (remainingMonths === 0) return `${years} Tahun`
  return `${years} Tahun ${remainingMonths} Bulan`
}

// Map nutritional status to badge color
export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    'Gizi Baik': 'bg-green-100 text-green-800',
    'Gizi Kurang': 'bg-yellow-100 text-yellow-800',
    'Gizi Buruk': 'bg-red-100 text-red-800',
    'Stunting': 'bg-orange-100 text-orange-800',
    'Resiko Tinggi': 'bg-red-200 text-red-900',
  }
  return map[status] ?? 'bg-gray-100 text-gray-800'
}
```

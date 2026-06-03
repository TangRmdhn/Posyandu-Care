# Posyandu-Care Implementation Plan
## PART 04 — Frontend: UI/UX Component Implementation
### Source: SRS Section 6 "Desain UI – MockUp & Prototyping" (Pages 14–22)

> Every component in this file is derived **directly** from the SRS mockup images and
> component specification tables. Values for colors, sizes, spacing, and fonts are taken
> verbatim from the "Keterangan Komponen UI" tables on each page.

---

## 1. Design Tokens (From SRS Spec)

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // From SRS: tombol masuk warna biru #1A73C1
        'brand-blue':  '#1A73C1',
        // From SRS: tombol Selesai / action primary = biru-teal
        'brand-teal':  '#00897B',
        // From SRS: info box biru muda #E8F0FB
        'brand-light': '#E8F0FB',
        // From SRS: measurement field background abu muda #F2F2F2
        'field-bg':    '#F2F2F2',
        // From SRS: risk badge merah #D32F2F
        'risk-red':    '#D32F2F',
      },
      borderRadius: {
        // From SRS: card border radius ±12px
        'card': '12px',
        // From SRS: button border radius ±8px
        'btn':  '8px',
        // From SRS: chip border radius ±16px
        'chip': '16px',
        // From SRS: risk badge border radius ±4px
        'badge': '4px',
        // From SRS: info box border radius ±8px
        'box':  '8px',
      },
      fontSize: {
        // From SRS: label ±11px di bawah ikon, RT/RW font 12px abu
        'label':   ['11px', { lineHeight: '16px' }],
        'label-sm':['12px', { lineHeight: '18px' }],
        // From SRS: teks petunjuk, body copy font ±13px
        'body':    ['13px', { lineHeight: '20px' }],
        // From SRS: nama anak font 14px/500
        'item':    ['14px', { lineHeight: '20px', fontWeight: '500' }],
        // From SRS: label atas font 13px abu (measurement field)
        'field-label': ['13px', { lineHeight: '18px' }],
        // From SRS: nilai field font 16px bold
        'field-val':   ['16px', { lineHeight: '24px', fontWeight: '700' }],
        // From SRS: nama font 17px/500 (bidan child header)
        'heading-sm':  ['17px', { lineHeight: '26px', fontWeight: '500' }],
        // From SRS: nama font 18px/500 (kader child profile)
        'heading':     ['18px', { lineHeight: '28px', fontWeight: '500' }],
        // From SRS: nilai bold ±18px (health stats)
        'metric':      ['18px', { lineHeight: '26px', fontWeight: '700' }],
        // From SRS: angka bold ±28px (stats summary card)
        'metric-lg':   ['28px', { lineHeight: '36px', fontWeight: '700' }],
        // From SRS: nomor antrean bold ±28px (reservation success)
        'queue-no':    ['28px', { lineHeight: '36px', fontWeight: '700' }],
      },
      height: {
        // From SRS: app header tinggi ±48px
        'header': '48px',
        // From SRS: save button tinggi ±52px
        'btn-lg': '52px',
        // From SRS: assistance textarea tinggi ±80px
        'textarea-sm': '80px',
      },
      spacing: {
        // From SRS: schedule list card spacing ±8px
        '8px': '8px',
        // From SRS: child list item gap ±12px
        '12px': '12px',
        // From SRS: card padding
        '14px': '14px',
        '16px': '16px',
      },
    },
  },
  plugins: [],
}
export default config
```

---

## 2. Shared Layout Components

### 2.1 App Header

From SRS spec (all three roles share identical spec):
> "Teks 'Posyandu Care' biru-teal di kiri, ikon lonceng di kanan, background putih, tinggi ±48px."

```tsx
// src/components/shared/AppHeader.tsx
import { BellIcon } from 'lucide-react'

interface AppHeaderProps {
  title?: string
}

export function AppHeader({ title = 'Posyandu Care' }: AppHeaderProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 max-w-md mx-auto
                 flex items-center justify-between bg-white px-4"
      style={{ height: '48px' }}
    >
      {/* From SRS: teks "Posyandu Care" biru-teal di kiri */}
      <span className="font-semibold text-base text-brand-teal">
        {title}
      </span>
      {/* From SRS: ikon lonceng di kanan */}
      <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
        <BellIcon className="w-5 h-5 text-gray-400" />
      </button>
    </header>
  )
}
```

### 2.2 Bottom Navigation Bar

From SRS spec:
> "Posisi bawah (fixed), 3 ikon. Tab aktif biru-teal, non-aktif abu, label teks ±11px di bawah ikon."
>
> - Ortu: Beranda, Jadwal, Edukasi
> - Kader: Beranda, Aktivitas, Profil
> - Bidan: Beranda, Aktivitas, Profil

```tsx
// src/components/shared/BottomNavBar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HomeIcon, CalendarIcon, BookOpenIcon, ActivityIcon, UserIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

// From SRS 7.1: Ortu nav — Beranda, Jadwal, Edukasi
const ORTU_NAV: NavItem[] = [
  { href: '/ortu',           label: 'Beranda',  icon: HomeIcon },
  { href: '/ortu/reservasi', label: 'Jadwal',   icon: CalendarIcon },
  { href: '/ortu/edukasi',   label: 'Edukasi',  icon: BookOpenIcon },
]

// From SRS 7.2: Kader nav — Beranda, Aktivitas, Profil
const KADER_NAV: NavItem[] = [
  { href: '/kader',         label: 'Beranda',   icon: HomeIcon },
  { href: '/kader/antrean', label: 'Aktivitas', icon: ActivityIcon },
  { href: '/kader/profil',  label: 'Profil',    icon: UserIcon },
]

// From SRS 7.3: Bidan nav — Beranda, Aktivitas, Profil
const BIDAN_NAV: NavItem[] = [
  { href: '/bidan',         label: 'Beranda',   icon: HomeIcon },
  { href: '/bidan/laporan', label: 'Aktivitas', icon: ActivityIcon },
  { href: '/bidan/profil',  label: 'Profil',    icon: UserIcon },
]

const ROLE_NAV: Record<string, NavItem[]> = {
  ortu:  ORTU_NAV,
  kader: KADER_NAV,
  bidan: BIDAN_NAV,
}

export function BottomNavBar({ role }: { role: 'ortu' | 'kader' | 'bidan' }) {
  const pathname = usePathname()
  const items = ROLE_NAV[role] ?? ORTU_NAV

  return (
    // From SRS: posisi bawah (fixed), background putih, border top
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto
                    bg-white border-t border-gray-200 flex items-center justify-around h-16">
      {items.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-0.5 py-2 px-5"
          >
            <Icon
              className={cn(
                'w-5 h-5',
                // From SRS: tab aktif biru-teal, non-aktif abu
                isActive ? 'text-brand-teal' : 'text-gray-400'
              )}
            />
            {/* From SRS: label teks ±11px di bawah ikon */}
            <span
              className={cn(
                'text-[11px] font-medium',
                isActive ? 'text-brand-teal' : 'text-gray-400'
              )}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
```

### 2.3 Dashboard Layout Wrapper

```tsx
// src/app/(dashboard)/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppHeader } from '@/components/shared/AppHeader'
import { BottomNavBar } from '@/components/shared/BottomNavBar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const role = user.app_metadata?.role as 'ortu' | 'kader' | 'bidan'

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative">
      <AppHeader />
      {/* pt-[48px] = header height, pb-16 = bottom nav height */}
      <main className="pt-[48px] pb-16 min-h-screen">
        {children}
      </main>
      <BottomNavBar role={role} />
    </div>
  )
}
```

---

## 3. Orang Tua Components

### 3.1 Login Page — All Roles

From SRS spec (Login Form):
> "Form di tengah, logo aplikasi di atas, input email & password, tombol masuk warna biru (#1A73C1), link lupa password & daftar akun baru."

Bidan login adds:
> "tagline di bawah nama aplikasi"

```tsx
// src/app/(auth)/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const ROLE_REDIRECT: Record<string, string> = {
    ortu: '/ortu', kader: '/kader', bidan: '/bidan',
  }

  const handleLogin = async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError('Email atau password salah.'); setLoading(false); return }
    const role = data.user?.app_metadata?.role as string
    router.push(ROLE_REDIRECT[role] ?? '/login')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 max-w-md mx-auto">
      {/* From SRS: logo aplikasi di atas, ikon/logo Posyandu Care */}
      <div className="mb-8 flex flex-col items-center">
        <div className="w-16 h-16 bg-brand-blue rounded-2xl flex items-center justify-center mb-3">
          {/* Posyandu Care icon — box with cross symbol like the mockup */}
          <svg viewBox="0 0 40 40" className="w-10 h-10 fill-white">
            <rect x="6" y="6" width="28" height="28" rx="4" fill="none" stroke="white" strokeWidth="2.5"/>
            <path d="M20 12v16M12 20h16" stroke="white" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 className="text-lg font-semibold text-gray-800">Posyandu Care</h1>
        {/* Bidan login shows tagline */}
        <p className="text-xs text-gray-400 mt-1 text-center">
          Pantau tumbuh kembang si kecil dengan mudah dan terpercaya.
        </p>
      </div>

      {/* From SRS: form di tengah */}
      <div className="w-full space-y-4">
        <div className="space-y-1">
          <label className="text-xs text-gray-500">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="nama@email.com"
            className="w-full border border-gray-300 rounded-btn px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-500">Password</label>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-btn px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-blue pr-10"
            />
            {/* Eye icon from mockup */}
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">👁</span>
          </div>
        </div>

        {/* From SRS: link lupa password */}
        <div className="text-right">
          <a href="/forgot-password" className="text-xs text-brand-blue">LUPA PASSWORD?</a>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        {/* From SRS: tombol masuk warna biru #1A73C1 */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-brand-blue text-white rounded-btn py-3 text-sm font-medium
                     flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ height: '48px' }}
        >
          {loading ? 'Loading...' : 'Masuk →'}
        </button>

        {/* From SRS: link daftar akun baru */}
        <p className="text-center text-sm text-gray-500">
          Belum punya akun?{' '}
          <a href="/register" className="text-brand-blue font-medium">Daftar Akun Baru →</a>
        </p>
      </div>
    </div>
  )
}
```

### 3.2 Register Form — Orang Tua

From SRS spec (Register Form):
> "Layout vertikal, input: nama lengkap, nomor telepon, alamat email, tombol Daftar di bawah, link kembali ke login, spacing antar field ±10px."

From SRS spec (Form Biodata Anak):
> "Input: nama anak, NIK anak (16 digit), tanggal lahir (date picker), tempat lahir, jenis kelamin, RT/RW. Area upload foto anak, tombol Selesai warna biru-teal."

```tsx
// src/app/(auth)/register/page.tsx — Step 1: Data Orang Tua
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({ nama: '', no_hp: '', email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    setLoading(true)
    setError(null)
    const { error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { nama: form.nama, no_hp: form.no_hp } },
    })
    if (err) { setError(err.message); setLoading(false); return }
    router.push('/ortu/anak/register')
  }

  // From SRS: field labels match exactly
  const fields = [
    { key: 'nama',     label: 'Nama Lengkap', type: 'text',     placeholder: 'Contoh: Ibu Sari' },
    { key: 'no_hp',    label: 'Nomor HP',     type: 'tel',      placeholder: '08xxxxxxxxxx' },
    { key: 'email',    label: 'Alamat Email', type: 'email',    placeholder: 'nama@email.com' },
    { key: 'password', label: 'Password',     type: 'password', placeholder: 'Min. 8 karakter' },
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 pt-10 max-w-md mx-auto">
      {/* Back button like mockup */}
      <button onClick={() => router.back()} className="mb-4 text-brand-blue text-sm flex items-center gap-1">
        ← Kembali
      </button>

      <h2 className="text-lg font-semibold text-gray-900 mb-1">Data Orang Tua</h2>
      <p className="text-xs text-gray-400 mb-6">
        Masukkan tanggal dan informasi yang benar untuk membuat akun yang mudah diakses.
      </p>

      {/* From SRS: layout vertikal, spacing antar field ±10px */}
      <div className="space-y-[10px]">
        {fields.map(({ key, label, type, placeholder }) => (
          <div key={key}>
            <label className="text-xs text-gray-500 block mb-1">{label}</label>
            <input
              type={type}
              placeholder={placeholder}
              value={form[key as keyof typeof form]}
              onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
              className="w-full border border-gray-300 rounded-btn px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>
        ))}
      </div>

      {error && <p className="text-xs text-red-500 mt-3">{error}</p>}

      {/* From SRS: tombol Daftar di bawah */}
      <button
        onClick={handleRegister}
        disabled={loading}
        className="w-full bg-brand-blue text-white rounded-btn py-3 text-sm font-medium
                   mt-6 disabled:opacity-60"
      >
        {loading ? 'Mendaftar...' : 'Daftar'}
      </button>

      {/* From SRS: link kembali ke login */}
      <p className="text-center text-sm text-gray-500 mt-3">
        Sudah punya akun?{' '}
        <a href="/login" className="text-brand-blue font-medium">Masuk di sini</a>
      </p>
    </div>
  )
}
```

### 3.3 Form Biodata Anak

From SRS spec (Form Biodata Anak):
> "Input: nama anak, NIK anak (16 digit), tanggal lahir (date picker), tempat lahir,
> jenis kelamin, RT/RW. Area upload foto anak, tombol Selesai warna biru-teal."

```tsx
// src/app/(dashboard)/ortu/anak/register/page.tsx
import { registerAnak } from '@/app/actions/anak.actions'

export default function RegisterAnakPage() {
  return (
    <div className="px-4 py-6 max-w-md mx-auto">
      {/* Back arrow + title like mockup */}
      <div className="flex items-center gap-3 mb-5">
        <a href="/ortu" className="text-brand-blue">←</a>
        <div>
          <h2 className="text-base font-semibold text-gray-900">Biodata Anak</h2>
          <p className="text-xs text-gray-400">Lengkapi data kesehatan anak Anda</p>
        </div>
      </div>

      <form action={registerAnak} className="space-y-[10px]">
        {/* From SRS: area upload foto anak — circle upload area */}
        <div className="flex justify-center py-3">
          <label className="cursor-pointer">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-brand-teal
                            bg-brand-light flex flex-col items-center justify-center">
              <span className="text-2xl">📷</span>
              <span className="text-[10px] text-brand-teal text-center leading-tight mt-0.5">
                Upload<br/>Foto
              </span>
            </div>
            <input type="file" name="foto" accept="image/*" className="hidden" />
          </label>
        </div>

        {/* From SRS: nama anak */}
        <div>
          <label className="text-xs text-gray-500 block mb-1">Nama Anak</label>
          <input
            name="nama_anak" type="text" placeholder="Nama lengkap anak" required
            className="w-full border border-gray-300 rounded-btn px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        {/* From SRS: NIK anak (16 digit) */}
        <div>
          <label className="text-xs text-gray-500 block mb-1">NIK Anak</label>
          <input
            name="nik" type="text" placeholder="16 digit NIK" maxLength={16} required
            className="w-full border border-gray-300 rounded-btn px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        {/* From SRS: tanggal lahir (date picker) + tempat lahir */}
        <div>
          <label className="text-xs text-gray-500 block mb-1">Tanggal Lahir</label>
          <input
            name="tgl_lahir" type="date" required
            className="w-full border border-gray-300 rounded-btn px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">Tempat Lahir</label>
          <input
            name="tempat_lahir" type="text" placeholder="Kota/Kabupaten" required
            className="w-full border border-gray-300 rounded-btn px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        {/* From SRS: jenis kelamin */}
        <div>
          <label className="text-xs text-gray-500 block mb-1">Jenis Kelamin</label>
          <select
            name="jenis_kelamin" required
            className="w-full border border-gray-300 rounded-btn px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white"
          >
            <option value="">Pilih Jenis Kelamin</option>
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>

        {/* From SRS: RT/RW */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">RT</label>
            <input
              name="rt" type="text" placeholder="001" required
              className="w-full border border-gray-300 rounded-btn px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">RW</label>
            <input
              name="rw" type="text" placeholder="004" required
              className="w-full border border-gray-300 rounded-btn px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>
        </div>

        {/* From SRS: tombol Selesai warna biru-teal */}
        <button
          type="submit"
          className="w-full bg-brand-teal text-white rounded-btn py-3 text-sm font-medium
                     mt-2 flex items-center justify-center gap-2"
          style={{ height: '48px' }}
        >
          ✓ Selesai
        </button>
      </form>
    </div>
  )
}
```

### 3.4 Dashboard Card — Orang Tua

From SRS spec (Dashboard Card Orang Tua):
> "Sapaan 'Selamat Pagi, [Nama]', card profil anak (foto, nama, usia), tombol 'Buat Reservasi' warna teal. Border radius ±12px, shadow ringan."

From SRS spec (Child Profile Card):
> "Foto avatar bulat, nama anak, usia, label 'Profil Anak'. Border radius ±12px, shadow ringan, background putih."

```tsx
// src/components/ortu/DashboardCard.tsx
import Link from 'next/link'

interface DashboardCardProps {
  namaOrtu: string
  namaAnak: string
  usiaBulan: number
  usiaLabel: string  // e.g. "1 Tahun"
  usiaSubLabel: string // e.g. "8 Bulan"
  fotoUrl?: string | null
  anakId: string
}

export function DashboardCard({
  namaOrtu,
  namaAnak,
  usiaBulan,
  usiaLabel,
  usiaSubLabel,
  fotoUrl,
  anakId,
}: DashboardCardProps) {
  return (
    <div className="px-4 pt-4 space-y-3">
      {/* From SRS: sapaan "Selamat Pagi, [Nama]" */}
      <div>
        <p className="text-xs text-gray-500">SELAMAT PAGI,</p>
        <p className="text-lg font-bold text-gray-900">Halo, {namaOrtu}</p>
      </div>

      {/* From SRS: card profil anak — avatar bulat, nama, usia, label "Profil Anak"
          Border radius ±12px, shadow ringan, background putih */}
      <Link href={`/ortu/anak/${anakId}`}>
        <div className="bg-white rounded-card shadow-sm border border-gray-100
                        flex items-center gap-3 p-3">
          {/* Circular avatar with green dot indicator (from mockup) */}
          <div className="relative flex-shrink-0">
            {fotoUrl ? (
              <img src={fotoUrl} alt={namaAnak}
                   className="w-11 h-11 rounded-full object-cover" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-brand-light flex items-center
                              justify-center text-brand-blue font-bold text-base">
                {namaAnak.slice(0, 1)}
              </div>
            )}
            {/* Green dot from mockup */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full
                             bg-green-400 border-2 border-white" />
          </div>

          <div className="flex-1">
            {/* From SRS: nama anak */}
            <p className="text-[14px] font-semibold text-gray-900 leading-tight">{namaAnak}</p>
            {/* From SRS: usia label e.g. "Profil Anak" + "1 Tahun / 8 Bulan" */}
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[11px] text-gray-400">Profil Anak</span>
              <span className="text-[11px] text-gray-300">·</span>
              <span className="text-[11px] text-gray-500">{usiaLabel}</span>
              <span className="text-[11px] text-gray-500">{usiaSubLabel}</span>
            </div>
          </div>

          {/* Chevron from mockup */}
          <span className="text-gray-400 text-sm">›</span>
        </div>
      </Link>

      {/* From SRS: tombol "Buat Reservasi" warna teal
          Action Button (Primary): background biru-teal, teks putih, border radius ±8px,
          lebar penuh, font-size 14-15px, font-weight 500 */}
      <Link href="/ortu/reservasi">
        <button
          className="w-full bg-brand-teal text-white rounded-btn text-[14px] font-medium
                     flex items-center justify-center gap-2 py-3"
        >
          {/* Plus icon from mockup */}
          <span className="text-lg leading-none">⊕</span>
          Buat Reservasi
        </button>
      </Link>
    </div>
  )
}
```

### 3.5 Schedule List Card — Pilih Jadwal

From SRS spec (Schedule List Card):
> "Setiap card: tanggal sesi bold, kuota tersisa, lokasi, rentang waktu, tombol 'Pilih' biru. Kuota 0 = disabled. Spacing ±8px."

From the mockup image (page 16), each schedule card shows:
- Tanggal bold di kiri atas
- Kuota: angka tersisa
- Lokasi posyandu (e.g. "Posyandu Bojong")
- Slot waktu range
- Tombol "Pilih" biru kanan

```tsx
// src/components/ortu/ScheduleListCard.tsx
interface ScheduleListCardProps {
  id: string
  tanggal: string         // formatted date
  jam: string             // e.g. "08:00 - 10:00 WIB"
  lokasi: string
  kuota: number
  kuotaTerisi: number
  onPilih: (id: string) => void
}

export function ScheduleListCard({
  id, tanggal, jam, lokasi, kuota, kuotaTerisi, onPilih,
}: ScheduleListCardProps) {
  const sisaKuota = kuota - kuotaTerisi
  const isFull = sisaKuota <= 0

  return (
    // From SRS: spacing ±8px between cards
    <div className={`bg-white rounded-card border shadow-sm p-4
                    ${isFull ? 'border-gray-200 opacity-60' : 'border-gray-100'}`}
         style={{ marginBottom: '8px' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {/* From SRS: tanggal sesi bold */}
          <p className="text-[14px] font-bold text-gray-900">{tanggal}</p>

          {/* From SRS: kuota tersisa */}
          <p className="text-[12px] text-gray-400 mt-0.5">
            Kuota : {sisaKuota}
          </p>

          {/* From SRS: lokasi */}
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[11px] text-gray-400">📍</span>
            <p className="text-[12px] text-gray-500">{lokasi}</p>
          </div>

          {/* From SRS: rentang waktu */}
          <p className="text-[12px] text-gray-400 mt-0.5">
            🕐 {jam}
          </p>
        </div>

        {/* From SRS: tombol "Pilih" biru. Kuota 0 = disabled */}
        {isFull ? (
          <button
            disabled
            className="bg-gray-200 text-gray-400 text-xs font-medium
                       px-4 py-1.5 rounded-btn flex-shrink-0"
          >
            Penuh
          </button>
        ) : (
          <button
            onClick={() => onPilih(id)}
            className="bg-brand-blue text-white text-xs font-medium
                       px-4 py-1.5 rounded-btn flex-shrink-0 hover:bg-brand-blue/90"
          >
            Pilih
          </button>
        )}
      </div>
    </div>
  )
}
```

### 3.6 Reservation Success Card

From SRS spec (Reservation Success Card):
> "Card biru lebar, nama posyandu + waktu antrean bold ±28px, background #1A73C1, border radius ±12px."

From mockup image: shows "Posyandu Bojong" text large, nomor antrean in white box.

```tsx
// src/components/ortu/ReservationSuccessCard.tsx
interface ReservationSuccessCardProps {
  namaPosyandu: string
  noAntrean: number
}

export function ReservationSuccessCard({ namaPosyandu, noAntrean }: ReservationSuccessCardProps) {
  return (
    // From SRS: card biru lebar, background #1A73C1, border radius ±12px
    <div
      className="rounded-card p-6 text-white text-center"
      style={{ backgroundColor: '#1A73C1' }}
    >
      <p className="text-sm opacity-80 mb-2">Reservasi Berhasil</p>

      {/* From SRS: nama posyandu + waktu antrean bold ±28px */}
      <p
        className="font-bold leading-tight"
        style={{ fontSize: '28px' }}
      >
        {namaPosyandu}
      </p>

      {/* Queue number display from mockup */}
      <div className="mt-4 bg-white/20 rounded-xl py-4 px-8 inline-block">
        <p className="text-xs opacity-80 mb-1">Nomor Antrean</p>
        <p className="font-bold tracking-widest" style={{ fontSize: '28px' }}>
          {String(noAntrean).padStart(3, '0')}
        </p>
      </div>
    </div>
  )
}
```

### 3.7 Health Stats Card

From SRS spec (Health Stats Card):
> "4 metrik: Berat (kg), Tinggi (cm), LILA (cm), Lingkar Kepala (cm). Grid horizontal, nilai bold ±18px, label ±11px."

From mockup image (page 16, "Data Kesehatan Anak" screen):
values shown as `9.5 kg`, `82 cm`, `16 cm`, `45 cm` in a horizontal 4-column grid.

```tsx
// src/components/ortu/HealthStatsCard.tsx
interface HealthStatsCardProps {
  beratBadan?: number | null
  tinggiBadan?: number | null
  lila?: number | null
  lingkarKepala?: number | null
}

export function HealthStatsCard({ beratBadan, tinggiBadan, lila, lingkarKepala }: HealthStatsCardProps) {
  // From SRS: 4 metrik dengan label dan unit
  const metrics = [
    { label: 'Berat', value: beratBadan, unit: 'kg' },
    { label: 'Tinggi', value: tinggiBadan, unit: 'cm' },
    { label: 'LILA', value: lila, unit: 'cm' },
    { label: 'Lkr. Kepala', value: lingkarKepala, unit: 'cm' },
  ]

  return (
    <div className="bg-white rounded-card shadow-sm border border-gray-100 p-4 mx-4">
      {/* From SRS: grid horizontal */}
      <div className="grid grid-cols-4 gap-2">
        {metrics.map(({ label, value, unit }) => (
          <div key={label} className="text-center">
            {/* From SRS: nilai bold ±18px */}
            <p className="font-bold text-gray-900" style={{ fontSize: '18px', lineHeight: '1.2' }}>
              {value != null ? value : (
                <span className="text-gray-300 text-sm">-</span>
              )}
            </p>
            {/* From SRS: label ±11px */}
            <p className="text-gray-400 mt-0.5" style={{ fontSize: '11px' }}>{unit}</p>
            <p className="text-gray-500 mt-0.5" style={{ fontSize: '11px' }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 3.8 Growth Chart

From SRS spec (Growth Chart):
> "Line chart 3 garis: data anak (biru), Normal (hijau), Tren Naik (abu). Sumbu X usia, sumbu Y berat badan, legenda di bawah."

From mockup image (page 16): shows a small line chart with 3 lines, legend below with "Anak", "Normal", "Tren Naik" labels.

```tsx
// src/components/ortu/GrowthChart.tsx
'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

interface GrowthDataPoint {
  usia: number      // age in months (sumbu X)
  beratAnak: number // child's weight (garis biru)
  normal: number    // WHO normal median (garis hijau)
  trenNaik: number  // WHO +2SD (garis abu)
}

export function GrowthChart({ data }: { data: GrowthDataPoint[] }) {
  return (
    <div className="bg-white rounded-card shadow-sm border border-gray-100 p-4 mx-4">
      <p className="text-[13px] font-semibold text-gray-700 mb-3">Kurva Pertumbuhan</p>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

          {/* From SRS: sumbu X = usia */}
          <XAxis
            dataKey="usia"
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            tickFormatter={v => `${v}m`}
          />
          {/* From SRS: sumbu Y = berat badan */}
          <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />

          <Tooltip
            contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
            labelFormatter={v => `Usia: ${v} bulan`}
            formatter={(val: number, name: string) => [`${val} kg`, name]}
          />

          {/* From SRS: legenda di bawah */}
          <Legend
            verticalAlign="bottom"
            iconType="line"
            wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
          />

          {/* From SRS: data anak = garis biru */}
          <Line
            type="monotone" dataKey="beratAnak" name="Anak"
            stroke="#1A73C1" strokeWidth={2} dot={{ r: 3, fill: '#1A73C1' }}
            activeDot={{ r: 4 }}
          />
          {/* From SRS: Normal = hijau */}
          <Line
            type="monotone" dataKey="normal" name="Normal"
            stroke="#4CAF50" strokeWidth={1.5} strokeDasharray="5 5" dot={false}
          />
          {/* From SRS: Tren Naik = abu */}
          <Line
            type="monotone" dataKey="trenNaik" name="Tren Naik"
            stroke="#9E9E9E" strokeWidth={1.5} strokeDasharray="5 5" dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

### 3.9 Examination History List

From SRS spec (Examination History List):
> "List vertikal, tiap item: ikon dokumen, tanggal, nilai berat-tinggi-LILA-lingkar kepala. Separator garis tipis, font ±13px."

### 3.10 Medical Recommendation Card

From SRS spec (Medical Recommendation Card):
> "Ikon medis, tanggal, deskripsi saran singkat. Background putih, border kiri aksen biru, font ±13px."

```tsx
// src/components/ortu/ExaminationHistoryItem.tsx
interface ExaminationHistoryItemProps {
  tanggal: string
  beratBadan: number
  tinggiBadan: number
  lila?: number | null
  lingkarKepala?: number | null
  saranMedis?: string | null
  isLast?: boolean
}

export function ExaminationHistoryItem({
  tanggal, beratBadan, tinggiBadan, lila, lingkarKepala, saranMedis, isLast,
}: ExaminationHistoryItemProps) {
  return (
    <div className={`flex items-start gap-3 py-3 ${!isLast ? 'border-b border-gray-100' : ''}`}>
      {/* From SRS: ikon dokumen */}
      <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center flex-shrink-0">
        <span style={{ fontSize: '14px' }}>📋</span>
      </div>

      <div className="flex-1">
        {/* From SRS: tanggal, font ±13px */}
        <p className="font-medium text-gray-700" style={{ fontSize: '13px' }}>{tanggal}</p>
        {/* From SRS: nilai berat-tinggi-LILA-lingkar kepala */}
        <p className="text-gray-400 mt-0.5" style={{ fontSize: '13px' }}>
          {beratBadan}kg · {tinggiBadan}cm
          {lila ? ` · LILA ${lila}cm` : ''}
          {lingkarKepala ? ` · Lkr.Kepala ${lingkarKepala}cm` : ''}
        </p>

        {/* From SRS: Medical Recommendation Card
            Background putih, border kiri aksen biru, font ±13px */}
        {saranMedis && (
          <div className="mt-2 bg-white border-l-4 border-brand-blue pl-3 py-2 rounded-r-box">
            <div className="flex items-center gap-1.5 mb-1">
              <span style={{ fontSize: '12px' }}>🩺</span>
              <span className="text-gray-500" style={{ fontSize: '13px', fontWeight: 500 }}>
                Saran Medis
              </span>
            </div>
            {/* From SRS: deskripsi saran singkat */}
            <p className="text-gray-600 leading-relaxed" style={{ fontSize: '13px' }}>
              {saranMedis}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## 4. Kader Components

### 4.1 Announcement Banner

From SRS spec (Announcement Banner):
> "Card lebar penuh, background biru (#1A73C1), teks putih, judul bold, subjudul info kegiatan. Border radius ±12px, padding 16px."

From mockup image (page 19): Shows "Selamat Pagi!", subtitle about Posyandu Bojong activity today.

```tsx
// src/components/kader/AnnouncementBanner.tsx
interface AnnouncementBannerProps {
  judul: string
  subjudul: string
}

export function AnnouncementBanner({ judul, subjudul }: AnnouncementBannerProps) {
  return (
    // From SRS: card lebar penuh, background biru #1A73C1, border radius ±12px, padding 16px
    <div
      className="rounded-card text-white mx-4"
      style={{ backgroundColor: '#1A73C1', padding: '16px' }}
    >
      <p className="font-bold text-base">{judul}</p>
      <p className="text-sm opacity-90 mt-0.5">{subjudul}</p>
    </div>
  )
}
```

### 4.2 Stats Summary Card

From SRS spec (Stats Summary Card):
> "2 kolom: 'Total Balita' (angka bold ±28px, keterangan '+N bulan ini' hijau) dan 'Antrean Hari Ini' (angka + progress bar). Background putih, border radius ±10px."

```tsx
// src/components/kader/StatsSummaryCard.tsx
interface StatsSummaryCardProps {
  totalBalita: number
  tambahBulanIni: number
  antreanHariIni: number
  antreanSelesai: number
}

export function StatsSummaryCard({
  totalBalita, tambahBulanIni, antreanHariIni, antreanSelesai,
}: StatsSummaryCardProps) {
  const progressPct = antreanHariIni > 0
    ? Math.round((antreanSelesai / antreanHariIni) * 100)
    : 0

  return (
    // From SRS: background putih, border radius ±10px
    <div className="bg-white mx-4 shadow-sm border border-gray-100 p-4"
         style={{ borderRadius: '10px' }}>
      {/* From SRS: 2 kolom */}
      <div className="grid grid-cols-2 gap-4">
        {/* Kolom 1: Total Balita */}
        <div>
          {/* From SRS: angka bold ±28px */}
          <p className="font-bold text-gray-900" style={{ fontSize: '28px', lineHeight: '1' }}>
            {totalBalita}
          </p>
          <p className="text-gray-400 mt-1" style={{ fontSize: '12px' }}>Total Balita</p>
          {/* From SRS: keterangan "+N bulan ini" hijau */}
          <p className="text-green-500 font-medium mt-0.5" style={{ fontSize: '12px' }}>
            +{tambahBulanIni} bulan ini
          </p>
        </div>

        {/* Kolom 2: Antrean Hari Ini */}
        <div>
          <p className="font-bold text-gray-900" style={{ fontSize: '28px', lineHeight: '1' }}>
            {antreanHariIni}
          </p>
          <p className="text-gray-400 mt-1" style={{ fontSize: '12px' }}>Antrean Hari Ini</p>
          {/* From SRS: progress bar */}
          <div className="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-blue rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-gray-400 mt-0.5" style={{ fontSize: '11px' }}>
            {antreanSelesai}/{antreanHariIni} selesai
          </p>
        </div>
      </div>
    </div>
  )
}
```

### 4.3 Patient Queue List Item

From SRS spec (Patient Queue List):
> "List vertikal, tiap item: foto avatar bulat, nama, RT/RW, tombol 'Pilih' biru di kanan. Separator garis tipis, spacing ±12px."

From mockup image (page 19): Arka Wicak · RT 01 / RW 04, Siti Aminah · RT 03 / RW 04, etc.

```tsx
// src/components/kader/PatientQueueItem.tsx
import Link from 'next/link'

interface PatientQueueItemProps {
  reservasiId: string
  noAntrean: number
  namaAnak: string
  rt: string
  rw: string
  isLast?: boolean
}

export function PatientQueueItem({
  reservasiId, noAntrean, namaAnak, rt, rw, isLast,
}: PatientQueueItemProps) {
  return (
    // From SRS: separator garis tipis, spacing ±12px
    <div className={`flex items-center gap-3 py-3 px-4
                    ${!isLast ? 'border-b border-gray-100' : ''}`}
         style={{ gap: '12px' }}>

      {/* Queue number circle */}
      <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center
                      flex-shrink-0 text-brand-blue font-bold text-sm">
        {noAntrean}
      </div>

      {/* From SRS: foto avatar bulat */}
      <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden
                      flex items-center justify-center">
        <span className="text-gray-400 text-lg">👤</span>
      </div>

      {/* From SRS: nama anak font 14px/500, RT/RW font 12px abu */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate" style={{ fontSize: '14px', fontWeight: 500 }}>
          {namaAnak}
        </p>
        <p className="text-gray-400 mt-0.5" style={{ fontSize: '12px' }}>
          RT {rt} / RW {rw}
        </p>
      </div>

      {/* From SRS: tombol "Pilih" biru di kanan */}
      <Link href={`/kader/pemeriksaan/${reservasiId}`}>
        <button className="bg-brand-blue text-white text-xs font-medium
                           px-4 py-1.5 rounded-btn flex-shrink-0">
          Pilih
        </button>
      </Link>
    </div>
  )
}
```

### 4.4 Child List with Search (Halaman Data Anak Kader)

From SRS spec (Child List with Search):
> "Search bar atas (placeholder 'Cari nama anak...'), filter chip RT (Semua, RT 01-03), chip aktif background biru, list item: foto, nama, RT/RW."

From SRS spec (Filter Chip RT):
> "Horizontal scrollable, chip aktif: background biru, teks putih; non-aktif: border abu, teks gelap. Border radius ±16px, padding 6px 14px."

From SRS spec (Child List Item):
> "Avatar bulat ±40px, nama anak font 14px/500, RT/RW font 12px abu. Gap ±12px, border bawah tipis sebagai separator."

From mockup image (page 17): Data Anak screen shows search bar, "Semua RT 01 RT 02 RT 03" chips, list of Arka Wicak, Siti Aminah, Bima Sakti, Lina Marlina.

```tsx
// src/components/kader/ChildListSearch.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Child {
  id: string
  nama_anak: string
  rt: string
  rw: string
  foto_url?: string | null
}

export function ChildListSearch({ children }: { children: Child[] }) {
  const [search, setSearch] = useState('')
  // From SRS: filter chip RT (Semua, RT 01-03)
  const [activeFilter, setActiveFilter] = useState('Semua')

  const rtOptions = ['Semua', 'RT 01', 'RT 02', 'RT 03']

  const filtered = children.filter(c => {
    const matchSearch = c.nama_anak.toLowerCase().includes(search.toLowerCase())
    const matchRT = activeFilter === 'Semua' || `RT ${c.rt}` === activeFilter
    return matchSearch && matchRT
  })

  return (
    <div>
      {/* From SRS: search bar atas, placeholder "Cari nama anak..." */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 border border-gray-300 rounded-btn
                        px-3 py-2 bg-white">
          <span className="text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Cari nama anak..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm focus:outline-none bg-transparent"
          />
        </div>
      </div>

      {/* From SRS: filter chip RT, horizontal scrollable */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none">
        {rtOptions.map(rt => (
          <button
            key={rt}
            onClick={() => setActiveFilter(rt)}
            // From SRS: chip aktif = background biru teks putih;
            // non-aktif = border abu teks gelap; border radius ±16px, padding 6px 14px
            className={`flex-shrink-0 text-xs font-medium transition-colors
                        ${activeFilter === rt
                          ? 'bg-brand-blue text-white border border-brand-blue'
                          : 'bg-white text-gray-700 border border-gray-300'}`}
            style={{ borderRadius: '16px', padding: '6px 14px' }}
          >
            {rt}
          </button>
        ))}
      </div>

      {/* From SRS: list item — avatar bulat ±40px, nama font 14px/500, RT/RW 12px abu
          gap ±12px, border bawah tipis sebagai separator */}
      <div className="bg-white mx-4 rounded-card border border-gray-100 overflow-hidden">
        {filtered.map((child, idx) => (
          <Link key={child.id} href={`/kader/anak/${child.id}`}>
            <div
              className={`flex items-center px-4 py-3 hover:bg-gray-50 transition-colors
                          ${idx < filtered.length - 1 ? 'border-b border-gray-100' : ''}`}
              style={{ gap: '12px' }}
            >
              {/* From SRS: avatar bulat ±40px */}
              <div
                className="rounded-full bg-brand-light flex items-center justify-center
                            flex-shrink-0 text-brand-blue font-semibold text-sm overflow-hidden"
                style={{ width: '40px', height: '40px' }}
              >
                {child.foto_url
                  ? <img src={child.foto_url} alt={child.nama_anak}
                         className="w-full h-full object-cover" />
                  : child.nama_anak.slice(0, 2).toUpperCase()
                }
              </div>

              <div className="flex-1 min-w-0">
                {/* From SRS: nama anak font 14px/500 */}
                <p className="text-gray-900 truncate"
                   style={{ fontSize: '14px', fontWeight: 500 }}>
                  {child.nama_anak}
                </p>
                {/* From SRS: RT/RW font 12px abu */}
                <p className="text-gray-400 mt-0.5" style={{ fontSize: '12px' }}>
                  RT {child.rt} / RW {child.rw}
                </p>
              </div>

              <span className="text-gray-300 text-sm flex-shrink-0">›</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

### 4.5 Examination Form (Kader Input Antropometri)

From SRS spec (Examination Form):
> "4 field numerik: Berat Badan, Tinggi Badan, LILA, Lingkar Kepala. Nilai awal '0.0', info box biru muda berisi catatan prosedur di bawah."

From SRS spec (Measurement Input Field):
> "Label atas font 13px abu, nilai field font 16px bold, satuan (kg/cm) di kanan. Background abu muda (#F2F2F2), border radius ±8px, padding 10-12px."

From SRS spec (Info Box Prosedur):
> "Background biru muda (#E8F0FB), ikon i biru di kiri, teks petunjuk, border radius ±8px, padding 12px. Read-only."

From SRS spec (Save Button):
> "Lebar penuh, background biru (#1A73C1), teks putih 'Simpan Data', ikon simpan di kiri, font-size 15px, border radius ±8px, tinggi ±52px."

From mockup image (page 19): Shows form with Berat Badan (Kg), Tinggi Badan (cm), LILA, Lingkar Kepala fields, each with 0.0 default and unit label on right.

```tsx
// src/components/kader/ExaminationForm.tsx
'use client'

import { useState } from 'react'
import { SaveIcon } from 'lucide-react'

interface MeasurementField {
  name: 'berat_badan' | 'tinggi_badan' | 'lila' | 'lingkar_kepala'
  // From SRS: label atas font 13px abu
  label: string
  // From SRS: satuan (kg/cm) di kanan
  unit: string
}

// From SRS: 4 field numerik: Berat Badan, Tinggi Badan, LILA, Lingkar Kepala
const FIELDS: MeasurementField[] = [
  { name: 'berat_badan',    label: 'Berat Badan (Kg)',    unit: 'Kg' },
  { name: 'tinggi_badan',   label: 'Tinggi Badan (cm)',   unit: 'cm' },
  { name: 'lila',           label: 'LILA',                unit: 'cm' },
  { name: 'lingkar_kepala', label: 'Lingkar Kepala (cm)', unit: 'cm' },
]

interface ExaminationFormProps {
  reservasiId: string
  namaAnak: string
  onSuccess: () => void
}

export function ExaminationForm({ reservasiId, namaAnak, onSuccess }: ExaminationFormProps) {
  // From SRS: nilai awal "0.0"
  const [values, setValues] = useState({
    berat_badan: '', tinggi_badan: '', lila: '', lingkar_kepala: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    const res = await fetch('/api/pemeriksaan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_reservasi: reservasiId,
        berat_badan: parseFloat(values.berat_badan),
        tinggi_badan: parseFloat(values.tinggi_badan),
        lingkar_lengan_atas: values.lila ? parseFloat(values.lila) : undefined,
        lingkar_kepala: values.lingkar_kepala ? parseFloat(values.lingkar_kepala) : undefined,
      }),
    })
    if (!res.ok) {
      const d = await res.json()
      setError(d.error || 'Terjadi kesalahan.')
      setLoading(false)
      return
    }
    onSuccess()
  }

  return (
    <div className="px-4 space-y-4">
      {/* Child name header from mockup */}
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center
                        text-brand-blue font-bold text-sm">
          {namaAnak.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900">{namaAnak}</p>
        </div>
      </div>

      {/* From SRS: Identitas Pemeriksaan section header (from mockup) */}
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Identitas Pemeriksaan
      </p>

      {/* From SRS: 4 field numerik */}
      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map(({ name, label, unit }) => (
          <div key={name}>
            {/* From SRS: label atas font 13px abu */}
            <label className="text-gray-400 block mb-1.5" style={{ fontSize: '13px' }}>
              {label}
            </label>
            <div className="flex items-center gap-2">
              {/* From SRS: background abu muda #F2F2F2, border radius ±8px, padding 10-12px
                  nilai field font 16px bold */}
              <input
                type="number"
                step="0.1"
                value={values[name]}
                onChange={e => setValues(prev => ({ ...prev, [name]: e.target.value }))}
                // From SRS: nilai awal "0.0"
                placeholder="0.0"
                className="flex-1 font-bold text-gray-900 focus:outline-none
                           focus:ring-2 focus:ring-brand-blue"
                style={{
                  backgroundColor: '#F2F2F2',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '16px',
                }}
              />
              {/* From SRS: satuan (kg/cm) di kanan */}
              <span className="text-gray-500 text-sm font-medium w-6 flex-shrink-0">{unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* From SRS: Info Box Prosedur
          Background biru muda #E8F0FB, ikon i biru di kiri, border radius ±8px, padding 12px */}
      <div
        className="flex gap-2 items-start"
        style={{ backgroundColor: '#E8F0FB', borderRadius: '8px', padding: '12px' }}
      >
        {/* From SRS: ikon i biru di kiri */}
        <div className="w-5 h-5 rounded-full bg-brand-blue flex items-center justify-center
                        flex-shrink-0 mt-0.5">
          <span className="text-white font-bold" style={{ fontSize: '11px' }}>i</span>
        </div>
        {/* From SRS: teks petunjuk, read-only */}
        <p className="text-brand-blue leading-relaxed" style={{ fontSize: '12px' }}>
          Pastikan timbangan tidak diaktifkan dan anak tidak menggunakan alas kaki saat pengukuran.
        </p>
      </div>

      {error && (
        <p className="text-red-500 bg-red-50 rounded-box p-3" style={{ fontSize: '12px' }}>
          {error}
        </p>
      )}

      {/* From SRS: Save Button — lebar penuh, background biru #1A73C1, teks putih "Simpan Data",
          ikon simpan di kiri, font-size 15px, border radius ±8px, tinggi ±52px */}
      <button
        onClick={handleSubmit}
        disabled={loading || !values.berat_badan || !values.tinggi_badan}
        className="w-full bg-brand-blue text-white font-medium flex items-center justify-center
                   gap-2 disabled:opacity-50 transition-opacity"
        style={{ borderRadius: '8px', fontSize: '15px', height: '52px' }}
      >
        <SaveIcon className="w-4 h-4" />
        {loading ? 'Menyimpan...' : 'Simpan Data'}
      </button>
    </div>
  )
}
```

### 4.6 Child Biodata — Identity Detail Card (Kader View)

From SRS spec (Identity Detail Card):
> "2 seksi: 'Identitas Pokok' dan 'Data Kelahiran'. Usia dalam tahun & bulan warna biru-teal bold. RT/RW dalam 2 kotak sejajar, label font 11px abu, nilai 14px bold."

From mockup image (page 19, Frame 7): Shows NIK, jenis kelamin (Laki-laki), Kota lahir (Bandung), Tanggal lahir (05 Agustus 2021), Usia "2 Tahun 6 Bulan" in teal bold, RT 004 / RW 012 in two boxes side by side.

```tsx
// src/components/kader/ChildBiodataCard.tsx
interface ChildBiodataCardProps {
  namaAnak: string
  nik: string
  jenisKelamin: 'L' | 'P'
  tempatLahir: string
  tanggalLahir: string   // formatted
  usiaLabel: string      // e.g. "2 Tahun 6 Bulan"
  rt: string
  rw: string
  fotoUrl?: string | null
}

export function ChildBiodataCard({
  namaAnak, nik, jenisKelamin, tempatLahir,
  tanggalLahir, usiaLabel, rt, rw, fotoUrl,
}: ChildBiodataCardProps) {
  return (
    <div className="bg-white rounded-card border border-gray-100 shadow-sm mx-4 overflow-hidden">
      {/* From SRS: Child Profile Header (Kader)
          Avatar bulat ±52px, nama font 18px/500, jenis kelamin + usia font 13px abu.
          Card putih, border radius ±12px, padding 14px */}
      <div className="flex items-center gap-3 p-[14px] border-b border-gray-100">
        <div
          className="rounded-full bg-brand-light flex items-center justify-center
                     text-brand-blue font-bold overflow-hidden flex-shrink-0"
          style={{ width: '52px', height: '52px' }}
        >
          {fotoUrl
            ? <img src={fotoUrl} alt={namaAnak} className="w-full h-full object-cover" />
            : <span style={{ fontSize: '20px' }}>{namaAnak.slice(0, 1)}</span>
          }
        </div>
        <div>
          {/* From SRS: nama font 18px/500 */}
          <p className="text-gray-900" style={{ fontSize: '18px', fontWeight: 500 }}>
            {namaAnak}
          </p>
          {/* From SRS: jenis kelamin + usia font 13px abu */}
          <p className="text-gray-400 mt-0.5" style={{ fontSize: '13px' }}>
            {jenisKelamin === 'L' ? '♂ Laki-laki' : '♀ Perempuan'}
          </p>
        </div>
      </div>

      <div className="p-[14px] space-y-4">
        {/* From SRS: seksi "Identitas Pokok" */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <span style={{ fontSize: '13px' }}>🪪</span>
            <p className="font-semibold text-gray-700 uppercase tracking-wide"
               style={{ fontSize: '11px' }}>
              Identitas Pokok
            </p>
          </div>
          <p className="text-gray-900 font-mono" style={{ fontSize: '14px' }}>{nik}</p>
          <p className="text-gray-500 mt-1" style={{ fontSize: '13px' }}>
            {jenisKelamin === 'L' ? '✓ Laki-laki' : '✓ Perempuan'}
          </p>
        </div>

        {/* From SRS: seksi "Data Kelahiran" */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <span style={{ fontSize: '13px' }}>📅</span>
            <p className="font-semibold text-gray-700 uppercase tracking-wide"
               style={{ fontSize: '11px' }}>
              Data Kelahiran
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-gray-400" style={{ fontSize: '11px' }}>Tempat Lahir</p>
              <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 500 }}>
                {tempatLahir}
              </p>
            </div>
            <div>
              <p className="text-gray-400" style={{ fontSize: '11px' }}>Tanggal Lahir</p>
              <p className="text-gray-900" style={{ fontSize: '14px', fontWeight: 500 }}>
                {tanggalLahir}
              </p>
            </div>
          </div>
          {/* From SRS: usia dalam tahun & bulan warna biru-teal bold */}
          <div className="mt-2">
            <p className="text-gray-400" style={{ fontSize: '11px' }}>Usia Saat Ini</p>
            <p className="font-bold text-brand-teal" style={{ fontSize: '16px' }}>
              {usiaLabel}
            </p>
          </div>
        </div>

        {/* From SRS: RT/RW dalam 2 kotak sejajar, label font 11px abu, nilai 14px bold */}
        <div className="grid grid-cols-2 gap-3">
          {[{ label: 'RT', value: rt.padStart(3, '0') }, { label: 'RW', value: rw.padStart(3, '0') }]
            .map(({ label, value }) => (
              <div
                key={label}
                className="bg-gray-50 rounded-box border border-gray-200 p-3 text-center"
              >
                {/* From SRS: label font 11px abu */}
                <p className="text-gray-400" style={{ fontSize: '11px' }}>{label}</p>
                {/* From SRS: nilai 14px bold */}
                <p className="text-gray-900 font-bold" style={{ fontSize: '14px' }}>{value}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
```

---

## 5. Bidan Desa Components

### 5.1 Alert Filter Chip

From SRS spec (Alert Filter Chip):
> "Chip horizontal: 'Semua' abu, 'Malnutrisi' abu, 'Stunting' abu, 'Gizi Baik' abu. Border radius ±14px, padding 5px 12px, font-size 12px."

From mockup image (page 20): Shows 4 chips in a row — SEMUA, MALNUTRISI, STUNTING, and a 4th chip.

```tsx
// src/components/bidan/AlertFilterChip.tsx
'use client'

const FILTERS = [
  { value: 'semua',      label: 'SEMUA' },
  { value: 'Gizi Buruk', label: 'MALNUTRISI' },
  { value: 'Stunting',   label: 'STUNTING' },
  { value: 'Gizi Baik',  label: 'GIZI BAIK' },
]

export function AlertFilterChip({
  active,
  onChange,
}: {
  active: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex gap-2 px-4 overflow-x-auto scrollbar-none pb-1">
      {FILTERS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          // From SRS: border radius ±14px, padding 5px 12px, font-size 12px
          // aktif = biru teks putih; non-aktif = abu border
          className={`flex-shrink-0 font-medium transition-colors
                      ${active === value
                        ? 'bg-brand-blue text-white border border-brand-blue'
                        : 'bg-white text-gray-500 border border-gray-300'}`}
          style={{ borderRadius: '14px', padding: '5px 12px', fontSize: '12px' }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
```

### 5.2 Patient Risk Card

From SRS spec (Patient Risk Card):
> "Tiap card: foto avatar, nama, usia + jenis kelamin, badge 'Resiko Tinggi' / 'Gizi Baik', 2 metrik merah jika abnormal, label 'Butuh Rujukan', tombol 'Buat Tindakan →'. Border radius ±12px, shadow ringan."

From SRS spec (Risk Badge):
> "Teks 'Resiko Tinggi' / 'Gizi Baik', background merah (#D32F2F), teks putih, font-size 11px/500, border radius ±4px, padding 3px 8px."

From SRS spec (Health Metric Highlight):
> "Label metrik font 11px abu, nilai bold font 13px merah jika abnormal (contoh: 'Sangat Kurang', '11.2 cm'). Layout 2 kolom dalam card."

From SRS spec (Referral Indicator):
> "Ikon peringatan + teks 'Butuh Rujukan' bila data abnormal, warna merah, font-size 12px. Posisi di bawah metrik dalam card pasien."

From SRS spec (Action Button Buat Tindakan):
> "Teks 'Buat Tindakan →', background biru (#1A73C1), teks putih, border radius ±6px, padding 8px 14px, font-size 13px. Posisi kanan bawah card."

From mockup image (page 20): Card shows Siti Aminah, 24 Bln • Perempuan, "RESIKO TINGGI" badge in red, BB/Umur "Sangat Kurang", LILA "11.2 cm" in red, "! Butuh Rujukan" label, "BUAT TINDAKAN >" button.

```tsx
// src/components/bidan/PatientRiskCard.tsx
import Link from 'next/link'

interface PatientRiskCardProps {
  anakId: string
  namaAnak: string
  usiaBulan: number
  jenisKelamin: 'L' | 'P'
  statusGizi: string
  bbUmur?: string | null       // e.g. "Sangat Kurang" or Z-score display
  lila?: number | null
  butuhRujukan?: boolean
}

export function PatientRiskCard({
  anakId, namaAnak, usiaBulan, jenisKelamin,
  statusGizi, bbUmur, lila, butuhRujukan,
}: PatientRiskCardProps) {
  const isHighRisk = ['Gizi Buruk', 'Resiko Tinggi', 'Stunting'].includes(statusGizi)

  return (
    // From SRS: border radius ±12px, shadow ringan
    <div className="bg-white rounded-card shadow-sm border border-gray-100 p-4 mx-4">
      {/* Top row: avatar + name + badge */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center
                        flex-shrink-0 text-brand-blue font-semibold text-sm">
          {namaAnak.slice(0, 2).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Name */}
            <span className="font-medium text-gray-900 truncate" style={{ fontSize: '14px' }}>
              {namaAnak}
            </span>
            {/* From SRS: Risk Badge
                background merah #D32F2F, teks putih, font-size 11px/500,
                border radius ±4px, padding 3px 8px */}
            <span
              className="text-white flex-shrink-0"
              style={{
                backgroundColor: isHighRisk ? '#D32F2F' : '#4CAF50',
                fontSize: '11px',
                fontWeight: 500,
                borderRadius: '4px',
                padding: '3px 8px',
              }}
            >
              {isHighRisk ? 'RESIKO TINGGI' : 'GIZI BAIK'}
            </span>
          </div>

          {/* From SRS: usia + jenis kelamin font 13px */}
          <p className="text-gray-400 mt-0.5" style={{ fontSize: '13px' }}>
            {usiaBulan} Bln · {jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
          </p>
        </div>
      </div>

      {/* From SRS: 2 metrik layout 2 kolom dalam card
          label font 11px abu, nilai bold font 13px merah jika abnormal */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div>
          <p className="text-gray-400" style={{ fontSize: '11px' }}>BB/UMUR</p>
          <p
            className="font-bold mt-0.5"
            style={{
              fontSize: '13px',
              color: isHighRisk ? '#D32F2F' : '#1F2937',
            }}
          >
            {bbUmur ?? statusGizi}
          </p>
        </div>
        {lila != null && (
          <div>
            <p className="text-gray-400" style={{ fontSize: '11px' }}>LILA</p>
            <p
              className="font-bold mt-0.5"
              style={{
                fontSize: '13px',
                color: isHighRisk ? '#D32F2F' : '#1F2937',
              }}
            >
              {lila} cm
            </p>
          </div>
        )}
      </div>

      {/* From SRS: Referral Indicator — ikon peringatan + "Butuh Rujukan"
          warna merah, font-size 12px, posisi di bawah metrik */}
      {butuhRujukan && (
        <div className="flex items-center gap-1 mt-2">
          <span className="text-red-500" style={{ fontSize: '12px' }}>⚠</span>
          <span className="text-red-500 font-medium" style={{ fontSize: '12px' }}>
            Butuh Rujukan
          </span>
        </div>
      )}

      {/* From SRS: Action Button Buat Tindakan
          teks "Buat Tindakan →", background biru #1A73C1, border radius ±6px,
          padding 8px 14px, font-size 13px, posisi kanan bawah card */}
      <div className="flex justify-end mt-3">
        <Link href={`/bidan/anak/${anakId}`}>
          <button
            className="bg-brand-blue text-white font-medium"
            style={{
              borderRadius: '6px',
              padding: '8px 14px',
              fontSize: '13px',
            }}
          >
            Buat Tindakan →
          </button>
        </Link>
      </div>
    </div>
  )
}
```

### 5.3 Growth Chart — Bidan View

From SRS spec (Growth Chart Bidan):
> "Label 'Kurva Pertumbuhan Anak'. 3 indikator: 'Lalu' (abu), 'Sekarang' (hitam bold), 'Tren' (merah dengan ikon panah turun jika menurun). Font nilai ±14px."

From mockup image (page 22): Shows "KURVA PERTUMBUHAN ANAK", then 3 labels: "LALU 9.2 kg", "SEKARANG 7 kg", "TREN ↓-3.2", followed by Berat Badan 9.5, Tinggi Badan 73.4, LILA 11.2 cm, Lingkar Kepala 51.2 cm in box inputs.

```tsx
// src/components/bidan/GrowthChartBidan.tsx
interface GrowthChartBidanProps {
  beratLalu?: number | null
  beratSekarang?: number | null
}

export function GrowthChartBidan({ beratLalu, beratSekarang }: GrowthChartBidanProps) {
  const tren = beratLalu != null && beratSekarang != null
    ? parseFloat((beratSekarang - beratLalu).toFixed(1))
    : null
  const trenTurun = tren != null && tren < 0

  return (
    <div className="bg-white rounded-card border border-gray-100 shadow-sm p-4 mx-4">
      {/* From SRS: label "Kurva Pertumbuhan Anak" */}
      <p className="text-gray-700 font-semibold mb-3" style={{ fontSize: '13px' }}>
        KURVA PERTUMBUHAN ANAK
      </p>

      {/* From SRS: 3 indikator — Lalu (abu), Sekarang (hitam bold), Tren (merah/abu) */}
      <div className="flex items-end gap-4">
        {/* Lalu — abu */}
        <div>
          <p className="text-gray-400 uppercase" style={{ fontSize: '11px' }}>Lalu</p>
          <p className="text-gray-400 font-medium" style={{ fontSize: '14px' }}>
            {beratLalu != null ? `${beratLalu} kg` : '-'}
          </p>
        </div>

        {/* Sekarang — hitam bold */}
        <div>
          <p className="text-gray-500 uppercase" style={{ fontSize: '11px' }}>Sekarang</p>
          <p className="text-gray-900 font-bold" style={{ fontSize: '14px' }}>
            {beratSekarang != null ? `${beratSekarang} kg` : '-'}
          </p>
        </div>

        {/* Tren — merah dengan ikon panah turun jika menurun */}
        {tren != null && (
          <div>
            <p className="text-gray-400 uppercase" style={{ fontSize: '11px' }}>Tren</p>
            <p
              className="font-medium flex items-center gap-0.5"
              style={{ fontSize: '14px', color: trenTurun ? '#D32F2F' : '#4CAF50' }}
            >
              {trenTurun ? '↓' : '↑'}{tren > 0 ? '+' : ''}{tren}
            </p>
          </div>
        )}
      </div>

      {/* Simple visual bar */}
      <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${trenTurun ? 'bg-red-400' : 'bg-green-400'}`}
          style={{ width: beratSekarang ? `${Math.min((beratSekarang / 15) * 100, 100)}%` : '0%' }}
        />
      </div>
    </div>
  )
}
```

### 5.4 Anthropometry Input Field — Bidan Verify View

From SRS spec (Anthropometry Input Field — Bidan):
> "4 field: Berat Badan, Tinggi Badan, LILA, Lingkar Kepala. Nilai dalam kotak abu muda, font 18px bold, satuan di dalam field. Label font 12px abu, border radius ±8px."

From mockup image (page 22): Shows 4 boxes side by side — Berat Badan (kg) = 9.5, Tinggi Badan (cm) = 73.4, LILA (cm) = 11.2, Lingkar Kepala (cm) = 51.2.

```tsx
// src/components/bidan/AnthropometryDisplay.tsx
interface AnthropometryDisplayProps {
  beratBadan?: number | null
  tinggiBadan?: number | null
  lila?: number | null
  lingkarKepala?: number | null
}

export function AnthropometryDisplay({
  beratBadan, tinggiBadan, lila, lingkarKepala,
}: AnthropometryDisplayProps) {
  const fields = [
    { label: 'Berat Badan (kg)', value: beratBadan },
    { label: 'Tinggi Badan (cm)', value: tinggiBadan },
    { label: 'LILA (cm)', value: lila },
    { label: 'Lingkar Kepala (cm)', value: lingkarKepala },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 px-4">
      {fields.map(({ label, value }) => (
        <div key={label}>
          {/* From SRS: label font 12px abu */}
          <p className="text-gray-400 mb-1" style={{ fontSize: '12px' }}>{label}</p>
          {/* From SRS: nilai dalam kotak abu muda, font 18px bold,
              satuan di dalam field, border radius ±8px */}
          <div
            className="flex items-center justify-between"
            style={{ backgroundColor: '#F2F2F2', borderRadius: '8px', padding: '10px 12px' }}
          >
            <span className="text-gray-900 font-bold" style={{ fontSize: '18px' }}>
              {value != null ? value : '0.0'}
            </span>
            <span className="text-gray-400" style={{ fontSize: '13px' }}>
              {label.includes('kg') ? 'kg' : 'cm'}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
```

### 5.5 Assistance Section + Validate & Send Button

From SRS spec (Assistance Section):
> "Label 'Pemberian Bantuan' + subjudul 'Obat/Vitamin/Vaksin' abu, ikon di kiri. Textarea: placeholder saran/jadwal imunisasi, border tipis, border radius ±8px, tinggi ±80px, ikon kirim di kanan bawah."

From SRS spec (Validate & Send Button):
> "Lebar penuh, background hijau-teal (#00897B), teks putih 'Validasi & Kirim', ikon centang di kiri, font-size 15px/500, border radius ±8px, tinggi ±52px."

From mockup image (page 22): "PEMBERIAN BANTUAN" with subtitle, textarea, then green "Validasi & Kirim" button with checkmark icon.

```tsx
// src/components/bidan/AssistanceForm.tsx
'use client'

import { useState } from 'react'
import { CheckCircleIcon, SendIcon } from 'lucide-react'

interface AssistanceFormProps {
  pemeriksaanId: string
  onSuccess: () => void
}

export function AssistanceForm({ pemeriksaanId, onSuccess }: AssistanceFormProps) {
  const [bantuan, setBantuan] = useState('')
  const [saran, setSaran] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!saran.trim()) return
    setLoading(true)
    setError(null)
    const res = await fetch('/api/pemeriksaan', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_pemeriksaan: pemeriksaanId,
        saran_medis: saran,
        pemberian_bantuan_medis: bantuan || undefined,
      }),
    })
    if (!res.ok) {
      const d = await res.json()
      setError(d.error || 'Gagal menyimpan.')
      setLoading(false)
      return
    }
    onSuccess()
  }

  return (
    <div className="px-4 space-y-3">
      {/* From SRS: Assistance Section
          Label "Pemberian Bantuan" + subjudul "Obat/Vitamin/Vaksin" abu, ikon di kiri */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          {/* From SRS: ikon di kiri */}
          <span style={{ fontSize: '16px' }}>💊</span>
          <div>
            <p className="font-semibold text-gray-700" style={{ fontSize: '13px' }}>
              Pemberian Bantuan
            </p>
            {/* From SRS: subjudul "Obat/Vitamin/Vaksin" abu */}
            <p className="text-gray-400" style={{ fontSize: '12px' }}>Obat/Vitamin/Vaksin</p>
          </div>
        </div>
        {/* From SRS: textarea border tipis, border radius ±8px, tinggi ±80px */}
        <div className="relative">
          <textarea
            value={bantuan}
            onChange={e => setBantuan(e.target.value)}
            placeholder="Contoh: Vitamin A 200.000 IU, Imunisasi MR..."
            className="w-full border border-gray-200 text-gray-700 focus:outline-none
                       focus:ring-2 focus:ring-brand-blue resize-none"
            style={{
              borderRadius: '8px',
              height: '80px',
              padding: '10px 40px 10px 12px',
              fontSize: '13px',
            }}
          />
          {/* From SRS: ikon kirim di kanan bawah */}
          <SendIcon
            className="absolute right-3 bottom-3 text-gray-300"
            style={{ width: '16px', height: '16px' }}
          />
        </div>
      </div>

      {/* Saran medis textarea */}
      <div>
        <p className="font-semibold text-gray-700 mb-1.5" style={{ fontSize: '13px' }}>
          Saran Medis <span className="text-red-400">*</span>
        </p>
        <textarea
          value={saran}
          onChange={e => setSaran(e.target.value)}
          placeholder="Masukkan saran kesehatan, pola konsumsi terbaik, atau jadwal imunisasi untuk anak ini..."
          className="w-full border border-gray-200 text-gray-700 focus:outline-none
                     focus:ring-2 focus:ring-brand-blue resize-none"
          style={{
            borderRadius: '8px',
            height: '80px',
            padding: '10px 12px',
            fontSize: '13px',
          }}
        />
      </div>

      {error && (
        <p className="text-red-500 bg-red-50 rounded-box p-3" style={{ fontSize: '12px' }}>
          {error}
        </p>
      )}

      {/* From SRS: Validate & Send Button
          background hijau-teal #00897B, teks putih "Validasi & Kirim",
          ikon centang di kiri, font-size 15px/500, border radius ±8px, tinggi ±52px */}
      <button
        onClick={handleSubmit}
        disabled={loading || !saran.trim()}
        className="w-full text-white font-medium flex items-center justify-center
                   gap-2 disabled:opacity-50 transition-opacity"
        style={{
          backgroundColor: '#00897B',
          borderRadius: '8px',
          fontSize: '15px',
          fontWeight: 500,
          height: '52px',
        }}
      >
        {/* From SRS: ikon centang di kiri */}
        <CheckCircleIcon className="w-4 h-4" />
        {loading ? 'Menyimpan...' : 'Validasi & Kirim'}
      </button>
    </div>
  )
}
```

---

## 6. Loading State Component

```tsx
// src/components/shared/CardSkeleton.tsx
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-card border border-gray-100 shadow-sm p-4 mx-4
                    animate-pulse space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-5/6" />
    </div>
  )
}
```

---

## 7. Root Layout

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Posyandu Care',
  description: 'Sistem Informasi Monitoring Kesehatan Ibu dan Anak',
  // Mobile-first: prevent zoom on input focus
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-gray-100`}>
        {children}
      </body>
    </html>
  )
}
```

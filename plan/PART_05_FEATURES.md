# Posyandu-Care Implementation Plan
## PART 05 — Feature Implementation by Role

> This part covers page-level implementation for each role: Orang Tua, Kader, and Bidan Desa.
> Each section maps directly to the Functional Requirements (FR) defined in the SRS.

---

## 1. Orang Tua (Parent) Features

### FR-01: Parent Registration + Child Biodata Registration

**Registration Page (`src/app/(auth)/register/page.tsx`)**

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerOrangTuaSchema, type RegisterOrangTuaInput } from '@/lib/validations/auth.schema'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useState } from 'react'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterOrangTuaInput>({
    resolver: zodResolver(registerOrangTuaSchema),
  })

  const onSubmit = async (data: RegisterOrangTuaInput) => {
    setError(null)
    const { error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { nama: data.nama, no_hp: data.no_hp },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    // After signup, redirect to child biodata registration
    router.push('/ortu/anak/register')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col px-6 pt-12 max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Data Orang Tua</h2>
      <p className="text-sm text-gray-500 mb-6">Masukkan data diri Anda untuk membuat akun</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {[
          { name: 'nama',   label: 'Nama Lengkap', type: 'text',     placeholder: 'Contoh: Ibu Sari Andini' },
          { name: 'no_hp',  label: 'Nomor HP',     type: 'tel',      placeholder: '08xxxxxxxxxx' },
          { name: 'email',  label: 'Alamat Email', type: 'email',    placeholder: 'nama@email.com' },
          { name: 'password', label: 'Password',  type: 'password', placeholder: 'Min. 8 karakter' },
        ].map(({ name, label, type, placeholder }) => (
          <div key={name} className="space-y-1.5">
            <Label htmlFor={name}>{label}</Label>
            <Input
              id={name}
              type={type}
              placeholder={placeholder}
              {...register(name as keyof RegisterOrangTuaInput)}
            />
            {errors[name as keyof RegisterOrangTuaInput] && (
              <p className="text-xs text-red-500">
                {errors[name as keyof RegisterOrangTuaInput]?.message}
              </p>
            )}
          </div>
        ))}

        {error && <p className="text-xs text-red-500 bg-red-50 p-2 rounded">{error}</p>}

        <Button
          type="submit"
          className="w-full bg-brand-primary text-white rounded-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Mendaftar...' : 'Daftar'}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-4">
        Sudah punya akun?{' '}
        <Link href="/login" className="text-brand-primary font-medium">Login</Link>
      </p>
    </div>
  )
}
```

**Child Biodata Registration (`src/app/(dashboard)/ortu/anak/register/page.tsx`)**

```tsx
import { registerAnak } from '@/app/actions/anak.actions'

export default function RegisterAnakPage() {
  return (
    <div className="px-4 py-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Biodata Anak</h2>
        <p className="text-sm text-gray-500">Lengkapi data kesehatan anak Anda</p>
      </div>

      <form action={registerAnak} className="space-y-4">
        {/* Photo Upload placeholder */}
        <div className="flex justify-center py-4">
          <div className="w-20 h-20 rounded-full bg-brand-light border-2 border-dashed
                          border-brand-primary flex items-center justify-center cursor-pointer">
            <span className="text-brand-primary text-xs text-center">Upload Foto</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="nama_anak" className="text-sm font-medium text-gray-700">Nama Anak</label>
          <input
            id="nama_anak" name="nama_anak" type="text"
            placeholder="Nama lengkap anak"
            className="w-full border border-gray-300 rounded-btn px-3 py-2 text-sm"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="nik" className="text-sm font-medium text-gray-700">NIK Anak (16 digit)</label>
          <input
            id="nik" name="nik" type="text" maxLength={16}
            placeholder="16 digit NIK"
            className="w-full border border-gray-300 rounded-btn px-3 py-2 text-sm"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="tgl_lahir" className="text-sm font-medium text-gray-700">Tanggal Lahir</label>
            <input
              id="tgl_lahir" name="tgl_lahir" type="date"
              className="w-full border border-gray-300 rounded-btn px-3 py-2 text-sm"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="jenis_kelamin" className="text-sm font-medium text-gray-700">Jenis Kelamin</label>
            <select
              id="jenis_kelamin" name="jenis_kelamin"
              className="w-full border border-gray-300 rounded-btn px-3 py-2 text-sm"
              required
            >
              <option value="">Pilih</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="tempat_lahir" className="text-sm font-medium text-gray-700">Tempat Lahir</label>
          <input
            id="tempat_lahir" name="tempat_lahir" type="text"
            placeholder="Kota/Kabupaten"
            className="w-full border border-gray-300 rounded-btn px-3 py-2 text-sm"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="rt" className="text-sm font-medium text-gray-700">RT</label>
            <input
              id="rt" name="rt" type="text" placeholder="001"
              className="w-full border border-gray-300 rounded-btn px-3 py-2 text-sm"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="rw" className="text-sm font-medium text-gray-700">RW</label>
            <input
              id="rw" name="rw" type="text" placeholder="004"
              className="w-full border border-gray-300 rounded-btn px-3 py-2 text-sm"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-teal-600 text-white rounded-btn py-3 font-medium text-sm mt-2"
        >
          Selesai
        </button>
      </form>
    </div>
  )
}
```

---

### FR-02: Schedule Reservation

**Schedule Selection Page (`src/app/(dashboard)/ortu/reservasi/page.tsx`)**

```tsx
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default async function ReservasiPage() {
  const supabase = createClient()

  const { data: jadwalList } = await supabase
    .from('jadwal')
    .select('*')
    .gte('tgl_pelaksanaan', new Date().toISOString().split('T')[0])
    .order('tgl_pelaksanaan', { ascending: true })
    .order('jam', { ascending: true })

  return (
    <div className="px-4 py-6 space-y-4">
      <h2 className="text-base font-semibold text-gray-900">Pilih Jadwal Imunisasi</h2>

      {jadwalList?.map((jadwal) => {
        const isFull = jadwal.kuota_terisi >= jadwal.kuota
        const sisaKuota = jadwal.kuota - jadwal.kuota_terisi

        return (
          <div
            key={jadwal.id}
            className={`bg-white rounded-card p-4 shadow-sm border
                        ${isFull ? 'border-gray-200 opacity-60' : 'border-gray-100'}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-sm text-gray-900">
                  {formatDate(jadwal.tgl_pelaksanaan)}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {jadwal.jam} · {jadwal.lokasi}
                </p>
                <p className={`text-xs mt-1.5 font-medium
                              ${isFull ? 'text-red-500' : 'text-green-600'}`}>
                  {isFull ? 'Kuota Penuh' : `${sisaKuota} slot tersisa`}
                </p>
              </div>

              {!isFull ? (
                <Link href={`/ortu/reservasi/confirm?jadwal=${jadwal.id}`}>
                  <button className="bg-brand-primary text-white text-xs font-medium
                                     px-4 py-2 rounded-btn hover:bg-brand-primary/90">
                    Pilih
                  </button>
                </Link>
              ) : (
                <button
                  disabled
                  className="bg-gray-200 text-gray-400 text-xs font-medium px-4 py-2 rounded-btn"
                >
                  Penuh
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

---

## 2. Kader Features

### FR-03: Queue Management + Anthropometry Input

**Kader Dashboard (`src/app/(dashboard)/kader/page.tsx`)**

```tsx
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default async function KaderDashboardPage() {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  // Get today's active reservations with child info
  const { data: antrean } = await supabase
    .from('reservasi')
    .select(`
      id,
      no_antrean,
      status,
      anak (
        id,
        nama_anak,
        rt,
        rw,
        foto_url
      ),
      jadwal (
        tgl_pelaksanaan,
        jam,
        lokasi
      )
    `)
    .eq('jadwal.tgl_pelaksanaan', today)
    .in('status', ['pending', 'reviewed'])
    .order('no_antrean', { ascending: true })

  const totalBalita = antrean?.length ?? 0

  return (
    <div className="px-4 py-6 space-y-4">
      {/* Announcement Banner */}
      <div className="bg-brand-primary rounded-card p-4 text-white">
        <p className="font-semibold text-base">Selamat Pagi!</p>
        <p className="text-sm opacity-90">Hari ini ada pelaksanaan Posyandu Bojong</p>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-card p-4 shadow-sm border border-gray-100">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[28px] font-bold text-gray-900">{totalBalita}</p>
            <p className="text-xs text-gray-500">Total Balita</p>
            <p className="text-xs text-green-600 font-medium">Hadir hari ini</p>
          </div>
          <div>
            <p className="text-[28px] font-bold text-gray-900">
              {antrean?.filter(a => a.status === 'pending').length ?? 0}
            </p>
            <p className="text-xs text-gray-500">Antrean Menunggu</p>
          </div>
        </div>
      </div>

      {/* Queue List */}
      <h3 className="text-sm font-semibold text-gray-700">Antrean Hari Ini</h3>
      <div className="space-y-2">
        {antrean?.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-card px-4 py-3 shadow-sm border border-gray-100
                       flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-brand-light rounded-full flex items-center justify-center
                            text-brand-primary font-bold text-sm flex-shrink-0">
              {item.no_antrean}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 truncate">
                {(item.anak as any)?.nama_anak ?? '-'}
              </p>
              <p className="text-xs text-gray-400">
                RT {(item.anak as any)?.rt} / RW {(item.anak as any)?.rw}
              </p>
            </div>

            <Link href={`/kader/pemeriksaan/${item.id}`}>
              <button className="bg-brand-primary text-white text-xs px-3 py-1.5 rounded-btn">
                Pilih
              </button>
            </Link>
          </div>
        ))}

        {(!antrean || antrean.length === 0) && (
          <div className="text-center py-8 text-gray-400 text-sm">
            Belum ada antrean untuk hari ini
          </div>
        )}
      </div>
    </div>
  )
}
```

**Anthropometry Input Form (`src/app/(dashboard)/kader/pemeriksaan/[reservasiId]/page.tsx`)**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SaveIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MeasurementField {
  name: string
  label: string
  unit: string
  min: number
  max: number
}

const FIELDS: MeasurementField[] = [
  { name: 'berat_badan',         label: 'Berat Badan',       unit: 'kg', min: 0.5, max: 50  },
  { name: 'tinggi_badan',        label: 'Tinggi Badan',      unit: 'cm', min: 30,  max: 150 },
  { name: 'lingkar_lengan_atas', label: 'Lingkar Lengan Atas', unit: 'cm', min: 5, max: 40  },
  { name: 'lingkar_kepala',      label: 'Lingkar Kepala',    unit: 'cm', min: 20,  max: 70  },
]

export default function PemeriksaanFormPage({ params }: { params: { reservasiId: string } }) {
  const router = useRouter()
  const [values, setValues] = useState<Record<string, string>>({
    berat_badan: '',
    tinggi_badan: '',
    lingkar_lengan_atas: '',
    lingkar_kepala: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    const response = await fetch('/api/pemeriksaan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_reservasi: params.reservasiId,
        berat_badan: parseFloat(values.berat_badan),
        tinggi_badan: parseFloat(values.tinggi_badan),
        lingkar_lengan_atas: values.lingkar_lengan_atas ? parseFloat(values.lingkar_lengan_atas) : undefined,
        lingkar_kepala: values.lingkar_kepala ? parseFloat(values.lingkar_kepala) : undefined,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      setError(result.error || 'Terjadi kesalahan. Coba lagi.')
      setIsSubmitting(false)
      return
    }

    router.push('/kader')
  }

  return (
    <div className="px-4 py-6 space-y-4">
      <h2 className="text-base font-semibold text-gray-900">Input Pemeriksaan</h2>

      {/* Procedure info box */}
      <div className="bg-brand-light rounded-btn p-3 flex gap-2">
        <span className="text-brand-primary text-sm font-bold">i</span>
        <p className="text-xs text-brand-primary leading-relaxed">
          Pastikan timbangan tidak diaktifkan dan anak telah ditimbang saat pengukuran.
        </p>
      </div>

      {/* Input fields */}
      <div className="space-y-3">
        {FIELDS.map(({ name, label, unit, min, max }) => (
          <div key={name}>
            <label className="text-xs text-gray-500 block mb-1">{label}</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                min={min}
                max={max}
                value={values[name]}
                onChange={(e) => setValues(prev => ({ ...prev, [name]: e.target.value }))}
                placeholder="0.0"
                className="flex-1 bg-gray-100 border-0 rounded-btn px-3 py-2.5
                           text-base font-bold text-gray-900 focus:outline-none
                           focus:ring-2 focus:ring-brand-primary"
              />
              <span className="text-sm text-gray-500 font-medium w-8">{unit}</span>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 p-3 rounded-btn">{error}</p>
      )}

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || !values.berat_badan || !values.tinggi_badan}
        className="w-full bg-brand-primary text-white rounded-btn py-3 text-sm font-medium h-auto"
      >
        <SaveIcon className="w-4 h-4 mr-2" />
        {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
      </Button>
    </div>
  )
}
```

---

## 3. Bidan Desa Features

### FR-05: Medical Advice & Validation

**Bidan Dashboard (`src/app/(dashboard)/bidan/page.tsx`)**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AlertFilterChip } from '@/components/bidan/AlertFilterChip'
import { PatientRiskCard } from '@/components/bidan/PatientRiskCard'
import { CardSkeleton } from '@/components/shared/CardSkeleton'

export default function BidanDashboardPage() {
  const supabase = createClient()
  const [filter, setFilter] = useState('semua')
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPatients() {
      setLoading(true)

      let query = supabase
        .from('pemeriksaan')
        .select(`
          id,
          status_gizi,
          berat_badan,
          lingkar_lengan_atas,
          is_validated,
          anak (
            id,
            nama_anak,
            tgl_lahir,
            jenis_kelamin
          )
        `)
        .is('is_validated', false)
        .order('created_at', { ascending: false })

      if (filter !== 'semua') {
        query = query.eq('status_gizi', filter)
      }

      const { data } = await query
      setPatients(data ?? [])
      setLoading(false)
    }

    fetchPatients()
  }, [filter])

  return (
    <div className="px-4 py-6 space-y-4">
      <AlertFilterChip activeFilter={filter} onChange={setFilter} />

      <div className="space-y-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
          : patients.map((item) => (
              <PatientRiskCard
                key={item.id}
                id={(item.anak as any)?.id}
                namaAnak={(item.anak as any)?.nama_anak ?? '-'}
                tglLahir={(item.anak as any)?.tgl_lahir}
                jenisKelamin={(item.anak as any)?.jenis_kelamin}
                statusGizi={item.status_gizi ?? 'Belum Diperiksa'}
                beratBadan={item.berat_badan}
                lila={item.lingkar_lengan_atas}
                butuhRujukan={['Gizi Buruk', 'Stunting'].includes(item.status_gizi)}
              />
            ))}

        {!loading && patients.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            Tidak ada data pasien yang perlu ditindaklanjuti
          </div>
        )}
      </div>
    </div>
  )
}
```

**Medical Advice Form (`src/app/(dashboard)/bidan/anak/[id]/page.tsx`)**

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircleIcon } from 'lucide-react'
import { GrowthChart } from '@/components/ortu/GrowthChart'
import { HealthStatsCard } from '@/components/ortu/HealthStatsCard'
import { Button } from '@/components/ui/button'
import { getAgeString } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

export default function BidanAnakDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const [anak, setAnak] = useState<any>(null)
  const [pemeriksaan, setPemeriksaan] = useState<any>(null)
  const [saranMedis, setSaranMedis] = useState('')
  const [bantuanMedis, setBantuanMedis] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetch() {
      const { data: anakData } = await supabase
        .from('anak')
        .select('*')
        .eq('id', params.id)
        .single()

      const { data: pemData } = await supabase
        .from('pemeriksaan')
        .select('*')
        .eq('id_anak', params.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      setAnak(anakData)
      setPemeriksaan(pemData)
    }
    fetch()
  }, [params.id])

  const handleValidate = async () => {
    if (!pemeriksaan?.id || !saranMedis.trim()) return
    setIsSubmitting(true)
    setError(null)

    const response = await fetch('/api/pemeriksaan', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_pemeriksaan: pemeriksaan.id,
        saran_medis: saranMedis,
        pemberian_bantuan_medis: bantuanMedis || undefined,
      }),
    })

    if (!response.ok) {
      const result = await response.json()
      setError(result.error || 'Gagal menyimpan. Coba lagi.')
      setIsSubmitting(false)
      return
    }

    router.push('/bidan')
  }

  if (!anak) return <div className="px-4 py-6 text-sm text-gray-400">Loading...</div>

  return (
    <div className="px-4 py-6 space-y-4">
      {/* Child header */}
      <div className="bg-white rounded-card p-4 shadow-sm border border-gray-100 flex items-center gap-3">
        <div className="w-13 h-13 rounded-full bg-brand-light flex items-center justify-center
                        text-brand-primary font-bold text-lg">
          {anak.nama_anak.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{anak.nama_anak}</p>
          <p className="text-xs text-gray-400">
            {getAgeString(anak.tgl_lahir)} ·{' '}
            {anak.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
          </p>
        </div>
      </div>

      {/* Latest anthropometry */}
      {pemeriksaan && (
        <HealthStatsCard
          beratBadan={pemeriksaan.berat_badan}
          tinggiBadan={pemeriksaan.tinggi_badan}
          lila={pemeriksaan.lingkar_lengan_atas}
          lingkarKepala={pemeriksaan.lingkar_kepala}
        />
      )}

      {/* Medical advice input */}
      <div className="bg-white rounded-card p-4 shadow-sm border border-gray-100 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">Pemberian Bantuan</span>
          <span className="text-xs text-gray-400">Obat/Vitamin/Vaksin</span>
        </div>
        <textarea
          value={bantuanMedis}
          onChange={(e) => setBantuanMedis(e.target.value)}
          placeholder="Contoh: Vitamin A 200.000 IU, Imunisasi MR..."
          rows={2}
          className="w-full border border-gray-200 rounded-btn px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
        />

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">Saran Medis</span>
          <span className="text-red-400 text-xs">*wajib diisi</span>
        </div>
        <textarea
          value={saranMedis}
          onChange={(e) => setSaranMedis(e.target.value)}
          placeholder="Masukkan saran kesehatan, pola konsumsi terbaik, atau jadwal imunisasi untuk..."
          rows={3}
          className="w-full border border-gray-200 rounded-btn px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
        />
      </div>

      {error && <p className="text-xs text-red-500 bg-red-50 p-3 rounded-btn">{error}</p>}

      <Button
        onClick={handleValidate}
        disabled={isSubmitting || !saranMedis.trim()}
        className="w-full bg-brand-teal hover:bg-brand-teal/90 text-white rounded-btn py-3 text-sm font-medium h-auto"
      >
        <CheckCircleIcon className="w-4 h-4 mr-2" />
        {isSubmitting ? 'Menyimpan...' : 'Validasi & Kirim'}
      </Button>
    </div>
  )
}
```

---

## 4. Shared: Child Health Detail (Orang Tua)

**`src/app/(dashboard)/ortu/anak/[id]/page.tsx`**

```tsx
import { createClient } from '@/lib/supabase/server'
import { HealthStatsCard } from '@/components/ortu/HealthStatsCard'
import { GrowthChart } from '@/components/ortu/GrowthChart'
import { getStatusColor, formatDate } from '@/lib/utils'
import { notFound } from 'next/navigation'

export default async function AnakDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: anak } = await supabase
    .from('anak')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!anak) notFound()

  const { data: pemeriksaanList } = await supabase
    .from('pemeriksaan')
    .select('*')
    .eq('id_anak', params.id)
    .order('tgl_pemeriksaan', { ascending: true })

  const latest = pemeriksaanList?.[pemeriksaanList.length - 1]

  // Build growth chart data
  const chartData = pemeriksaanList?.map((p, idx) => ({
    usia: idx + 1,
    beratAnak: p.berat_badan ?? 0,
    normal: 9.6,      // TODO: replace with WHO reference lookup
    trenNaik: 11.5,
  })) ?? []

  return (
    <div className="px-4 py-6 space-y-4">
      <HealthStatsCard
        beratBadan={latest?.berat_badan}
        tinggiBadan={latest?.tinggi_badan}
        lila={latest?.lingkar_lengan_atas}
        lingkarKepala={latest?.lingkar_kepala}
      />

      {chartData.length > 0 && <GrowthChart data={chartData} />}

      {/* Examination history */}
      <div className="bg-white rounded-card p-4 shadow-sm border border-gray-100">
        <p className="text-sm font-semibold text-gray-700 mb-3">Riwayat Pemeriksaan</p>
        <div className="space-y-3">
          {pemeriksaanList?.map((p) => (
            <div key={p.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
              <div className="w-8 h-8 bg-brand-light rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs">📋</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-700">{formatDate(p.tgl_pemeriksaan)}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {p.berat_badan}kg · {p.tinggi_badan}cm
                  {p.lingkar_lengan_atas && ` · LILA ${p.lingkar_lengan_atas}cm`}
                </p>
                {p.status_gizi && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block
                                   ${getStatusColor(p.status_gizi)}`}>
                    {p.status_gizi}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Medical advice */}
      {latest?.saran_medis && (
        <div className="bg-white rounded-card p-4 shadow-sm border-l-4 border-l-brand-primary border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">🩺</span>
            <p className="text-xs font-semibold text-gray-700">Saran Medis</p>
            <p className="text-xs text-gray-400 ml-auto">
              {latest.validated_at ? formatDate(latest.validated_at) : ''}
            </p>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">{latest.saran_medis}</p>
        </div>
      )}
    </div>
  )
}
```

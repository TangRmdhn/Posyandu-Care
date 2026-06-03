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
    router.refresh()
  }

  const fields = [
    { key: 'nama',     label: 'Nama Lengkap', type: 'text',     placeholder: 'Contoh: Ibu Sari' },
    { key: 'no_hp',    label: 'Nomor HP',     type: 'tel',      placeholder: '08xxxxxxxxxx' },
    { key: 'email',    label: 'Alamat Email', type: 'email',    placeholder: 'nama@email.com' },
    { key: 'password', label: 'Password',     type: 'password', placeholder: 'Min. 8 karakter' },
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 pt-10 max-w-md mx-auto">
      <button onClick={() => router.back()} className="mb-4 text-brand-blue text-sm flex items-center gap-1">
        ← Kembali
      </button>

      <h2 className="text-lg font-semibold text-gray-900 mb-1">Data Orang Tua</h2>
      <p className="text-xs text-gray-400 mb-6">
        Masukkan data yang benar untuk membuat akun yang mudah diakses.
      </p>

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

      <button
        onClick={handleRegister}
        disabled={loading}
        className="w-full bg-brand-blue text-white rounded-btn py-3 text-sm font-medium
                   mt-6 disabled:opacity-60"
      >
        {loading ? 'Mendaftar...' : 'Daftar'}
      </button>

      <p className="text-center text-sm text-gray-500 mt-3">
        Sudah punya akun?{' '}
        <a href="/login" className="text-brand-blue font-medium">Masuk di sini</a>
      </p>
    </div>
  )
}

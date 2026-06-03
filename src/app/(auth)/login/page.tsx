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
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 max-w-md mx-auto">
      <div className="mb-8 flex flex-col items-center">
        <div className="w-16 h-16 bg-brand-blue rounded-2xl flex items-center justify-center mb-3">
          <svg viewBox="0 0 40 40" className="w-10 h-10 fill-white">
            <rect x="6" y="6" width="28" height="28" rx="4" fill="none" stroke="white" strokeWidth="2.5"/>
            <path d="M20 12v16M12 20h16" stroke="white" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 className="text-lg font-semibold text-gray-800">Posyandu Care</h1>
        <p className="text-xs text-gray-400 mt-1 text-center">
          Pantau tumbuh kembang si kecil dengan mudah dan terpercaya.
        </p>
      </div>

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
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full border border-gray-300 rounded-btn px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div className="text-right">
          <a href="/forgot-password" className="text-xs text-brand-blue">LUPA PASSWORD?</a>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-brand-blue text-white rounded-btn py-3 text-sm font-medium
                     flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ height: '48px' }}
        >
          {loading ? 'Loading...' : 'Masuk →'}
        </button>

        <p className="text-center text-sm text-gray-500">
          Belum punya akun?{' '}
          <a href="/register" className="text-brand-blue font-medium">Daftar Akun Baru →</a>
        </p>
      </div>
    </div>
  )
}

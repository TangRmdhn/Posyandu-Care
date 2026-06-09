'use client'

import { BellIcon, LogOutIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LargeTextToggle } from './LargeTextToggle'

interface AppHeaderProps {
  title?: string
  wide?: boolean
}

export function AppHeader({ title = 'Posyandu Care', wide = false }: AppHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 mx-auto ${wide ? 'max-w-md lg:max-w-3xl' : 'max-w-md'}
                 flex items-center justify-between bg-white px-4 border-b border-gray-100`}
      style={{ height: '48px' }}
    >
      <span className="font-semibold text-base text-brand-teal">{title}</span>
      <div className="flex items-center gap-1">
        <LargeTextToggle />
        <Link href="/ortu/notifikasi" aria-label="Notifikasi" className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
          <BellIcon className="w-5 h-5 text-gray-400" aria-hidden />
        </Link>
        <button
          onClick={handleLogout}
          aria-label="Keluar"
          title="Keluar"
          className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        >
          <LogOutIcon className="w-5 h-5 text-red-400" aria-hidden />
        </button>
      </div>
    </header>
  )
}

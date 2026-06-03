'use client'

import { BellIcon, LogOutIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface AppHeaderProps {
  title?: string
}

export function AppHeader({ title = 'Posyandu Care' }: AppHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 max-w-md mx-auto
                 flex items-center justify-between bg-white px-4 border-b border-gray-100"
      style={{ height: '48px' }}
    >
      <span className="font-semibold text-base text-brand-teal">{title}</span>
      <div className="flex items-center gap-1">
        <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
          <BellIcon className="w-5 h-5 text-gray-400" />
        </button>
        <button
          onClick={handleLogout}
          title="Keluar"
          className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        >
          <LogOutIcon className="w-5 h-5 text-red-400" />
        </button>
      </div>
    </header>
  )
}

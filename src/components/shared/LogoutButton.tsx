'use client'

import { useRouter } from 'next/navigation'
import { LogOutIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full bg-white border border-gray-200 text-red-500 rounded-btn py-3 text-sm
                 font-medium flex items-center justify-center gap-2"
    >
      <LogOutIcon className="w-4 h-4" />
      Keluar
    </button>
  )
}

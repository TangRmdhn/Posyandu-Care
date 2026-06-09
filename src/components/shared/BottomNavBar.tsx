'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HomeIcon, CalendarIcon, BookOpenIcon, ActivityIcon, UserIcon, UsersIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const ORTU_NAV: NavItem[] = [
  { href: '/ortu',           label: 'Beranda',  icon: HomeIcon },
  { href: '/ortu/reservasi', label: 'Jadwal',   icon: CalendarIcon },
  { href: '/ortu/edukasi',   label: 'Edukasi',  icon: BookOpenIcon },
]

const KADER_NAV: NavItem[] = [
  { href: '/kader',         label: 'Beranda',   icon: HomeIcon },
  { href: '/kader/antrean', label: 'Aktivitas', icon: ActivityIcon },
  { href: '/kader/profil',  label: 'Profil',    icon: UserIcon },
]

const BIDAN_NAV: NavItem[] = [
  { href: '/bidan',         label: 'Beranda',   icon: HomeIcon },
  { href: '/bidan/laporan', label: 'Aktivitas', icon: ActivityIcon },
  { href: '/bidan/profil',  label: 'Profil',    icon: UserIcon },
]

const ADMIN_NAV: NavItem[] = [
  { href: '/admin',          label: 'Beranda',  icon: HomeIcon },
  { href: '/admin/jadwal',   label: 'Jadwal',   icon: CalendarIcon },
  { href: '/admin/pengguna', label: 'Pengguna', icon: UsersIcon },
]

const ROLE_NAV: Record<string, NavItem[]> = {
  ortu:  ORTU_NAV,
  kader: KADER_NAV,
  bidan: BIDAN_NAV,
  admin: ADMIN_NAV,
}

export function BottomNavBar({ role }: { role: 'ortu' | 'kader' | 'bidan' | 'admin' }) {
  const pathname = usePathname()
  const items = ROLE_NAV[role] ?? ORTU_NAV
  const wide = role === 'admin' || role === 'bidan'

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 mx-auto ${wide ? 'max-w-md lg:max-w-3xl' : 'max-w-md'}
                    bg-white border-t border-gray-200 flex items-center justify-around h-16`}>
      {items.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-0.5 py-2 px-5"
          >
            <Icon
              className={cn('w-5 h-5', isActive ? 'text-brand-teal' : 'text-gray-400')}
            />
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

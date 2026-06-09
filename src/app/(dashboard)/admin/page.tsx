import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserWithRole } from '@/lib/auth/role'
import { CalendarIcon, UsersIcon, BabyIcon, ClipboardListIcon } from 'lucide-react'

export default async function AdminDashboardPage() {
  const { role } = await getCurrentUserWithRole()
  if (role !== 'admin') redirect('/login')

  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const [jadwal, kader, bidan, anak, pending] = await Promise.all([
    supabase.from('jadwal').select('id', { count: 'exact', head: true }).gte('tgl_pelaksanaan', today),
    supabase.from('kader').select('id', { count: 'exact', head: true }),
    supabase.from('bidan_desa').select('id', { count: 'exact', head: true }),
    supabase.from('anak').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('reservasi').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const stats = [
    { label: 'Jadwal Mendatang', value: jadwal.count ?? 0, icon: CalendarIcon, href: '/admin/jadwal' },
    { label: 'Reservasi Pending', value: pending.count ?? 0, icon: ClipboardListIcon, href: '/admin/jadwal' },
    { label: 'Kader & Bidan', value: (kader.count ?? 0) + (bidan.count ?? 0), icon: UsersIcon, href: '/admin/pengguna' },
    { label: 'Anak Terdaftar', value: anak.count ?? 0, icon: BabyIcon, href: '/admin' },
  ]

  return (
    <div className="px-4 py-6 space-y-5">
      <div>
        <h2 className="text-base font-semibold text-gray-900">Panel Admin</h2>
        <p className="text-xs text-gray-400">Kelola jadwal Posyandu dan pengguna</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-card border border-gray-100 shadow-sm p-4 flex flex-col gap-2"
          >
            <Icon className="w-5 h-5 text-brand-teal" aria-hidden />
            <span className="text-2xl font-semibold text-gray-900">{value}</span>
            <span className="text-[11px] text-gray-500">{label}</span>
          </Link>
        ))}
      </div>

      <div className="space-y-2">
        <Link href="/admin/jadwal" className="block bg-brand-teal text-white rounded-btn py-3 text-sm font-medium text-center">
          Kelola Jadwal
        </Link>
        <Link href="/admin/pengguna" className="block bg-white border border-gray-200 text-gray-700 rounded-btn py-3 text-sm font-medium text-center">
          Kelola Pengguna
        </Link>
        <Link href="/admin/edukasi" className="block bg-white border border-gray-200 text-gray-700 rounded-btn py-3 text-sm font-medium text-center">
          Kelola Edukasi
        </Link>
      </div>
    </div>
  )
}

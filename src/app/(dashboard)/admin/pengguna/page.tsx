import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserWithRole } from '@/lib/auth/role'
import { AssignRoleForm } from '@/components/admin/AssignRoleForm'

export default async function AdminPenggunaPage() {
  const { role } = await getCurrentUserWithRole()
  if (role !== 'admin') redirect('/login')

  const supabase = createClient()
  const [{ data: kader }, { data: bidan }] = await Promise.all([
    supabase.from('kader').select('id, nama_kader, email').order('nama_kader'),
    supabase.from('bidan_desa').select('id, nama_bidan, email').order('nama_bidan'),
  ])

  return (
    <div className="px-4 py-6 space-y-4">
      <h2 className="text-base font-semibold text-gray-900">Kelola Pengguna</h2>

      <AssignRoleForm />

      <section className="space-y-2">
        <h3 className="text-[13px] font-semibold text-gray-700">Bidan</h3>
        {(bidan ?? []).map((b) => (
          <div key={b.id} className="bg-white rounded-card border border-gray-100 shadow-sm p-3">
            <p className="text-sm text-gray-800">{b.nama_bidan}</p>
            <p className="text-xs text-gray-500">{b.email}</p>
          </div>
        ))}
        {(!bidan || bidan.length === 0) && <p className="text-xs text-gray-400">Belum ada bidan.</p>}
      </section>

      <section className="space-y-2">
        <h3 className="text-[13px] font-semibold text-gray-700">Kader</h3>
        {(kader ?? []).map((k) => (
          <div key={k.id} className="bg-white rounded-card border border-gray-100 shadow-sm p-3">
            <p className="text-sm text-gray-800">{k.nama_kader}</p>
            <p className="text-xs text-gray-500">{k.email}</p>
          </div>
        ))}
        {(!kader || kader.length === 0) && <p className="text-xs text-gray-400">Belum ada kader.</p>}
      </section>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { getAgeString } from '@/lib/utils'
import { DashboardCard } from '@/components/ortu/DashboardCard'
import Link from 'next/link'

export default async function OrtuDashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('nama')
    .eq('id', user!.id)
    .single()

  const { data: anakList } = await supabase
    .from('anak')
    .select('*')
    .eq('id_ortu', user!.id)
    .order('created_at', { ascending: false })

  if (!anakList || anakList.length === 0) {
    return (
      <div className="px-4 py-8 text-center space-y-4">
        <p className="text-sm text-gray-500">Belum ada data anak terdaftar.</p>
        <Link href="/ortu/anak/register">
          <button className="bg-brand-teal text-white rounded-btn px-5 py-2.5 text-sm font-medium">
            + Daftarkan Anak
          </button>
        </Link>
      </div>
    )
  }

  return (
    <div className="px-4 pt-4 space-y-3">
      <div>
        <p className="text-xs text-gray-500">SELAMAT PAGI,</p>
        <p className="text-lg font-bold text-gray-900">Halo, {profile?.nama ?? 'Orang Tua'}</p>
      </div>

      <div className="space-y-2">
        {anakList.map((anak) => (
          <DashboardCard
            key={anak.id}
            namaAnak={anak.nama_anak}
            usiaLabel={getAgeString(anak.tgl_lahir)}
            usiaSubLabel=""
            fotoUrl={anak.foto_url}
            anakId={anak.id}
          />
        ))}
      </div>

      <Link href="/ortu/anak/register">
        <button
          className="w-full border border-brand-teal text-brand-teal rounded-btn text-[14px]
                     font-medium flex items-center justify-center gap-2 py-3"
        >
          + Tambah Anak
        </button>
      </Link>

      <Link href="/ortu/reservasi">
        <button
          className="w-full bg-brand-teal text-white rounded-btn text-[14px] font-medium
                     flex items-center justify-center gap-2 py-3"
        >
          <span className="text-lg leading-none">⊕</span>
          Buat Reservasi
        </button>
      </Link>
    </div>
  )
}

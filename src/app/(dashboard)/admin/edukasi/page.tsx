import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserWithRole } from '@/lib/auth/role'
import { CreateArtikelForm } from '@/components/admin/CreateArtikelForm'
import { toggleArtikelPublish, deleteArtikel } from '@/app/actions/artikel.actions'

export default async function AdminEdukasiPage() {
  const { role } = await getCurrentUserWithRole()
  if (role !== 'admin') redirect('/login')

  const supabase = createClient()
  const { data: list } = await supabase
    .from('artikel')
    .select('id, judul, kategori, published')
    .order('created_at', { ascending: false })

  return (
    <div className="px-4 py-6 space-y-4">
      <h2 className="text-base font-semibold text-gray-900">Kelola Edukasi</h2>

      <CreateArtikelForm />

      <div className="space-y-2">
        {(list ?? []).map((a) => (
          <div key={a.id} className="bg-white rounded-card border border-gray-100 shadow-sm p-3 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm text-gray-800 truncate">{a.judul}</p>
              <p className="text-[10px] text-gray-400">{a.kategori ?? 'Tanpa kategori'} · {a.published ? 'Terbit' : 'Draf'}</p>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <form action={toggleArtikelPublish}>
                <input type="hidden" name="id" value={a.id} />
                <input type="hidden" name="published" value={(!a.published).toString()} />
                <button type="submit" className="text-[11px] px-2.5 py-1 rounded-md border border-gray-200 text-gray-600">
                  {a.published ? 'Sembunyikan' : 'Terbitkan'}
                </button>
              </form>
              <form action={deleteArtikel}>
                <input type="hidden" name="id" value={a.id} />
                <button type="submit" className="text-[11px] px-2.5 py-1 rounded-md border border-red-200 text-red-600">Hapus</button>
              </form>
            </div>
          </div>
        ))}
        {(!list || list.length === 0) && <p className="text-center text-sm text-gray-400 py-8">Belum ada artikel.</p>}
      </div>
    </div>
  )
}

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function EdukasiPage() {
  const supabase = createClient()
  const { data: artikel } = await supabase
    .from('artikel')
    .select('id, judul, slug, ringkasan, kategori')
    .eq('published', true)
    .order('created_at', { ascending: false })

  return (
    <div className="px-4 py-6 space-y-3">
      <h2 className="text-base font-semibold text-gray-900">Edukasi Kesehatan</h2>
      {(artikel ?? []).map((a) => (
        <Link key={a.id} href={`/ortu/edukasi/${a.slug}`}
          className="block bg-white rounded-card p-4 shadow-sm border border-gray-100">
          {a.kategori && <span className="text-[10px] text-brand-teal font-medium">{a.kategori}</span>}
          <p className="text-sm font-semibold text-gray-900">{a.judul}</p>
          {a.ringkasan && <p className="text-xs text-gray-500 mt-1">{a.ringkasan}</p>}
        </Link>
      ))}
      {(!artikel || artikel.length === 0) && (
        <p className="text-center text-sm text-gray-400 py-8">Belum ada artikel edukasi.</p>
      )}
    </div>
  )
}

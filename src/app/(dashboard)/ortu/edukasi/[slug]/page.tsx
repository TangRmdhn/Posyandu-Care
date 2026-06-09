import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils'

export default async function ArtikelDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { data: artikel } = await supabase
    .from('artikel')
    .select('judul, ringkasan, konten, kategori, published, created_at')
    .eq('slug', params.slug)
    .single()

  if (!artikel || !artikel.published) notFound()

  return (
    <article className="px-4 py-6 space-y-3">
      <a href="/ortu/edukasi" className="text-brand-blue text-sm">← Kembali</a>
      {artikel.kategori && <p className="text-[11px] text-brand-teal font-medium">{artikel.kategori}</p>}
      <h1 className="text-lg font-semibold text-gray-900">{artikel.judul}</h1>
      {artikel.created_at && <p className="text-[10px] text-gray-400">{formatDate(artikel.created_at)}</p>}
      {artikel.ringkasan && <p className="text-sm text-gray-600 italic">{artikel.ringkasan}</p>}
      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{artikel.konten}</div>
    </article>
  )
}

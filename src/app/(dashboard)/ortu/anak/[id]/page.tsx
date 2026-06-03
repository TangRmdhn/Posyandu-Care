import { createClient } from '@/lib/supabase/server'
import { HealthStatsCard } from '@/components/ortu/HealthStatsCard'
import { GrowthChart } from '@/components/ortu/GrowthChart'
import { getStatusColor, formatDate } from '@/lib/utils'
import { notFound } from 'next/navigation'

export default async function AnakDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: anak } = await supabase
    .from('anak')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!anak) notFound()

  const { data: pemeriksaanList } = await supabase
    .from('pemeriksaan')
    .select('*')
    .eq('id_anak', params.id)
    .order('tgl_pemeriksaan', { ascending: true })

  const latest = pemeriksaanList?.[pemeriksaanList.length - 1]

  const chartData = pemeriksaanList?.map((p, idx) => ({
    usia: idx + 1,
    beratAnak: p.berat_badan ?? 0,
    normal: 9.6,
    trenNaik: 11.5,
  })) ?? []

  return (
    <div className="px-4 py-6 space-y-4">
      <div className="flex items-center gap-3">
        <a href="/ortu" className="text-brand-blue">←</a>
        <h2 className="text-base font-semibold text-gray-900">{anak.nama_anak}</h2>
      </div>

      <HealthStatsCard
        beratBadan={latest?.berat_badan}
        tinggiBadan={latest?.tinggi_badan}
        lila={latest?.lingkar_lengan_atas}
        lingkarKepala={latest?.lingkar_kepala}
      />

      {chartData.length > 0 && <GrowthChart data={chartData} />}

      <div className="bg-white rounded-card p-4 shadow-sm border border-gray-100 mx-0">
        <p className="text-sm font-semibold text-gray-700 mb-3">Riwayat Pemeriksaan</p>
        <div className="space-y-3">
          {pemeriksaanList?.map((p) => (
            <div key={p.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
              <div className="w-8 h-8 bg-brand-light rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs">📋</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-700">{formatDate(p.tgl_pemeriksaan)}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {p.berat_badan}kg · {p.tinggi_badan}cm
                  {p.lingkar_lengan_atas && ` · LILA ${p.lingkar_lengan_atas}cm`}
                </p>
                {p.status_gizi && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block ${getStatusColor(p.status_gizi)}`}>
                    {p.status_gizi}
                  </span>
                )}
              </div>
            </div>
          ))}
          {(!pemeriksaanList || pemeriksaanList.length === 0) && (
            <p className="text-xs text-gray-400 text-center py-4">Belum ada pemeriksaan.</p>
          )}
        </div>
      </div>

      {latest?.saran_medis && (
        <div className="bg-white rounded-card p-4 shadow-sm border-l-4 border-l-brand-blue border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">🩺</span>
            <p className="text-xs font-semibold text-gray-700">Saran Medis</p>
            <p className="text-xs text-gray-400 ml-auto">
              {latest.validated_at ? formatDate(latest.validated_at) : ''}
            </p>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">{latest.saran_medis}</p>
        </div>
      )}
    </div>
  )
}

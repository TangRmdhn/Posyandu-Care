'use client'

import { useMemo, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { assessGrowth, getAgeInMonths, type StatusTone } from '@/lib/who'
import { ageBands, lengthBands, type Band } from '@/lib/who/curves'

export interface GrowthMeasurement {
  tgl_pemeriksaan: string
  berat_badan: number | null
  tinggi_badan: number | null
}

type Indicator = 'bb_u' | 'tb_u' | 'bb_tb'

const INDICATORS: { code: Indicator; label: string; unit: string; xLabel: string }[] = [
  { code: 'bb_u', label: 'BB/U', unit: 'kg', xLabel: 'Usia (bulan)' },
  { code: 'tb_u', label: 'TB/U', unit: 'cm', xLabel: 'Usia (bulan)' },
  { code: 'bb_tb', label: 'BB/TB', unit: 'kg', xLabel: 'Tinggi (cm)' },
]

const TONE_CLASS: Record<StatusTone, string> = {
  good: 'bg-green-100 text-green-700',
  warn: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
}

export function GrowthChart({
  sex,
  tglLahir,
  measurements,
}: {
  sex: 'L' | 'P'
  tglLahir: string
  measurements: GrowthMeasurement[]
}) {
  const [indicator, setIndicator] = useState<Indicator>('bb_u')

  const { bands, childPoints, latest } = useMemo(() => {
    const pts = measurements
      .map((m) => {
        const ageM = getAgeInMonths(tglLahir, new Date(m.tgl_pemeriksaan))
        if (indicator === 'bb_u') return m.berat_badan == null ? null : { x: ageM, y: m.berat_badan }
        if (indicator === 'tb_u') return m.tinggi_badan == null ? null : { x: ageM, y: m.tinggi_badan }
        return m.berat_badan == null || m.tinggi_badan == null ? null : { x: m.tinggi_badan, y: m.berat_badan }
      })
      .filter((p): p is { x: number; y: number } => p !== null)
      .sort((a, b) => a.x - b.x)

    let band: Band[] = []
    if (pts.length) {
      const xs = pts.map((p) => p.x)
      const minX = Math.min(...xs)
      const maxX = Math.max(...xs)
      if (indicator === 'bb_tb') {
        const lastDate = new Date(measurements[measurements.length - 1].tgl_pemeriksaan)
        band = lengthBands(sex, getAgeInMonths(tglLahir, lastDate) >= 24, minX - 2, maxX + 2)
      } else {
        band = ageBands(indicator, sex, Math.max(0, minX - 1), maxX + 1)
      }
    }

    const lastM = [...measurements].reverse().find((m) => m.berat_badan != null)
    const latestAssess = lastM
      ? assessGrowth({
          berat_badan: lastM.berat_badan as number,
          tinggi_badan: lastM.tinggi_badan,
          jenis_kelamin: sex,
          tgl_lahir: tglLahir,
          at: new Date(lastM.tgl_pemeriksaan),
        })
      : null

    return { bands: band, childPoints: pts, latest: latestAssess }
  }, [indicator, measurements, sex, tglLahir])

  const meta = INDICATORS.find((i) => i.code === indicator)!
  const latestZ = latest ? latest[indicator].z : null
  const latestStatus = latest ? latest[indicator].status : null

  return (
    <div className="bg-white rounded-card shadow-sm border border-gray-100 p-4 mx-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-semibold text-gray-700">Kurva Pertumbuhan (Standar WHO)</p>
        <div className="flex gap-1" role="group" aria-label="Pilih indikator pertumbuhan">
          {INDICATORS.map((i) => (
            <button
              key={i.code}
              type="button"
              onClick={() => setIndicator(i.code)}
              aria-pressed={indicator === i.code}
              className={`text-[11px] px-2 py-1 rounded-md border ${
                indicator === i.code
                  ? 'bg-brand-blue text-white border-brand-blue'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              {i.label}
            </button>
          ))}
        </div>
      </div>

      {latestStatus && (
        <p className="text-[11px] text-gray-600 mb-2">
          Terbaru:{' '}
          <span className={`px-2 py-0.5 rounded-full font-medium ${TONE_CLASS[latestStatus.tone]}`}>
            {latestStatus.label}
          </span>{' '}
          {latestZ !== null && <span className="text-gray-500">(Z = {latestZ})</span>}
        </p>
      )}

      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          margin={{ top: 4, right: 8, left: -20, bottom: 16 }}
          aria-label={`Kurva pertumbuhan ${meta.label}. Titik anak diplot terhadap pita standar WHO −3 sampai +3 simpang baku.`}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            type="number"
            dataKey="x"
            domain={['dataMin', 'dataMax']}
            tick={{ fontSize: 10, fill: '#6B7280' }}
            label={{ value: meta.xLabel, position: 'insideBottom', offset: -8, fontSize: 10, fill: '#6B7280' }}
            allowDuplicatedCategory={false}
          />
          <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} width={36} />
          <Tooltip
            contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
            labelFormatter={(v) => `${meta.xLabel}: ${v}`}
            formatter={(val, name) => [`${val} ${meta.unit}`, name as string]}
          />
          <Legend verticalAlign="top" iconType="line" wrapperStyle={{ fontSize: '10px' }} />
          <Line data={bands} dataKey="n3" name="−3 SD" stroke="#DC2626" strokeWidth={1} strokeDasharray="4 4" dot={false} />
          <Line data={bands} dataKey="n2" name="−2 SD" stroke="#F59E0B" strokeWidth={1} strokeDasharray="4 4" dot={false} />
          <Line data={bands} dataKey="m" name="Median" stroke="#4CAF50" strokeWidth={1.5} dot={false} />
          <Line data={bands} dataKey="p2" name="+2 SD" stroke="#F59E0B" strokeWidth={1} strokeDasharray="4 4" dot={false} />
          <Line data={bands} dataKey="p3" name="+3 SD" stroke="#DC2626" strokeWidth={1} strokeDasharray="4 4" dot={false} />
          <Line
            data={childPoints}
            dataKey="y"
            name="Anak"
            stroke="#1A73C1"
            strokeWidth={2}
            dot={{ r: 3, fill: '#1A73C1' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <p className="text-[10px] text-gray-400 mt-1">
        Pita hijau = median; kuning = ±2 SD (batas normal); merah = ±3 SD. Sumber: WHO Child Growth Standards 2006.
      </p>
    </div>
  )
}

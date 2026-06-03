'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

interface GrowthDataPoint {
  usia: number
  beratAnak: number
  normal: number
  trenNaik: number
}

export function GrowthChart({ data }: { data: GrowthDataPoint[] }) {
  return (
    <div className="bg-white rounded-card shadow-sm border border-gray-100 p-4 mx-4">
      <p className="text-[13px] font-semibold text-gray-700 mb-3">Kurva Pertumbuhan</p>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="usia"
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            tickFormatter={v => `${v}m`}
          />
          <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
          <Tooltip
            contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
            labelFormatter={v => `Usia: ${v} bulan`}
            formatter={(val, name) => [`${val} kg`, name]}
          />
          <Legend
            verticalAlign="bottom"
            iconType="line"
            wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
          />
          <Line
            type="monotone" dataKey="beratAnak" name="Anak"
            stroke="#1A73C1" strokeWidth={2} dot={{ r: 3, fill: '#1A73C1' }}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone" dataKey="normal" name="Normal"
            stroke="#4CAF50" strokeWidth={1.5} strokeDasharray="5 5" dot={false}
          />
          <Line
            type="monotone" dataKey="trenNaik" name="Tren Naik"
            stroke="#9E9E9E" strokeWidth={1.5} strokeDasharray="5 5" dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

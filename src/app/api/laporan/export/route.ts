import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserWithRole } from '@/lib/auth/role'

const COLUMNS = [
  'Nama', 'NIK', 'JK', 'Tgl Lahir', 'Tgl Periksa', 'BB (kg)', 'TB (cm)', 'LILA', 'LK',
  'Z BB/U', 'Z TB/U', 'Z BB/TB', 'Status BB/U', 'Status TB/U', 'Status BB/TB',
  'Status Gizi', 'Rujukan', 'Alasan Rujukan', 'Saran Medis', 'Tervalidasi',
]

function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

// GET /api/laporan/export?from=YYYY-MM-DD&to=YYYY-MM-DD — CSV for the Puskesmas.
export async function GET(request: NextRequest) {
  const { user, role } = await getCurrentUserWithRole()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (role !== 'bidan' && role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const from = request.nextUrl.searchParams.get('from')
  const to = request.nextUrl.searchParams.get('to')

  const supabase = createClient()
  let query = supabase
    .from('pemeriksaan')
    .select(
      'tgl_pemeriksaan, berat_badan, tinggi_badan, lingkar_lengan_atas, lingkar_kepala, zscore_bb_u, zscore_tb_u, zscore_bb_tb, status_bb_u, status_tb_u, status_bb_tb, status_gizi, rujukan, rujukan_alasan, saran_medis, is_validated, anak ( nama_anak, nik, jenis_kelamin, tgl_lahir )'
    )
    .order('tgl_pemeriksaan', { ascending: true })

  if (from) query = query.gte('tgl_pemeriksaan', from)
  if (to) query = query.lte('tgl_pemeriksaan', to)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  type Joined = {
    tgl_pemeriksaan: string
    berat_badan: number | null
    tinggi_badan: number | null
    lingkar_lengan_atas: number | null
    lingkar_kepala: number | null
    zscore_bb_u: number | null
    zscore_tb_u: number | null
    zscore_bb_tb: number | null
    status_bb_u: string | null
    status_tb_u: string | null
    status_bb_tb: string | null
    status_gizi: string | null
    rujukan: boolean | null
    rujukan_alasan: string | null
    saran_medis: string | null
    is_validated: boolean | null
    anak: { nama_anak: string; nik: string; jenis_kelamin: string; tgl_lahir: string } | null
  }

  const rows = (data as unknown as Joined[]) ?? []
  const lines = [COLUMNS.join(',')]
  for (const r of rows) {
    lines.push([
      r.anak?.nama_anak, r.anak?.nik, r.anak?.jenis_kelamin, r.anak?.tgl_lahir,
      r.tgl_pemeriksaan, r.berat_badan, r.tinggi_badan, r.lingkar_lengan_atas, r.lingkar_kepala,
      r.zscore_bb_u, r.zscore_tb_u, r.zscore_bb_tb, r.status_bb_u, r.status_tb_u, r.status_bb_tb,
      r.status_gizi, r.rujukan ? 'Ya' : 'Tidak', r.rujukan_alasan, r.saran_medis,
      r.is_validated ? 'Ya' : 'Belum',
    ].map(csvCell).join(','))
  }

  const csv = '﻿' + lines.join('\r\n') // BOM so Excel reads UTF-8
  const stamp = new Date().toISOString().split('T')[0]
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="laporan-posyandu-${stamp}.csv"`,
    },
  })
}

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { pemeriksaanSchema, saranMedisSchema } from '@/lib/validations/pemeriksaan.schema'
import { calculateNutritionalStatus } from '@/lib/zscore'

// POST /api/pemeriksaan — Kader submits anthropometry data
export async function POST(request: NextRequest) {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.app_metadata?.role !== 'kader') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const result = pemeriksaanSchema.safeParse(body)
  if (!result.success) {
    const flat = result.error.flatten()
    const firstFieldErr = Object.values(flat.fieldErrors)[0]?.[0]
    return NextResponse.json(
      { error: firstFieldErr ?? 'Validation failed', details: flat },
      { status: 400 }
    )
  }

  let { id_anak } = result.data
  const { id_reservasi, berat_badan, tinggi_badan, lingkar_kepala, lingkar_lengan_atas } = result.data

  // Resolve id_anak from reservasi when not provided directly
  if (!id_anak && id_reservasi) {
    const { data: reservasi } = await supabase
      .from('reservasi')
      .select('id_anak')
      .eq('id', id_reservasi)
      .single()
    id_anak = reservasi?.id_anak
  }

  if (!id_anak) {
    return NextResponse.json({ error: 'Child reference missing' }, { status: 400 })
  }

  // Fetch child data for Z-Score calculation
  const { data: anak } = await supabase
    .from('anak')
    .select('tgl_lahir, jenis_kelamin')
    .eq('id', id_anak)
    .single()

  if (!anak) {
    return NextResponse.json({ error: 'Child not found' }, { status: 404 })
  }

  const zscoreResult = calculateNutritionalStatus({
    berat_badan,
    tinggi_badan,
    tgl_lahir: anak.tgl_lahir,
    jenis_kelamin: anak.jenis_kelamin as 'L' | 'P',
  })

  const { data: pemeriksaan, error } = await supabase
    .from('pemeriksaan')
    .insert({
      id_anak,
      id_reservasi: id_reservasi ?? null,
      id_kader: user.id,
      berat_badan,
      tinggi_badan,
      lingkar_kepala: lingkar_kepala ?? null,
      lingkar_lengan_atas: lingkar_lengan_atas ?? null,
      ...zscoreResult,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Mark reservasi reviewed
  if (id_reservasi) {
    await supabase
      .from('reservasi')
      .update({ status: 'reviewed' })
      .eq('id', id_reservasi)
  }

  return NextResponse.json({ success: true, pemeriksaan }, { status: 201 })
}

// PATCH /api/pemeriksaan — Bidan submits medical advice
export async function PATCH(request: NextRequest) {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.app_metadata?.role !== 'bidan') {
    return NextResponse.json({ error: 'Forbidden — only Bidan can add medical advice' }, { status: 403 })
  }

  const body = await request.json()
  const result = saranMedisSchema.safeParse(body)
  if (!result.success) {
    const flat = result.error.flatten()
    const firstFieldErr = Object.values(flat.fieldErrors)[0]?.[0]
    return NextResponse.json(
      { error: firstFieldErr ?? 'Validation failed', details: flat },
      { status: 400 }
    )
  }

  const { id_pemeriksaan, saran_medis, pemberian_bantuan_medis, rujukan, rujukan_alasan } = result.data

  const { data, error } = await supabase
    .from('pemeriksaan')
    .update({
      saran_medis,
      pemberian_bantuan_medis: pemberian_bantuan_medis ?? null,
      id_bidan: user.id,
      is_validated: true,
      validated_at: new Date().toISOString(),
      rujukan: rujukan ?? false,
      rujukan_alasan: rujukan ? (rujukan_alasan ?? null) : null,
      rujukan_status: rujukan ? 'pending' : 'none',
    })
    .eq('id', id_pemeriksaan)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}

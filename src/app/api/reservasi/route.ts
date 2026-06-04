import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { reservasiSchema } from '@/lib/validations/reservasi.schema'

// POST /api/reservasi — create a new reservation
export async function POST(request: NextRequest) {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const result = reservasiSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const { id_anak, id_jadwal } = result.data

  // VR-01: Check if quota is full
  const { data: jadwal } = await supabase
    .from('jadwal')
    .select('kuota, kuota_terisi')
    .eq('id', id_jadwal)
    .single()

  if (!jadwal) {
    return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
  }

  if (jadwal.kuota_terisi >= jadwal.kuota) {
    return NextResponse.json(
      { error: 'Slot is full. Please choose another time.' },
      { status: 409 }
    )
  }

  // VR-02: Check if child already has a reservation on this schedule
  const { data: existing } = await supabase
    .from('reservasi')
    .select('id')
    .eq('id_anak', id_anak)
    .eq('id_jadwal', id_jadwal)
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { error: 'This child is already registered for this schedule.' },
      { status: 409 }
    )
  }

  const { data: reservasi, error } = await supabase
    .from('reservasi')
    .insert({
      id_ortu: user.id,
      id_anak,
      id_jadwal,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, reservasi }, { status: 201 })
}

// PATCH /api/reservasi — cancel own reservation (quota rolls back via DB trigger)
export async function PATCH(request: NextRequest) {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, status } = await request.json()
  if (typeof id !== 'string' || status !== 'cancelled') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // RLS also scopes to the owner; the explicit id_ortu filter is defence in depth.
  const { error } = await supabase
    .from('reservasi')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .eq('id_ortu', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}

// GET /api/reservasi — list reservations for the current user
export async function GET() {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('reservasi')
    .select(`
      *,
      anak ( nama_anak, tgl_lahir, jenis_kelamin ),
      jadwal ( tgl_pelaksanaan, jam, lokasi, kuota )
    `)
    .eq('id_ortu', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

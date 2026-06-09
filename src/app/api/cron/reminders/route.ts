import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { deriveImmunizationStatus, type VaccineSchedule, type VaccineGiven } from '@/lib/immunization'

// NOT-1: daily reminder generator. Schedule via Vercel Cron (see vercel.json).
// Secure with CRON_SECRET ("Authorization: Bearer <secret>") when set.
// In-app only for now; WhatsApp/email channels are a follow-up (need a provider).
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: 'Service role key missing' }, { status: 500 })

  const notifs: {
    id_ortu: string
    judul: string
    pesan: string
    tipe: string
    dedupe_key: string
  }[] = []

  // 1. Session reminders — bookings for tomorrow.
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split('T')[0]
  const { data: jadwalT } = await admin
    .from('jadwal')
    .select('id, jam, lokasi')
    .eq('tgl_pelaksanaan', tomorrow)
    .eq('status', 'open')
  const jadwalMap = new Map((jadwalT ?? []).map((j) => [j.id, j]))
  if (jadwalMap.size > 0) {
    const { data: resv } = await admin
      .from('reservasi')
      .select('id, id_ortu, id_jadwal, status')
      .in('id_jadwal', Array.from(jadwalMap.keys()))
      .in('status', ['pending', 'reviewed', 'verified'])
    for (const r of resv ?? []) {
      const j = jadwalMap.get(r.id_jadwal)
      if (!j) continue
      notifs.push({
        id_ortu: r.id_ortu,
        judul: 'Pengingat Posyandu',
        pesan: `Jadwal Posyandu besok di ${j.lokasi} pukul ${j.jam} WIB. Jangan lupa hadir.`,
        tipe: 'sesi',
        dedupe_key: `sesi:${r.id}:${tomorrow}`,
      })
    }
  }

  // 2. Overdue immunization reminders (once per child/vaccine/month).
  const yyyymm = new Date().toISOString().slice(0, 7)
  const [{ data: anakAll }, { data: schedule }, { data: givenAll }] = await Promise.all([
    admin.from('anak').select('id, id_ortu, tgl_lahir').is('deleted_at', null),
    admin.from('imunisasi_jenis').select('id, kode, nama, dosis_ke, usia_bulan_rekomendasi, urutan').eq('aktif', true),
    admin.from('imunisasi_anak').select('id_anak, id_jenis, tgl_pemberian'),
  ])
  const givenByAnak = new Map<string, VaccineGiven[]>()
  for (const g of givenAll ?? []) {
    const arr = givenByAnak.get(g.id_anak) ?? []
    arr.push({ id_jenis: g.id_jenis, tgl_pemberian: g.tgl_pemberian })
    givenByAnak.set(g.id_anak, arr)
  }
  for (const a of anakAll ?? []) {
    const rows = deriveImmunizationStatus(a.tgl_lahir, (schedule ?? []) as VaccineSchedule[], givenByAnak.get(a.id) ?? [])
    for (const r of rows.filter((x) => x.status === 'overdue')) {
      notifs.push({
        id_ortu: a.id_ortu,
        judul: 'Imunisasi terlambat',
        pesan: `Imunisasi ${r.jenis.nama} sudah melewati jadwal. Segera ke Posyandu/Puskesmas.`,
        tipe: 'imunisasi',
        dedupe_key: `imun:${a.id}:${r.jenis.id}:${yyyymm}`,
      })
    }
  }

  let inserted = 0
  if (notifs.length > 0) {
    const { data, error } = await admin
      .from('notifikasi')
      .upsert(notifs, { onConflict: 'dedupe_key', ignoreDuplicates: true })
      .select('id')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    inserted = data?.length ?? 0
  }

  return NextResponse.json({ ok: true, candidates: notifs.length, inserted })
}

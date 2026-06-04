'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { createJadwal, type JadwalState } from '@/app/actions/jadwal.actions'

const initial: JadwalState = { error: null }

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-brand-teal text-white rounded-btn py-2.5 text-sm font-medium disabled:opacity-60"
    >
      {pending ? 'Menyimpan...' : 'Tambah Jadwal'}
    </button>
  )
}

export function CreateJadwalForm() {
  const [state, action] = useFormState(createJadwal, initial)

  return (
    <form action={action} className="bg-white rounded-card border border-gray-100 shadow-sm p-4 space-y-3">
      <p className="text-[13px] font-semibold text-gray-700">Buat Jadwal Posyandu</p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="tgl_pelaksanaan" className="text-xs text-gray-500 block mb-1">Tanggal</label>
          <input id="tgl_pelaksanaan" name="tgl_pelaksanaan" type="date" required
            className="w-full border border-gray-300 rounded-btn px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue" />
        </div>
        <div>
          <label htmlFor="jam" className="text-xs text-gray-500 block mb-1">Jam</label>
          <input id="jam" name="jam" type="time" required
            className="w-full border border-gray-300 rounded-btn px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue" />
        </div>
      </div>

      <div>
        <label htmlFor="lokasi" className="text-xs text-gray-500 block mb-1">Lokasi</label>
        <input id="lokasi" name="lokasi" type="text" placeholder="Balai RW 04" required
          className="w-full border border-gray-300 rounded-btn px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue" />
      </div>

      <div>
        <label htmlFor="kuota" className="text-xs text-gray-500 block mb-1">Kuota</label>
        <input id="kuota" name="kuota" type="number" min={1} max={500} defaultValue={30} required
          className="w-full border border-gray-300 rounded-btn px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue" />
      </div>

      <div>
        <label htmlFor="catatan" className="text-xs text-gray-500 block mb-1">Catatan (opsional)</label>
        <input id="catatan" name="catatan" type="text"
          className="w-full border border-gray-300 rounded-btn px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue" />
      </div>

      {state.error && <p role="alert" className="text-xs text-red-500 bg-red-50 p-2 rounded-btn">{state.error}</p>}
      {state.ok && <p role="status" className="text-xs text-green-600 bg-green-50 p-2 rounded-btn">Jadwal ditambahkan.</p>}

      <Submit />
    </form>
  )
}

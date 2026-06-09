'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { updatePemeriksaan, type EditMeasurementState } from '@/app/actions/pemeriksaan.actions'

const initial: EditMeasurementState = { error: null }

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}
      className="w-full bg-brand-teal text-white rounded-btn py-2.5 text-sm font-medium disabled:opacity-60">
      {pending ? 'Menyimpan...' : 'Koreksi Pengukuran'}
    </button>
  )
}

export function EditMeasurementForm({
  id,
  beratBadan,
  tinggiBadan,
}: {
  id: string
  beratBadan: number | null
  tinggiBadan: number | null
}) {
  const [state, action] = useFormState(updatePemeriksaan, initial)

  return (
    <form action={action} className="mx-4 bg-white rounded-card border border-gray-100 shadow-sm p-4 space-y-3">
      <p className="text-[13px] font-semibold text-gray-700">Koreksi Pengukuran Terakhir</p>
      <input type="hidden" name="id" value={id} />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="bb" className="text-xs text-gray-500 block mb-1">Berat Badan (kg)</label>
          <input id="bb" name="berat_badan" type="number" step="0.1" defaultValue={beratBadan ?? ''} required
            className="w-full border border-gray-300 rounded-btn px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue" />
        </div>
        <div>
          <label htmlFor="tb" className="text-xs text-gray-500 block mb-1">Tinggi Badan (cm)</label>
          <input id="tb" name="tinggi_badan" type="number" step="0.1" defaultValue={tinggiBadan ?? ''} required
            className="w-full border border-gray-300 rounded-btn px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue" />
        </div>
      </div>
      {state.error && <p role="alert" className="text-xs text-red-500 bg-red-50 p-2 rounded-btn">{state.error}</p>}
      {state.ok && <p role="status" className="text-xs text-green-600 bg-green-50 p-2 rounded-btn">Pengukuran diperbarui.</p>}
      <Submit />
    </form>
  )
}

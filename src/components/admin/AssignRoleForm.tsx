'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { assignStaffRole, type AssignState } from '@/app/actions/user.actions'

const initial: AssignState = { error: null }

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}
      className="w-full bg-brand-teal text-white rounded-btn py-2.5 text-sm font-medium disabled:opacity-60">
      {pending ? 'Memproses...' : 'Tetapkan Peran'}
    </button>
  )
}

export function AssignRoleForm() {
  const [state, action] = useFormState(assignStaffRole, initial)

  return (
    <form action={action} className="bg-white rounded-card border border-gray-100 shadow-sm p-4 space-y-3">
      <p className="text-[13px] font-semibold text-gray-700">Tetapkan Kader / Bidan</p>
      <p className="text-[11px] text-gray-400">Pengguna harus sudah mendaftar dengan email ini.</p>

      <div>
        <label htmlFor="email" className="text-xs text-gray-500 block mb-1">Email Pengguna</label>
        <input id="email" name="email" type="email" required
          className="w-full border border-gray-300 rounded-btn px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue" />
      </div>
      <div>
        <label htmlFor="nama" className="text-xs text-gray-500 block mb-1">Nama</label>
        <input id="nama" name="nama" type="text" required
          className="w-full border border-gray-300 rounded-btn px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue" />
      </div>
      <div>
        <label htmlFor="role" className="text-xs text-gray-500 block mb-1">Peran</label>
        <select id="role" name="role" required defaultValue="kader"
          className="w-full border border-gray-300 rounded-btn px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue">
          <option value="kader">Kader</option>
          <option value="bidan">Bidan</option>
        </select>
      </div>

      {state.error && <p role="alert" className="text-xs text-red-500 bg-red-50 p-2 rounded-btn">{state.error}</p>}
      {state.ok && <p role="status" className="text-xs text-green-600 bg-green-50 p-2 rounded-btn">Peran berhasil ditetapkan.</p>}

      <Submit />
    </form>
  )
}

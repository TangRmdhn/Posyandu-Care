'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { createStaffUser, type AssignState } from '@/app/actions/user.actions'

const initial: AssignState = { error: null }

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}
      className="w-full bg-brand-blue text-white rounded-btn py-2.5 text-sm font-medium disabled:opacity-60">
      {pending ? 'Membuat...' : 'Buat Akun'}
    </button>
  )
}

export function CreateStaffForm() {
  const [state, action] = useFormState(createStaffUser, initial)

  return (
    <form action={action} className="bg-white rounded-card border border-gray-100 shadow-sm p-4 space-y-3">
      <p className="text-[13px] font-semibold text-gray-700">Buat Akun Baru</p>
      <p className="text-[11px] text-gray-400">Membuat akun langsung dengan email + password.</p>

      <div>
        <label htmlFor="c_nama" className="text-xs text-gray-500 block mb-1">Nama</label>
        <input id="c_nama" name="nama" type="text" required
          className="w-full border border-gray-300 rounded-btn px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue" />
      </div>
      <div>
        <label htmlFor="c_email" className="text-xs text-gray-500 block mb-1">Email</label>
        <input id="c_email" name="email" type="email" required
          className="w-full border border-gray-300 rounded-btn px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue" />
      </div>
      <div>
        <label htmlFor="c_password" className="text-xs text-gray-500 block mb-1">Password (min. 8)</label>
        <input id="c_password" name="password" type="password" minLength={8} required
          className="w-full border border-gray-300 rounded-btn px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue" />
      </div>
      <div>
        <label htmlFor="c_role" className="text-xs text-gray-500 block mb-1">Peran</label>
        <select id="c_role" name="role" required defaultValue="bidan"
          className="w-full border border-gray-300 rounded-btn px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue">
          <option value="bidan">Bidan</option>
          <option value="kader">Kader</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {state.error && <p role="alert" className="text-xs text-red-500 bg-red-50 p-2 rounded-btn">{state.error}</p>}
      {state.ok && <p role="status" className="text-xs text-green-600 bg-green-50 p-2 rounded-btn">Akun berhasil dibuat.</p>}

      <Submit />
    </form>
  )
}

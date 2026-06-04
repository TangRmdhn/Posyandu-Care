'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { registerAnak, type RegisterAnakState } from '@/app/actions/anak.actions'

const initialState: RegisterAnakState = { error: null }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-brand-teal text-white rounded-btn py-3 text-sm font-medium
                 mt-2 flex items-center justify-center gap-2 disabled:opacity-60"
      style={{ height: '48px' }}
    >
      {pending ? 'Menyimpan...' : '✓ Selesai'}
    </button>
  )
}

export default function RegisterAnakPage() {
  const [state, formAction] = useFormState(registerAnak, initialState)

  return (
    <div className="px-4 py-6 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <a href="/ortu" className="text-brand-blue">←</a>
        <div>
          <h2 className="text-base font-semibold text-gray-900">Biodata Anak</h2>
          <p className="text-xs text-gray-400">Lengkapi data kesehatan anak Anda</p>
        </div>
      </div>

      <form action={formAction} className="space-y-[10px]">
        <div>
          <label htmlFor="nama_anak" className="text-xs text-gray-500 block mb-1">Nama Anak</label>
          <input id="nama_anak" name="nama_anak" type="text" placeholder="Nama lengkap anak" required
            className="w-full border border-gray-300 rounded-btn px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-blue" />
        </div>

        <div>
          <label htmlFor="nik" className="text-xs text-gray-500 block mb-1">NIK Anak</label>
          <input id="nik" name="nik" type="text" inputMode="numeric" placeholder="16 digit NIK" maxLength={16} required
            className="w-full border border-gray-300 rounded-btn px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-blue" />
        </div>

        <div>
          <label htmlFor="tgl_lahir" className="text-xs text-gray-500 block mb-1">Tanggal Lahir</label>
          <input id="tgl_lahir" name="tgl_lahir" type="date" required
            className="w-full border border-gray-300 rounded-btn px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-blue" />
        </div>

        <div>
          <label htmlFor="tempat_lahir" className="text-xs text-gray-500 block mb-1">Tempat Lahir</label>
          <input id="tempat_lahir" name="tempat_lahir" type="text" placeholder="Kota/Kabupaten" required
            className="w-full border border-gray-300 rounded-btn px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-blue" />
        </div>

        <div>
          <label htmlFor="jenis_kelamin" className="text-xs text-gray-500 block mb-1">Jenis Kelamin</label>
          <select id="jenis_kelamin" name="jenis_kelamin" required defaultValue=""
            className="w-full border border-gray-300 rounded-btn px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white">
            <option value="" disabled>Pilih Jenis Kelamin</option>
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="rt" className="text-xs text-gray-500 block mb-1">RT</label>
            <input id="rt" name="rt" type="text" placeholder="001" required
              className="w-full border border-gray-300 rounded-btn px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-blue" />
          </div>
          <div>
            <label htmlFor="rw" className="text-xs text-gray-500 block mb-1">RW</label>
            <input id="rw" name="rw" type="text" placeholder="004" required
              className="w-full border border-gray-300 rounded-btn px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-blue" />
          </div>
        </div>

        {state.error && (
          <p role="alert" className="text-xs text-red-500 bg-red-50 p-2 rounded-btn">{state.error}</p>
        )}

        <SubmitButton />
      </form>
    </div>
  )
}

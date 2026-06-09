'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { createArtikel, type ArtikelState } from '@/app/actions/artikel.actions'
import { ARTIKEL_KATEGORI } from '@/lib/validations/artikel.schema'

const initial: ArtikelState = { error: null }

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}
      className="w-full bg-brand-teal text-white rounded-btn py-2.5 text-sm font-medium disabled:opacity-60">
      {pending ? 'Menyimpan...' : 'Simpan Artikel'}
    </button>
  )
}

export function CreateArtikelForm() {
  const [state, action] = useFormState(createArtikel, initial)

  return (
    <form action={action} className="bg-white rounded-card border border-gray-100 shadow-sm p-4 space-y-3">
      <p className="text-[13px] font-semibold text-gray-700">Tulis Artikel</p>
      <div>
        <label htmlFor="judul" className="text-xs text-gray-500 block mb-1">Judul</label>
        <input id="judul" name="judul" type="text" required
          className="w-full border border-gray-300 rounded-btn px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue" />
      </div>
      <div>
        <label htmlFor="kategori" className="text-xs text-gray-500 block mb-1">Kategori</label>
        <select id="kategori" name="kategori" defaultValue=""
          className="w-full border border-gray-300 rounded-btn px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue">
          <option value="">- pilih -</option>
          {ARTIKEL_KATEGORI.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="ringkasan" className="text-xs text-gray-500 block mb-1">Ringkasan</label>
        <input id="ringkasan" name="ringkasan" type="text"
          className="w-full border border-gray-300 rounded-btn px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue" />
      </div>
      <div>
        <label htmlFor="konten" className="text-xs text-gray-500 block mb-1">Konten</label>
        <textarea id="konten" name="konten" rows={6} required
          className="w-full border border-gray-300 rounded-btn px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none" />
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" name="published" className="w-4 h-4" />
        <span className="text-xs text-gray-600">Langsung terbitkan</span>
      </label>
      {state.error && <p role="alert" className="text-xs text-red-500 bg-red-50 p-2 rounded-btn">{state.error}</p>}
      {state.ok && <p role="status" className="text-xs text-green-600 bg-green-50 p-2 rounded-btn">Artikel disimpan.</p>}
      <Submit />
    </form>
  )
}

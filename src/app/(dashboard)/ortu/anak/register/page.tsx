import { registerAnak } from '@/app/actions/anak.actions'

async function submitAnak(formData: FormData) {
  'use server'
  await registerAnak(formData)
}

export default function RegisterAnakPage() {
  return (
    <div className="px-4 py-6 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <a href="/ortu" className="text-brand-blue">←</a>
        <div>
          <h2 className="text-base font-semibold text-gray-900">Biodata Anak</h2>
          <p className="text-xs text-gray-400">Lengkapi data kesehatan anak Anda</p>
        </div>
      </div>

      <form action={submitAnak} className="space-y-[10px]">
        <div className="flex justify-center py-3">
          <label className="cursor-pointer">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-brand-teal
                            bg-brand-light flex flex-col items-center justify-center">
              <span className="text-2xl">📷</span>
              <span className="text-[10px] text-brand-teal text-center leading-tight mt-0.5">
                Upload<br/>Foto
              </span>
            </div>
            <input type="file" name="foto" accept="image/*" className="hidden" />
          </label>
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">Nama Anak</label>
          <input name="nama_anak" type="text" placeholder="Nama lengkap anak" required
            className="w-full border border-gray-300 rounded-btn px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-blue" />
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">NIK Anak</label>
          <input name="nik" type="text" placeholder="16 digit NIK" maxLength={16} required
            className="w-full border border-gray-300 rounded-btn px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-blue" />
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">Tanggal Lahir</label>
          <input name="tgl_lahir" type="date" required
            className="w-full border border-gray-300 rounded-btn px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-blue" />
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">Tempat Lahir</label>
          <input name="tempat_lahir" type="text" placeholder="Kota/Kabupaten" required
            className="w-full border border-gray-300 rounded-btn px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-blue" />
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">Jenis Kelamin</label>
          <select name="jenis_kelamin" required
            className="w-full border border-gray-300 rounded-btn px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white">
            <option value="">Pilih Jenis Kelamin</option>
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">RT</label>
            <input name="rt" type="text" placeholder="001" required
              className="w-full border border-gray-300 rounded-btn px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-blue" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">RW</label>
            <input name="rw" type="text" placeholder="004" required
              className="w-full border border-gray-300 rounded-btn px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-blue" />
          </div>
        </div>

        <button type="submit"
          className="w-full bg-brand-teal text-white rounded-btn py-3 text-sm font-medium
                     mt-2 flex items-center justify-center gap-2"
          style={{ height: '48px' }}>
          ✓ Selesai
        </button>
      </form>
    </div>
  )
}

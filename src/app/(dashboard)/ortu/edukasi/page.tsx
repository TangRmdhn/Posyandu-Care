const ARTIKEL = [
  { judul: 'Pentingnya Imunisasi Dasar Lengkap', desc: 'Lindungi anak dari penyakit berbahaya sejak dini.' },
  { judul: 'Gizi Seimbang untuk Balita', desc: 'Panduan menu sehat mendukung tumbuh kembang anak.' },
  { judul: 'Mengenal Stunting & Pencegahannya', desc: 'Deteksi dini dan langkah pencegahan stunting.' },
]

export default function EdukasiPage() {
  return (
    <div className="px-4 py-6 space-y-3">
      <h2 className="text-base font-semibold text-gray-900">Edukasi Kesehatan</h2>
      {ARTIKEL.map((a) => (
        <div key={a.judul} className="bg-white rounded-card p-4 shadow-sm border border-gray-100">
          <p className="text-sm font-semibold text-gray-900">{a.judul}</p>
          <p className="text-xs text-gray-500 mt-1">{a.desc}</p>
        </div>
      ))}
    </div>
  )
}

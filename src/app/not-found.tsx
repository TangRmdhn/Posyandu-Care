import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center gap-3">
      <p className="text-3xl font-bold text-brand-teal">404</p>
      <p className="text-sm text-gray-500">Halaman tidak ditemukan.</p>
      <Link href="/" className="mt-2 bg-brand-teal text-white rounded-btn px-5 py-2.5 text-sm font-medium">
        Kembali ke Beranda
      </Link>
    </div>
  )
}

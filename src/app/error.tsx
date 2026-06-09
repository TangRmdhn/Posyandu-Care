'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surfaced to the monitoring provider once wired (see bigplan/08 OBS-1).
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center gap-3">
      <p className="text-base font-semibold text-gray-900">Terjadi kesalahan</p>
      <p className="text-sm text-gray-500">Maaf, ada gangguan. Silakan coba lagi.</p>
      <button onClick={reset} className="mt-2 bg-brand-teal text-white rounded-btn px-5 py-2.5 text-sm font-medium">
        Coba Lagi
      </button>
    </div>
  )
}

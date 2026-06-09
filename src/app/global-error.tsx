'use client'

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="id">
      <body style={{ fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, textAlign: 'center' }}>
          <p style={{ fontWeight: 600 }}>Aplikasi mengalami gangguan</p>
          <p style={{ color: '#6B7280', fontSize: 14 }}>Silakan muat ulang halaman.</p>
          <button onClick={reset} style={{ background: '#00897B', color: '#fff', border: 0, borderRadius: 8, padding: '10px 20px', fontSize: 14 }}>
            Muat Ulang
          </button>
        </div>
      </body>
    </html>
  )
}

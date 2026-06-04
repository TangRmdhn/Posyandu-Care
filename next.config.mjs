/** @type {import('next').NextConfig} */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://leemynhujnwjugsivtyb.supabase.co'
let supabaseHost = 'leemynhujnwjugsivtyb.supabase.co'
try {
  supabaseHost = new URL(supabaseUrl).host
} catch {
  // keep fallback
}

const isDev = process.env.NODE_ENV === 'development'

// Content-Security-Policy. script-src keeps 'unsafe-inline' for Next's bootstrap
// (tighten to nonces later, see bigplan/03); 'unsafe-eval' only in dev.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  `img-src 'self' data: blob: https://${supabaseHost}`,
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  `connect-src 'self' https://${supabaseHost} wss://${supabaseHost}`,
  'upgrade-insecure-requests',
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: supabaseHost }],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig

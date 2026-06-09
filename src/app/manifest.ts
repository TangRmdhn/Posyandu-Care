import type { MetadataRoute } from 'next'

// OFF-1 (partial): web app manifest → installable PWA. Full offline app-shell /
// IndexedDB outbox is a follow-up (needs a service worker + real PNG icons).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Posyandu Care',
    short_name: 'Posyandu',
    description: 'Sistem Monitoring Kesehatan Ibu dan Anak',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#00897B',
    lang: 'id',
    icons: [{ src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' }],
  }
}

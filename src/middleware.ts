import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const PUBLIC_ROUTES = ['/login', '/register']

const ROLE_DASHBOARDS: Record<string, string> = {
  ortu:   '/ortu',
  kader:  '/kader',
  bidan:  '/bidan',
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { supabaseResponse, user, role } = await updateSession(request)

  // Allow public routes without auth
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    if (user) {
      const dashboard = ROLE_DASHBOARDS[role ?? ''] ?? '/login'
      if (dashboard !== '/login') {
        return NextResponse.redirect(new URL(dashboard, request.url))
      }
    }
    return supabaseResponse
  }

  // Protected route — require authentication
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Enforce role-based access
  const allowedPrefix = ROLE_DASHBOARDS[role ?? '']

  if (allowedPrefix && !pathname.startsWith(allowedPrefix) && pathname !== '/') {
    return NextResponse.redirect(new URL(allowedPrefix, request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

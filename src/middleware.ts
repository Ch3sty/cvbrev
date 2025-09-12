import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  console.log(`[MIDDLEWARE] Path: ${req.nextUrl.pathname}, Session: ${!!session}`)

  // Om användaren är inloggad och besöker startsidan, redirect till dashboard
  if (session && req.nextUrl.pathname === '/') {
    console.log('[MIDDLEWARE] Redirecting to dashboard')
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Om användaren inte är inloggad och försöker komma åt dashboard, redirect till login
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    console.log('[MIDDLEWARE] Redirecting to login')
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*'
  ]
}
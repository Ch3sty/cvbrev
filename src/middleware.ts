import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Enkel cookie-kontroll först
  const authToken = req.cookies.get('sb-dbvbnbkvadvlhjhomibg-auth-token')
  
  console.log(`[MIDDLEWARE] Path: ${req.nextUrl.pathname}`)
  console.log(`[MIDDLEWARE] Auth cookie exists: ${!!authToken}`)
  
  // Om vi har en auth-cookie, låt requests passera
  if (authToken && req.nextUrl.pathname.startsWith('/dashboard')) {
    console.log(`[MIDDLEWARE] Auth cookie found, allowing dashboard access`)
    return NextResponse.next()
  }
  
  // Annars, försök med fullständig session-kontroll
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    console.log(`[MIDDLEWARE] Session exists: ${!!session}`)
    console.log(`[MIDDLEWARE] Session error: ${error?.message || 'none'}`)
    
    if (error) {
      console.log(`[MIDDLEWARE] Auth error: ${error.message}`)
    }

    // Endast skydda dashboard routes - låt startsidan hantera sin egen redirect
    if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
      console.log(`[MIDDLEWARE] No session, redirecting to login`)
      return NextResponse.redirect(new URL('/login', req.url))
    }

    console.log(`[MIDDLEWARE] Allowing access to: ${req.nextUrl.pathname}`)
    return res
  } catch (err) {
    console.error('[MIDDLEWARE] Error:', err)
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*'
  ]
}
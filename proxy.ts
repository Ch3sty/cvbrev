// proxy.ts (i projektets rotmapp) - Next.js 16 kräver proxy.ts istället för middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { adminAuthMiddleware } from '@/middleware/admin-auth'
import {
  ATTRIBUTION_COOKIE,
  ATTRIBUTION_MAX_AGE,
  buildAttribution,
  serializeAttribution,
} from '@/lib/analytics/attribution'

/**
 * First touch-attribution (docs/plan-konvertering.md, C1).
 * Sätts bara när cookien saknas, så den första landningssidan vinner även om
 * besökaren surfar vidare. Inte httpOnly: registreringsformuläret läser den.
 * SameSite=Lax krävs för att den ska överleva Googles OAuth-redirect.
 */
function setAttributionCookie(request: NextRequest, response: NextResponse): void {
  if (request.cookies.has(ATTRIBUTION_COOKIE)) return

  // Bara riktiga sidvisningar. API-anrop och interna RSC-hämtningar
  // ska inte kunna sätta landningssidan.
  const pathname = request.nextUrl.pathname
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) return
  if (request.headers.get('sec-fetch-dest') === 'empty') return

  const attribution = buildAttribution({
    pathname,
    searchParams: request.nextUrl.searchParams,
    referrer: request.headers.get('referer'),
  })

  response.cookies.set({
    name: ATTRIBUTION_COOKIE,
    value: serializeAttribution(attribution),
    maxAge: ATTRIBUTION_MAX_AGE,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: false,
  })
}

// Next.js 16: Funktionsnamnet måste vara "proxy" istället för "middleware"
export async function proxy(request: NextRequest) {
  // Kontrollera om detta är en admin-route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Använd admin auth middleware för admin-routes
    return adminAuthMiddleware(request);
  }

  // För alla andra routes, använd den vanliga session middleware
  const response = await updateSession(request)
  setAttributionCookie(request, response)
  return response
}

export const config = {
  matcher: [
    /*
     * Matcha alla förfrågningsvägar utom de som börjar med:
     * - _next/static (statiska filer)
     * - _next/image (bildoptimeringsfiler)
     * - favicon.ico (favicon-filen)
     * - bilder och andra statiska tillgångar
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

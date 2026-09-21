// src/proxy.ts
// ==================
// Appens ENDA proxy-ingång (Next 16 ersätter middleware med proxy).
//
// Tidigare låg proxy.ts i projektroten. Projektet har en src-katalog, och då
// letar Next efter src/proxy.ts. Rotfilen plockades aldrig upp. Kvar som
// ingång blev gamla src/middleware.ts, som bara körde updateSession. Två
// saker föll alltså bort tyst i produktion:
//
//  1. jc_attr-cookien sattes aldrig, så profiles.acquisition_source blev null
//     på varje konto sedan reverse trial gick live.
//  2. /admin gick utan adminAuthMiddleware.
//
// Hela kedjan bor här nu. Både rotens proxy.ts och src/middleware.ts är borta,
// så det finns exakt en ingång och inget som kan skugga den igen.

import { NextResponse, type NextRequest } from 'next/server'
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

export async function proxy(request: NextRequest) {
  // Admin har egen auth och ingen attribution att spara.
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return adminAuthMiddleware(request)
  }

  const response = await updateSession(request)
  setAttributionCookie(request, response)
  return response
}

export const config = {
  matcher: [
    /*
     * Kör på alla request-paths UTOM:
     * - _next/static (byggda assets)
     * - _next/image (bildoptimering)
     * - favicon.ico
     * - filer med bild-/typsnitts-/media-ändelser i public/
     * API-routes inkluderas (de har egen auth där det behövs, och updateSession
     * blockerar bara PROTECTED_ROUTES så API påverkas inte av redirect-logiken).
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf|mp4|webm)$).*)',
  ],
}

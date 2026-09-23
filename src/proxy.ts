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

  // Bara HTML-dokument. Ett Set-Cookie gör svaret privat, så CDN:et slutar
  // dela det mellan besökare: varje träff blev en ISR-läsning och en full
  // origin-överföring i stället för en CDN-träff. Sitemap, robots.txt och
  // OG-bilderna fick cookien tidigare helt i onödan, och en artikel på
  // 670 kB betalades om från origin varje gång.
  if (request.headers.get('sec-fetch-dest') !== 'document') return

  // Attributionen är intressant först när någon kommer utifrån. En intern
  // klickning bär redan cookien, och en direktträff utan referrer ger ingen
  // källa att spara. Att hoppa över dem håller resten av sajten CDN-cachad.
  const referrer = request.headers.get('referer')
  const hasCampaign = ['utm_source', 'utm_medium', 'utm_campaign', 'gclid'].some((key) =>
    request.nextUrl.searchParams.has(key),
  )
  if (!hasCampaign) {
    if (!referrer) return
    try {
      if (new URL(referrer).host === request.nextUrl.host) return
    } catch {
      return
    }
  }

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
     * Proxyn kostar en Edge-invokering per träff och gör en sessionsläsning
     * mot Supabase. Den ska därför bara röra det som faktiskt behöver session
     * eller attribution. Utöver byggda assets och mediefiler är nu undantagna:
     *
     * - sitemap.xml, robots.txt, manifest.webmanifest och llms.txt
     *   Rena maskinfiler. De har ingen session och ska ligga kvar i CDN:et.
     * - opengraph-image / twitter-image
     *   Genereras en gång och cachas. Cookien gjorde dem ocacheade.
     * - api/og (Räkna ut-resultatens delningsbilder)
     *   Samma skäl som opengraph-image: bilden är densamma för samma
     *   parametrar och ska ligga kvar i CDN:et utan session.
     * - api/cron
     *   Vercels schemaläggare autentiserar med egen hemlighet, inte session.
     * - _next i sin helhet, inte bara static och image
     *   RSC-hämtningar och prefetch gick tidigare genom proxyn.
     *
     * Övriga API-routes går kvar genom proxyn: de har egen auth där det
     * behövs, och updateSession blockerar bara PROTECTED_ROUTES.
     */
    '/((?!_next/|api/cron/|api/og/|favicon\\.ico|sitemap\\.xml|robots\\.txt|manifest\\.webmanifest|llms\\.txt|.*opengraph-image|.*twitter-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff|woff2|ttf|otf|mp4|webm|txt|xml|json|pdf|css|js|map)$).*)',
  ],
}

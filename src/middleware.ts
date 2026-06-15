// src/middleware.ts
// Aktiverar server-side auth för skyddade routes (/dashboard m.fl.) via den
// befintliga updateSession-helpern. Detta:
//  - redirectar oinloggade till /login INNAN klient-JS laddas (säkrare + snabbare)
//  - tar bort behovet av den blockerande klient-spinnern i dashboard-layouten
//  - uppdaterar last_active (non-blocking) för inloggade användare
//
// updateSession innehåller listan över PROTECTED_ROUTES; allt annat är publikt.
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
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

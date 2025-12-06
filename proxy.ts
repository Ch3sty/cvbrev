// proxy.ts (i projektets rotmapp) - Next.js 16 kräver proxy.ts istället för middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { adminAuthMiddleware } from '@/middleware/admin-auth'

// Next.js 16: Funktionsnamnet måste vara "proxy" istället för "middleware"
export async function proxy(request: NextRequest) {
  // Kontrollera om detta är en admin-route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Använd admin auth middleware för admin-routes
    return adminAuthMiddleware(request);
  }

  // För alla andra routes, använd den vanliga session middleware
  return await updateSession(request)
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
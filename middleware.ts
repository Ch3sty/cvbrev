// middleware.ts (i projektets rotmapp)
import { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
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

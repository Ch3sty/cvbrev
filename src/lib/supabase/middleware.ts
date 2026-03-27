// src/lib/supabase/middleware.ts
import { createServerClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { updateLastActive } from '@/lib/utils/activity-tracker'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

// Routes som KRÄVER inloggning (allt annat är publikt)
// Next.js 16: Ändrad från "blocka alla, tillåt några" till "tillåt alla, blocka specifika"
const PROTECTED_ROUTES = [
  '/dashboard',
  '/cv-generator',
  '/personligt-brev',  // Generatorn, INTE /personligt-brev-exempel
  '/min-profil',
  '/installningar',
  '/anvandare',
];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );
}

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request })

  // Skapa en Supabase-klient med ett cookie‑lager baserat på request.cookies
  const supabase = createServerClient({
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        request.cookies.set({ name, value, ...options })
        supabaseResponse.cookies.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        request.cookies.set({ name, value: '', ...options, maxAge: 0 })
        supabaseResponse.cookies.set({ name, value: '', ...options, maxAge: 0 })
      },
    },
  })

  // Viktigt: Kör inte kod mellan createServerClient och supabase.auth.getUser()
  const { data: { user } } = await supabase.auth.getUser()

  // Om användare är inloggad, uppdatera last_active i bakgrunden (non-blocking)
  if (user) {
    // Använd admin-klient (service role) för att bypassa RLS
    // Den cookie-baserade klienten saknar korrekt auth-kontext för DB-skrivningar i proxy
    updateLastActive(getSupabaseAdmin(), user.id).catch(err => {
      console.error('[Middleware] Misslyckades att uppdatera last_active:', err)
    })
  }

  // Next.js 16: Endast skyddade routes kräver inloggning
  // Alla andra routes (artiklar, cv-exempel, personligt-brev-exempel, etc.) är publika
  if (!user && isProtectedRoute(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
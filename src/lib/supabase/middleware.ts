// src/lib/supabase/middleware.ts
import { createServerClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { updateLastActive } from '@/lib/utils/activity-tracker'

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
    // Kör asynkront utan att vänta på resultat för att inte påverka sidladdning
    updateLastActive(supabase, user.id).catch(err => {
      // Logga fel men låt inte detta stoppa requesten
      console.error('[Middleware] Misslyckades att uppdatera last_active:', err)
    })
  }

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/register') &&
    request.nextUrl.pathname !== '/' // Korrekt: tillåt startsidan
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
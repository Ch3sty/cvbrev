// src/lib/supabase/middleware.ts
import { createServerClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // Skapa en Supabase-klient med ett cookie‑lager baserat på request.cookies
  const supabase = createServerClient({
    cookies: {
      get(name) {
        return request.cookies.get(name)?.value
      },
      set(name, value, options) {
        request.cookies.set({ name, value, ...options })
        supabaseResponse.cookies.set({ name, value, ...options })
      },
      remove(name, options) {
        request.cookies.set({ name, value: '', ...options, maxAge: 0 })
        supabaseResponse.cookies.set({ name, value: '', ...options, maxAge: 0 })
      },
    },
  })

  // Viktigt: Kör inte kod mellan createServerClient och supabase.auth.getUser()
  const { data: { user } } = await supabase.auth.getUser()

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

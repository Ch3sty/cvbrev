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

// Kandidatytor som en godkänd rekryterare INTE ska hamna på. Sträng separation:
// ett rekryterarkonto är enbart rekryterare och skickas alltid till portalen.
// (Alla PROTECTED_ROUTES är kandidatytor idag, så vi återanvänder listan.)
const CANDIDATE_ONLY_ROUTES = PROTECTED_ROUTES;

// Cookie som cachar rekryterarstatusen så vi slipper en DB-läsning per request.
// Kort livslängd: räcker för att slippa uppslag på varje sidladdning, men
// hinner inte bli inaktuell länge om en rekryterare godkänns/avslås.
const RECRUITER_FLAG_COOKIE = 'jc_recruiter';
const RECRUITER_FLAG_MAX_AGE = 60 * 10; // 10 minuter

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );
}

function isCandidateOnlyRoute(pathname: string): boolean {
  return CANDIDATE_ONLY_ROUTES.some(route =>
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

  const pathname = request.nextUrl.pathname

  // Next.js 16: Endast skyddade routes kräver inloggning
  // Alla andra routes (artiklar, cv-exempel, personligt-brev-exempel, etc.) är publika
  if (!user && isProtectedRoute(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Sträng rollseparation: en godkänd rekryterare hör hemma i /rekryterare och
  // ska aldrig se kandidatytorna. Vi kollar bara när det spelar roll (inloggad
  // användare på en kandidat-only route) och cachar svaret i en cookie så det
  // inte blir en DB-läsning per request.
  if (user && isCandidateOnlyRoute(pathname)) {
    const isRecruiter = await isApprovedRecruiter(request, supabaseResponse, user.id)
    if (isRecruiter) {
      const url = request.nextUrl.clone()
      url.pathname = '/rekryterare'
      url.search = ''
      const redirect = NextResponse.redirect(url)
      // Bär med cache-cookien (och ev. uppdaterade auth-cookies) till redirecten
      // så nästa request kan läsa cachen i stället för att slå mot DB igen.
      supabaseResponse.cookies.getAll().forEach(cookie => {
        redirect.cookies.set(cookie)
      })
      return redirect
    }
  }

  return supabaseResponse
}

/**
 * Är användaren en godkänd rekryterare? Läser i första hand en kort cookie för
 * att slippa DB-uppslag på varje sidladdning. Cookien binds till användarens id
 * (`<userId>:1|0`) så en annan användare som loggar in i samma webbläsare aldrig
 * ärver ett cachat svar. Saknas/mismatchar cookien görs ett enda uppslag mot
 * recruiter_profiles (service role, bypassar RLS) och svaret cachas på svaret.
 * Vid fel: false, så en trasig koll aldrig låser ute en vanlig kandidat.
 */
async function isApprovedRecruiter(
  request: NextRequest,
  response: NextResponse,
  userId: string,
): Promise<boolean> {
  const cached = request.cookies.get(RECRUITER_FLAG_COOKIE)?.value
  if (cached === `${userId}:1`) return true
  if (cached === `${userId}:0`) return false

  try {
    const { data } = await (getSupabaseAdmin() as any)
      .from('recruiter_profiles')
      .select('status')
      .eq('user_id', userId)
      .maybeSingle()

    const approved = (data as { status?: string } | null)?.status === 'approved'
    response.cookies.set({
      name: RECRUITER_FLAG_COOKIE,
      value: `${userId}:${approved ? '1' : '0'}`,
      maxAge: RECRUITER_FLAG_MAX_AGE,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })
    return approved
  } catch (err) {
    console.error('[Middleware] Kunde inte läsa rekryterarstatus:', err)
    return false
  }
}
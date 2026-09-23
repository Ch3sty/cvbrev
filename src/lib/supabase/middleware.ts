// src/lib/supabase/middleware.ts
import { createServerClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { updateLastActive } from '@/lib/utils/activity-tracker'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { ANVANDARE_HEADER, signeraAnvandare } from '@/lib/supabase/anvandare-header'

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

/**
 * Användar-id:t ur sessionscookien, OVERIFIERAT. Används bara för att starta
 * rekryteraruppslaget parallellt med getUser(); svaret används bara om
 * getUser() sedan bekräftar samma id. Null om cookien saknas eller inte går
 * att läsa.
 */
function gissaAnvandarId(request: NextRequest): string | null {
  try {
    const delar = request.cookies
      .getAll()
      .filter((c) => /^sb-[^.]+-auth-token(.d+)?$/.test(c.name))
      .sort((a, b) => Number(a.name.split('.')[1] ?? -1) - Number(b.name.split('.')[1] ?? -1))
    if (delar.length === 0) return null
    let varde = delar.map((c) => c.value).join('')
    if (varde.startsWith('base64-')) {
      varde = atob(varde.slice(7).replace(/-/g, '+').replace(/_/g, '/'))
    }
    const token = (JSON.parse(varde) as { access_token?: string }).access_token
    const nyttolast = token?.split('.')[1]
    if (!nyttolast) return null
    const sub = (JSON.parse(atob(nyttolast.replace(/-/g, '+').replace(/_/g, '/'))) as { sub?: string }).sub
    return typeof sub === 'string' ? sub : null
  } catch {
    return null
  }
}

export async function updateSession(request: NextRequest) {
  // En header med det här namnet får aldrig komma utifrån. Den tas bort
  // innan något annat händer, och sätts nedan bara av oss själva.
  request.headers.delete(ANVANDARE_HEADER)
  const supabaseResponse = NextResponse.next({ request })

  // Rekryteraruppslaget (nedan) krävde förut en egen rundtur EFTER getUser()
  // varje gång rekryterarcookien saknades eller gått ut. Id:t går att läsa
  // ur sessionscookien redan nu, så uppslaget startar parallellt med
  // getUser() och används bara om getUser() bekräftar samma id.
  const gissatId = isCandidateOnlyRoute(request.nextUrl.pathname) ? gissaAnvandarId(request) : null
  const tidigtUppslag =
    gissatId && !lasRekryterarcache(request, gissatId) ? slaUppRekryterare(gissatId) : null

  // Proxyn är den ENDA platsen som förnyar sessionen per request. Skrivningar
  // måste landa på både request (så Server Components i samma request läser
  // den nya token) och response (så webbläsaren byter ut den gamla).
  // getAll/setAll är @supabase/ssr:s rekommenderade API: hela cookie-
  // uppsättningen skrivs atomärt, vilket är det som hindrar refresh token
  // reuse (`token_revoked`).
  const supabase = createServerClient({
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options)
        }
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
    const isRecruiter = await isApprovedRecruiter(
      request,
      supabaseResponse,
      user.id,
      gissatId === user.id ? tidigtUppslag : null
    )
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

  if (!user) return supabaseResponse

  // Bär proxyns verifierade användare vidare till serverns rendering, så att
  // layouten och sidan slipper varsin rundtur till Supabase Auth
  // (anvandare-header.ts). Svaret måste skapas om för att request-headern
  // ska följa med, och cookies från förnyelsen och rekryterarcachen flyttas
  // över. request.headers bär redan de förnyade auth-cookies (setAll ovan).
  const signerad = await signeraAnvandare(user)
  if (!signerad) return supabaseResponse
  const headers = new Headers(request.headers)
  headers.set(ANVANDARE_HEADER, signerad)
  const svar = NextResponse.next({ request: { headers } })
  for (const cookie of supabaseResponse.cookies.getAll()) {
    svar.cookies.set(cookie)
  }
  return svar
}

/** Rekryterarcookiens svar för just den här användaren, eller null om den saknas. */
function lasRekryterarcache(request: NextRequest, userId: string): boolean | null {
  const cached = request.cookies.get(RECRUITER_FLAG_COOKIE)?.value
  if (cached === `${userId}:1`) return true
  if (cached === `${userId}:0`) return false
  return null
}

/** Ett uppslag i recruiter_profiles. Null vid fel, så att felet inte cachas. */
async function slaUppRekryterare(userId: string): Promise<boolean | null> {
  try {
    const { data } = await (getSupabaseAdmin() as any)
      .from('recruiter_profiles')
      .select('status')
      .eq('user_id', userId)
      .maybeSingle()
    return (data as { status?: string } | null)?.status === 'approved'
  } catch (err) {
    console.error('[Middleware] Kunde inte läsa rekryterarstatus:', err)
    return null
  }
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
  forhandssvar: Promise<boolean | null> | null = null,
): Promise<boolean> {
  const cached = lasRekryterarcache(request, userId)
  if (cached !== null) return cached

  const approved = await (forhandssvar ?? slaUppRekryterare(userId))
  // Vid fel: false, så en trasig koll aldrig låser ute en vanlig kandidat.
  if (approved === null) return false
  response.cookies.set({
    name: RECRUITER_FLAG_COOKIE,
    value: `${userId}:${approved ? '1' : '0'}`,
    maxAge: RECRUITER_FLAG_MAX_AGE,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })
  return approved
}

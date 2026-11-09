/**
 * /dashboard/valkommen: enda landningen efter ett nytt konto, för lösenord
 * och för Google (docs/design/profil-registrering-spec-2026-09-24.md, Del B).
 *
 * Servern läser cookien jc_signup och profilen. Klienten kör hämtkedjan för
 * smakproven först, och skickar sedan vidare: redirect, paket (köpsteget),
 * valet (steg 3) eller spårvalet.
 *
 * Ett konto som inte är nytt och inte har något smakprov att hämta hem
 * skickas direkt vidare, så att sidan aldrig blir en återvändsgränd för den
 * som loggar in med Google från registreringen.
 *
 * Från en testartikel (kakan jc_provkalla, saas-leads beslut 4 och 6,
 * 2026-11-10): valet sätts tyst på testplanen, och för I-prov och lokförare
 * visas provdatumskärmen före landningen.
 */
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { SIGNUP_COOKIE, lasIntent, lasSignupCookie, type SignupIntent } from '@/components/registrering/intent'
import { PROVKALLA_COOKIE, kallaText, lasProvkalla } from '@/lib/analytics/provkalla'
import { sattMittTestFranKalla } from '@/lib/traning/mittTestFranKalla.server'
import ValkommenClient from './ValkommenClient'

export const metadata = { title: 'Kom igång' }

/** Konton äldre än så här räknas inte som nya på valkommen-sidan. */
const NYTT_KONTO_MS = 30 * 60 * 1000

export default async function ValkommenPage() {
  const user = await hamtaVerifieradAnvandare()
  if (!user) redirect('/login')

  const cookieStore = await cookies()
  let signup = lasSignupCookie(cookieStore.get(SIGNUP_COOKIE)?.value)

  let fornamn: string | null = null
  let skapad: number | null = null
  let sparatVal: SignupIntent | null = null
  try {
    const admin = getSupabaseAdmin() as any
    const { data } = await admin
      .from('profiles')
      .select('full_name, created_at, onboarding_intent, onboarding_track_asked_at')
      .eq('id', user.id)
      .maybeSingle()
    const namn = typeof data?.full_name === 'string' ? data.full_name.trim() : ''
    fornamn = namn ? namn.split(/\s+/)[0] : null
    skapad = data?.created_at ? new Date(data.created_at).getTime() : null
    // Valet finns redan sparat men cookien saknas (blockerade kakor, ny
    // flik): förslaget visas ändå, så länge spåret inte är valt.
    if (!data?.onboarding_track_asked_at) sparatVal = lasIntent(data?.onboarding_intent)
  } catch {
    /* ett läsfel får aldrig stoppa landningen */
  }
  if (skapad === null && user.created_at) skapad = new Date(user.created_at).getTime()

  const nytt = skapad !== null && Date.now() - skapad < NYTT_KONTO_MS
  if (!signup && nytt && sparatVal) signup = { intent: sparatVal, entry: 'direkt', skipped: false }

  // Inget pågående registreringsflöde: hemskärmen.
  if (!signup && !nytt) redirect('/dashboard')
  // Befintligt konto utan smakprov att hämta: dit det var på väg.
  if (!nytt && signup && !signup.smakprov) redirect(signup.redirect ?? '/dashboard')

  // Valet från artikeln, bara för nya konton.
  const provkalla = nytt ? lasProvkalla(cookieStore.get(PROVKALLA_COOKIE)?.value) : null
  const mittTest = provkalla ? await sattMittTestFranKalla(getSupabaseAdmin() as any, user.id, provkalla) : null
  const kalla = provkalla
    ? {
        kalla: kallaText(provkalla),
        mittTest: mittTest?.mittTest ?? null,
        satt: mittTest?.satt ?? false,
        surface: provkalla.via === 'hubb' ? ('hubb' as const) : ('artikel' as const),
        provdatumSkarm: mittTest?.provdatumSkarm ?? false,
      }
    : null

  return <ValkommenClient signup={signup} fornamn={fornamn} kalla={kalla} />
}

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
 */
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { SIGNUP_COOKIE, lasSignupCookie } from '@/components/registrering/intent'
import ValkommenClient from './ValkommenClient'

export const metadata = { title: 'Kom igång' }

/** Konton äldre än så här räknas inte som nya på valkommen-sidan. */
const NYTT_KONTO_MS = 30 * 60 * 1000

export default async function ValkommenPage() {
  const user = await hamtaVerifieradAnvandare()
  if (!user) redirect('/login')

  const cookieStore = await cookies()
  const signup = lasSignupCookie(cookieStore.get(SIGNUP_COOKIE)?.value)

  let fornamn: string | null = null
  let skapad: number | null = null
  try {
    const admin = getSupabaseAdmin() as any
    const { data } = await admin
      .from('profiles')
      .select('full_name, created_at')
      .eq('id', user.id)
      .maybeSingle()
    const namn = typeof data?.full_name === 'string' ? data.full_name.trim() : ''
    fornamn = namn ? namn.split(/\s+/)[0] : null
    skapad = data?.created_at ? new Date(data.created_at).getTime() : null
  } catch {
    /* ett läsfel får aldrig stoppa landningen */
  }
  if (skapad === null && user.created_at) skapad = new Date(user.created_at).getTime()

  const nytt = skapad !== null && Date.now() - skapad < NYTT_KONTO_MS

  // Inget pågående registreringsflöde: hemskärmen.
  if (!signup && !nytt) redirect('/dashboard')
  // Befintligt konto utan smakprov att hämta: dit det var på väg.
  if (!nytt && signup && !signup.smakprov) redirect(signup.redirect ?? '/dashboard')

  return <ValkommenClient signup={signup} fornamn={fornamn} />
}

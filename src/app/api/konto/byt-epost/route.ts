// /api/konto/byt-epost
//
// POST {email}: byter e-postadress på den inloggades konto.
//
// Supabase-projektet (Irland) har ingen SMTP, så supabase.auth.updateUser({
// email }) lämnar bytet hängande i new_email utan att något mejl går ut.
// Här skapas bekräftelselänkarna i stället med auth.admin.generateLink och
// skickas med Resend, samma väg som glömt lösenord.
//
//  - Konto med e-post: den nya adressen får en länk (email_change_new) och
//    bytet går igenom i auth.users när den följs (/auth/confirm). Den
//    nuvarande adressen får ett besked utan länk. Säkert e-postbyte är på i
//    projektet, men med mailer_autoconfirm på räcker en bekräftelse för
//    Supabase, se dubbelBekraftelse() i lib/konto/epostbyte.ts.
//  - Konto utan e-post (anonym Nivåkoll som blir konto i appen): det finns
//    ingen nuvarande adress att skapa en länk för. Projektet bekräftar nya
//    konton automatiskt (mailer_autoconfirm), så adressen sätts direkt, precis
//    som vid signUp. Appen sätter lösenordet i nästa steg och behöver då
//    adressen på plats.
//
// 200 {ok, bekraftelse: 'bada' | 'ny' | 'ingen'}. 400 ogiltig_epost eller
// samma_epost, 401 ej inloggad, 409 email_exists, 429 for_manga, 500 fel.

import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { Resend } from 'resend'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { checkIpRateLimit, getClientIp } from '@/lib/rate-limit/ip'
import { epostbyteMejl, type Mottagare } from '@/lib/email/epostbyte'
import { logActivityServer } from '@/lib/activation-tracking'
import { arAppen } from '@/lib/mobilapp/appvag'
import { GRANS_IP, GRANS_KONTO, bekraftelseLank, dubbelBekraftelse, giltigEpost, tokenHashNyAdress } from '@/lib/konto/epostbyte'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Admin = SupabaseClient<any, any, any>

const AVSANDARE = 'Jobbcoach.ai <noreply@jobbcoach.ai>'

function svar(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status })
}

function arUpptagen(err: { code?: unknown; message?: unknown; status?: unknown } | null): boolean {
  if (!err) return false
  return err.code === 'email_exists' || /already been registered|already exists|email_exists/i.test(String(err.message ?? ''))
}

/** Escapar % och _ så att adressen jämförs ordagrant i ilike. */
function ilikeOrdagrant(v: string): string {
  return v.replace(/[\\%_]/g, (c) => `\\${c}`)
}

async function annanAnvanderAdressen(admin: Admin, epost: string, userId: string): Promise<boolean> {
  const { data } = await admin.from('profiles').select('id').ilike('email', ilikeOrdagrant(epost)).limit(5)
  return ((data as { id: string }[] | null) ?? []).some((r) => r.id !== userId)
}

export async function POST(request: NextRequest) {
  let epost: string | null
  try {
    const body = await request.json()
    epost = giltigEpost(body?.email)
  } catch {
    return svar(400, { error: 'ogiltig_epost' })
  }
  if (!epost) return svar(400, { error: 'ogiltig_epost' })

  const supabase = createServerClient({ cookies: await cookies() })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return svar(401, { error: 'Unauthorized' })

  try {
    const admin = getSupabaseAdmin() as unknown as Admin

    // Kontot först: en inloggad med många IP-adresser ska inte komma förbi.
    const perKonto = await checkIpRateLimit(admin, `konto:${user.id}`, 'byt-epost-konto', GRANS_KONTO)
    if (!perKonto.allowed) return svar(429, { error: 'for_manga', resetAt: perKonto.resetAt })
    const perIp = await checkIpRateLimit(admin, getClientIp(request), 'byt-epost-ip', GRANS_IP)
    if (!perIp.allowed) return svar(429, { error: 'for_manga', resetAt: perIp.resetAt })

    const nuvarande = user.email?.toLowerCase() ?? ''
    if (nuvarande && nuvarande === epost) return svar(400, { error: 'samma_epost' })
    if (await annanAnvanderAdressen(admin, epost, user.id)) return svar(409, { error: 'email_exists' })

    if (!user.email) return await utanEpost(admin, user, epost)
    return await medLankar(admin, user, user.email, epost, arAppen(request.headers.get('user-agent')))
  } catch (e) {
    console.error('[konto/byt-epost]', e)
    return svar(500, { error: 'kunde_inte_byta' })
  }
}

/** Anonym Nivåkoll blir konto: adressen sätts direkt (mailer_autoconfirm). */
async function utanEpost(admin: Admin, user: User, epost: string) {
  const { error } = await admin.auth.admin.updateUserById(user.id, { email: epost, email_confirm: true })
  if (arUpptagen(error)) return svar(409, { error: 'email_exists' })
  if (error) throw error
  void logActivityServer(user.id, 'email_changed', 'E-postadress satt på kontot', { bekraftelse: 'ingen' }).catch(() => {})
  return svar(200, { ok: true, bekraftelse: 'ingen' })
}

async function medLankar(admin: Admin, user: User, nuvarande: string, epost: string, appen: boolean) {
  const bada = dubbelBekraftelse()
  // Den nya adressen först: det är den länken som byter adressen. Varje
  // generateLink sparar sin egen token och nollställer bekräftelsestatusen.
  const typer: { typ: 'email_change_current' | 'email_change_new' | null; mottagare: Mottagare; till: string }[] = [
    { typ: 'email_change_new', mottagare: 'ny', till: epost },
    { typ: bada ? 'email_change_current' : null, mottagare: 'nuvarande', till: nuvarande },
  ]

  const lankar: { mottagare: Mottagare; till: string; lank: string | null }[] = []
  for (const t of typer) {
    if (!t.typ) {
      lankar.push({ mottagare: t.mottagare, till: t.till, lank: null })
      continue
    }
    const { data, error } = await admin.auth.admin.generateLink({ type: t.typ, email: nuvarande, newEmail: epost })
    if (arUpptagen(error)) return svar(409, { error: 'email_exists' })
    const otp = data?.properties?.email_otp
    const hash = t.typ === 'email_change_new' && otp ? tokenHashNyAdress(epost, otp) : data?.properties?.hashed_token
    if (error || !hash) throw error ?? new Error('ingen token')
    lankar.push({ mottagare: t.mottagare, till: t.till, lank: bekraftelseLank(hash, appen) })
  }

  const { data: profil } = await admin.from('profiles').select('full_name').eq('id', user.id).maybeSingle()
  const fullName = (profil as { full_name?: string | null } | null)?.full_name ?? null

  const resend = new Resend(process.env.RESEND_API_KEY)
  for (const l of lankar) {
    const mejl = epostbyteMejl({
      mottagare: l.mottagare,
      userId: user.id,
      fullName,
      nuvarandeEpost: nuvarande,
      nyEpost: epost,
      lank: l.lank,
      bada,
    })
    const { error } = await resend.emails.send({ from: AVSANDARE, to: l.till, subject: mejl.subject, html: mejl.html, text: mejl.text })
    if (!error) continue
    // Utan länken går bytet inte att göra; beskedet utan länk får inte fälla det.
    if (l.lank) throw new Error(`Resend: ${error.message}`)
    console.error('[konto/byt-epost] beskedet till den nuvarande adressen gick inte iväg:', error.message)
  }

  const bekraftelse = bada ? 'bada' : 'ny'
  void logActivityServer(user.id, 'email_change_requested', 'Byte av e-postadress begärt', { bekraftelse }).catch(() => {})
  return svar(200, { ok: true, bekraftelse })
}

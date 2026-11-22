// src/lib/konto/raderaKonto.server.ts
// ====================================
// Radera den inloggades konto, på servern. Webbens Inställningar och appens
// kontovy använder samma väg.
//
// Bakgrund: webbens radering anropade auth.admin.deleteUser från webbläsaren.
// Det kräver service role och nekades alltid med användarens nyckel, och
// reserven delete_user_account har aldrig funnits i databasen. Ingen kunde
// alltså radera sitt konto själv. Google Play kräver en fungerande radering
// (Testklar, docs/plan-app.md).
//
// Ordning:
//  1. Levande Stripe-prenumerationer avslutas direkt, så att ingen dras för
//     ett konto som inte finns. Går det inte avbryts raderingen hellre än att
//     kunden fortsätter betala för ett borttaget konto.
//  2. Kontots filer i lagringen tas bort: users/<id>/ i hinkarna cvs
//     (CV-filer och bilagor till Jobbcoachen) och profile-photos, rekursivt.
//     Lagringen kaskaderar inte med kontot: före 2026-11-15 låg filerna kvar
//     efter raderingen. Går det inte avbryts raderingen, så att kunden kan
//     försöka igen i stället för att filer blir kvar utan konto.
//  3. Rader som annars blir kvar utan koppling (ON DELETE SET NULL) tas bort
//     eller tvättas, saas-lead 2026-11-15: email_log, public_letter_drafts,
//     anon_interview_samples, anon_personality_samples och guest_invitations
//     där kontot är gästen raderas; i audit_logs nollas ip-adress, webbläsare,
//     metadata och gamla/nya värden, händelsen och tiden står kvar.
//     system_alerts rörs inte (bär bara administratörers id).
//     email_events (Resends händelser: levererat, öppnat, klickat) har ingen
//     koppling till kontot, bara mottagarens adress och ämnet i payload. Raderna
//     tas bort på kontots e-postadress, läst före raderingen (beslut-agarpunkter,
//     policylistan punkt 2, 2026-11-22: kodändringen som gör policyns
//     "mejlloggen tas bort" sann).
//     Sedan beslut-mejl-och-radering 2c (2026-11-22) också: inbjudningar som
//     kontot skickat (guest_invitations.inviter_id), improved_cvs, rekryterarnas
//     anteckningar, projekt och delningslänkar om kontot som kandidat, och
//     api_metrics. I admin_actions nollas metadata och beskrivning där kontot
//     är målet. email_events tas bort på alla adresser kontot haft: inloggningens,
//     profilens, kontaktadressen och varje mottagare i email_log.
//  4. Auth-användaren tas bort. Raderingen kaskaderar via foreign keys till
//     profiles, premium_grants, app_enheter och resten, som admins radering i
//     api/admin/users/[id].
//  5. Avslutsraden (konto_avslut, beslut-mejl-och-radering 2b): skrivs bara när
//     kontot raderas av användaren själv (opts satt) och bara efter att
//     deleteUser lyckats, så att ett nytt försök aldrig ger två rader. Läses
//     före Stripe, eftersom behörigheten då fortfarande gäller. Undantagna
//     konton ger ingen rad. Ett fel här stoppar aldrig raderingen: saknas
//     tabellen loggas felet och raden hoppas över.
//  6. PostHog: personen och händelserna tas bort, eller köas
//     (posthogRadering.server.ts). Kan inte heller ge ok: false.
//
// En prenumeration i Google Play avslutas inte här; den hanteras i Play och
// kontovyn i appen säger det före bekräftelsen.

import type { SupabaseClient } from '@supabase/supabase-js'
import { lasAvslut, type AvslutOpts } from './avslut.server'
import { raderaIPosthog } from './posthogRadering.server'

const LEVANDE = new Set(['active', 'trialing', 'past_due', 'unpaid', 'incomplete'])

export type RaderaResultat =
  | { ok: true }
  | { ok: false; fel: 'stripe' | 'radering'; detalj: string }

/** Avslutar kundens levande Stripe-prenumerationer. Kastar vid fel. */
async function avslutaStripe(customerId: string): Promise<void> {
  const { stripe } = await import('@/lib/stripe/server')
  const lista = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 20 })
  for (const sub of lista.data) {
    if (LEVANDE.has(sub.status)) await stripe.subscriptions.cancel(sub.id)
  }
}

/**
 * Lagringshinkarna där kontots filer ligger under users/<userId>/:
 * cvs (uppladdade CV:n och bilagor till Jobbcoachen i chat_attachments/)
 * och profile-photos (profilbilden).
 */
export const KONTOTS_HINKAR = ['cvs', 'profile-photos'] as const

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const SIDA = 1000
const MAX_FILER = 10_000

type Lagring = ReturnType<SupabaseClient['storage']['from']>

/**
 * Alla filvägar under mappen, även i undermappar. Lagringens list är inte
 * rekursiv: en undermapp kommer tillbaka som en post utan id.
 */
async function listaFiler(lagring: Lagring, mapp: string, ut: string[]): Promise<void> {
  for (let offset = 0; ; offset += SIDA) {
    const { data, error } = await lagring.list(mapp, { limit: SIDA, offset })
    if (error) throw new Error(error.message)
    const poster = data ?? []
    for (const p of poster) {
      if (!p.name) continue
      const vag = `${mapp}/${p.name}`
      if (p.id === null || p.id === undefined) await listaFiler(lagring, vag, ut)
      else ut.push(vag)
      if (ut.length > MAX_FILER) throw new Error('för många filer att ta bort')
    }
    if (poster.length < SIDA) return
  }
}

/**
 * Tar bort kontots filer: allt under users/<userId>/ i hinkarna ovan, och
 * inget annat. Id:t måste vara ett uuid så att prefixet aldrig kan bli
 * users/ eller en annans mapp. Kastar vid fel. Returnerar antalet borttagna.
 */
export async function raderaKontotsFiler(admin: SupabaseClient, userId: string): Promise<number> {
  if (!UUID.test(userId)) throw new Error('ogiltigt användar-id')
  const mapp = `users/${userId}`
  let borttagna = 0
  for (const hink of KONTOTS_HINKAR) {
    const lagring = admin.storage.from(hink)
    const filer: string[] = []
    await listaFiler(lagring, mapp, filer)
    for (let i = 0; i < filer.length; i += SIDA) {
      const del = filer.slice(i, i + SIDA)
      // Dubbelkoll: varje väg ligger under kontots egen mapp.
      if (del.some((v) => !v.startsWith(`${mapp}/`))) throw new Error('väg utanför kontots mapp')
      const { error } = await lagring.remove(del)
      if (error) throw new Error(error.message)
      borttagna += del.length
    }
  }
  return borttagna
}

/**
 * Rader som inte kaskaderar med kontot (ON DELETE SET NULL) och annars blir
 * kvar med personuppgifter. Varje radering går på kontots id, aldrig bredare.
 */
const LOSA_RADER: ReadonlyArray<{ tabell: string; kolumn: string }> = [
  { tabell: 'email_log', kolumn: 'user_id' },
  { tabell: 'public_letter_drafts', kolumn: 'claimed_by' },
  { tabell: 'anon_interview_samples', kolumn: 'user_id' },
  { tabell: 'anon_interview_samples', kolumn: 'claimed_by' },
  { tabell: 'anon_personality_samples', kolumn: 'user_id' },
  { tabell: 'anon_personality_samples', kolumn: 'claimed_by' },
  { tabell: 'guest_invitations', kolumn: 'guest_user_id' },
  // Utan foreign key mot kontot (beslut-mejl-och-radering 2a och 2c punkt 2).
  { tabell: 'guest_invitations', kolumn: 'inviter_id' },
  { tabell: 'improved_cvs', kolumn: 'user_id' },
  { tabell: 'recruiter_candidate_notes', kolumn: 'candidate_user_id' },
  { tabell: 'recruiter_project_candidates', kolumn: 'candidate_user_id' },
  { tabell: 'recruiter_share_links', kolumn: 'candidate_user_id' },
  { tabell: 'api_metrics', kolumn: 'user_id' },
]

/**
 * Värdena payload->>'to' kan ha i email_events för en adress. Resends webhook
 * sparar data.to som det kom (src/app/api/webhooks/resend/route.ts): en lista
 * med en mottagare, ibland en sträng. Som text blir listan ["adress"]. Vi
 * skickar alltid till en mottagare, så de två formerna täcker kontots rader.
 * Både adressen som den står och med gemener.
 */
export function mottagarvarden(adresser: ReadonlyArray<string | null | undefined>): string[] {
  const ut = new Set<string>()
  for (const a of adresser) {
    const t = a?.trim()
    if (!t || !t.includes('@')) continue
    for (const v of new Set([t, t.toLowerCase()])) {
      ut.add(v)
      ut.add(JSON.stringify([v]))
    }
  }
  return [...ut]
}

/**
 * Kontots e-postadresser före raderingen: inloggningens, profilens,
 * kontaktadressen och varje mottagare i kontots email_log, så att händelser
 * till en adress kontot haft före ett byte också tas bort. Utan `profil`
 * läses profilens adresser här. Läsningen sker före raderingen av email_log.
 * Ett fel i ett uppslag ger färre adresser, aldrig ett avbrott.
 */
export async function kontotsAdresser(
  admin: SupabaseClient,
  userId: string,
  profil?: { email?: string | null; contact_email?: string | null } | null
): Promise<string[]> {
  if (profil === undefined) {
    try {
      const { data } = await admin.from('profiles').select('email, contact_email').eq('id', userId).maybeSingle()
      profil = (data as { email?: string | null; contact_email?: string | null } | null) ?? null
    } catch {
      profil = null
    }
  }
  let authEpost: string | null | undefined
  try {
    const { data } = await admin.auth.admin.getUserById(userId)
    authEpost = data?.user?.email
  } catch {
    authEpost = null
  }
  let loggade: string[] = []
  try {
    const { data } = await admin.from('email_log').select('recipient').eq('user_id', userId)
    loggade = ((data ?? []) as Array<{ recipient?: string | null }>).map((r) => r.recipient ?? '')
  } catch {
    loggade = []
  }
  const ut: string[] = []
  for (const a of [authEpost, profil?.email, profil?.contact_email, ...loggade]) {
    if (typeof a === 'string' && a.length > 0 && !ut.includes(a)) ut.push(a)
  }
  return ut
}

/**
 * Raderar och tvättar kontots lösa rader. Kastar vid fel. `epost` är kontots
 * adresser, lästa före raderingen; utelämnas de läses de här (adminens
 * radering anropar före deleteUser). Utan adress rörs inte email_events.
 */
export async function rensaLosaRader(admin: SupabaseClient, userId: string, epost?: ReadonlyArray<string>): Promise<void> {
  if (!UUID.test(userId)) throw new Error('ogiltigt användar-id')
  const adresser = epost ?? (await kontotsAdresser(admin, userId))
  for (const { tabell, kolumn } of LOSA_RADER) {
    const { error } = await admin.from(tabell).delete().eq(kolumn, userId)
    if (error) throw new Error(`${tabell}: ${error.message}`)
  }
  // Varje radering går på en hel mottagaradress, aldrig ett mönster.
  for (const varde of mottagarvarden(adresser)) {
    const { error } = await admin.from('email_events').delete().eq('payload->>to', varde)
    if (error) throw new Error(`email_events: ${error.message}`)
  }
  const { error } = await admin
    .from('audit_logs')
    .update({ ip_address: null, user_agent: null, old_values: null, new_values: null, metadata: null })
    .eq('user_id', userId)
  if (error) throw new Error(`audit_logs: ${error.message}`)
  // Adminens åtgärder mot kontot står kvar som händelser, men metadata och
  // beskrivning kan bära adressen och nollas (beslut-mejl-och-radering 2c).
  const { error: e2 } = await admin
    .from('admin_actions')
    .update({ metadata: null, description: null })
    .eq('target_user_id', userId)
  if (e2) throw new Error(`admin_actions: ${e2.message}`)
}

export async function raderaKonto(
  admin: SupabaseClient,
  userId: string,
  opts?: AvslutOpts
): Promise<RaderaResultat> {
  const { data: profil } = await admin
    .from('profiles')
    .select('stripe_customer_id, email, contact_email')
    .eq('id', userId)
    .maybeSingle()

  const rad = profil as { stripe_customer_id?: string | null; email?: string | null; contact_email?: string | null } | null
  const customerId = rad?.stripe_customer_id
  // Adresserna läses före allt annat: efter deleteUser finns de inte kvar.
  const epost = await kontotsAdresser(admin, userId, rad ?? null)
  // Avslutsraden läses före Stripe, medan behörigheten fortfarande gäller.
  // Utan opts (adminens radering) skrivs ingen rad. Ett läsfel stoppar aldrig.
  const avslut = opts
    ? await lasAvslut(admin, userId, opts).catch((e) => {
        console.error('[raderaKonto] avslut kunde inte läsas', e instanceof Error ? e.message : String(e))
        return null
      })
    : null
  if (customerId) {
    try {
      await avslutaStripe(customerId)
    } catch (e) {
      const detalj = e instanceof Error ? e.message : String(e)
      console.error('[raderaKonto] Stripe', detalj)
      return { ok: false, fel: 'stripe', detalj }
    }
  }

  try {
    await raderaKontotsFiler(admin, userId)
  } catch (e) {
    const detalj = e instanceof Error ? e.message : String(e)
    console.error('[raderaKonto] filer', detalj)
    return { ok: false, fel: 'radering', detalj }
  }

  try {
    await rensaLosaRader(admin, userId, epost)
  } catch (e) {
    const detalj = e instanceof Error ? e.message : String(e)
    console.error('[raderaKonto] rader', detalj)
    return { ok: false, fel: 'radering', detalj }
  }

  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) {
    console.error('[raderaKonto] deleteUser', error.message)
    return { ok: false, fel: 'radering', detalj: error.message }
  }

  // Kontot är borta. Inget härifrån kan ge ok: false.
  if (avslut) {
    try {
      const { error: e } = await admin.from('konto_avslut').insert(avslut)
      if (e) console.error('[raderaKonto] avslut', e.message)
    } catch (e) {
      console.error('[raderaKonto] avslut', e instanceof Error ? e.message : String(e))
    }
  }
  await raderaIPosthog(admin, userId)
  return { ok: true }
}

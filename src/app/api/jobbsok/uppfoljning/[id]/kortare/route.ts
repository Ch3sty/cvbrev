/**
 * POST /api/jobbsok/uppfoljning/[id]/kortare   "Skriv om kortare" (Jobbsöket F5)
 *
 * Skriver om det oskickade utkastet kortare, en gång per tryck, högst tre
 * gånger per utkast. Till AI:n går bara brödtexten utan hälsning, avslut och
 * namn, maskad med maskForModel (användaren kan ha skrivit in egna
 * uppgifter). Namnet sätts tillbaka av servern. Kostnaden loggas.
 *
 * Kropp: inget.
 * Svar: { success, data: Uppfoljning, omskrivningarKvar }
 * Fel: 404 not_found / utkast_saknas, 409 tak (tre omskrivningar gjorda),
 *      502 ai_fel (texten är orörd, försök igen), 503 migrering_saknas.
 */
import { NextResponse } from 'next/server'
import { captureServer } from '@/lib/analytics/server'
import { maskForModel } from '@/lib/privacy/pii'
import { skrivKortare } from '@/lib/openai/uppfoljningsmejl'
import { ordIMejlet, sattIhop, styckenUrMejl } from '@/lib/jobbsok/uppfoljning'
import { MIGRERING_SAKNAS, admin, agdTjanst, arSchemaFel, felSvar, krav } from '@/lib/jobbsok/rutt'
import { lasTjanstensUppfoljningar, lasUnderlag, loggaKostnad, oskickat } from '@/lib/jobbsok/uppfoljningServer'
import { UPPFOLJNING_MAX_OMSKRIVNINGAR } from '@/lib/jobbsok/typer'

export const maxDuration = 20

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const s = await krav()
  if (s instanceof NextResponse) return s
  const tjanst = await agdTjanst(s.supabase, s.user.id, id)
  if (!tjanst) return felSvar(404, 'not_found', 'Den sökta tjänsten hittades inte')

  const db = admin()
  const lista = await lasTjanstensUppfoljningar(db, s.user.id, id)
  if (lista.error && arSchemaFel(lista.error)) return MIGRERING_SAKNAS()
  const utkast = oskickat(lista.rader)
  if (!utkast?.body || !utkast.subject) return felSvar(404, 'utkast_saknas', 'Det finns inget utkast att skriva om')
  if (utkast.rewrites >= UPPFOLJNING_MAX_OMSKRIVNINGAR) {
    return felSvar(409, 'tak', 'Utkastet har skrivits om tre gånger. Ändra direkt i texten.', { omskrivningarKvar: 0 })
  }

  const { underlag, namn, kanda } = await lasUnderlag(s.supabase, s.user.id, tjanst, s.user.email)
  const mask = (t: string) =>
    maskForModel(t, {
      detectNameHeuristically: false,
      fullName: kanda.namn,
      knownPhones: [kanda.telefon],
    }).text
  const stycken = styckenUrMejl(utkast.body).map(mask)
  const ordForut = ordIMejlet(utkast.body)
  const ai = await skrivKortare(mask(utkast.subject), stycken, underlag.sprak, ordForut)
  await loggaKostnad(s.supabase, s.user.id, ai, 'uppfoljning_kortare', '/api/jobbsok/uppfoljning/[id]/kortare')

  if (!ai.mejl) {
    captureServer('uppfoljning_kortare', s.user.id, { omskrivning: utkast.rewrites + 1, lyckades: false })
    return felSvar(502, 'ai_fel', 'Det gick inte att skriva om just nu. Texten är kvar som den var.', {
      omskrivningarKvar: UPPFOLJNING_MAX_OMSKRIVNINGAR - utkast.rewrites,
    })
  }

  const { data, error } = await db
    .from('job_application_followups')
    .update({
      subject: ai.mejl.subject,
      body: sattIhop(ai.mejl.stycken, underlag.sprak, namn),
      rewrites: utkast.rewrites + 1,
    })
    .eq('id', utkast.id)
    .eq('user_id', s.user.id)
    .select()
    .single()
  if (error || !data) {
    console.error('[uppfoljning] Omskrivningen kunde inte sparas:', error)
    return felSvar(500, 'spara_fel', 'Kunde inte spara omskrivningen')
  }
  captureServer('uppfoljning_kortare', s.user.id, { omskrivning: utkast.rewrites + 1, lyckades: true })
  return NextResponse.json({
    success: true,
    data,
    omskrivningarKvar: Math.max(0, UPPFOLJNING_MAX_OMSKRIVNINGAR - (utkast.rewrites + 1)),
  })
}

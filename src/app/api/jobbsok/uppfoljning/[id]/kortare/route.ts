/**
 * POST /api/jobbsok/uppfoljning/[id]/kortare   "Skriv om kortare" (Jobbsöket F5)
 *
 * Skriver om det oskickade utkastet kortare, en gång per tryck, högst tre
 * gånger per utkast. Till AI:n går bara brödtexten utan hälsning, avslut och
 * namn, maskad med maskForModel och med numrerade märken för det användaren
 * själv har skrivit in (maskaMedMarken); uppgifterna sätts tillbaka ordagrant
 * i svaret. Hälsningen och hela avslutet sätts tillbaka ordagrant som
 * användaren har dem (forberedKortning, sattTillbaka). Kostnaden loggas.
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
import { sattTillbaka } from '@/lib/jobbsok/uppfoljning'
import { amneMedMarken, forberedKortning } from '@/lib/jobbsok/uppfoljningMarken'
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

  // Allt som kan gå fel före skrivningen (underlaget, maskningen, AI:n, svarets
  // validering) ger 502 ai_fel med utkastet orört: ingen rad ändras och
  // rewrites räknas inte upp. Vyn säger då "Det gick inte att skriva om just nu.
  // Din text är kvar."
  const orort = () => {
    captureServer('uppfoljning_kortare', s.user.id, { omskrivning: utkast.rewrites + 1, lyckades: false })
    return felSvar(502, 'ai_fel', 'Det gick inte att skriva om just nu. Din text är kvar.', {
      textOrord: true,
      data: utkast,
      omskrivningarKvar: Math.max(0, UPPFOLJNING_MAX_OMSKRIVNINGAR - utkast.rewrites),
    })
  }

  let nyttAmne: string
  let nyText: string
  try {
    const { underlag, kanda } = await lasUnderlag(s.supabase, s.user.id, tjanst, s.user.email)
    const maskning = { detectNameHeuristically: false, fullName: kanda.namn, knownPhones: [kanda.telefon] }
    // Bara brödtexten går till AI:n. Hälsningen och hela avslutet (namn,
    // telefon, länkar, extra rader) sätts tillbaka ordagrant; känns avslutet
    // inte igen blir utkastet orört. Uppgifter i brödtexten blir numrerade
    // märken ([TELEFON 1]) som sätts tillbaka ordagrant i svaret.
    const kortning = forberedKortning(utkast.body, maskning)
    if (!kortning) return orort()
    const { delar, markt, ordForut } = kortning
    const amne = markt.marken.length > 0 ? amneMedMarken(utkast.subject, maskning) : maskForModel(utkast.subject, maskning).text
    const ai = await skrivKortare(amne, markt.stycken, underlag.sprak, ordForut, markt.marken)
    await loggaKostnad(s.supabase, s.user.id, ai, 'uppfoljning_kortare', '/api/jobbsok/uppfoljning/[id]/kortare').catch(() => {})
    if (!ai.mejl) return orort()
    // Ämnesraden står kvar som användaren har den; bara brödtexten kortas.
    nyttAmne = utkast.subject
    nyText = sattTillbaka(delar, ai.mejl.stycken)
  } catch (err) {
    console.error('[uppfoljning] Skriv om kortare gick fel före skrivningen:', err)
    return orort()
  }

  // Villkoret på rewrites gör att två samtidiga tryck inte räknas som ett.
  const { data, error } = await db
    .from('job_application_followups')
    .update({ subject: nyttAmne, body: nyText, rewrites: utkast.rewrites + 1 })
    .eq('id', utkast.id)
    .eq('user_id', s.user.id)
    .eq('rewrites', utkast.rewrites)
    .is('sent_at', null)
    .select()
    .maybeSingle()
  if (error) {
    console.error('[uppfoljning] Omskrivningen kunde inte sparas:', error)
    return orort()
  }
  if (!data) {
    return felSvar(409, 'andrat_under_tiden', 'Utkastet ändrades under tiden. Din text är kvar.', { textOrord: true })
  }
  captureServer('uppfoljning_kortare', s.user.id, { omskrivning: utkast.rewrites + 1, lyckades: true })
  return NextResponse.json({
    success: true,
    data,
    omskrivningarKvar: Math.max(0, UPPFOLJNING_MAX_OMSKRIVNINGAR - (utkast.rewrites + 1)),
  })
}

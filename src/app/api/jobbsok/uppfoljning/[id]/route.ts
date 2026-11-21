/**
 * Uppföljningsmejlet för en sökt tjänst (Jobbsöket F5). [id] = job_applications.id.
 *
 * GET  /api/jobbsok/uppfoljning/[id]
 *   Läser läget utan att skriva något.
 *   Svar: { success, data: { utkast: Uppfoljning | null, senastSkickad: Uppfoljning | null,
 *           nastaPaminnelse: 'YYYY-MM-DD' | null, sparr: SparrSvar, omskrivningarKvar } }
 *
 * POST /api/jobbsok/uppfoljning/[id]   hämta eller skapa utkastet
 *   Finns ett oskickat utkast returneras det oförändrat (skrivs aldrig om när sidan öppnas igen).
 *   Annars kontrolleras spärren och ett utkast skrivs: AI genom projektets AI-lager
 *   (Gemini, utan personuppgifter, kostnaden i ai_usage_costs), mallen när AI:n inte
 *   svarar inom 8 s eller svaret inte håller. Gratis: kontots enda utkast på samma
 *   tjänst öppnas igen som ett nytt oskickat utkast med samma text (ingen AI).
 *   Svar: { success, data: Uppfoljning, kalla: 'sparat' | 'ai' | 'mall' | 'ateranvant', sparr: SparrSvar }
 *   Fel: 402 premium_required (+ sparr), 429 dygnstak (+ sparr), 404 not_found, 503 migrering_saknas.
 *
 * PUT  /api/jobbsok/uppfoljning/[id]   spara ändrad text
 *   Kropp: { subject, body }   (ämne högst 200 tecken, text högst 4000)
 *   Svar: { success, data: Uppfoljning }
 *   Fel: 400 invalid_field (+ falt), 404 not_found / utkast_saknas, 503 migrering_saknas.
 */
import { NextResponse } from 'next/server'
import { captureServer } from '@/lib/analytics/server'
import { userHasPremiumAccess } from '@/lib/supabase/premiumAccess'
import { nastaPaminnelse } from '@/lib/jobbsok/lage'
import { uppfoljningSparr, valideraMejlText, type SparrSvar } from '@/lib/jobbsok/uppfoljning'
import { MIGRERING_SAKNAS, admin, agdTjanst, arSchemaFel, felSvar, krav, lasKropp } from '@/lib/jobbsok/rutt'
import { lasTjanstensUppfoljningar, lasUnderlag, loggaKostnad, oskickat, skrivUtkast } from '@/lib/jobbsok/uppfoljningServer'
import { UPPFOLJNING_MAX_OMSKRIVNINGAR, type Uppfoljning } from '@/lib/jobbsok/typer'
import type { Klient } from '@/lib/jobbsok/server'

export const maxDuration = 20

type Ctx = { params: Promise<{ id: string }> }

async function sparrFor(db: Klient, supabase: Klient, userId: string, applicationId: string): Promise<{ sparr: SparrSvar; harBetalt: boolean; error: { code?: string } | null }> {
  const [harBetalt, utkastRes] = await Promise.all([
    userHasPremiumAccess(supabase, userId).catch(() => false),
    db.from('job_application_followups').select('application_id, created_at').eq('user_id', userId).not('body', 'is', null),
  ])
  return {
    harBetalt,
    error: utkastRes.error,
    sparr: uppfoljningSparr({
      harBetalt,
      utkast: (utkastRes.data ?? []) as Array<{ application_id: string; created_at: string }>,
      applicationId,
    }),
  }
}

export async function GET(_request: Request, { params }: Ctx) {
  const { id } = await params
  const s = await krav()
  if (s instanceof NextResponse) return s
  const tjanst = await agdTjanst(s.supabase, s.user.id, id)
  if (!tjanst) return felSvar(404, 'not_found', 'Den sökta tjänsten hittades inte')
  const db = admin()
  const [lista, sp] = await Promise.all([lasTjanstensUppfoljningar(db, s.user.id, id), sparrFor(db, s.supabase, s.user.id, id)])
  if (lista.error && arSchemaFel(lista.error)) return MIGRERING_SAKNAS()
  const utkast = oskickat(lista.rader)
  const skickade = lista.rader.filter((r) => r.sent_at).sort((a, b) => (a.sent_at as string).localeCompare(b.sent_at as string))
  const senast = skickade[skickade.length - 1] ?? null
  return NextResponse.json({
    success: true,
    data: {
      utkast,
      senastSkickad: senast,
      nastaPaminnelse: senast?.sent_at ? nastaPaminnelse(senast.sent_at) : null,
      sparr: sp.sparr,
      omskrivningarKvar: utkast ? Math.max(0, UPPFOLJNING_MAX_OMSKRIVNINGAR - utkast.rewrites) : UPPFOLJNING_MAX_OMSKRIVNINGAR,
    },
  })
}

export async function POST(_request: Request, { params }: Ctx) {
  const { id } = await params
  const s = await krav()
  if (s instanceof NextResponse) return s
  const tjanst = await agdTjanst(s.supabase, s.user.id, id)
  if (!tjanst) return felSvar(404, 'not_found', 'Den sökta tjänsten hittades inte')
  const db = admin()

  const lista = await lasTjanstensUppfoljningar(db, s.user.id, id)
  if (lista.error) {
    if (arSchemaFel(lista.error)) return MIGRERING_SAKNAS()
    console.error('[uppfoljning] Kunde inte läsa uppföljningar:', lista.error)
    return felSvar(500, 'las_fel', 'Kunde inte läsa uppföljningen')
  }

  const sp = await sparrFor(db, s.supabase, s.user.id, id)

  // Ett oskickat utkast med text öppnas som det är.
  const befintligt = oskickat(lista.rader)
  if (befintligt?.body) {
    captureServer('uppfoljning_utkast_oppnat', s.user.id, { kalla: 'sparat', premium: sp.harBetalt })
    return NextResponse.json({ success: true, data: befintligt, kalla: 'sparat', sparr: sp.sparr })
  }

  if (sp.sparr.lage === 'premium_required' || sp.sparr.lage === 'dygnstak') {
    captureServer('uppfoljning_sparr', s.user.id, { lage: sp.sparr.lage })
    return sp.sparr.lage === 'premium_required'
      ? felSvar(402, 'premium_required', 'premium_required', { sparr: sp.sparr })
      : felSvar(429, 'dygnstak', 'Dagens utkast är skrivna. Försök igen i morgon.', { sparr: sp.sparr })
  }

  let rad: Uppfoljning | null = null
  let kalla: 'ai' | 'mall' | 'ateranvant'
  let orsak: string | null = null
  let ms: number | undefined

  if (sp.sparr.lage === 'ateranvand') {
    // Gratis: samma tjänsts utkast öppnas igen, utan nytt AI-anrop.
    const forra = [...lista.rader].reverse().find((r) => r.body)
    kalla = 'ateranvant'
    const { data, error } = await db
      .from('job_application_followups')
      .insert({ application_id: id, user_id: s.user.id, subject: forra?.subject ?? null, body: forra?.body ?? null, rewrites: forra?.rewrites ?? 0 })
      .select()
      .single()
    if (error) return skrivfel(error, db, s.user.id, id)
    rad = data as Uppfoljning
  } else {
    const underlag = await lasUnderlag(s.supabase, s.user.id, tjanst, s.user.email)
    const utkast = await skrivUtkast(underlag)
    kalla = utkast.kalla
    orsak = utkast.ai.orsak
    ms = utkast.ai.ms
    await loggaKostnad(s.supabase, s.user.id, utkast.ai, 'uppfoljning_utkast', '/api/jobbsok/uppfoljning/[id]')
    // En rad utan text (bara loggad) kan stå oskickad om den skapats av en äldre klient: fyll den.
    const tomRad = befintligt && !befintligt.body ? befintligt : null
    const { data, error } = tomRad
      ? await db
          .from('job_application_followups')
          .update({ subject: utkast.mejl.subject, body: utkast.mejl.body })
          .eq('id', tomRad.id)
          .eq('user_id', s.user.id)
          .select()
          .single()
      : await db
          .from('job_application_followups')
          .insert({ application_id: id, user_id: s.user.id, subject: utkast.mejl.subject, body: utkast.mejl.body })
          .select()
          .single()
    if (error) return skrivfel(error, db, s.user.id, id)
    rad = data as Uppfoljning
  }

  captureServer('uppfoljning_utkast_oppnat', s.user.id, { kalla, premium: sp.harBetalt, orsak, ms })
  return NextResponse.json({ success: true, data: rad, kalla, sparr: sp.sparr })
}

/** Två samtidiga tryck: det unika indexet (ett oskickat per tjänst) säger nej; den första raden gäller. */
async function skrivfel(error: { code?: string; message?: string }, db: Klient, userId: string, id: string) {
  if (arSchemaFel(error)) return MIGRERING_SAKNAS()
  if (error.code === '23505') {
    const lista = await lasTjanstensUppfoljningar(db, userId, id)
    const rad = oskickat(lista.rader)
    if (rad) return NextResponse.json({ success: true, data: rad, kalla: 'sparat' })
  }
  console.error('[uppfoljning] Kunde inte spara utkastet:', error)
  return felSvar(500, 'spara_fel', 'Kunde inte spara utkastet')
}

export async function PUT(request: Request, { params }: Ctx) {
  const { id } = await params
  const s = await krav()
  if (s instanceof NextResponse) return s
  const tjanst = await agdTjanst(s.supabase, s.user.id, id)
  if (!tjanst) return felSvar(404, 'not_found', 'Den sökta tjänsten hittades inte')
  const kropp = await lasKropp(request)
  if (!kropp) return felSvar(400, 'invalid_body', 'Ogiltig förfrågan')
  const mejl = valideraMejlText(kropp)
  if ('fel' in mejl) return felSvar(400, 'invalid_field', 'Kontrollera texten', { falt: mejl.fel })

  const db = admin()
  const lista = await lasTjanstensUppfoljningar(db, s.user.id, id)
  if (lista.error && arSchemaFel(lista.error)) return MIGRERING_SAKNAS()
  const utkast = oskickat(lista.rader)
  if (!utkast || !utkast.body) return felSvar(404, 'utkast_saknas', 'Det finns inget utkast att spara')

  const { data, error } = await db
    .from('job_application_followups')
    .update({ subject: mejl.subject, body: mejl.body })
    .eq('id', utkast.id)
    .eq('user_id', s.user.id)
    .select()
    .single()
  if (error || !data) {
    console.error('[uppfoljning] Kunde inte spara texten:', error)
    return felSvar(500, 'spara_fel', 'Kunde inte spara texten')
  }
  return NextResponse.json({ success: true, data })
}

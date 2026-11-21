/**
 * Uppföljningsmejlet för en sökt tjänst (Jobbsöket F5, omgång 2). [id] = job_applications.id.
 *
 * Sorten (omgång 2, byggspec 2.5): tjänstens läge avgör vilket mejl som gäller,
 * efter ansökan, efter intervju eller efter provjobb (foljUppTyp). Sorten läses
 * ur ämnesraden (utkastTyp), som alltid är mallens. Ett oskickat utkast av fel
 * sort visas aldrig; det ligger kvar orört tills ett nytt utkast skriver över
 * det på plats.
 *
 * GET  /api/jobbsok/uppfoljning/[id]
 *   Läser läget utan att skriva något.
 *   Svar: { success, data: { typ: 'ansokan' | 'intervju' | 'provjobb' | null, grans: number,
 *           utkast: Uppfoljning | null (bara ett som gäller), senastSkickad: Uppfoljning | null,
 *           nastaPaminnelse: 'YYYY-MM-DD' | null, sparr: SparrSvar, omskrivningarKvar } }
 *
 * POST /api/jobbsok/uppfoljning/[id]   hämta eller skapa utkastet
 *   Inget att följa upp (kallad, erbjudande, avslutad): 409 inget_att_folja_upp, inget skrivs.
 *   Finns ett oskickat utkast som gäller returneras det oförändrat (skrivs aldrig om när sidan öppnas igen).
 *   Annars kontrolleras spärren och ett utkast skrivs: AI genom projektets AI-lager
 *   (Gemini, utan personuppgifter, kostnaden i ai_usage_costs), mallen när AI:n inte
 *   svarar inom 8 s eller svaret inte håller. Gratis: kontots utkast på samma
 *   tjänst och av samma sort öppnas igen som ett nytt oskickat utkast med samma text (ingen AI).
 *   En oskickad rad utan text eller av fel sort skrivs över på plats (rewrites 0).
 *   Svar: { success, data: Uppfoljning, kalla: 'sparat' | 'ai' | 'mall' | 'ateranvant', sparr: SparrSvar, typ }
 *   Fel: 402 premium_required (+ sparr), 429 dygnstak (+ sparr), 404 not_found,
 *        409 inget_att_folja_upp, 503 migrering_saknas.
 *
 * PUT  /api/jobbsok/uppfoljning/[id]   spara ändrad text
 *   Kropp: { subject, body }   (ämne högst 200 tecken, text högst 4000)
 *   Svar: { success, data: Uppfoljning }
 *   Fel: 400 invalid_field (+ falt), 404 not_found / utkast_saknas, 503 migrering_saknas.
 */
import { NextResponse } from 'next/server'
import { captureServer } from '@/lib/analytics/server'
import { userHasPremiumAccess } from '@/lib/supabase/premiumAccess'
import { foljUppTyp, intervjuInfo, nastaPaminnelse, tystGransFor } from '@/lib/jobbsok/lage'
import { uppfoljningSparr, valideraMejlText, type SparrSvar } from '@/lib/jobbsok/uppfoljning'
import { utkastGaller, utkastTyp } from '@/lib/jobbsok/utkastTyp'
import { MIGRERING_SAKNAS, admin, agdTjanst, arSchemaFel, felSvar, krav, lasKropp } from '@/lib/jobbsok/rutt'
import { lasTjanstensUppfoljningar, lasUnderlag, loggaKostnad, oskickat, skrivUtkast } from '@/lib/jobbsok/uppfoljningServer'
import { UPPFOLJNING_MAX_OMSKRIVNINGAR, type Handelse, type JobApplication, type Uppfoljning, type UppfoljningsTyp } from '@/lib/jobbsok/typer'
import type { Klient } from '@/lib/jobbsok/server'

export const maxDuration = 20

type Ctx = { params: Promise<{ id: string }> }

async function sparrFor(
  db: Klient,
  supabase: Klient,
  userId: string,
  applicationId: string,
  typ: UppfoljningsTyp | null
): Promise<{ sparr: SparrSvar; harBetalt: boolean; error: { code?: string } | null }> {
  const [harBetalt, utkastRes] = await Promise.all([
    userHasPremiumAccess(supabase, userId).catch(() => false),
    db.from('job_application_followups').select('application_id, created_at, subject').eq('user_id', userId).not('body', 'is', null),
  ])
  return {
    harBetalt,
    error: utkastRes.error,
    sparr: uppfoljningSparr({
      harBetalt,
      utkast: (utkastRes.data ?? []) as Array<{ application_id: string; created_at: string; subject: string | null }>,
      applicationId,
      typ: typ ?? undefined,
    }),
  }
}

/** Tjänstens händelser (med sessionen, RLS) och läget de ger: intervjun och sorten. */
async function lasLaget(supabase: Klient, tjanst: JobApplication) {
  const { data } = await supabase.from('job_application_events').select('*').eq('application_id', tjanst.id)
  const handelser = (data ?? []) as Handelse[]
  const info = intervjuInfo(tjanst.current_status, handelser)
  return { handelser, info, typ: foljUppTyp(tjanst.current_status, info) }
}

export async function GET(_request: Request, { params }: Ctx) {
  const { id } = await params
  const s = await krav()
  if (s instanceof NextResponse) return s
  const tjanst = await agdTjanst(s.supabase, s.user.id, id)
  if (!tjanst) return felSvar(404, 'not_found', 'Den sökta tjänsten hittades inte')
  const db = admin()
  const [lista, laget] = await Promise.all([lasTjanstensUppfoljningar(db, s.user.id, id), lasLaget(s.supabase, tjanst)])
  if (lista.error && arSchemaFel(lista.error)) return MIGRERING_SAKNAS()
  const { typ } = laget
  const sp = await sparrFor(db, s.supabase, s.user.id, id, typ)
  const oskickad = oskickat(lista.rader)
  const utkast = utkastGaller(oskickad, typ) ? oskickad : null
  const skickade = lista.rader.filter((r) => r.sent_at).sort((a, b) => (a.sent_at as string).localeCompare(b.sent_at as string))
  const senast = skickade[skickade.length - 1] ?? null
  return NextResponse.json({
    success: true,
    data: {
      typ,
      grans: tystGransFor(typ),
      utkast,
      senastSkickad: senast,
      nastaPaminnelse: senast?.sent_at ? nastaPaminnelse(senast.sent_at, typ) : null,
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

  // Uppföljningarna och händelserna parallellt.
  const [lista, laget] = await Promise.all([lasTjanstensUppfoljningar(db, s.user.id, id), lasLaget(s.supabase, tjanst)])
  if (lista.error) {
    if (arSchemaFel(lista.error)) return MIGRERING_SAKNAS()
    console.error('[uppfoljning] Kunde inte läsa uppföljningar:', lista.error)
    return felSvar(500, 'las_fel', 'Kunde inte läsa uppföljningen')
  }

  const { info, typ } = laget
  if (typ === null) return felSvar(409, 'inget_att_folja_upp', 'Tjänsten har inget att följa upp just nu')

  const sp = await sparrFor(db, s.supabase, s.user.id, id, typ)

  // Ett oskickat utkast som gäller öppnas som det är.
  const befintligt = oskickat(lista.rader)
  if (befintligt && utkastGaller(befintligt, typ)) {
    captureServer('uppfoljning_utkast_oppnat', s.user.id, { kalla: 'sparat', premium: sp.harBetalt, typ })
    return NextResponse.json({ success: true, data: befintligt, kalla: 'sparat', sparr: sp.sparr, typ })
  }

  if (sp.sparr.lage === 'premium_required' || sp.sparr.lage === 'dygnstak') {
    captureServer('uppfoljning_sparr', s.user.id, { lage: sp.sparr.lage, typ })
    return sp.sparr.lage === 'premium_required'
      ? felSvar(402, 'premium_required', 'premium_required', { sparr: sp.sparr })
      : felSvar(429, 'dygnstak', 'Dagens utkast är skrivna. Försök igen i morgon.', { sparr: sp.sparr })
  }

  // En oskickad rad som inte gäller (utan text, eller av fel sort) skrivs över
  // på plats: det unika indexet tillåter bara ett oskickat utkast per tjänst.
  const skriv = async (falt: { subject: string | null; body: string | null; rewrites: number }) =>
    befintligt
      ? db
          .from('job_application_followups')
          .update(falt)
          .eq('id', befintligt.id)
          .eq('user_id', s.user.id)
          .select()
          .single()
      : db
          .from('job_application_followups')
          .insert({ application_id: id, user_id: s.user.id, ...falt })
          .select()
          .single()

  let rad: Uppfoljning | null = null
  let kalla: 'ai' | 'mall' | 'ateranvant'
  let orsak: string | null = null
  let ms: number | undefined

  if (sp.sparr.lage === 'ateranvand') {
    // Gratis: samma tjänsts utkast av samma sort öppnas igen, utan nytt AI-anrop.
    const forra = [...lista.rader].reverse().find((r) => r.body && utkastTyp(r.subject) === typ)
    kalla = 'ateranvant'
    const { data, error } = await skriv({ subject: forra?.subject ?? null, body: forra?.body ?? null, rewrites: forra?.rewrites ?? 0 })
    if (error) return skrivfel(error, db, s.user.id, id, typ)
    rad = data as Uppfoljning
  } else {
    const underlag = await lasUnderlag(s.supabase, s.user.id, tjanst, s.user.email, { typ, momentDag: info?.dag ?? null })
    const utkast = await skrivUtkast(underlag)
    kalla = utkast.kalla
    orsak = utkast.ai.orsak
    ms = utkast.ai.ms
    await loggaKostnad(s.supabase, s.user.id, utkast.ai, 'uppfoljning_utkast', '/api/jobbsok/uppfoljning/[id]')
    const { data, error } = await skriv({ subject: utkast.mejl.subject, body: utkast.mejl.body, rewrites: 0 })
    if (error) return skrivfel(error, db, s.user.id, id, typ)
    rad = data as Uppfoljning
  }

  captureServer('uppfoljning_utkast_oppnat', s.user.id, { kalla, premium: sp.harBetalt, orsak, ms, typ })
  return NextResponse.json({ success: true, data: rad, kalla, sparr: sp.sparr, typ })
}

/** Två samtidiga tryck: det unika indexet (ett oskickat per tjänst) säger nej; den första raden gäller om den är av rätt sort. */
async function skrivfel(error: { code?: string; message?: string }, db: Klient, userId: string, id: string, typ: UppfoljningsTyp) {
  if (arSchemaFel(error)) return MIGRERING_SAKNAS()
  if (error.code === '23505') {
    const lista = await lasTjanstensUppfoljningar(db, userId, id)
    const rad = oskickat(lista.rader)
    if (rad && utkastGaller(rad, typ)) return NextResponse.json({ success: true, data: rad, kalla: 'sparat', typ })
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

  // Sorten bor i ämnesraden: ett ämne som skulle byta sort sparas inte, då står det gamla kvar.
  const subject = utkastTyp(mejl.subject) === utkastTyp(utkast.subject) ? mejl.subject : utkast.subject
  const { data, error } = await db
    .from('job_application_followups')
    .update({ subject, body: mejl.body })
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

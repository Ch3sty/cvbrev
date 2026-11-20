/**
 * Anonym testsession (docs/plan-konvertering.md, C9).
 *
 * POST utan body startar en session: fem slumpade matrislogikfrågor utan
 * facit. POST med { token, answers } rättar den och returnerar resultatet.
 *
 * Typerna utöver matrisen (spec-prov-fler-typer-2026-11-09, saas-leads
 * slutliga beslut 2026-11-10): POST { typ } startar typens prov, och
 * { typ, artikel } startar det prov vars uppgift 1 stod i artikeln
 * (ArtikelProv). Urval, rättning och genomgång i prov-typer.server.ts.
 * IP-gränsen tre prov per dygn gäller alla typer tillsammans.
 *
 * Vad som lämnar servern före registrering: antal rätt, vilka positioner
 * (0 till 4) som blev fel och, när underlaget räcker, andelen som löser
 * flest (prova-percentil.ts). Sedan omgång 3 (beslut A) också facit för
 * exakt en uppgift, vald av servern (oppet-facit.ts), med `variant` och
 * `antal_fel`. Facit för övriga uppgifter gör det aldrig, och startsvaret
 * bär inget facit alls. Ett rättat prov rättas inte om.
 */

import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { checkIpRateLimit, getClientIp, hashIp } from '@/lib/rate-limit/ip'
import {
  ANON_QUESTION_COUNT,
  getAnonSession,
  questionsForToken,
  provSeed,
  artikelSeedMatris,
  felIndex,
  tillOriginalSvar,
  toPublicQuestion,
} from '@/lib/tests/anon-session'
import { arBlandad, BLANDAD_META } from '@/lib/logicTestV7/blanda'
import { BANK_VERSION_META, bankVersion } from '@/lib/logicTestV7/selectQuestions.v7'
import { sparaProvUtfall } from '@/lib/tests/prov-utfall.server'
import { andelSomLoserFlest } from '@/lib/tests/prova-percentil'
import { hamtaProvUtfall } from '@/lib/tests/prova-percentil.server'
import { sparaProvUtfallTyp } from '@/lib/tests/prov-utfall.server'
import { arNyProvTyp, provTypUrAdress, type NyProvTyp } from '@/lib/tests/prov-typer'
import { artikelSeed, felPositioner, lasRefs, lasSvar, publikUppgift, rattaSvar, underlagFor, valjProv, type ProvSvar } from '@/lib/tests/prov-typer.server'
import { oppetFacitMatris, oppetFacitTyp } from '@/lib/tests/oppet-facit.server'

const SLUG = /^[a-z0-9-]{1,100}$/

/** Tre provsessioner per IP och dygn. */
const IP_LIMIT = 3
const SCOPE = 'anon_test'

/**
 * Uppvärmningen (omgång 2, slutkontrollen): provsidans startskärm och
 * artikelns provruta frågar en gång innan besökaren startar, så att
 * funktionen och bankerna redan är laddade när POST kommer. Ingen databas,
 * ingen kvot, inget sparas.
 */
export function GET() {
  return new NextResponse(null, { status: 204, headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: Request) {
  let body: { token?: unknown; answers?: unknown; typ?: unknown; artikel?: unknown } = {}
  try {
    body = await request.json()
  } catch {
    // Tom body betyder "starta en ny session".
  }

  const admin = getSupabaseAdmin() as unknown as SupabaseClient<any>

  const token = typeof body.token === 'string' ? body.token.trim() : undefined
  const hasAnswers = Array.isArray(body.answers)

  // ---- Rätta en pågående session ----
  if (token && hasAnswers) {
    const session = await getAnonSession(admin, token)
    // Ett hämtat prov är låst: svaren på resultatsidan ska stå kvar som de var.
    if (!session || session.claimed_by) {
      return NextResponse.json(
        { error: 'Sessionen finns inte längre eller har gått ut.' },
        { status: 404 }
      )
    }

    // Ett rättat prov rättas inte om (omgång 3, beslut A): svaret byggs ur de
    // sparade svaren och de nya ignoreras. Annars kunde nya svar på samma
    // token öppna facit för en uppgift i taget. En omladdning eller ett nytt
    // försök efter ett nätfel får alltså samma resultat och samma öppna facit.
    const redanRattad = Array.isArray(session.answers) && session.score !== null

    // Typerna utöver matrisen: uppgifterna står som referenser i raden.
    const testKind = (session as { test_kind?: unknown }).test_kind
    if (arNyProvTyp(testKind)) {
      const refs = lasRefs(session.questions)
      if (!refs) {
        return NextResponse.json({ error: 'Sessionen finns inte längre eller har gått ut.' }, { status: 404 })
      }
      let svar: ProvSvar[]
      if (redanRattad) svar = refs.map((_, i) => lasSvar(session.answers)[i] ?? { svar: null, selected: -1, correct: false })
      else {
        const givna = (body.answers as unknown[]).slice(0, refs.length)
        svar = refs.map((r, i) => rattaSvar(r, givna[i]))
      }
      const score = svar.filter((x) => x.correct).length
      if (!redanRattad) {
        await admin.from('anon_test_sessions').update({ answers: svar, score }).eq('token', token).is('claimed_by', null)
        await sparaProvUtfallTyp(admin, token, testKind)
      }
      const utfall = await hamtaProvUtfall(admin, testKind, refs.length)
      return NextResponse.json({
        score,
        total: refs.length,
        fel: felPositioner(svar, refs.length),
        percentile: utfall ? andelSomLoserFlest(score, utfall) : null,
        // Exakt en uppgift med facit, vald av regeln A (oppet-facit.ts).
        ...oppetFacitTyp(refs, svar),
      })
    }

    const seed = provSeed(session)
    const questions = questionsForToken(seed, bankVersion(session.meta))
    // Klienten skickar positionerna hon klickade på. Servern räknar om till
    // originalindex med provets permutation; det är dem som lagras och rättas.
    const answers: number[] = redanRattad
      ? questions.map((_, i) => {
          const a = (session.answers as unknown[])[i]
          return typeof a === 'number' && Number.isInteger(a) ? a : -1
        })
      : tillOriginalSvar(questions, seed, arBlandad(session.meta), (body.answers as unknown[]).slice(0, questions.length))

    let score = 0
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) score += 1
    })

    let utfall: Awaited<ReturnType<typeof hamtaProvUtfall>>
    if (redanRattad) utfall = await hamtaProvUtfall(admin)
    else {
      await admin
        .from('anon_test_sessions')
        .update({ answers, score })
        .eq('token', token)
        .is('claimed_by', null)

      // Utfallet sparas anonymt i prov_utfall, en gång per prov (ägarens
      // beslut 2026-11-09). Databasfunktionen undantar ägaren och testkontona.
      // Utfallen läses samtidigt; det egna provet räknas in vid nästa cache.
      const [, lasta] = await Promise.all([sparaProvUtfall(admin, token), hamtaProvUtfall(admin)])
      utfall = lasta
    }

    return NextResponse.json({
      score,
      total: questions.length,
      // Positionerna som blev fel. Rätt alternativ och regeln bara för den
      // enda öppna uppgiften nedan.
      fel: felIndex(questions, answers),
      // Null tills minst 200 avslutade prov finns: raden döljs då.
      percentile: utfall ? andelSomLoserFlest(score, utfall) : null,
      ...oppetFacitMatris(questions, answers, seed, arBlandad(session.meta)),
    })
  }

  // ---- Starta en ny session ----
  const ip = getClientIp(request)
  const rate = await checkIpRateLimit(admin, ip, SCOPE, IP_LIMIT)
  if (!rate.allowed) {
    return NextResponse.json(
      {
        error: 'rate_limited',
        message:
          'Du har gjort tre prov idag. Skapa ett gratiskonto så tränar du vidare direkt.',
        registerHref: '/register',
        resetAt: rate.resetAt,
      },
      { status: 429 }
    )
  }

  const typ = provTypUrAdress(body.typ)
  if (arNyProvTyp(typ)) return startaTyp(admin, typ, hashIp(ip), typeof body.artikel === 'string' && SLUG.test(body.artikel) ? body.artikel : null)

  // Nya prov får meta.alternativ_blandade: alternativen visas i en ordning
  // seedad på token + frågans id. Uppgift 1 stod i en artikel (ArtikelProv):
  // urvalet och ordningen följer artikelns fasta frö i meta.urval_seed.
  // Token, meta och frågornas id räknas ut här och skrivs i en enda insert
  // (förut insert och en eller två uppdateringar, slutkontrollen omgång 2).
  const artikel = typeof body.artikel === 'string' && SLUG.test(body.artikel) ? body.artikel : null
  const nyToken = randomUUID()
  const meta: Record<string, unknown> = {
    ...BLANDAD_META,
    ...BANK_VERSION_META,
    ...(artikel ? { urval_seed: artikelSeedMatris(artikel), artikel } : {}),
  }
  const seed = provSeed({ token: nyToken, meta })
  // Frågorna härleds deterministiskt ur fröet, så vi sparar bara id:na
  // för spårbarhet. Facit ligger kvar i frågebanken på servern.
  const questions = questionsForToken(seed, bankVersion(meta))
  const { data, error } = await admin
    .from('anon_test_sessions')
    .insert({ token: nyToken, questions: questions.map((q) => q.id), ip_hash: hashIp(ip), meta })
    .select('token, expires_at')
    .single()

  if (error || !data) {
    console.error('[anon-test] Kunde inte skapa session:', error)
    return NextResponse.json(
      { error: 'Kunde inte starta provet just nu. Försök igen om en stund.' },
      { status: 500 }
    )
  }

  const row = data as unknown as { token: string; expires_at: string }

  return NextResponse.json({
    token: row.token,
    questions: questions.map((q) => toPublicQuestion(q, seed, arBlandad(meta))),
    total: ANON_QUESTION_COUNT,
    expiresAt: row.expires_at,
  })
}

/**
 * Startar ett prov i en av typerna utöver matrisen. Med artikel: urvalet
 * seedas på artikeln och uppgift 1 är den som stod i artikelns HTML, med
 * samma ordning på alternativen; resten visas i provets egen ordning.
 */
async function startaTyp(admin: SupabaseClient<any>, typ: NyProvTyp, ipHash: string, artikel: string | null) {
  // Token och urval räknas ut före raden, så att den skrivs i en enda insert
  // (förut insert och sedan en uppdatering med uppgifterna).
  const nyToken = randomUUID()
  const fro = artikel ? artikelSeed(typ, artikel) : null
  const refs = valjProv(typ, fro ?? nyToken, nyToken, fro)
  const uppgifter = refs.map(publikUppgift)
  if (refs.length === 0 || uppgifter.some((u) => !u)) {
    return NextResponse.json({ error: 'Kunde inte starta provet just nu. Försök igen om en stund.' }, { status: 500 })
  }
  const { data, error } = await admin
    .from('anon_test_sessions')
    .insert({
      token: nyToken,
      questions: refs,
      ip_hash: ipHash,
      test_kind: typ,
      meta: { alternativ_blandade: true, prov_typ: typ, ...(artikel ? { artikel } : {}) },
    })
    .select('token, expires_at')
    .single()
  if (error || !data) {
    console.error('[anon-test] Kunde inte skapa session:', error)
    return NextResponse.json({ error: 'Kunde inte starta provet just nu. Försök igen om en stund.' }, { status: 500 })
  }
  const row = data as { token: string; expires_at: string }
  return NextResponse.json({
    token: row.token,
    typ,
    uppgifter,
    underlag: underlagFor(refs),
    total: refs.length,
    expiresAt: row.expires_at,
  })
}

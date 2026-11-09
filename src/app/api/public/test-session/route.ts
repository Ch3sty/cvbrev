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
 * flest (prova-percentil.ts). Facit, vilket alternativ som var rätt och
 * reglerna gör det aldrig (ägarens beslut 2026-11-09).
 */

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
import { arBlandad } from '@/lib/logicTestV7/blanda'
import { bankVersion } from '@/lib/logicTestV7/selectQuestions.v7'
import { skapaMedBlandning } from '@/lib/logicTestV7/fragor.server'
import { sparaProvUtfall } from '@/lib/tests/prov-utfall.server'
import { andelSomLoserFlest } from '@/lib/tests/prova-percentil'
import { hamtaProvUtfall } from '@/lib/tests/prova-percentil.server'
import { sparaProvUtfallTyp } from '@/lib/tests/prov-utfall.server'
import { arNyProvTyp, provTypUrAdress, type NyProvTyp } from '@/lib/tests/prov-typer'
import { artikelSeed, felPositioner, lasRefs, publikUppgift, rattaSvar, underlagFor, valjProv } from '@/lib/tests/prov-typer.server'

const SLUG = /^[a-z0-9-]{1,100}$/

/** Tre provsessioner per IP och dygn. */
const IP_LIMIT = 3
const SCOPE = 'anon_test'

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

    // Typerna utöver matrisen: uppgifterna står som referenser i raden.
    const testKind = (session as { test_kind?: unknown }).test_kind
    if (arNyProvTyp(testKind)) {
      const refs = lasRefs(session.questions)
      if (!refs) {
        return NextResponse.json({ error: 'Sessionen finns inte längre eller har gått ut.' }, { status: 404 })
      }
      const givna = (body.answers as unknown[]).slice(0, refs.length)
      const svar = refs.map((r, i) => rattaSvar(r, givna[i]))
      const score = svar.filter((x) => x.correct).length
      await admin.from('anon_test_sessions').update({ answers: svar, score }).eq('token', token).is('claimed_by', null)
      await sparaProvUtfallTyp(admin, token, testKind)
      const utfall = await hamtaProvUtfall(admin, testKind, refs.length)
      return NextResponse.json({
        score,
        total: refs.length,
        fel: felPositioner(svar, refs.length),
        percentile: utfall ? andelSomLoserFlest(score, utfall) : null,
      })
    }

    const seed = provSeed(session)
    const questions = questionsForToken(seed, bankVersion(session.meta))
    // Klienten skickar positionerna hon klickade på. Servern räknar om till
    // originalindex med provets permutation; det är dem som lagras och rättas.
    const answers = tillOriginalSvar(
      questions,
      seed,
      arBlandad(session.meta),
      (body.answers as unknown[]).slice(0, questions.length)
    )

    let score = 0
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) score += 1
    })

    await admin
      .from('anon_test_sessions')
      .update({ answers, score })
      .eq('token', token)
      .is('claimed_by', null)

    // Utfallet sparas anonymt i prov_utfall, en gång per prov (ägarens
    // beslut 2026-11-09). Databasfunktionen undantar ägaren och testkontona.
    // Utfallen läses samtidigt; det egna provet räknas in vid nästa cache.
    const [, utfall] = await Promise.all([sparaProvUtfall(admin, token), hamtaProvUtfall(admin)])

    return NextResponse.json({
      score,
      total: questions.length,
      // Positionerna som blev fel, aldrig rätt alternativ eller regeln.
      fel: felIndex(questions, answers),
      // Null tills minst 200 avslutade prov finns: raden döljs då.
      percentile: utfall ? andelSomLoserFlest(score, utfall) : null,
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
  // seedad på token + frågans id.
  const { data, error } = await skapaMedBlandning(
    admin,
    'anon_test_sessions',
    { questions: [], ip_hash: hashIp(ip) },
    'token, expires_at, meta'
  )

  if (error || !data) {
    console.error('[anon-test] Kunde inte skapa session:', error)
    return NextResponse.json(
      { error: 'Kunde inte starta provet just nu. Försök igen om en stund.' },
      { status: 500 }
    )
  }

  const row = data as unknown as { token: string; expires_at: string; meta?: unknown }

  // Uppgift 1 stod i en artikel (ArtikelProv): urvalet och ordningen följer
  // artikelns fasta frö, som sparas i meta.urval_seed.
  const artikel = typeof body.artikel === 'string' && SLUG.test(body.artikel) ? body.artikel : null
  if (artikel) {
    const meta = { ...((row.meta as Record<string, unknown> | null) ?? {}), urval_seed: artikelSeedMatris(artikel), artikel }
    await admin.from('anon_test_sessions').update({ meta }).eq('token', row.token)
    row.meta = meta
  }
  const seed = provSeed(row)

  // Frågorna härleds deterministiskt ur fröet, så vi sparar bara id:na
  // för spårbarhet. Facit ligger kvar i frågebanken på servern.
  const questions = questionsForToken(seed, bankVersion(row.meta))
  await admin
    .from('anon_test_sessions')
    .update({ questions: questions.map((q) => q.id) })
    .eq('token', row.token)

  return NextResponse.json({
    token: row.token,
    questions: questions.map((q) => toPublicQuestion(q, seed, arBlandad(row.meta))),
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
  const { data, error } = await admin
    .from('anon_test_sessions')
    .insert({
      questions: [],
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
  const fro = artikel ? artikelSeed(typ, artikel) : null
  const refs = valjProv(typ, fro ?? row.token, row.token, fro)
  const uppgifter = refs.map(publikUppgift)
  if (refs.length === 0 || uppgifter.some((u) => !u)) {
    return NextResponse.json({ error: 'Kunde inte starta provet just nu. Försök igen om en stund.' }, { status: 500 })
  }
  await admin.from('anon_test_sessions').update({ questions: refs }).eq('token', row.token)
  return NextResponse.json({
    token: row.token,
    typ,
    uppgifter,
    underlag: underlagFor(refs),
    total: refs.length,
    expiresAt: row.expires_at,
  })
}

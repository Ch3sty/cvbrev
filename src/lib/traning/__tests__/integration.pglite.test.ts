// @vitest-environment node
//
// Hela testmotorn mot ett lokalt PGlite-schema (prod-schemat för
// testsessionerna + våg 3a:s migreringar): plan, mätning, tre pass och en
// ommätning med simulerade svar, sedan nivåkurvan, serien och milstolparna.
// Plus gratisnivåns spärrar och K1-exemplet (Första veckan).
//
// Kräver @electric-sql/pglite (npm i --no-save @electric-sql/pglite).
// Utan paketet hoppas filen över.

import { beforeAll, describe, expect, it, vi } from 'vitest'
import { pgKlient } from './pgKlient'
import { bankInfo, hittaTraningsfraga } from '../bank.server'
import { permutationForSession, tillVisat, mulberry32, hashString } from '@/lib/logicTestV7/blanda'
import { chansRatt, PASS_TAK } from '../niva'
import { validerPlan } from '../testplan'
import type { Dag } from '../datum'

const SCOPE: Record<string, string | null> = {}
const P = new Map(bankInfo().map((q) => [q.id, q.p]))
vi.mock('@/lib/supabase/premiumAccess', async (orig) => ({
  ...(await orig<typeof import('@/lib/supabase/premiumAccess')>()),
  getUserScope: async (_s: unknown, uid: string) => SCOPE[uid] ?? null,
}))

const { hamtaTraningsstatus, sessionsvy, skapaTraningssession, slutforTraning, svaraTraning, hamtaSession } = await import(
  '../motor.server'
)

let PGlite: (new (opt?: unknown) => any) | null = null
try {
  const paket = '@electric-sql/pglite'
  PGlite = (await import(/* @vite-ignore */ paket)).PGlite
} catch {
  PGlite = null
}

const BETALD = '11111111-1111-4111-8111-111111111111'
const GRATIS = '22222222-2222-4222-8222-222222222222'
const K1 = '33333333-3333-4333-8333-333333333333'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let admin: any
const anvandare = {} as never

/** Flyttar sessionens tider till den simulerade dagen (som postgres, förbi spärren). */
async function sattTid(id: string, dag: Dag, avslutad: boolean) {
  await db.query(
    `update public.logic_test_v4_sessions set created_at = $2::timestamptz, started_at = $2::timestamptz,
       completed_at = case when $3 then $4::timestamptz else completed_at end where id = $1`,
    [id, `${dag}T06:00:00Z`, avslutad, `${dag}T06:10:00Z`]
  )
}

/** En simulerad användare på nivå theta svarar på en fråga i den blandade ordningen. */
function valtIndex(sessionId: string, qid: string, theta: number, p: number, rng: () => number): { visat: number; ratt: boolean } {
  const q = hittaTraningsfraga(qid)!
  const perm = permutationForSession(sessionId, q, true)
  const rattVisat = tillVisat(perm, q.correctAnswer)
  const ratt = rng() < chansRatt(theta, p)
  return { visat: ratt ? rattVisat : (rattVisat + 1 + Math.floor(rng() * 5)) % 6, ratt }
}

async function gor(userId: string, begard: 'matning' | 'pass' | 'riktat' | 'general', dag: Dag, theta: number, opt: { vetInteForsta?: boolean } = {}) {
  const rng = mulberry32(hashString(`${userId}:${dag}:${begard}`))
  const r = await skapaTraningssession({ supabase: anvandare, admin, userId, begard, idag: dag })
  if (!r.ok) return { skapad: r }
  const id = r.vy.id
  await sattTid(id, dag, false)
  let vy = r.vy
  const facitIKlienten = JSON.stringify(vy).includes('correctAnswer')
  let svar = 0
  let senast: Awaited<ReturnType<typeof svaraTraning>> | null = null
  while (vy.aktuell != null) {
    const q = vy.fragor[vy.aktuell]
    const p = P.get(q.id)!
    const vetInte = opt.vetInteForsta && svar === 0
    const v = valtIndex(id, q.id, theta, p, rng)
    senast = await svaraTraning({
      admin,
      userId,
      sessionId: id,
      questionId: q.id,
      selectedIndex: vetInte ? null : v.visat,
      vetInte,
      timeSpent: 20 + Math.floor(rng() * 70),
    })
    expect(senast.ok).toBe(true)
    svar++
    const rad = await hamtaSession(admin, userId, id)
    vy = sessionsvy(rad!)!
    if (svar > 40) throw new Error('slutar aldrig')
  }
  const avslut = await slutforTraning({ admin, userId, sessionId: id, idag: dag })
  expect(avslut.ok).toBe(true)
  await sattTid(id, dag, true)
  return { skapad: r, id, svar, senast, facitIKlienten, avslut: avslut.ok ? avslut.avslut : null }
}

describe.skipIf(!PGlite)('testmotorn mot PGlite', () => {
  beforeAll(async () => {
    // .mjs: typerna som tsc härleder ur JS-filen är för snäva (konton blir never[]).
    const { byggSchema, PARSERS } = (await import('../../../../scripts/testmotorn-pglite-schema.mjs')) as unknown as {
      byggSchema: (db: unknown, opt: { admin?: string[]; konton?: [string, string][] }) => Promise<void>
      PARSERS: unknown
    }
    db = new PGlite!({ parsers: PARSERS })
    await byggSchema(db, {
      konton: [
        [BETALD, 'anna@example.se'],
        [GRATIS, 'bo@example.se'],
        [K1, 'k1@example.se'],
      ],
    })
    admin = pgKlient(db)
    SCOPE[BETALD] = 'allt'
    SCOPE[K1] = 'allt'
    SCOPE[GRATIS] = null
  }, 60_000)

  it('plan, mätning, tre pass och en ommätning: kurvan, serien och milstolparna', async () => {
    // Planen: Matrigma 24 oktober, som i exemplet.
    const plan = validerPlan({ testtyper: ['matris'], leverantor: 'matrigma', provdatum: '2026-10-24' }, '2026-10-06')
    expect(plan.ok).toBe(true)
    const ins = await admin.from('test_planer').insert({ user_id: BETALD, ...(plan.ok ? plan.data : {}) }).select('user_id').single()
    expect(ins.error).toBeNull()

    // Mätningen tisdag 6 oktober: tolv frågor, adaptivt, inga förklaringar under tiden.
    const m = await gor(BETALD, 'matning', '2026-10-06', 5.2)
    expect(m.svar).toBe(12)
    expect(m.facitIKlienten).toBe(false)
    expect(m.senast?.ok && m.senast.aterkoppling).toBeNull()
    expect(m.avslut!.typ).toBe('matning')
    expect(m.avslut!.milstolpe).toBe('forsta_matningen')
    expect(m.avslut!.niva_efter).toBeGreaterThanOrEqual(1)
    expect(m.avslut!.niva_efter).toBeLessThanOrEqual(7.5)
    expect(m.avslut!.budget_s).toBe(68) // Matrigma klassisk
    // Siktet föreslogs och sparades i planen (18 dagar kvar).
    const sikte = await admin.from('test_planer').select('sikte').eq('user_id', BETALD).single()
    expect(sikte.data.sikte).toBe(m.avslut!.sikte)
    expect(sikte.data.sikte).toBeGreaterThan(m.avslut!.niva_efter!)

    // Tre pass, onsdag till fredag. Torsdagens första fråga är "Vet inte".
    const pass = []
    for (const [dag, vetInte] of [['2026-10-07', false], ['2026-10-08', true], ['2026-10-09', false]] as const) {
      const p = await gor(BETALD, 'pass', dag, 5.6, { vetInteForsta: vetInte })
      expect(p.svar).toBe(9)
      expect(p.skapad.ok && p.skapad.vy.variant).toBe('niva')
      // Passet visar rätt svar, regel och misstag efter varje svar.
      expect(p.senast?.ok && p.senast.aterkoppling?.regel).toBeTruthy()
      expect(Math.abs(p.avslut!.niva_efter! - p.avslut!.niva_fore!)).toBeLessThanOrEqual(PASS_TAK + 1e-9)
      pass.push(p)
    }
    expect(pass[2].avslut!.imorgon.text).toMatch(/^I morgon: |^Lördag/)

    // Aldrig samma fråga två dagar i rad.
    const fragor = async (id: string) => ((await hamtaSession(admin, BETALD, id))!.meta as { fragor: string[] }).fragor
    const [f7, f8, f9] = [await fragor(pass[0].id!), await fragor(pass[1].id!), await fragor(pass[2].id!)]
    expect(f8.some((q) => f7.includes(q))).toBe(false)
    expect(f9.some((q) => f8.includes(q))).toBe(false)

    // Ommätningen lördag 10 oktober (Hela paketet).
    const o = await gor(BETALD, 'matning', '2026-10-10', 5.8)
    expect(o.skapad.ok && o.skapad.vy.typ).toBe('ommatning')
    expect(o.avslut!.typ).toBe('ommatning')

    // Nivåkurvan: fem punkter i ordning.
    const status = await hamtaTraningsstatus({ supabase: anvandare, admin, userId: BETALD, idag: '2026-10-10' })
    expect(status.punkter.map((p) => `${p.dag}:${p.typ}`)).toEqual([
      '2026-10-06:matning',
      '2026-10-07:pass',
      '2026-10-08:pass',
      '2026-10-09:pass',
      '2026-10-10:ommatning',
    ])
    console.info('[kurvan]', status.punkter.map((p) => `${p.dag} ${p.typ} ${p.niva}`).join(' | '), '| sikte', m.avslut!.sikte, '| serie', status.serie.dagar, '| märken', status.milstolpar.map((x) => x.nyckel).join(','))
    expect(status.niva).toBe(o.avslut!.niva_efter)
    expect(status.historikLast).toBe(false)
    // Serien: fem dagar i rad, dagens gjord.
    expect(status.serie).toEqual({ dagar: 5, status: 'pagar', gjordIdag: true })
    expect(status.aktivitet).toEqual({ pass: 3, ommatningar: 1, generalrepetitioner: 0, matningar: 1 })
    // Milstolparna: första mätningen, inte Första veckan (fyra dagar).
    expect(status.milstolpar.map((x) => x.nyckel)).toContain('forsta_matningen')
    expect(status.milstolpar.map((x) => x.nyckel)).not.toContain('forsta_veckan')
    expect(status.dagarKvar).toBe(14)
    // Planen: ommätning 13 okt kvar (betalande), generalrepetition 22-23, prov 24.
    const dag = (d: string) => status.plandagar.find((x) => x.dag === d)
    expect(dag('2026-10-08')?.status).toBe('gjord')
    expect(dag('2026-10-13')).toMatchObject({ typ: 'ommatning', status: 'kvar' })
    expect(dag('2026-10-23')?.typ).toBe('general')

    // Frågestatistiken: ett svar per besvarad fråga, bara blandade sessioner.
    const stat = await db.query('select sum(antal)::int as n from public.fraga_statistik')
    expect(stat.rows[0].n).toBe(12 + 27 + 12)
  }, 60_000)

  it('gratisnivån: en mätning, ett grundpass om dagen, resten bakom betalväggen', async () => {
    const m = await gor(GRATIS, 'matning', '2026-10-06', 4.5)
    expect(m.avslut!.niva_efter).not.toBeNull()
    // Ingen plan: siktet föreslås men sparas inte.
    expect(m.avslut!.sikte).not.toBeNull()

    const om = await skapaTraningssession({ supabase: anvandare, admin, userId: GRATIS, begard: 'matning', idag: '2026-10-07' })
    expect(om).toMatchObject({ ok: false, status: 402, beslut: { typ: 'ommatning', feature: 'tests_above_base' } })

    const p = await gor(GRATIS, 'pass', '2026-10-07', 4.5)
    expect(p.skapad.ok && p.skapad.vy.variant).toBe('grund')
    const meta = (await hamtaSession(admin, GRATIS, p.id!))!.meta as { fragor: string[] }
    expect(meta.fragor.every((id) => hittaTraningsfraga(id)!.kalla === 'grund')).toBe(true)

    const igen = await skapaTraningssession({ supabase: anvandare, admin, userId: GRATIS, begard: 'pass', idag: '2026-10-07' })
    expect(igen).toMatchObject({ ok: false, status: 429 })
    const imorgon = await skapaTraningssession({ supabase: anvandare, admin, userId: GRATIS, begard: 'pass', idag: '2026-10-08' })
    expect(imorgon.ok).toBe(true)

    for (const begard of ['riktat', 'general'] as const) {
      const r = await skapaTraningssession({ supabase: anvandare, admin, userId: GRATIS, begard, family: 'Rotation', idag: '2026-10-08' })
      expect(r).toMatchObject({ ok: false, status: 402 })
    }

    // Kurvan utan historik: bara senaste punkten.
    const status = await hamtaTraningsstatus({ supabase: anvandare, admin, userId: GRATIS, idag: '2026-10-08' })
    expect(status.historikLast).toBe(true)
    expect(status.punkter).toHaveLength(1)
    expect(status.plandagar.find((d) => d.typ === 'ommatning')?.status).toBe('last')
  }, 60_000)

  it('K1: mätning tisdag, fem pass och ommätning nästa tisdag ger Första veckan', async () => {
    await admin.from('test_planer').insert({ user_id: K1, testtyper: ['matris'], leverantor: 'matrigma', provdatum: '2026-10-24' }).select('user_id').single()
    await gor(K1, 'matning', '2026-10-06', 5)
    for (const d of ['2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10', '2026-10-12']) {
      const p = await gor(K1, 'pass', d, 5.4)
      expect(p.avslut!.milstolpar).not.toContain('forsta_veckan')
    }
    const lordag = (await hamtaTraningsstatus({ supabase: anvandare, admin, userId: K1, idag: '2026-10-10' })).serie
    expect(lordag.dagar).toBe(5)
    const o = await gor(K1, 'matning', '2026-10-13', 5.6)
    expect(o.avslut!.typ).toBe('ommatning')
    expect(o.avslut!.milstolpar).toContain('forsta_veckan')
    const status = await hamtaTraningsstatus({ supabase: anvandare, admin, userId: K1, idag: '2026-10-13' })
    expect(status.serie.dagar).toBe(7) // 6-10, 12, 13; söndagen är frizon
    expect(status.ovisade).toContain('forsta_veckan')

    // Kvittot visat: visad_at sätts, märket kommer inte igen.
    await admin.from('test_milstolpar').update({ visad_at: new Date().toISOString() }).eq('user_id', K1).eq('nyckel', 'forsta_veckan')
    const efter = await hamtaTraningsstatus({ supabase: anvandare, admin, userId: K1, idag: '2026-10-14' })
    expect(efter.ovisade).not.toContain('forsta_veckan')
  }, 120_000)

  it('servern dömer: fel fråga, dubbelsvar och avslutad session avvisas', async () => {
    const r = await skapaTraningssession({ supabase: anvandare, admin, userId: BETALD, begard: 'pass', idag: '2026-10-12' })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const id = r.vy.id
    const q = r.vy.fragor[0]
    expect(await svaraTraning({ admin, userId: BETALD, sessionId: id, questionId: 'finns-inte', selectedIndex: 0, timeSpent: 5 })).toMatchObject({ ok: false, status: 400 })
    expect(await svaraTraning({ admin, userId: GRATIS, sessionId: id, questionId: q.id, selectedIndex: 0, timeSpent: 5 })).toMatchObject({ ok: false, status: 404 })
    expect((await svaraTraning({ admin, userId: BETALD, sessionId: id, questionId: q.id, selectedIndex: 0, timeSpent: 5 })).ok).toBe(true)
    expect(await svaraTraning({ admin, userId: BETALD, sessionId: id, questionId: q.id, selectedIndex: 1, timeSpent: 5 })).toMatchObject({ ok: false, status: 409 })
    expect(await svaraTraning({ admin, userId: BETALD, sessionId: id, questionId: r.vy.fragor[1].id, selectedIndex: 9, timeSpent: 5 })).toMatchObject({ ok: false, status: 400 })
    // Avslutet med ett svar räcker; sedan går inget mer att svara.
    expect((await slutforTraning({ admin, userId: BETALD, sessionId: id, idag: '2026-10-12' })).ok).toBe(true)
    expect(await svaraTraning({ admin, userId: BETALD, sessionId: id, questionId: r.vy.fragor[1].id, selectedIndex: 0, timeSpent: 5 })).toMatchObject({ ok: false, status: 409 })
    expect(await slutforTraning({ admin, userId: BETALD, sessionId: id, idag: '2026-10-12' })).toMatchObject({ ok: false, status: 409 })
  }, 60_000)
})

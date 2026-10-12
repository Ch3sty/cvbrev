// @vitest-environment node
//
// Våg 3b mot testmotorn i PGlite: en mätning och ett pass körs genom
// motorn (skapa, svara, avsluta, status, sessionen efter avslutet) och
// resultatskärmarnas funktioner ritar det motorn svarade. Det är samma väg
// som passflödet tar i webbläsaren (pass/session, pass/svar, pass/complete,
// status, session GET), utan HTTP.
//
// Kräver @electric-sql/pglite (npm i --no-save @electric-sql/pglite).
// Utan paketet hoppas filen över.

import { beforeAll, describe, expect, it, vi } from 'vitest'
import { pgKlient } from './pgKlient'
import { bankInfo, hittaTraningsfraga } from '../bank.server'
import { permutationForSession, tillVisat, mulberry32, hashString } from '@/lib/logicTestV7/blanda'
import { chansRatt } from '../niva'
import { validerPlan } from '../testplan'
import { matningResultat, ommatningResultat, passResultat } from '../resultat'
import type { Dag } from '../datum'

const SCOPE: Record<string, string | null> = {}
const P = new Map(bankInfo().map((q) => [q.id, q.p]))
vi.mock('@/lib/supabase/premiumAccess', async (orig) => ({
  ...(await orig<typeof import('@/lib/supabase/premiumAccess')>()),
  getUserScope: async (_s: unknown, uid: string) => SCOPE[uid] ?? null,
}))

const { hamtaTraningsstatus, sessionsvy, skapaTraningssession, slutforTraning, svaraTraning, hamtaSession } = await import('../motor.server')

let PGlite: (new (opt?: unknown) => any) | null = null // eslint-disable-line @typescript-eslint/no-explicit-any
try {
  const paket = '@electric-sql/pglite'
  PGlite = (await import(/* @vite-ignore */ paket)).PGlite
} catch {
  PGlite = null
}

const BETALD = '77777777-7777-4777-8777-777777777777'
const GRATIS = '88888888-8888-4888-8888-888888888888'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let admin: any
const anvandare = {} as never

async function sattTid(id: string, dag: Dag, avslutad: boolean) {
  await db.query(
    `update public.logic_test_v4_sessions set created_at = $2::timestamptz, started_at = $2::timestamptz,
       completed_at = case when $3 then $4::timestamptz else completed_at end where id = $1`,
    [id, `${dag}T06:00:00Z`, avslutad, `${dag}T06:10:00Z`]
  )
}

/** Kör en session genom motorn som klienten gör, och returnerar det resultatskärmen får. */
async function kor(userId: string, begard: 'matning' | 'pass', dag: Dag, theta: number) {
  const rng = mulberry32(hashString(`${userId}:${dag}:${begard}:3b`))
  const r = await skapaTraningssession({ supabase: anvandare, admin, userId, begard, idag: dag })
  if (!r.ok) throw new Error(`skapades inte: ${r.fel}`)
  const id = r.vy.id
  await sattTid(id, dag, false)
  let vy = r.vy
  let n = 0
  while (vy.aktuell != null) {
    const q = vy.fragor[vy.aktuell]
    const bank = hittaTraningsfraga(q.id)!
    const rattVisat = tillVisat(permutationForSession(id, bank, true), bank.correctAnswer)
    const ratt = rng() < chansRatt(theta, P.get(q.id)!)
    const s = await svaraTraning({
      admin,
      userId,
      sessionId: id,
      questionId: q.id,
      selectedIndex: ratt ? rattVisat : (rattVisat + 1) % 6,
      timeSpent: 25 + Math.floor(rng() * 60),
    })
    if (!s.ok) throw new Error(`svaret: ${s.fel}`)
    vy = sessionsvy((await hamtaSession(admin, userId, id))!)!
    if (++n > 30) throw new Error('slutar aldrig')
  }
  const a = await slutforTraning({ admin, userId, sessionId: id, idag: dag })
  if (!a.ok) throw new Error(`avslutet: ${a.fel}`)
  await sattTid(id, dag, true)
  const efter = sessionsvy((await hamtaSession(admin, userId, id))!)!
  const status = await hamtaTraningsstatus({ supabase: anvandare, admin, userId, idag: dag })
  return { avslut: a.avslut, vy: efter, status }
}

describe.skipIf(!PGlite)('resultatskärmarna mot testmotorn i PGlite', () => {
  beforeAll(async () => {
    const { byggSchema, PARSERS } = (await import('../../../../scripts/testmotorn-pglite-schema.mjs')) as unknown as {
      byggSchema: (db: unknown, opt: { admin?: string[]; konton?: [string, string][] }) => Promise<void>
      PARSERS: unknown
    }
    db = new PGlite!({ parsers: PARSERS })
    await byggSchema(db, { konton: [[BETALD, 'betald@example.se'], [GRATIS, 'gratis@example.se']] })
    admin = pgKlient(db)
    SCOPE[BETALD] = 'allt'
    SCOPE[GRATIS] = null
    for (const uid of [BETALD, GRATIS]) {
      const plan = validerPlan({ testtyper: ['matris'], leverantor: 'matrigma', provdatum: '2026-10-24' }, '2026-10-06')
      if (!plan.ok) throw new Error('planen')
      await admin.from('test_planer').insert({ user_id: uid, ...plan.data })
    }
  }, 60_000)

  it('M1 för betalande och gratis: nivån som heltal, planen, betalväggen bara för gratis', async () => {
    const b = await kor(BETALD, 'matning', '2026-10-06', 5.2)
    expect(b.avslut.typ).toBe('matning')
    const mb = matningResultat(b.avslut, b.status, true)
    expect(mb.heltal).toBe(Math.floor(b.avslut.niva_efter!))
    expect(mb.tal[0].varde).toBe(`${b.avslut.ratt} av ${b.avslut.antal}`)
    expect(mb.betalvagg).toBeNull()
    expect(mb.plan[0].titel).toBe('I dag: Nivåkollen')
    expect(mb.plan.at(-1)?.titel).toBe('24 okt: provdagen')
    expect(mb.planRubrik).toBe('Planen fram till 24 oktober')

    const g = await kor(GRATIS, 'matning', '2026-10-06', 4.5)
    const mg = matningResultat(g.avslut, g.status, false)
    expect(mg.betalvagg?.knapp).toMatch(/^Köp .+, 149 kr i månaden$/)
    expect(mg.plan[1].titel).toBe('I dag: ett grundpass')
    // 17.2: passdagarna efter i dag, ommätningen och generalrepetitionen är låsta.
    expect(mg.plan.filter((p) => p.last).length).toBe(3)
  }, 60_000)

  it('P4 efter ett pass: rubriken följer nivån, staplarna och genomgången följer svaren', async () => {
    const p = await kor(BETALD, 'pass', '2026-10-07', 5.6)
    expect(p.avslut.typ).toBe('pass')
    const r = passResultat(p.avslut, p.vy, p.status)
    const { ratt, antal } = p.avslut
    expect(r.rubrik.startsWith(`${ratt} av ${antal} rätt.`)).toBe(true)
    if (r.riktning === 'upp') expect(r.rubrik).toContain('Nivån steg till')
    if (r.riktning === 'ner') expect(r.rubrik).toContain('ner')
    expect(r.kort.staplar.staplar.length).toBe(antal)
    // Genomgången räknar samma rätt som motorn.
    expect(r.genomgang.ratt).toBe(ratt)
    expect(r.genomgang.rader.length).toBe(antal - ratt)
    // Raden efter passet: serien och I morgon.
    expect(r.status).toMatch(/dagar i rad\.|Serien/)
    expect(r.status).toMatch(/I morgon: |Söndag är vilodag/)
    // Ingen facit i klientens sessionsvy före avslutet, genomgången efter.
    expect(p.vy.genomgang?.length).toBe(antal)
  }, 60_000)

  it('O1 efter ommätningen: rubriken jämför med passen, förflyttningen räknas från mätningen', async () => {
    await kor(BETALD, 'pass', '2026-10-08', 5.6)
    const o = await kor(BETALD, 'matning', '2026-10-13', 5.8)
    expect(o.avslut.typ).toBe('ommatning')
    const r = ommatningResultat(o.avslut, o.status)
    expect(r.rubrik).toMatch(/^\d,\d\. /)
    expect(r.forsta?.dag).toBe('2026-10-06')
    expect(r.tal[1].etikett).toBe('på en vecka')
    expect(r.status).toMatch(/Nästa nivåkoll tisdag 20 oktober\./)
  }, 60_000)
})

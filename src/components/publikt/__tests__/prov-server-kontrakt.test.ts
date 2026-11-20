// @vitest-environment node
/**
 * Serversidan av de publika proven, omgång 2 steg C. Ombyggnaden av
 * vyerna får inte ändra vad som lämnar servern före claim:
 *
 *  - POST /api/public/test-session: starten ger uppgifterna utan facit,
 *    { typ, artikel } ger artikelns uppgift 1 först (samma som i HTML:en),
 *    rättningen svarar { score, total, fel, percentile } och sedan omgång 3
 *    { variant, antal_fel, oppet_facit } (en uppgift, oppet-facit-kontrakt),
 *    ett hämtat prov rättas inte om, och gränsen ger 429 med registerHref.
 *  - hamtaProvResultat (registreringens panel): bara { ratt, totalt, fel, typ }.
 *  - POST /api/public/personlighetsprov: profilen utan råpoäng och
 *    kravprofiler, href bara för inloggad.
 *  - Registreringens adresser /register?test=<token> och
 *    /register?personlighet=<token> blir smakprov som sparas i fliken.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

/* ------------------------------------------------------------ fejkad databas */

type Rad = Record<string, unknown>
const db = {
  anonSession: null as Rad | null,
  personlighetFinns: null as Rad | null,
  rateAllowed: true,
  user: null as { id: string } | null,
  uppdateringar: [] as Array<{ table: string; payload: Rad }>,
}
const TOKEN = '33333333-4444-4555-8666-777777777777'

function fakeAdmin() {
  return {
    from(table: string) {
      const q: { op: string | null; payload: Rad | null } = { op: null, payload: null }
      const svar = () => {
        if (q.op === 'insert' && table === 'anon_test_sessions') {
          return { data: { token: TOKEN, expires_at: '2026-11-27T00:00:00Z', meta: q.payload?.meta ?? null }, error: null }
        }
        if (q.op === 'insert' && table === 'anon_personality_samples') {
          return { data: { token: q.payload?.token, expires_at: db.user ? null : '2026-11-27T00:00:00Z' }, error: null }
        }
        if (table === 'anon_personality_samples') return { data: db.personlighetFinns, error: null }
        return { data: null, error: null }
      }
      const b: Record<string, unknown> = {
        insert: (p: Rad) => ((q.op = 'insert'), (q.payload = p), b),
        update: (p: Rad) => {
          q.op = 'update'
          q.payload = p
          db.uppdateringar.push({ table, payload: p })
          return b
        },
        select: () => b,
        eq: () => b,
        is: () => b,
        single: () => Promise.resolve(svar()),
        maybeSingle: () => Promise.resolve(svar()),
        then: (res: (v: unknown) => unknown, rej?: (e: unknown) => unknown) => Promise.resolve({ data: null, error: null }).then(res, rej),
      }
      return b
    },
  }
}

vi.mock('server-only', () => ({}))
// Rutten räknar ut token före raden (slutkontrollen omgång 2). Fast token
// håller urvalet deterministiskt: ordförrådets ord "regel" träffar annars FACIT.
vi.mock('node:crypto', async (orig) => {
  const m = await orig<typeof import('node:crypto')>()
  return { ...m, default: m, randomUUID: () => '33333333-4444-4555-8666-777777777777' }
})
vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdmin: () => fakeAdmin() }))
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: () => ({ auth: { getUser: async () => ({ data: { user: db.user } }) } }),
}))
vi.mock('next/headers', () => ({ cookies: async () => ({ getAll: () => [], get: () => undefined, set: () => {} }) }))
vi.mock('@/lib/rate-limit/ip', () => ({
  getClientIp: () => '127.0.0.1',
  hashIp: () => 'hash',
  checkIpRateLimit: async () => ({ allowed: db.rateAllowed, resetAt: '2026-11-21T00:00:00Z', remaining: 0 }),
}))
vi.mock('@/lib/tests/prov-utfall.server', () => ({ sparaProvUtfall: async () => {}, sparaProvUtfallTyp: async () => {} }))
vi.mock('@/lib/tests/prova-percentil.server', () => ({ hamtaProvUtfall: async () => null }))
vi.mock('@/lib/tests/anon-session', async (orig) => ({
  ...(await orig<typeof import('@/lib/tests/anon-session')>()),
  getAnonSession: async () => db.anonSession,
}))

import { POST as testSession } from '@/app/api/public/test-session/route'
import { POST as personlighetsprov } from '@/app/api/public/personlighetsprov/route'
import { hamtaProvResultat } from '@/lib/tests/prov-resultat.server'
import { artikelUppgift, valjProv, genomgaProv, rattaSvar } from '@/lib/tests/prov-typer.server'
import { SMAKPROV_PASTAENDEN } from '@/lib/personlighet/smakprov-pastaenden'
import { registerIngang, smakprovUrParams } from '@/components/registrering/intent'

const FACIT = /correctAnswer|correctAnswerId|"rattVisat"|"regel"|"rule"|"explanation"|"forklaring"|"losning"|"misstag"|"genomgang"|"correct"|"stod":|"narmast":|"slutsats":|"anvander":|"termnamn":|"atomnamn":|"ledNamn":|"vnFacit":|"roller":|"formell":/

function req(body?: unknown) {
  return new Request('http://localhost/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
}

beforeEach(() => {
  db.anonSession = null
  db.personlighetFinns = null
  db.rateAllowed = true
  db.user = null
  db.uppdateringar = []
})

describe('POST /api/public/test-session, starten', () => {
  it('matrisen utan kropp: token, fem frågor med rutnät och alternativ, inget facit', async () => {
    const res = await testSession(req())
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.token).toBe(TOKEN)
    expect(data.total).toBe(5)
    expect(data.questions).toHaveLength(5)
    for (const q of data.questions) expect(Object.keys(q).sort()).toEqual(['grid', 'id', 'options'])
    expect(JSON.stringify(data)).not.toMatch(FACIT)
  })

  it.each(['figurserie', 'verbal', 'numerisk', 'deduktiv', 'spatial', 'talserie', 'ordforrad', 'iprov'])('typen %s: uppgifterna utan facit', async (typ) => {
    const res = await testSession(req({ typ }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toMatchObject({ token: TOKEN, typ })
    expect(data.uppgifter.length).toBe(data.total)
    expect(JSON.stringify(data)).not.toMatch(FACIT)
  })

  it.each<[string, string]>([
    ['talserie', 'talserier'],
    ['verbal', 'verbalt-test-guide'],
    ['iprov', 'i-prov'],
    ['spatial', 'rotation-test-guide'],
  ])('{ typ: %s, artikel }: uppgift 1 är artikelns serverrenderade uppgift', async (typ, artikel) => {
    const res = await testSession(req({ typ, artikel }))
    const data = await res.json()
    const forsta = artikelUppgift(typ as never, artikel)!
    expect(data.uppgifter[0].nyckel).toBe(forsta.uppgift.nyckel)
    expect(data.uppgifter[0]).toEqual(forsta.uppgift)
    expect(JSON.stringify(data)).not.toMatch(FACIT)
  })

  it('gränsen: 429 med meddelande och registerHref', async () => {
    db.rateAllowed = false
    const res = await testSession(req({ typ: 'talserie', artikel: 'talserier' }))
    expect(res.status).toBe(429)
    const data = await res.json()
    expect(data).toMatchObject({ error: 'rate_limited', registerHref: '/register' })
    expect(typeof data.message).toBe('string')
  })
})

// Omgång 3, beslut A: rättningen bär sedan dess också variant, antal_fel och
// oppet_facit (exakt en uppgift). Regeln prövas för alla typer och varianter i
// oppet-facit-kontrakt.test.ts; här låses bara nycklarna.
const RATTNINGENS_NYCKLAR = ['antal_fel', 'fel', 'oppet_facit', 'percentile', 'score', 'total', 'variant']

describe('POST /api/public/test-session, rättningen', () => {
  it('typerna: score, total, fel, percentile och ett öppet facit', async () => {
    const refs = valjProv('talserie', TOKEN, TOKEN)
    db.anonSession = { token: TOKEN, test_kind: 'talserie', questions: refs, answers: null, score: null, claimed_by: null, meta: {} }
    const facit = genomgaProv(refs, refs.map(() => ({ svar: null, selected: -1, correct: false })))
    const ratt = facit.map((g) => String((g.genomgang as { rattVisat: number }).rattVisat))
    ratt[2] = ratt[2] === '0' ? '1' : '0'
    expect(rattaSvar(refs[2], ratt[2]).correct).toBe(false)
    const res = await testSession(req({ token: TOKEN, answers: ratt }))
    const data = await res.json()
    expect(Object.keys(data).sort()).toEqual(RATTNINGENS_NYCKLAR)
    expect(data).toMatchObject({ score: 4, total: 5, fel: [2], percentile: null, variant: 'en', antal_fel: 1 })
    // En miss: facit öppnas på första uppgiften hon klarade, missen förblir låst.
    expect(data.oppet_facit.index).toBe(0)
  })

  it('matrisen: score, total, fel, percentile och ett öppet facit', async () => {
    db.anonSession = { token: TOKEN, questions: [], answers: null, score: null, claimed_by: null, meta: { alternativ_blandade: true, bank_version: 2 } }
    const res = await testSession(req({ token: TOKEN, answers: [0, 0, 0, 0, 0] }))
    const data = await res.json()
    expect(Object.keys(data).sort()).toEqual(RATTNINGENS_NYCKLAR)
    expect(data.total).toBe(5)
  })

  it('ett hämtat prov rättas inte om (404)', async () => {
    db.anonSession = { token: TOKEN, questions: [], answers: [0], score: 1, claimed_by: 'user-1', meta: {} }
    const res = await testSession(req({ token: TOKEN, answers: [0, 0, 0, 0, 0] }))
    expect(res.status).toBe(404)
  })
})

describe('registreringens panel (hamtaProvResultat)', () => {
  it('bara ratt, totalt, fel och typ, aldrig facit eller frågorna', async () => {
    const refs = valjProv('numerisk', TOKEN, TOKEN)
    db.anonSession = {
      token: TOKEN,
      test_kind: 'numerisk',
      questions: refs,
      answers: refs.map((_, i) => ({ svar: 'x', selected: 0, correct: i !== 1 })),
      score: 4,
      claimed_by: null,
      meta: {},
    }
    const r = await hamtaProvResultat(fakeAdmin() as never, TOKEN, '127.0.0.1')
    expect(r).toEqual({ ratt: 4, totalt: 5, fel: [1], typ: 'numerisk' })
  })

  it('ett hämtat prov ger null (panelen utan tal)', async () => {
    db.anonSession = { token: TOKEN, questions: [], answers: [0], score: 1, claimed_by: 'user-1', meta: {} }
    expect(await hamtaProvResultat(fakeAdmin() as never, TOKEN, '127.0.0.1')).toBeNull()
  })
})

describe('POST /api/public/personlighetsprov', () => {
  const kropp = (token: string) => ({
    token,
    answers: SMAKPROV_PASTAENDEN.map((p) => ({ id: p.id, value: 4 })),
    slug: 'map-test-personlighetstest',
  })

  it('besökaren: profilen utan råpoäng, kravprofiler eller href', async () => {
    const t = '44444444-5555-4666-8777-888888888888'
    const res = await personlighetsprov(req(kropp(t)))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Object.keys(data).sort()).toEqual(['expiresAt', 'faktorer', 'lockedCounts', 'mening', 'token'])
    expect(data.token).toBe(t)
    expect(data.faktorer).toHaveLength(5)
    for (const f of data.faktorer) expect(Object.keys(f).sort()).toEqual(['band', 'bandOrd', 'key', 'lasning', 'namn', 'segment'])
    // lockedCounts är bara antal platshållarrader; inga poäng och inga listor med innehåll.
    expect(data.lockedCounts).toEqual({ krav: 6, intervju: 5, omvanda: 3 })
    expect(JSON.stringify(data)).not.toMatch(/"scores"|"raw|"answers"/i)
  })

  it('inloggad: href till profilen', async () => {
    db.user = { id: 'user-1' }
    const t = '55555555-6666-4777-8888-999999999999'
    const data = await (await personlighetsprov(req(kropp(t)))).json()
    expect(typeof data.href).toBe('string')
    expect(data.href).toContain(t)
  })

  it('ogiltig kropp (fel antal svar) ger 400', async () => {
    const t = '66666666-7777-4888-8999-aaaaaaaaaaaa'
    const res = await personlighetsprov(req({ ...kropp(t), answers: kropp(t).answers.slice(1) }))
    expect(res.status).toBe(400)
  })

  it('gränsen: 429 med registerHref', async () => {
    db.rateAllowed = false
    const res = await personlighetsprov(req(kropp('77777777-8888-4999-8aaa-bbbbbbbbbbbb')))
    expect(res.status).toBe(429)
    expect(await res.json()).toMatchObject({ error: 'rate_limited', registerHref: '/register' })
  })
})

describe('registreringens adresser', () => {
  const ur = (q: string) => {
    const p = new URLSearchParams(q)
    return (n: string) => p.get(n)
  }

  it('/register?test=<token> och /register?personlighet=<token> blir smakprov', () => {
    expect(smakprovUrParams(ur(`test=${TOKEN}`))).toEqual({ typ: 'test', token: TOKEN })
    expect(smakprovUrParams(ur(`personlighet=${TOKEN}`))).toEqual({ typ: 'personlighet', token: TOKEN })
    expect(registerIngang(ur(`test=${TOKEN}`)).lage).toBe('smakprov')
    expect(registerIngang(ur(`personlighet=${TOKEN}`)).lage).toBe('smakprov')
  })
})

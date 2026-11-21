// @vitest-environment node
/**
 * Omgång 3, beslut A: ett öppet facit i de publika proven. Rättningen i
 * POST /api/public/test-session lämnar facit för exakt en uppgift, vald av
 * servern:
 *
 *   två eller fler missar   den första missen
 *   en miss                 den första uppgift hon klarade
 *   noll missar             den första uppgiften
 *
 * Prövas för matrisen och alla åtta typer rutten stöder, i alla tre
 * varianterna: exakt en uppgift har facit, det är rätt uppgift och samma
 * facit som genomgången efter kontot (genomgaProv) eller de inloggade
 * matristesterna (genomgaFraga, misstagFor) bygger, resten av svaret saknar
 * varje facitnyckel och varje facittext från de andra uppgifterna, en ny
 * hämtning för samma session ger samma val, och startsvaret är oförändrat.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

/* ------------------------------------------------------------ fejkad databas */

type Rad = Record<string, unknown>
const db = {
  anonSession: null as Rad | null,
  uppdateringar: [] as Array<{ table: string; payload: Rad }>,
}
const TOKEN = '33333333-4444-4555-8666-777777777777'

function fakeAdmin() {
  return {
    from(table: string) {
      const q: { op: string | null; payload: Rad | null } = { op: null, payload: null }
      const svar = () => {
        if (q.op === 'insert' && table === 'anon_test_sessions') {
          return { data: { token: TOKEN, expires_at: '2026-11-27T00:00:00Z' }, error: null }
        }
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
vi.mock('node:crypto', async (orig) => {
  const m = await orig<typeof import('node:crypto')>()
  return { ...m, default: m, randomUUID: () => '33333333-4444-4555-8666-777777777777' }
})
vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdmin: () => fakeAdmin() }))
vi.mock('@/lib/rate-limit/ip', () => ({
  getClientIp: () => '127.0.0.1',
  hashIp: () => 'hash',
  checkIpRateLimit: async () => ({ allowed: true, resetAt: '2026-11-21T00:00:00Z', remaining: 0 }),
}))
vi.mock('@/lib/tests/prov-utfall.server', () => ({ sparaProvUtfall: async () => {}, sparaProvUtfallTyp: async () => {} }))
vi.mock('@/lib/tests/prova-percentil.server', () => ({ hamtaProvUtfall: async () => null }))
vi.mock('@/lib/tests/anon-session', async (orig) => ({
  ...(await orig<typeof import('@/lib/tests/anon-session')>()),
  getAnonSession: async () => db.anonSession,
}))

import { POST as testSession } from '@/app/api/public/test-session/route'
import { genomgaProv, publikUppgift, rattaSvar, valjProv, type ProvRef } from '@/lib/tests/prov-typer.server'
import { questionsForToken } from '@/lib/tests/anon-session'
import { bankVersion } from '@/lib/logicTestV7/selectQuestions.v7'
import { permutationForSession, tillOriginal, tillVisat } from '@/lib/logicTestV7/blanda'
import { genomgaFraga } from '@/lib/logicTestV7/visning'
import { misstagFor } from '@/lib/traning/bank.server'
import { valjOppetFacit } from '@/lib/tests/oppet-facit'
import type { NyProvTyp } from '@/lib/tests/prov-typer'

/** Nycklarna de befintliga kontrakttesterna letar efter (prov-server-kontrakt och omgang3-facit-kontrakt). */
const FACITNYCKLAR = new Set([
  'correctAnswer', 'correctAnswerId', 'rattVisat', 'regel', 'rule', 'explanation', 'forklaring', 'losning', 'misstag',
  'genomgang', 'correct', 'stod', 'narmast', 'slutsats', 'anvander', 'termnamn', 'atomnamn', 'ledNamn', 'vnFacit',
  'roller', 'formell', 'steg', 'facit_betyder',
])

/** Alla nycklar i ett värde, rekursivt, med sökvägen. */
function nycklar(v: unknown, vag = ''): string[] {
  if (Array.isArray(v)) return v.flatMap((x, i) => nycklar(x, `${vag}[${i}]`))
  if (!v || typeof v !== 'object') return []
  return Object.entries(v).flatMap(([k, x]) => [`${vag}.${k}`, ...nycklar(x, `${vag}.${k}`)])
}

/** Texterna under facitnycklar i ett värde, rekursivt. */
function facittexter(v: unknown, under = false): string[] {
  if (typeof v === 'string') return under ? [v] : []
  if (Array.isArray(v)) return v.flatMap((x) => facittexter(x, under))
  if (!v || typeof v !== 'object') return []
  return Object.entries(v).flatMap(([k, x]) => facittexter(x, under || FACITNYCKLAR.has(k)))
}

function req(body?: unknown) {
  return new Request('http://localhost/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
}

/** Svaret utan oppet_facit får inte ha en enda facitnyckel. */
function utanFacitUtanfor(data: Record<string, unknown>) {
  const { oppet_facit: _o, ...resten } = data
  const traffar = nycklar(resten).filter((v) => FACITNYCKLAR.has(v.split('.').pop()!.replace(/\[\d+\]$/, '')))
  expect(traffar).toEqual([])
}

beforeEach(() => {
  db.anonSession = null
  db.uppdateringar = []
})

/* ------------------------------------------------------------------- valet */

describe('valjOppetFacit (regeln A)', () => {
  it.each<[number[], number, number, string]>([
    [[], 5, 0, 'noll'],
    [[2], 5, 0, 'en'],
    [[0], 5, 1, 'en'],
    [[0, 1, 2, 3], 5, 0, 'flera'],
    [[3, 4], 5, 3, 'flera'],
    [[1, 3], 5, 1, 'flera'],
    [[4, 2], 5, 2, 'flera'],
    [[0, 1, 2, 3, 4], 5, 0, 'flera'],
    [[5], 6, 0, 'en'],
  ])('fel %j av %i: uppgift %i, %s', (fel, total, index, variant) => {
    expect(valjOppetFacit(fel, total)).toEqual({ index, variant, antal_fel: fel.length })
  })
})

/* ------------------------------------------------- scenarierna per variant */

const SCENARIER: Array<{ namn: string; missar: (n: number) => number[]; index: (n: number) => number; variant: string }> = [
  { namn: 'noll missar', missar: () => [], index: () => 0, variant: 'noll' },
  { namn: 'en miss på uppgift 3', missar: () => [2], index: () => 0, variant: 'en' },
  { namn: 'en miss på uppgift 1', missar: () => [0], index: () => 1, variant: 'en' },
  { namn: 'två missar', missar: () => [1, 3], index: () => 1, variant: 'flera' },
  { namn: 'alla fel', missar: (n) => Array.from({ length: n }, (_, i) => i), index: () => 0, variant: 'flera' },
]

const TYPER: NyProvTyp[] = ['figurserie', 'verbal', 'numerisk', 'deduktiv', 'spatial', 'talserie', 'ordforrad', 'iprov']

/** Rätt svar i POST-kroppens form för en uppgift. */
function rattSvar(r: ProvRef): string {
  const g = genomgaProv([r], [{ svar: null, selected: -1, correct: false }])[0]!
  const v = 'valt' in g ? String((g.genomgang as { rattVisat: number }).rattVisat) : g.genomgang.ratt
  expect(rattaSvar(r, v).correct, `${r.k} ${r.n} rätt svar`).toBe(true)
  return v
}

/** Ett giltigt men fel svar, så att misstaget prövas. */
function felSvar(r: ProvRef): string {
  const u = publikUppgift(r)!
  const d = u.data as { alternativ?: { id: string }[] }
  const kandidater = Array.isArray(d?.alternativ) ? d.alternativ.map((a) => a.id) : ['0', '1', '2', '3', '4', '5']
  const fel = kandidater.find((c) => {
    const s = rattaSvar(r, c)
    return s.svar !== null && !s.correct
  })
  expect(fel, `${r.k} ${r.n} har ett fel alternativ`).toBeDefined()
  return fel!
}

describe('rättningen: typerna utöver matrisen', () => {
  for (const typ of TYPER) {
    for (const sc of SCENARIER) {
      it(`${typ}, ${sc.namn}: exakt en uppgift med facit, rätt uppgift, inget annat facit`, async () => {
        const refs = valjProv(typ, TOKEN, TOKEN)
        const n = refs.length
        const missar = new Set(sc.missar(n))
        const svar = refs.map((r, i) => (missar.has(i) ? felSvar(r) : rattSvar(r)))
        db.anonSession = { token: TOKEN, test_kind: typ, questions: refs, answers: null, score: null, claimed_by: null, meta: {} }

        const res = await testSession(req({ token: TOKEN, answers: svar }))
        expect(res.status).toBe(200)
        const data = await res.json()

        const index = sc.index(n)
        expect(data).toMatchObject({ score: n - missar.size, total: n, fel: [...missar].sort((a, b) => a - b), variant: sc.variant, antal_fel: missar.size })
        expect(Object.keys(data.oppet_facit).sort()).toEqual(['correct', 'index', 'uppgift'])
        expect(data.oppet_facit.index).toBe(index)
        expect(data.oppet_facit.correct).toBe(!missar.has(index))
        expect(data.oppet_facit.uppgift.nyckel).toBe(refs[index].n)

        // Samma facit som sidan efter kontot bygger för uppgiften.
        const ratt = rattaSvar(refs[index], svar[index])
        const vantat = genomgaProv([refs[index]], [ratt])[0]
        expect(data.oppet_facit.uppgift).toEqual(JSON.parse(JSON.stringify(vantat)))
        // Facit finns: rätt svar och förklaring, regel eller lösning.
        expect(JSON.stringify(data.oppet_facit.uppgift)).toMatch(/"genomgang":/)
        const g = data.oppet_facit.uppgift.genomgang as Record<string, unknown>
        if ('valt' in data.oppet_facit.uppgift) expect(typeof g.rattVisat).toBe('number')
        else expect(typeof g.ratt).toBe('string')

        // Inget facit utanför den öppna uppgiften.
        utanFacitUtanfor(data)
        // Ingen facittext från någon annan uppgift någonstans i svaret.
        const json = JSON.stringify(data)
        const oppen = JSON.stringify(data.oppet_facit.uppgift)
        const alla = genomgaProv(refs, refs.map((r, i) => rattaSvar(r, svar[i])))
        alla.forEach((a, i) => {
          if (i === index) return
          for (const t of facittexter(a)) {
            if (t.length < 20 || oppen.includes(t)) continue
            expect(json.includes(t), `${typ}: text från uppgift ${i + 1} läcker: ${t.slice(0, 60)}`).toBe(false)
          }
        })

        // En ny hämtning för samma session: samma val, de nya svaren ignoreras.
        const sparat = db.uppdateringar.filter((u) => u.table === 'anon_test_sessions').at(-1)!.payload
        db.anonSession = { ...db.anonSession, answers: sparat.answers, score: sparat.score }
        db.uppdateringar = []
        const igen = await (await testSession(req({ token: TOKEN, answers: refs.map((r) => rattSvar(r)) }))).json()
        expect(igen).toEqual(data)
        expect(db.uppdateringar).toEqual([])
      })
    }
  }
})

describe('rättningen: matrisen', () => {
  const meta = { alternativ_blandade: true, bank_version: 2 }
  const fragor = questionsForToken(TOKEN, bankVersion(meta))
  const rattVisat = (i: number) => tillVisat(permutationForSession(TOKEN, fragor[i], true), fragor[i].correctAnswer)

  for (const sc of SCENARIER) {
    it(`${sc.namn}: exakt en uppgift med facit, rätt uppgift, inget annat facit`, async () => {
      const n = fragor.length
      const missar = new Set(sc.missar(n))
      const svar = fragor.map((q, i) => (missar.has(i) ? (rattVisat(i) + 1) % q.options.length : rattVisat(i)))
      db.anonSession = { token: TOKEN, questions: fragor.map((q) => q.id), answers: null, score: null, claimed_by: null, meta }

      const data = await (await testSession(req({ token: TOKEN, answers: svar }))).json()
      const index = sc.index(n)
      expect(data).toMatchObject({ score: n - missar.size, total: n, variant: sc.variant, antal_fel: missar.size })
      expect(data.oppet_facit.index).toBe(index)

      const q = fragor[index]
      const valtOrig = tillOriginal(permutationForSession(TOKEN, q, true), svar[index])
      const fel = missar.has(index)
      expect(data.oppet_facit).toEqual(
        JSON.parse(
          JSON.stringify({
            index,
            correct: !fel,
            uppgift: { kind: 'matris', nyckel: q.id, data: genomgaFraga(q, TOKEN, true), valt: svar[index], correct: !fel, misstag: fel ? misstagFor(q, valtOrig) : null },
          })
        )
      )
      expect(data.oppet_facit.uppgift.data.rattVisat).toBe(rattVisat(index))
      expect(typeof data.oppet_facit.uppgift.data.rule).toBe('string')

      utanFacitUtanfor(data)
      const json = JSON.stringify(data)
      const oppen = JSON.stringify(data.oppet_facit.uppgift)
      fragor.forEach((o, i) => {
        if (i === index) return
        for (const t of [o.rule, o.title, ...(o.misstag ?? [])]) {
          if (!t || t.length < 20 || oppen.includes(t)) continue
          expect(json.includes(t), `text från uppgift ${i + 1} läcker: ${t.slice(0, 60)}`).toBe(false)
        }
      })

      const sparat = db.uppdateringar.filter((u) => u.table === 'anon_test_sessions').at(-1)!.payload
      db.anonSession = { ...db.anonSession, answers: sparat.answers, score: sparat.score }
      db.uppdateringar = []
      const igen = await (await testSession(req({ token: TOKEN, answers: fragor.map((_, i) => rattVisat(i)) }))).json()
      expect(igen).toEqual(data)
      expect(db.uppdateringar).toEqual([])
    })
  }
})

/* ------------------------------------------------------------ startsvaret */

describe('startsvaret är oförändrat', () => {
  it('matrisen: bara token, frågorna, total och expiresAt', async () => {
    const data = await (await testSession(req())).json()
    expect(Object.keys(data).sort()).toEqual(['expiresAt', 'questions', 'token', 'total'])
    for (const q of data.questions) expect(Object.keys(q).sort()).toEqual(['grid', 'id', 'options'])
    expect(nycklar(data).filter((v) => FACITNYCKLAR.has(v.split('.').pop()!))).toEqual([])
  })

  it.each(TYPER)('%s: bara token, typ, uppgifterna, underlaget, total och expiresAt', async (typ) => {
    const data = await (await testSession(req({ typ }))).json()
    expect(Object.keys(data).sort()).toEqual(['expiresAt', 'token', 'total', 'typ', 'underlag', 'uppgifter'])
    expect(nycklar(data).filter((v) => FACITNYCKLAR.has(v.split('.').pop()!))).toEqual([])
    expect(JSON.stringify(data)).not.toMatch(/oppet_facit|"variant"|antal_fel/)
  })
})

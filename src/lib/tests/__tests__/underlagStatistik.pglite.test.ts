// @vitest-environment node
//
// Kalibreringen för de klassiska verbala och numeriska testen: kodvägen från
// skickaUnderlagStatistik genom uppdatera_fraga_statistik (med per_typ ur
// 20261012100000_fraga_kalibrering.sql) till fraga_statistik, mot PGlite.
// Undantagna konton (QA-adresser) ger 0 rader med flit.
//
// Kräver @electric-sql/pglite (npm i --no-save @electric-sql/pglite).
// Utan paketet hoppas filen över.

import fs from 'node:fs'
import path from 'node:path'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { pgKlient } from '@/lib/traning/__tests__/pgKlient'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let admin: any
vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdmin: () => admin }))

const { skickaUnderlagStatistik } = await import('../klassiskStatistik')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let PGlite: (new (opt?: unknown) => any) | null = null
try {
  const paket = '@electric-sql/pglite'
  PGlite = (await import(/* @vite-ignore */ paket)).PGlite
} catch {
  PGlite = null
}

const VANLIG = '77777777-7777-4777-8777-777777777777'
const QA = '88888888-8888-4888-8888-888888888888'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any

describe.skipIf(!PGlite)('verbala och numeriska testen skriver till fraga_statistik', () => {
  beforeAll(async () => {
    const { byggSchema, PARSERS } = (await import('../../../../scripts/testmotorn-pglite-schema.mjs')) as unknown as {
      byggSchema: (db: unknown, opt: { konton?: [string, string][] }) => Promise<void>
      PARSERS: unknown
    }
    db = new PGlite!({ parsers: PARSERS })
    await byggSchema(db, { konton: [[VANLIG, 'vanlig@example.se'], [QA, 'qa-h1-1@jobbcoach-qa.test']] })
    await db.exec(fs.readFileSync(path.resolve(__dirname, '../../../../supabase/migrations/20261012100000_fraga_kalibrering.sql'), 'utf8'))
    admin = pgKlient(db)
  })

  it('verbalt grund: ett svar per påstående, typ klassisk, Vet inte för sig', async () => {
    await skickaUnderlagStatistik({
      userId: VANLIG,
      testType: 'verbal-resonemang',
      redanAvslutad: false,
      etikett: 'test',
      answers: [
        { passageId: 'va-17-fyradagarsvecka', statementIndex: 0, answer: 'true', isCorrect: true, timeSpent: 12 },
        { passageId: 'va-17-fyradagarsvecka', statementIndex: 1, answer: null, timeSpent: 4 },
      ],
    })
    const { rows } = await db.query(`select fraga_id, test_kind, antal, ratt, tid_summa, valfordelning, per_typ from public.fraga_statistik order by fraga_id`)
    expect(rows).toEqual([
      { fraga_id: 'va-17-fyradagarsvecka:0', test_kind: 'verbal', antal: 1, ratt: 1, tid_summa: 12, valfordelning: { '0': 1 }, per_typ: { klassisk: 1 } },
      { fraga_id: 'va-17-fyradagarsvecka:1', test_kind: 'verbal', antal: 1, ratt: 0, tid_summa: 4, valfordelning: { vet_inte: 1 }, per_typ: { klassisk: 1 } },
    ])
  })

  it('numeriskt: frågans id, och ett andra avslut av samma session räknas inte', async () => {
    const svar = [{ passageId: 'num-p01', questionId: 'num-p01-q01', selectedAnswerId: 'b', isCorrect: false, timeSpent: 50 }]
    await skickaUnderlagStatistik({ userId: VANLIG, testType: 'numerical-reasoning', redanAvslutad: false, etikett: 'test', answers: svar })
    await skickaUnderlagStatistik({ userId: VANLIG, testType: 'numerical-reasoning', redanAvslutad: true, etikett: 'test', answers: svar })
    const { rows } = await db.query(`select test_kind, antal, ratt, valfordelning from public.fraga_statistik where fraga_id = 'num-p01-q01'`)
    expect(rows).toEqual([{ test_kind: 'numerisk', antal: 1, ratt: 0, valfordelning: { '1': 1 } }])
  })

  it('QA-konton och okända testtyper skriver inget', async () => {
    const fore = (await db.query(`select coalesce(sum(antal), 0)::int as n from public.fraga_statistik`)).rows[0].n
    await skickaUnderlagStatistik({
      userId: QA,
      testType: 'verbal-resonemang-v2',
      redanAvslutad: false,
      etikett: 'test',
      answers: [{ passageId: 'vb-01', statementIndex: 0, answer: 'false', isCorrect: true, timeSpent: 3 }],
    })
    await skickaUnderlagStatistik({ userId: VANLIG, testType: 'matrislogik', redanAvslutad: false, etikett: 'test', answers: [{ q_id: 'x' }] })
    const efter = (await db.query(`select coalesce(sum(antal), 0)::int as n from public.fraga_statistik`)).rows[0].n
    expect(efter).toBe(fore)
  })
})

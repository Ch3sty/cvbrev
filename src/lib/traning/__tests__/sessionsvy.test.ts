import { describe, expect, it } from 'vitest'
import { sessionsvy } from '../motor.server'
import { hittaTraningsfraga, misstagFor, TRANINGSBANK } from '../bank.server'
import { bedomSvar } from '@/lib/logicTestV7/fragor.server'
import { permutationForSession, tillVisat } from '@/lib/logicTestV7/blanda'
import { valjPooler } from '../passgenerator'
import { bankInfo } from '../bank.server'
import type { SessionRad, TraningsMeta } from '../historik'

const FRAGOR = TRANINGSBANK.slice(0, 9).map((q) => q.id)

function meta(over: Partial<TraningsMeta> = {}): TraningsMeta {
  return {
    alternativ_blandade: true,
    traning: 1,
    typ: 'pass',
    test_kind: 'matris',
    variant: 'niva',
    dag: '2026-10-10',
    antal: 9,
    adaptiv: false,
    fragor: FRAGOR,
    tema: null,
    family: null,
    sammansattning: { nara: 5, under: 2, over: 2 },
    format: 'eget',
    budget_s: 83,
    tidsgrans_s: null,
    niva_fore: 5,
    malniva: 5,
    ateranvanda: 0,
    ...over,
  }
}

function rad(id: string, m: TraningsMeta, answers: unknown[] = [], completed_at: string | null = null): SessionRad {
  return { id, test_type: 'matrislogik-pass', meta: m, answers, created_at: '2026-10-10T08:00:00Z', completed_at }
}

/** Svaret så som svar-rutten sparar det: visat index in, originalindex lagras. */
function svara(sessionId: string, qid: string, visat: number) {
  const q = hittaTraningsfraga(qid)!
  const b = bedomSvar(q, sessionId, true, visat)!
  return { q_id: qid, selected: b.selected, visat: b.visat, correct: b.correct, time_spent: 30 }
}

describe('klientens vy av en träningssession', () => {
  it('skickar aldrig facit under passet, och samma session ger samma ordning', () => {
    const v = sessionsvy(rad('11111111-aaaa-4aaa-8aaa-000000000001', meta()))!
    expect(v.fragor).toHaveLength(9)
    expect(JSON.stringify(v)).not.toMatch(/correctAnswer|rattVisat/)
    expect(v.genomgang).toBeNull()
    expect(v.aktuell).toBe(0)
    const igen = sessionsvy(rad('11111111-aaaa-4aaa-8aaa-000000000001', meta()))!
    expect(igen.fragor).toEqual(v.fragor)
  })

  it('två sessioner med samma frågor visar alternativen i olika ordning', () => {
    const ordning = new Set(
      Array.from({ length: 12 }, (_, i) => {
        const v = sessionsvy(rad(`22222222-aaaa-4aaa-8aaa-${String(i).padStart(12, '0')}`, meta()))!
        return JSON.stringify(v.fragor[0].options)
      })
    )
    expect(ordning.size).toBeGreaterThan(1)
  })

  it('svaret lagras som originalindex; återkopplingen pekar på samma ruta hon ser', () => {
    const id = '33333333-aaaa-4aaa-8aaa-000000000001'
    const q = hittaTraningsfraga(FRAGOR[0])!
    const perm = permutationForSession(id, q, true)
    const rattVisat = tillVisat(perm, q.correctAnswer)
    const felVisat = (rattVisat + 1) % q.options.length
    const sparat = svara(id, q.id, felVisat)
    expect(sparat.selected).toBe(perm[felVisat])
    expect(sparat.correct).toBe(false)

    const v = sessionsvy(rad(id, meta(), [sparat]))!
    expect(v.aktuell).toBe(1)
    expect(v.besvarade[0]).toMatchObject({ q_id: q.id, valdVisat: felVisat, vetInte: false })
    expect(v.aterkoppling![q.id]).toMatchObject({ correct: false, rattVisat, regel: q.rule })
    // misstag[] läses på originalindex och är null tills våg 3c fyllt i fältet.
    expect(v.aterkoppling![q.id].misstag).toBe(misstagFor(q, sparat.selected))
  })

  it('mätningen visar ingen återkoppling under tiden, bara den aktuella frågan', () => {
    const pooler = valjPooler({ bank: bankInfo(), sedda: [], idag: '2026-10-10', seed: 'm' })
    const m = meta({ typ: 'matning', adaptiv: true, antal: 12, fragor: undefined, pooler })
    const id = '44444444-aaaa-4aaa-8aaa-000000000001'
    const v0 = sessionsvy(rad(id, m))!
    expect(v0.fragor).toHaveLength(1)
    const forsta = v0.fragor[0].id
    const v1 = sessionsvy(rad(id, m, [svara(id, forsta, 0)]))!
    expect(v1.fragor).toHaveLength(2)
    expect(v1.aktuell).toBe(1)
    expect(v1.aterkoppling).toBeNull()
    expect(JSON.stringify(v1)).not.toMatch(/correctAnswer|rattVisat/)
  })

  it('genomgången med rätt svar kommer först när sessionen är avslutad', () => {
    const id = '55555555-aaaa-4aaa-8aaa-000000000001'
    const svar = FRAGOR.map((qid) => svara(id, qid, 0))
    const v = sessionsvy(rad(id, meta({ typ: 'general', tidsgrans_s: 1500 }), svar, '2026-10-10T08:20:00Z'))!
    expect(v.avslutad).toBe(true)
    expect(v.genomgang).toHaveLength(9)
    const q = hittaTraningsfraga(FRAGOR[0])!
    expect(v.genomgang![0].rattVisat).toBe(tillVisat(permutationForSession(id, q, true), q.correctAnswer))
  })

  it('en vanlig testsession (utan träningsmeta) ger ingen vy', () => {
    expect(sessionsvy({ ...rad('x', meta()), meta: { alternativ_blandade: true } })).toBeNull()
  })
})

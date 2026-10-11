import { describe, expect, it } from 'vitest'
import { byggFamiljer, byggTempo, familjerForKortet, kurvaUrStatus, markePunkt, nivanUppDag, tempoSammandrag } from '../berakna'
import { egenJamforelse } from '../data.server'
import { varDuStarRader } from '../VarDuStar'
import { nivaRubrik } from '../Nivaerna'
import { tempoRubrik } from '../Tempo'
import { byggFordelning } from '../fordelning'
import { KLASSISKA } from '../katalog'
import type { SessionRad } from '@/lib/traning/historik'
import { EMPTY_STATS } from '@/app/dashboard/tester/getHubData'

function rad(id: string, typ: string, slut: string, svar: { q_id: string; correct: boolean; time_spent: number }[], extra: Record<string, unknown> = {}): SessionRad {
  return {
    id,
    test_type: 'matrislogik-pass',
    meta: { traning: 1, typ, budget_s: 60, alternativ_blandade: true, ...extra },
    answers: svar.map((s) => ({ ...s, selected: 0 })),
    created_at: slut,
    completed_at: slut,
  }
}

describe('byggTempo', () => {
  it('senaste passets frågor och snittet per pass, äldst först', () => {
    const rader = [
      rad('a', 'matning', '2026-10-06T10:00:00Z', [{ q_id: 'q1', correct: true, time_spent: 30 }]),
      rad('b', 'pass', '2026-10-07T10:00:00Z', [{ q_id: 'q2', correct: true, time_spent: 50 }], { snitt_s: 50 }),
      rad('c', 'pass', '2026-10-08T10:00:00Z', [
        { q_id: 'q3', correct: false, time_spent: 70 },
        { q_id: 'q4', correct: true, time_spent: 20 },
      ]),
    ]
    const t = byggTempo(rader)!
    expect(t.senaste?.dag).toBe('2026-10-08')
    expect(t.senaste?.fragor).toEqual([
      { tid_s: 70, ratt: false },
      { tid_s: 20, ratt: true },
    ])
    expect(t.snittPerPass.map((p) => p.snitt_s)).toEqual([50, null])
  })

  it('utan pass: null', () => {
    expect(byggTempo([rad('a', 'matning', '2026-10-06T10:00:00Z', [])])).toBeNull()
  })
})

describe('tempoSammandrag och rubriken', () => {
  it('räknar över tiden och var hon satt fast', () => {
    const s = tempoSammandrag({ dag: '2026-10-11', budget_s: 83, fragor: [{ tid_s: 90, ratt: false }, { tid_s: 40, ratt: true }, { tid_s: 100, ratt: true }] })
    expect(s).toEqual({ antal: 3, over: 2, snitt_s: 77, fastnade: [0] })
    expect(tempoRubrik(0, 9)).toMatch(/hinner/)
    expect(tempoRubrik(3, 9)).toMatch(/Mest/)
    expect(tempoRubrik(4, 9)).toMatch(/Klockan/)
  })
})

describe('byggFamiljer', () => {
  it('ackumulerar per familj, rätt men långsamt över budget', () => {
    const rader = [
      rad('a', 'pass', '2026-10-07T10:00:00Z', [
        { q_id: 'r1', correct: true, time_spent: 90 },
        { q_id: 'r2', correct: false, time_spent: 10 },
        { q_id: 'x', correct: true, time_spent: 10 },
      ]),
    ]
    const f = byggFamiljer(rader, (id) => (id.startsWith('r') ? 'rotation-med-byte' : null))
    expect(f).toEqual([{ family: 'rotation-med-byte', ratt: 1, antal: 2, andel: 0.5, ratt_men_langsamma: 1 }])
  })

  it('kortet tar familjer med minst två svar, svagast först', () => {
    const k = familjerForKortet([
      { family: 'a', ratt: 1, antal: 1, andel: 1, ratt_men_langsamma: 0 },
      { family: 'b', ratt: 3, antal: 4, andel: 0.75, ratt_men_langsamma: 0 },
      { family: 'c', ratt: 1, antal: 4, andel: 0.25, ratt_men_langsamma: 0 },
    ])
    expect(k.map((f) => f.family)).toEqual(['c', 'b'])
  })
})

describe('märket och kurvan', () => {
  const punkter = [
    { dag: '2026-10-06', typ: 'matning' as const, niva: 5.2 },
    { dag: '2026-10-09', typ: 'pass' as const, niva: 6.0 },
  ]
  it('nivanUppDag läser nadd_at i svensk tid', () => {
    expect(nivanUppDag([{ nyckel: 'nivan_upp', nadd_at: '2026-10-08T22:30:00Z' }])).toBe('2026-10-09')
    expect(nivanUppDag([])).toBeNull()
  })
  it('markePunkt tar dagens punkt eller nästa', () => {
    expect(markePunkt(punkter, '2026-10-09')?.niva).toBe(6.0)
    expect(markePunkt(punkter, '2026-10-08')?.dag).toBe('2026-10-09')
    expect(markePunkt(punkter, null)).toBeNull()
  })
  it('kurvaUrStatus: ingen kurva utan mätning, provet bara framåt', () => {
    expect(kurvaUrStatus(null)).toBeNull()
    const s = {
      start: { dag: '2026-10-06', niva: 5.2 },
      niva: 6,
      punkter,
      plandagar: [],
      plan: { provdatum: '2026-10-24', sikte: 6.5 } as never,
      dagarKvar: -1,
      milstolpar: [],
      historikLast: false,
      dagensPassGjort: true,
    }
    const k = kurvaUrStatus(s)!
    expect(k.prov).toBeNull()
    expect(k.passKvar).toBe(false)
    expect(kurvaUrStatus({ ...s, dagarKvar: 3 })!.prov).toBe('2026-10-24')
  })
})

describe('egenJamforelse', () => {
  it('bara blandade sessioner, bästa poäng inom senaste bankversionen', () => {
    const r = egenJamforelse([
      { test_type: 'matrislogik', score: 15, meta: null, completed_at: '2026-10-01T00:00:00Z' },
      { test_type: 'matrislogik', score: 9, meta: { alternativ_blandade: true }, completed_at: '2026-10-02T00:00:00Z' },
      { test_type: 'matrislogik', score: 12, meta: { alternativ_blandade: true, bank_version: 2 }, completed_at: '2026-10-03T00:00:00Z' },
      { test_type: 'matrislogik', score: 11, meta: { alternativ_blandade: true, bank_version: 2 }, completed_at: '2026-10-04T00:00:00Z' },
    ])
    expect(r).toEqual({ poang: 12, version: 2 })
  })
  it('utan blandade: ingen egen poäng', () => {
    expect(egenJamforelse([{ test_type: 'matrislogik', score: 15, meta: null, completed_at: '2026-10-01T00:00:00Z' }]).poang).toBeNull()
  })
})

describe('varDuStarRader', () => {
  it('huvudnivån är den visade nivån med flest försök, under 25 blir rader', () => {
    const stor = byggFordelning(Array.from({ length: 30 }, (_, i) => i % 16), 15)
    const liten = byggFordelning([1, 2, 3], 15)
    const r = varDuStarRader([
      { slug: 'matrislogik-avancerad', fordelning: liten, egenPoang: 10, egnaForsok: 30 },
      { slug: 'matrislogik-grund', fordelning: stor, egenPoang: 14, egnaForsok: 5 },
    ])
    expect(r.huvud?.niva.slug).toBe('matrislogik-grund')
    expect(r.ovriga[0].j).toEqual({ lage: 'raknare', antal: 3, mal: 25 })
  })
})

describe('nivaRubrik', () => {
  it('grund sitter, avancerad sätter sig', () => {
    const b = KLASSISKA.slice(0, 3).map((t, i) => ({ t, s: { ...EMPTY_STATS, attempts: i < 2 ? 5 : 0, bestPercentage: [93, 80, 0][i] } }))
    expect(nivaRubrik(b)).toBe('Grund sitter. Avancerad håller på att sätta sig.')
    b[1].s.bestPercentage = 90
    expect(nivaRubrik(b)).toBe('Avancerad sitter.')
    b[1].s.bestPercentage = 70
    expect(nivaRubrik(b)).toBe('Grund sitter. Avancerad håller på att sätta sig.')
  })
})

import { describe, expect, it } from 'vitest'
import { byggRapport, sammanfattningText, strukturFlaggor } from '../kalibrering-rapport.mjs'

const q = (id: string, extra: Record<string, unknown> = {}) => ({ id, family: 'vridning', difficulty: 3, ...extra })

describe('kalibreringsrapporten', () => {
  it('tom vy: inga kalibrerade frågor, inga streck eller NaN', () => {
    const r = byggRapport([], [{ q: q('a'), fil: 'f', band: 'grund' }])
    const text = sammanfattningText(r)
    expect(text).toContain('Inga kalibrerade frågor')
    expect(text).toContain('inte uppfyllt, 0 av 20')
    expect(JSON.stringify(r)).not.toMatch(/NaN/)
  })

  it('flaggor, kontokrav, band och p_arv', () => {
    const banker = [
      { q: q('g1'), fil: 'grund', band: 'grund' },
      { q: q('g2', { p_prior: 0.9 }), fil: 'grund', band: 'grund' },
      { q: q('e1', { band: 'plus', p_prior: 0.3 }), fil: 'kand', band: 'plus' },
      { q: q('v7a-flytt-g1'), fil: 'kand', band: 'avancerad' },
    ]
    const vy = [
      { fraga_id: 'g1', svar: 40, konton: 25, ratt: 16, p: 0.4, p_lugn: 0.42, tid_median_s: 30, per_typ: { pass: 40 } },
      { fraga_id: 'g2', svar: 40, konton: 10, ratt: 36, p: 0.9 },
      { fraga_id: 'e1', svar: 30, konton: 20, ratt: 18, p: 0.6 },
    ]
    const r = byggRapport(vy, banker)
    const rad = (id: string) => r.fragor.find((x: { id: string }) => x.id === id)
    expect(rad('g1')).toMatchObject({ kalibrerad: true, prior_fel: false, fel_niva: true })
    expect(rad('g2')).toMatchObject({ kalibrerad: false, fel_niva: false })
    expect(rad('e1')).toMatchObject({ kalibrerad: true, prior_fel: true, fel_niva: true })
    expect(rad('v7a-flytt-g1').p_arv).toBe(0.4)
    expect(r.sammanfattning.plus_som_inte_holl).toEqual(['e1'])
    expect(r.sammanfattning.fel_niva).toEqual(['g1', 'e1'])
  })

  it('strukturflaggan facit_ruta0 och jämförelsen av median-p', () => {
    const pil = (angle: number) => ({ kind: 'vector', angle, length: 'long', head: 'filled' })
    // vridning 45 grader per ruta i läsordning: ruta 9 är ruta 1 igen
    const celler = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => pil(i * 45))
    const cykel = {
      id: 'v7e-test-cykel', family: 'vridning', difficulty: 3,
      grid: [celler.slice(0, 3), celler.slice(3, 6), [celler[6], celler[7], null]],
      options: [pil(0), pil(45), pil(90), pil(135), pil(180), pil(225)], correctAnswer: 0,
    }
    expect(strukturFlaggor(cykel).facit_ruta0).toBe(true)
    expect(strukturFlaggor({ id: 'x' })).toEqual({ facit_ruta0: false, oberoende: false })
    const banker = [
      { q: cykel, fil: 'e', band: 'expert' },
      { q: q('e2'), fil: 'e', band: 'expert' },
    ]
    const vy = [
      { fraga_id: 'v7e-test-cykel', svar: 40, konton: 25, ratt: 36, p: 0.9 },
      { fraga_id: 'e2', svar: 40, konton: 25, ratt: 16, p: 0.4 },
    ]
    const r = byggRapport(vy, banker)
    expect(r.fragor.find((x: { id: string }) => x.id === 'v7e-test-cykel').facit_ruta0).toBe(true)
    expect(r.sammanfattning.strukturflaggor.facit_ruta0.expert).toMatchObject({ flaggade: 1, oflaggade: 1, median_p_flaggade: 0.9, median_p_oflaggade: 0.4 })
    expect(sammanfattningText(r)).toContain('facit_ruta0: expert 1 av 2 flaggade, median p 0,9 (1 kalibrerade) mot 0,4 (1)')
  })
})

import { describe, expect, it } from 'vitest'
import { byggRapport, sammanfattningText } from '../kalibrering-rapport.mjs'

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
})

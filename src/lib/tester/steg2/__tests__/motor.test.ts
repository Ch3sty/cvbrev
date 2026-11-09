import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { steg2Motor, steg2MotorForTestTyp } from '../motor.server'
import { arSteg2PassTestTyp, steg2PassKind, STEG2_PASS_TEST_TYPE } from '../pass'

describe('steg 2: motorvägen', () => {
  it('hittar motorn per typ och per test_type', () => {
    expect(steg2Motor('talserie')?.kind).toBe('talserie')
    expect(steg2Motor('spatial')?.kind).toBe('spatial')
    expect(steg2Motor('matris')).toBeNull()
    expect(steg2MotorForTestTyp('spatial-expert')?.kind).toBe('spatial')
    expect(steg2MotorForTestTyp('talserier-grund')?.kind).toBe('talserie')
  })

  for (const [kind, slug] of [
    ['talserie', 'talserier-avancerad'],
    ['spatial', 'spatial-grund'],
  ] as const) {
    it(`${kind}: rätt svar i visad ordning rättas som rätt, ett annat som fel`, () => {
      const m = steg2Motor(kind)!
      const session = { id: '0b8c6a1e-6a55-4d3c-9d0e-5f4c2b1a0f01', test_type: slug, meta: m.meta(slug), completed_at: '2026-11-09T10:00:00Z' }
      const { fragor, genomgang } = m.innehall(session)
      expect(fragor).toHaveLength(15)
      const g = genomgang as { id: string; rattVisat: number }[]
      const ratt = m.bedom(g[0].id, session.id, session.meta, g[0].rattVisat)
      expect(ratt?.correct).toBe(true)
      const fel = m.bedom(g[0].id, session.id, session.meta, (g[0].rattVisat + 1) % 4)
      expect(fel?.correct).toBe(false)
      expect(m.ratta([{ q_id: g[0].id, selected: ratt!.selected }])).toBe(1)
      expect(m.grupp(g[0].id)).toBeTruthy()
    })
  }

  it('spatial: passets uppgift visas och genomgås med samma blandning', () => {
    const m = steg2Motor('spatial')!
    const id = m.pool('grund')[0].id
    const seed = 'pass-1'
    const g = m.genomga(id, seed)
    expect(m.bedom(id, seed, true, g.rattVisat)?.correct).toBe(true)
  })

  it('passens test_type', () => {
    expect(arSteg2PassTestTyp('spatial-pass')).toBe(true)
    expect(steg2PassKind(STEG2_PASS_TEST_TYPE.talserie)).toBe('talserie')
    expect(steg2PassKind('deduktiv-pass')).toBeNull()
  })
})

/**
 * Spärrens mätning efter de publika proven (omgång 3): signup_gate_shown får
 * antal_fel, variant och facit_oppet; gate_cta_clicked och facit_viewed
 * byggs av samma kontext och skickas via capture() som alla andra händelser.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

const skickade: Array<[string, Record<string, unknown> | undefined]> = []
vi.mock('../events', () => ({
  capture: (e: string, p?: Record<string, unknown>) => skickade.push([e, p]),
}))

import { facitVisat, gateCtaKlick, sparrEgenskaper, sparrKontext } from '../sparren'

beforeEach(() => {
  skickade.length = 0
})

describe('sparrEgenskaper', () => {
  it('läser rättningens svar', () => {
    expect(sparrEgenskaper({ fel: [1, 3], antal_fel: 2, variant: 'flera', oppet_facit: { index: 1, correct: false } })).toEqual({
      antal_fel: 2,
      variant: 'flera',
      facit_oppet: true,
    })
  })

  it('tål ett svar utan de nya fälten (sparat prov från före omgång 3)', () => {
    expect(sparrEgenskaper({ fel: [2] })).toEqual({ antal_fel: 1, variant: 'en', facit_oppet: false })
    expect(sparrEgenskaper({ fel: [] })).toEqual({ antal_fel: 0, variant: 'noll', facit_oppet: false })
  })
})

describe('händelserna', () => {
  const ktx = sparrKontext({ test_kind: 'talserie', plats: 'artikel', slug: 'talserier' }, { fel: [0], antal_fel: 1, variant: 'en', oppet_facit: { index: 1, correct: true } })

  it('gate_cta_clicked med position och kontexten', () => {
    gateCtaKlick('google', ktx)
    expect(skickade).toEqual([
      ['gate_cta_clicked', { kind: 'test', cluster: 'test', test_kind: 'talserie', plats: 'artikel', slug: 'talserier', antal_fel: 1, variant: 'en', facit_oppet: true, position: 'google' }],
    ])
  })

  it('facit_viewed en gång per token, aldrig utan öppet facit', () => {
    facitVisat(ktx, { index: 1, correct: true }, 'tok-a')
    facitVisat(ktx, { index: 1, correct: true }, 'tok-a')
    facitVisat(ktx, null, 'tok-b')
    expect(skickade).toHaveLength(1)
    expect(skickade[0]).toEqual(['facit_viewed', { ...ktx, index: 1, correct: true }])
  })
})

// @vitest-environment node
/**
 * facit_betyder rättad i omgång 3 (del D): SO:s definition beskrev fel
 * betydelse av facit. Rättat bara där uppgiftens egna fält (kalla, misstag,
 * exempel) ger rätt betydelse ordagrant; texten ska stå kvar där.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Q = any
const alla: Q[] = ['bankGrund', 'bankAvancerad', 'bankExpert'].flatMap((f) => JSON.parse(readFileSync(`src/lib/ordforradV1/${f}.json`, 'utf8')))

const RATTADE: Record<string, string> = {
  'of-g-s-15': 'enkel, inte svår',
  'of-g-s-30': 'grund, grundval',
  'of-g-m-19': 'nederlag',
  'of-a-s-01': 'avsiktlig',
  'of-a-s-13': 'tillämpa, omsätta i handling',
  'of-a-s-29': 'förnimma, uppmärksamma',
  'of-e-s-42': 'ambivalent',
}

describe('ordförråd, facit_betyder', () => {
  it('de rättade definitionerna står ordagrant i uppgiftens egna fält', () => {
    for (const [id, text] of Object.entries(RATTADE)) {
      const q = alla.find((x) => x.id === id)
      expect(q?.facit_betyder, id).toBe(text)
      expect([...q.kalla.belagg, ...q.misstag, q.exempel].join('\n'), id).toContain(text)
    }
  })

  it('ingen definition är tom eller har tankstreck', () => {
    for (const q of alla) {
      expect(q.facit_betyder.trim().length, q.id).toBeGreaterThan(0)
      expect(q.facit_betyder, q.id).not.toMatch(/[—–]/)
    }
  })
})

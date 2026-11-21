import { describe, expect, it } from 'vitest'
import { oppnaTraffar } from '../oppna'
import { FREE_TIER_JOB_LIMIT, JOB_MATCHES_PER_RUN } from '../freeLimit'

const basta = Array.from({ length: JOB_MATCHES_PER_RUN }, (_, i) => ({ id: `a${i}` }))

describe('oppnaTraffar', () => {
  it('gratis ser de tre första', () => {
    const oppna = oppnaTraffar(basta, false)
    expect(oppna).toHaveLength(FREE_TIER_JOB_LIMIT)
    expect(oppna.map((x) => x.id)).toEqual(['a0', 'a1', 'a2'])
  })

  it('Premium ser alla', () => {
    expect(oppnaTraffar(basta, true)).toHaveLength(JOB_MATCHES_PER_RUN)
  })

  it('färre träffar än gränsen ger dem som finns', () => {
    expect(oppnaTraffar(basta.slice(0, 2), false)).toHaveLength(2)
    expect(oppnaTraffar([], false)).toEqual([])
  })
})

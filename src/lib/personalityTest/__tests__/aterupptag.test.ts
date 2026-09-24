import { describe, expect, it } from 'vitest'
import { forstaObesvarade, nastaIndex, svarIOrdning } from '../aterupptag'
import { ITEMS_GRUND } from '../itemsGrund'
import type { PersonalityAnswer } from '../types'

describe('återupptag av personlighetstestet', () => {
  it('lägger serverns svar i påståendenas ordning och hoppar till första obesvarade', () => {
    const sparade: PersonalityAnswer[] = ITEMS_GRUND.slice(0, 5).map((i, n) => ({
      questionId: i.id,
      value: ((n % 5) + 1) as 1 | 2 | 3 | 4 | 5,
    }))
    const svar = svarIOrdning(ITEMS_GRUND, sparade)
    expect(svar).toHaveLength(ITEMS_GRUND.length)
    expect(svar.slice(0, 5)).toEqual([1, 2, 3, 4, 5])
    expect(svar.filter((a) => a !== null)).toHaveLength(5)
    expect(forstaObesvarade(svar)).toBe(5)
  })

  it('hittar luckan när svaren inte kom i ordning (48 av 50)', () => {
    const sparade = ITEMS_GRUND.filter((_, i) => i !== 17 && i !== 40).map((i) => ({ questionId: i.id, value: 3 as const }))
    const svar = svarIOrdning(ITEMS_GRUND, sparade)
    expect(forstaObesvarade(svar)).toBe(17)
    expect(nastaIndex(svar, 17)).toBe(40)
  })

  it('ignorerar okända id och ogiltiga värden', () => {
    const svar = svarIOrdning(ITEMS_GRUND, [
      { questionId: 'finns-inte', value: 3 },
      { questionId: ITEMS_GRUND[0].id, value: 9 as never },
    ])
    expect(svar.every((a) => a === null)).toBe(true)
    expect(forstaObesvarade(svar)).toBe(0)
    expect(svarIOrdning(ITEMS_GRUND, null).every((a) => a === null)).toBe(true)
  })

  it('stannar på sista när allt är besvarat', () => {
    const svar = svarIOrdning(ITEMS_GRUND, ITEMS_GRUND.map((i) => ({ questionId: i.id, value: 2 as const })))
    expect(forstaObesvarade(svar)).toBe(ITEMS_GRUND.length - 1)
    expect(nastaIndex(svar, ITEMS_GRUND.length - 1)).toBe(ITEMS_GRUND.length - 1)
    expect(nastaIndex(svar, 3)).toBe(4)
  })
})

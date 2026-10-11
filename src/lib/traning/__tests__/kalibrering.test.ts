// Kalibreringsfrågan (riktlinjer-tester-v2 2.4): färre än 30 svar, minst
// besvarad först, ersätter en av passets frågor på en seedad plats.

import { describe, expect, it } from 'vitest'
import { KALIBRERING_GRANS, placeraKalibrering, valjKalibrering } from '../kalibrering'

const bank = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]

describe('kalibreringsfrågan', () => {
  it('väljer den minst besvarade under gränsen, inte en som redan står i passet', () => {
    const statistik = new Map([
      ['a', { antal: 3, ratt: 1 }],
      ['b', { antal: 40, ratt: 20 }],
      ['c', { antal: 1, ratt: 1 }],
      ['d', { antal: 0, ratt: 0 }],
    ])
    expect(valjKalibrering({ bank, statistik, utesluten: new Set(['d']), sedda: new Set(), seed: 's' })).toBe('c')
  })

  it('frågor hon inte sett går före', () => {
    const statistik = new Map([['c', { antal: 1, ratt: 1 }]])
    expect(valjKalibrering({ bank, statistik, utesluten: new Set(), sedda: new Set(['a', 'b', 'd']), seed: 's' })).toBe('c')
  })

  it('ingen fråga under gränsen ger ingen kalibreringsfråga', () => {
    const statistik = new Map(bank.map((q) => [q.id, { antal: KALIBRERING_GRANS, ratt: 10 }]))
    expect(valjKalibrering({ bank, statistik, utesluten: new Set(), sedda: new Set(), seed: 's' })).toBeNull()
  })

  it('ersätter en fråga, antalet står kvar och platsen är seedad', () => {
    const fragor = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9']
    const ut = placeraKalibrering(fragor, 'k', 'seed')
    expect(ut).toHaveLength(9)
    expect(ut.filter((x) => x === 'k')).toHaveLength(1)
    expect(placeraKalibrering(fragor, 'k', 'seed')).toEqual(ut)
  })
})

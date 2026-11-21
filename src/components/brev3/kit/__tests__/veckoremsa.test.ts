import { describe, expect, it } from 'vitest'
import { dagText, svenskDag, veckoremsa } from '../veckoremsa'

describe('veckoremsa', () => {
  it('ritar skissens vecka: skrivet fredag 20 nov, i dag lördag 21, nästa fredag 27 nov', () => {
    const r = veckoremsa('2026-11-27T08:30:00Z', new Date('2026-11-21T10:00:00Z'))
    expect(r.dagar.map((d) => d.etikett)).toEqual(['fre', 'i dag', 'sön', 'mån', 'tis', 'ons', 'tors', '27 nov'])
    expect(r.dagar.map((d) => d.lage)).toEqual(['gjord', 'idag', 'tom', 'tom', 'tom', 'tom', 'tom', 'nasta'])
    expect(r.dagarKvar).toBe(6)
    expect(r.nastaText).toBe('fredag 27 nov')
    expect(r.etikett).toBe('Veckans brev skrevs fredag 20 november. I dag är det lördag. Nästa gratisbrev öppnar fredag 27 november.')
  })

  it('räknar dagen i svensk tid, inte UTC', () => {
    // 23.30 UTC den 26 nov är redan den 27 nov i Stockholm.
    expect(svenskDag(new Date('2026-11-26T23:30:00Z'))).toBe('2026-11-27')
    const r = veckoremsa('2026-11-26T23:30:00Z', new Date('2026-11-21T10:00:00Z'))
    expect(r.dagar[7].etikett).toBe('27 nov')
  })

  it('samma dag som brevet skrevs: första rutan säger i dag och inget annat är markerat', () => {
    const r = veckoremsa('2026-11-27T08:00:00Z', new Date('2026-11-20T09:00:00Z'))
    expect(r.dagar[0]).toMatchObject({ etikett: 'i dag', lage: 'gjord' })
    expect(r.dagar.filter((d) => d.lage === 'idag')).toHaveLength(0)
    expect(r.dagarKvar).toBe(7)
  })

  it('dagen före: en dag kvar, över ett månadsskifte', () => {
    const r = veckoremsa('2026-12-02T08:00:00Z', new Date('2026-12-01T12:00:00Z'))
    expect(r.dagarKvar).toBe(1)
    expect(r.dagar[6]).toMatchObject({ etikett: 'i dag', lage: 'idag' })
    expect(r.dagar[7].etikett).toBe('2 dec')
    expect(dagText('2026-12-02')).toBe('onsdag 2 dec')
  })
})

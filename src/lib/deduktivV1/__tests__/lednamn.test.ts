// @vitest-environment node
/**
 * Namnen på leden i premisskedjorna (omgång 3, del C): `formell.termnamn`
 * för D1 och D4 kvantor, `formell.atomnamn` för D4 om_sa. Ett namn per
 * term-id eller atom, högst fyra ord, orden står i premisserna.
 * Kontrollerna ligger i scripts/lib/facit-kontroll.mjs.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
// @ts-ignore ren JavaScript
import { kollaLedNamn, sammaStam } from '../../../../scripts/lib/facit-kontroll.mjs'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Q = any
const alla: Q[] = ['bankGrund', 'bankAvancerad', 'bankExpert'].flatMap((f) => JSON.parse(readFileSync(`src/lib/deduktivV1/${f}.json`, 'utf8')))
const kedjor = alla.filter((q) => q.typ === 'D1' || q.family === 'kvantor' || q.family === 'om_sa')

describe('deduktiva lednamn', () => {
  it('varje namn klarar kontrollen', () => {
    for (const q of alla) expect(kollaLedNamn(q), q.id).toEqual([])
  })

  it('90 av 105 premisskedjor har namn (15 D1 har en term som bara står i alternativen)', () => {
    expect(kedjor.length).toBe(105)
    expect(kedjor.filter((q) => q.formell.termnamn || q.formell.atomnamn).length).toBe(90)
    for (const q of kedjor.filter((x) => x.family === 'om_sa')) expect(q.formell.atomnamn, q.id).toBeDefined()
  })

  it('namn bara på premisskedjor', () => {
    for (const q of alla.filter((x) => !kedjor.includes(x))) expect(q.formell?.termnamn ?? q.formell?.atomnamn, q.id).toBeUndefined()
  })

  it('ett ord som inte står i premisserna, fem ord och ett saknat id fälls', () => {
    const q = JSON.parse(JSON.stringify(kedjor.find((x) => x.formell.termnamn)))
    const [id] = Object.keys(q.formell.termnamn)
    q.formell.termnamn[id] = 'helt påhittad etikett'
    expect(kollaLedNamn(q).join()).toMatch(/står inte i premisserna/)
    q.formell.termnamn[id] = 'ett två tre fyra fem'
    expect(kollaLedNamn(q).join()).toMatch(/högst fyra/)
    delete q.formell.termnamn[id]
    expect(kollaLedNamn(q).join()).toMatch(new RegExp(`termnamn saknar ${id}`))
    expect(sammaStam('lönebesked', 'lönebeskedet')).toBe(true)
    expect(sammaStam('säljare', 'säljarna')).toBe(true)
    expect(sammaStam('natt', 'nattarbete')).toBe(true)
    expect(sammaStam('rum', 'rumpa')).toBe(false)
  })
})

import { describe, expect, it } from 'vitest'
import { validera as verbal } from '../validate-verbal-bank.mjs'
import { validera as numerisk } from '../validate-numerisk-bank.mjs'
import { rakna, parsaSvensktTal } from '../lib/raknare.mjs'
import * as fx from './fixtures-bank.mjs'

type Rad = { regel: number; id: string; text: string }
type Rapport = { fel: Rad[]; varningar: Rad[] }
const regler = (r: Rapport) => r.fel.map((x) => x.regel)
const varn = (r: Rapport) => r.varningar.map((x) => x.regel)
const V = (data: unknown): Rapport => verbal(data, { niva: 'avancerad' })
const G = (data: unknown): Rapport => verbal(data, { niva: 'grund' })
const N = (data: unknown): Rapport => numerisk(data, { niva: 'avancerad' })

describe('räknaren', () => {
  it('räknar med tusentalsmellanslag, komma, punkt, potens och parenteser', () => {
    expect(rakna('1 240 / 143 * 100')).toBeCloseTo(867.13, 2)
    expect(rakna('3,5 + 1.5')).toBe(5)
    expect(rakna('2 ^ 3 ^ 2')).toBe(512)
    expect(rakna('(1302 - 1240) / 1240 * 100')).toBeCloseTo(5, 6)
    expect(rakna('-2 + 5')).toBe(3)
  })
  it('division med noll och otillåtna tecken ger fel', () => {
    expect(() => rakna('5 / (3 - 3)')).toThrow(/division med noll/)
    expect(() => rakna('Math.max(1,2)')).toThrow(/otillåtet/)
    expect(() => rakna('(1 + 2')).toThrow()
  })
  it('läser svenska tal', () => {
    expect(parsaSvensktTal('5,0 %')).toBe(5)
    expect(parsaSvensktTal('1 240 tkr')).toBe(1240)
    expect(parsaSvensktTal('−3,2 mkr')).toBe(-3.2)
    expect(parsaSvensktTal('Cirka 11 %')).toBe(11)
  })
})

/* eslint-disable @typescript-eslint/no-explicit-any */
describe('verbal validering, regel för regel', () => {
  it('fixturen klarar allt', () => {
    const r = V(fx.verbal())
    expect(r.fel).toEqual([])
    expect(r.varningar).toEqual([])
  })
  const fall: [number, (d: any) => void, 'fel' | 'varning'][] = [
    [1, (d) => d[0].statements.pop(), 'fel'],
    [2, (d) => { d[1].id = d[0].id }, 'fel'],
    [3, (d) => { d[0].text = d[0].text.split(' ').slice(0, 150).join(' ') + ' Kritiker invänder.' }, 'fel'],
    [4, (d) => { d[1].statements[0].correctAnswer = 'cannot_say' }, 'fel'],
    [5, (d) => { d[0].statements[1].typ = 'direkt' }, 'fel'],
    [6, (d) => { d[0].text = d[0].text.replace('Kritiker invänder däremot att många', 'Det gäller också att många') }, 'varning'],
    [7, (d) => { d[0].statements[0].text = 'Om schemat beskriver hur arbetet fungerar i praktiken.' }, 'fel'],
    [8, (d) => { d[0].statements[0].text = 'Ett ' + 'mycket '.repeat(26) + 'långt påstående.' }, 'fel'],
    [9, (d) => { d[0].title = 'Fixtur — ett' }, 'fel'],
    [10, (d) => { d[0].statements[2].explanation = 'Detta är inte möjligt att avgöra eftersom underlaget inte säger något om hur ordningen kom till.' }, 'varning'],
    [11, (d) => { d[0].topic = 'HR Policy' }, 'fel'],
  ]
  for (const [regel, andra, typ] of fall) {
    it(`regel ${regel} fäller`, () => {
      const d = fx.verbal()
      andra(d)
      const r = V(d)
      expect(typ === 'fel' ? regler(r) : varn(r)).toContain(regel)
    })
  }
})

describe('verbal validering, grundnivå', () => {
  it('fixturen klarar allt', () => {
    const r = G(fx.verbalGrund())
    expect(r.fel).toEqual([])
    expect(r.varningar).toEqual([])
  })
  it('en ståndpunkt och inget kvantorpåstående är inget fel och ingen varning', () => {
    const r = G(fx.verbalGrund())
    expect(regler(r)).not.toContain(5)
    expect(varn(r)).not.toContain(6)
  })
  it('samma fixtur fälls som avancerad (ord, id, kvantor)', () => {
    const r = V(fx.verbalGrund())
    expect(regler(r)).toEqual(expect.arrayContaining([2, 3, 5]))
  })
  it('en text utan cannot_say är tillåten om filen håller andelen', () => {
    const d = fx.verbalGrund()
    d.push(...fx.verbalGrund().map((t: any, i: number) => ({ ...t, id: `vg-9${i + 2}-fixtur-extra` })))
    d[0].statements[2].correctAnswer = 'false'
    d[1].statements[3].correctAnswer = 'cannot_say'
    expect(regler(G(d))).not.toContain(4)
  })
  const fall: [number, (d: any) => void][] = [
    [2, (d) => { d[0].id = 'va-90-fixtur-ett' }],
    [3, (d) => { d[0].text = d[0].text + ' ' + d[0].text }],
    [3, (d) => { d[0].text = d[0].text.split(' ').slice(0, 110).join(' ') }],
    [4, (d) => { d[0].statements[1].correctAnswer = 'cannot_say' }],
    [4, (d) => { d[0].statements[0].correctAnswer = 'false'; d[0].statements[3].correctAnswer = 'false' }],
    [5, (d) => { d[0].statements[1] = { ...d[0].statements[1], typ: 'kvantor', text: 'Avsnitten handlar om helt andra saker.' } }],
    [7, (d) => { d[0].statements[0].text = 'Om schemat beskriver hur arbetet fungerar i praktiken.' }],
    [9, (d) => { d[0].title = 'Fixtur – ett' }],
    [9, (d) => { d[0].statements[0].text = 'Texten är en passage om arbetet.' }],
    [11, (d) => { d[0].topic = 'HR Policy' }],
  ]
  for (const [regel, andra] of fall) {
    it(`regel ${regel} fäller`, () => {
      const d = fx.verbalGrund()
      andra(d)
      expect(regler(G(d))).toContain(regel)
    })
  }
})

describe('numerisk validering, regel för regel', () => {
  it('fixturen klarar allt', () => {
    const r = N(fx.numerisk())
    expect(r.fel).toEqual([])
    expect(r.varningar).toEqual([])
  })
  const q = (d: any, i: number) => d[0].questions[i]
  const fall: [number, (d: any) => void, 'fel' | 'varning'][] = [
    [1, (d) => { q(d, 0).correctAnswerId = 'a' }, 'fel'],
    [2, (d) => { q(d, 0).berakning.steg[1].varde = 5.4 }, 'fel'],
    [3, (d) => { q(d, 3).berakning.steg[0] = { text: 'x', uttryck: '1302 / 85 + 0.032', varde: 15.35 }; q(d, 3).options[0].text = '15,4 tkr' }, 'fel'],
    [4, (d) => { q(d, 0).berakning.steg[0].uttryck = '1302 - 1239'; q(d, 0).berakning.steg[0].varde = 63 }, 'fel'],
    [5, (d) => { delete q(d, 0).options[0].misstag }, 'fel'],
    [6, (d) => { q(d, 0).berakning.steg = [{ text: 'Andel', uttryck: '(1302 - 1240) / 1240 * 100', varde: 5 }]; q(d, 1).berakning.steg = [{ text: 'I mkr', uttryck: '(2236 - 2150) / 1000', varde: 0.086 }] }, 'fel'],
    [7, (d) => { q(d, 2).berakning.steg[0] = { text: 'Summa', uttryck: '1302 + 395', varde: 1697 } }, 'fel'],
    [8, (d) => { delete d[0].enhetsbyte }, 'fel'],
    [9, (d) => { d[0].dataTable.rows[0][1] = '1240.5' }, 'fel'],
    [10, (d) => { q(d, 0).options[1].text = 'Cirka 5,0 %' }, 'varning'],
    [11, (d) => { q(d, 0).questionText = 'Hur många procent – ungefär?' }, 'fel'],
    [12, (d) => { d[0].type = 'word_problem' }, 'fel'],
  ]
  for (const [regel, andra, typ] of fall) {
    it(`regel ${regel} fäller`, () => {
      const d = fx.numerisk()
      andra(d)
      const r = N(d)
      expect(typ === 'fel' ? regler(r) : varn(r)).toContain(regel)
    })
  }
})

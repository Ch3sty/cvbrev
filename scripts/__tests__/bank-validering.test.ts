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

describe('verbal validering, expert (argumentationsanalys)', () => {
  const E = (data: unknown, opt: Record<string, unknown> = {}): Rapport => verbal(data, { niva: 'expert', ...opt })
  const q = (d: any, p: number, i: number) => d[p].questions[i]
  it('fixturen klarar allt', () => {
    const r = E(fx.verbalExpert())
    expect(r.fel).toEqual([])
    expect(r.varningar).toEqual([])
  })
  const fall: [number, (d: any) => void, 'fel' | 'varning'][] = [
    [1, (d) => { d[0].type = 'table' }, 'fel'],
    [1, (d) => { d[0].topic = 'Arbetsliv' }, 'fel'],
    [1, (d) => { d[0].questions.pop() }, 'fel'],
    [1, (d) => { q(d, 0, 0).options.pop() }, 'fel'],
    [1, (d) => { q(d, 0, 0).options[1].isCorrect = true }, 'fel'],
    [1, (d) => { q(d, 0, 0).correctAnswerId = 'b' }, 'fel'],
    [2, (d) => { d[0].id = 'verbexp-90' }, 'fel'],
    [2, (d) => { q(d, 0, 1).id = 'verbexp-p90-q05' }, 'fel'],
    [2, (d) => { q(d, 0, 1).id = 'verbexp-p91-q02' }, 'fel'],
    [2, (d) => { d[1].id = d[0].id }, 'fel'],
    [3, (d) => { d[0].contextText = d[0].contextText.split(' ').slice(0, 80).join(' ') }, 'fel'],
    [3, (d) => { d[0].contextText = d[0].contextText + ' ' + d[0].contextText }, 'fel'],
    [4, (d) => { q(d, 0, 0).explanation = 'Meningen om ordningen avgör, eftersom ett fall får stå för alla.' }, 'fel'],
    [4, (d) => { q(d, 0, 0).explanation = 'Meningen om att ordningen ska gälla överallt avgör, eftersom slutsatsen vilar på ett enda fall som får stå för alla.' }, 'varning'],
    [5, (d) => { q(d, 0, 0).typ = 'gissning' }, 'fel'],
    [5, (d) => { q(d, 0, 2).typ = 'felslut'; q(d, 0, 3).typ = 'antagande' }, 'fel'],
    [6, (d) => { q(d, 0, 1).options[2].text = 'Att fallet liknar de andra.' }, 'fel'],
    [6, (d) => { const qq = q(d, 0, 2); const fel = qq.options.findIndex((o: { isCorrect?: boolean }) => !o.isCorrect); qq.options[fel].text = 'Ett mycket långt felaktigt alternativ som fortsätter långt förbi det rätta svarets längd och mer därtill för att bli tydligt' }, 'fel'],
    [7, (d) => { for (const p of d) for (const x of p.questions) x.options.find((o: any) => o.isCorrect).text += ' och det gäller i alla lägen här' }, 'fel'],
    [8, (d) => { d[0].title = 'Fixtur — ett' }, 'fel'],
    [8, (d) => { q(d, 1, 3).options[0].text = 'Varje statement i texten är sant' }, 'fel'],
    [9, (d) => {
      for (const p of d) for (const x of p.questions) {
        const r = x.options.find((o: any) => o.isCorrect); const a = x.options[0]
        ;[r.text, a.text] = [a.text, r.text]; r.isCorrect = false; a.isCorrect = true; x.correctAnswerId = 'a'
        x.explanation = x.explanation.replace(/Alternativ [a-d]/, 'Det andra alternativet')
      }
    }, 'varning'],
  ]
  for (const [regel, andra, typ] of fall) {
    it(`regel ${regel} fäller (${typ})`, () => {
      const d = fx.verbalExpert()
      andra(d)
      const r = E(d)
      expect(typ === 'fel' ? regler(r) : varn(r)).toContain(regel)
    })
  }
  it('id som finns i en annan bank fälls', () => {
    expect(regler(E(fx.verbalExpert(), { andraIds: new Set(['verbexp-p90-q03']) }))).toContain(2)
  })
  it('fel på underlag som redan finns i banken blir upplysning', () => {
    const d = fx.verbalExpert()
    d[0].contextText = d[0].contextText.split(' ').slice(0, 60).join(' ')
    const r = E(d, { befintliga: new Set(['verbexp-p90']) })
    expect(regler(r)).not.toContain(3)
    expect(varn(r)).toContain(3)
  })
  it('utan typ gissas frågetypen ur frågetexten', () => {
    const d = fx.verbalExpert()
    for (const x of d[0].questions) delete x.typ
    expect(regler(E(d))).not.toContain(5)
  })
})

import { describe, expect, it } from 'vitest'
import { validera } from '../validate-numerisk-bank.mjs'
import * as fx from './fixtures-bank.mjs'

// Grundnivån (--niva=grund): id ng-NN, ett eller två steg, minst två frågor
// med två steg, ovanvant och enhetsbyte frivilliga. Fixturen är den
// avancerade fixturen med grundens id och utan de frivilliga fälten.

type Rad = { regel: number; id: string; text: string }
type Rapport = { fel: Rad[]; varningar: Rad[] }
/* eslint-disable @typescript-eslint/no-explicit-any */
const G = (data: unknown): Rapport => validera(data, { niva: 'grund' })
const regler = (r: Rapport) => r.fel.map((x) => x.regel)

function grund(): any[] {
  const d: any[] = fx.numerisk()
  const byt = (s: string) => s.replace(/^na-90/, 'ng-90')
  for (const p of d) {
    p.id = byt(p.id)
    delete p.ovanvant
    delete p.enhetsbyte
    for (const q of p.questions) { q.id = byt(q.id); q.passageId = p.id }
  }
  return d
}
const q = (d: any, i: number) => d[0].questions[i]

describe('numerisk validering, grundnivån', () => {
  it('fixturen klarar allt utan ovanvant och enhetsbyte', () => {
    const r = G(grund())
    expect(r.fel).toEqual([])
    expect(r.varningar).toEqual([])
  })

  it('ovanvant och enhetsbyte får finnas när de stämmer', () => {
    const d = grund()
    d[0].ovanvant = ['rad Kultur']
    d[0].enhetsbyte = 'tkr till mkr'
    expect(G(d).fel).toEqual([])
  })

  it('regel 1: id med avancerad form fälls', () => {
    const d = grund()
    d[0].id = 'na-90-fixtur'
    q(d, 0).id = 'na-90-q01'
    const r = G(d)
    expect(r.fel.filter((x) => x.regel === 1).map((x) => x.text)).toEqual([
      'id följer inte mönstret ng-NN-namn',
      'id följer inte mönstret ng-NN-q0N',
    ])
  })

  it('regel 6: tre steg fälls', () => {
    const d = grund()
    q(d, 0).berakning.steg = [
      { text: 'Ökningen', uttryck: '1302 - 1240', varde: 62 },
      { text: 'Kvot', uttryck: '62 / 1240', varde: 0.05 },
      { text: 'Andel', uttryck: '0.05 * 100', varde: 5 },
    ]
    const r = G(d)
    expect(r.fel.some((x) => x.regel === 6 && x.id === 'ng-90-q01' && /högst två/.test(x.text))).toBe(true)
  })

  it('regel 6: bara en fråga med två steg fälls', () => {
    const d = grund()
    q(d, 0).berakning.steg = [{ text: 'Andel', uttryck: '(1302 - 1240) / 1240 * 100', varde: 5 }]
    q(d, 1).berakning.steg = [{ text: 'I mkr', uttryck: '(2236 - 2150) / 1000', varde: 0.086 }]
    q(d, 2).berakning.steg = [{ text: 'I mkr', uttryck: '(1302 + 2236) / 1000', varde: 3.538 }]
    const r = G(d)
    expect(r.fel.some((x) => x.regel === 6 && x.id === 'ng-90-fixtur' && /minst två/.test(x.text))).toBe(true)
  })

  it('regel 6: två frågor med två steg räcker', () => {
    const d = grund()
    q(d, 2).berakning.steg = [{ text: 'I mkr', uttryck: '(1302 + 2236) / 1000', varde: 3.538 }]
    expect(regler(G(d))).not.toContain(6)
  })

  it('regel 7: ovanvant som används i ett steg fälls', () => {
    const d = grund()
    d[0].ovanvant = ['rad Kultur']
    q(d, 2).berakning.steg[0] = { text: 'Summa', uttryck: '1302 + 395', varde: 1697 }
    expect(regler(G(d))).toContain(7)
  })

  it('regel 8: enhetsbyte vars enheter inte nämns fälls', () => {
    const d = grund()
    d[0].enhetsbyte = 'liter till kWh'
    expect(regler(G(d))).toContain(8)
  })

  // Reglerna som gäller som i avancerad
  const fall: [number, (d: any) => void][] = [
    [2, (d) => { q(d, 0).berakning.steg[1].varde = 5.4 }],
    [3, (d) => { q(d, 3).berakning.steg[0] = { text: 'x', uttryck: '1302 / 85 + 0.032', varde: 15.35 }; q(d, 3).options[0].text = '15,4 tkr' }],
    [4, (d) => { q(d, 0).berakning.steg[0].uttryck = '1302 - 1239'; q(d, 0).berakning.steg[0].varde = 63 }],
    [5, (d) => { delete q(d, 0).options[0].misstag }],
    [9, (d) => { d[0].dataTable.rows[0][1] = '1240.5' }],
    [11, (d) => { q(d, 0).questionText = 'Hur många procent \u2013 ungefär?' }],
    [12, (d) => { d[0].type = 'word_problem' }],
  ]
  for (const [regel, andra] of fall) {
    it(`regel ${regel} fäller även i grund`, () => {
      const d = grund()
      andra(d)
      expect(regler(G(d))).toContain(regel)
    })
  }

  it('avancerad påverkas inte: grundfixturen fälls där på id, ovanvant och enhetsbyte', () => {
    const r: Rapport = validera(grund(), { niva: 'avancerad' })
    expect(regler(r)).toEqual(expect.arrayContaining([1, 7, 8]))
  })

  it('partifilen för grund är grön', async () => {
    const { readFileSync } = await import('node:fs')
    const bank = JSON.parse(readFileSync('src/lib/numericalTestV2/kandidater/parti-02-grund.json', 'utf8'))
    const r = G(bank)
    expect(r.fel).toEqual([])
    expect(bank).toHaveLength(8)
  })
})

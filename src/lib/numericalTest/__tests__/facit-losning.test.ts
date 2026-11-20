// @vitest-environment node
/**
 * Strukturerat facit i de numeriska bankerna (omgång 3, del A): fältet
 * `losning` räknas om steg för steg, sista värdet ger det rätta alternativet,
 * talen kommer ur underlaget och `anvander` pekar på poster som finns.
 * Kontrollerna ligger i scripts/lib/facit-kontroll.mjs.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
// @ts-ignore ren JavaScript
import { kollaNumeriskLosning, raknaUttryck, alternativTal } from '../../../../scripts/lib/facit-kontroll.mjs'

const FILER = [
  'numericalTest/questionBank.json',
  'numericalTest/underlagParti02.json',
  'numericalTest/underlagParti03.json',
  'numericalTestV2/questionBank.json',
  'numericalTestV2/underlagParti02.json',
  'numericalTestV2/underlagParti03.json',
  'numericalTestExpert/questionBank.json',
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type P = any
const banker = FILER.map((f) => ({ f, b: JSON.parse(readFileSync(`src/lib/${f}`, 'utf8')) as P[] }))

describe('numeriskt facit, losning', () => {
  it('varje losning stämmer mot underlaget och det rätta alternativet', () => {
    for (const { b } of banker) for (const p of b) for (const q of p.questions) expect(kollaNumeriskLosning(p, q), q.id).toEqual([])
  })

  it('333 av 336 frågor har losning, 21 av dem med slutsats; utan: två rena avläsningar och en logaritm', () => {
    const utan: string[] = []
    let slutsats = 0
    let anvander = 0
    for (const { b } of banker)
      for (const p of b)
        for (const q of p.questions) {
          if (!q.losning) utan.push(q.id)
          else if (q.losning.slutsats) slutsats++
          if (q.losning?.anvander) anvander++
        }
    expect(utan.sort()).toEqual(['num-p05-q01', 'num-p11-q01', 'numv2-p04-q04'])
    expect(slutsats).toBe(21)
    expect(anvander).toBeGreaterThanOrEqual(270)
  })

  it('räknaren: rötter, potenser med bråkexponent och jämförelser', () => {
    expect(raknaUttryck('(176 / 120)^(1 / 5) ≈ 1,0796').fel).toEqual([])
    expect(raknaUttryck('√12,64 ≈ 3,6').fel).toEqual([])
    expect(raknaUttryck('40 × (1 + 0,15)³ ≈ 60,84').fel).toEqual([])
    expect(raknaUttryck('68,6 > 38,1 > 37,3').fel).toEqual([])
    expect(raknaUttryck('38,1 > 68,6').fel.join()).toMatch(/stämmer inte/)
  })

  it('slutsats: talen i rätt alternativ kommer ur stegen och slutsatsen skiljer ut det', () => {
    const p = banker[0].b.find((x: P) => x.id === 'num-p01')
    const q = JSON.parse(JSON.stringify(p.questions.find((x: P) => x.id === 'num-p01-q01')))
    expect(kollaNumeriskLosning(p, q)).toEqual([])
    q.losning.slutsats = 'Kläder och Elektronik säljer mest.'
    expect(kollaNumeriskLosning(p, q).join()).toMatch(/rymmer alternativet "Kläder"/)
    q.losning.slutsats = 'Den största kategorin vinner.'
    expect(kollaNumeriskLosning(p, q).join()).toMatch(/skiljer inte ut/)
  })

  it('anvander: ett tal ur tabellen ska stå i en vald rad och kolumn', () => {
    const p = banker[0].b.find((x: P) => x.id === 'num-p01')
    const q = JSON.parse(JSON.stringify(p.questions.find((x: P) => x.id === 'num-p01-q02')))
    q.losning.anvander.kolumner = ['Q1', 'Q2']
    expect(kollaNumeriskLosning(p, q).join()).toMatch(/talet 14,0 står inte i de valda/)
  })

  it('räknaren: svensk form, = exakt, ≈ avrundat, % sist i ledet', () => {
    expect(raknaUttryck('(14,0 − 6,8) / 6,8 × 100 ≈ 105,9 %').fel).toEqual([])
    expect(raknaUttryck('45 × 42 000 × 12 = 22 680 000').fel).toEqual([])
    expect(raknaUttryck('7,2 / 6,8 = 1,06').fel.join()).toMatch(/inte lika med/)
    expect(raknaUttryck('7,2 / 6,8 ≈ 1,07').fel.join()).toMatch(/avrundas inte/)
    expect(raknaUttryck('7 - 2 = 5').fel.join()).toMatch(/U\+2212/)
    expect(raknaUttryck('12.5 × 2 = 25').fel.join()).toMatch(/decimalkomma/)
    expect(raknaUttryck('60 % × 3 = 1,8').fel.join()).toMatch(/% får bara stå sist/)
    expect(raknaUttryck('3 + 4').fel.join()).toMatch(/saknar = eller ≈/)
  })

  it('alternativens tal: Q4 är inget tal, Cirka gör alternativet ungefärligt', () => {
    expect(alternativTal('Q4')).toBeNull()
    expect(alternativTal('Cirka 33.3 miljoner kr')).toMatchObject({ varde: 33.3, cirka: true, procent: false })
    expect(alternativTal('4,5 %')).toMatchObject({ varde: 4.5, cirka: false, procent: true })
  })

  it('ett fel steg, ett påhittat tal och en rad som inte finns fälls', () => {
    const p = banker[0].b.find((x: P) => x.id === 'num-p01')
    const q = JSON.parse(JSON.stringify(p.questions.find((x: P) => x.id === 'num-p01-q02')))
    expect(kollaNumeriskLosning(p, q)).toEqual([])
    const a = JSON.parse(JSON.stringify(q))
    a.losning.steg[0].uttryck = '14,0 − 6,8 = 7,3'
    expect(kollaNumeriskLosning(p, a).join()).toMatch(/inte lika med/)
    const b = JSON.parse(JSON.stringify(q))
    b.losning.steg[0].uttryck = '14,1 − 6,9 = 7,2'
    expect(kollaNumeriskLosning(p, b).join()).toMatch(/finns inte i underlaget/)
    const c = JSON.parse(JSON.stringify(q))
    c.losning.anvander.rader = ['Leksaker']
    expect(kollaNumeriskLosning(p, c).join()).toMatch(/"Leksaker" finns inte/)
    const d = JSON.parse(JSON.stringify(q))
    d.correctAnswerId = 'b'
    expect(kollaNumeriskLosning(p, d).join()).toMatch(/närmast det rätta alternativet/)
  })
})

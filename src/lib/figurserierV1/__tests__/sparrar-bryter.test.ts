// @vitest-environment node
/**
 * Fixturer för spärrarna i "bryter mönstret" (beställning omgång 3, A5): en
 * fixtur per spärr BM1 till BM5 som fälls med rätt text, och en som klarar
 * alla. BM1 med en sexa där två figurer kan vara brytaren. Spärrarna ligger
 * i scripts/lib/serie/sparrar-bryter.mjs.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
// @ts-ignore ren JavaScript
import * as S from '../../../../scripts/lib/serie/sparrar-bryter.mjs'
// @ts-ignore ren JavaScript
import { byggMangd, byggStack, byggDuoPil, bage, bryterTexter, lasBryter, BRYTER_MALLAR } from '../../../../scripts/lib/serie/bryter-regler.mjs'
// @ts-ignore ren JavaScript
import { genereraBryter } from '../../../../scripts/lib/serie/generera-bryter.mjs'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Q = any
const MALL = Object.fromEntries((BRYTER_MALLAR as Q[]).map((m) => [m.id, m]))
const FAM: Record<string, string> = { B1: 'antal', B2: 'fyll', B3: 'flera', B4: 'vrid' }

/** En fråga ur sex figurer, brytaren på plats b. */
function fraga(mall: string, prim: string, rad: Q[], b: number, regel: Q): Q {
  const m = MALL[mall]
  const V = rad.map((c) => (lasBryter(c) as Q).v)
  const t = bryterTexter(mall, prim, V, b)
  return {
    id: `fsb-${m.niva === 'grund' ? 'g' : 'a'}-${FAM[mall]}-99`,
    form: 'bryter',
    niva: m.niva,
    family: m.family,
    recept: mall,
    difficulty: m.difficulty,
    p_prior: m.p_prior,
    title: t.title,
    rule: t.rule,
    rad,
    options: [],
    correctAnswer: b,
    misstag: t.misstag,
    regler: { mall, prim, regel: { ...regel, prim } },
    fran_version: 2,
  }
}
const sektor = (start: number, n: number) => byggMangd('sektor', bage(start, n))
const ANTAL = { typ: 'lika', egenskaper: ['antal'] }
const SAMBAND = { typ: 'samband', fran: 'bas', till: 'fyllning' }
const RELATION = { typ: 'relation', a: 'ylage', b: 'kvinkel', vinkel: 0 }

describe('bryter mönstret: spärrarna BM1 till BM5', () => {
  it('en B1-fråga som klarar alla spärrar', () => {
    const q = fraga('B1', 'sektor', [sektor(0, 3), sektor(2, 3), sektor(4, 3), sektor(2, 4), sektor(5, 3), sektor(7, 3)], 3, ANTAL)
    expect(S.sparrFelBryter(q).fel).toEqual([])
  })

  it('BM1: två figurer kan vara brytaren (samband pekar ut den ena, samma symbol den andra)', () => {
    // Fem: cirkel svart, kvadrat tom. Brytaren (F) är en tom cirkel. Men fyra av
    // figurerna och brytaren har plus och bara B har minus, så "samma symbol"
    // pekar ut B.
    const rad = [
      byggStack('circle', 'plus', 'black'),
      byggStack('circle', 'minus', 'black'),
      byggStack('square', 'plus', 'none'),
      byggStack('circle', 'plus', 'black'),
      byggStack('square', 'plus', 'none'),
      byggStack('circle', 'plus', 'none'),
    ]
    const fel = S.bm1(fraga('B2', 'grundform', rad, 5, SAMBAND)) as string[]
    expect(fel.join('\n')).toMatch(/BM1 entydig, lika\(symbol\) håller också utan figur B, så den kan läsas som brytaren/)
  })

  it('BM1: regeln håller inte för de fem', () => {
    const q = fraga('B1', 'sektor', [sektor(0, 3), sektor(2, 2), sektor(4, 3), sektor(2, 4), sektor(5, 3), sektor(7, 3)], 3, ANTAL)
    expect((S.bm1(q) as string[]).join()).toMatch(/BM1 entydig, regeln håller inte för de fem utan brytaren/)
  })

  it('BM1: B4 med ett spegelsymmetriskt mönster fälls (spec 15.1)', () => {
    const s3 = (P: number[]) => byggMangd('sektor', P)
    const rad = [s3([0, 2, 4]), s3([1, 3, 5]), s3([2, 4, 6]), s3([3, 5, 7]), s3([0, 5, 7]), s3([0, 4, 6])]
    const q = fraga('B4', 'sektor', rad, 5, { typ: 'lika', egenskaper: ['klass'] })
    expect((S.bm1(q) as string[]).join()).toMatch(/BM1 entydig, mönstret är symmetriskt, så spegelbilden är en vridning av det/)
  })

  it('BM2: två figurer är lika', () => {
    const q = fraga('B1', 'sektor', [sektor(0, 3), sektor(0, 3), sektor(4, 3), sektor(4, 4), sektor(5, 3), sektor(7, 3)], 3, ANTAL)
    expect((S.bm2(q) as string[]).join()).toMatch(/BM2 olika, figur A och B är lika/)
  })

  it('BM3: en fri egenskap har för få värden (symbolen i mitten)', () => {
    const kant = (s: number, n: number, sym: string) => byggMangd('duo-kant-symbol', bage(s, n), { ksymbol: sym })
    const rad = [kant(0, 3, 'plus'), kant(2, 3, 'plus'), kant(4, 3, 'minus'), kant(2, 4, 'plus'), kant(5, 3, 'minus'), kant(7, 3, 'plus')]
    expect((S.bm3(fraga('B1', 'duo-kant-symbol', rad, 3, ANTAL)) as string[]).join()).toMatch(/BM3 fria, ksymbol har 2 olika värden bland de fem, minst 3/)
  })

  it('BM4: brytaren är ensam om sin vridning', () => {
    const q = fraga('B1', 'sektor', [sektor(0, 3), sektor(2, 3), sektor(4, 3), sektor(6, 4), sektor(5, 3), sektor(7, 3)], 3, ANTAL)
    expect((S.bm4(q) as string[]).join()).toMatch(/BM4 ingen_outlier, brytaren är ensam om vrid = 6/)
  })

  it('BM5: brytarens pil pekar bara 45 grader fel', () => {
    const pil = (l: number, v: number) => byggDuoPil('kant', l, v)
    const rad = [pil(0, 0), pil(2, 2), pil(3, 3), pil(5, 5), pil(6, 6), pil(2, 3)]
    const q = fraga('B3', 'duo-kant-pil', rad, 5, RELATION)
    expect((S.bm5(q) as string[]).join()).toMatch(/BM5 synlig, brytarens pil pekar 45 grader fel, ska vara 90 eller 180/)
  })

  it('BM5: grå fyllning räknas inte som synlig skillnad', () => {
    const rad = [
      byggStack('circle', 'plus', 'black'),
      byggStack('circle', 'minus', 'black'),
      byggStack('square', 'dot', 'none'),
      byggStack('circle', 'ring', 'black'),
      byggStack('square', 'cross', 'none'),
      byggStack('circle', 'dot', 'gray'),
    ]
    expect((S.bm5(fraga('B2', 'grundform', rad, 5, SAMBAND)) as string[]).join()).toMatch(/BM5 synlig, fyllningen ska vara tom eller svart, aldrig grå/)
  })

  it('generatorn: 16 + 16, alla klarar spärrarna, deterministiskt', () => {
    const a = genereraBryter() as Q
    const b = genereraBryter() as Q
    expect(a.grund).toHaveLength(16)
    expect(a.avancerad).toHaveLength(16)
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
    for (const q of [...a.grund, ...a.avancerad]) expect(S.sparrFelBryter(q).fel, q.id).toEqual([])
  })

  it('kandidatfilerna och bankerna klarar spärrarna', () => {
    const filer = ['kandidater/bryter-grund', 'kandidater/bryter-avancerad', 'bankBryterGrund', 'bankBryterAvancerad']
    for (const f of filer) {
      for (const q of JSON.parse(readFileSync(`src/lib/figurserierV1/${f}.json`, 'utf8'))) expect(S.sparrFelBryter(q).fel, q.id).toEqual([])
    }
  })
})

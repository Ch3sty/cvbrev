// @vitest-environment node
/**
 * Fixturer för figurseriernas spärrar (beställningen omgång 2, A7): en
 * fixtur per spärr som fälls med rätt text, och en fråga som klarar alla.
 * Spärrarna ligger i scripts/lib/serie/sparrar.mjs.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
// Kandidaterna läses som filer, aldrig som import (kandidater.test.ts).
const las = (f: string) => JSON.parse(readFileSync(`src/lib/figurserierV1/kandidater/${f}.json`, 'utf8'))
const grund = las('grund')
const avancerad = las('avancerad')
const expert = las('expert')
const avancerad1 = las('omgang1/avancerad')
const expert1 = las('omgang1/expert')
const expert2 = las('omgang2/expert')
// @ts-ignore ren JavaScript
import * as S from '../../../../scripts/lib/serie/sparrar.mjs'
// @ts-ignore ren JavaScript
import { tolkaRad, hypoteser } from '../../../../scripts/lib/serie/tolka-serie.mjs'
// @ts-ignore ren JavaScript
import { byggCell } from '../../../../scripts/lib/serie/celler-serie.mjs'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Q = any
const kopia = (q: Q): Q => JSON.parse(JSON.stringify(q))
const hitta = (bank: Q[], f: (q: Q) => boolean) => kopia(bank.find(f))
const pil = (v: number, langd = 'long', spets = 'open') => byggCell('pil', { vinkel: v, langd, spets })
const alla = (q: Q) => S.sparrFelSerie(q).fel as string[]

describe('figurseriernas spärrar', () => {
  it('alla frågor i de skarpa bankerna klarar spärrarna', () => {
    const bank = ['bankGrund', 'bankAvancerad', 'bankExpert'].flatMap((f) => JSON.parse(readFileSync(`src/lib/figurserierV1/${f}.json`, 'utf8')))
    for (const q of bank) expect(alla(q), q.id).toEqual([])
  })

  it('granskning 03: S14 fäller fs-e-flera-05 och 06 (ingen ren nära miss per regel)', () => {
    for (const id of ['fs-e-flera-05', 'fs-e-flera-06']) expect(S.s14(hitta(expert as Q[], (x) => x.id === id)).join(), id).toMatch(/ingen nära miss på/)
  })

  it('FS1 aterkomst: ett alternativ lika en visad figur', () => {
    const q = hitta(grund as Q[], (x) => x.recept === 'F1')
    const d = q.correctAnswer === 0 ? 1 : 0
    q.options[d] = q.rad[1]
    expect(S.fs1(q).join()).toMatch(/FS1 aterkomst, alternativ [A-F] är lika figur 2/)
  })

  it('FS2 period: pilen vrids 90 grader ensam (period 4)', () => {
    const q = { id: 'x', regler: { prim: 'pil', dims: { vinkel: { regel: 'steg', s0: 0, k: 2 }, langd: { regel: 'konstant', v: 'long' }, spets: { regel: 'konstant', v: 'open' } } } }
    expect(S.fs2(q)).toEqual(['x: FS2 period, hela figurens period är 4, minst 6'])
  })

  it('FS3 takt: pricken och pilen tar ett steg var och går i takt', () => {
    const rad = [0, 1, 2, 3, 4].map((i) => byggCell('duo-kant-pil', { ylage: i, yantal: 1, kvinkel: i }))
    expect(S.fs3({ id: 'x', rad })).toEqual(['x: FS3 takt, ylage och kvinkel går i takt över de fem visade'])
  })

  it('FS4 entydig: steg 3 är entydigt, växande steg passar inte samma fem', () => {
    const h = hypoteser({ typ: 'rot', n: 8 }, [0, 3, 6, 1, 4])
    expect(h.some((x: Q) => x.regel === 'vaxande')).toBe(false)
    expect(new Set(h.map((x: Q) => x.pred))).toEqual(new Set([7]))
    expect(tolkaRad([0, 3, 6, 1, 4].map((v) => pil(v))).entydig).toBe(true)
  })

  it('FS4 entydig: tretakt mot "varannan lika" ger olika sjätte och fälls', () => {
    const rad = [0, 1, 2, 3, 4].map((i) => pil(i, 'long', i === 2 ? 'filled' : 'open'))
    const q = { id: 'x', rad, options: [pil(5), pil(5, 'long', 'filled'), pil(6), pil(7), pil(5, 'short'), pil(6, 'short')], correctAnswer: 0 }
    expect(S.fs4(q).join()).toMatch(/FS4 entydig, tvetydig: spets/)
  })

  it('FS4 entydig: två alternativ är den sjätte figuren', () => {
    const q = hitta(grund as Q[], (x) => x.recept === 'F1')
    const d = q.correctAnswer === 0 ? 1 : 0
    q.options[d] = q.options[q.correctAnswer]
    expect(S.fs4(q).join()).toMatch(/FS4 entydig, 2 alternativ är den sjätte figuren/)
  })

  it('FS5 steg_fram: figur 5 som distraktor', () => {
    const q = hitta(grund as Q[], (x) => x.recept === 'F1')
    const d = q.correctAnswer === 0 ? 1 : 0
    q.options[d] = q.rad[4]
    expect(S.fs5(q).join()).toMatch(/FS5 steg_fram, alternativ [A-F] är figur 5/)
  })

  it('FS6 antal_tak: ett tomt sektorhjul och åtta strålar', () => {
    const q = hitta(grund as Q[], (x) => x.variant === 'sektor-antal')
    const d = q.correctAnswer === 0 ? 1 : 0
    q.options[d] = { kind: 'sectorwheel', filled: [] }
    expect(S.fs6(q).join()).toMatch(/FS6 antal_tak, alternativ [A-F] är en tom figur/)
    const r = hitta(grund as Q[], (x) => x.variant === 'stralar-antal')
    r.rad[0] = { kind: 'ray', rays: [0, 1, 2, 3, 4, 5, 6, 7] }
    expect(S.fs6(r).join()).toMatch(/FS6 antal_tak, figur 1 går inte att läsa/)
  })

  it('S11 röstning: facits vridning är vanligast bland alternativen', () => {
    const q = hitta(grund as Q[], (x) => x.variant === 'pil-steg')
    const f = q.options[q.correctAnswer]
    const andra = [0, 1, 2, 3, 4, 5].filter((i) => i !== q.correctAnswer)
    q.options[andra[0]] = { ...f, length: f.length === 'long' ? 'short' : 'long' }
    q.options[andra[1]] = { ...f, head: f.head === 'open' ? 'filled' : 'open' }
    expect(alla(q).join()).toMatch(/S11 röstning/)
  })

  it('S12 utanfor: två distraktorer med ett antal som inte finns i raden', () => {
    const q = hitta(avancerad as Q[], (x) => x.variant === 'sektor-steg-antalcykel')
    const andra = [0, 1, 2, 3, 4, 5].filter((i) => i !== q.correctAnswer)
    // sju svarta sektorer finns aldrig i en cykel ur 1 till 4
    q.options[andra[0]] = { kind: 'sectorwheel', filled: [0, 1, 2, 3, 4, 5, 6] }
    q.options[andra[1]] = { kind: 'sectorwheel', filled: [1, 2, 3, 4, 5, 6, 7] }
    expect(S.s12(q).join()).toMatch(/S12 utanfor, [2-5] distraktorer/)
  })

  it('S13 otestad: alla alternativ pekar som facit', () => {
    const q = hitta(grund as Q[], (x) => x.variant === 'pil-steg')
    const vinkel = q.options[q.correctAnswer].angle
    q.options = q.options.map((o: Q) => ({ ...o, angle: vinkel }))
    expect(S.s13(q)).toEqual([`${q.id}: S13 otestad, regeln för vinkel testas inte, alla alternativ har samma värde`])
  })

  it('S6 eliminerbar: två distraktorer är ensamma om sitt antal streck', () => {
    const q = hitta(grund as Q[], (x) => x.variant === 'stralar-steg')
    const andra = [0, 1, 2, 3, 4, 5].filter((i) => i !== q.correctAnswer)
    const lagg = (c: Q, n: number) => ({ kind: 'ray', rays: [...c.rays, ...Array.from({ length: n }, (_, j) => (Math.max(...c.rays) + 1 + j) % 8)].sort((a, b) => a - b) })
    // alla distraktorer får facits antal, två av dem ett och två till
    const n = q.options[q.correctAnswer].rays.length
    for (const i of andra) q.options[i] = { kind: 'ray', rays: q.options[i].rays.slice(0, n) }
    q.options[andra[0]] = lagg(q.options[andra[0]], 1)
    q.options[andra[1]] = lagg(q.options[andra[1]], 2)
    expect(S.s6(q).join()).toMatch(/S6 eliminerbar, [2-5] distraktorer kan strykas/)
  })

  it('S5 facit_udda: facit ensamt om sin spets', () => {
    const q = hitta(grund as Q[], (x) => x.variant === 'pil-steg')
    const andra = [0, 1, 2, 3, 4, 5].filter((i) => i !== q.correctAnswer)
    const f = q.options[q.correctAnswer]
    const annan = f.head === 'open' ? 'filled' : 'open'
    for (const i of andra) q.options[i] = { ...q.options[i], head: annan }
    expect(S.s5(q).join()).toMatch(/S5 facit_udda, facit är ensamt om sitt värde i spets/)
  })

  it('S14 balans: omgång 1:s fs-e-vrid-01 har vinkeln bruten av alla fem', () => {
    const q = hitta(expert1 as Q[], (x) => x.id === 'fs-e-vrid-01')
    expect(S.s14(q).join()).toMatch(/S14 balans, alla fem distraktorer bryter vinkel/)
  })

  it('S12 utanför: omgång 1:s fs-a-vaxl-03 har ortogonala pilar när raden bara har diagonala', () => {
    const q = hitta(avancerad1 as Q[], (x) => x.id === 'fs-a-vaxl-03')
    expect(S.s12(q).join()).toMatch(/S12 utanfor, [1-5] distraktorer har ett värde utanför regelns mängd/)
  })

  it('FS6: ett streck, flera kantprickar och prick som kärna fälls (granskning 01, F1 till F3)', () => {
    const q = hitta(grund as Q[], (x) => x.variant === 'stralar-steg')
    const d = q.correctAnswer === 0 ? 1 : 0
    q.options[d] = { kind: 'ray', rays: [3] }
    expect(S.fs6(q).join()).toMatch(/FS6 antal_tak, alternativ [A-F] har antal = 1 utanför gränserna/)
    const e = hitta(expert as Q[], (x) => x.regler.prim === 'duo-kant-form')
    const i = e.correctAnswer === 0 ? 1 : 0
    e.options[i] = { ...e.options[i], ytter: { ...e.options[i].ytter, antal: 2 } }
    expect(S.fs6(e).join()).toMatch(/går inte att läsa/)
    expect(byggCell('duo-kant-symbol', { ylage: 0, ksymbol: 'dot' })).toBeTruthy()
    const z = { id: 'x', rad: [0, 1, 2, 3, 4].map((v) => byggCell('duo-kant-symbol', { ylage: v, ksymbol: 'dot' })), options: [] }
    expect(S.fs6(z).join()).toMatch(/ksymbol = dot utanför gränserna/)
  })

  it('S14 med konstanter: omgång 2:s fs-e-vaxl-05 saknar nära miss på vinkeln bland dem som håller spetsen, vaxl-09 släpps', () => {
    expect(S.s14(hitta(expert2 as Q[], (x) => x.id === 'fs-e-vaxl-05')).join()).toMatch(/S14 balans, ingen nära miss på vinkel bland dem som håller konstanterna/)
    expect(S.s14(hitta(expert2 as Q[], (x) => x.id === 'fs-e-vaxl-09'))).toEqual([])
  })

  it('S15 grupp-antal: antal i cykel på sektorhjulet (omgång 2:s fs-e-antal-03)', () => {
    expect(S.s15(hitta(expert2 as Q[], (x) => x.id === 'fs-e-antal-03'))).toEqual(['fs-e-antal-03: S15 grupp-antal, antalet går i cykel på en grupprimitiv'])
  })
})

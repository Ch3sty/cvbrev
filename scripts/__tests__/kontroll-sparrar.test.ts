/**
 * Spärrarna mot facit-genvägen (plan-facit-genvag avsnitt 3) och de radvisa
 * reglerna i tolkningen (2.4). En fråga per spärr som fälls med rätt text,
 * och en som klarar.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { s1, s2, s3, s5, s6, s7, s9, arEnrad, sparrFel, kvotFel, facitRutor, strukturFelV3, utseendeFel } from '../lib/matris/sparrar.mjs'
import { tolka, familjFor } from '../lib/matris/tolka.mjs'
import { misstagFor } from '../lib/matris/misstag.mjs'
import { valbarI, pensionsListaV3 } from '../lib/matris/version.mjs'

const las = (f: string) => JSON.parse(readFileSync(f, 'utf8'))
const bank = [...las('src/lib/logicTestV7/questionBankGrund3c.v7.json'), ...las('src/lib/logicTestV7/questionBankExpert3c.v7.json')]
const kandGrund = las('src/lib/logicTestV7/kandidater/grund-v3-parti-01.v7.json')
const kandAv = las('src/lib/logicTestV7/kandidater/avancerad-v3-parti-01.v7.json')
const id = (lista: { id: string }[], x: string) => lista.find((q) => q.id === x)!

const pil = (angle: number, length = 'long', head = 'filled') => ({ kind: 'vector', angle: ((angle % 360) + 360) % 360, length, head })
/** M1 linjär på pilen: läge s + d·r + k·c (i 45-gradersteg). */
function m1(d: number, k: number, idText = 'v7g-test-m1') {
  const g = [0, 1, 2].map((r) => [0, 1, 2].map((c) => pil((d * r + k * c) * 45)))
  const facit = g[2][2]; g[2][2] = null as never
  const f = (2 * d + 2 * k) * 45
  return { id: idText, title: 't', rule: 'r', family: 'vridning', grid: g, options: [facit, pil(f + 45), pil(f - 45), pil(f + 180), pil(f + 90), pil(f - 90)], correctAnswer: 0 }
}

describe('radvisa regler i tolkningen', () => {
  it('rad-steg hittar M1 linjär och förutsäger facit', () => {
    const q = m1(1, 1)
    const t = tolka(q)
    expect(t.ok).toBe(true)
    expect(t.regel.vinkel.regel).toBe('rad-steg')
    expect(t.traffar).toEqual([0])
    expect(familjFor(q)).toBe('vridning')
  })
  it('egen riktning per rad (M4) tolkas som rad-steg med växling', () => {
    const q = id(kandAv, 'v7a-v3-vrid-12')
    const t = tolka(q)
    expect(t.regel.vinkel.regel).toBe('rad-steg')
    expect(t.regel.vinkel.info.vaxlar).toBe(true)
    expect(misstagFor(q).filter(Boolean).length).toBe(5)
  })
  it('läsordningen (d = 3k) väljs som rot-steg, som förut', () => {
    expect(tolka(m1(3, 1)).regel.vinkel.regel).toBe('rot-steg')
  })
  it('antal som räknas radvis tolkas som rad-aritm i familjen antal som ändras', () => {
    const q = kandGrund.find((x: { recept: string }) => x.recept === 'antal-egen-riktning')
    expect(tolka(q).regel.antal.regel).toBe('rad-aritm')
    expect(familjFor(q)).toBe('antal-andras')
  })
})

describe('spärrarna per fråga', () => {
  it('S1 och S9: en läsordningsfråga ur dagens bank fälls', () => {
    const q = id(bank, 'v7g-3c-vrid-01')
    expect(s1(q)[0]).toMatch(/S1 facit är lika rutan uppe till vänster/)
    expect(s9(q)[0]).toMatch(/S9/)
  })
  it('M1 med (d, k) = (1, 1) klarar S1 och S2 men är en enradsfråga (S4)', () => {
    const q = m1(1, 1)
    expect(s1(q)).toEqual([])
    expect(s2(q)).toEqual([])
    expect(arEnrad(q)).toBe(true)
    expect(sparrFel(q).info.some((x: string) => /S4/.test(x))).toBe(true)
    expect(sparrFel({ ...q, id: 'v7e-test-m1' }).fel.some((x: string) => /S4/.test(x))).toBe(true)
  })
  it('S2: facit lika en synlig ruta kräver två distraktorkopior', () => {
    const q = m1(1, 1)
    const kopia = { ...q, options: [pil(45), pil(180), pil(225), pil(270), pil(315), pil(90)] }
    expect(s2(kopia).join(' ')).toMatch(/minst två krävs/)
  })
  it('S3: facit som den vanligaste figuren fälls', () => {
    const g = [[pil(0), pil(90), pil(0)], [pil(90), pil(0), pil(90)], [pil(0), pil(90), null]]
    const q = { id: 'v7g-test-s3', family: 'vridning', grid: g, options: [pil(0), pil(45), pil(135), pil(180), pil(225), pil(270)], correctAnswer: 0 }
    expect(s3(q)[0]).toMatch(/S3/)
  })
  it('S5: facit som enda korta pilen när fyra distraktorer är långa fälls', () => {
    const q = m1(1, 1)
    const udda = { ...q, options: [{ ...q.options[0], length: 'short' }, ...q.options.slice(1)] }
    expect(s5(udda)[0]).toMatch(/S5/)
  })
  it('S6: en ensam kort distraktor kan strykas; två korta kan inte', () => {
    const q = m1(1, 1, 'v7e-test-s6')
    const en = { ...q, options: [q.options[0], { ...q.options[1], length: 'short' }, ...q.options.slice(2)] }
    expect(s6(en)[0]).toMatch(/S6 1 distraktorer/)
    const tva = { ...en, options: [en.options[0], en.options[1], { ...q.options[2], length: 'short' }, ...q.options.slice(3)] }
    expect(s6(tva)).toEqual([])
  })
  it('S7: ett tomt alternativ fälls', () => {
    const ray = (r: number[]) => ({ kind: 'ray', rays: r })
    const q = { id: 'v7g-test-s7', family: 'vridning', grid: [[ray([0, 1]), ray([1, 2]), ray([2, 3])], [ray([1, 2]), ray([2, 3]), ray([3, 4])], [ray([2, 3]), ray([3, 4]), null]], options: [ray([4, 5]), ray([]), ray([5, 6]), ray([0, 1, 2]), ray([6, 7]), ray([4])], correctAnswer: 0 }
    expect(s7(q).join(' ')).toMatch(/G11/)
  })
  it('latin-form med konstant diagonal klarar S1 men räknas i kvoten S1b', () => {
    const q = kandGrund.find((x: { family: string; options: unknown[]; correctAnswer: number }) => x.family === 'latin-form' && facitRutor(x).includes(0))
    expect(q).toBeTruthy()
    expect(s1(q)).toEqual([])
    expect(kvotFel([q, q, q, q, q, q, q, q, q, m1(1, 1)], 'grund').join(' ')).toMatch(/ruta 0/)
  })
  it('alla kandidater i grund och avancerad klarar spärrarna', () => {
    for (const q of [...kandGrund, ...kandAv]) expect(sparrFel(q).fel, q.id).toEqual([])
  })
})

describe('spärrarna över ett recept', () => {
  it('S8 och S10: samma utseende två gånger fälls, kandidaterna klarar', () => {
    const q = m1(1, 1)
    expect(utseendeFel([{ ...q, recept: 'M1' }, { ...q, id: 'v7g-test-2', recept: 'M1' }]).join(' ')).toMatch(/S10/)
    expect(strukturFelV3([1, 2, 3, 4].map((i) => ({ ...q, id: `v7g-t-${i}`, recept: 'M1' }))).join(' ')).toMatch(/S8/)
    expect([...strukturFelV3(kandGrund), ...utseendeFel(kandGrund), ...strukturFelV3(kandAv), ...utseendeFel(kandAv)]).toEqual([])
  })
})

describe('versionerna i skripten', () => {
  it('valbarI och pensionslistan', () => {
    expect(valbarI({ pensionerad_fran: 3 }, 2)).toBe(true)
    expect(valbarI({ pensionerad_fran: 3 }, 3)).toBe(false)
    const lista = pensionsListaV3()
    expect(lista).toHaveLength(157)
    expect(lista.filter((x: { niva: string }) => x.niva === 'expert')).toHaveLength(48)
  })
})

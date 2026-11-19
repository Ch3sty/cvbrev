// @vitest-environment node
/**
 * Frågebanken 2026-11-19, omgång 3 (docs/fragebank/spatial-2026-11-19-omg3.md):
 * 100 nya uppgifter med fran_version 5 i nya uppgiftstyper inom formerna
 * (A spegling i två linjer, C kroppar sedda från pilens håll och snitt, B två
 * vikningar med två hål på expert). De är inte aktiva förrän SPATIAL_VERSION
 * blir 5. Ritaren har en ny figur (kropp) och spegellinjer på brickan; ingen
 * äldre figur ritas annorlunda.
 */
import { describe, expect, it } from 'vitest'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
// @ts-ignore ren JavaScript
import { verifieraBanker, verifieraFraga, kanoniskNyckel, dubbletter } from '../../../../scripts/spatial-verifiera.mjs'
// @ts-ignore ren JavaScript
import * as K from '../../../../scripts/lib/spatial/kropp.mjs'
// @ts-ignore ren JavaScript
import * as S from '../../../../scripts/lib/spatial/spegling.mjs'
import { poolFor, valjSpatial, perFormFor, FORMER, SPATIAL_VERSION, allaSpatial } from '../select'
import { SpatialSvg, kroppDelar } from '../ritare'
import { matFigur } from '../svgMatt'
import type { KroppFigur, SpatialFigur, SpatialFraga } from '../types'

const NIVAER = ['grund', 'avancerad', 'expert'] as const
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Q = any
const kopia = (q: Q): Q => JSON.parse(JSON.stringify(q))
const alla = allaSpatial() as Q[]
const nya = alla.filter((q) => q.fran_version === 5)
const typ = (q: Q) => (q.referens?.axlar ? 'spegling' : q.referens?.kind === 'kropp' ? (q.referens.snitt === undefined ? 'vy' : 'snitt') : q.form === 'B' ? 'tva_vik' : 'annan')
const svg = (f: SpatialFigur) => renderToStaticMarkup(React.createElement(SpatialSvg, { fig: f }))

describe('bankversion 5', () => {
  it('100 nya uppgifter, sist i bankerna, unika id och en tredjedel per nivå', () => {
    expect(nya.length).toBe(90)
    const ids = alla.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const n of NIVAER) {
      const bank = alla.filter((q) => q.niva === n)
      const forsta = bank.findIndex((q) => q.fran_version === 5)
      expect(bank.slice(forsta).every((q) => q.fran_version === 5), n).toBe(true)
      expect(bank.length - forsta).toBeGreaterThanOrEqual(n === 'expert' ? 24 : 33)
    }
  })
  it('bara de nya typerna: spegling, vy och snitt på alla nivåer, två vikningar på expert', () => {
    const per = (n: string, t: string) => nya.filter((q) => q.niva === n && typ(q) === t).length
    for (const n of NIVAER) for (const t of ['spegling', 'vy', 'snitt']) expect(per(n, t), `${n} ${t}`).toBeGreaterThanOrEqual(8)
    // Expertens tio två vikningar ströks i granskningen (samma form som avancerad).
    expect(per('expert', 'tva_vik')).toBe(0)
    expect(nya.filter((q) => typ(q) === 'annan')).toEqual([])
  })
  it('version 1 till 4 drar ur samma pool som förut, och version 5 är inte aktiv', () => {
    for (const n of NIVAER) {
      expect(poolFor(n, 4).length).toBe(162)
      expect(poolFor(n, 4).some((q) => q.fran_version === 5)).toBe(false)
      expect(poolFor(n, 5).length).toBe(162 + nya.filter((q) => q.niva === n).length)
    }
    expect(SPATIAL_VERSION).toBe(5)
  })
  it('version 5: samma fördelning per form och aldrig två av samma form i följd', () => {
    for (const niva of NIVAER) {
      for (let s = 0; s < 60; s++) {
        const u = valjSpatial(niva, `v5-${s}`, 5)
        expect(u.length).toBe(15)
        expect(Object.fromEntries(FORMER.map((f) => [f, u.filter((q) => q.form === f).length]))).toEqual(perFormFor(5))
        for (let i = 1; i < u.length; i++) expect(u[i].form).not.toBe(u[i - 1].form)
      }
    }
  })
  it('den oberoende verifieraren: inga fel och inga varningar bland de nya, inga kopior', () => {
    const res = verifieraBanker(undefined, { version: 5 })
    expect(res.antal).toBe(90)
    expect(res.fel).toEqual([])
    expect(res.varn).toEqual([])
  })
})

describe('ritaren: bakåtkompatibel', () => {
  it('varje äldre figur (bankerna före version 5 och artiklarna) ritas exakt som före omgång 3', () => {
    const rader: string[] = []
    const artiklar = JSON.parse(readFileSync('src/lib/artikelfigurer/spatial.json', 'utf8')) as SpatialFraga[]
    const banker = ['bankGrund', 'bankAvancerad', 'bankExpert'].map((b) => JSON.parse(readFileSync(`src/lib/spatialV1/${b}.json`, 'utf8')) as SpatialFraga[])
    for (const bank of [...banker.map((b) => b.filter((q) => q.fran_version < 5)), artiklar]) {
      for (const q of bank) {
        const fig: [string, SpatialFigur][] = []
        if (q.referens) fig.push(['referens', q.referens])
        q.sekvens?.forEach((f, i) => fig.push([`sekvens${i}`, f]))
        q.options.forEach((f, i) => fig.push([`alt${i}`, f]))
        q.uppvikning?.forEach((f, i) => fig.push([`upp${i}`, f]))
        q.hopvikning?.forEach((f, i) => fig.push([`hop${i}`, f]))
        for (const [plats, f] of fig) rader.push(`${q.id} ${plats} ${svg(f)}`)
      }
    }
    expect(rader.length).toBe(3461)
    // ögonblicksbilden togs med scripts/lib/spatial/markup-ogonblick.tsx före ändringen i ritaren
    expect(createHash('sha256').update(rader.join('\n')).digest('hex')).toBe('64b5113af26704eaaf4eae2d0772e8c53ac69e44780252d1c13f65451a5bf23a')
  })
  it('en bricka med spegellinjer är samma bricka plus en streckad linje per spegellinje', () => {
    const utan = { kind: 'brick', n: 4, cells: [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2]] } as SpatialFigur
    for (const axlar of [['v', 'h'], ['h', 'd'], ['a', 'v']]) {
      const med = svg({ ...utan, axlar } as SpatialFigur)
      const rutor = svg(utan).replace(/<\/svg>$/, '')
      expect(med.startsWith(rutor)).toBe(true)
      expect((med.match(/<line /g) ?? []).length).toBe(2)
      expect((med.match(/stroke-dasharray/g) ?? []).length).toBe(2)
    }
  })
})

describe('ritaren: kroppen', () => {
  const fria = (h: number[][]) => {
    let n = 0
    const H = (x: number, y: number) => (x >= 0 && y >= 0 && x < 3 && y < 3 ? h[y][x] : 0)
    for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) for (let z = 0; z < h[y][x]; z++) n += (z === h[y][x] - 1 ? 1 : 0) + (H(x, y + 1) <= z ? 1 : 0) + (H(x + 1, y) <= z ? 1 : 0)
    return n
  }
  const slump = (seed: number) => {
    let s = seed
    const r = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648)
    return [0, 1, 2].map(() => [0, 1, 2].map(() => Math.floor(r() * 4)))
  }
  it('ritar en sida per fri kubsida, bakifrån och fram, plattan först och pilen sist', () => {
    for (let i = 0; i < 300; i++) {
      const h = slump(i + 1)
      for (const blick of ['l', 'r'] as const) {
        const fig: KroppFigur = { kind: 'kropp', h, blick }
        const d = kroppDelar(fig)
        expect(d.ytor.length).toBe(fria(h))
        const djup = d.ytor.map((y) => y.kub[0] + y.kub[1] + y.kub[2])
        for (let j = 1; j < djup.length; j++) expect(djup[j]).toBeGreaterThanOrEqual(djup[j - 1])
        const m = svg(fig)
        expect((m.match(/<path /g) ?? []).length).toBe(fria(h) + 3) // platta, rutnät, ytor, pilhuvud
        expect(m.indexOf('stroke="#64748B"')).toBeLessThan(m.indexOf('stroke="#020617"'))
        expect(m).not.toMatch(/#E07A2F/)
      }
    }
  })
  it('snittlinjen ritas i koppar, streckad, bara med snitt och på sidorna snittet går genom', () => {
    const h = [[3, 1, 2], [0, 2, 1], [1, 0, 1]]
    for (const blick of ['l', 'r'] as const) {
      for (const snitt of [0, 1, 2]) {
        const d = kroppDelar({ kind: 'kropp', h, blick, snitt })
        for (const y of d.ytor.filter((x) => x.snitt)) expect(blick === 'l' ? y.kub[1] : y.kub[0]).toBe(snitt)
        const m = svg({ kind: 'kropp', h, blick, snitt })
        expect((m.match(/stroke="#E07A2F"/g) ?? []).length).toBe(1 + d.ytor.filter((x) => x.snitt).length)
      }
    }
  })
  it('allt målat ligger i [14, 86] och klarar måtten, också för den största kroppen', () => {
    const fel: string[] = []
    const fulla = [[3, 3, 3], [3, 3, 3], [3, 3, 3]]
    for (const blick of ['l', 'r'] as const) {
      fel.push(...matFigur({ kind: 'kropp', h: fulla, blick }, 1.27, `full ${blick}`))
      for (const snitt of [0, 1, 2]) fel.push(...matFigur({ kind: 'kropp', h: fulla, blick, snitt }, 1.27, `full ${blick} ${snitt}`))
    }
    for (let i = 0; i < 200; i++) fel.push(...matFigur({ kind: 'kropp', h: slump(1000 + i), blick: i % 2 ? 'l' : 'r', snitt: i % 3 }, 1.27, `slump ${i}`))
    expect(fel).toEqual([])
  })
})

describe('kopiespärren för de nya typerna', () => {
  const kropp = nya.find((q) => typ(q) === 'snitt' && q.referens.blick === 'l')
  it('en kropp vriden ett kvarts varv och sedd från den andra sidan är samma uppgift', () => {
    // tittarramen för 'r' är h'[N-1-i][d]; h'[y][x] = h[x][2-y] ger samma ram som (h, 'l')
    const h = kropp.referens.h
    const h2 = [0, 1, 2].map((y) => [0, 1, 2].map((x) => h[x][2 - y]))
    const ny = { ...kopia(kropp), id: 'test-k', referens: { ...kropp.referens, h: h2, blick: 'r' } }
    expect(verifieraFraga(ny).fel).toEqual([])
    expect(kanoniskNyckel(ny)).toBe(kanoniskNyckel(kropp))
    expect(dubbletter([...alla, ny]).fel.some((t: string) => t.startsWith('test-k:'))).toBe(true)
  })
  it('hela uppgiften speglad på skärmen (grå och vita sidor byter plats) är samma uppgift', () => {
    const h = kropp.referens.h
    const ny = kopia(kropp)
    ny.id = 'test-ks'
    ny.referens = { ...kropp.referens, h: [0, 1, 2].map((y) => [0, 1, 2].map((x) => h[x][y])), blick: 'r' }
    // alternativen speglas i sidled
    ny.options = ny.options.map((o: Q) => ({ ...o, cells: o.cells.map(([r, c]: number[]) => [r, 2 - c]) }))
    ny.forklaring = K.forklaringK('snitt', K.facitK('snitt', ny.referens.h, 'r', ny.referens.snitt))
    expect(verifieraFraga(ny).fel).toEqual([])
    expect(kanoniskNyckel(ny)).toBe(kanoniskNyckel(kropp))
  })
  it('en speglingsuppgift med samma figur och facit som en vridningsuppgift i form A fälls', () => {
    const g = alla.find((q) => q.form === 'A' && q.niva === 'grund' && q.fran_version === 1 && q.vridning === 180)
    const ref = { cells: g.referens.cells }
    const facit = S.speglaI(ref, ['v', 'h'])
    expect(JSON.stringify(facit.cells)).toBe(JSON.stringify(S.speglaI({ cells: g.options[g.correctAnswer].cells }, []).cells))
    const ny = { ...kopia(g), id: 'test-s', fran_version: 5, referens: { ...g.referens, axlar: ['v', 'h'] } }
    expect(kanoniskNyckel(ny)).toBe(kanoniskNyckel(g))
    expect(dubbletter([...alla, ny]).fel.some((t: string) => t.startsWith('test-s:'))).toBe(true)
  })
  it('en speglingsuppgift vriden ett kvarts varv, med linjerna vridna, är samma uppgift', () => {
    const q = nya.find((x) => typ(x) === 'spegling' && x.niva === 'avancerad')
    const n = q.n
    const vr = (f: Q) => ({ ...f, cells: f.cells.map(([r, c]: number[]) => [c, n - 1 - r]) })
    const VR: Record<string, string> = { v: 'h', h: 'v', d: 'a', a: 'd' }
    const axlar = q.referens.axlar.map((a: string) => VR[a])
    const ny = { ...q, id: 'test-sv', referens: { ...vr(q.referens), axlar }, options: q.options.map(vr), fraga: S.fragaS(axlar) }
    expect(verifieraFraga(ny).fel).toEqual([])
    expect(kanoniskNyckel(ny)).toBe(kanoniskNyckel(q))
  })
})

describe('verifieraren fäller fel i de nya typerna', () => {
  it('kropp: fel facit, ett alternativ som inte är staplar, och en kropp där en dold stapel ändrar svaret', () => {
    const q = kopia(nya.find((x) => typ(x) === 'vy'))
    q.correctAnswer = (q.correctAnswer + 1) % 4
    expect(verifieraFraga(q).fel.join(' | ')).toMatch(/facit står på/)
    const r = kopia(nya.find((x) => typ(x) === 'vy'))
    r.options[(r.correctAnswer + 1) % 4] = { kind: 'brick', n: 3, cells: [[0, 0], [2, 0], [2, 1], [2, 2]] }
    expect(verifieraFraga(r).fel.join(' | ')).toMatch(/inte staplar/)
    // en låg stapel rakt bakom en hög syns inte: [1,1,1] bakom [2,2,2] kunde lika gärna vara tom
    expect(K.entydigtFacit('snitt', [[1, 1, 1], [2, 2, 2], [1, 1, 1]], 'l', 0)).toBe(false)
    const s = kopia(nya.find((x) => typ(x) === 'snitt' && x.referens.blick === 'l'))
    s.referens = { ...s.referens, h: [[1, 2, 1], [2, 3, 2], [1, 1, 1]], snitt: 0 }
    expect(verifieraFraga(s).fel.join(' | ')).toMatch(/ritas likadant men ger ett annat facit/)
  })
  it('spegling: linjerna i fel ordning i frågan, och ett facit som bara är en spegling', () => {
    const q = kopia(nya.find((x) => typ(x) === 'spegling' && x.niva === 'avancerad'))
    q.fraga = S.fragaS([...q.referens.axlar].reverse() as [string, string])
    expect(verifieraFraga(q).fel.join(' | ')).toMatch(/nämner inte linjerna/)
    const r = kopia(nya.find((x) => typ(x) === 'spegling' && x.niva === 'grund'))
    r.referens.axlar = ['v']
    expect(verifieraFraga(r).fel.join(' | ')).toMatch(/går inte att läsa/)
  })
})

describe('spärrarna för de nya typerna', () => {
  it('SP-K: kropp och spegling klarar sina spärrar, och fixturer fälls', () => {
    for (const q of nya.filter((x) => typ(x) === 'vy' || typ(x) === 'snitt')) expect(K.sparrarK(q), q.id).toEqual([])
    for (const q of nya.filter((x) => typ(x) === 'spegling')) expect(S.sparrarS(q), q.id).toEqual([])
    const q = kopia(nya.find((x) => typ(x) === 'vy'))
    const i = q.typer.findIndex((t: string) => t === 'bakifran')
    if (i >= 0) {
      q.typer[i] = 'framre_raden'
      expect(K.sparrarK(q).join(' | ')).toMatch(/SP-K5/)
    }
    const s = kopia(nya.find((x) => typ(x) === 'spegling' && x.niva === 'grund'))
    s.referens.cells = [[0, 0], [0, 1], [0, 2], [1, 1], [2, 1]] // T-pentominon har spegelsymmetri
    expect(S.sparrarS(s).join(' | ')).toMatch(/SP-S2/)
  })
})

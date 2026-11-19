// @vitest-environment node
/**
 * Frågebanken 2026-11-19, omgång 2 (docs/fragebank/spatial-2026-11-19-omg2.md):
 * 100 nya uppgifter med fran_version 4, aktiva sedan 2026-11-19. De påverkar inte
 * version 1 till 3, klarar den oberoende verifieraren, och kopiespärren fäller
 * samma uppgift i en annan startvridning på alla nivåer. sp-g-c-15 är
 * pensionerad från version 4 (kopia av sp-g-c-01).
 */
import { describe, expect, it } from 'vitest'
// @ts-ignore ren JavaScript
import { verifieraBanker, verifieraFraga, kanoniskNyckel, dubbletter, hornUppgift, HORN_ANTAL, SIDA3D, upp3D } from '../../../../scripts/spatial-verifiera.mjs'
// @ts-ignore ren JavaScript
import * as B from '../../../../scripts/lib/spatial/vikning.mjs'
import { poolFor, valjSpatial, perFormFor, FORMER, SPATIAL_VERSION, allaSpatial } from '../select'

const NIVAER = ['grund', 'avancerad', 'expert'] as const
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Q = any
const kopia = (q: Q): Q => JSON.parse(JSON.stringify(q))

describe('bankversion 4', () => {
  it('100 nya uppgifter, sist i bankerna, med unika id och en tredjedel per nivå', () => {
    const nya = allaSpatial().filter((q) => q.fran_version === 4)
    expect(nya.length).toBe(100)
    const ids = allaSpatial().map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const n of NIVAER) {
      const pool = poolFor(n, 4)
      const forsta = pool.findIndex((q) => q.fran_version === 4)
      expect(pool.slice(forsta).every((q) => q.fran_version === 4), n).toBe(true)
      expect(pool.length - forsta).toBeGreaterThanOrEqual(33)
    }
  })
  it('version 1 till 3 drar ur samma pool som förut, och version 4 är inte aktiv', () => {
    for (const n of NIVAER) {
      expect(poolFor(n, 3).length).toBe(129)
      expect(poolFor(n, 3).some((q) => q.fran_version === 4)).toBe(false)
    }
    expect(SPATIAL_VERSION).toBeGreaterThanOrEqual(4)
  })
  it('version 4: samma fördelning per form och aldrig två av samma form i följd', () => {
    for (const niva of NIVAER) {
      for (let s = 0; s < 60; s++) {
        const u = valjSpatial(niva, `v4-${s}`, 4)
        expect(u.length).toBe(15)
        const antal = Object.fromEntries(FORMER.map((f) => [f, u.filter((q) => q.form === f).length]))
        expect(antal).toEqual(perFormFor(4))
        for (let i = 1; i < u.length; i++) expect(u[i].form).not.toBe(u[i - 1].form)
      }
    }
  })
  it('den oberoende verifieraren hittar inga fel i någon uppgift, och inga kopior bland de nya', () => {
    const res = verifieraBanker()
    expect(res.fel).toEqual([])
    expect(res.antal).toBe(allaSpatial().length)
  })
})

describe('kopiespärren mot alla nivåer', () => {
  const alla = allaSpatial() as Q[]
  it('fäller en ny uppgift som är en befintlig på en annan nivå', () => {
    const g = kopia(alla.find((q) => q.niva === 'grund' && q.form === 'A' && q.fran_version === 1))
    const ny = { ...g, id: 'test-a', niva: 'avancerad', fran_version: 4 }
    expect(dubbletter([...alla, ny]).fel.some((t: string) => t.startsWith('test-a:'))).toBe(true)
  })
  it('fäller en brickuppgift i en annan startvridning (referens och facit vridna lika)', () => {
    const q = kopia(alla.find((x) => x.form === 'A' && x.niva === 'expert'))
    const vrid = (f: Q) => ({ ...f, cells: f.cells.map(([r, c]: number[]) => [c, q.n - 1 - r]), mark: f.mark ? [f.mark[1], q.n - 1 - f.mark[0]] : f.mark })
    const ny = { ...q, id: 'test-av', fran_version: 4, referens: vrid(q.referens), options: q.options.map(vrid) }
    expect(verifieraFraga(ny).fel).toEqual([])
    expect(kanoniskNyckel(ny)).toBe(kanoniskNyckel(q))
  })
  it('tärningens hörn: sex avbildningar, och varje avbildad uppgift är lika giltig och får samma nyckel', () => {
    expect(HORN_ANTAL()).toBe(6)
    for (const q of alla.filter((x) => x.form === 'C' && x.referens.kind === 'kub')) { // tärningarna; kropparna (version 5) har inget hörn
      for (let i = 0; i < 6; i++) {
        const h = hornUppgift(q, i)
        expect(verifieraFraga(h).fel, `${q.id} ${i}`).toEqual([])
        expect(kanoniskNyckel(h)).toBe(kanoniskNyckel(q))
      }
    }
  })
  it('en tärning med hörnet vridet ett tredjedels varv fälls som kopia', () => {
    const q = alla.find((x) => x.form === 'C' && x.niva === 'expert' && x.fran_version === 1)
    const ny = { ...hornUppgift(q, 1), id: 'test-c', fran_version: 4 }
    expect(JSON.stringify(ny.referens)).not.toBe(JSON.stringify(q.referens))
    expect(dubbletter([...alla, ny]).fel.some((t: string) => t.startsWith('test-c:'))).toBe(true)
  })
})

describe('nya vikningsformer på grund och avancerad B', () => {
  const nyaB = (allaSpatial() as Q[]).filter((q) => q.form === 'B' && q.fran_version === 4)
  it('grund har diagonal halvvikning, remsa och två hål; avancerad remsa först och två hål', () => {
    const g = nyaB.filter((q) => q.niva === 'grund')
    expect(g.some((q) => ['d', 'a'].includes(q.vikningar[0].typ))).toBe(true)
    expect(g.some((q) => ['v', 'h'].includes(q.vikningar[0].typ) && q.vikningar[0].k !== 2)).toBe(true)
    expect(g.some((q) => q.sekvens.at(-1).hal.length === 2)).toBe(true)
    const a = nyaB.filter((q) => q.niva === 'avancerad')
    expect(a.some((q) => ['v', 'h'].includes(q.vikningar[0].typ) && q.vikningar[0].k !== 2)).toBe(true)
    expect(a.some((q) => q.sekvens.at(-1).hal.length === 2)).toBe(true)
  })
  it('SP-B1 fäller ett hål på diagonalen i en diagonal halvvikning', () => {
    const q = kopia(nyaB.find((x) => x.niva === 'grund' && x.vikningar[0].typ === 'd'))
    q.sekvens[q.sekvens.length - 1].hal = [[1, 1]]
    expect((B.sparrarB(q) as string[]).join(' | ')).toMatch(/SP-B1/)
    expect(verifieraFraga(q).fel.join(' | ')).toMatch(/viklinje delar/)
  })
  it('SP-B2 fäller två stansade hål på expert', () => {
    const e = kopia((allaSpatial() as Q[]).find((x) => x.form === 'B' && x.niva === 'expert'))
    e.sekvens[e.sekvens.length - 1].hal.push([9, 9])
    expect((B.sparrarB(e) as string[]).join(' | ')).toMatch(/SP-B2 2 stansade hål/)
  })
})

describe('expert C: förklaringen med grannar', () => {
  it('pilen eller triangeln pekar mot eller bort från de sidor texten nämner, räknat på det som ritas', () => {
    const nya = (allaSpatial() as Q[]).filter((q) => q.form === 'C' && q.niva === 'expert' && q.fran_version === 4)
    expect(nya.length).toBe(8)
    const BEST: Record<string, string> = { prick: 'pricken', ring: 'ringen', stjarna: 'stjärnan', kvadrat: 'kvadraten', fkvadrat: 'den fyllda kvadraten', dubbelring: 'dubbelringen', triangel: 'triangeln', pil: 'pilen' }
    const sidor = ['t', 'l', 'r'] as const
    // riktningen i vyn v: 'mot X' eller 'bort från X' för de synliga grannarna
    const pekar = (v: Q, sym: string) => {
      const p = sidor.find((s) => v[s].symbol === sym)!
      const u = upp3D(p, v[p].riktning) as number[]
      for (const s of sidor) {
        const n = (SIDA3D as Q)[s].n as number[]
        if (u.every((x, i) => x === n[i])) return `mot ${BEST[v[s].symbol]}`
        if (u.every((x, i) => x === -n[i])) return `bort från ${BEST[v[s].symbol]}`
      }
      return null
    }
    for (const q of nya) {
      const facit = q.options[q.correctAnswer]
      const delad = sidor.map((s) => q.referens[s].symbol).find((s) => sidor.some((t) => facit[t].symbol === s))!
      const subj = delad === 'pil' ? 'pilen' : 'triangelns spets'
      const forsta = pekar(q.referens, delad)
      const nu = pekar(facit, delad)
      expect(forsta && nu, q.id).toBeTruthy()
      expect(q.forklaring, q.id).toContain(`På den första pekar ${subj} ${forsta}.`)
      expect(q.forklaring.toLowerCase(), q.id).toContain(`${subj} pekar därför ${nu}.`)
    }
  })
})

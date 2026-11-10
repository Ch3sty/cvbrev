// @vitest-environment node
/**
 * Spatial förmåga (brief-tester-steg2-2026-11-09.md avsnitt 2): bankerna
 * klarar formernas spärrar och geometrin i riktig SVG, en fixtur per spärr
 * som fälls, urvalet och serverns API.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
// @ts-ignore ren JavaScript
import { valideraSpatial } from '../../../../scripts/validate-spatial.mjs'
// @ts-ignore ren JavaScript
import * as A from '../../../../scripts/lib/spatial/brick.mjs'
// @ts-ignore ren JavaScript
import * as B from '../../../../scripts/lib/spatial/vikning.mjs'
// @ts-ignore ren JavaScript
import * as C from '../../../../scripts/lib/spatial/kub.mjs'
// @ts-ignore ren JavaScript
import * as Dmod from '../../../../scripts/lib/spatial/hopvikning.mjs'
const D: any = Dmod // eslint-disable-line @typescript-eslint/no-explicit-any
import { matSpatialBank } from '../svgMatt'
import { valjSpatial, poolFor, FORMER, PER_FORM, perFormFor } from '../select'
import { spatialInnehall, hittaSpatial, bedomSpatialSvar, rattaSpatialSvar } from '../fragor.server'
import type { SpatialFraga } from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Q = any
const bank = (n: string): Q[] => JSON.parse(readFileSync(`src/lib/spatialV1/bank${n}.json`, 'utf8'))
const kopia = (q: Q): Q => JSON.parse(JSON.stringify(q))
const NIVAER = ['Grund', 'Avancerad', 'Expert']

describe('bankerna', () => {
  it('klarar formernas spärrar', async () => {
    expect(await valideraSpatial()).toEqual([])
  })
  it('klarar geometrin i riktig SVG (G2, G10, V2, V11, V12, formernas mått)', () => {
    for (const n of NIVAER) expect(matSpatialBank(bank(n) as SpatialFraga[]).fel).toEqual([])
  })
})

describe('form A: spärrfixturer', () => {
  const ett = (n = 'Avancerad') => kopia(bank(n).find((q: Q) => q.form === 'A'))
  const fel = (q: Q) => (A.sparrarA(q) as string[]).join('\n')

  it('SP-A1 fäller en figur med rotationssymmetri', () => {
    const q = ett()
    q.referens.cells = [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2], [2, 3]].slice(0, 4) // S-tetromino, 180 grader symmetrisk
    expect(fel(q)).toMatch(/SP-A1/)
  })
  it('SP-A2 fäller en figur med spegelsymmetri', () => {
    const q = ett()
    q.referens.cells = [[0, 0], [0, 1], [0, 2], [1, 0], [2, 0]] // V-formen, symmetrisk i diagonalen
    expect(fel(q)).toMatch(/SP-A2/)
  })
  it('SP-A3 fäller två lika alternativ och referensen ovriden', () => {
    const q = ett()
    const d = q.correctAnswer === 0 ? 1 : 0
    q.options[d] = { ...q.referens }
    expect(fel(q)).toMatch(/SP-A3 ett alternativ är referensen ovriden/)
    q.options[d] = { ...q.options[q.correctAnswer] }
    expect(fel(q)).toMatch(/SP-A3 två alternativ är lika/)
  })
  it('SP-A4 fäller en "flyttad ruta" som blev en spegling', () => {
    const q = ett('Grund')
    const i = q.typer.indexOf('flyttad')
    q.options[i] = { kind: 'brick', n: q.n, ...A.spegla(q.referens, 'vagrat') }
    expect(fel(q)).toMatch(/SP-A4/)
  })
  it('SP-A5 fäller 180 grader på en nästan punktsymmetrisk figur', () => {
    const fig = { cells: [[0, 0], [0, 1], [1, 1], [2, 1], [2, 2]] } // Z-pentomino (punktsymmetrisk)
    const q = { ...ett('Grund'), vridning: 180, referens: { kind: 'brick', n: 3, ...fig } }
    expect(fel(q)).toMatch(/SP-A5/)
  })
  it('SP-A6 fäller en distraktor som inte liknar facit på expert', () => {
    const q = kopia(bank('Expert').find((x: Q) => x.form === 'A'))
    const d = q.correctAnswer === 0 ? 1 : 0
    q.options[d] = { kind: 'brick', n: 5, cells: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 4], [2, 4]], mark: [0, 0] }
    expect(fel(q)).toMatch(/SP-A6/)
  })
  it('SP-A7 fäller ett L på grund', () => {
    const q = ett('Grund')
    q.referens.cells = [[0, 0], [1, 0], [2, 0], [2, 1]]
    expect(fel(q)).toMatch(/SP-A7/)
  })
  it('facit är en vridning, och spegelbilder går aldrig att vrida tillbaka', () => {
    for (const n of NIVAER) {
      for (const q of bank(n).filter((x: Q) => x.form === 'A')) {
        const vr = A.vridningar(q.referens).map(A.nyckel)
        expect(vr.slice(1)).toContain(A.nyckel(q.options[q.correctAnswer]))
        expect(A.nyckel(A.vrid(q.referens, q.vridning))).toBe(A.nyckel(q.options[q.correctAnswer]))
      }
    }
  })
})

describe('form B: vikningsmotorn och spärrfixturer', () => {
  const ett = (n = 'Avancerad') => kopia(bank(n).find((q: Q) => q.form === 'B'))
  const fel = (q: Q) => (B.sparrarB(q) as string[]).join(' | ')

  it('briefens exempel: nedre halvan upp, högra över vänstra, hål i rad 0 kolumn 1 ger fyra hål', () => {
    const v = [{ typ: 'h', k: 2, flytt: 1 }, { typ: 'v', k: 2, flytt: 1 }]
    const r = B.vik(v)
    const ut = B.uppvik([[0, 1]], v, r!.steg.map((s: Q) => s.fore)).slut.map((x: number[]) => x.join(',')).sort()
    expect(ut).toEqual(['0,1', '0,2', '3,1', '3,2'])
  })
  it('framlänges och baklänges ger samma hål för varje uppgift (SP-B0)', () => {
    for (const n of NIVAER) for (const q of bank(n).filter((x: Q) => x.form === 'B')) expect(fel(q), q.id).not.toMatch(/SP-B0|stämmer inte/)
  })
  it('SP-B1 fäller ett hål på en viklinje', () => {
    const q = kopia(bank('Avancerad').find((x: Q) => x.form === 'B' && x.vikningar.some((v: Q) => v.typ === 'd' || v.typ === 'a')) ?? ett())
    const v = q.vikningar.find((x: Q) => x.typ === 'd' || x.typ === 'a')
    if (v) {
      q.sekvens[q.sekvens.length - 1].hal = [v.typ === 'd' ? [v.k > 0 ? v.k : 0, v.k > 0 ? 0 : -v.k] : [0, v.k - 1]]
      expect(fel(q)).toMatch(/SP-B1/)
    }
  })
  it('SP-B3 fäller två lika alternativ', () => {
    const q = ett()
    const d = q.correctAnswer === 0 ? 1 : 0
    q.options[d] = kopia(q.options[q.correctAnswer])
    expect(fel(q)).toMatch(/SP-B3/)
  })
  it('SP-B4 fäller ett facit som är symmetriskt kring en axel som inte vikts', () => {
    const q = kopia(bank('Grund').find((x: Q) => x.form === 'B' && x.vikningar[0].typ === 'v'))
    q.sekvens[1].hal = [[0, q.vikningar[0].flytt === 1 ? 1 : 2]]
    q.options[q.correctAnswer] = { kind: 'ark-ut', n: 4, hal: [[0, 1], [0, 2], [3, 1], [3, 2]], klipp: [] }
    expect(fel(q)).toMatch(/SP-B4|SP-B0|stämmer inte/)
  })
  it('SP-B5 fäller en pil som pekar fel', () => {
    const q = ett()
    q.sekvens[0].pil = [q.sekvens[0].pil[1], q.sekvens[0].pil[0]]
    expect(fel(q)).toMatch(/SP-B5/)
  })
  it('SP-B6 fäller klipp på grund och ett klipp mitt i det vikta arket', () => {
    const g = kopia(bank('Grund').find((x: Q) => x.form === 'B'))
    g.sekvens[g.sekvens.length - 1].klipp = [[0, 0]]
    expect(fel(g)).toMatch(/klipp på grund/)
    const e = kopia(bank('Expert').find((x: Q) => x.form === 'B'))
    e.sekvens[e.sekvens.length - 1].klipp = []
    expect(fel(e)).toMatch(/SP-B6/)
  })
  it('SP-B7 fäller fem rutor i sekvensen', () => {
    const q = kopia(bank('Expert').find((x: Q) => x.form === 'B'))
    q.sekvens.unshift(q.sekvens[0])
    expect(fel(q)).toMatch(/SP-B7/)
  })
  it('papperet får aldrig hänga i ett hörn eller sakna en hel rad', () => {
    expect(B.papperHel([[0, 1], [1, 0]])).toBe(false)
    expect(B.papperHel([[0, 0], [1, 0], [2, 0], [3, 0]])).toBe(false)
    expect(B.papperHel([[3, 1], [3, 2]])).toBe(true)
  })
})

describe('form C: tärningar, lösaren och spärrfixturer', () => {
  const ett = (n = 'Avancerad') => kopia(bank(n).find((q: Q) => q.form === 'C'))
  const fel = (q: Q) => (C.sparrarC(q) as string[]).join(' | ')
  const vy = (v: Q): Q => ({ t: v.t, l: v.l, r: v.r })

  it('24 vridningar, alla olika', () => {
    expect(C.VRIDNINGAR.length).toBe(24)
    expect(new Set(C.VRIDNINGAR.map((M: Q) => JSON.stringify(M))).size).toBe(24)
  })
  it('varje vy av kuben går ihop med referensen, ingen vy av spegelbilden gör det (kiraliteten)', () => {
    for (const n of NIVAER) {
      for (const q of bank(n).filter((x: Q) => x.form === 'C')) {
        const ref = vy(q.referens)
        for (const Q of C.VRIDNINGAR) expect(C.konsistent(ref, C.vy(q.kub, Q))).toBe(true)
        const sp = C.spegla(q.kub)
        const speglade = C.VRIDNINGAR.map((Q: Q) => C.vy(sp, Q)).filter((v: Q) => ['t', 'l', 'r'].every((p) => ['t', 'l', 'r'].some((r) => ref[r].symbol === v[p].symbol)))
        for (const v of speglade) expect(C.konsistent(ref, v)).toBe(false)
      }
    }
  })
  it('SP-C1 och SP-C3 fäller en distraktor som också är en vy av kuben', () => {
    const q = ett()
    const d = q.correctAnswer === 0 ? 1 : 0
    q.options[d] = { kind: 'kub', ...C.vy(q.kub, C.VRIDNINGAR[5]) }
    expect(fel(q)).toMatch(/SP-C1|SP-C3/)
  })
  it('SP-C2 fäller ett spegelvänt facit', () => {
    const q = ett()
    const sp = C.spegla(q.kub)
    q.options[q.correctAnswer] = { kind: 'kub', ...C.vy(sp, q.orientering) }
    expect(fel(q)).toMatch(/SP-C2/)
  })
  it('SP-C4 fäller en vriden riktningslös symbol', () => {
    const q = ett('Grund')
    q.options[0].t = { ...q.options[0].t, riktning: 2 }
    expect(fel(q)).toMatch(/SP-C4/)
  })
  it('SP-C5 fäller samma symbol två gånger i en vy', () => {
    const q = ett()
    const d = q.correctAnswer === 0 ? 1 : 0
    q.options[d].l = { ...q.options[d].t }
    expect(fel(q)).toMatch(/SP-C5/)
  })
  it('SP-C7 fäller två spegelvända distraktorer', () => {
    const q = ett()
    const sp = C.spegla(q.kub)
    const refSp = C.vy(sp, C.VRIDNINGAR.find((M: Q) => M[0][0] === 1 && M[1][1] === 1 && M[2][2] === 1))
    const andra = C.VRIDNINGAR.map((Q: Q) => C.vy(sp, Q)).filter((v: Q) => C.konsistent(refSp, v) && C.vyNyckel(v) !== C.vyNyckel(refSp))
    const d = [0, 1, 2, 3].filter((i) => i !== q.correctAnswer)
    q.options[d[0]] = { kind: 'kub', ...refSp }
    q.options[d[1]] = { kind: 'kub', ...andra[0] }
    expect(fel(q)).toMatch(/SP-C7/)
  })
  it('expert: de tre distraktorerna har rätt sidor och en riktning fel var', () => {
    for (const q of bank('Expert').filter((x: Q) => x.form === 'C')) {
      expect(q.typer.filter((t: string) => t === 'vriden').length).toBe(3)
    }
  })
})

describe('urvalet och API:t', () => {
  it('version 2: 4 A, 3 B, 4 C och 4 D, och aldrig två av samma form i följd', () => {
    for (const niva of ['grund', 'avancerad', 'expert'] as const) {
      for (let s = 0; s < 100; s++) {
        const u = valjSpatial(niva, `s-${s}`)
        expect(u.length).toBe(15)
        const antal = Object.fromEntries(FORMER.map((f) => [f, u.filter((q) => q.form === f).length]))
        expect(antal).toEqual(perFormFor(2))
        for (let i = 1; i < u.length; i++) expect(u[i].form, `${niva} ${s} ${i}`).not.toBe(u[i - 1].form)
      }
    }
  })
  it('version 1: gamla sessioner får fem av A, B och C och aldrig form D', () => {
    for (const niva of ['grund', 'avancerad', 'expert'] as const) {
      for (let s = 0; s < 50; s++) {
        const u = valjSpatial(niva, `s-${s}`, 1)
        expect(u.length).toBe(15)
        expect(u.some((q) => q.form === 'D')).toBe(false)
        for (const f of ['A', 'B', 'C']) expect(u.filter((q) => q.form === f).length).toBe(PER_FORM)
      }
    }
  })
  it('klienten får aldrig facit under testet, och svaren rättas på originalindex', () => {
    const s = { id: 'sess-1', test_type: 'spatial-avancerad', meta: { alternativ_blandade: true, spatial_version: 1 }, completed_at: null }
    const inn = spatialInnehall(s)
    expect(inn.genomgang).toBeNull()
    expect(JSON.stringify(inn.fragor)).not.toMatch(/correctAnswer|misstag|forklaring|typer/)
    const q = hittaSpatial(inn.fragor[0].id)!
    const g = spatialInnehall({ ...s, completed_at: 'nu' }).genomgang![0]
    expect(bedomSpatialSvar(q, s.id, true, g.rattVisat)?.correct).toBe(true)
    const sel = bedomSpatialSvar(q, s.id, true, g.rattVisat)!.selected
    expect(rattaSpatialSvar([{ q_id: q.id, selected: sel }])).toBe(1)
  })
})

describe('form D: pappersvikning ihopvikt, motorn och spärrfixturer', () => {
  const alla = (n: string) => bank(n).filter((q: Q) => q.form === 'D')
  const ett = (n = 'Avancerad') => kopia(alla(n)[0])
  const fel = (q: Q) => (D.sparrarD(q) as string[]).join(' | ')

  it('minst 24 uppgifter per nivå, med version 2', () => {
    for (const n of NIVAER) {
      expect(alla(n).length).toBeGreaterThanOrEqual(24)
      for (const q of alla(n)) expect(q.fran_version).toBe(2)
    }
  })
  it('distraktorerna varierar: ingen typ eller uppsättning dominerar nivån (testansvarig 2026-11-10)', () => {
    for (const n of NIVAER) {
      const b = alla(n)
      const andel = (t: string) => b.filter((q: Q) => q.typer.includes(t)).length / b.length
      expect(andel('hal_extra'), n).toBeLessThanOrEqual(0.6)
      expect(andel('hal_saknas'), n).toBeGreaterThanOrEqual(0.3)
      expect(andel('spegelvand'), n).toBeGreaterThanOrEqual(0.3)
      if (n !== 'Grund') expect(andel('klipp_fel_kant'), n).toBeGreaterThanOrEqual(0.4)
      const set = new Map<string, number>()
      for (const q of b) {
        const k = q.typer.filter(Boolean).sort().join('+')
        set.set(k, (set.get(k) ?? 0) + 1)
      }
      expect(Math.max(...set.values()) / b.length, n).toBeLessThanOrEqual(0.5)
    }
  })
  it('expert har tre vikningar, minst fyra hål i arket och fel linje med samma ram som facit', () => {
    for (const q of alla('Expert')) {
      expect(q.vikningar.length).toBe(3)
      expect(q.ark.hal.length).toBeGreaterThanOrEqual(4)
    }
    for (const n of ['Avancerad', 'Expert'])
      for (const q of alla(n)) q.typer.forEach((t: string, i: number) => t === 'fel_linje' && expect(D.samRam(q.options[i], q.options[q.correctAnswer]), q.id).toBe(true))
  })
  it('ett handräknat exempel: högra halvan över den vänstra, ett hål syns och ett täcks', () => {
    const v = [{ typ: 'v', k: 2, flytt: 1 }]
    const ark = { hal: [[3, 0], [3, 2], [3, 3]], klipp: [] }
    const u = D.hopvik(ark, v)
    expect(u.hal).toEqual([[3, 0]])
    expect(u.dolda.map((d: Q) => d.ruta)).toEqual([[3, 1]])
    expect(D.hopvikBaklanges(ark, v).hal).toEqual([[3, 0]])
  })
  it('ett klipp syns bara där alla lager är klippta', () => {
    const v = [{ typ: 'h', k: 2, flytt: -1 }]
    expect(D.hopvik({ hal: [], klipp: [[0, 0], [3, 0]] }, v).klipp).toEqual([[3, 0]])
    expect(D.hopvik({ hal: [], klipp: [[3, 0]] }, v).klipp).toEqual([])
  })
  it('facit framlänges och baklänges ger samma figur för varje uppgift (SP-B2-1)', () => {
    for (const n of NIVAER)
      for (const q of alla(n)) {
        const fram = D.hopvik(q.ark, q.vikningar)
        const bak = D.hopvikBaklanges(q.ark, q.vikningar)
        expect(D.figurNyckel(D.stansFigur(fram)), q.id).toBe(D.figurNyckel(D.stansFigur(bak)))
        expect(D.figurNyckel(q.options[q.correctAnswer]), q.id).toBe(D.figurNyckel(D.stansFigur(fram)))
      }
  })
  it('SP-B2-1 fäller ett facit som inte stämmer med vikningen', () => {
    const q = ett()
    q.options[q.correctAnswer] = { ...q.options[q.correctAnswer], hal: [] }
    expect(fel(q)).toMatch(/SP-B2-1/)
  })
  it('SP-B2-2 fäller två lika alternativ och en distraktor som är facit vridet', () => {
    const q = ett()
    const d = q.correctAnswer === 0 ? 1 : 0
    q.options[d] = kopia(q.options[q.correctAnswer])
    expect(fel(q)).toMatch(/SP-B2-2 två alternativ är lika/)
    // facit vridet ett halvt varv i sin ram, på en uppgift där det skiljer sig från facit
    const g = alla('Grund').map(kopia).find((x: Q) => {
      const f = x.options[x.correctAnswer]
      return D.vridnaNycklar(f)[1] !== D.figurNyckel(f)
    })
    const dg = g.correctAnswer === 0 ? 1 : 0
    const f = g.options[g.correctAnswer]
    const xs = f.poly.map((p: number[]) => p[0])
    const ys = f.poly.map((p: number[]) => p[1])
    const [c0, c1, r0, r1] = [Math.min(...xs), Math.max(...xs) - 1, Math.min(...ys), Math.max(...ys) - 1]
    g.options[dg] = { ...f, hal: f.hal.map(([r, c]: number[]) => [r0 + r1 - r, c0 + c1 - c]) }
    expect(fel(g)).toMatch(/SP-B2-2 alternativ [0-9] är facit vridet/)
  })
  it('SP-B2-3 fäller ett spegelsymmetriskt facit', () => {
    const q = ett('Grund')
    const f = q.options[q.correctAnswer]
    const xs = f.poly.map((p: number[]) => p[0])
    const ys = f.poly.map((p: number[]) => p[1])
    const [c0, c1, r0] = [Math.min(...xs), Math.max(...xs) - 1, Math.min(...ys)]
    q.options[q.correctAnswer] = { ...f, hal: [[r0, c0], [r0, c1]] }
    expect(fel(q)).toMatch(/SP-B2-3/)
  })
  it('SP-B2-4 fäller en uppgift utan dolt hål', () => {
    const q = ett('Grund')
    const u = D.hopvik(q.ark, q.vikningar)
    q.ark = { ...q.ark, hal: q.ark.hal.filter((h: number[]) => !u.dolda.some((d: Q) => q.vikningar && D.hopvik({ hal: [h], klipp: [] }, q.vikningar).dolda.some((x: Q) => x.ruta.join() === d.ruta.join()))) }
    expect(fel(q)).toMatch(/SP-B2-4|SP-B2-1/)
  })
  it('SP-B2-6 fäller klipp på grund', () => {
    const q = ett('Grund')
    q.ark = { ...q.ark, klipp: [[0, 0]] }
    expect(fel(q)).toMatch(/SP-B2-6 klipp på grund/)
  })
  it('SP-B2-7 fäller en pil som pekar fel och en rad hål i en senare ruta', () => {
    const q = ett()
    q.sekvens[0].pil = [q.sekvens[0].pil[1], q.sekvens[0].pil[0]]
    expect(fel(q)).toMatch(/SP-B2-7 pilen i ruta 1 pekar fel/)
    const r = ett()
    r.sekvens[1].hal = [[0, 0]]
    expect(fel(r)).toMatch(/SP-B2-7 ruta 2 visar hål/)
  })
  it('SP-B2-8 fäller en pil som ligger över ett hål', () => {
    const q = ett('Grund')
    const [r, c] = q.ark.hal[0]
    q.sekvens[0].pil = [[c + 0.1, r + 0.5], [c + 0.9, r + 0.5]]
    expect(fel(q)).toMatch(/SP-B2-8/)
  })
  it('SP-B2-9 fäller en genomgång som inte slutar i facit', () => {
    const q = ett()
    q.hopvikning = q.hopvikning.slice(0, -1)
    expect(fel(q)).toMatch(/SP-B2-9/)
  })
  it('genomgången visas efter testet och följer med till klienten', () => {
    const q = alla('Avancerad')[0] as SpatialFraga
    expect(q.hopvikning?.length).toBe(q.sekvens!.length + 1)
  })
})

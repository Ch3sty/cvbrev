// @vitest-environment node
/**
 * Klockan (figurserier parti 5, 2026-11-19): den nya primitiven `klocka` i
 * renderers.v7.tsx. Urtavlan är referens i ram-grått och prickad som
 * orbitalens bana, visarna är bläck från mitten och skiljs på längd och
 * bredd. Måtten kommer ur geometri.json, som v7-geometri-check.mjs räknar G1
 * till G4 och K1 på (alla 56 lägespar i --serie).
 *
 * Tillägget är bakåtkompatibelt: en ny gren i SvgCellV7 och inget annat i
 * renderaren. Att de befintliga figurerna ritas exakt som förut kontrolleras
 * här på ett urval, mot markup som är skriven ur koden före ändringen.
 */
import { describe, expect, it } from 'vitest'
import { GEOMETRI as G } from '../geometri'
import { cellSvg, primitivSvg, ramFel, taggar } from '../svgMatt'
import type { V7Cell } from '../types.v7'
// @ts-ignore ren JavaScript
import { lasCell, PRIM } from '../../../../scripts/lib/serie/celler-serie.mjs'
// @ts-ignore ren JavaScript
import { regelNyckel } from '../../../../scripts/lib/serie/struktur.mjs'

const K = G.klocka
const klocka = (lang: number, kort: number): V7Cell => ({ kind: 'klocka', lang, kort })
const attr = (t: string, namn: string) => Number(new RegExp(`\\s${namn}="([^"]*)"`).exec(t)?.[1])
const linjer = (svg: string) => taggar(svg).filter((t) => t.startsWith('<line'))
const langd = (t: string) => Math.hypot(attr(t, 'x2') - attr(t, 'x1'), attr(t, 'y2') - attr(t, 'y1'))

describe('klockan ritas', () => {
  it('urtavlan är en prickad cirkel i ram-grått, navet bläck', () => {
    const t = taggar(primitivSvg(klocka(1, 6)))
    const tavla = t.find((x) => x.startsWith('<circle') && x.includes('stroke-dasharray'))!
    expect(tavla).toContain(`r="${K.banaR}"`)
    expect(tavla).toContain(`stroke="${G.farger.ram}"`)
    expect(tavla).toContain(`stroke-dasharray="${K.banaStreck}"`)
    const nav = t.find((x) => x.startsWith('<circle') && x.includes(`r="${K.navR}"`))!
    expect(nav).toContain(`fill="${G.farger.fillBlack}"`)
  })

  it('två visare från mitten: den långa i kontur.sw, den korta kortare och bredare', () => {
    for (let lang = 0; lang < 8; lang++) for (let kort = 0; kort < 8; kort++) {
      if (lang === kort) continue
      const [kortL, langL] = linjer(primitivSvg(klocka(lang, kort)))
      expect(langd(langL)).toBeCloseTo(K.lang, 1)
      expect(langd(kortL)).toBeCloseTo(K.kort, 1)
      expect(attr(langL, 'stroke-width')).toBe(G.kontur.sw)
      expect(attr(kortL, 'stroke-width')).toBe(K.kortSw)
      // Läge 0 är klockan 12, medurs i 45-gradersteg, som pilen.
      const vinkel = (t: string) => ((Math.atan2(attr(t, 'x2') - 50, 50 - attr(t, 'y2')) * 180) / Math.PI + 360) % 360
      expect(vinkel(langL)).toBeCloseTo(lang * 45, 0)
      expect(vinkel(kortL)).toBeCloseTo(kort * 45, 0)
    }
  })

  it('ram-grått bara på urtavlan, ingen linje under 2,5, inga NaN', () => {
    const svg = cellSvg(klocka(3, 0))
    expect(ramFel(klocka(3, 0))).toEqual([])
    for (const t of taggar(svg)) {
      const m = /stroke-width="([\d.]+)"/.exec(t)
      if (m) expect(Number(m[1])).toBeGreaterThanOrEqual(2.5)
    }
    expect(svg).not.toMatch(/NaN|undefined/)
  })

  it('G5: visarna skiljer minst 10 px i längd på 360, urtavlan i yttermåttets fönster', () => {
    expect((K.lang - K.kort) * G.skala360.rutnat).toBeGreaterThanOrEqual(G.g5.minLangdskillnadPx)
    expect(2 * K.banaR).toBeGreaterThanOrEqual(G.regler.yttermatt[0])
    expect(2 * K.banaR).toBeLessThanOrEqual(G.regler.yttermatt[1])
    // G1: den långa visaren slutar minst minGap innanför urtavlans målade kant.
    expect(K.banaR - K.banaSw / 2 - (K.lang + G.kontur.sw / 2)).toBeGreaterThanOrEqual(G.regler.minGap)
  })
})

describe('klockan i generatorn', () => {
  it('läses tillbaka, utom när visarna pekar åt samma håll', () => {
    expect(lasCell(klocka(2, 5))).toEqual({ prim: 'klocka', v: { lang: 2, kort: 5 } })
    expect(lasCell(klocka(4, 4))).toBeNull()
    expect(PRIM.klocka.bygg({ lang: 9, kort: -1 })).toEqual({ kind: 'klocka', lang: 1, kort: 7 })
  })

  it('regelnyckeln räknar inga lägen: en vriden klockserie är samma nyckel', () => {
    const a = { regler: { prim: 'klocka', dims: { lang: { regel: 'steg', s0: 0, k: 1 }, kort: { regel: 'cykel', varden: [2, 5] } } } }
    const b = { regler: { prim: 'klocka', dims: { lang: { regel: 'steg', s0: 3, k: 1 }, kort: { regel: 'cykel', varden: [0, 5] } } } }
    const c = { regler: { prim: 'klocka', dims: { lang: { regel: 'steg', s0: 3, k: 1 }, kort: { regel: 'cykel', varden: [0, 1] } } } }
    expect(regelNyckel(a)).toBe(regelNyckel(b))
    expect(regelNyckel(a)).not.toBe(regelNyckel(c))
    const stilla = (v: number) => ({ regler: { prim: 'klocka', dims: { lang: { regel: 'steg', s0: 0, k: 3 }, kort: { regel: 'konstant', v } } } })
    expect(regelNyckel(stilla(2))).toBe(regelNyckel(stilla(6)))
  })
})

describe('de befintliga figurerna ritas som förut', () => {
  // Markup ur renderaren före klockan (2026-11-19), ordagrant.
  it('pil, orbital, prickbåge och duo', () => {
    expect(primitivSvg({ kind: 'dotsorbit', dots: [1, 2] })).toBe('<circle cx="71.21" cy="28.79" r="6" fill="#020617"></circle><circle cx="80.00" cy="50.00" r="6" fill="#020617"></circle>')
    expect(primitivSvg({ kind: 'vector', angle: 45, length: 'long', head: 'open' })).toBe(FORE.pil)
    expect(primitivSvg({ kind: 'orbital', center: 'filled', satellite: 2 })).toBe(FORE.orbital)
    expect(primitivSvg({ kind: 'duo', ytter: { typ: 'orbital', lage: 1 }, karna: { typ: 'pil', vinkel: 90 } })).toBe(FORE.duo)
  })
})

const FORE = {
  pil: '<g transform="rotate(45, 50, 50)"><line x1="50" y1="76" x2="50" y2="26" stroke="#020617" stroke-width="3" stroke-linecap="round"></line><g stroke="#020617" stroke-width="3" stroke-linecap="round" fill="none"><line x1="50" y1="24" x2="41" y2="35"></line><line x1="50" y1="24" x2="59" y2="35"></line></g></g>',
  orbital: '<circle cx="50" cy="50" r="26" fill="none" stroke="#64748B" stroke-width="2.5" stroke-dasharray="0 4.54" stroke-linecap="round"></circle><circle cx="50" cy="50" r="5" fill="#020617" stroke="none" stroke-width="3"></circle><circle cx="76" cy="50" r="6" fill="#020617"></circle>',
  duo: '<circle cx="50" cy="50" r="26" fill="none" stroke="#64748B" stroke-width="2.5" stroke-dasharray="0 4.54" stroke-linecap="round"></circle><circle cx="68.38" cy="31.62" r="6" fill="#020617"></circle><g transform="rotate(90, 50, 50)" stroke="#020617" stroke-width="3" stroke-linecap="round" fill="none"><line x1="50" y1="63" x2="50" y2="39"></line><line x1="50" y1="37" x2="42" y2="47"></line><line x1="50" y1="37" x2="58" y2="47"></line></g>',
}

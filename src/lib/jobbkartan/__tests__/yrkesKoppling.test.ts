import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { CV_GALLERI, BREV_GALLERI } from '@/app/(public)/exempel/components/galleri-data'
import { YRKES_KOPPLING, YRKESFILER } from '../yrkesKoppling'
import { miniKarta, yrkesFigur } from '../yrkesFigur'
import { OVERSIKT } from '../data'

const index = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'public/jobbkartan/data/yrken.json'), 'utf8')
) as [string, string, number][]
const namnFor = new Map(index.map(([kod, namn]) => [kod, namn]))

describe('yrkesKoppling', () => {
  for (const [slug, k] of Object.entries(YRKES_KOPPLING)) {
    it(`${slug} pekar på yrkeskoder som finns i datan med rätt namn`, () => {
      expect(k.koder.length).toBeGreaterThan(0)
      expect(k.scbNamn).toHaveLength(k.koder.length)
      k.koder.forEach((kod, i) => {
        expect(kod).toMatch(/^\d{4}$/)
        expect(namnFor.get(kod)).toBe(k.scbNamn[i])
        expect(YRKESFILER[kod]?.kod).toBe(kod)
        expect(YRKESFILER[kod]?.namn).toBe(k.scbNamn[i])
        expect(YRKESFILER[kod].lan).toHaveLength(OVERSIKT.lanKoder.length * OVERSIKT.ar.length)
      })
    })
    it(`${slug} har både CV- och brevexempel`, () => {
      expect(CV_GALLERI.some((y) => y.slug === slug)).toBe(true)
      expect(BREV_GALLERI.some((y) => y.slug === slug)).toBe(true)
    })
  }

  it('importerar inga yrkesfiler som ingen sida använder', () => {
    const anvanda = new Set(Object.values(YRKES_KOPPLING).flatMap((k) => k.koder))
    expect(Object.keys(YRKESFILER).sort()).toEqual([...anvanda].sort())
  })
})

describe('yrkesFigur', () => {
  it('ger ingen figur för sidor utan säker koppling', () => {
    for (const s of ['handlaggare', 'larare', 'ingenjor', 'saljare', 'hemtjanst', 'servitris-restaurangbitrade', 'finns-inte']) {
      expect(yrkesFigur(s)).toBeNull()
    }
  })

  it('räknar som Jobbkartan: andel av länets anställda mot riket', () => {
    const f = yrkesFigur('elevassistent')!
    const AR = OVERSIKT.ar.length
    const A = AR - 1
    const y = YRKESFILER['5312']
    const tot = OVERSIKT.lanKoder.reduce((s, _, i) => s + y.lan[i * AR + A], 0)
    const totL = OVERSIKT.lanKoder.reduce((s, _, i) => s + OVERSIKT.totLan[i][A], 0)
    const lq = OVERSIKT.lanKoder.map((kod, i) => ({ kod, v: y.lan[i * AR + A] / OVERSIKT.totLan[i][A] / (tot / totL) }))
    const topp = lq.sort((a, b) => b.v - a.v)[0]
    expect(f.toppLan).toBe(OVERSIKT.lanNamn[topp.kod])
    expect(f.toppKvot).toBe(topp.v.toFixed(1).replace('.', ','))
    expect(f.href).toBe(`/jobbkartan#vy-${topp.kod}-5312-1480-${OVERSIKT.kvartal.length - 1}`)
    expect(f.lon?.ar).toBe(OVERSIKT.lonAr.at(-1))
  })

  it('visar ingen lön när flera koder summeras', () => {
    const f = yrkesFigur('butikssaljare')!
    expect(f).not.toBeNull()
    expect(f.lon).toBeNull()
    expect(f.href).toContain('-5223-')
  })

  it('ger alla kopplade sidor en figur med steg för varje län', () => {
    for (const slug of Object.keys(YRKES_KOPPLING)) {
      const f = yrkesFigur(slug)
      expect(f, slug).not.toBeNull()
      expect(Object.keys(f!.steg).sort()).toEqual([...OVERSIKT.lanKoder].sort())
      expect(f!.toppKvot).toMatch(/^\d,\d$/)
    }
  })
})

describe('miniKarta', () => {
  it('ritar alla 21 län och håller sig liten', () => {
    const k = miniKarta()
    expect(k.lan).toHaveLength(21)
    const bytes = k.lan.reduce((s, l) => s + l.d.length, 0)
    expect(bytes).toBeLessThan(6500)
    for (const l of k.lan) expect(l.d).toMatch(/^M-?\d/)
  })
})

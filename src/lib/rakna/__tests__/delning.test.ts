// @vitest-environment node
/**
 * Delningslänkens parametrar: varje kalkylator ska kunna skriva sitt läge
 * till query-strängen och läsa tillbaka exakt samma läge, nyckelparametern
 * ska alltid stå med (annars skrivs länken aldrig om till den delade vyn),
 * och next.config.ts ska skriva om just de nycklarna.
 */
import { describe, expect, it } from 'vitest'
import nextConfig from '../../../../next.config'
import { NYCKEL, SLUGGAR, delningsUrl, ogBildUrl, type Slug } from '../delning'
import { queryStrang, type Parametrar } from '../sok'
import { LON_STANDARD, lasLon, lonParametrar, beraknaLon } from '../lonEfterSkatt'
import { ANSTALLD_STANDARD, anstalldParametrar, lasAnstalld } from '../anstalldKostnad'
import { FORHANDLING_STANDARD, forhandlingParametrar, lasForhandling } from '../loneforhandling'
import { SEMESTER_STANDARD, lasSemester, semesterParametrar } from '../semester'
import { TIMLON_STANDARD, lasTimlon, timlonParametrar } from '../timlon'
import { UPPSAGNING_STANDARD, lasUppsagning, uppsagningParametrar } from '../uppsagningstid'
import { FELREK_STANDARD, beraknaFelrek, felrekParametrar, krTusen, lasFelrek } from '../felrekrytering'
import { SOURCING_STANDARD, beraknaSourcing, lasSourcing, sourcingParametrar } from '../sourcing'
import { TRAFF_STANDARD, beraknaTraff, lasTraff, traffParametrar } from '../traffsakerhet'
import { TABELLER, sammanfatta } from '../sammanfattning'

/** Parametrarna genom en riktig URL och tillbaka, som när länken öppnas. */
function genomUrl(slug: Slug, p: Parametrar): URLSearchParams {
  return new URL(delningsUrl(slug, p)).searchParams
}

const IDAG = '2026-09-23'

const FALL: { slug: Slug; lagen: { las: (s: URLSearchParams) => unknown; params: Parametrar; varde: unknown }[] }[] = [
  {
    slug: 'lon-efter-skatt',
    lagen: [
      LON_STANDARD,
      { lon: 45000, kommun: 'Göteborg', kyrka: true, a66: false, jamfor: true, jlon: 52000, jkommun: 'Malmö' },
      { lon: 90000, kommun: 'Dorotea', kyrka: false, a66: true, jamfor: false, jlon: 38000, jkommun: 'Stockholm' },
    ].map((d) => ({ las: lasLon, params: lonParametrar(d), varde: d })),
  },
  {
    slug: 'vad-kostar-en-anstalld',
    lagen: [ANSTALLD_STANDARD, { lon: 24000, dagar: 30, ung: true, avtal: false }].map((d) => ({
      las: lasAnstalld,
      params: anstalldParametrar(d),
      varde: d,
    })),
  },
  {
    slug: 'loneforhandling',
    lagen: [FORHANDLING_STANDARD, { lon: 41000, hojning: 3500, rev: '3,1' }].map((d) => ({
      las: lasForhandling,
      params: forhandlingParametrar(d),
      varde: d,
    })),
  },
  {
    slug: 'semesterersattning',
    lagen: [
      SEMESTER_STANDARD,
      { ...SEMESTER_STANDARD, manadslon: 41000, dagar: 12 },
      { ...SEMESTER_STANDARD, lage: 'procent' as const, arslon: 265000 },
    ].map((d) => ({ las: lasSemester, params: semesterParametrar(d), varde: d })),
  },
  {
    slug: 'timlon-till-manadslon',
    lagen: [
      TIMLON_STANDARD,
      { riktning: 'tillManad' as const, belopp: '182,50', timmar: '160' },
      { riktning: 'tillTim' as const, belopp: '34500', timmar: '174' },
    ].map((d) => ({ las: lasTimlon, params: timlonParametrar(d), varde: d })),
  },
  {
    slug: 'uppsagningstid',
    lagen: [
      { ...UPPSAGNING_STANDARD, datum: IDAG },
      { vem: 'arbetsgivare' as const, prov: false, start: '2017-03-01', datum: '2026-10-01' },
    ].map((d) => ({ las: lasUppsagning, params: uppsagningParametrar(d, IDAG), varde: d })),
  },
  {
    slug: 'felrekrytering',
    lagen: [FELREK_STANDARD, { manadslon: 62000, manader: 14 }].map((d) => ({
      las: lasFelrek,
      params: felrekParametrar(d),
      varde: d,
    })),
  },
  {
    slug: 'sourcing',
    lagen: [SOURCING_STANDARD, { kanal: 'pool' as const, anstallningar: 4, svarTillIntervju: 45, intervjuTillAnstallning: 20 }].map(
      (d) => ({ las: lasSourcing, params: sourcingParametrar(d), varde: d })
    ),
  },
  {
    slug: 'traffsakerhet',
    lagen: [TRAFF_STANDARD, { metod: 'ostrukturerad' as const, basfrekvens: 35, selektionskvot: 55 }].map((d) => ({
      las: lasTraff,
      params: traffParametrar(d),
      varde: d,
    })),
  },
]

describe('delningslänkens parametrar', () => {
  it('täcker alla nio kalkylatorer', () => {
    expect(FALL.map((f) => f.slug).sort()).toEqual([...SLUGGAR].sort())
  })

  for (const f of FALL) {
    describe(f.slug, () => {
      f.lagen.forEach((l, i) => {
        it(`läge ${i + 1} kommer tillbaka oförändrat genom länken`, () => {
          expect(l.las(genomUrl(f.slug, l.params))).toEqual(l.varde)
        })
        it(`läge ${i + 1} bär nyckelparametern ${NYCKEL[f.slug]}`, () => {
          expect(genomUrl(f.slug, l.params).get(NYCKEL[f.slug])).toBeTruthy()
        })
      })
    })
  }

  it('länken går till kalkylatorns egen adress', () => {
    expect(delningsUrl('lon-efter-skatt', { lon: '45000', kommun: 'Göteborg', kyrka: null })).toBe(
      'https://www.jobbcoach.ai/rakna-ut/lon-efter-skatt?lon=45000&kommun=G%C3%B6teborg'
    )
    expect(ogBildUrl('sourcing', { kanal: 'pool', anst: '2' })).toBe(
      'https://www.jobbcoach.ai/api/og/rakna-ut/sourcing?kanal=pool&anst=2'
    )
  })

  it('ogiltiga värden faller tillbaka på förvalen', () => {
    expect(lasLon(new URLSearchParams('lon=abc&kommun=Atlantis'))).toEqual(LON_STANDARD)
    expect(lasFelrek(new URLSearchParams('lon=5000000&man=99'))).toEqual(FELREK_STANDARD)
    expect(lasSourcing(new URLSearchParams('kanal=spam&anst=0'))).toEqual(SOURCING_STANDARD)
    expect(lasTraff(new URLSearchParams('metod=gissning&bas=99'))).toEqual(TRAFF_STANDARD)
    expect(lasUppsagning(new URLSearchParams('start=igår&datum=2026-13'))).toEqual(UPPSAGNING_STANDARD)
  })

  it('Next:s searchParams-objekt läses som en URL', () => {
    expect(lasLon({ lon: '45000', kommun: ['göteborg'], kyrka: '1' })).toEqual({
      ...LON_STANDARD,
      lon: 45000,
      kommun: 'Göteborg',
      kyrka: true,
    })
  })

  it('next.config.ts skriver om varje kalkylators nyckel till den delade vyn', async () => {
    const rw = await nextConfig.rewrites!()
    const fore = (Array.isArray(rw) ? rw : rw.beforeFiles) ?? []
    for (const slug of SLUGGAR) {
      const regel = fore.find((r) => r.source === `/rakna-ut/${slug}`)
      expect(regel, slug).toBeDefined()
      expect(regel!.destination).toBe(`/rakna-ut/${slug}/delad`)
      expect(regel!.has).toEqual([{ type: 'query', key: NYCKEL[slug] }])
    }
  })
})

describe('räkningen är densamma som före linjen', () => {
  it('felrekryteringens förval ger insiktens 724 000 kr', () => {
    expect(krTusen(beraknaFelrek(FELREK_STANDARD).total).replace(/\s/g, ' ')).toBe('724 000 kr')
  })
  it('sourcingtrattens förval: 67 kontakter för en anställning', () => {
    expect(beraknaSourcing(SOURCING_STANDARD).kontakterKravs).toBe(67)
  })
  it('träffsäkerhetens förval: kombinationen slår magkänslan', () => {
    const r = beraknaTraff(TRAFF_STANDARD)
    expect(r.vald.id).toBe('kombination')
    expect(r.resultat[3].andel).toBeGreaterThan(r.resultat[0].andel)
  })
  it('lön efter skatt: 35 000 kr i Stockholm slås upp i tabell 31', () => {
    const r = beraknaLon(LON_STANDARD, TABELLER)
    expect(r.tab).toBe(31)
    expect(r.netto).toBe(35000 - r.skatt)
    expect(r.skatt).toBeGreaterThan(6000)
    expect(r.skatt).toBeLessThan(9000)
  })
})

describe('sammanfattningen för bilden och den delade vyn', () => {
  it('lön efter skatt säger nettot och kommunen', () => {
    const { sammanfattning: s, parametrar } = sammanfatta('lon-efter-skatt', queryStrang({ lon: '45000', kommun: 'Göteborg' }))
    expect(s.namn).toBe('Lön efter skatt 2026')
    expect(s.enhet).toBe('kvar i handen per månad')
    expect(s.rad).toContain('Göteborg')
    expect(s.kalla).toContain('Skatteverkets skattetabeller')
    expect(parametrar.lon).toBe('45000')
  })
  it('uppsägningstiden räknar från datumet i länken', () => {
    const { sammanfattning: s } = sammanfatta('uppsagningstid', 'vem=ag&start=2016-01-01&datum=2026-09-23', IDAG)
    expect(s.tal).toBe('6 månader')
    expect(s.rad).toBe('Sista anställningsdag 23 mars 2027')
  })
})

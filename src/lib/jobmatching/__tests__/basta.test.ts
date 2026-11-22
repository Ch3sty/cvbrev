/**
 * Webbläsaren och servern ska ge samma träffar för samma annonser, CV och
 * sökprofil (Jobbsöket omgång 2, "Träffantalet" i byggnoterna).
 *
 * Felet: efter en sökning skrev Matchade jobb "7 jobb passar dig", efter
 * omladdning "2". Webbläsaren räknade över hela sökningen, men skickade de
 * 60 bästa utan avståndsgräns som sammanfattning; för ett CV i Umeå låg
 * nästan alla i Stockholm, och servern gallrade bort dem.
 *
 * Vägarna som prövas:
 *   - webbläsaren efter sökningen: bastaTraffar över alla annonser
 *   - servern efter omladdning: POST /api/jobbmatchning/sammanfattning räknar
 *     bastaTraffar på det webbläsaren skickar (sammanfattningsJobb) och
 *     sparar träffarna; sidan räknar bastaTraffar på det sparade
 *   - servern ur hela körningen: bastaTraffar över alla annonser
 *   - poolen och den lokalt sparade sökningen: bastaTraffar på poolUrval
 */
import { describe, expect, it } from 'vitest'
import { bastaTraffar, lattRad, poolUrval, sammanfattningsJobb } from '../basta'
import { oppnaTraffar } from '../oppna'
import { rankMatches } from '@/app/dashboard/jobbmatchning/data/match-ranking'
import type { RankedJob } from '@/app/dashboard/jobbmatchning/data/match-ranking'
import type { ActiveCVData } from '@/app/dashboard/jobbmatchning/getJobbmatchningData'
import type { JobPreferences } from '@/types/user.types'

const cv: ActiveCVData = {
  cv_id: 'cv-umea',
  extracted_occupations: [{ original: 'Ekonom', normalized: 'ekonom', concept_id: null, alternative_labels: [], confidence: 'high' }],
  extracted_skills: ['bokföring', 'redovisning', 'excel', 'budget', 'moms', 'bokslut'],
  extracted_educations: [],
  extracted_location: 'Umeå',
  parsed_at: '2026-11-01T00:00:00Z',
} as ActiveCVData

const dagar = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString()
const krav = (...labels: string[]) => ({ skills: labels.map((label) => ({ label })) })

/** 70 starka annonser i Stockholm: högre matchgrad än allt i Umeå, men långt bort. */
const stockholm = Array.from({ length: 70 }, (_, i) => ({
  id: `sth-${String(i).padStart(2, '0')}`,
  headline: 'Ekonom',
  publication_date: dagar(i % 20),
  workplace_address: { municipality: 'Stockholm', region: 'Stockholms län' },
  must_have: krav('bokföring', 'redovisning', 'excel', 'budget'),
  // Hälften har avståndet från edge-funktionen, hälften räknas ur kommunen.
  ...(i % 2 === 0 ? { distance: 510 } : {}),
}))

/** Sju svagare annonser inom 100 km från Umeå. */
const nara = [
  { id: 'ume-1', headline: 'Ekonomiassistent', workplace_address: { municipality: 'Umeå', region: 'Västerbottens län' }, must_have: krav('excel'), publication_date: dagar(1) },
  { id: 'ume-2', headline: 'Lagerarbetare', workplace_address: { municipality: 'Umeå', region: 'Västerbottens län' }, publication_date: dagar(2) },
  { id: 'ume-3', headline: 'Kundtjänst', workplace_address: { municipality: 'Umeå', region: 'Västerbottens län' }, publication_date: dagar(3), distance: 2 },
  { id: 'van-1', headline: 'Lönehandläggare', workplace_address: { municipality: 'Vännäs', region: 'Västerbottens län' }, must_have: krav('bokföring'), publication_date: dagar(4) },
  { id: 'nor-1', headline: 'Butikssäljare', workplace_address: { municipality: 'Nordmaling', region: 'Västerbottens län' }, publication_date: dagar(5) },
  { id: 'rob-1', headline: 'Administratör', workplace_address: { municipality: 'Robertsfors', region: 'Västerbottens län' }, publication_date: dagar(6), distance: 40 },
  { id: 'ume-4', headline: 'Redovisningskonsult', workplace_address: { municipality: 'Umeå', region: 'Västerbottens län' }, must_have: krav('redovisning', 'bokslut'), publication_date: dagar(40) },
]

/** En distansannons i Stockholm: säger själv att jobbet är på distans. */
const distans = { id: 'dist-1', headline: 'Ekonom på distans', workplace_address: { municipality: 'Stockholm', region: 'Stockholms län' }, must_have: krav('bokföring'), publication_date: dagar(1) }

/** En annons i Skellefteå, drygt 100 km bort: utanför gränsen. */
const skelleftea = { id: 'ske-1', headline: 'Ekonom', workplace_address: { municipality: 'Skellefteå', region: 'Västerbottens län' }, must_have: krav('bokföring', 'excel'), publication_date: dagar(1) }

const alla = [...stockholm, ...nara, distans, skelleftea]

const tomProfil: JobPreferences = { locations: [], remote: false, extent: '', min_salary: null }
const extraOrt: JobPreferences = { locations: ['Umeå', 'Stockholm'], remote: false, extent: '', min_salary: null }
const medDistans: JobPreferences = { locations: ['Umeå'], remote: true, extent: '', min_salary: null }
const baraUmea: JobPreferences = { locations: ['Umeå'], remote: false, extent: '', min_salary: null }

const idn = (r: readonly RankedJob[]) => r.map((x) => String(x.job.id))

/** Webbläsaren direkt efter sökningen (grundläget, inga filter). */
const webblasaren = (jobs: Record<string, any>[], prefs: JobPreferences) => bastaTraffar(jobs, cv, prefs)

/** Servern efter omladdning: sammanfattningen som webbläsaren skickade, omräknad och sparad, och sedan läst. */
function serverEfterOmladdning(jobs: Record<string, any>[], prefs: JobPreferences) {
  const skickat = sammanfattningsJobb(jobs, cv, prefs)
  const sparat = bastaTraffar(skickat, cv, prefs).map((r) => r.job)
  return bastaTraffar(sparat, cv, prefs)
}

describe('samma träffar efter sökningen och efter omladdning', () => {
  it('felet i pass 5: de 60 bästa utan avståndsgräns gav färre träffar på servern', () => {
    const gammaltSkickat = rankMatches(alla, cv, [], 60).ranked.map((r) => r.job)
    const gammalServer = bastaTraffar(gammaltSkickat, cv, tomProfil)
    expect(gammalServer.length).toBeLessThan(webblasaren(alla, tomProfil).length)
  })

  for (const [namn, prefs] of [
    ['utan ort i sökprofilen (CV:ts ort gäller)', tomProfil],
    ['sökprofil med en extra ort', extraOrt],
    ['sökprofil med distans', medDistans],
    ['sökprofil med bara CV:ts ort', baraUmea],
  ] as const) {
    it(`${namn}: samma lista och samma antal`, () => {
      const forvantat = idn(webblasaren(alla, prefs))
      expect(forvantat.length).toBeGreaterThan(0)
      expect(idn(serverEfterOmladdning(alla, prefs))).toEqual(forvantat)
      // Servern ur hela körningen (ingen sammanfattning duger).
      expect(idn(bastaTraffar(alla, cv, prefs))).toEqual(forvantat)
      // Poolen och den lokalt sparade sökningen ändrar inte listan i grundläget.
      expect(idn(bastaTraffar(poolUrval(alla, cv, prefs), cv, prefs))).toEqual(forvantat)
      expect(idn(bastaTraffar(poolUrval(alla, cv, prefs, 60).slice(0, 60), cv, prefs))).toEqual(forvantat)
    })
  }

  it('avståndet: inget längre bort än 100 km, utom distansannonsen', () => {
    const ut = idn(webblasaren(alla, tomProfil))
    expect(ut.some((id) => id.startsWith('sth-'))).toBe(false)
    expect(ut).not.toContain('ske-1')
    expect(ut).toContain('dist-1')
    expect([...ut].sort()).toEqual(['dist-1', ...nara.map((j) => j.id)].sort())
  })

  it('en extra ort i sökprofilen räknas som nära: Stockholmsannonserna kommer med', () => {
    const ut = idn(webblasaren(alla, extraOrt))
    expect(ut.some((id) => id.startsWith('sth-'))).toBe(true)
    expect(ut).toHaveLength(25)
    // Skellefteå står inte i sökprofilen och ligger över 100 km från båda.
    expect(ut).not.toContain('ske-1')
    expect(idn(serverEfterOmladdning(alla, extraOrt))).toEqual(ut)
  })

  it('sökprofilen har bara Stockholm, CV:t ligger i Umeå', () => {
    const baraStockholm: JobPreferences = { locations: ['Stockholm'], remote: false, extent: '', min_salary: null }
    const ut = idn(webblasaren(alla, baraStockholm))
    expect(ut).toHaveLength(25)
    expect(ut.every((id) => id.startsWith('sth-') || id === 'dist-1')).toBe(true)
    expect(idn(serverEfterOmladdning(alla, baraStockholm))).toEqual(ut)
    expect(idn(bastaTraffar(poolUrval(alla, cv, baraStockholm), cv, baraStockholm))).toEqual(ut)
  })

  it('ett län i sökprofilen går inte att placera men gallrar inte bort annonserna i länet', () => {
    const lan: JobPreferences = { locations: ['Stockholms län'], remote: false, extent: '', min_salary: null }
    expect(idn(webblasaren(alla, lan)).some((id) => id.startsWith('sth-'))).toBe(true)
  })

  it('orten är ett skäl bara när den står i sökprofilen eller är CV:ts', () => {
    const traff = webblasaren(alla, extraOrt).find((r) => String(r.job.id).startsWith('sth-'))!
    expect(lattRad(traff, cv, extraOrt.locations).reasons).toContain('Stockholm')
    // Samma sorts annons via "längre bort" utan ort i sökprofilen: orten är inget skäl.
    const langt = bastaTraffar(alla, cv, tomProfil, { visaLangtBort: true }).find((r) => String(r.job.id).startsWith('sth-'))!
    expect(lattRad(langt, cv, tomProfil.locations).reasons).not.toContain('Stockholm')
  })

  it('sökprofil utan distans: distansannonsen i Stockholm faller på orten', () => {
    expect(idn(webblasaren(alla, baraUmea))).not.toContain('dist-1')
    expect(idn(webblasaren(alla, medDistans))).toContain('dist-1')
  })

  it('ordningen beror inte på i vilken ordning annonserna kommer', () => {
    const tvilling = { ...nara[1], id: 'ume-2b' }
    const fram = [...alla, tvilling]
    const bak = [...fram].reverse()
    expect(idn(bastaTraffar(bak, cv, tomProfil))).toEqual(idn(bastaTraffar(fram, cv, tomProfil)))
  })

  it('taket 25 gäller båda vägarna', () => {
    const manga = Array.from({ length: 40 }, (_, i) => ({ ...nara[0], id: `ume-x${String(i).padStart(2, '0')}` }))
    const jobs = [...alla, ...manga]
    expect(webblasaren(jobs, tomProfil)).toHaveLength(25)
    expect(idn(serverEfterOmladdning(jobs, tomProfil))).toEqual(idn(webblasaren(jobs, tomProfil)))
  })

  it('gratis: samma tre öppna och samma antal dolda', () => {
    const klient = webblasaren(alla, tomProfil)
    const server = serverEfterOmladdning(alla, tomProfil)
    expect(idn(oppnaTraffar(server, false))).toEqual(idn(oppnaTraffar(klient, false)))
    expect(oppnaTraffar(server, false)).toHaveLength(3)
    expect(server.length - 3).toBe(klient.length - 3)
  })

  it('filtren och "längre bort" är bara webbläsarens tillval, grundläget är serverns', () => {
    expect(idn(bastaTraffar(alla, cv, tomProfil, {}))).toEqual(idn(bastaTraffar(alla, cv, tomProfil)))
    const langt = idn(bastaTraffar(alla, cv, tomProfil, { visaLangtBort: true }))
    expect(langt.some((id) => id.startsWith('sth-'))).toBe(true)
  })
})

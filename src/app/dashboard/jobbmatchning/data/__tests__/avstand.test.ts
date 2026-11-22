import { describe, expect, it } from 'vitest'
import { applyClientFilters, arLangtBort, avstandKm } from '../job-filtering'
import { DEFAULT_FILTERS } from '../filter-standard'
import { buildMatchReasons } from '../match-reasons'

describe('avståndet när annonsen saknar det (rättningsrundan 2026-11-21)', () => {
  const stockholm = { id: 's', headline: 'Reskontraekonom', workplace_address: { municipality: 'Stockholm' }, description: { text: 'Två dagar på distans.' } }
  const umea = { id: 'u', headline: 'Ekonomiassistent', workplace_address: { municipality: 'Umeå' } }
  const distans = { id: 'd', headline: 'Ekonom på distans', workplace_address: { municipality: 'Stockholm' } }

  it('räknas ur kommunernas koordinater', () => {
    expect(avstandKm(stockholm, 'Umeå')).toBeGreaterThan(400)
    expect(avstandKm(umea, 'Umeå')).toBeLessThan(5)
    expect(avstandKm({ ...stockholm, distance: 12 }, 'Umeå')).toBe(12)
  })
  it('distans enligt rubriken eller flaggan räknas inte som långt bort', () => {
    expect(arLangtBort(distans, 'Umeå')).toBe(false)
    expect(arLangtBort({ ...stockholm, remote_work: true }, 'Umeå')).toBe(false)
  })
  it('grundfiltret tar bort jobb längre bort än 100 km från CV:ts ort', () => {
    const ut = applyClientFilters([stockholm, umea, distans], DEFAULT_FILTERS, false, 'Umeå')
    expect(ut.map((j) => j.id)).toEqual(['u', 'd'])
    expect(applyClientFilters([stockholm, umea], DEFAULT_FILTERS, true, 'Umeå')).toHaveLength(2)
  })
  it('en ort i sökprofilen räknas som nära (Jobbsöket omgång 2)', () => {
    // Utan orter i sökprofilen: som förut.
    expect(arLangtBort(stockholm, 'Umeå', [])).toBe(true)
    // Orten själv, på namnet.
    expect(arLangtBort(stockholm, 'Umeå', ['Stockholm'])).toBe(false)
    // Inom 100 km från en ort i sökprofilen som går att placera.
    const uppsala = { id: 'up', headline: 'Ekonom', workplace_address: { municipality: 'Uppsala', region: 'Uppsala län' } }
    expect(arLangtBort(uppsala, 'Umeå', ['Stockholm'])).toBe(false)
    // Ett län går inte att placera: lyfter inte gränsen för grannarna, men
    // annonser i länet gallras inte bort.
    expect(arLangtBort(uppsala, 'Umeå', ['Stockholms län'])).toBe(true)
    expect(arLangtBort({ ...stockholm, workplace_address: { municipality: 'Stockholm', region: 'Stockholms län' } }, 'Umeå', ['Stockholms län'])).toBe(false)
    // En ort långt från både CV:t och sökprofilen.
    const goteborg = { id: 'g', headline: 'Ekonom', workplace_address: { municipality: 'Göteborg' } }
    expect(arLangtBort(goteborg, 'Umeå', ['Stockholm'])).toBe(true)
    expect(applyClientFilters([stockholm, umea, goteborg], DEFAULT_FILTERS, false, 'Umeå', ['Stockholm']).map((j) => j.id)).toEqual(['s', 'u'])
  })

  it('en annan ort blir inte ett skäl', () => {
    const cv = { cv_id: 'c', extracted_occupations: [], extracted_skills: [], extracted_educations: [], extracted_location: 'Umeå', parsed_at: '' }
    expect(buildMatchReasons(stockholm, cv, []).reasons).not.toContain('Stockholm')
    expect(buildMatchReasons(umea, cv, []).reasons).toContain('Umeå')
  })
})

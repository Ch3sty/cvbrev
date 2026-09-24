// Rättelserna efter köptestet i Stripes testläge
// (docs/qa/qa-kop-testlage-2026-09-24.md): menyhuvudet för ett uppsagt paket
// (bugg 5), Hela paketets längder i menyn (bugg 2) och Dagspassets
// returskärm (bugg 9).
import { describe, it, expect } from 'vitest'
import { menyHuvud, type PaketLage } from '../paket-rader'
import { valkommen, valkommenMedCv } from '../komigang'

const BAS: PaketLage = {
  scope: 'allt',
  track: 'allt',
  planKey: 'all_month',
  fornyasAt: '2026-10-24T08:00:00Z',
  dayPassOnly: false,
  chatUsed: 0,
  chatLimit: null,
  lettersUsed: 0,
  lettersLimit: null,
}

describe('menyhuvudet', () => {
  it('Hela paketet månad förnyas med 149 kr', () => {
    expect(menyHuvud(BAS).under).toBe('Förnyas 24 oktober, 149 kr')
  })
  it('Hela paketet kvartal förnyas med 299 kr', () => {
    expect(menyHuvud({ ...BAS, planKey: 'all_quarter', fornyasAt: '2026-12-24T08:00:00Z' }).under).toBe(
      'Förnyas 24 december, 299 kr'
    )
  })
  it('ett uppsagt paket förnyas inte', () => {
    const h = menyHuvud({ ...BAS, planKey: 'cv_week', scope: 'cv', fornyasAt: '2026-10-01T08:00:00Z', uppsagd: true })
    expect(h.rubrik).toBe('Du har CV-paketet')
    expect(h.under).toBe('Gäller till 1 oktober, förnyas inte')
  })
  it('äldre svar utan fältet räknas som inte uppsagt', () => {
    expect(menyHuvud({ ...BAS }).under).toMatch(/^Förnyas/)
  })
})

describe('välkomstskärmen efter Dagspasset', () => {
  it('säger Dagspasset, inte Hela paketet', () => {
    const v = valkommen('allt', true)
    expect(v.topp).toBe('Dagspasset')
    expect(v.rubrik).toBe('Du har Dagspasset. Hela jobbsöket är öppet i ett dygn.')
    expect(v.steg).toHaveLength(3)
  })
  it('med CV sedan tidigare', () => {
    expect(valkommenMedCv('allt', 'cv.pdf', null, null, true).rubrik).toBe('Du har Dagspasset. Och ett CV redan.')
  })
  it('Hela paketet är oförändrat', () => {
    expect(valkommen('allt').rubrik).toBe('Du har Hela paketet. Hela jobbsöket är öppet.')
  })
})

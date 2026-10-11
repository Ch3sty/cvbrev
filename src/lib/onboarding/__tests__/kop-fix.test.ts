// Rättelserna efter köptestet i Stripes testläge
// (docs/qa/qa-kop-testlage-2026-09-24.md): menyhuvudet för ett uppsagt paket
// (bugg 5), Premiums längder i menyn (bugg 2) och returskärmen för en
// befintlig Dagspass-kund (bugg 9), som sedan 2026-10-11 säger Premium.
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
  it('Premium månad förnyas med 149 kr', () => {
    expect(menyHuvud(BAS).under).toBe('Förnyas 24 oktober, 149 kr')
  })
  it('Premium kvartal (befintlig kund) förnyas med 299 kr', () => {
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

describe('välkomstskärmen för en befintlig Dagspass-kund', () => {
  it('säger att det gäller ett dygn men aldrig Dagspasset', () => {
    const v = valkommen('allt', true)
    expect(v.topp).toBe('Jobbcoach Premium')
    expect(v.rubrik).toBe('Du har Premium. Hela jobbsöket är öppet i ett dygn.')
    expect(v.steg).toHaveLength(3)
    expect(JSON.stringify(v)).not.toMatch(/Dagspass/)
  })
  it('med CV sedan tidigare', () => {
    expect(valkommenMedCv('allt', 'cv.pdf', null, null, true).rubrik).toBe('Du har Premium. Och ett CV redan.')
  })
  it('Premium: fulla namnet i toppraden, kortformen i rubriken', () => {
    expect(valkommen('allt').topp).toBe('Jobbcoach Premium')
    expect(valkommen('allt').rubrik).toBe('Du har Premium. Hela jobbsöket är öppet.')
  })
  it('menyhuvudet för en Dagspass-kund säger Premium', () => {
    expect(menyHuvud({ ...BAS, planKey: 'all_day', dayPassOnly: true }).rubrik).toBe('Du har Premium')
  })
})

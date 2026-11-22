/**
 * Skalets reklam i artikeln om aktivitetsrapporten (byggordern I,
 * docs/artiklar-2026-11/seo-slutgranskning.md): Jobbsöket tar hela skalet bara
 * där, och kortet är Sökta tjänsters. Övriga artiklar i JOBB_KORT_SLUGAR får
 * kortet som tillägg, som förut.
 */
import { describe, expect, it } from 'vitest'
import { JOBB_KORT, JOBB_KORT_SLUGAR, JOBB_SKAL_SLUGAR } from '../reklam-copy'

describe('Jobbsökets skal', () => {
  it('bara aktivitetsrapporten tar hela skalet, med Sökta tjänsters kort', () => {
    expect([...JOBB_SKAL_SLUGAR]).toEqual(['aktivitetsrapport-arbetsformedlingen'])
    expect(JOBB_KORT_SLUGAR['aktivitetsrapport-arbetsformedlingen']).toBe('sokta')
    expect(JOBB_KORT.sokta.href).toBe('/verktyg/sokta-tjanster')
    expect(JOBB_KORT.sokta.knapp).toBe('Håll koll på sökta jobb')
  })

  it('de fyra artiklarna som hade kortet förut är oförändrade', () => {
    expect(JOBB_KORT_SLUGAR).toMatchObject({
      'ai-jobbmatchning': 'matchning',
      'soka-jobb-via-mail': 'sokta',
      'uppfoljning-efter-intervju': 'sokta',
      'personligt-brev-jobbansokan': 'sokta',
    })
  })
})

// @vitest-environment node
/**
 * Analysflödets "Vi hittade ..." räknar alla fynd, öppna och låsta, med
 * samma tal som Analys-sidans rubrik (efterrättning D 2026-11-21). Förut sa
 * flödet "1 förbättring" för gratisnivån när sidan sa "Tre saker drar ner".
 */
import { describe, expect, it } from 'vitest'
import { byggAnalysVy } from '../analysData'
import { hittade } from '../components/steps/AnalysisOverviewStep'
import { analysForKlient } from '@/lib/cv/poang'
import { FIXTURER } from '@/lib/cv/poang/__tests__/fixturer'

describe('flödet och sidan räknar lika', () => {
  for (const f of FIXTURER) {
    const rad = { structured_data: f.structured_data, cv_text: f.cv_text }
    const jobb = { id: 'jobb-' + f.namn, completed_at: null, result: f.analys as Record<string, unknown> }
    for (const full of [false, true]) {
      it(`${f.namn}, ${full ? 'Premium' : 'gratis'}`, () => {
        const vy = byggAnalysVy(jobb, rad, full)
        const svar = analysForKlient(f.analys as Record<string, unknown>, rad, full)
        expect(svar.fyndAntal).toBe(vy ? vy.fynd.length : 0)
      })
    }
  }

  it('gratisnivån får talet men inga fler åtgärder', () => {
    const f = FIXTURER.find((x) => x.namn === 'normalt')!
    const rad = { structured_data: f.structured_data, cv_text: f.cv_text }
    const gratis = analysForKlient(f.analys as Record<string, unknown>, rad, false)
    const vy = byggAnalysVy({ id: 'j', completed_at: null, result: f.analys as Record<string, unknown> }, rad, false)!
    expect(vy.fynd.length).toBeGreaterThan(1)
    expect(gratis.fyndAntal).toBe(vy.fynd.length)
    const oppna = (gratis.roleBasedImprovements as unknown[]).length + (gratis.skillSuggestions as unknown[]).length + (gratis.profileSummary ? 1 : 0)
    expect(oppna).toBeLessThanOrEqual(1)
  })

  it('texten', () => {
    expect(hittade(1)).toBe('Vi hittade en förbättring i ditt CV')
    expect(hittade(3)).toBe('Vi hittade tre förbättringar i ditt CV')
    expect(hittade(0)).toBe('Vi hittade inga förbättringar i ditt CV')
  })
})

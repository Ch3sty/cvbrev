import { beforeEach, describe, expect, it } from 'vitest'
import {
  COACH_KONTO,
  COACH_KONTO_MED_FRAGA,
  FRAGA_MAX,
  FRAGA_UTKAST_NYCKEL,
  coachHref,
  hamtaCoachFraga,
  lasCoachFraga,
  renFraga,
  rensaCoachFraga,
  sparaCoachFraga,
} from '../provaFraga'

const FRAGA = 'Hur svarar jag på lönefrågan hos Polhem Ombyggnad?'

describe('provaFraga', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('adressen bär bara en flagga, aldrig frågan (PostHog läser adressen)', () => {
    expect(coachHref()).toBe('/register?redirect=%2Fdashboard%2Fjobbcoachen')
    expect(coachHref(true)).toBe('/register?redirect=%2Fdashboard%2Fjobbcoachen%3Ffraga%3D1')
    expect(COACH_KONTO_MED_FRAGA).toBe(`${COACH_KONTO}?fraga=1`)
    sparaCoachFraga(FRAGA)
    for (const href of [coachHref(), coachHref(true), COACH_KONTO_MED_FRAGA]) {
      expect(decodeURIComponent(href)).not.toMatch(/Polhem|lönefrågan|svarar/)
    }
  })

  it('frågan sparas i webbläsaren, städad och högst 500 tecken', () => {
    expect(sparaCoachFraga(`  Vad   skriver jag\n i ett uppföljningsmejl?  `)).toBe(true)
    expect(lasCoachFraga()).toBe('Vad skriver jag i ett uppföljningsmejl?')
    sparaCoachFraga('a'.repeat(FRAGA_MAX + 80))
    expect(lasCoachFraga()).toHaveLength(FRAGA_MAX)
    expect(renFraga(null)).toBe('')
  })

  it('en tom fråga sparas inte och tar bort en gammal', () => {
    sparaCoachFraga(FRAGA)
    expect(sparaCoachFraga('   ')).toBe(false)
    expect(window.localStorage.getItem(FRAGA_UTKAST_NYCKEL)).toBeNull()
    expect(lasCoachFraga()).toBeNull()
  })

  it('kontot hämtar frågan en gång, sedan är den borta', () => {
    sparaCoachFraga(FRAGA)
    expect(hamtaCoachFraga()).toBe(FRAGA)
    expect(window.localStorage.getItem(FRAGA_UTKAST_NYCKEL)).toBeNull()
    expect(hamtaCoachFraga()).toBeNull()
  })

  it('frågan lever i 24 timmar', () => {
    sparaCoachFraga(FRAGA)
    const om23 = Date.now() + 23 * 60 * 60 * 1000
    const om25 = Date.now() + 25 * 60 * 60 * 1000
    expect(lasCoachFraga(om23)).toBe(FRAGA)
    expect(lasCoachFraga(om25)).toBeNull()
    expect(window.localStorage.getItem(FRAGA_UTKAST_NYCKEL)).toBeNull()
  })

  it('trasigt innehåll i lagringen ger ingen fråga och inget fel', () => {
    window.localStorage.setItem(FRAGA_UTKAST_NYCKEL, '{inte json')
    expect(lasCoachFraga()).toBeNull()
    window.localStorage.setItem(FRAGA_UTKAST_NYCKEL, JSON.stringify({ fraga: 12, sparad: Date.now() }))
    expect(lasCoachFraga()).toBeNull()
    rensaCoachFraga()
    expect(window.localStorage.getItem(FRAGA_UTKAST_NYCKEL)).toBeNull()
  })
})

import { describe, it, expect } from 'vitest'
import {
  ALLA_FEATURES,
  FEATURES,
  scopeHasFeature,
  suggestPlan,
  type Feature,
  type Scope,
} from '../features'

const SCOPES: Scope[] = ['cv', 'tester', 'allt']

describe('FEATURES', () => {
  it('har de tio funktionerna ur avsnitt 5 plus LinkedIn-profilen och intervjuprovet', () => {
    expect(ALLA_FEATURES).toHaveLength(12)
  })

  it('ger Allt varje funktion', () => {
    for (const feature of ALLA_FEATURES) {
      expect(FEATURES[feature]).toContain('allt')
    }
  })

  it('lägger brevnedladdningen i CV-spåret, inte i Testspåret', () => {
    expect(FEATURES.letter_download).toEqual(['cv', 'allt'])
  })

  it('låter inget spår ha båda de andras funktioner', () => {
    expect(FEATURES.cv_export).not.toContain('tester')
    expect(FEATURES.tests_above_base).not.toContain('cv')
  })
})

describe('scopeHasFeature', () => {
  it('säger nej för gratis, alltså null och undefined', () => {
    for (const feature of ALLA_FEATURES) {
      expect(scopeHasFeature(null, feature)).toBe(false)
      expect(scopeHasFeature(undefined, feature)).toBe(false)
    }
  })

  it('säger ja till allt för scopet allt', () => {
    for (const feature of ALLA_FEATURES) {
      expect(scopeHasFeature('allt', feature)).toBe(true)
    }
  })

  it('ger CV-spåret mallar, export, full analys och brev', () => {
    expect(scopeHasFeature('cv', 'cv_templates_all')).toBe(true)
    expect(scopeHasFeature('cv', 'cv_export')).toBe(true)
    expect(scopeHasFeature('cv', 'cv_analysis_full')).toBe(true)
    expect(scopeHasFeature('cv', 'letter_download')).toBe(true)
    expect(scopeHasFeature('cv', 'linkedin')).toBe(true)
  })

  it('nekar CV-spåret testen, chatten, matchningen och Bli upptäckt', () => {
    expect(scopeHasFeature('cv', 'tests_above_base')).toBe(false)
    expect(scopeHasFeature('cv', 'test_exam_mode')).toBe(false)
    expect(scopeHasFeature('cv', 'test_history')).toBe(false)
    expect(scopeHasFeature('cv', 'chat_unlimited')).toBe(false)
    expect(scopeHasFeature('cv', 'job_matches_all')).toBe(false)
    expect(scopeHasFeature('cv', 'bli_upptackt')).toBe(false)
  })

  it('ger Testspåret alla nivåer, provläge och historik men inget CV-uttag', () => {
    expect(scopeHasFeature('tester', 'tests_above_base')).toBe(true)
    expect(scopeHasFeature('tester', 'test_exam_mode')).toBe(true)
    expect(scopeHasFeature('tester', 'test_history')).toBe(true)
    expect(scopeHasFeature('tester', 'cv_export')).toBe(false)
    expect(scopeHasFeature('tester', 'letter_download')).toBe(false)
    expect(scopeHasFeature('tester', 'linkedin')).toBe(false)
  })

  it('stämmer med tabellen för varje par av scope och feature', () => {
    for (const feature of ALLA_FEATURES) {
      for (const scope of SCOPES) {
        expect(scopeHasFeature(scope, feature)).toBe(FEATURES[feature].includes(scope))
      }
    }
  })
})

describe('suggestPlan', () => {
  // Bara Jobbcoach Premium säljs sedan 2026-10-11 (spec-rummen 17.3): varje
  // betalvägg föreslår all_month, oavsett funktion och spår.
  it('föreslår alltid Jobbcoach Premium, 149 kr i månaden', () => {
    for (const feature of ALLA_FEATURES) {
      expect(suggestPlan(feature), feature).toBe('all_month')
      for (const spar of ['cv', 'tester', 'allt'] as const) {
        expect(suggestPlan(feature, spar), `${feature}/${spar}`).toBe('all_month')
      }
    }
  })

  it('beter sig likadant utan spår som med null', () => {
    for (const feature of ALLA_FEATURES) {
      expect(suggestPlan(feature, null)).toBe(suggestPlan(feature))
    }
  })
})

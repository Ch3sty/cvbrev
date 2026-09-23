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
  it('föreslår CV-paketet för CV-funktionerna', () => {
    const cvFeatures: Feature[] = [
      'cv_templates_all',
      'cv_export',
      'cv_analysis_full',
      'letter_download',
    ]
    for (const feature of cvFeatures) {
      expect(suggestPlan(feature)).toBe('cv_week')
    }
  })

  it('föreslår Träningspaketet för testfunktionerna', () => {
    const testFeatures: Feature[] = ['tests_above_base', 'test_exam_mode', 'test_history']
    for (const feature of testFeatures) {
      expect(suggestPlan(feature)).toBe('test_week')
    }
  })

  it('föreslår Hela paketet för det bara Allt ger', () => {
    expect(suggestPlan('chat_unlimited')).toBe('all_week')
    expect(suggestPlan('job_matches_all')).toBe('all_week')
    expect(suggestPlan('bli_upptackt')).toBe('all_week')
  })

  it('föreslår alltid Hela paketet när spåret är allt', () => {
    for (const feature of ALLA_FEATURES) {
      expect(suggestPlan(feature, 'allt')).toBe('all_week')
    }
  })

  it('låter spåren cv och tester falla tillbaka på funktionens eget spår', () => {
    expect(suggestPlan('tests_above_base', 'cv')).toBe('test_week')
    expect(suggestPlan('cv_export', 'tester')).toBe('cv_week')
    expect(suggestPlan('bli_upptackt', 'cv')).toBe('all_week')
  })

  it('beter sig likadant utan spår som med null', () => {
    for (const feature of ALLA_FEATURES) {
      expect(suggestPlan(feature, null)).toBe(suggestPlan(feature))
    }
  })
})

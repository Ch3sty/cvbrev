import { describe, expect, it } from 'vitest'
import { getCtaVariantForTags, normalizeTag } from '../clusters'

/**
 * Taggarna nedan är kopierade ur frontmatter i content/artiklar/<slug>.mdx.
 * Ändras en artikels taggar ska testet ändras med den, inte tvärtom.
 */
const FIXTURES: Array<{ slug: string; tags: string[]; expected: string }> = [
  {
    slug: 'logiska-tester',
    tags: [
      'logiska tester',
      'logiska tester gratis',
      'logiskt test',
      'logiska tester vid rekrytering',
      'logiskt tänkande test',
      'matrigma',
      'begåvningstest jobb',
    ],
    expected: 'test',
  },
  {
    slug: 'kompetensbaserad-intervju-star-metoden',
    tags: [
      'star metoden',
      'star-metoden',
      'star metoden intervju',
      'star teknik',
      'star modellen',
      'star intervjuteknik',
      'kompetensbaserad intervju',
      'beteendefrågor intervju',
      'intervjuteknik',
    ],
    expected: 'interview',
  },
  {
    slug: 'styrkor-svagheter-intervju',
    tags: [
      'styrkor och svagheter intervju',
      'styrkor intervju',
      'svagheter intervju',
      'negativa egenskaper intervju',
      'positiva egenskaper intervju',
      'dåliga egenskaper lista',
      'dåliga egenskaper intervju',
      'utvecklingsbara sidor',
      'utvecklingsområden intervju',
      'jobbintervju',
    ],
    expected: 'interview',
  },
  {
    slug: 'personligt-brev-butik',
    tags: [
      'personligt brev butik',
      'personligt brev matbutik',
      'personligt brev ica',
      'personligt brev klädbutik',
      'jobba i butik',
      'sommarjobb butik',
      'personligt brev exempel',
    ],
    expected: 'letter',
  },
  {
    slug: 'cv-exempel-student-nyexaminerad',
    tags: [
      'cv exempel student',
      'cv exempel nyexaminerad',
      'cv utan erfarenhet',
      'cv första jobbet',
      'cv exempel sommarjobb',
      'student cv',
      'nyexad cv',
      'cv mall student',
    ],
    expected: 'cv',
  },
  {
    slug: 'hur-ofta-byta-jobb',
    tags: [
      'hur ofta ska man byta jobb',
      'hur ofta byta jobb',
      'byta jobb lön',
      'jobbhoppare',
      'byta jobb karriär',
      'hur länge stanna på ett jobb',
      'byta jobb regelbundet',
    ],
    expected: 'career',
  },
  {
    slug: 'angest-infor-nytt-jobb',
    tags: [
      'ångest inför nytt jobb',
      'nytt jobb ångest',
      'ny på jobbet ångest',
      'nervös inför nytt jobb',
      'ångest över nytt jobb',
      'stress nytt jobb',
      'första dagen nytt jobb',
      'byta jobb nervös',
    ],
    expected: 'career',
  },
]

describe('getCtaVariantForTags', () => {
  it.each(FIXTURES)('$slug blir $expected', ({ tags, expected }) => {
    expect(getCtaVariantForTags(tags)).toBe(expected)
  })

  it('utan taggar blir generic', () => {
    expect(getCtaVariantForTags([])).toBe('generic')
    expect(getCtaVariantForTags(undefined)).toBe('generic')
    expect(getCtaVariantForTags(null)).toBe('generic')
  })

  it('taggar som inte matchar någon regel blir generic', () => {
    expect(getCtaVariantForTags(['semesterersättning', 'friskvårdsbidrag'])).toBe('generic')
  })

  it('prioritetsordningen avgör när flera kluster matchar', () => {
    // "intervju" före "personligt brev" före "cv"
    expect(getCtaVariantForTags(['personligt brev', 'jobbintervju'])).toBe('interview')
    expect(getCtaVariantForTags(['cv mall', 'personligt brev'])).toBe('letter')
    // test slår allt
    expect(getCtaVariantForTags(['cv', 'intervju', 'logiskt test'])).toBe('test')
  })

  it('normaliserar bindestreck, versaler och extra mellanslag', () => {
    expect(normalizeTag('  STAR-Metoden  ')).toBe('star metoden')
    expect(getCtaVariantForTags(['STAR-Metoden'])).toBe('interview')
  })
})

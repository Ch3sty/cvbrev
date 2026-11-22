// @vitest-environment jsdom
/**
 * Förifyllningen av arket i kontot (beslut-agarpunkter D-13, 2026-11-22):
 * bärs i webbläsaren i 24 timmar, aldrig i adressen, och tål avstängd lagring.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'

import { FORIFYLLNING_NYCKEL, lasForifyllning, rensaForifyllning, renForifyllning, sparaForifyllning } from '../forifyllning'
import { soktaHref } from '../adress'

afterEach(() => {
  window.localStorage.clear()
  vi.restoreAllMocks()
})

describe('forifyllning', () => {
  it('sparar, läser och rensar', () => {
    sparaForifyllning({ job_title: 'Ekonomiassistent', company: 'Norrmejerier', fran: 'test-hem' })
    expect(lasForifyllning()).toMatchObject({ job_title: 'Ekonomiassistent', company: 'Norrmejerier', fran: 'test-hem' })
    rensaForifyllning()
    expect(window.localStorage.getItem(FORIFYLLNING_NYCKEL)).toBeNull()
    expect(lasForifyllning()).toBeNull()
  })

  it('gäller i 24 timmar', () => {
    sparaForifyllning({ job_title: 'Ekonomiassistent', company: 'Norrmejerier' })
    const sparad = JSON.parse(window.localStorage.getItem(FORIFYLLNING_NYCKEL)!).sparad as number
    expect(lasForifyllning(sparad + 23 * 3600 * 1000)).not.toBeNull()
    expect(lasForifyllning(sparad + 25 * 3600 * 1000)).toBeNull()
    expect(window.localStorage.getItem(FORIFYLLNING_NYCKEL)).toBeNull()
  })

  it('tål avstängd lagring', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blockerad')
    })
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blockerad')
    })
    expect(() => sparaForifyllning({ job_title: 'X' })).not.toThrow()
    expect(lasForifyllning()).toBeNull()
  })

  it('samma kontroller som sidan gjorde på adressen förut', () => {
    expect(renForifyllning({})).toBeNull()
    const f = renForifyllning({ job_title: ' Ekonom ', job_ad_url: 'javascript:alert(1)', last_application_date: '2026-1-1', match_score: 140, fran: 'x'.repeat(60) })
    expect(f).toMatchObject({ job_title: 'Ekonom', job_ad_url: null, last_application_date: null, match_score: null })
    expect(f?.fran).toHaveLength(40)
  })

  it('adressen till arket bär aldrig tjänst eller arbetsgivare', () => {
    sparaForifyllning({ job_title: 'Ekonomiassistent', company: 'Norrmejerier', fran: 'test-hem' })
    const href = soktaHref({ logga: 'sokt', fran: 'test-hem' })
    expect(href).toBe('/dashboard/sokta-tjanster?logga=1&fran=test-hem')
    expect(href).not.toMatch(/tjanst=|arbetsgivare=|Ekonomiassistent|Norrmejerier/)
  })
})

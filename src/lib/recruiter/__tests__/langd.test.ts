import { describe, expect, it } from 'vitest'
import { durationText, deriveSeniority } from '../candidateData'

// Före kandidatens ja visas anställningens längd i ord, aldrig datumen.
const NU = Date.parse('2026-11-22T12:00:00Z')

describe('anställningens längd', () => {
  it('räknar med månaden när den står i perioden', () => {
    expect(durationText({ period: '2015-01 till 2019-02' }, NU)).toBe('4 år')
    expect(durationText({ period: '2019-03 till nu' }, NU)).toBe('8 år')
    expect(durationText({ startDate: '2026-05', endDate: '' }, NU)).toBe('Under ett år')
  })

  it('klarar perioder med bara år', () => {
    expect(durationText({ period: '2019–2023' }, NU)).toBe('5 år')
  })

  it('ger null utan tolkbar period', () => {
    expect(durationText({ period: 'Sommarjobb' }, NU)).toBeNull()
  })

  it('senioriteten räknar med samma perioder', () => {
    const s = deriveSeniority(
      { roles: [{ title: 'Projektledare', period: '2019-03 till nu' }, { title: 'Arbetsledare', period: '2015-01 till 2019-02' }] },
      NU
    )
    expect(s.yearsOfExperience).toBe(12)
    expect(s.latestRole).toEqual({ title: 'Projektledare', years: 8 })
  })
})
